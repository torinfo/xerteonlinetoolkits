var mcqBlock = new function() {

    this.generateModelState = function () {
        return mcqModel = {
						judge: null,
            optionElements: null,
						checked: null,
						currNrOptions: null,
        };
    }

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function(blockid) {
        let pageXML = x_getBlockXML(blockid);
				const state = x_getPageDict("state", blockid)

        if ($(pageXML).children().length > 0) {
            //this.startQ(blockid);
            //jGetElement(blockid, ".feedback").find('.feedbackBlock').html("");
            //jGetElement(blockid, ".optionHolder input:checked").prop("checked", false);
            //jGetElement(blockid, ".checkBtn")
            //    .show()
            //    .button("disable");
        }
    }

    // function called every time the size of the LO is changed
    this.sizeChanged = function(blockid) {
        if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
        if (x_browserInfo.mobile == false) {
            var $panel = jGetElement(blockid,".pageContents .panel");
            $panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
        }

        if (jGetElement(blockid, ".pageContents .audioHolder").length > 0) {
            var audioBarW = 0;
            jGetElement(blockid, ".pageContents .audioHolder:eq(0) .mejs-inner .mejs-controls").children().each(function() {
                audioBarW += $(this).outerWidth();
            });
            if (audioBarW - jGetElement(blockid, ".pageContents .audioHolder").parents(".mainPanel").width() < -2 || audioBarW - jGetElement(blockid, ".pageContents .audioHolder").parents(".mainPanel").width() > 2) {
                $x_window.resize();
            }
        }
    }

    this.startQ = function(blockid) {
        let pageXML = x_getBlockXML(blockid);
				const state = x_getPageDict("state", blockid)
				
        var correctOptions = [],
            correctAnswer = [],
            correctFeedback = [],
            judge = false,
            blocknr = x_getBlockNr(blockid); // is there a correct answer for the question?

        state.checked = false;
        // Track the quiz page
        let weighting = 1.0;
        if (pageXML.getAttribute("trackingWeight") != undefined)
        {
            weighting = pageXML.getAttribute("trackingWeight");
        }
        //TODO: fix this mess:
        XTSetInteractionType(x_currentPage, blocknr, 'numeric', weighting);
        for (var i = 0; i < state.optionElements.length; i++) {
            var answerTxt;
            if (state.optionElements[i].label != undefined)
            {
                var answerTxt=state.optionElements[i].label;
            }
            else
            {
                // Create fallback label
                var answerTxt = (pageXML.getAttribute('answerTxt') != undefined ? pageXML.getAttribute('answerTxt') : "Option");
                answerTxt += ' ' + (i+1);
                answerTxt = x_GetTrackingTextFromHTML(state.optionElements[i].text, answerTxt);
            }
            correctOptions.push({
                id: (i+1)+"",
                answer: answerTxt,
                result: state.optionElements[i].correct == 'true'
            });
            if (state.optionElements[i].correct == 'true') {
                judge = true;
                correctAnswer.push(answerTxt);
            }
            correctFeedback.push(x_GetTrackingTextFromHTML(state.optionElements[i].feedback, ""));
        }

        state.judge = judge;

        // Create fallback label
        var label = (pageXML.getAttribute('questionTxt') != undefined ? pageXML.getAttribute('questionTxt') : "Multiple choice question");
        label += ' ' + (x_currentPage+1);
        if (pageXML.getAttribute("trackinglabel") != null && pageXML.getAttribute("trackinglabel") != "")
        {
            label = pageXML.getAttribute("trackinglabel");
        }
        else
        {
            label = x_GetTrackingTextFromHTML(pageXML.getAttribute("prompt"), label);
        }
        XTEnterInteraction(x_currentPage, blocknr, 'multiplechoice', label, correctOptions, correctAnswer, correctFeedback, pageXML.getAttribute("grouping"), null);
        XTSetInteractionPageXML(x_currentPage, blocknr, pageXML);
    }

    this.leavePage = function(blockid) {
        let pageXML = x_getBlockXML(blockid);
				const state = x_getPageDict("state", blockid)
        if ($(pageXML).children().length > 0) {
            if (!state.checked) {
                mcqBlock.showFeedBackandTrackScore();
            }
        }
    }

    this.showFeedBackandTrackScore = function(blockid)
    {
        var blocknr = parseFloat(blockid.split("block").pop()) - 1;
        let currentPageXML = x_getBlockXML(blocknr);
				const state = x_getPageDict("state", blockid)
        var answerFeedback = "",
            genFeedback,
            correct = (currentPageXML.getAttribute("type") == "Multiple Answer"),
            l_options = [],
            l_answers = [],
            l_feedbacks = [],
            selected = jGetElement(blockid, ".optionHolder input");

        if (currentPageXML.getAttribute("feedback") != undefined && currentPageXML.getAttribute("feedback") != '') {
            genFeedback = x_addLineBreaks(currentPageXML.getAttribute("feedback"));
            if (genFeedback != "" && genFeedback.indexOf('<p') == -1) {
                genFeedback = '<p>' + genFeedback + '</p>';
            }
        }

        for (var i=0; i<selected.length; i++) {
            
            var optionIndex = $(selected[i]).parent().index(),
                selectedOption = state.optionElements[optionIndex],
                currCorrect;

            if (currentPageXML.getAttribute("type") == "Multiple Answer") {
                currCorrect = (
                    (selectedOption.correct == "true" && $(selected[i]).is(':checked')) ||
                    (selectedOption.correct == "false" && !$(selected[i]).is(':checked'))
                );
                correct = correct && currCorrect;
            }
            else {
                currCorrect = selectedOption.correct == "true" && $(selected[i]).is(':checked');
                correct = correct || currCorrect;
            }

            if ($(selected[i]).is(':checked')) {
                var tempFeedback = "";
                tempFeedback += selectedOption.feedback;
                if (tempFeedback != "" && tempFeedback.indexOf('<p') == -1) {
                    tempFeedback = '<p>' + tempFeedback + '</p>';
                }
                if (selectedOption.audioFB != undefined && selectedOption.audioFB != "") {
                    tempFeedback += '<div class="audioHolder" data-audio="' + selectedOption.audioFB + '"></div>';
                }
                if (tempFeedback != "") {
                    answerFeedback += tempFeedback;
                }

                var answerTxt = "";
                if (selectedOption.label != undefined) {
                    answerTxt = selectedOption.label;
                }
                else
                {
                    // Create fallback label
                    answerTxt = (currentPageXML.getAttribute('answerTxt') != undefined ? currentPageXML.getAttribute('answerTxt') : "Option");
                    answerTxt += ' ' + (optionIndex+1);
                    answerTxt = x_GetTrackingTextFromHTML(selectedOption.text, answerTxt);
                }

                l_options.push({
                    id :optionIndex+1+"",
                    answer: answerTxt,
                    result: currCorrect
                });

                l_answers.push(answerTxt);
                l_feedbacks.push(x_GetTrackingTextFromHTML(selectedOption.feedback, ""));
            }
        }

        var singleRight = currentPageXML.getAttribute("singleRight") != undefined ? currentPageXML.getAttribute("singleRight") : "Your answer is correct",
            singleWrong = currentPageXML.getAttribute("singleWrong") != undefined ? currentPageXML.getAttribute("singleWrong") : "Your answer is incorrect",
            multiRight = currentPageXML.getAttribute("multiRight") != undefined ? currentPageXML.getAttribute("multiRight") : "You have selected all the correct answers",
            multiWrong = currentPageXML.getAttribute("multiWrong") != undefined ? currentPageXML.getAttribute("multiWrong") : "You have not selected the correct combination of answers";

        var rightWrongTxt = "";
        // add correct feedback depending on if question overall has been answered correctly or not
        if (currentPageXML.getAttribute("markFeedback") != 'false') { // new optional property allows for this feedback to be turned off
            if (currentPageXML.getAttribute("type") == "Multiple Answer") {
                if (state.judge == true) { // there is a correct answer for question
                    if (correct == true) {
                        rightWrongTxt = multiRight != '' ? '<p>' + multiRight + '</p>' : '';
                    } else {
                        rightWrongTxt = multiWrong != '' ? '<p>' + multiWrong + '</p>' : '';
                    }
                }
            } else {
                if (state.judge == true) { // there is a correct answer for question
                    if (correct == true) {
                        rightWrongTxt = singleRight != '' ? '<p>' + singleRight + '</p>' : '';
                    } else {
                        rightWrongTxt = singleWrong != '' ? '<p>' + singleWrong + '</p>' : '';
                    }
                }
            }
        }

        var feedback = 0,
            feedbackDiv = ['top', 'middle', 'bottom'],
            // order feedback is shown - default is: general feedback > answer feedback > correct/incorrect feedback
            feedbackOrder = currentPageXML.getAttribute("feedbackPos") == undefined ? 'GAC' : currentPageXML.getAttribute("feedbackPos");

        feedbackOrder = [...feedbackOrder];

        if (answerFeedback != undefined && answerFeedback != '') { feedback++; } else { feedbackOrder.splice(feedbackOrder.indexOf('A'), 1); }
        if (genFeedback != undefined && genFeedback != '') { feedback++; } else { feedbackOrder.splice(feedbackOrder.indexOf('G'), 1); }
        if (rightWrongTxt != undefined && rightWrongTxt != '') { feedback++; } else { feedbackOrder.splice(feedbackOrder.indexOf('C'), 1); }

        // show the feedback in the order specified
        for (var i=0; i<feedbackDiv.length; i++) {
            if (i<feedback) {
                var thisFeedback;
                if (feedbackOrder[i] == 'G') {
                    thisFeedback = genFeedback;
                } else if (feedbackOrder[i] == 'A') {
                    thisFeedback = answerFeedback;
                } else {
                    thisFeedback = rightWrongTxt;
                }

                jGetElement(blockid, '.' + feedbackDiv[i] + 'Feedback')
                    .html(thisFeedback)
                    .show();

            } else {
                jGetElement(blockid, '.' + feedbackDiv[i] + 'Feedback')
                    .html('')
                    .hide();
            }
        }

        var feedbackLabel = currentPageXML.getAttribute("feedbackLabel");
        if (feedbackLabel == undefined) {
            feedbackLabel = "Feedback";
        }
        jGetElement(blockid, ".feedbackHeader").html(feedbackLabel != '' ? "<h3>" + feedbackLabel + "</h3>" : '');

        jGetElement(blockid, ".feedback")
            .find(".audioHolder").each(function() {
            $(this).mediaPlayer({
                type	:"audio",
                source	:$(this).data("audio"),
                width	:"100%"
            });
        });

        $(this).hide().show(); // hack to take care of IEs inconsistent handling of clicks

        var result = {
            success: correct,
            score: correct ? 100.0 : 0.0
        };
        var blocknr = parseFloat(blockid.split("block").pop());

        XTExitInteraction(x_currentPage, blocknr-1, result, l_options, l_answers, l_feedbacks);

        if (XTGetMode() == "normal")
        {
            // Disable all options
            var i=0;
            for (i=0; i<state.currNrOptions; i++)
            {
                jGetElement(blockid, "#option"+i).attr("disabled", "disabled");
            }
        }

        x_pageContentsUpdated();
    }

    let getOptionElements = function(currentPage){
        var elements = [];
        $(currentPage).children().each(function(i) {
            elements.push(
                {
                    label:		this.getAttribute("name"),
                    text:		this.getAttribute("text"),
                    correct:	this.getAttribute("correct"),
                    feedback:	this.getAttribute("feedback"),
                    audioFB:	this.getAttribute("audioFB")
                }
            );
        });
        return elements;
    }


    this.init = function(blockid) {
        let pageXML = x_getBlockXML(blockid);
				const state = this.generateModelState();
				x_pushToPageDict(state, "state", blockid);
        // correct attribute on option also not used as it doesn't mark correct/incorrect - only gives feedback for each answer
        var panelWidth = pageXML.getAttribute("panelWidth"),
            $splitScreen = jGetElement(blockid, ".pageContents .splitScreen"),
            $textHolder = jGetElement(blockid, ".textHolder");

        if (panelWidth == "Full") {
            jGetElement(blockid, ".pageContents .panel").appendTo(jGetElement(blockid, ".pageContents"));
            $splitScreen.remove();
        } else {
            $textHolder.html(x_addLineBreaks(pageXML.getAttribute("instruction")));

            var textAlign = pageXML.getAttribute("align");
            if (textAlign != "Right") {
                if (panelWidth == "Small") {
                    $splitScreen.addClass("large");
                } else if (panelWidth == "Large") {
                    $splitScreen.addClass("small");
                } else {
                    $splitScreen.addClass("medium");
                }
            } else {
                $textHolder
                    .removeClass("left")
                    .addClass("right")
                    .appendTo($splitScreen);
                jGetElement(blockid, ".infoHolder")
                    .removeClass("right")
                    .addClass("left");
                if (panelWidth == "Small") {
                    $splitScreen.addClass("medium");
                } else if (panelWidth == "Large") {
                    $splitScreen.addClass("xlarge");
                } else {
                    $splitScreen.addClass("large");
                }
            }
        }

        jGetElement(blockid, ".question").html(x_addLineBreaks(pageXML.getAttribute("prompt")));

        var $optionHolder = jGetElement(blockid, ".optionHolder");

        if ($(pageXML).children().length == 0) {
            jGetElement(blockid, ".optionHolder").html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noA", "No answer options have been added") + '</span>');
            jGetElement(blockid, ".checkBtn").remove();
        } else {
            if (pageXML.getAttribute("type") == "Multiple Answer") {
                $optionHolder.find("input[type='radio']").remove();
            } else {
                $optionHolder.find("input[type='checkbox']").remove();
            }

            var $optionGroup = $optionHolder.find(".optionGroup");
            $optionGroup.addClass(blockid)
            // Store the answers in a temporary array
            var elements = [];
            $(pageXML).children().each(function(i) {
                elements.push(
                    {
                        label:		this.getAttribute("name"),
                        text:		this.getAttribute("text"),
                        correct:	this.getAttribute("correct"),
                        feedback:	this.getAttribute("feedback"),
                        audioFB:	this.getAttribute("audioFB")
                    }
                );
            });
            state.optionElements = elements;

            // Randomise the answers, if required
            if (pageXML.getAttribute("answerOrder") == 'random') {
                for (var tmp, j, k, i = state.optionElements.length; i--;) {
                    j = Math.floor(Math.random() * state.optionElements.length);
                    k = Math.floor(Math.random() * state.optionElements.length);
                    tmp = state.optionElements[j];
                    state.optionElements[j] = state.optionElements[k];
                    state.optionElements[k] = tmp;
                }
            }

            state.optionElements = state.optionElements;

            $.each(state.optionElements, function(i, thisOption) {
                var $thisOptionGroup, $thisOption, $thisOptionTxt;
                if (i != 0) {
                    $thisOptionGroup = $optionGroup.clone().appendTo($optionHolder);
                } else {
                    $thisOptionGroup = $optionGroup;
                }
                $thisOption = $thisOptionGroup.find("input");
                $thisOptionTxt = $thisOptionGroup.find(".optionTxt");

                state.currNrOptions = i+1;

                $thisOption
                    .attr({
                        "value"		:thisOption.text,
                        "id"		:blockid+" "+ "option" + i,
                        "name"      :blockid
                    })
                    .change(function() {
                        jGetElement(blockid, ".feedback").find('.feedbackBlock').html("");
                        var $checkBtn = jGetElement(blockid, ".checkBtn"),
                            $selected = jGetElement(blockid, ".optionHolder input:checked");

                        $checkBtn.show();
                        if ($selected.length == 0) {
                            $checkBtn.button("disable");
                        } else if ($selected.length > 0) {
                            $checkBtn.button("enable");
                        }
                    })
                    .focusin(function() {
                        $thisOptionGroup.addClass("highlight");
                    })
                    .focusout(function() {
                        $thisOptionGroup.removeClass("highlight");
                    });

                $thisOptionTxt
                    .attr("for", "option" + i)
                    .data("option", $thisOption)
                    .html(thisOption.text);
            });


            // checkBtnWidth attribute not used as button will be sized automatically
            // if language attributes aren't in xml will have to use english fall back
            var checkBtnTxt = pageXML.getAttribute("checkBtnTxt");
            if (checkBtnTxt == undefined) {
                checkBtnTxt = "Check";
            }
            var checkBtnTip = pageXML.getAttribute("checkBtnTip");
            if (checkBtnTip == undefined) {
                checkBtnTip = "Check Answer";
            }
            jGetElement(blockid, ".checkBtn")
                .button({
                    label: checkBtnTxt,
                    disabled: true
                })
                .click(function() {
                    $(this).hide();
                    mcqBlock.showFeedBackandTrackScore(blockid);
                    state.checked = true;
                })

            this.startQ(blockid, state);

        }

        this.sizeChanged(blockid);
        x_pageLoaded();
    }
}
