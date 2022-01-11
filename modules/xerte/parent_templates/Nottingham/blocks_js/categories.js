var categories = new function() {
    var labelTxt1,
        labelTxt2,
        labelTxt3,
        targetTxt1,
        targetTxt2,
        checked,
        total_options;

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function(blockid) {
        jGetElement(blockid,".dragDropHolder .label").remove();
        jGetElement(blockid,".feedback").hide();
        this.createLabels(blockid);
    }

    // function called every time the size of the LO is changed
    this.sizeChanged = function(blockid) {
        var tallestLabel = 0;
        jGetElement(blockid,".dragDropHolder .label").each(function() {
            var $this = $(this);
            if ($this.outerHeight() > tallestLabel) {
                tallestLabel = $this.outerHeight();
            }
        });

        jGetElement(blockid,".initHolder").height(tallestLabel);

        var $categoryHolder = jGetElement(blockid,".categoryHolder"),
            $category = $categoryHolder.find(".category");
        $category.css("min-height", $x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($categoryHolder.position().top) - parseInt($category.css("padding-top")) * 2 - jGetElement(blockid,".button").height() - 25);
    }

    this.leavePage = function(blockid)
    {
        if (!this.checked)
        {
            this.showFeedBackandTrackScore(blockid);
        }
    }

    this.showFeedBackandTrackScore = function(blockid)
    {
        var l_options = [],
            l_answers = [],
            l_feedback = [],
            l_total=0,
            l_correct=0;

        jGetElement(blockid,".dragDropHolder .tick").remove();

        jGetElement(blockid,".categoryHolder .category .label").each(function() {
            var $this = $(this);
            var l_answer, l_option = {};
            l_option.source = $this.data("name");
            //l_option.target = $this.data("category").data("name");
            l_option.target = $this.parent().data("name");
            l_answer = $this.data("name") + "-->" + $this.parent().data("name");
            l_answers.push(l_answer);

            l_total++;
            if ($this.data("category").is($this.parent())) {
                $this.html($this.html() + '<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Correct") + '</span><span class="fa fa-fw fa-x-tick"></span></span>');
                l_feedback.push("correct");
                l_option.result = true;
                l_correct++;
            }
            else {
                $this.html($this.html() + '<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Incorrect") + '</span><span class="fa fa-fw fa-x-cross"></span></span>');
                l_feedback.push("incorrect");
                l_option.result = false;
            }
            l_options.push(l_option);
        });

        jGetElement(blockid,"#scoreTxt").html(l_correct);
        jGetElement(blockid,"#totalTxt").html(this.totaloptions);
        jGetElement(blockid,".feedback").show();
        var result = {
            success: (l_correct == this.totaloptions),
            score: (l_correct * 100.0)/this.totaloptions
        }
        XTExitInteraction(x_currentPage, 0, result, l_options, l_answers, l_feedback);
        XTSetPageScore(x_currentPage, (l_correct * 100.0)/this.totaloptions);
        this.checked = true;
    }

    this.init = function(pageXML, blockid) {
        x_currentPageXML = pageXML;
        this.checked = false;
        this.totaloptions = 0;
        var correctOptions = [],
            correctAnswer = [],
            correctFeedback = [];

        this.checked = false;
        // Track the quiz page
        this.weighting = 1.0;
        if (x_currentPageXML.getAttribute("trackingWeight") != undefined)
        {
            this.weighting = x_currentPageXML.getAttribute("trackingWeight");
        }
        XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);



        // store strings used to give titles to labels and categories when keyboard is being used (for screen readers)
        labelTxt1 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "name", "Draggable Item");
        labelTxt2 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "selected", "Item Selected");
        labelTxt3 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "toSelect", "Press space to select");
        targetTxt1 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "description", "Drop zone for");
        targetTxt2 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "toSelect", "Press space to drop the selected item.");

        jGetElement(blockid,".textHolder")
            .html(x_addLineBreaks(x_currentPageXML.getAttribute("text")))
            .addClass("transparent"); /* without the text having a bg the labels strangely aren't selectable in IE */

        var $feedback = jGetElement(blockid,".feedback");
        if (x_currentPageXML.getAttribute("feedback") != undefined && x_currentPageXML.getAttribute("feedback") != "") {
            $feedback.html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
        }
        if (x_currentPageXML.getAttribute("feedbackScore") != undefined && x_currentPageXML.getAttribute("feedbackScore") != "") {
            $feedback.append('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("feedbackScore").replace("{i}", '<span id="scoreTxt"></span>').replace("{n}", '<span id="totalTxt"></span>')) + '</p>');
        } else if ($feedback.html().length == 0) {
            $feedback.remove();
        }
        $feedback.hide();

        // buttonWidth attribute not used as button will be sized automatically
        var buttonLabel = x_currentPageXML.getAttribute("buttonLabel");
        if (buttonLabel == undefined) {
            buttonLabel = "Check Answers";
        }

        var $button = jGetElement(blockid,".button")
            .button({
                label:	buttonLabel
            })
            .click(function() { // mark labels and show feedback
                categories.showFeedBackandTrackScore(blockid);
                categories.checked = true;
            });

        // create categories
        var $categoryHolder = jGetElement(blockid,".categoryHolder"),
            $firstCategory = $categoryHolder.find(".category"),
            labels = [];
        $(x_currentPageXML).children()
            .each(function(i) {
                var $thisCategory,
                    catName,
                    itemName;

                if (i != 0) {
                    $thisCategory = $firstCategory.clone().appendTo($categoryHolder);
                } else {
                    $thisCategory = $firstCategory;
                }
                catName = this.getAttribute("name");
                $thisCategory.find("h3").html(catName);
                $thisCategory.data("name", catName);
                $(this).children().each(function(j) {
                    var correctOption={};
                    itemName = this.getAttribute("name");
                    labels.push({name:itemName, correct:$thisCategory});
                    correctOption.source = itemName;
                    correctOption.target = catName;
                    correctOptions.push(correctOption);
                    correctAnswer.push(itemName + "-->" + catName);
                    correctFeedback.push("Correct");
                    categories.totaloptions++;
                });
            });

        var label = $('<div>').html(x_currentPageXML.getAttribute("name")).text();
        if (x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
        {
            label = x_currentPageXML.getAttribute("trackinglabel");
        }
        XTEnterInteraction(x_currentPage, 0, 'match', label, correctOptions, correctAnswer, correctFeedback, x_currentPageXML.getAttribute("grouping"));
        var $pageContents = jGetElement(blockid,".pageContents");
        $pageContents.data("labels", labels);

        // style categories
        var numColumns = $(x_currentPageXML).children().length,
            spacerWidth = ((numColumns - 1) * 2) + (numColumns * 2), // 2% gap between categories & 1% left & 1% right padding inside categories
            columnWidth = Math.floor((100 - spacerWidth) / numColumns),
            edgeWidth = Math.floor((100 - spacerWidth - (columnWidth * numColumns)) / 2);

        jGetElement(blockid,".categoryHolder .category, .initHolder")
            .css({
                width			:columnWidth + "%",
                "margin-left"	:"2%"
            });
        jGetElement(blockid,".categoryHolder .category:first").css("margin-left", edgeWidth + "%");

        // set up events used when keyboard rather than mouse is used
        // these highlight selected labels / targets and set the title attr which the screen readers will use
        jGetElement(blockid,".categoryHolder .category")
            .focusin(function(e) {
                if ($(e.target).hasClass("category")) {
                    $(this).addClass("highlightDark");
                    var $pageContents = jGetElement(blockid,".pageContents");
                    var categoryTitle = $("<div>").html($(this).find("h3").html()).text();
                    if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $(this).attr("title", targetTxt1 + " " + categoryTitle + " - " + targetTxt2);
                    }
                }
            })
            .focusout(function() {
                var $pageContents = jGetElement(blockid,".pageContents");
                var categoryTitle = $("<div>").html($(this).find("h3").html()).text();

                $(this)
                    .removeClass("highlightDark")
                    .attr("title", targetTxt1 + " " + categoryTitle);
            })
            .keypress(function(e) {
                if ($(e.target).hasClass("category")) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
                        var $pageContents = jGetElement(blockid,".pageContents");
                        var $selectedLabel = $pageContents.data("selectedLabel");
                        // drop selected label on target, remove selection and show next label
                        if ($selectedLabel != undefined && $selectedLabel != "") {
                            if ($selectedLabel.parent().is(jGetElement(blockid,".initHolder"))) {
                                jGetElement(blockid,".initHolder .label:eq(1)").show();
                            }
                            $selectedLabel
                                .removeClass("selected")
                                .attr("title", labelTxt1)
                                .appendTo($(this));
                            $pageContents.data("selectedLabel", "");
                            var categoryTitle = $("<div>").html($(this).find("h3").html()).text();

                            $(this).attr("title", targetTxt1 + " " + categoryTitle);

                            // change tab index of label so it's now after the target it's on
                            var categoryIndex = $(this).attr("tabindex");
                            $(this).children(".label").each(function(i) {
                                $(this).attr("tabindex", categoryIndex + i + 1);
                            });
                        }
                    }
                }
            });

        // set tab index for targets - leaving space between them for any labels that are put on them
        var tabIndex = 0;
        for (i=0; i<$categoryHolder.find(".category").length; i++) {
            tabIndex = (i + 1) * ($pageContents.data("labels").length + 1) + 1;
            var $category = $categoryHolder.find(".category:eq(" + i + ")");
            var categoryTitle = $("<div>").html($category.find("h3").html()).text();

            $category.attr({
                "tabindex"	:tabIndex,
                "title"		:targetTxt1 + " " + categoryTitle
            });
        }
        tabIndex += $pageContents.data("labels").length;
        $button.attr("tabindex", tabIndex + 1);
        $feedback.attr("tabindex", tabIndex + 2);

        this.createLabels(blockid);

        this.sizeChanged(blockid);
        x_pageLoaded();
    };

    this.createLabels = function(blockid) {
        // randomise order and create labels
        var $pageContents = jGetElement(blockid,".pageContents"),
            labels = [],
            tempLabels = $pageContents.data("labels").slice(0),
            i;

        for (i=0; i<$pageContents.data("labels").length; i++) {
            var labelNum = Math.floor(Math.random() * tempLabels.length);
            labels.push(tempLabels[labelNum]);
            tempLabels.splice(labelNum, 1);
        }
        for (i=0; i<labels.length; i++) {
            jGetElement(blockid,".initHolder").append('<li class="label panel" id="label' + i + '" tabindex="' + (i+2) + '" title="' + labelTxt1 + '"><p>' + labels[i].name + '</p></li>');
            var $thisLabel = jGetElement(blockid,"#label" + i);
            $thisLabel.data("category", labels[i].correct);
            $thisLabel.data("name", labels[i].name);

            if (i != 0) {
                $thisLabel.hide();
            }
        }

        jGetElement(blockid,".initHolder, .categoryHolder .category").sortable({
            connectWith:	".categoryHolder .category",
            items:			".label",
            containment:	"#"+blockid +" .dragDropHolder",
            stop:	function(event, ui) {
                if (ui.item.parent().is(jGetElement(blockid,".initHolder")) == false) {
                    // show next label if it came from initHolder
                    if ($(this).is(jGetElement(blockid,".initHolder"))) {
                        jGetElement(blockid,".initHolder .label:first").show();
                    }

                    // change tab index of label so it's now after the target it's on
                    var categoryIndex = ui.item.parent().attr("tabindex");
                    ui.item.parent().children(".label").each(function(i) {
                        $(this).attr("tabindex", categoryIndex + i + 1);
                    });
                }
            },
            start:	function() {
                // remove any focus/selection highlights made by tabbing to labels/targets
                var $pageContents = jGetElement(blockid,".pageContents");
                if (jGetElement(blockid,".dragDropHolder .label.focus").length > 0) {
                    jGetElement(blockid,".dragDropHolder .label.focus").attr("title", labelTxt1);
                } else if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                    $pageContents.data("selectedLabel").attr("title", labelTxt1);
                    $pageContents.data("selectedLabel", "");
                }
                var targetInFocus = jGetElement(blockid,".dragDropHolder .category.highlightDark");
                if (targetInFocus.length > 0) {
                    var categoryTitle = $("<div>").html(targetInFocus.find("h3").html()).text();
                    targetInFocus.attr("title", targetTxt1 + " " + categoryTitle);
                }
                jGetElement(blockid,".dragDropHolder .selected").removeClass("selected");
                jGetElement(blockid,".dragDropHolder .focus").removeClass("focus");
                jGetElement(blockid,".dragDropHolder .highlightDark").removeClass("highlightDark");

                jGetElement(blockid,".feedback").hide();
                jGetElement(blockid,".dragDropHolder .tick").remove();
            }
        }).disableSelection();

        // set up events used when keyboard rather than mouse is used
        // these highlight selected labels / targets and set the title attr which the screen readers will use
        jGetElement(blockid,".dragDropHolder .label")
            .focusin(function() {
                var $this = $(this);
                if ($this.is($pageContents.data("selectedLabel")) == false) {
                    $this
                        .addClass("focus")
                        .attr("title", labelTxt1 + " - " + labelTxt3);
                }
            })
            .focusout(function() {
                var $this = $(this);
                $this.removeClass("focus");
                if ($this.is($pageContents.data("selectedLabel")) == false) {
                    $this.attr("title", labelTxt1);
                }
            })
            .keypress(function(e) {
                var charCode = e.charCode || e.keyCode;
                if (charCode == 32) {
                    var $pageContents = jGetElement(blockid,".pageContents");
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

                    jGetElement(blockid,".feedback").hide();
                    jGetElement(blockid,".dragDropHolder .tick").remove();
                }
            });
    }
}