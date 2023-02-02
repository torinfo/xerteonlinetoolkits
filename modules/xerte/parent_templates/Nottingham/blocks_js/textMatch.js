var textMatch = new function() {
    var modelState = {
        labelTxt1: null,
        labelTxt2: null,
        labelTxt3: null,
        targetTxt1: null,
        targetTxt2: null,
        numAttempts: null
    }

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function(blockid) {
        var blocknr = XTGetBlockNr(blockid);
        modelState = XTGetInteractionModelState(x_currentPage, blocknr);
        modelState.numAttempts = 0;
        jGetElement(blockid, ".labelHolder .label, .targetHolder .hint").remove();
        jGetElement(blockid, ".labelHolder .audioHolder, .feedback").hide();
        jGetElement(blockid, ".button").show();

        jGetElement(blockid, ".targetHolder .target")
            .data("currentLabel", "")
            .css("height", "auto");

        this.createLabels(blockid);
        this.sizeChanged(blockid);
        XTSetInteractionModelState(x_currentPage, blocknr, modelState)
    }

    // function called every time the size of the LO is changed
    this.sizeChanged = function(blockid) {
        // label width should be same width as part 1 of sentence and target height should fit largest label
        var $target = jGetElement(blockid, " .targetHolder .target");
        $target.css("height", "auto");


        var $labels = jGetElement(blockid, ".labelHolder .label"),
            tallestLabel = 0;

        $labels.each(function() {
            var $this = $(this);
            $this.width(($target.find("h3").width() + 5)/2); // + 5 is so drop shadow width is ignored
            if ($this.find(".audioHolder").length > 0) {
                $this.find(".labelTxt").width($this.width() - jGetElement(blockid, ".pageContents").data("audioW"));
            } else {
                $this.find(".labelTxt").width($this.width());
            }

            if ($this.outerHeight() > tallestLabel) {
                tallestLabel = $this.outerHeight();
            }
        });

        jGetElement(blockid, ".labelHolder")
            .width($labels.width())
            .height(tallestLabel);

        var newH = tallestLabel + parseInt($target.css("padding-top")) - 5,
            tallestTarget = 0;

        $target.each(function() {
            var $this = $(this);
            if ($this.outerHeight() > tallestTarget) {
                tallestTarget = $this.outerHeight();
            }
        });

        if (tallestTarget > newH) {
            newH = tallestTarget;
        }

        $target.height(newH);

        $labels.each(function() {
            var $this = $(this);
            if ($this.data("currentTarget") != "") {
                // adjust label absolute position on target
                var $thisTarget = $this.data("currentTarget");
                $this.css({
                    "top"	:$thisTarget.find("h3").position().top,
                    "left"	:$thisTarget.position().left + $thisTarget.width() - parseInt($thisTarget.css("padding-left")) - $this.width() + 5
                });
            }
        });
    }

    this.leavePage = function(blockid) {
        var blocknr = XTGetBlockNr(blockid);
        x_currentPageXML = XTGetPageXML(x_currentPage, blocknr);
        if ($(x_currentPageXML).children().length > 0 && this.tracked != true) {
            this.finishTracking(blockid);
        }
    }

    this.init = function(pageXML,blockid) {
        x_currentPageXML = pageXML;
        jGetElement(blockid, ".pageContents").data("audioW", 0);

        //Reset modelState
        modelState = {};
        modelState.numAttempts = 0;

        // store strings used to give titles to labels and targets when keyboard is being used (for screen readers)
        modelState.labelTxt1 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "name", "Draggable Item");
        modelState.labelTxt2 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "selected", "Item Selected");
        modelState.labelTxt3 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "toSelect", "Press space to select");
        modelState.targetTxt1 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "description", "Drop zone for");
        modelState.targetTxt2 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "toSelect", "Press space to drop the selected item.");

        jGetElement(blockid, ".textHolder")
            .html(x_addLineBreaks(x_currentPageXML.getAttribute("text")))
            .addClass("transparent"); /* without the text having a bg the labels strangely aren't selectable in IE */

        var feedbackTxt = x_currentPageXML.getAttribute("correctMessage");
        if (feedbackTxt == undefined) {
            feedbackTxt = "Correct answers are shown.";
        }
        var $feedback = jGetElement(blockid, ".feedback")
            .html(x_addLineBreaks(feedbackTxt))
            .hide();

        // submitBtnWidth attribute not used as button will be sized automatically
        var buttonLabel = x_currentPageXML.getAttribute("submitBtnTxt");
        if (buttonLabel == undefined) {
            buttonLabel = "Submit";
        }

        var $button = jGetElement(blockid, ".button")
            .button({
                label:	buttonLabel
            })
            .click(function() { // mark labels and show feedback
                var maxAttempts = x_currentPageXML.getAttribute("maxAttempts") ? x_currentPageXML.getAttribute("maxAttempts") : 3,
                    allCorrect = true;


                jGetElement(blockid, ".dragDropHolder .tick, .targetHolder .hint").remove();
                jGetElement(blockid, ".labelHolder .audioHolder").hide();

                // are any labels not on a target?
                var labelOffTarget = false;
                jGetElement(blockid, ".labelHolder .label").each(function() {
                    if ($(this).data("currentTarget") == "") {
                        labelOffTarget = true;
                    }
                });
                if(!labelOffTarget)
                {
                    modelState.numAttempts++;
                }
                if(XTGetMode() != "normal" && x_currentPageXML.getAttribute('markEnd') === 'false' ){
                    jGetElement(blockid, ".labelHolder .label").each(function() {
                        var $this = $(this);
                        if ($this.data("target").is($this.data("currentTarget"))) {
                            // correct - show tick
                            $this.find(".labelTxt").append('<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Tick") + '</span><span class="fa fa-fw fa-x-tick"></span></span>');
                            $this.find(".audioHolder").show();

                        } else{
                            // incorrect - remove label and show hint
                            if ($this.data("currentTarget") != "") {
                                var $prevTarget = $this.data("currentTarget");

                                if (labelOffTarget == true) {
                                    $this.hide();
                                } else {
                                    labelOffTarget = true;
                                }

                                $this
                                    .css({
                                        "top"	:"auto",
                                        "left"	:"auto"
                                    })
                                    .data("currentTarget", "")
                                    .attr("tabindex", Number($this.attr("id").replace("label","")) + 2)
                                    .find(".audioHolder").hide();

                                $prevTarget.data("currentLabel", "");

                                if (modelState.numAttempts >= maxAttempts) {
                                    if ($prevTarget.data("hint") != "" && $prevTarget.data("hint") != undefined) {
                                        $prevTarget.prepend('<div class="hint">' + x_addLineBreaks($prevTarget.data("hint")) + '</div>');
                                    } else {
                                        $prevTarget.prepend('<div class="hint">' + x_addLineBreaks($prevTarget.data("correct")) + '</div>');
                                    }
                                }
                            }
                            allCorrect = false;
                        }
                    });

                }
                else{
                    if (!labelOffTarget){
                        textMatch.finishTracking(blockid);
                        jGetElement(blockid, ".labelHolder .label").each(function() {
                            var $this = $(this);
                            if ($this.data("target").is($this.data("currentTarget"))) {
                                // correct - show tick
                                $this.find(".labelTxt").append('<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Tick") + '</span><span class="fa fa-fw fa-x-tick"></span></span>');
                                $this.find(".audioHolder").show();
                            } else{
                                $this.find(".labelTxt").append('<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Cross") + '</span><span class="fa fa-fw fa-x-cross"></span></span>');
                            }
                        });
                    }
                    else{
                        $feedback.html(x_currentPageXML.getAttribute("incomplete") != undefined ? x_currentPageXML.getAttribute("incomplete") : x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    }
                    jGetElement(blockid, ".feedback").show();
                }

                var correct = 0;

                jGetElement(blockid, ".labelHolder .label").each(function() {
                    var $this = $(this);
                    if ($this.data("target").is($this.data("currentTarget"))) {
                        correct++;
                    }
                });

                allCorrect = correct == jGetElement(blockid, ".labelHolder .label").length;

                if(!labelOffTarget || (XTGetMode() != "normal" && x_currentPageXML.getAttribute('markEnd') === 'false')){

                    var wrongFeedback, scoreFeedback;

                    if(XTGetMode() != "normal" && x_currentPageXML.getAttribute('markEnd') === 'false'){
                        wrongFeedback = x_currentPageXML.getAttribute("allWrong");
                        scoreFeedback = x_currentPageXML.getAttribute("score");
                    }
                    else{
                        wrongFeedback = x_currentPageXML.getAttribute("allWrongTracking");
                        scoreFeedback =	x_currentPageXML.getAttribute("scoreTracking");
                        $(this).hide();
                    }


                    if (allCorrect == false && modelState.numAttempts >= maxAttempts) {
                        $feedback.html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    } else if (allCorrect == true) {
                        $feedback.html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                        $(this).hide();
                    } else if (correct == 0){
                        $feedback.html(wrongFeedback != undefined ? wrongFeedback : x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    } else {
                        $feedback.html(scoreFeedback != undefined ? scoreFeedback.replace("{i}", correct).replace("{n}", jGetElement(blockid, ".labelHolder .label").length) : x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    }
                    jGetElement(blockid, ".feedback").show();
                }

                x_pageContentsUpdated();

            });


        // create targets
        debugger
        var $targetHolder = jGetElement(blockid, ".textMatchBlock .targetHolder"),
            $firstTarget = $targetHolder.find(".target"),
            labels = [];

        $(x_currentPageXML).children()
            .each(function(i) {

                var $thisTarget;
                if (i != 0) {
                    $thisTarget = $firstTarget.clone().appendTo($targetHolder);
                } else {
                    $thisTarget = $firstTarget;
                }
                $thisTarget
                    .attr("title", modelState.targetTxt1 + " '" + this.getAttribute("name") + " " + (i + 1) + "'")
                    .data({
                        "hint"	:this.getAttribute("hint"),
                        "name"	:this.getAttribute("name"),
                        "correct":this.getAttribute("p2"),
                        "id"	:i
                    })
                    .find("h3").html(x_addLineBreaks(this.getAttribute("p1")));

                labels.push({text:this.getAttribute("p2"), correct:$thisTarget, audio:this.getAttribute("audioFeedback"), transcript:this.getAttribute("audioTranscript")});
            });

        var $pageContents = jGetElement(blockid, ".pageContents");
        $pageContents.data({
            "labels"		:labels,
            "selectedLabel"	:""
        });

        jGetElement(blockid, ".targetHolder .target")
            .droppable({
                accept:	".dragDropHolder .label",
                drop:	function(event, ui) {
                    textMatch.dropLabel($(this), ui.draggable, blockid); // target, label
                }
            })
            .focusin(function(e) {
                if ($(e.target).hasClass("target")) {
                    $(this).addClass("highlightDark");
                    var $pageContents = jGetElement(blockid, ".pageContents");
                    if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $(this).attr("title", modelState.targetTxt1 + " '" + $(this).data("name") + " " + ($(this).index() + 1) + "' - " + modelState.targetTxt2);
                    }
                }
            })
            .focusout(function() {
                var $pageContents = jGetElement(blockid, ".pageContents");
                $(this)
                    .removeClass("highlightDark")
                    .attr("title", modelState.targetTxt1 + " '" + $(this).data("name") + " " + ($(this).index() + 1) + "'");
            })
            .keypress(function(e) {
                if ($(e.target).hasClass("target")) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
                        var $selectedLabel = jGetElement(blockid, ".pageContents").data("selectedLabel");
                        if ($selectedLabel != undefined && $selectedLabel != "") {
                            textMatch.dropLabel($(this), $selectedLabel); // target, label
                        }
                    }
                }
            })
            .data("currentLabel", "");

        // set tab index for targets - leaving space between them for a label to be put on it
        var tabIndex = 1;
        tabIndex += $pageContents.data("labels").length;
        $targetHolder.find(".target").each(function(i) {
            tabIndex++;
            var $this = $(this);
            $this.attr({
                "tabindex"	:tabIndex,
                "title"		:modelState.targetTxt1 + " '" + $this.data("name") + " " + ($this.index() + 1) + "'"
            });
            tabIndex++;
        });
        $button.attr("tabindex", tabIndex + 1);
        $feedback.attr("tabindex", tabIndex + 2);

        this.createLabels(blockid);
        this.sizeChanged(blockid);
        this.initTracking(blockid);
        x_pageLoaded();

    }


    this.finishTracking = function(blockid)
    {
        var l_options = [],
            l_answers = [],
            l_feedbacks = [],
            l_correct = 0,
            l_total = 0;
        this.tracked = true;

        jGetElement(blockid, ".labelHolder .label").each(function(i) {
            var $this = $(this);
            l_total++;
            var l_option={};
            var l_placeholder;

            if($this.data("currentTarget") != "" && $this.data("currentTarget").text() != undefined)
            {
                l_placeholder = $this.data("currentTarget").text().trim();

            }else{
                l_placeholder = "";
            }
            var l_draglabel	= $this.find("div").text().trim();
            l_option.source = l_draglabel;
            l_option.target = l_placeholder;
            l_options.push(l_option);
            l_answers.push(l_draglabel + "-->" + l_placeholder);
            l_feedbacks.push(jGetElement(blockid, ".feedback").text());
            if ($this.data("target").is($this.data("currentTarget"))) {
                l_correct++;
            }
        });
        var result = {
            success: l_correct == l_total,
            score: (l_correct * 100.0)/l_total
        };
        var blocknr = parseFloat(blockid.split("block").pop()) - 1;
        XTExitInteraction(x_currentPage, blocknr, result, l_options, l_answers, l_feedbacks);

        if(XTGetMode() == "normal" && x_currentPageXML.getAttribute('markEnd') !== 'false'){
            jGetElement(blockid, ".dragDropHolder .label")
                .draggable("disable");
        }
        //XTSetPageScore(x_currentPage, (l_correct * 100.0)/l_total, x_currentPageXML.getAttribute("trackinglabel"));
    }


    this.initTracking = function(blockid){

        this.weighting = 1.0;
        if (x_currentPageXML.getAttribute("trackingWeight") != undefined)
        {
            this.weighting = x_currentPageXML.getAttribute("trackingWeight");
        }

        XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);
        var correctOptions 		= [];
        var correctAnswers 		= [];
        var correctFeedbacks 	= [];

        $(x_currentPageXML).children().each(
            function(i)
            {

                var correctOption={};
                var placeholder = $("<div/>").html(this.getAttribute("p1")).text().trim();
                var draglabel	= $( "<div/>").html(this.getAttribute("p2")).text().trim();
                correctOption.source = draglabel;
                correctOption.target = placeholder;
                correctAnswers.push(draglabel + "-->" + placeholder);
                correctFeedbacks.push("Correct");
                correctOptions.push(correctOption);
            }
        );
        var label=x_currentPageXML.getAttribute("name");
        if (x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
        {
            label = x_currentPageXML.getAttribute("trackinglabel");
        }
        var blocknr = parseFloat(blockid.split("block").pop()) - 1;

        XTEnterInteraction(x_currentPage, blocknr, 'match', label, correctOptions, correctAnswers, correctFeedbacks, x_currentPageXML.getAttribute("grouping"), null);
        XTSetLeavePage(x_currentPage, blocknr, this.leavePage);
        XTSetInteractionModelState(x_currentPage, blocknr, modelState);
    }


    this.createLabels = function(blockid) {
        // randomise order and create labels


        var $pageContents = jGetElement(blockid, ".pageContents"),
            labels = [],
            tempLabels = $pageContents.data("labels").slice(0),
            i;

        for (i=0; i<$pageContents.data("labels").length; i++) {
            var labelNum = Math.floor(Math.random() * tempLabels.length);
            labels.push(tempLabels[labelNum]);
            tempLabels.splice(labelNum, 1);
        }
        for (i=0; i<labels.length; i++) {
            jGetElement(blockid, ".labelHolder").append('<div class="label panel" id="label' + i + '" tabindex="' + (i+2) + '" title="' + modelState.labelTxt1 + '"><div class="labelTxt">' + x_addLineBreaks(labels[i].text) + '</div></div>');

            var $thisLabel = jGetElement(blockid, "#label" + i);
            $thisLabel.data("target", labels[i].correct);

            if (labels[i].audio != "" && labels[i].audio != undefined) {
                if (jGetElement(blockid, ".pageContents").data("audioW") == 0) {
                    jGetElement(blockid, ".pageContents").data("audioW", 25);
                }

                $('<div class="audioHolder"/>')
                    .prependTo($thisLabel.find('.labelTxt'))
                    .hide()
                    .mediaPlayer({
                        type		:"audio",
                        source		:labels[i].audio,
                        width		:25
                    })

                // manually add a transcript button to the end of the audio bar
                if (labels[i].transcript != undefined && labels[i].transcript != '') {
                    x_addAudioTranscript($thisLabel.find('.labelTxt').find('.audioHolder'), labels[i].transcript);
                }

                $thisLabel.addClass('audioFB');
            }

            if (i != 0) {
                $thisLabel.hide();
            }
        }

        jGetElement(blockid, ".dragDropHolder .label")
            .draggable({
                containment:	"#"+blockid +" .dragDropHolder",
                stack:			"#"+blockid +" .dragDropHolder .label", // item being dragged is always on top (z-index)
                revert:			"invalid", // snap back to original position if not dropped on target
                start:			function() {
                    // remove any focus/selection highlights made by tabbing to labels/targets
                    var $pageContents = jGetElement(blockid, ".pageContents");
                    if (jGetElement(blockid, ".labelHolder .label.focus").length > 0) {
                        jGetElement(blockid, ".labelHolder .label.focus").attr("title", modelState.labelTxt1);
                    } else if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $pageContents.data("selectedLabel").attr("title", modelState.labelTxt1);
                        $pageContents.data("selectedLabel", "");
                    }
                    var targetInFocus = jGetElement(blockid, ".targetHolder .target.highlightDark");
                    if (targetInFocus.length > 0) {
                        targetInFocus.attr("title", modelState.targetTxt1 + " '" + targetInFocus.data("name") + " " + (targetInFocus.index() + 1) + "'");
                    }
                    jGetElement(blockid, ".dragDropHolder .selected").removeClass("selected");
                    jGetElement(blockid, ".dragDropHolder .focus").removeClass("focus");
                    jGetElement(blockid, ".dragDropHolder .highlightDark").removeClass("highlightDark");

                    jGetElement(blockid, ".feedback").hide();
                    jGetElement(blockid, ".dragDropHolder .tick, .targetHolder .hint").remove();
                    jGetElement(blockid, ".labelHolder .audioHolder").hide();

                    jGetElement(blockid, ".button").show();
                }
            })
            // set up events used when keyboard rather than mouse is used
            // these highlight selected labels / targets and set the title attr which the screen readers will use
            .focusin(function() {
                var $this = $(this);
                if ($this.is($pageContents.data("selectedLabel")) == false) {
                    $this
                        .addClass("focus")
                        .attr("title", modelState.labelTxt1 + " - " + modelState.labelTxt3);
                }
            })
            .focusout(function() {
                var $this = $(this);
                $this.removeClass("focus");
                if ($this.is($pageContents.data("selectedLabel")) == false) {
                    $this.attr("title", modelState.labelTxt1);
                }
            })
            .keypress(function(e) {
                var charCode = e.charCode || e.keyCode;
                if (charCode == 32) {
                    var $pageContents = jGetElement(blockid, ".pageContents");
                    if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $pageContents.data("selectedLabel")
                            .removeClass("selected")
                            .attr("title", modelState.labelTxt1);
                    }
                    var $this = $(this);
                    $this
                        .removeClass("focus")
                        .addClass("selected")
                        .attr("title", modelState.labelTxt1 + ' - ' + modelState.labelTxt2);
                    $pageContents.data("selectedLabel", $this);

                    jGetElement(blockid, ".dragDropHolder .tick, .targetHolder .hint").remove();
                    jGetElement(blockid, ".labelHolder .audioHolder, .feedback").hide();
                    jGetElement(blockid, ".button").show();
                }
            })
            .css("position", "absolute")
            .data("currentTarget", "")
            .disableSelection();
    }

    // function called when label dropped on target - by mouse or keyboard
    this.dropLabel = function($thisTarget, $thisLabel, blockid) {
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
                        "top"	:"auto",
                        "left"	:"auto"
                    })
                    .data("currentTarget", "")
                    .attr("tabindex", Number(prevLabel.attr("id").replace("label","")) + 2);

                jGetElement(blockid, ".dragDropHolder .label").each(function() {
                    if ($(this).data("currentTarget") == "" && $(this).is(prevLabel) == false) {
                        $(this).hide();
                    }
                });
            }

            // show next label if wasn't on a target before
            if (prevTarget == "") {
                jGetElement(blockid, ".dragDropHolder .label").each(function() {
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

        $thisTarget.attr("title", modelState.targetTxt1 + " '" + $thisTarget.data("name") + " " + ($thisTarget.index() + 1) + "'");

        $thisLabel
            .attr("title", modelState.labelTxt1)
            .removeClass("selected")
            .css({
                "top"	: jGetElement(blockid, "div#x_pageHolder").scrollTop(),
                "left"	:0
            });
    }
}