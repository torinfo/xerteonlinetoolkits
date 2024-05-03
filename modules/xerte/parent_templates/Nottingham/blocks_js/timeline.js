var timelineBlock = new function () {
    var timelineModel = {
        labelTxt1: null,
        labelTxt2: null,
        labelTxt3: null,
        targetTxt1: null,
        targetTxt2: null,
        tracked: false
    };

    var $feedback;

    this.resetModelState = function(){
        timelineModel = {
            labelTxt1: null,
            labelTxt2: null,
            labelTxt3: null,
            targetTxt1: null,
            targetTxt2: null,
            tracked: false
        };
    }

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function (blockid) {
        timelineModel = XTGetInteractionModelState(x_currentPage, x_getBlockNr(blockid));
        jGetElement(blockid, ".labelHolder .label").remove();
        $feedback = jGetElement(blockid, ".feedback").hide();
        jGetElement(blockid, ".targetHolder .target")
            .data("currentLabel", "")
            .css("height", "auto");
        this.createLabels(blockid);
        this.sizeChanged(blockid);
    }

    // function called every time the size of the LO is changed
    this.sizeChanged = function (blockid) {
        // label width should fit in target and target height should fit largest label
        var $target = jGetElement(blockid, ".targetHolder .target");
        $target.css("height", "auto");

        var $labels = jGetElement(blockid, ".labelHolder .label"),
            tallestLabel = 0;

        $labels.each(function () {
            var $this = $(this);
            $this.width(Math.floor($target.width() - parseInt($target.css("padding-left")) * 2) + 5); // + 5 is so drop shadow width is ignored
            if ($this.outerHeight() > tallestLabel) {
                tallestLabel = $this.outerHeight();
            }
        });

        jGetElement(blockid, ".labelHolder").height(tallestLabel);

        var tallestTarget = 0;

        $target.each(function () {
            var $this = $(this);
            if ($this.outerHeight() > tallestTarget) {
                tallestTarget = $this.outerHeight();
            }
        });

        $target.height(tallestTarget + tallestLabel - 5);

        $labels.each(function () {
            var $this = $(this);
            if ($this.data("currentTarget") != "") {
                // adjust label absolute position on target
                var $thisTarget = $this.data("currentTarget");
                $this.css({
                    "top": $thisTarget.find("h3").position().top + $thisTarget.find("h3").height() + parseInt($thisTarget.css("padding-top")),
                    "left": $thisTarget.position().left + parseInt($thisTarget.css("margin-left")) + parseInt($thisTarget.css("padding-left"))
                });
            }
        });
    };

    this.leavePage = function (blockid) {
        let pageXML = x_getBlockXML(x_getBlockNr(blockid));
        if ($(pageXML).children().length > 0 && timelineModel.tracked != true) {
            ;
            timelineBlock.finishTracking(blockid);
        }
    };

    this.init = function (blockid) {
        let pageXML = x_getBlockXML(blockid);
        this.resetModelState();
        // store strings used to give titles to labels and targets when keyboard is being used (for screen readers)
        timelineModel.labelTxt1 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "name", "Draggable Item");
        timelineModel.labelTxt2 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "selected", "Item Selected");
        timelineModel.labelTxt3 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "toSelect", "Press space to select");
        timelineModel.targetTxt1 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "description", "Drop zone for");
        timelineModel.targetTxt2 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "toSelect", "Press space to drop the selected item.");

        jGetElement(blockid, ".textHolder")
            .html(x_addLineBreaks(pageXML.getAttribute("text")))
            .addClass("transparent"); /* without the text having a bg the labels strangely aren't selectable in IE */

        $feedback = jGetElement(blockid, ".feedback").hide();

        // checkBtnWidth attribute not used as button will be sized automatically
        var buttonLabel = pageXML.getAttribute("checkBtnTxt");
        if (buttonLabel == undefined) {
            buttonLabel = "Check Answers";
        }

        var $button = jGetElement(blockid, ".button")
            .button({
                label: buttonLabel
            })
            .click(function () { // mark labels and show feedback
                jGetElement(blockid, ".dragDropHolder .tick").remove();
                var correct = 0;

                var empty = false;
                jGetElement(blockid, ".labelHolder .label").each(function () {
                    if ($(this).data("currentTarget") == "")
                        empty = true;
                });
                if (!empty) {
                    jGetElement(blockid, ".labelHolder .label").each(function () {
                        var $this = $(this);
                        if ($this.data("target").is($this.data("currentTarget"))) {
                            correct++;
                        }
                    });
                }
                if (empty) {
                    $feedback.html(pageXML.getAttribute("incomplete") != undefined ? '<p>' + pageXML.getAttribute("incomplete") + '</p>' : x_addLineBreaks(pageXML.getAttribute("feedback")));
                } else if (correct == jGetElement(blockid, ".labelHolder .label").length) {
                    $feedback.html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                    timelineBlock.finishTracking(blockid);
                } else {
                    if (correct == 0) {
                        if (XTGetMode() == "normal")
                            $feedback.html(pageXML.getAttribute("allWrongTracking") != undefined ? pageXML.getAttribute("allWrongTracking") : x_addLineBreaks(pageXML.getAttribute("feedback")));
                        else
                            $feedback.html(pageXML.getAttribute("allWrong") != undefined ? pageXML.getAttribute("allWrong") : x_addLineBreaks(pageXML.getAttribute("feedback")));
                    } else {
                        if (XTGetMode() == "normal")
                            $feedback.html(pageXML.getAttribute("scoreTracking") != undefined ? pageXML.getAttribute("scoreTracking").replace("{i}", correct).replace("{n}", jGetElement(blockid, ".labelHolder .label").length) : x_addLineBreaks(pageXML.getAttribute("feedback")));
                        else
                            $feedback.html(pageXML.getAttribute("score") != undefined ? pageXML.getAttribute("score").replace("{i}", correct).replace("{n}", jGetElement(blockid, ".labelHolder .label").length) : x_addLineBreaks(pageXML.getAttribute("feedback")));
                    }
                    timelineBlock.finishTracking(blockid);
                }
                if (!empty) {
                    jGetElement(blockid, ".labelHolder .label").each(function () {
                        var $this = $(this);
                        if ($this.data("target").is($this.data("currentTarget"))) {
                            $this.html($this.html() + '<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Tick") + '</span><span class="fa fa-fw fa-x-tick"></span></span>');
                        } else {
                            $this.html($this.html() + '<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Cross") + '</span><span class="fa fa-fw fa-x-cross"></span></span>');
                        }
                    });
                    if (XTGetMode() == "normal") {
                        jGetElement(blockid, ".dragDropHolder .label").draggable("disable");
                        jGetElement(blockid, ".button").hide();
                    }

                }
                jGetElement(blockid, ".feedback").show();

                x_pageContentsUpdated();
            });


        // create targets
        var $targetHolder = jGetElement(blockid, ".targetHolder"),
            $firstTarget = $targetHolder.find(".target"),
            labels = [];

        $(pageXML).children()
            .each(function (i) {
                var $thisTarget;
                if (i != 0) {
                    $thisTarget = $firstTarget.clone().appendTo($targetHolder);
                } else {
                    $thisTarget = $firstTarget;
                }
                $thisTarget
                    .attr("title", timelineModel.targetTxt1 + " " + this.getAttribute("text"))
                    .find("h3").html(this.getAttribute("name"));
                labels.push({text: this.getAttribute("text"), correct: $thisTarget});
                $thisTarget.data("id", i);
            });

        var $pageContents = jGetElement(blockid, ".pageContents");
        $pageContents.data({
            "labels": labels,
            "selectedLabel": ""
        });

        // style targets
        var numColumns = 4, // max targets on row
            spacerWidth = ((numColumns - 1) * 2) + (numColumns * 2), // 2% gap between targets & 1% left & 1% right padding inside targets
            columnWidth = Math.floor((100 - spacerWidth) / numColumns),
            edgeWidth = Math.floor((100 - spacerWidth - (columnWidth * numColumns)) / 2);

        jGetElement(blockid, ".targetHolder .target, .labelHolder")
            .css({
                width: columnWidth + "%",
                "margin-left": "2%"
            });
        jGetElement(blockid, ".targetHolder .target").each(function (i) {
            if (i % numColumns == 0) {
                $(this).addClass("first");
            }
        });
        jGetElement(blockid, ".targetHolder .target.first").css("margin-left", edgeWidth + "%");

        jGetElement(blockid, ".targetHolder .target")
            .droppable({
                accept: ".dragDropHolder .label",
                drop: function (event, ui) {
                    timelineBlock.dropLabel($(this), ui.draggable, blockid); // target, label
                }
            })
            .focusin(function (e) {
                if ($(e.target).hasClass("target")) {
                    $(this).addClass("focus");
                    var $pageContents = jGetElement(blockid, ".pageContents");
                    if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $(this).attr("title", timelineModel.targetTxt1 + " " + $(this).find("h3").html() + " - " + timelineModel.targetTxt2);
                    }
                }
            })
            .focusout(function () {
                var $pageContents = jGetElement(blockid, ".pageContents");
                $(this)
                    .removeClass("focus")
                    .attr("title", timelineModel.targetTxt1 + " " + $(this).find("h3").html());
            })
            .keypress(function (e) {
                if ($(e.target).hasClass("target")) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
                        var $selectedLabel = jGetElement(blockid, ".pageContents").data("selectedLabel");
                        if ($selectedLabel != undefined && $selectedLabel != "") {
                            timelineBlock.dropLabel($(this), $selectedLabel, blockid); // target, label
                        }
                    }
                }
            })
            .data("currentLabel", "");

        // set tab index for targets - leaving space between them for a label to be put on it
        var tabIndex = 1;
        tabIndex += $pageContents.data("labels").length;
        $targetHolder.find(".target").each(function (i) {
            tabIndex++;
            var $this = $(this);
            $this.attr({
                "tabindex": tabIndex,
                "title": timelineModel.targetTxt1 + " " + $this.find("h3").html()
            });
            tabIndex++;
        });
        $button.attr("tabindex", tabIndex + 1);
        $feedback.attr("tabindex", tabIndex + 2);

        this.createLabels(blockid);

        if (pageXML.getAttribute("interactivity") == "Timeline") {
            $targetHolder.find(".target").css("background-image", "url('" + x_templateLocation + "common_html5/arrow.png')");
        }

        this.initTracking(blockid);

        this.sizeChanged(blockid);
        x_pageLoaded();
    }

    this.finishTracking = function(blockid)
    {
        timelineModel = XTGetInteractionModelState(x_currentPage, x_getBlockNr(blockid));

        var l_options = [],
            l_answers = [],
            l_feedbacks = [],
            l_correct = 0,
            l_total = 0;

        timelineModel.tracked = true;
        XTSetInteractionModelState(x_currentPage, x_getBlockNr(blockid), timelineModel);

        jGetElement(blockid, ".labelHolder .label").each(function (i) {

            var $this = $(this);

            var tData = $this.data("currentTarget");
            var l_placeholder;
            if (tData != "") {
                l_placeholder = tData.text().trim();
            } else {
                l_placeholder = "";
            }


            var l_draglabel = $this.text().trim();
            var option = {};
            option = {source: l_draglabel, target: l_placeholder};
            l_options.push(option);
            l_answers.push(l_draglabel + "-->" + l_placeholder);
            l_feedbacks.push(jGetElement(blockid, ".feedback").text());
            if ($this.data("target").is($this.data("currentTarget"))) {
                l_correct++;
            }
            l_total++;
        });
        var result =
            {
                success: l_correct == l_total,
                score: (l_correct * 100.0) / l_total
            };

        XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, l_options, l_answers, l_feedbacks);
    }

    this.initTracking = function (blockid) {

        let pageXML = x_getBlockXML(blockid);
        this.weighting = 1.0;
        if (pageXML.getAttribute("trackingWeight") != undefined) {
            this.weighting = pageXML.getAttribute("trackingWeight");
        }

        XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);
        var correctOptions = [],
            correctAnswers = [],
            correctFeedbacks = [];
        $(pageXML).children().each(
            function (i) {
                var placeholder = $("<div/>").html(this.getAttribute("name")).text().trim();
                var draglabel = $("<div/>").html(this.getAttribute("text")).text().trim();
                var correctOption = {};
                correctOption = {source: draglabel, target: placeholder};
                correctOptions.push(correctOption);
                correctAnswers.push(draglabel + "-->" + placeholder);
                correctFeedbacks.push("Correct");
            }
        );
        var label = $('<div>').html(pageTitle).text();
        if (pageXML.getAttribute("trackinglabel") != null && pageXML.getAttribute("trackinglabel") != "") {
            label = pageXML.getAttribute("trackinglabel");
        }
        XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'match', label, correctOptions, correctAnswers, correctFeedbacks, pageXML.getAttribute("grouping"), null);
        XTSetLeavePage(x_currentPage, x_getBlockNr(blockid), this.leavePage);
        XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'match', this.weighting, 1);
        XTSetInteractionPageXML(x_currentPage, x_getBlockNr(blockid), pageXML);
        XTSetInteractionModelState(x_currentPage, x_getBlockNr(blockid), timelineModel);
    }


    this.createLabels = function (blockid) {
        // randomise order and create labels
        var $pageContents = jGetElement(blockid, ".pageContents"),
            labels = [],
            tempLabels = $pageContents.data("labels").slice(0),
            i;

        for (i = 0; i < $pageContents.data("labels").length; i++) {
            var labelNum = Math.floor(Math.random() * tempLabels.length);
            labels.push(tempLabels[labelNum]);
            tempLabels.splice(labelNum, 1);
        }
        for (i = 0; i < labels.length; i++) {
            jGetElement(blockid, ".labelHolder").append('<div class="label panel" id="label' + i + '" tabindex="' + (i + 2) + '" title="' + timelineModel.labelTxt1 + '">' + x_addLineBreaks(labels[i].text) + '</div>');
            var $thisLabel = jGetElement(blockid, "#label" + i);
            $thisLabel.data("target", labels[i].correct);

            if (i != 0) {
                $thisLabel.hide();
            }
        }

        jGetElement(blockid, ".dragDropHolder .label")
            .draggable({
                containment: "." + blockid + " .dragDropHolder",
                stack: "." + blockid + " .dragDropHolder .label", // item being dragged is always on top (z-index)
                revert: "invalid", // snap back to original position if not dropped on target
                start: function (event, ui) {

										
										if(ui.helper.data("originalPosition") == undefined){
												let pagePosition = $("#pageContents")[0].getBoundingClientRect();
												let helperRect = ui.helper[0].getBoundingClientRect();
												let scrollParent = ui.helper.scrollParent().scrollParent()[0];
												console.log(pagePosition, helperRect);
												ui.helper.data("originalPosition",{y: scrollParent.scrollTop + helperRect.top - pagePosition.y, x: scrollParent.scrollLeft + helperRect.left - pagePosition.x});
										}

                    // remove any focus/selection highlights made by tabbing to labels/targets
                    var $pageContents = jGetElement(blockid, ".pageContents");
                    if (jGetElement(blockid, ".labelHolder .label.focus").length > 0) {
                        jGetElement(blockid, ".labelHolder .label.focus").attr("title", timelineModel.labelTxt1);
                    } else if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $pageContents.data("selectedLabel").attr("title", timelineModel.labelTxt1);
                        $pageContents.data("selectedLabel", "");
                    }
                    var targetInFocus = jGetElement(blockid, ".targetHolder .target.focus");
                    if (targetInFocus.length > 0) {
                        targetInFocus.attr("title", timelineModel.targetTxt1 + " " + targetInFocus.find("h3").html());
                    }
                    jGetElement(blockid, ".dragDropHolder .selected").removeClass("selected");
                    jGetElement(blockid, ".dragDropHolder .focus").removeClass("focus");

                    $feedback.hide();
                    jGetElement(blockid, ".dragDropHolder .tick").remove();
                }
            })
            // set up events used when keyboard rather than mouse is used
            // these highlight selected labels / targets and set the title attr which the screen readers will use
            .focusin(function () {
                var $this = $(this);
                if ($this.is($pageContents.data("selectedLabel")) == false) {
                    $this
                        .addClass("focus")
                        .attr("title", timelineModel.labelTxt1 + " - " + timelineModel.labelTxt3);
                }
            })
            .focusout(function () {
                var $this = $(this);
                $this.removeClass("focus");
                if ($this.is($pageContents.data("selectedLabel")) == false) {
                    $this.attr("title", timelineModel.labelTxt1);
                }
            })
            .keypress(function (e) {
                var charCode = e.charCode || e.keyCode;
                if (charCode == 32) {
                    var $pageContents = jGetElement(blockid, ".pageContents");
                    if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $pageContents.data("selectedLabel")
                            .removeClass("selected")
                            .attr("title", timelineModel.labelTxt1);
                    }
                    var $this = $(this);
                    $this
                        .removeClass("focus")
                        .addClass("selected")
                        .attr("title", timelineModel.labelTxt1 + ' - ' + timelineModel.labelTxt2);
                    $pageContents.data("selectedLabel", $this);

                    $feedback.hide();
                    jGetElement(blockid, ".dragDropHolder .tick").remove();
                }
            })
            //.css("position", "absolute")
            .data("currentTarget", "")
            .disableSelection();
    }

    // function called when label dropped on target - by mouse or keyboard
    this.dropLabel = function ($thisTarget, $thisLabel, blockid) {
        timelineModel = XTGetInteractionModelState(x_currentPage, x_getBlockNr(blockid));
        var prevLabel = $thisTarget.data("currentLabel"),
            prevTarget = $thisLabel.data("currentTarget");

        // label hasn't been dropped on target it was already on
        if ((prevLabel == "" || prevLabel.is($thisLabel) == false) && (prevTarget == "" || prevTarget.is($thisTarget) == false)) {
            $thisTarget.data("currentLabel", $thisLabel);
            $thisLabel
                .data("currentTarget", $thisTarget)
                .attr("tabindex", $thisTarget.attr("tabindex") + 1);

            // if there's already a label on the target, move it off
            if (prevLabel != "") {
                prevLabel
                    .css({
                        "top": "auto",
                        "left": "auto"
                    })
                    .data("currentTarget", "")
                    .attr("tabindex", Number(prevLabel.attr("id").replace("label", "")) + 2);

                jGetElement(blockid, ".dragDropHolder .label").each(function () {
                    if ($(this).data("currentTarget") == "" && $(this).is(prevLabel) == false) {
                        $(this).hide();
                    }
                });
            }

            // show next label if wasn't on a target before
            if (prevTarget == "") {
                jGetElement(blockid, ".dragDropHolder .label").each(function () {
                    if ($(this).data("currentTarget") == "") {
                        $(this).show();
                        return false;
                    }
                });
            } else {
                prevTarget.data("currentLabel", "");
            }

            jGetElement(blockid, ".pageContents").data("selectedLabel", "");
        }

        $thisTarget.attr("title", timelineModel.targetTxt1 + " " + $thisTarget.find("h3").html());
				
				let $lblHolder = jGetElement(blockid, ".labelHolder");
				//let offset = $thisLabel.data("originalPosition");
				let offset = $thisLabel.data("originalPosition");
				let scrollParent = $thisTarget.scrollParent().scrollParent()[0];
				;

				console.log(offset.y, scrollParent.scrollTop, $thisTarget.find("h3").position().top, $thisTarget.find("h3").height(), parseInt($thisTarget.css("padding-top")));
        $thisLabel
            .attr("title", timelineModel.labelTxt1)
            .removeClass("selected")
            .css({
                "top": scrollParent.scrollTop + $thisTarget.find("h3").position().top + $thisTarget.find("h3").height() + parseInt($thisTarget.css("padding-top")) - offset.y,
                "left": scrollParent.scrollLeft + $thisTarget.position().left + parseInt($thisTarget.css("margin-left")) + parseInt($thisTarget.css("padding-left")) - offset.x
            });
    }
}

