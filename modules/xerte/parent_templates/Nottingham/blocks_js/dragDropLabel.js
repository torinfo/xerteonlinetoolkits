// pageChanged & sizeChanged functions are needed in every model file
// other functions for model should also be in here to avoid conflicts
var dragDropLabel = new function () {
    var labelTxt1,
        labelTxt2,
        labelTxt3,
        targetTxt1,
        targetTxt2,
        submitBtnTxt,
        interactivity,
        tooltips = [];

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function (blockid) {
        var resize = jGetElement(blockid, ".labelHolder .label").length == jGetElement(blockid, ".labelHolder .label.ui-draggable-disabled").length && x_currentPageXML.getAttribute("labelPos") != "text" ? true : false;
        this.createLabels(blockid);
        if (resize) {
            this.sizeChanged(false, blockid);
        }
        submitBtnTxt = x_currentPageXML.getAttribute("submitText") != undefined && x_currentPageXML.getAttribute("submitText") != "" ? x_currentPageXML.getAttribute("submitText") : "Submit";

    };

    // function called every time the size of the LO is changed
    this.sizeChanged = function (firstLoad, blockid) {
        $x_pageHolder.scrollTop(0);
        var $panel = jGetElement(blockid, ".mainPanel");

        if (firstLoad == true) {
            firstLoad = false;
            this.createLabels(blockid);
        } else {
            // resize image to max that will fit space
            var $image = jGetElement(blockid, ".image"),
                prevW = $image.width(),
                labelHolderH = x_currentPageXML.getAttribute("labelPos") != "text" ? jGetElement(blockid, ".labelHolder").height() : 0,
                imgSize = x_currentPageXML.getAttribute("imgWidth") == undefined || x_currentPageXML.getAttribute("imgWidth") == "Medium" ? 0.5 : x_currentPageXML.getAttribute("imgWidth") == "Small" ? 0.3 : 0.8;

            x_scaleImg($image, $x_pageHolder.width() * imgSize, $x_pageHolder.height() - (parseInt($x_pageDiv.css("padding-top")) * 2) - (parseInt(jGetElement(blockid, ".mainPanel").css("padding-top")) * 2) - labelHolderH - 10);
            jGetElement(blockid, ".labelHolder").width($image.width());

            // adjust target sizes and positions
            var resetTargets = false;
            var scale = $image.width() / prevW;
            jGetElement(blockid, ".targetHolder .target").each(function () {
                var $this = $(this);
                if ($this.width() == 0 || $this.height() == 0) resetTargets = true;
                $this.css({
                    "left": parseFloat($this.css('left'), 10) * scale,
                    "top": parseFloat($this.css('top'), 10) * scale,
                    "width": $this.width() * scale,
                    "height": $this.height() * scale
                });
            });

            // Sometimes when we zoom all the way in and back out we get an division by zero that we can't recover from
            // In that case it's easier to rip up the targets and redraw
            if (resetTargets) {
                jGetElement(blockid, ".targetHolder").empty();
                this.drawTargets(blockid);
            }

            // also adjust labels
            jGetElement(blockid, ".labelHolder .ui-draggable").each(function (i) {
                var $this = $(this);
                var $target = $this.data("target");
                if (!isNaN($target)) {
                    $target = jGetElement(blockid, ".targetHolder .target").eq($target);
                    $this.css({
                        "left": $target.position().left + 2 + $panel.position().left,
                        "top": $target.position().top + 2 + $panel.position().top
                    });
                }
            });
        }
    };

    this.leavePage = function (blockid) {
        x_currentPageXML = XTGetPageXML(x_currentPage, XTGetBlockNr(blockid));
        if ($(x_currentPageXML).children().length > 0) {
            if (!this.checked) {
                this.showFeedBackandTrackResults(blockid);
            }
        }
    };

    this.init = function (pageXML, blockid) {
        x_currentPageXML = pageXML;
        // store strings used to give titles to labels and targets when keyboard is being used (for screen readers)
        labelTxt1 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "name", "Draggable Item");
        labelTxt2 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "selected", "Item Selected");
        labelTxt3 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "toSelect", "Press space to select");
        targetTxt1 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "description", "Drop zone for");
        targetTxt2 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "toSelect", "Press space to drop the selected item.");
        submitBtnTxt = x_currentPageXML.getAttribute("submitText") != undefined && x_currentPageXML.getAttribute("submitText") != "" ? x_currentPageXML.getAttribute("submitText") : "Submit";
        interactivity = x_currentPageXML.getAttribute("interactivity") != undefined && x_currentPageXML.getAttribute("interactivity") != "" ? x_currentPageXML.getAttribute("interactivity") : "Describe";


        jGetElement(blockid, ".mainText").html(x_addLineBreaks(x_currentPageXML.getAttribute("text")));

        if (x_currentPageXML.getAttribute("labelPos") == "text") {
            jGetElement(blockid, ".mainText")
                .after(jGetElement(blockid, ".labelHolder"))
                .after('<hr/>');
        }

        var tryTxt = x_currentPageXML.getAttribute("tryAgainTxt");
        if (tryTxt == undefined || tryTxt == "") {
            tryTxt = "Try again";
        }
        jGetElement(blockid, ".pageContents").data("tryTxt", tryTxt);

        // if (x_currentPageXML.getAttribute("align") == "Right") {
        //     jGetElement(blockid, ".dragDropHolderLabelling").addClass("x_floatLeft");
        // } else {
        //     jGetElement(blockid, ".dragDropHolderLabelling").addClass("x_floatRight");
        // }

        if (interactivity == "Match") {
            jGetElement(blockid, ".submitBtn")
                .button({
                    label: submitBtnTxt
                })
                .click(function () {
                    $x_pageHolder.scrollTop(0);
                    jGetElement(blockid, ".labelHolder .label").each(function () {
                        var $this = $(this)
                            .off("keypress focusin focusout")
                            .click(function () {
                                jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                            })
                            .focusin(function () {
                                $(this).addClass("focus");
                                jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                            })
                            .focusout(function () {
                                $(this).removeClass("focus");
                                jGetElement(blockid, ".infoHolder").html("");
                            })
                        if (XTGetMode() == "normal")
                            $this.draggable("disable");
                    });

                    jGetElement(blockid, ".pageContents hr:eq(1)").remove();
                    jGetElement(blockid, ".pageContents").data("selectedLabel", "");
                    dragDropLabel.showFeedBackandTrackResults(blockid);
                    if (XTGetMode() == "normal") {
                        jGetElement(blockid, ".submitBtn").hide();
                        jGetElement(blockid, ".targetHolder .target").droppable("disable");
                    }
                });
            this.startTracking();
        } else {
            jGetElement(blockid, ".submitBtn").hide();
        }
        this.sizeChanged(true, blockid);
        // Setup css for highlighting focus
        var borderwidth = "1px";
        if (x_currentPageXML.getAttribute("showHighlight") != "false") {
            borderwidth = "2px";
        }
        var highlightColour = "yellow";
        if (x_currentPageXML.getAttribute("highlightColour") != undefined && x_currentPageXML.getAttribute("highlightColour") != "") {
            highlightColour = x_getColour(x_currentPageXML.getAttribute("highlightColour"));
        }
        var style = "<style>div.highlight { background-image: none;}";
        style += " .targetHolder .target.highlight{border: " + borderwidth + " solid " + highlightColour + " !important;}";
        style += " .targetHolder .target.highlight:focus { outline: none;} </style>";
        jGetElement(blockid, ".pageContents").prepend(style);
    };

    this.startTracking = function () {
        var numHotspots = $(x_currentPageXML).children().length,
            weighting = (x_currentPageXML.getAttribute("trackingWeight") != undefined) ? x_currentPageXML.getAttribute("trackingWeight") : 1.0;
        XTSetPageType(x_currentPage, 'numeric', 1, weighting);
    };

    this.createLabels = function (blockid) {
        var $labelHolder = jGetElement(blockid, ".labelHolder"),
            tempData = [];

        $labelHolder.empty();
        jGetElement(blockid, ".infoHolder").html("");
        jGetElement(blockid, ".pageContents").data("selectedLabel", "");

        $(x_currentPageXML).children()
            .each(function (i) {
                tempData.push({name: this.getAttribute("name"), text: this.getAttribute("text"), correct: i});
                tooltips.push(this.getAttribute("alttext"));
            });

        // randomise order and create labels
        var correctOptions = [],
            correctAnswer = [],
            correctFeedback = "";
        $(x_currentPageXML).children()
            .each(function (i) {
                var labelNum = Math.floor(Math.random() * tempData.length);

                $('<div class="label panel" id="label' + i + '" tabindex="' + (i + 3) + '" title="' + labelTxt1 + '">' + tempData[labelNum].name + '</div>')
                    .appendTo($labelHolder)
                    .data("correct", tempData[labelNum].correct);

                if (interactivity == "Match") {
                    correctOptions.push({source: tempData[labelNum].name, target: tempData[labelNum].name});
                    correctAnswer.push(tempData[labelNum].name + " --> " + tempData[labelNum].name);
                    dragDropLabel.checked = false;
                }
                tempData.splice(labelNum, 1);
            });

        // set up drag events (mouse and keyboard controlled)
        if (interactivity == "Match") {
            XTEnterInteraction(x_currentPage, XTGetBlockNr(blockid), 'match', x_currentPageXML.getAttribute("name"), correctOptions, correctAnswer, correctFeedback, x_currentPageXML.getAttribute("grouping"), null);
            XTSetLeavePage(x_currentPage, XTGetBlockNr(blockid), this.leavePage);
            XTSetInteractionPageXML(x_currentPage, XTGetBlockNr(blockid), x_currentPageXML);
            jGetElement(blockid, ".labelHolder .label")
                .draggable({
                    containment: "#" + blockid + " #x_pageHolder",
                    stack: "#" + blockid + " .labelHolder .label", // item being dragged is always on top (z-index)
                    revertDuration: 0,
                    revert: function (event, ui) {
                        if (!event) {
                            var $this = $(this);
                            if ($this.data("target") != undefined && $this.data("target") !== "")
                                jGetElement(blockid, ".targetHolder .target").eq($this.data("target")).droppable("enable");

                            $this
                                .css({"position": "relative"})
                                .data("target", "")
                                .data("success", false)
                                .data("ui-draggable").originalPosition = {
                                top: 0,
                                left: 0
                            };
                        }
                        return !event;
                    },
                    start: function () {
                        var $this = $(this);
                        jGetElement(blockid, ".infoHolder").html('<h3>' + $this.html() + '</h3>');

                        // remove any focus/selection highlights made by tabbing to labels/targets
                        var $pageContents = jGetElement(blockid, ".pageContents");
                        if (jGetElement(blockid, ".labelHolder .label.focus").length > 0) {
                            jGetElement(blockid, ".labelHolder .label.focus").attr("title", labelTxt1);
                        }
                        if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                            $pageContents.data("selectedLabel").attr("title", labelTxt1);
                            $pageContents.data("selectedLabel", "");
                        }
                        var targetInFocus = jGetElement(blockid, ".targetHolder .target.highlight");
                        if (targetInFocus.length > 0) {
                            targetInFocus.attr("title", (tooltips[targetInFocus.index()] != undefined && tooltips[targetInFocus.index()] != "") ? tooltips[targetInFocus.index()] : targetTxt1 + " " + (targetInFocus.index() + 1));
                        }

                        jGetElement(blockid, ".labelHolder .selected").removeClass("selected");
                        jGetElement(blockid, ".labelHolder .focus").removeClass("focus");
                        jGetElement(blockid, ".labelHolder .highlight").addClass("transparent").removeClass("highlight");
                    },
                    stop: function () {
                        if ($(this).data("success") != true) {
                            jGetElement(blockid, ".infoHolder").html(jGetElement(blockid, ".pageContents").data("tryTxt"));
                        }
                    }
                })
                // set up events used when keyboard rather than mouse is used
                // these highlight selected labels / targets and set the title attr which the screen readers will use
                .focusin(function () {
                    var $this = $(this);
                    jGetElement(blockid, ".infoHolder").html('<h3>' + $this.html() + '</h3>');
                    if ($this.is(jGetElement(blockid, ".pageContents").data("selectedLabel")) == false) {
                        $this
                            .addClass("focus")
                            .attr("title", labelTxt1 + " - " + labelTxt3);
                    }
                })
                .focusout(function () {
                    var $this = $(this);
                    jGetElement(blockid, ".infoHolder").html("");
                    $this.removeClass("focus");
                    if ($this.is(jGetElement(blockid, ".pageContents").data("selectedLabel")) == false) {
                        $this.attr("title", labelTxt1);
                    }
                })
                .keypress(function (e) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
                        var $pageContents = jGetElement(blockid, ".pageContents");
                        if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                            $pageContents.data("selectedLabel")
                                .removeClass("selected")
                                .attr("title", labelTxt1);
                        }
                        var $this = $(this);
                        $this
                            .removeClass("focus")
                            .addClass("selected")
                            .attr("title", labelTxt1 + ' - ' + labelTxt2);
                        $pageContents.data("selectedLabel", $this);

                        jGetElement(blockid, ".infoHolder").html("");
                    }
                })
                .disableSelection();
        } else {
            jGetElement(blockid, ".labelHolder .label")
                .draggable({
                    containment: "#" + blockid + " #x_pageHolder",
                    stack: "#" + blockid + " .labelHolder .label", // item being dragged is always on top (z-index)
                    revert: "invalid", // snap back to original position if not dropped on target
                    start: function () {
                        // remove any focus/selection highlights made by tabbing to labels/targets
                        var $pageContents = jGetElement(blockid, ".pageContents");
                        if (jGetElement(blockid, ".labelHolder .label.focus").length > 0) {
                            jGetElement(blockid, ".labelHolder .label.focus").attr("title", labelTxt1);
                        }
                        if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                            $pageContents.data("selectedLabel").attr("title", labelTxt1);
                            $pageContents.data("selectedLabel", "");
                        }
                        var targetInFocus = jGetElement(blockid, ".targetHolder .target.highlight");
                        if (targetInFocus.length > 0) {
                            targetInFocus.attr("title", (tooltips[targetInFocus.index()] != undefined && tooltips[targetInFocus.index()] != "") ? tooltips[targetInFocus.index()] : targetTxt1 + " " + (targetInFocus.index() + 1));
                        }

                        jGetElement(blockid, ".labelHolder .selected").removeClass("selected");
                        jGetElement(blockid, ".labelHolder .focus").removeClass("focus");
                        jGetElement(blockid, ".labelHolder .highlight").addClass("transparent").removeClass("highlight");

                        jGetElement(blockid, ".infoHolder").html("");
                    },
                    stop: function () {
                        if ($(this).data("success") != true) {
                            jGetElement(blockid, ".infoHolder").html(jGetElement(blockid, ".pageContents").data("tryTxt"));
                        }
                    }
                })
                // set up events used when keyboard rather than mouse is used
                // these highlight selected labels / targets and set the title attr which the screen readers will use
                .focusin(function () {
                    var $this = $(this);
                    if ($this.is(jGetElement(blockid, ".pageContents").data("selectedLabel")) == false) {
                        $this
                            .addClass("focus")
                            .attr("title", labelTxt1 + " - " + labelTxt3);
                    }
                })
                .focusout(function () {
                    var $this = $(this);
                    $this.removeClass("focus");
                    if ($this.is(jGetElement(blockid, ".pageContents").data("selectedLabel")) == false) {
                        $this.attr("title", labelTxt1);
                    }
                })
                .keypress(function (e) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
                        var $pageContents = jGetElement(blockid, ".pageContents");
                        if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                            $pageContents.data("selectedLabel")
                                .removeClass("selected")
                                .attr("title", labelTxt1);
                        }
                        var $this = $(this);
                        $this
                            .removeClass("focus")
                            .addClass("selected")
                            .attr("title", labelTxt1 + ' - ' + labelTxt2);
                        $pageContents.data("selectedLabel", $this);

                        jGetElement(blockid, ".infoHolder").html("");
                    }
                })
                .disableSelection();
        }
        if (jGetElement(blockid, ".image").attr("src") == undefined) {
            // image can load now as we know what its max dimensions are
            jGetElement(blockid, ".image")
                .one("load", function () {
                    dragDropLabel.imgLoaded(blockid);
                })
                .attr({
                    "src": x_evalURL(x_currentPageXML.getAttribute("url")),
                    "alt": x_currentPageXML.getAttribute("tip")
                })
                .each(function () { // called if loaded from cache as in some browsers load won't automatically trigger
                    if (this.complete) {
                        $(this).trigger("load");
                    }
                });
        } else {
            // labels are being reset - make sure targets will still accept them being dropped
            if (interactivity == "Match") {
                jGetElement(blockid, ".targetHolder").html("");
                dragDropLabel.imgLoaded(blockid);
                jGetElement(blockid, ".submitBtn").show();
                //jGetElement(blockid, ".targetHolder .target")
                //        .each(function () {
                //            var $this = $(this);
                //            $this.droppable("enable");
                //            //$this.droppable({
                //            //    tolerance: "pointer",
                //            //    accept: "*"
                //            //});
                //        })
                //        .off("click");
            } else {
                jGetElement(blockid, ".targetHolder .target")
                    .each(function () {
                        var $this = $(this);
                        $this.droppable({
                            tolerance: "pointer",
                            accept: jGetElement(blockid, ".labelHolder .label").filter(function () {
                                return $(this).data("correct") == $this.index();
                            })
                        });
                    })
                    .off("click");
            }
        }
    };

    this.imgLoaded = function (blockid) {
        if(XTGetPageXML(x_currentPage, XTGetBlockNr(blockid)) != undefined){
            x_currentPageXML = XTGetPageXML(x_currentPage, XTGetBlockNr(blockid));
        }
        // labels have been created and image loaded - can now resize image to fit space and create targets on it
        var $image = jGetElement(blockid, ".image"),
            labelHolderH = x_currentPageXML.getAttribute("labelPos") != "text" ? jGetElement(blockid, ".labelHolder").height() : 0,
            imgSize = x_currentPageXML.getAttribute("imgWidth") == undefined || x_currentPageXML.getAttribute("imgWidth") == "Medium" ? 0.5 : x_currentPageXML.getAttribute("imgWidth") == "Small" ? 0.3 : 0.8;

        x_scaleImg($image, $x_pageHolder.width() * imgSize, $x_pageHolder.height() - (parseInt($x_pageDiv.css("padding-top")) * 2) - (parseInt(jGetElement(blockid, ".mainPanel").css("padding-top")) * 2) - labelHolderH - 10, true, true);
        jGetElement(blockid, ".labelHolder").width($image.width());

        this.drawTargets(blockid);

        x_pageLoaded();
    };

    this.drawTargets = function (blockid) {
        $targetHolder = jGetElement(blockid, ".targetHolder");
        var $image = jGetElement(blockid, ".image");
        var scale = $image.width() / $image.prop("naturalWidth");

        // create targets
        $(x_currentPageXML).children()
            .each(function (i) {
                var xywh = [Number(this.getAttribute("x")), Number(this.getAttribute("y")), Number(this.getAttribute("w")), Number(this.getAttribute("h"))];

                // adjust xywh so hotspots don't overlap image edges
                if (xywh[0] < 0) {
                    xywh.splice(2, 1, xywh[2] + xywh[0]);
                    xywh.splice(0, 1, 0);
                }
                if (xywh[1] < 0) {
                    xywh.splice(3, 1, xywh[3] + xywh[1]);
                    xywh.splice(1, 1, 0);
                }
                if (xywh[0] + xywh[2] > $image.prop("naturalWidth")) {
                    xywh.splice(2, 1, $image.prop("naturalWidth") - xywh[0]);
                }
                if (xywh[1] + xywh[3] > $image.prop("naturalHeight")) {
                    xywh.splice(3, 1, $image.prop("naturalHeight") - xywh[1]);
                }

                // now adjust for resized image
                xywh = [xywh[0] * scale, xywh[1] * scale, xywh[2] * scale, xywh[3] * scale];

                // create target and position it
                $('<div class="target transparent"></div>')
                    .appendTo($targetHolder)
                    .attr("title", (tooltips[i] != undefined && tooltips[i] != "") ? tooltips[i] : targetTxt1 + " " + (i + 1))
                    .data("text", this.getAttribute("text"))
                    .css({
                        "left": xywh[0],
                        "top": xywh[1],
                        "width": xywh[2],
                        "height": xywh[3]
                    })
                    .droppable({
                        tolerance: "pointer",
                        // only correct label can be dropped on target
                        accept: jGetElement(blockid, ".labelHolder .label").filter(
                            function () {
                                return (interactivity == "Match") || ($(this).data("correct") == i);
                            }
                        )
                    });
            });

        var $targets = jGetElement(blockid, ".targetHolder .target");

        // add border to targets
        if (x_currentPageXML.getAttribute("showHighlight") != "false") {
            var highlightColour = "yellow";
            if (x_currentPageXML.getAttribute("highlightColour") != undefined && x_currentPageXML.getAttribute("highlightColour") != "") {
                highlightColour = x_getColour(x_currentPageXML.getAttribute("highlightColour"));
            }
            $targets
                .addClass("border")
                .css("border-color", highlightColour);
        }

        $targets
            .droppable({
                tolerance: "pointer",
                drop: function (event, ui) {
                    dragDropLabel.dropLabel($(this), ui.draggable, blockid); // target, label
                    ui.draggable.data("success", true);
                }
            })
            .focusin(function () {
                $(this)
                    .addClass("highlight")
                    .removeClass("border")
                    .removeClass("transparent");
                var $pageContents = jGetElement(blockid, ".pageContents");
                if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                    $(this).attr("title", (tooltips[$(this).index()] != undefined && tooltips[$(this).index()] != "") ? tooltips[$(this).index()] : targetTxt1 + " " + ($(this).index() + 1) + " - " + targetTxt2);
                }
            })
            .focusout(function () {
                var $pageContents = jGetElement(blockid, ".pageContents");
                $(this)
                    .addClass("transparent")
                    .removeClass("highlight")
                    .attr("title", (tooltips[$(this).index()] != undefined && tooltips[$(this).index()] != "") ? tooltips[$(this).index()] : targetTxt1 + " " + ($(this).index() + 1));
                if (x_currentPageXML.getAttribute("showHighlight") != "false") {
                    $(this).addClass("border");
                }
            })
            .keypress(function (e) {
                var charCode = e.charCode || e.keyCode;
                if (charCode == 32) {
                    var $pageContents = jGetElement(blockid, ".pageContents");
                    var $selectedLabel = $pageContents.data("selectedLabel");
                    if ($selectedLabel != undefined && $selectedLabel != "") {
                        if (interactivity == "Match") {
                            dragDropLabel.dropLabel($(this), $selectedLabel, blockid); // target, label
                        } else {
                            // only accept drops for correct answers
                            if ($selectedLabel.data("correct") == $(this).index()) {
                                dragDropLabel.dropLabel($(this), $selectedLabel, blockid); // target, label
                            } else {
                                $(this).attr("title", (tooltips[$(this).index()] != undefined && tooltips[$(this).index()] != "") ? tooltips[$(this).index()] : targetTxt1 + " " + ($(this).index() + 1));
                                $selectedLabel
                                    .removeClass("selected")
                                    .attr("title", labelTxt1);

                                jGetElement(blockid, ".infoHolder").html($pageContents.data("tryTxt"));
                                $pageContents.data("selectedLabel", "");
                            }
                        }
                    }
                }
            });

        // set tab index for targets - leaving space between them for a label to be put on it
        var tabIndex = 2;
        tabIndex += jGetElement(blockid, ".labelHolder .label").length;
        $targets.each(function () {
            tabIndex++;
            var $this = $(this);
            $this.attr("tabindex", tabIndex);
            tabIndex++;
        });
    };

    // function called when label dropped on target - by mouse or keyboard
    this.dropLabel = function ($thisTarget, $thisLabel, blockid) {
        $x_pageHolder.scrollTop(0);
        var $infoHolder = jGetElement(blockid, ".infoHolder");
        if (interactivity == "Match") {
            $infoHolder.html('<h3>' + $thisLabel.html() + '</h3>');

            if ($thisLabel.data("target") != undefined && $thisLabel.data("target") !== "")
                jGetElement(blockid, ".targetHolder .target").eq($thisLabel.data("target")).droppable("enable");
        } else {
            $infoHolder.html('<h3>' + $thisLabel.html() + '</h3><p>' + x_addLineBreaks($thisTarget.data("text")) + '</p>');
        }


        if (interactivity == "Match") {
            var targetIndex = $thisTarget.index();
            $thisLabel
                .attr({
                    "title": labelTxt1,
                    "tabindex": $thisTarget.attr("tabindex") + 1,
                    "style": "cursor: pointer !important;" // need to use !important as jQuery ui styles make cursor default !important - doing another !important is the only way to override it
                })
                .data("infoTxt", $infoHolder.html())
                .removeClass("selected")
                .css({
                    "opacity": 1,
                    "position": "absolute",
                    "top": $thisTarget.position().top + 2 + jGetElement(blockid, ".mainPanel").position().top,
                    "left": $thisTarget.position().left + 2 + jGetElement(blockid, ".mainPanel").position().left
                })
                .click(function () {
                    jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                })
                .focusin(function () {
                    $(this).addClass("focus");
                    jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                })
                .focusout(function () {
                    $(this).removeClass("focus");
                    jGetElement(blockid, ".infoHolder").html("");
                })
                .data("target", targetIndex);
            $thisTarget
                .attr("title", (tooltips[$thisTarget.index()] != undefined && tooltips[$thisTarget.index()] != "") ? tooltips[$thisTarget.index()] : targetTxt1 + " " + ($thisTarget.index() + 1))
                .data("infoTxt", $infoHolder.html())
                .css("cursor", "pointer")
                .click(function () {
                    jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                })
                .droppable("disable");
            jGetElement(blockid, ".pageContents").data("selectedLabel", "");

        } else {
            $thisLabel
                .attr({
                    "title": labelTxt1,
                    "tabindex": $thisTarget.attr("tabindex") + 1,
                    "style": "cursor: pointer !important;" // need to use !important as jQuery ui styles make cursor default !important - doing another !important is the only way to override it
                })
                .data("infoTxt", $infoHolder.html())
                .removeClass("selected")
                .draggable("disable")
                .css({
                    "opacity": 1,
                    "position": "absolute",
                    "top": $thisTarget.position().top + 2 + jGetElement(blockid, ".mainPanel").position().top,
                    "left": $thisTarget.position().left + 2 + jGetElement(blockid, ".mainPanel").position().left
                })
                .off("keypress focusin focusout")
                .click(function () {
                    jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                })
                .focusin(function () {
                    $(this).addClass("focus");
                    jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                })
                .focusout(function () {
                    $(this).removeClass("focus");
                    jGetElement(blockid, ".infoHolder").html("");
                })
                .data("target", $thisTarget);
            $thisTarget
                .attr("title", (tooltips[$thisTarget.index()] != undefined && tooltips[$thisTarget.index()] != "") ? tooltips[$thisTarget.index()] : targetTxt1 + " " + ($thisTarget.index() + 1))
                .data("infoTxt", $infoHolder.html())
                .css("cursor", "pointer")
                .click(function () {
                    jGetElement(blockid, ".infoHolder").html($(this).data("infoTxt"));
                });
            if (jGetElement(blockid, ".labelHolder .label").length == jGetElement(blockid, ".labelHolder .label.ui-draggable-disabled").length) {
                jGetElement(blockid, ".pageContents hr:eq(1)").remove();
            }

            jGetElement(blockid, ".pageContents").data("selectedLabel", "");
        }

        x_pageContentsUpdated();

    };

    this.showFeedBackandTrackResults = function (blockid) {
        x_currentPageXML = XTGetPageXML(x_currentPage, XTGetBlockNr(blockid));
        var correct = false,
            numCorrect = 0,
            l_options = [],
            l_answer = [],
            l_feedback = [];

        if (x_currentPageXML.getAttribute("judge") != "false" && interactivity == "Match") {
            var labelHolderSpec = XTGetMode() != "normal" ? ".labelHolder .label" : ".labelHolder .ui-draggable-disabled";
            $(labelHolderSpec).each(function (i) {
                var $this = $(this)
                    .click(function () {
                        jGetElement(blockid, ".targetHolder .target")
                            .css({
                                "background": "transparent"
                            });
                        jGetElement(blockid, ".targetHolder .target").eq($this.data("correct"))
                            .css({
                                "background": "rgba(154,205,50,0.5)" //Yellowgreen with transparency when not run in SCORM
                            })
                    })
                    .focusin(function () {
                        jGetElement(blockid, ".targetHolder .target").eq($this.data("correct"))
                            .css({
                                "background": "rgba(154,205,50,0.5)"
                            })
                    })
                    .focusout(function () {
                        jGetElement(blockid, ".targetHolder .target")
                            .css({
                                "background": "transparent"
                            });
                    });

                if ($this.data("target") === undefined || $this.data("target") === "") {
                    l_options.push({source: $this.html(), target: " "});
                    l_answer.push($this.html() + " -->  ");
                } else {
                    l_options.push({
                        source: $this.html(),
                        target: $(x_currentPageXML).children()[$this.data("target")].getAttribute("name")
                    });
                    l_answer.push($this.html() + " --> " + $(x_currentPageXML).children()[$this.data("target")].getAttribute("name"));
                }
                if ($this.data("correct") === $this.data("target")) {
                    //make sure only one tick is added
                    numCorrect++;
                    if ($this.hasClass("correct") == false) {
                        $this.addClass("correct");
                        //add tick
                        $this.append('<span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Tick") + '</span><span class="result fa fa-fw fa-x-tick"></span>');
                        //l_feedback = "The label for " + $this.html() + " was placed in the correct hotspot.";
                        correct = true;
                    }
                } else {
                    if (XTGetMode() != "normal") {
                        $this
                            .attr({"tabindex": i + 3})
                            .removeAttr('style')
                            .css({
                                "position": "relative",
                                "z-index": 0,
                                "top": "auto"
                            });

                        if ($this.data("target") !== undefined && $this.data("target") !== "") {
                            jGetElement(blockid, ".targetHolder .target").eq($this.data("target")).droppable('enable');
                        }
                    } else {
                        $this.addClass("incorrect");
                        // add cross
                        $this.append('<span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Cross") + '</span><span class="result fa fa-fw fa-x-cross"></span>')
                        //l_feedback = "The label for " + $this.html() + " was placed in the wrong hotspot.";
                        correct = false;
                    }
                }

            });
            // Track answer
            var result =
                {
                    success: numCorrect == $(x_currentPageXML).children().length,
                    score: $(x_currentPageXML).children().length === 0 ? 100.0 : numCorrect * 100.0 / $(x_currentPageXML).children().length
                };
            XTExitInteraction(x_currentPage, XTGetBlockNr(blockid), result, l_options, l_answer, l_feedback, 0, x_currentPageXML.getAttribute("trackinglabel"));

            if (XTGetMode() != "normal") {
                if (numCorrect == $(x_currentPageXML).children().length) {
                    jGetElement(blockid, ".labelHolder .label").each(function () {
                        var $this = $(this)
                            .draggable("disable")
                    });
                    jGetElement(blockid, ".submitBtn").hide();
                }
            }
            dragDropLabel.checked = true;
        }

        x_pageContentsUpdated();
    };
};
