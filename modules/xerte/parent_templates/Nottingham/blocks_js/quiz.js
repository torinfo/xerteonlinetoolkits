var quiz = new function() {
    var questions,
        currentAnswers,
        currentQ,
        qNoTxt,
        myProgress,
        resultsShown = false,
        tracked = false,
        questionFeedbackText;

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function(blockid) {
        jGetElement(blockid, ".feedbackGroup").find('.feedbackBlock').html("");
        if ($(x_currentPageXML).children().length > 0) {
            this.startQs(blockid);
        }
        if (x_currentPageXML.getAttribute("panelWidth") != "Full" && x_currentPageXML.getAttribute("video") != undefined && x_currentPageXML.getAttribute("video") != "") {
            this.loadVideo(blockid);
        }
    };

    // function called every time the size of the LO is changed
    this.sizeChanged = function(blockid) {
        var $panel = jGetElement(blockid, ".pageContents .qPanel");
        if (x_browserInfo.mobile == false) {
            $panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
        }
        if (x_currentPageXML.getAttribute("panelWidth") != "Full" && x_currentPageXML.getAttribute("video") != undefined && x_currentPageXML.getAttribute("video") != "") {
            this.loadVideo(blockid);
        }

        var resized = false;
        if (jGetElement(blockid, ".questionAudio").children().length > 0) {
            if (resized == false) {
                var audioBarW = 0;
                jGetElement(blockid, ".questionAudio").find(".mejs-inner").find(".mejs-controls").children().each(function() {
                    audioBarW += $(this).outerWidth();
                });
                if (audioBarW < jGetElement(blockid, ".questionAudio").width() - 5 || audioBarW > jGetElement(blockid, ".questionAudio").width() + 5) {
                    resized = true;
                    $x_window.resize();
                }
            }
        }
        if (jGetElement(blockid, ".pageContents .audioHolder").length > 0) {
            if (resized == false) {
                var audioBarW = 0;
                jGetElement(blockid, ".pageContents .audioHolder:eq(0) .mejs-inner .mejs-controls").children().each(function() {
                    audioBarW += $(this).outerWidth();
                });
                if (audioBarW - jGetElement(blockid, ".pageContents .audioHolder").parents(".mainPanel").width() < -2 || audioBarW - jGetElement(blockid, ".pageContents .audioHolder").parents(".mainPanel").width() > 2) {
                    resized = true;
                    $x_window.resize();
                }
            }
        }

        jGetElement(blockid, ".qTxt").width($panel.width());
    };


    this.leavePage = function(blockid) {
        if ($(x_currentPageXML).children().length > 0) {
            if (!this.tracked) {
                this.showFeedBackandTrackResults(blockid);
            }
            if (!this.resultsShown) {
                this.showResults(blockid);
            }
        }
    }


    this.startQs = function(blockid) {
        // if language attributes aren't in xml will have to use english fall back
        this.qNoTxt = x_currentPageXML.getAttribute("quesCount");
        if (this.qNoTxt == undefined) {
            this.qNoTxt = "Question {i} of {n}";
        }
        this.showfeedback = true;
        if (x_currentPageXML.getAttribute("showfeedback") != undefined)
        {
            this.showfeedback = x_currentPageXML.getAttribute("showfeedback") == "true";
        }

        jGetElement(blockid, ".optionHolder").show();
        jGetElement(blockid, ".checkBtn, .nextBtn, .restartBtn").button("disable");

        this.currentQ = 0;
        this.questions = []; // array of questions to use (index)
        this.myProgress = []; // array of whether each question was answered correctly
        var numQs = $(x_currentPageXML).children().length;
        if (x_currentPageXML.getAttribute("numQuestions") != "All" && x_currentPageXML.getAttribute("numQuestions") != undefined && Number(x_currentPageXML.getAttribute("numQuestions")) < numQs) {
            numQs = Number(x_currentPageXML.getAttribute("numQuestions"));
        }
        if (x_currentPageXML.getAttribute("order") == "random") {
            var qNums = [];
            for (var i=0; i<$(x_currentPageXML).children().length; i++) {
                qNums.push(i);
            }
            for (var i=0; i<numQs; i++) {
                var qNum = Math.floor(Math.random() * qNums.length);
                this.questions.push(qNums[qNum]);
                qNums.splice(qNum, 1);
                this.myProgress.push("");
            }
        } else {
            for (var i=0; i<numQs; i++) {
                this.questions.push(i);
                this.myProgress.push("");
            }
        }
        // Track the quiz page
        this.weighting = 1.0;
        if (x_currentPageXML.getAttribute("trackingWeight") != undefined)
        {
            this.weighting = x_currentPageXML.getAttribute("trackingWeight");
        }
        XTSetPageType(x_currentPage, 'numeric', numQs, this.weighting);

        this.loadQ(blockid);

        x_pageContentsUpdated();
    };

    this.loadQ = function(blockid, next = false, xmlState) {
        // Reset tracking flag
        this.tracked = false;

        if ($(x_currentPageXML).children().length == 0) {
            jGetElement(blockid, ".optionHolder").html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noQ", "No questions have been added") + '</span>');

        } else {
            var $thisQ = null;
            if(next){
                x_currentPageXML = xmlState;
            }

            $thisQ = $(x_currentPageXML).children()[this.questions[this.currentQ]];

            jGetElement(blockid, ".qNo").html(this.qNoTxt.replace("{i}", this.currentQ + 1).replace("{n}", this.questions.length));

            var infoString = $thisQ.getAttribute("prompt");

            if ($thisQ.getAttribute("sound") != undefined && $thisQ.getAttribute("sound") != "") {
                quiz.loadAudio($thisQ.getAttribute("sound"), blockid);
            } else {
                jGetElement(blockid, ".questionAudio").empty().hide();
            }

            var url = $thisQ.getAttribute("image");
            if (url != undefined && url != "") {
                var newString = "";
                newString += '<img src="' + x_evalURL(url) + '" class="quizImg"';
                if ($thisQ.getAttribute("tip") != undefined && $thisQ.getAttribute("tip") != "") {
                    newString += 'alt="' + $thisQ.getAttribute("tip") + '"';
                }
                newString += ' />';
                infoString = newString + infoString;
            }
            jGetElement(blockid, ".qTxt").html(x_addLineBreaks(infoString));

            //if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
            //	jGetElement(blockid, ".qTxt").find("a.x_glossary").contents().unwrap();
            //}

            jGetElement(blockid, ".feedback").html("");
            jGetElement(blockid, ".generalFeedback").html("");

            if ($($thisQ).children().length == 0) {
                jGetElement(blockid, ".optionHolder").html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noA", "No answer options have been added") + '</span>');
            } else {
                var $optionHolder = jGetElement(blockid, ".optionHolder");
                if ($thisQ.getAttribute("type") == "Multiple Answer") {
                    $optionHolder.html('<div class="optionGroup"><input type="checkbox" name="option" /><label class="optionTxt"></label></div>');
                } else {
                    $optionHolder.html('<div class="optionGroup"><input type="radio" name="option" /><label class="optionTxt"></label></div>');
                }
                var $optionGroup = $optionHolder.find(".optionGroup"),
                    $checkBtn = jGetElement(blockid, ".checkBtn"),
                    $feedback = jGetElement(blockid, ".feedback"),
                    correctOptions = [],
                    correctAnswer = [],
                    correctFeedback = [];

                // Store the answers in a temporary array
                this.currentAnswers = [];
                $($thisQ).children().each(function(i) {
                    var label;
                    if (this.getAttribute("name") == undefined || this.getAttribute("name")=="")
                    {
                        label = jGetElement(blockid, "<div>").html(this.getAttribute("text")).text();
                    }
                    else
                    {
                        label = this.getAttribute("name");
                    }
                    quiz.currentAnswers.push(
                        {
                            text:		this.getAttribute("text"),
                            name:       label,
                            correct:	this.getAttribute("correct"),
                            feedback:	this.getAttribute("feedback"),
                            audioFB:	this.getAttribute("audioFB")
                        }
                    );

                });

                // Randomise the answers, if required
                if ($thisQ.getAttribute("answerOrder") == 'random') {
                    for (var tmp, j, k, l = this.currentAnswers.length, i = l; i--;) {
                        j = Math.floor(Math.random() * l);
                        k = Math.floor(Math.random() * l);
                        tmp = this.currentAnswers[j];
                        this.currentAnswers[j] = this.currentAnswers[k];
                        this.currentAnswers[k] = tmp;
                    }
                }

                $.each(this.currentAnswers, function(i, thisOption) {

                    var $thisOptionGroup, $thisOption, $thisOptionTxt;
                    if (i != 0) {
                        $thisOptionGroup = $optionGroup.clone().appendTo($optionHolder);
                    } else {
                        $thisOptionGroup = $optionGroup;
                    }
                    $thisOption = $thisOptionGroup.find("input");
                    $thisOptionTxt = $thisOptionGroup.find(".optionTxt");

                    quiz.currNrOptions = i+1;

                    correctOptions.push({
                        id: (i+1)+"",
                        answer: thisOption.name,
                        result: thisOption.correct == 'true'
                    });
                    if (thisOption.correct == 'true') {
                        correctAnswer.push(thisOption.name);
                    }
                    correctFeedback.push(thisOption.feedback);

                    $thisOption
                        .attr({
                            "value"	:thisOption.text,
                            "id"	:"option" + i
                        })
                        .data("correct", thisOption.correct)
                        .change(function() {

                            $feedback.html("");
                            jGetElement(blockid, ".feedbackGroup").find('.feedbackBlock').html("");
                            var $selected = jGetElement(blockid, ".optionHolder input:checked");
                            if ($selected.length > 0) {
                                $checkBtn.button("enable");
                            } else {
                                $checkBtn.button("disable");
                            }
                            jGetElement(blockid, ".nextBtn").button("disable");
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
                        .html(x_addLineBreaks(thisOption.text));

                    //if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
                    //	$thisOptionTxt.find("a.x_glossary").contents().unwrap();
                    //}
                });
                var name = $thisQ.getAttribute("prompt");
                if ($thisQ.getAttribute("name"))
                {
                    name = $thisQ.getAttribute("name");
                }

                var blocknr = parseFloat(blockid.split("block").pop()) - 1;
                debugger
                XTEnterInteraction(x_currentPage, blocknr , 'multiplechoice', name, correctOptions, correctAnswer, correctFeedback, x_currentPageXML.getAttribute("grouping"),  this.questions[this.currentQ]);
                XTSetInteractionPageXML(x_currentPage, blocknr, x_currentPageXML, this.questions[this.currentQ]);
                quiz.checked = false;
            }
        }
    }

    this.showFeedBackandTrackResults = function(blockid)
    {

        var blocknr = parseFloat(blockid.split("block").pop()) - 1;
        let currentPageXML = XTGetPageXML(x_currentPage, blocknr, this.questions[this.currentQ]);
        this.tracked = true;

        var currentQuestion = currentPageXML.children[quiz.questions[quiz.currentQ]];

        var selected = jGetElement(blockid, ".optionHolder input:checked"),
            optionFeedback = "",
            correct = true,
            l_options = [],
            l_answer = [],
            l_feedback = [];

        var generalFeedback = "";
        var correctCounter = 0;

        var thisQ = currentPageXML.children[this.questions[this.currentQ]];
        questionFeedbackText = thisQ.getAttribute('generalFeedback')
        var currentQuestionsChildren = $(currentPageXML.children[this.questions[this.currentQ]]).children();
        for(i = 0; i < currentQuestionsChildren.length; i++)
        {

            if(currentQuestionsChildren[i].getAttribute("correct") == 'true')
            {
                correctCounter++;
            }
        }

        if(selected.length == 0 && correctCounter != 0)
        {
            correct = false;
        }
        // get feedback for selected options and check if they are correct
        for (var i=0; i<selected.length; i++) {
            var optionIndex = $(selected[i]).parent().index(),
                selectedOption = quiz.currentAnswers[optionIndex];

            optionFeedback += "<p>" + x_addLineBreaks(selectedOption.feedback)  + "</p>";
            if (selectedOption.audioFB != undefined && selectedOption.audioFB != "") {
                optionFeedback += '<div class="audioHolder" data-audio="' + selectedOption.audioFB + '"></div>';
            }

            if (correct != false && selectedOption.correct == "true") {
                correct = true;
            } else {
                correct = false;
            }
            l_options.push({
                id: optionIndex+1+"",
                answer: selectedOption.name,
                result: correct
            });
            l_answer.push(selectedOption.name);
            l_feedback.push(selectedOption.feedback);
        }
        generalFeedback += optionFeedback;
        var rightWrongTxt = "";
        if (currentPageXML.getAttribute("judge") != "false") {
            // if all selected are correct - check that none of the unselected options should have been
            if (correct != false && currentQuestion.getAttribute("type") == "Multiple Answer") {
                var notSelected = jGetElement(blockid, ".optionHolder input:not(:checked)");
                for (var i=0; i<notSelected.length; i++) {
                    var notSelectedOption = quiz.currentAnswers[$(notSelected[i]).parent().index()];
                    if (notSelectedOption.correct == "true") {
                        correct = false;
                    }
                }
            }
            // add correct feedback depending on if question overall has been answered correctly or not
            if (currentQuestion.getAttribute("type") == "Multiple Answer") {
                if (correct == true) {
                    rightWrongTxt = '<p>' + jGetElement(blockid, ".pageContents").data("multiRight") + '</p>';
                } else {
                    rightWrongTxt = '<p>' + jGetElement(blockid, ".pageContents").data("multiWrong") + '</p>';
                }
            } else {
                if (correct == true) {
                    rightWrongTxt = '<p>' + jGetElement(blockid, ".pageContents").data("singleRight") + '</p>';
                } else {
                    rightWrongTxt = '<p>' + jGetElement(blockid, ".pageContents").data("singleWrong") + '</p>';
                }
            }
        }

        var feedbackDiv = ['top', 'middle', 'bottom'],
            feedbackOrder = thisQ.getAttribute('feedbackPos') == undefined ? 'GAC' : thisQ.getAttribute('feedbackPos');

        feedbackOrder = [...feedbackOrder];

        if(this.showfeedback){
            if(thisQ.getAttribute("type") != "Multiple Answer"){
                for (var i=0; i<feedbackDiv.length; i++) {
                    var thisFeedback;
                    if (feedbackOrder[i] == 'G') {
                        thisFeedback = thisQ.getAttribute('feedback');
                    } else if (feedbackOrder[i] == 'A') {
                        if(selectedOption !== undefined && selectedOption !== null){
                            thisFeedback = selectedOption.feedback;
                        }
                    } else {
                        thisFeedback = rightWrongTxt;
                    }

                    jGetElement(blockid, '.' + feedbackDiv[i] + 'Feedback')
                        .html(thisFeedback)
                        .show();
                }

                var feedbackLabel = currentPageXML.getAttribute("feedbackLabel");
                if (feedbackLabel == undefined) {
                    feedbackLabel = "Feedback";
                }
                jGetElement(blockid, ".feedbackHeader").html(feedbackLabel != '' ? "<h3>" + feedbackLabel + "</h3>" : '');
            }else{

                for (var p=0; p<feedbackDiv.length; p++) {
                    var thisFeedback;
                    if (feedbackOrder[p] == 'G') {
                        thisFeedback = thisQ.getAttribute('feedback');
                    } else if (feedbackOrder[p] == 'A') {

                        var selectedInput = jGetElement(blockid, ".optionHolder input:checked")
                        var multipleFeedback = []
                        var feedback = "";

                        for(var f = 0; f <selectedInput.length; f++){
                            multipleFeedback.push(selectedInput[f].value)
                        }

                        for(var l = 0; l < multipleFeedback.length; l++){
                            for(var j = 0; j < thisQ.children.length; j++){
                                if(multipleFeedback[l] === thisQ.children[j].attributes.text.value){
                                    feedback += thisQ.children[j].attributes.feedback.value
                                }
                            }
                        }
                        thisFeedback = feedback;
                    } else {
                        thisFeedback = rightWrongTxt;
                    }

                    $('.' + feedbackDiv[p] + 'Feedback')
                        .html(thisFeedback)
                        .show();
                }
                var feedbackLabel = currentPageXML.getAttribute("feedbackLabel");
                if (feedbackLabel == undefined) {
                    feedbackLabel = "Feedback";
                }
                jGetElement(blockid, ".feedbackHeader").html(feedbackLabel != '' ? "<h3>" + feedbackLabel + "</h3>" : '');
            }

        }



        // Track answer
        var result = {
            success: correct,
            score: correct ? 100.0 : 0.0
        };
        debugger
        XTExitInteraction(x_currentPage, blocknr, result, l_options, l_answer, l_feedback,  this.questions[this.currentQ]);
        quiz.myProgress.splice(quiz.currentQ, 1, correct);

        generalFeedback += rightWrongTxt;
        var answerFeedback = "<h3>" + jGetElement(blockid, ".pageContents").data("feedbackLabel") + "</h3>" + generalFeedback;
        if (XTGetMode() == "normal")
        {
            // Disable all options
            var i=0;
            for (i=0; i<quiz.currNrOptions; i++)
            {
                jGetElement(blockid, ".option"+i).attr("disabled", "disabled");
            }
        }
        if (quiz.showfeedback)
        {
            jGetElement(blockid, ".feedback")
                .html(answerFeedback)
                .find(".audioHolder").each(function() {
                $(this).mediaPlayer({
                    type	:"audio",
                    source	:$(this).data("audio"),
                    width	:"100%"
                });
            });

            if(questionFeedbackText !== null){
                if(questionFeedbackText !== ""){
                    var questionFeedback = "<h3>" + jGetElement(blockid, ".pageContents").data("generalFeedbackLabel") + "</h3>" + questionFeedbackText
                    $('.generalFeedback').html(questionFeedback)
                }

            }


            //if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
            //    jGetElement(blockid, ".feedback").find("a.x_glossary").contents().unwrap();
            //}

            jGetElement(blockid, ".nextBtn").button("enable");
            jGetElement(blockid, ".checkBtn").button("disable");

            $(this).hide().show(); // hack to take care of IEs inconsistent handling of clicks
        }
        else
        {
            // Continue to next question
            jGetElement(blockid, ".checkBtn").button("disable");
            quiz.currentQ++;
            if (quiz.currentQ == quiz.questions.length) {
                // last question answered - show results
                quiz.showResults();
            } else {
                quiz.loadQ(blockid);
            }
        }

        x_pageContentsUpdated();
    }

    this.showResults = function(blockid) {
        // last question answered - show results
        var blocknr = parseFloat(blockid.split("block").pop()) - 1;
        let currentPageXML = XTGetPageXML(x_currentPage, blocknr, this.questions[this.currentQ]);
        var $pageContents = jGetElement(blockid, ".pageContents");
        jGetElement(blockid, ".qNo").html($pageContents.data("onCompletionText"));
        var fbTxt = "<p>" + x_addLineBreaks(currentPageXML.getAttribute("feedback")) + "</p>";

        var myScore = 0;
        for (var i=0; i<quiz.myProgress.length; i++) {
            if (quiz.myProgress[i] == true) {
                myScore++;
            }
        }
        if (x_currentPageXML.getAttribute("judge") != "false") {
            if (x_currentPageXML.getAttribute("scorePos") == "Above") {
                fbTxt = "<p>" + $pageContents.data("scoreText").replace("{i}", myScore).replace("{n}", quiz.questions.length) + "</p>" + fbTxt;
            } else {
                fbTxt += "<p>" + $pageContents.data("scoreText").replace("{i}", myScore).replace("{n}", quiz.questions.length) + "</p>";
            }
        }

        jGetElement(blockid, ".feedbackHeader").html(fbTxt);
        jGetElement(blockid, ".questionAudio").empty();

        //if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
        //	jGetElement(blockid, ".feedback").find("a.x_glossary").contents().unwrap();
        //}

        jGetElement(blockid, ".optionHolder").hide();
        jGetElement(blockid, ".nextBtn, .checkBtn").button("disable");
        if (XTGetMode() != "normal")
        {
            jGetElement(blockid, ".restartBtn").button("enable");
        }
        jGetElement(blockid, ".qTxt").html("");

        var scormScore = Math.round((myScore * 100 / quiz.questions.length) * 100)/100;
        XTSetPageScore(x_currentPage, scormScore);
        this.resultsShown = true;
    };

    this.loadVideo = function(blockid) {
        var $video = jGetElement(blockid, ".pageVideo"),
            videoDimensions = $video.data("dimensions"),
            $textHolder = jGetElement(blockid, ".textHolder"),
            maxW = $textHolder.width() - parseInt($textHolder.find(".panel").css("padding-left")) * 2 - parseInt($textHolder.find(".panel").css("margin-left")) * 2;

        if (maxW < videoDimensions[0]) {
            var scale = maxW / videoDimensions[0];
            videoDimensions = [videoDimensions[0] * scale, videoDimensions[1] * scale];
        }

        $video.mediaPlayer({
            type	:"video",
            source	:$video.data("src"),
            width	:Number(videoDimensions[0]),
            height	:Number(videoDimensions[1])
        });
    }

    this.init = function(pageXML,blockid) {
        x_currentPageXML = pageXML;
        var panelWidth = x_currentPageXML.getAttribute("panelWidth"),
            $splitScreen = jGetElement(blockid, ".pageContents .splitScreen"),
            $textHolder = jGetElement(blockid, ".textHolder");

        this.resultsShown = false;
        if (panelWidth == "Full") {
            jGetElement(blockid, ".infoHolder .panel").appendTo(jGetElement(blockid, ".pageContents"));
            $splitScreen.remove();
        } else {
            $textHolder.html(x_addLineBreaks(x_currentPageXML.getAttribute("instructions")));

            //if (x_currentPageXML.getAttribute("disableGlossary") == "true") {
            //	$textHolder.find("a.x_glossary").contents().unwrap();
            //}

            var textAlign = x_currentPageXML.getAttribute("align");
            if (textAlign != "right" || (x_currentPageXML.getAttribute("video") != undefined && x_currentPageXML.getAttribute("video") != "")) {
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

        if (panelWidth != "Full" && x_currentPageXML.getAttribute("video") != undefined && x_currentPageXML.getAttribute("video") != "") {
            $textHolder.append('<div id="vidHolder" class="panel inline"><div id="pageVideo"></div></div>');
            var $pageVideo = jGetElement(blockid, ".pageVideo"),
                videoDimensions = [320,240]; // default video size
            if (x_currentPageXML.getAttribute("movieSize") != "" && x_currentPageXML.getAttribute("movieSize") != undefined) {
                var dimensions = x_currentPageXML.getAttribute("movieSize").split(",");
                if (dimensions[0] != 0 && dimensions[1] != 0) {
                    videoDimensions = dimensions;
                }
            }
            $pageVideo.data({
                "src"			:x_currentPageXML.getAttribute("video"),
                "dimensions"	:videoDimensions
            });
            quiz.loadVideo(blockid);
        }

        if (panelWidth != "Full" && x_currentPageXML.getAttribute("img") != undefined && x_currentPageXML.getAttribute("img") != "") {
            var tip = x_currentPageXML.getAttribute("tip") != undefined && x_currentPageXML.getAttribute("tip") != "" ? 'alt="' + x_currentPageXML.getAttribute("tip") + '"' : "";
            $textHolder.append('<img class="quizImg" src="' + x_evalURL(x_currentPageXML.getAttribute("img")) + '"' + tip +'>');
        }

        // submitBtnWidth/nextBtnWidth/restartBtnWidth attributes not used as buttons will be sized automatically, submitBtnTip/nextBtnTip/restartBtnTip attributes also not used
        // if language attributes aren't in xml will have to use english fall back
        var submitBtnText = x_currentPageXML.getAttribute("submitBtnText");
        if (submitBtnText == undefined) {
            submitBtnText = "Submit";
        }
        var nextBtnText = x_currentPageXML.getAttribute("nextBtnText");
        if (nextBtnText == undefined) {
            nextBtnText = "Next";
        }
        var restartBtnText = x_currentPageXML.getAttribute("restartBtnText");
        if (restartBtnText == undefined) {
            restartBtnText = "Restart";
        }
        var singleRight = x_currentPageXML.getAttribute("singleRight");
        if (singleRight == undefined) {
            singleRight = "Your answer is correct";
        }
        var singleWrong = x_currentPageXML.getAttribute("singleWrong");
        if (singleWrong == undefined) {
            singleWrong = "Your answer is incorrect";
        }
        var multiRight = x_currentPageXML.getAttribute("multiRight");
        if (multiRight == undefined) {
            multiRight = "You have selected all the correct answers";
        }
        var multiWrong = x_currentPageXML.getAttribute("multiWrong");
        if (multiWrong == undefined) {
            multiWrong = "You have not selected the correct combination of answers";
        }
        var onCompletionText = x_currentPageXML.getAttribute("onCompletion");
        if (onCompletionText == undefined) {
            onCompletionText = "You have completed the exercise";
        }
        var scoreText = x_currentPageXML.getAttribute("score");
        if (scoreText == undefined) {
            scoreText = "You scored {i} / {n}";
        }
        var feedbackLabel = x_currentPageXML.getAttribute("feedbackLabel");
        if (feedbackLabel == undefined) {
            feedbackLabel = "Feedback";
        }
        var generalFeedbackLabel = x_currentPageXML.getAttribute("generalFeedbackLabel");
        if (generalFeedbackLabel == undefined) {
            generalFeedbackLabel = "General Feedback";
        }

        jGetElement(blockid, ".pageContents").data({
            "feedbackLabel"			:feedbackLabel,
            "generalFeedbackLabel"	:generalFeedbackLabel,
            "singleRight"			:singleRight,
            "singleWrong"			:singleWrong,
            "multiRight"			:multiRight,
            "multiWrong"			:multiWrong,
            "onCompletionText"		:onCompletionText,
            "scoreText"				:scoreText
        });

        jGetElement(blockid, ".checkBtn")
            .button({
                label: submitBtnText
            })
            .click(function() {
                quiz.showFeedBackandTrackResults(blockid);
                quiz.checked = true;
            });

        jGetElement(blockid, ".nextBtn")
            .button({
                label: nextBtnText
            })
            .click(function() {
                var blocknr = parseFloat(blockid.split("block").pop()) - 1;
                var xmlState = XTGetPageXML(x_currentPage, blocknr,quiz.questions[quiz.currentQ])
                $(this).button("disable");
                jGetElement(blockid, ".feedbackGroup").find('.feedbackBlock').html("");
                quiz.currentQ++;
                if (quiz.currentQ == quiz.questions.length) {
                    // last question answered - show results
                    quiz.showResults(blockid);
                    quiz.resultsShown = true;
                } else {
                    quiz.loadQ(blockid, true, xmlState);
                }

                x_pageContentsUpdated();
            });

        jGetElement(blockid, ".restartBtn")
            .button({
                label: restartBtnText
            })
            .click(function() {
                quiz.startQs(blockid);
            });

        this.startQs(blockid);
        this.sizeChanged(blockid);
        x_pageLoaded();
    }

    this.loadAudio = function(soundFile, blockid) {
        if (soundFile != undefined && soundFile != "") {
            jGetElement(blockid, ".questionAudio").mediaPlayer({
                type	:"audio",
                source	:soundFile,
                width	:"100%"
            });
        }
    }
}