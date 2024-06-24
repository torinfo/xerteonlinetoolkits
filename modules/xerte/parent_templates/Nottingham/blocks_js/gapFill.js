var gapFillBlock = new function() {
    var state = {
        labelTxt1: null,
        labelTxt2: null,
        labelTxt3: null,
        targetTxt1: null,
        targetTxt2: null,
        delimiter: null,
        finished: false,
        correct_answers: 0,
        total: 0,
        score: 0,
        attempts: 0,
        casesensitive: null,
        answerData: null,
        allDropDownAnswers:null,
        labelAnswers: {}
    };
		
    this.resetModelState = function(){
        return {
            labelTxt1: null,
            labelTxt2: null,
            labelTxt3: null,
            targetTxt1: null,
            targetTxt2: null,
            delimiter: null,
            finished: false,
            correct_answers: 0,
            total: 0,
            score: 0,
            attempts: 0,
            casesensitive: null,
            answerData: null,
            allDropDownAnswers:null,
            labelAnswers: {}
        };
    }

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function(blockid) {
        let $pageContents = jGetElement(blockid, ".pageContents");
        const state = x_getPageDict("state",blockid)

        if (XTGetMode() == "normal") { state.isTracked = true; };

        $pageContents.find("#hint").remove();
        XTSetInteractionModelState(x_currentPage, x_getBlockNr(blockid), state);
				this.sizeChanged(blockid);
    }

    this.leavePage = function(blockid) {
        const state = x_getPageDict("state", blockid);
        let pageXML = x_getBlockXML(blockid);

        if (state.finished == false) {
            if(pageXML.getAttribute("interactivity") == "Drag Drop")
            {
                gapFillBlock.dragDropSubmit(true, blockid);
            }
            else if(pageXML.getAttribute("interactivity") == "Fill in Blank")
            {
                gapFillBlock.fillInSubmit(true, blockid);
            }
            else if (pageXML.getAttribute("interactivity") == "Drop Down Menu")
            {
                gapFillBlock.dropDownSubmit(true, blockid);
            }
        }
    };

    // function called every time the size of the LO is changed
    this.sizeChanged = function(blockid) {
        if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
        let $pageContents = jGetElement(blockid, ".pageContents");
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $audioHolder = jGetElement(blockid, ".audioHolder");
        var $panel = jGetElement(blockid, ".mainPanel");

        if (x_browserInfo.mobile == false) {
           /* $panel.height(Math.max(
                jGetElement(blockid, ".targetHolder").height() + jGetElement(blockid, ".labelHolder").outerHeight(true) + jGetElement(blockid, ".btnHolder").height(),
                $x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5
            ));*/
        }
        $pageContents.find("#hint").remove();

        if ($audioHolder.length > 0) {
            this.audioFbResize(false, blockid);
        }

        $targetHolder.find("input, select").css("font-size", jGetElement(blockid, ".dragDropHolder").css("font-size"));
    }

    this.audioFbResize = function(show, blockid) {
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $audioHolder = jGetElement(blockid, ".audioHolder");
        if (show === true) {
            $audioHolder.show();
        }

        if ($audioHolder.is(":visible")) {
            var audioBarW = 0;
            jGetElement(blockid, ".pageContents .audioHolder .mejs-inner .mejs-controls").children().each(function() {
                audioBarW += $(this).outerWidth();
            });

            if (audioBarW - $targetHolder.width() < -2 || audioBarW - $targetHolder.width() > 2) {
                $x_window.resize();
            }
        }
    }

    this.init = function(blockid) {
        let $pageContents = jGetElement(blockid, ".pageContents");
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        let $audioHolder = jGetElement(blockid, ".audioHolder");
        const state = x_pushToPageDict(this.resetModelState(), "state", blockid);
        let pageXML = x_getBlockXML(blockid);

        let weighting = 1.0;
        if (pageXML.getAttribute("trackingWeight") != undefined)
        {
            weighting = pageXML.getAttribute("trackingWeight");
        }

        $dragDropHolder = jGetElement(blockid, ".dragDropHolder");
        $dragDropHolder.addClass(blockid);

        const blocknr = x_getBlockNr(blockid);

        state.delimiter = pageXML.getAttribute("answerDelimiter") != undefined && pageXML.getAttribute("answerDelimiter") != "" ? pageXML.getAttribute("answerDelimiter")  : ",";

        if(XTGetMode() == "normal") {
            state.isTracked = true;
        } else {
            state.isTracked = false;
        }

        // add aria-label to answer box input/selects
        jGetElement(blockid, ".submitBtn").attr("aria-label", pageXML.getAttribute("checkBtn") != undefined && pageXML.getAttribute("checkBtn") != "" ? pageXML.getAttribute("checkBtn") : "Check");
        jGetElement(blockid, ".showBtn")
            .attr("aria-label", pageXML.getAttribute("showBtn") != undefined && pageXML.getAttribute("showBtn") != "" ? pageXML.getAttribute("showBtn") : "Show Answers")
            .hide();

        // set panel appearance
        var panelWidth = pageXML.getAttribute("panelWidth");
        if (panelWidth == "Full") {
            jGetElement(blockid, ".mainText").remove();
            jGetElement(blockid, ".dragDropHolder").appendTo($pageContents);
            jGetElement(blockid, ".pageContents .splitScreen").remove();

        } else {
            jGetElement(blockid, ".mainText").html(x_addLineBreaks(pageXML.getAttribute("text")));
            if (panelWidth == "Small") {
                jGetElement(blockid, ".pageContents .splitScreen").addClass("large"); // make text area on left large so panel on right is small
            } else if (panelWidth == "Large") {
                jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
            } else {
                jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
            }
        }

        var	origPassage = x_addLineBreaks(pageXML.getAttribute("passage"));

        if (origPassage.indexOf("<p>") != -1){
            origPassage = origPassage.replace(/<p>/gi,"").replace(/<\/p>/gi,"<br/><br/>");
        }

        var passageArray = origPassage.split(pageXML.getAttribute("mainDelimiter") != undefined && $.trim(pageXML.getAttribute("mainDelimiter")) != "" ? pageXML.getAttribute("mainDelimiter") : "|"),
            markedWord = false,
            i;

        state.answerData = []; // contains array of possible correct texts for blanks
        state.allDropDownAnswers = [];

        var dropDownDelimiter,
            dropDownNoise;
        if (pageXML.getAttribute("interactivity") == "Drop Down Menu") {
            dropDownDelimiter = pageXML.getAttribute("dropDownDelimiter") != undefined && pageXML.getAttribute("dropDownDelimiter") != "" ? pageXML.getAttribute("dropDownDelimiter")  : "/";

            if (pageXML.getAttribute("noise") != undefined && pageXML.getAttribute("noise") != "") {
                var noiseDelimiter = pageXML.getAttribute("noiseDelimiter") != "" && pageXML.getAttribute("noiseDelimiter") != undefined ? pageXML.getAttribute("noiseDelimiter") : " ";
                dropDownNoise = pageXML.getAttribute("noise").split(noiseDelimiter);
            }
        }

        // add aria-label to answer box input/selects
        var answerFieldLabel = pageXML.getAttribute("answerFieldLabel");
        if (answerFieldLabel === undefined | answerFieldLabel === null) {
            answerFieldLabel = "Answer";
        }

        // add passage with spaces/comboboxes for marked words
        var gapFillStr = "",
            decodedAnswer;

        for (var i=0; i<passageArray.length; i++) {
            if (markedWord == false) {
                gapFillStr += '<span tabindex="0">' + passageArray[i] + '</span>';
                markedWord = true;
            } else {
                decodedAnswer = $("<textarea/>").html(passageArray[i]).text();
                //reminder
                if (pageXML.getAttribute("interactivity") == "Drag Drop") {
                    gapFillStr += '<span id="gap' + (i-1)/2 + '" class="target highlight" tabindex="0">' + decodedAnswer + '</span>';
                    state.answerData.push(decodedAnswer.split(state.delimiter));

                } else if (pageXML.getAttribute("interactivity") == "Drop Down Menu") {

                    var answer = $("<div>").html(decodedAnswer).text();
                    var allAnswers = answer.split(dropDownDelimiter);
                    state.answerData.push(allAnswers[0].split(state.delimiter));

                    // options in combo boxes include all correct answers (1st answers separated by gapFillModelState.delimiter ","), all incorrect answers (subsequent answers separated by dropDownDelimiter "/") & all noise answers (separated by noiseDelimiter)
                    // e.g. dog,cat/fish/bird - where dog & cat are possible correct answers & fish & bird are distractors
                    allAnswers = allAnswers.concat(allAnswers[0].split(state.delimiter));
                    allAnswers.splice(0,1);
                    if (dropDownNoise != undefined) {
                        allAnswers = allAnswers.concat(dropDownNoise);
                    }

                    var dropDownSort = pageXML.getAttribute("dropDownSort");
                    if (dropDownSort != undefined && dropDownSort != "" && dropDownSort != "alphabetic") // must be random
                        allAnswers.sort(
                            function() { return 0.5 - Math.random(); }
                        );
                    else
                        allAnswers.sort();

                    for (var j=0; j<allAnswers.length; j++) {
                        while (allAnswers[j] == allAnswers[j+1]) {
                            allAnswers.splice(j+1,1);
                        }
                    }

                    state.allDropDownAnswers.push(allAnswers);
                    gapFillStr += '<select id="gap' + (i-1)/2 + '" class="menu" tabindex="0" aria-label="' + answerFieldLabel + ' ' + (1+(i-1)/2) + '">';
                    gapFillStr += '<option value=" "> </option>';
                    for (var j=0; j<allAnswers.length; j++) {
                        gapFillStr += '<option value="' + allAnswers[j] + '">' + allAnswers[j] + '</option>';
                    }
                    gapFillStr += '</select>';

                } else { // fill in the blank

                    var answer = $("<div>").html(decodedAnswer).text();
                    gapFillStr += '<input type="text" id="gap' + (i-1)/2 + '" value="' + answer + '" tabindex="0" aria-label="' + answerFieldLabel + ' ' + (1+(i-1)/2) + '" autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false" />';

                    var tempArray = [];
                    tempArray = answer.split(state.delimiter);

                    state.casesensitive = pageXML.getAttribute("casesensitive") != "true" && pageXML.getAttribute("casesensitive") != "1" ? false : true;

                    if (!state.casesensitive) {
                        for (var j=0; j < tempArray.length; j++) {
                            tempArray[j] = tempArray[j].toLowerCase();
                        }
                    }
                    state.answerData.push(tempArray);
                }
                markedWord = false;
            }
        }

        var $gapFillTxt = $('<div>' + gapFillStr + '</div>').appendTo($targetHolder);
        $gapFillTxt.find("span.target, input").each(function(i) {
            var $this = $(this);
            if (pageXML.getAttribute("interactivity") == "Drag Drop") {
                $this.data("answer", $this.html());
                var	answers = $this.html().split(state.delimiter),
                    longest = answers.sort(function (a, b) { return b.length - a.length; })[0];
                $this.html(longest);

            } else if (pageXML.getAttribute("interactivity") != "Drop Down Menu") { // text fill in blank
                var	answers = $this.attr("value").split(state.delimiter),
                    longest = answers.sort(function (a, b) { return b.length - a.length; })[0];
                $this.attr("value", longest);
            }
        });

        if (pageXML.getAttribute("interactivity") == "Drag Drop") {
            this.setUpDragDrop(blockid);
        } else if (pageXML.getAttribute("interactivity") == "Drop Down Menu") {
            this.setUpDropDown(blockid);
        } else { // text fill in blank
            this.setUpFillBlank(blockid);
        }

        $feedbackTxt
            .hide()
            .find(".txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));

        if (pageXML.getAttribute("audioFeedback") != "" && pageXML.getAttribute("audioFeedback") != undefined) {
            $audioHolder.mediaPlayer({
                type	:"audio",
                source	:pageXML.getAttribute("audioFeedback"),
                width	:"100%"
            });

            $audioHolder.hide();

        } else {
            $audioHolder.remove();
        }

        // Enter the interactions for this page.
        var interactionNumber,
            name,
            correctAnswer,
            correctAnswers,
            correctOption,
            correctOptions;
        if(pageXML.getAttribute("interactivity") == "Fill in Blank"){
            for (interactionNumber=0;  interactionNumber<state.answerData.length;  interactionNumber++) {
                name = "interaction number" + " " + interactionNumber;
                correctAnswer = state.answerData[interactionNumber];
                XTEnterInteraction(x_currentPage,  blocknr , 'fill-in', name, [], correctAnswer, "Correct", pageXML.getAttribute("grouping"), null, interactionNumber);
                XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'fill-in', weighting, interactionNumber);
                XTSetLeavePage(x_currentPage, blocknr, this.leavePage);
                XTSetInteractionPageXML(x_currentPage, blocknr, pageXML, interactionNumber);
                XTSetInteractionModelState(x_currentPage, blocknr, state, interactionNumber);
            }
        }
        else if(pageXML.getAttribute("interactivity") == "Drag Drop"){
            correctAnswers = [];
            correctOptions = [];
            name = pageXML.getAttribute("name");
            if (pageXML.getAttribute("trackinglabel") != null && pageXML.getAttribute("trackinglabel") != "")
            {
                name = pageXML.getAttribute("trackinglabel");
            }
            for (interactionNumber=0;  interactionNumber<state.answerData.length;  interactionNumber++) {
                correctAnswer = state.answerData[interactionNumber][0];
                correctAnswer = correctAnswer + "-->" + correctAnswer;
                correctAnswers.push(correctAnswer);
                correctOption = {source: state.answerData[interactionNumber][0], target: state.answerData[interactionNumber][0]}
                correctOptions.push(correctOption);
            }
            
            XTEnterInteraction(x_currentPage,  blocknr , 'match', name, correctOptions, correctAnswers, "", pageXML.getAttribute("grouping"), null);
            XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'match', weighting);
            XTSetLeavePage(x_currentPage, blocknr, this.leavePage);
            XTSetInteractionPageXML(x_currentPage, blocknr, pageXML)
            XTSetInteractionModelState(x_currentPage, blocknr, state)
        }
        else{ // drop down menu
            for (interactionNumber=0;  interactionNumber<state.answerData.length;  interactionNumber++) {
                correctAnswers = [];
                correctOptions = [];
                name = "interaction number" + " " + interactionNumber;
                for (var i=0; i<state.answerData[interactionNumber].length; i++) {
                    correctAnswers.push(state.answerData[interactionNumber][i]);
                }
                for (var i=0; i<state.allDropDownAnswers[interactionNumber].length; i++)
                {
                    var correctAnswer = false;
                    var p = state.answerData[interactionNumber].indexOf(state.allDropDownAnswers[interactionNumber][i]);
                    if (p >=0)
                    {
                        correctAnswer = true;
                    }

                    correctOptions.push({
                        id: (i + 1) + "",
                        answer: state.allDropDownAnswers[interactionNumber][i],
                        result: correctAnswer
                    });
                }
                XTEnterInteraction(x_currentPage,  blocknr , 'multiplechoice', name, correctOptions, correctAnswers, "Correct", pageXML.getAttribute("grouping"), null, interactionNumber);
                XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'multiplechoice', weighting, interactionNumber);
                XTSetLeavePage(x_currentPage, blocknr, this.leavePage);
                XTSetInteractionPageXML(x_currentPage, blocknr, pageXML, interactionNumber);
                XTSetInteractionModelState(x_currentPage, blocknr, state, interactionNumber);
            }
        }

// start tracking
        this.initTracking(blockid);
        this.sizeChanged(blockid);
        x_pageLoaded();
    }

    this.setUpDropDown = function(blockid) {
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        const state = x_getPageDict("state",blockid);
        let pageXML = x_getBlockXML(blockid);
        jGetElement(blockid, ".labelHolder").remove();

        if (pageXML.getAttribute("spaceLines") != "false") {
            $targetHolder.find("span").css("line-height", $targetHolder.find("select").outerHeight() + 12 + "px");
        }

        jGetElement(blockid, ".submitBtn")
            .button({
                label:	pageXML.getAttribute("checkBtn") != undefined && pageXML.getAttribute("checkBtn") != "" ? pageXML.getAttribute("checkBtn") : "Check"
            })
            .click(function() {
                gapFillBlock.dropDownSubmit(false, blockid);
            });

        jGetElement(blockid, ".showBtn")
            .button({
                label:	pageXML.getAttribute("showBtn") != undefined && pageXML.getAttribute("showBtn") != "" ? pageXML.getAttribute("showBtn") : "Show Answers"
            })
            .click(function() {
                $targetHolder.find("select").each(function(i) {
                    var $this = $(this);
                    if ($.inArray($this.val(), state.answerData[i]) != -1) {
                        $this.attr("disabled", "disabled");
                    } else {
                        $this
                            .val(state.answerData[i][0])
                            .attr("disabled", "disabled")
                            .addClass("answerShown");
                    }

                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFillBlock.audioFbResize(true, blockid);
                });

                $(this).hide();
                jGetElement(blockid, ".submitBtn").hide();

                state.finished = true;
            });

        $targetHolder.find("select").on("change", function() {
            $feedbackTxt.hide();
        });
    }

    this.setUpFillBlank = function(blockid) {
        let $pageContents = jGetElement(blockid, ".pageContents");
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        const state = x_getPageDict("state",blockid);
        let pageXML = x_getBlockXML(blockid);

        jGetElement(blockid, ".labelHolder").remove();

        if (pageXML.getAttribute("spaceLines") != "false") {
            $targetHolder.find("span").css("line-height", $targetHolder.find("input").outerHeight() + 12 + "px");
        }

        var	maxW = 0,
            i;
        for (i=0; i<$targetHolder.find("input").length; i++) {
            maxW = Math.max(maxW, $targetHolder.find("input:eq(" + i + ")").val().length);
        }

        $targetHolder.find("input")
            .attr({
                "size"		:maxW + 2,
                "maxlength"	:maxW + 2,
                "value"		:""
            })
            .each(function() {
                $(this).data("index", $targetHolder.find("input").index($(this))); // stored here as using .index() won't return result needed as there are other elements (line breaks etc.) in $targetHolder
            });

        if ((pageXML.getAttribute("markEnd") == undefined || pageXML.getAttribute("markEnd") == "false") && !state.isTracked) {
            jGetElement(blockid, ".submitBtn, .showBtn").remove();

            $targetHolder.find("input")
                .addClass("incorrect")
                .on("keypress", function() {
                    const state = x_getPageDict("state",blockid)
                    if (state.finished == false) {
                        var $this = $(this);
                        setTimeout(function() {
                            pageXML = x_getBlockXML(x_getBlockNr(blockid));
                            var currvalue = !state.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();
                            if (state.answerData[$this.data("index")].indexOf(currvalue) != -1) { // correct
                                $this
                                    .attr("readonly", "readonly")
                                    .addClass("correct")
                                    .removeClass("incorrect");

                                $pageContents.find("#hint").remove();

                                if ($targetHolder.find("input.correct").length == $targetHolder.find("input").length) {
                                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                                    $feedbackTxt.fadeIn();
                                    gapFillBlock.audioFbResize(true, blockid);
                                }


                                state.correct_answers++;
                                state.total++;
                                var result = {
                                    success: true,
                                    score: 100.0
                                };
                                let answer = !state.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();

                                XTExitInteraction(x_currentPage, x_getBlockNr(blockid) , result, [], answer, "Correct", $this.data("index"), pageXML.getAttribute("trackinglabel"));
                                XTSetInteractionModelState(x_currentPage, x_getBlockNr(blockid), state, $this.data("index"));
                            } else { // wrong - start showing hint after 3 wrong characters entered - this only gives hint if there's only 1 possible correct answer for the gap
                                if (pageXML.getAttribute("showHint") != "false") {
                                    var wrong = 0;
                                    for (i=0; i<$this.val().length; i++) {
                                        if (state.answerData[$this.data("index")].length == 1 && (i+1 > state.answerData[$this.data("index")][0].length || currvalue[i] != state.answerData[$this.data("index")][0][i])) {
                                            wrong++;
                                        }
                                    }

                                    if (wrong > 0) {
                                        if ($this.data("attempt") == undefined) {
                                            $this.data("attempt", 1);

                                        } else if ($this.data("attempt") >= (pageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(pageXML.getAttribute("attemptsBeforeHint")) ? Number(pageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                                            // show hint - add extra letter at every other wrong answer
                                            $this.data("attempt", $this.data("attempt")+1);
                                            if ($this.data("attempt") % 2 != 0) { // odd num
                                                var currentHint = $this.data("hint"),
                                                    correctAnswer = state.answerData[$this.data("index")][0]

                                                if (currentHint == undefined) { // show 1st letter
                                                    currentHint = "";
                                                    for (i=0; i<correctAnswer.length; i++) {
                                                        if (i == 0) {
                                                            currentHint += correctAnswer[i];
                                                        } else {
                                                            currentHint += "_";
                                                        }
                                                    }

                                                } else if (currentHint[currentHint.length - 1] == "_") { // then last letter
                                                    currentHint = currentHint.substring(0, currentHint.length - 1) + correctAnswer[correctAnswer.length - 1];

                                                } else { // then random letter in between
                                                    var blanks = currentHint.match(/_/g); // num of blanks

                                                    if (blanks != null && blanks.length >= 1) {
                                                        var	letterToShow = Math.floor(Math.random() * blanks.length),
                                                            tempCount = 0;
                                                        for (i=0; i<currentHint.length; i++) {
                                                            if (currentHint[i] == "_" && tempCount == letterToShow) {
                                                                currentHint = currentHint.substring(0, i) + correctAnswer[i] + currentHint.substring(i + 1, currentHint.length);
                                                                break;
                                                            } else if (currentHint[i] == "_") {
                                                                tempCount++;
                                                            }
                                                        }
                                                    }
                                                }

                                                $this
                                                    .data("hint", currentHint)
                                                    .attr("title", currentHint);
                                                var $hint = $pageContents.find("#hint");
                                                if ($hint.length < 1) {
                                                    $pageContents.append('<div id="hint" class="x_tooltip"></div>');
                                                    $hint = $pageContents.find("#hint");
                                                }
                                                $hint.html(currentHint);

                                                $hint.css({
                                                    top	 :$this.position().top + parseInt(jGetElement(blockid, ".mainPanel").css("padding-top")) + parseInt($this.css("margin-top")) + $this.height() + 10,
                                                    left :$this.position().left + parseInt(jGetElement(blockid, ".mainPanel").css("padding-left")) + 5
                                                });
                                            }

                                        } else {
                                            $this.data("attempt", $this.data("attempt")+1);
                                        }
                                    }
                                }
                            }
                        }, 10);
                    }
                });

        } else {
            // when mark at end have show answers button instead of a hint
            $targetHolder.find("input")
                .on("keypress focus", function() {
                    $(this).removeAttr("incorrect");
                });

            jGetElement(blockid, ".submitBtn")
                .button({
                    label:	pageXML.getAttribute("checkBtn") != undefined && pageXML.getAttribute("checkBtn") != "" ? pageXML.getAttribute("checkBtn") : "Check"
                })
                .click(function() {
                    gapFillBlock.fillInSubmit(blockid);
                });

            jGetElement(blockid, ".showBtn")
                .button({
                    label:	pageXML.getAttribute("showBtn") != undefined && pageXML.getAttribute("showBtn") != "" ? pageXML.getAttribute("showBtn") : "Show Answers"
                })
                .click(function() {
										const state = x_getPageDict("state",blockid);
                    $targetHolder.find("input").each(function() {
                        var $this = $(this),
                            currvalue = !state.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();

                        if (state.answerData[$this.data("index")].indexOf(currvalue) != -1) {
                            $this.attr("readonly", "readonly");
                            $this.attr("correct", "correct");
                        } else {
                            $this.val(state.answerData[$this.data("index")][0]);
                            $this
                                .addClass("answerShown")
                                .attr("readonly", "readonly");
                        }
                    });

                    $(this).hide();
                    jGetElement(blockid, ".submitBtn").hide();
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFillBlock.audioFbResize(true, blockid);

                    state.finished = true;
                });
        }

        $targetHolder.find("input").on("keypress", function() {
						const state = x_getPageDict("state",blockid);
            if (state.finished == false) {
                $feedbackTxt.hide();
            }
        });
    }

    this.setUpDragDrop = function(blockid) {
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        const state = x_getPageDict("state",blockid);
        let pageXML = x_getBlockXML(blockid);
        
        let blocknr = x_getBlockNr(blockid);
        // if mark at end is off but tracking is on then it will mark at end anyway
        if (!state.isTracked && (pageXML.getAttribute("markEnd") == undefined || pageXML.getAttribute("markEnd") == "false")) {
            jGetElement(blockid, ".submitBtn").hide();

        } else {
            jGetElement(blockid, ".submitBtn")
                .button({
                    label:	pageXML.getAttribute("checkBtn") != undefined && pageXML.getAttribute("checkBtn") != "" ? pageXML.getAttribute("checkBtn") : "Check"
                })
                .click(function() {
                    gapFillBlock.dragDropSubmit(false, blockid);
                });

            jGetElement(blockid, ".showBtn")
                .button({
                    label:	pageXML.getAttribute("showBtn") != undefined && pageXML.getAttribute("showBtn") != "" ? pageXML.getAttribute("showBtn") : "Show Answers"
                })
                .click(function() {
										const state = x_getPageDict("state",blockid);
                    var $incorrectTargets = jGetElement(blockid, ".targetHolder .target").filter(function () {
                        return $(this).data("correct") != true;
                    });

                    $incorrectTargets
                        .addClass("answerShown")
                        .removeClass("highlight highlightDark ui-state-disabled")
                        .removeAttr("title")
                        .off("keypress focusin focusout")
                        .each(function() {
                            $(this).html($(this).data("answer"));
                        });

                    jGetElement(blockid, ".labelHolder").hide();

                    $(this).hide();
                    jGetElement(blockid, ".submitBtn").hide();
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFillBlock.audioFbResize(true, blockid);

                    state.finished = true;
                });
        }

        // store strings used to give titles to labels and targets when keyboard is being used (for screen readers)
        state.labelTxt1 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "name", "Draggable Item");
        state.labelTxt2 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "selected", "Item Selected");
        state.labelTxt3 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "toSelect", "Press space to select");
        state.targetTxt1 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "description", "Drop zone for");
        state.targetTxt2 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "toSelect", "Press space to drop the selected item.");
        
        // set up targets
        var	maxW = 0,
            i;
        for (i=0; i<$targetHolder.find(".target").length; i++) {
						let elem = $targetHolder.find(".target:eq(" + i + ")").clone().appendTo($('body'));
            maxW = Math.max(maxW, elem.width());
						elem.remove();
        }

        $($targetHolder.find(".target")).each(function(i) {
            $(this)
                .attr("title", state.targetTxt1 + " " + (i + 1))
                .data("index", i); // stored here as using .index() won't return result needed as there are other elements (line breaks etc.) in $targetHolder
        });
        //reminder
				let elem = $targetHolder.find(".target").clone().appendTo($('body'));
        let height = elem.height() + 10;
				elem.remove();

        $targetHolder.find(".target")
            .css({
                "width":maxW + 30,
                "height": "" + height + "px",
                "line-height": height + "px"
            })
            .html("")
            .droppable({
                drop:	function(event, ui) {
                    gapFillBlock.dropLabel($(this), ui.draggable, blockid); // target, label
                }
            });

        if (pageXML.getAttribute("spaceLines") != "false") {
            $targetHolder.find("span:not(.target)").css("line-height", parseInt($targetHolder.find(".target").css("line-height")) + 10 + "px");
        }

        this.setUpTargetListeners($targetHolder.find(".target"), blockid);

        var allLabels = state.answerData.slice();

        // set up labels
        if (pageXML.getAttribute("noise") != undefined && pageXML.getAttribute("noise") != "") { // save distractor data
            var noiseDelimiter = pageXML.getAttribute("noiseDelimiter") != "" && pageXML.getAttribute("noiseDelimiter") != undefined ? pageXML.getAttribute("noiseDelimiter") : " ",
                distractors = pageXML.getAttribute("noise").split(noiseDelimiter);
            for (i=0; i<distractors.length; i++) { // add distractors
                allLabels.push([distractors[i]]);
            }
        }

        // create labels and then randomise them
        var	tempMultiAnswers = [];

        for (i=0; i<allLabels.length; i++) {
            var arrayString = "";
            for (var j=0; j<allLabels[i].length; j++) {
                if (j != 0) {
                    arrayString += state.delimiter;
                }
                arrayString += allLabels[i][j];
            }

            // where there are multiple gaps where the answers can be placed in any order, only create the labels for these once
            if (tempMultiAnswers.indexOf(arrayString) == -1) {
                for (var j=0; j<allLabels[i].length; j++) {
                    $('<div class="label panel" title="' + state.labelTxt1 + '">' + allLabels[i][j] + '</div>')
                        .appendTo(jGetElement(blockid, ".labelHolder"))
                        .data("answer", arrayString);
                }
                if (allLabels[i].length > 1) {
                    tempMultiAnswers.push(arrayString);
                }
            }
        }

        var labels = jGetElement(blockid, ".labelHolder .label").sort(function() { return (Math.round(Math.random())-0.5); });
        for (var i=0; i<labels.length; i++) {
            $(labels[i])
                .appendTo(jGetElement(blockid, ".labelHolder"))
                .attr({
                    "id": "index" + i,
                    "tabindex":	0
                });
        }

        // set up drag events (mouse and keyboard controlled)
        jGetElement(blockid, ".dragDropHolder .label")
            .draggable({
                containment:	".dragDropHolder .block" + blocknr,
                stack:			".dragDropHolder .label", // item being dragged is always on top (z-index)
                revert:			"invalid", // snap back to original position if not dropped on target
                start:			function() {
                    // remove any focus/selection highlights made by tabbing to labels/targets
                    if (jGetElement(blockid, ".labelHolder .label.focus").length > 0) {
                        jGetElement(blockid, ".labelHolder .label.focus").attr("title", state.labelTxt1);
                    }
                    if (state.selectedLabel != undefined && state.selectedLabel != "") {
                        state.selectedLabel.attr("title", state.labelTxt1);
                        state.selectedLabel = "";
                    }
                    var targetInFocus = jGetElement(blockid, ".targetHolder .target.highlightDark");
                    if (targetInFocus.length > 0) {
                        targetInFocus.attr("title", state.targetTxt1 + " " + (targetInFocus.index() + 1));
                    }
                    jGetElement(blockid, ".dragDropHolder .selected").removeClass("selected");
                    jGetElement(blockid, ".dragDropHolder .focus").removeClass("focus");
                    jGetElement(blockid, ".dragDropHolder .highlightDark").removeClass("highlightDark");
                }
            })
            .disableSelection();

				this.setUpLabelListeners(jGetElement(blockid, ".dragDropHolder .label"), blockid);

        for (i=0; i<jGetElement(blockid, ".targetHolder .target").length; i++) {
            jGetElement(blockid, ".targetHolder .target:eq(" + i + ")").droppable({
                accept:	(!state.isTracked && (pageXML.getAttribute("markEnd") == undefined || pageXML.getAttribute("markEnd") == "false")) ?
                    jGetElement(blockid, ".labelHolder .label").filter(function() {
                        return $(this).data("answer") == jGetElement(blockid, ".targetHolder .target:eq(" + i + ")").data("answer");
                    }) : jGetElement(blockid, ".labelHolder .label")
            });
        }
    }

    // function called when label dropped on target - by mouse or keyboard
    this.dropLabel = function($thisTarget, $thisLabel, blockid) {
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        const state = x_getPageDict("state",blockid)
        let pageXML = x_getBlockXML(blockid);
        $feedbackTxt.hide();

        $thisLabel
            .removeAttr("title")
            .removeClass("selected")
            .draggable("disable")
            .off("keypress focusin focusout")
            .css("opacity", 0);

        if (state.isTracked || pageXML.getAttribute("markEnd") == "true") {
            if ($thisLabel.data("answer") == $thisTarget.data("answer")) {
                state.score++;
                $thisLabel.add($thisTarget).data("correct", true);
            }
        } else {
            $thisTarget.addClass("correct");
            if ($thisLabel.data("answer") == $thisTarget.data("answer")) {
                state.score++;
                $thisLabel.add($thisTarget).data("correct", true);
            }
        }

        $thisTarget
            .removeAttr("title")
            .html($thisLabel.html())
            .off("keypress focusin focusout")
            .droppable("option", "disabled", true)
            .removeClass("highlight highlightDark ui-state-disabled");

        state.selectedLabel = "";
        state.labelAnswers[$thisTarget.data("answer")] = $thisLabel.data("answer");

        // if it's marked as completed (can only drop on correct targets) then show feedback immediately when complete
        if (!state.isTracked && (pageXML.getAttribute("markEnd") != "true" && $targetHolder.find(".target.highlight").length == 0)) {
            jGetElement(blockid, ".labelHolder").hide();
            jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
            $feedbackTxt.fadeIn();
            gapFillBlock.audioFbResize(true, blockid);
            gapFillBlock.dragDropSubmit(false, blockid);
            //reminder
        }
        XTSetInteractionModelState(x_currentPage, x_getBlockNr(blockid), state)
    }

    // set up events used when keyboard rather than mouse is used
    this.setUpTargetListeners = function($targets, blockid) {
        $targets
            .focusin(function (e) {
                return targetFocusIn(e, blockid);
            })
            .focusout(function (e) {
                return targetFocusOut(e, blockid);
            })
            .keypress(function (e) {
                return targetKeyPress(e, blockid);
            });
    }

    var targetFocusIn = function(e, blockid) {
        const state = x_getPageDict("state",blockid);
        var $this = $(this);
        $this.addClass("highlightDark");
        if (state.selectedLabel != undefined && state.selectedLabel != "") {
            $this.attr("title", state.targetTxt1 + " " + ($this.data("index") + 1) + " - " + state.targetTxt2);
        }
    }

    var targetFocusOut = function(e, blockid) {
        const state = x_getPageDict("state",blockid);
        var $this = $(this);
        $this
            .removeClass("highlightDark")
            .attr("title", state.targetTxt1 + " " + ($this.data("index") + 1));
    }

    var targetKeyPress = function(e, blockid) {
        const state = x_getPageDict("state",blockid);
        var charCode = e.charCode || e.keyCode;
        if (charCode == 32) {
            var $selectedLabel = state.selectedLabel;
            if ($selectedLabel != undefined && $selectedLabel != "") {
                if (state.answerData[$(this).data("index")].indexOf($selectedLabel.html()) != -1 || (pageXML.getAttribute("markEnd") != undefined && pageXML.getAttribute("markEnd") != "false") || (state.isTracked)) {
                    gapFillBlock.dropLabel($(this), $selectedLabel, blockid); // target, label
                } else {
                    $(this).attr("title", state.targetTxt1 + " " + ($(this).data("index") + 1));
                    $selectedLabel
                        .removeClass("selected")
                        .attr("title", state.labelTxt1);
                    state.selectedLabel = "";
                }
            }
        }
    }

    // set up events used when keyboard rather than mouse is used
    this.setUpLabelListeners = function($labels, blockid) {
        // highlight selected labels / targets and set the title attr which the screen readers will use
        $labels
            .focusin(labelFocusIn.bind(null, blockid))
            .focusout(labelFocusOut.bind(null, blockid))
            .keypress(labelKeyPress.bind(null, blockid));
    }

    var labelFocusIn = function(blockid, e) {
        const state = x_getPageDict("state",blockid);
        var $this = $(this);
        if ($this.is(state.selectedLabel) == false) {
            $this
                .addClass("focus")
                .attr("title", state.labelTxt1 + " - " + state.labelTxt3);
        }
    }

    var labelFocusOut = function(blockid, e) {
        const state = x_getPageDict("state",blockid);
        var $this = $(this);
        $this.removeClass("focus");
        if ($this.is(state.selectedLabel) == false) {
            $this.attr("title", state.labelTxt1);
        }
    }

    var labelKeyPress = function(blockid, e) {
        const state = x_getPageDict("state",blockid);
        var charCode = e.charCode || e.keyCode;
        if (charCode == 32) {
            if (state.selectedLabel != undefined && state.selectedLabel != "") {
                state.selectedLabel
                    .removeClass("selected")
                    .attr("title", state.labelTxt1);
            }
            var $this = $(this);
            $this
                .removeClass("focus")
                .addClass("selected")
                .attr("title", state.labelTxt1 + ' - ' + state.labelTxt2);
            state.selectedLabel = $this;
        }
    };

    this.dropDownSubmit = function(forced, blockid) {
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        const state = x_getPageDict("state",blockid)
        let pageXML = x_getBlockXML(blockid);
        let blocknr = x_getBlockNr(blockid);

        // no answers given
        if ($targetHolder.find('select option:selected[value=" "]').parent().length == $targetHolder.find('select').length) {
            // prompt to complete exercise unless this has been triggered by leaving the page
            if (forced != true) {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillIncomplete") != undefined && pageXML.getAttribute("gapFillIncomplete") != "" ? pageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }

            // an attempt (even if partial) has been made
        } else {
            // mark exercise (unless force tracking mode is on & exercise is incomplete)
            if ($targetHolder.find('select option:selected[value=" "]').parent().length == 0 || !state.isTracked) {
                var wrong = 0,
                    correct,
                    result,
                    answer,
                    answers,
                    options;

                state.total = 0;
                state.correct_answers = 0;

                $targetHolder.find("select").each(function(i) {
                    var $this = $(this);
                    answers = [];
                    options = [];
                    answer = $this.val();
                    state.total++;

                    if ($.inArray($this.val(), state.answerData[i]) != -1) {
                        $this
                            .attr("disabled", "disabled")
                            .addClass('correct');
                        correct = true;
                        state.correct_answers++;
                    } else {
                        wrong++;
                        correct = false;
                    }
                    answers.push(answer);
                    result = {
                        success: correct,
                        score: (correct ? 100.0 : 0.0)
                    };
                    // Loop over options
                    $this.find(":selected").each(function(j) {
                        $this = $(this);
                        options.push({
                            id: $.inArray($this.val(), state.allDropDownAnswers[i]) + 1 + "",
                            answer: $this.val(),
                            result: ($.inArray($this.val(), state.answerData[i]) != -1)
                        });
                    });

                    XTExitInteraction(x_currentPage, blocknr, result, options, answers, [], i, pageXML.getAttribute("trackinglabel"));
                });

                gapFillBlock.finishTracking(blockid);

                if (wrong == 0) { // all correct
                    jGetElement(blockid, ".submitBtn, .showBtn").hide();
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFillBlock.audioFbResize(true, blockid);

                    state.finished = true;

                } else {
                    if (pageXML.getAttribute("showHint") != "false") {
                        $targetHolder.find("select").each(function() {
                            if ($(this).val() != " ") {
                                state.attempts++;
                                if (state.attempts >= (pageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(pageXML.getAttribute("attemptsBeforeHint")) ? Number(pageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                                    jGetElement(blockid, ".showBtn").show();
                                }
                                return false;
                            }
                        });
                    }

                    // show feedback - might be different if tracking on/off
                    var gapFillWrong = x_addLineBreaks(pageXML.getAttribute("gapFillWrong") != undefined && pageXML.getAttribute("gapFillWrong") != "" ? pageXML.getAttribute("gapFillWrong") : "You have not filled any gaps correctly. Try again."),
                        gapFillPartWrong = x_addLineBreaks(pageXML.getAttribute("gapFillPartWrong") != undefined && pageXML.getAttribute("gapFillPartWrong") != "" ? pageXML.getAttribute("gapFillPartWrong") : "Your correct answers are shown in green. Try again with those you have got wrong.");

                    if (state.isTracked) {
                        gapFillWrong = x_addLineBreaks(pageXML.getAttribute("gapFillWrongTracking") != undefined && pageXML.getAttribute("gapFillWrongTracking") != "" ? pageXML.getAttribute("gapFillWrongTracking") : "You have not filled any gaps correctly.");
                        gapFillPartWrong = x_addLineBreaks(pageXML.getAttribute("gapFillPartWrongTracking") != undefined && pageXML.getAttribute("gapFillPartWrongTracking") != "" ? pageXML.getAttribute("gapFillPartWrongTracking") : "Your correct answers are shown in green.");

                        jGetElement(blockid, ".submitBtn").hide();
                        jGetElement(blockid, ".showBtn").show();
                        state.finished = true;

                        $targetHolder.find("select").each(function(i) {
                            $(this).attr("disabled", "disabled");
                        });
                    }

                    if (wrong == $targetHolder.find("select").length) {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + gapFillWrong + '</p>');
                    } else {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + gapFillPartWrong + '</p>');
                    }
                    $feedbackTxt.fadeIn();
                }

                // if force tracking mode is on then you must fully complete before checking answers
            } else {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillIncomplete") != undefined && pageXML.getAttribute("gapFillIncomplete") != "" ? pageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }
        }
    };

    this.fillInSubmit = function(forced, blockid){
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        const state = x_getPageDict("state",blockid);
        let pageXML = x_getBlockXML(blockid);
        let blocknr = x_getBlockNr(blockid);
        // no answers given
        if ($targetHolder.find("input").filter(function() { return $(this).val() != ""; }).length == 0) {
            // prompt to complete exercise unless this has been triggered by leaving the page
            if (forced != true) {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillIncomplete") != undefined && pageXML.getAttribute("gapFillIncomplete") != "" ? pageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }

            // an attempt (even if partial) has been made
        } else {
            // mark exercise (unless force tracking mode is on & exercise is incomplete)
            if ($targetHolder.find("input").filter(function() { return $(this).val() == ""; }).length == 0 || !state.isTracked) {
                if (pageXML.getAttribute("showHint") != "false") {
                    state.attempts++;
                    if (state.attempts >= (pageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(pageXML.getAttribute("attemptsBeforeHint")) ? Number(pageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                        jGetElement(blockid, ".showBtn").show();
                    }
                }

                var wrong = 0;
                state.total = 0;
                state.correct_answers = 0;

                $targetHolder.find("input").each(function() {
                    var $this = $(this),
                        currvalue = !state.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();
                    var feedback = "Incorrect";
                    var correct = false;
                    var answer = currvalue;

                    if (state.answerData.length > 0 && state.answerData[$this.data("index")].indexOf(currvalue) != -1) { // correct
                        $this.attr("readonly", "readonly");
                        $this.attr("correct", "correct");
                        $this.addClass("correct");
                        feedback = "Correct";
                        correct = true;
                        state.correct_answers++;

                    } else {
                        if(XTGetMode() == "normal") {
                            $this.attr("readonly", "readonly");
                        }

                        $this.attr("incorrect", "incorrect");
                        wrong++;
                    }

                    state.total++;
                    var result = {
                        success: correct,
                        score: (correct ? 100.0 : 0.0)
                    };

                    XTExitInteraction(x_currentPage, blocknr , result, [], answer, feedback, $this.data("index"), pageXML.getAttribute("trackinglabel"));
                });

                gapFillBlock.finishTracking(blockid);

                // show feedback - might be different if tracking on/off
                var gapFillWrong = x_addLineBreaks(pageXML.getAttribute("gapFillWrong") != undefined && pageXML.getAttribute("gapFillWrong") != "" ? pageXML.getAttribute("gapFillWrong") : "You have not filled any gaps correctly. Try again."),
                    gapFillPartWrong = x_addLineBreaks(pageXML.getAttribute("gapFillPartWrong") != undefined && pageXML.getAttribute("gapFillPartWrong") != "" ? pageXML.getAttribute("gapFillPartWrong") : "Your correct answers are shown in green. Try again with those you have got wrong.");

                if (state.isTracked) {
                    gapFillWrong = x_addLineBreaks(pageXML.getAttribute("gapFillWrongTracking") != undefined && pageXML.getAttribute("gapFillWrongTracking") != "" ? pageXML.getAttribute("gapFillWrongTracking") : "You have not filled any gaps correctly.");
                    gapFillPartWrong = x_addLineBreaks(pageXML.getAttribute("gapFillPartWrongTracking") != undefined && pageXML.getAttribute("gapFillPartWrongTracking") != "" ? pageXML.getAttribute("gapFillPartWrongTracking") : "Your correct answers are shown in green.");

                    state.finished = true;
                }

                if (wrong == 0) {
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                    jGetElement(blockid, ".showBtn,.submitBtn").hide();
                    $feedbackTxt.fadeIn();
                    gapFillBlock.audioFbResize(true, blockid);

                    state.finished = true;

                } else {
                    if (wrong == $targetHolder.find("input").length) {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + gapFillWrong + '</p>');
                    } else {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + gapFillPartWrong + '</p>');
                    }
                    $feedbackTxt.fadeIn();

                    if (state.isTracked) {
                        jGetElement(blockid, ".submitBtn").hide();
                        jGetElement(blockid, ".showBtn").show();
                    }
                }

                // if force tracking mode is on then you must fully complete before checking answers
            } else {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillIncomplete") != undefined && pageXML.getAttribute("gapFillIncomplete") != "" ? pageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }
        }
    };

    this.dragDropSubmit = function(forced, blockid) {
        let $targetHolder = jGetElement(blockid, ".targetHolder");
        let $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        const state = x_getPageDict("state",blockid);
        let pageXML = x_getBlockXML(blockid);
        // no blanks completed
        if ($targetHolder.find(".target:not(.highlight)").length == 0) {
            // prompt to complete exercise unless this has been triggered by leaving the page
            if (forced != true) {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillIncomplete") != undefined && pageXML.getAttribute("gapFillIncomplete") != "" ? pageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }

            // an attempt (even if partial) has been made
        } else {
            // mark exercise (unless force tracking mode is on & exercise is incomplete)
            if ($targetHolder.find(".target.highlight").length == 0 || !state.isTracked) {
                jGetElement(blockid, ".targetHolder .target").filter(function () {
                    return $(this).data("correct") == true;
                }).addClass("correct");

                var $incorrectTargets = jGetElement(blockid, ".targetHolder .target").filter(function () {
                    return !($(this).data("correct") == true || $(this).hasClass("correct")) && !$(this).hasClass("highlight");
                });

                var $incorrectLabels = jGetElement(blockid, ".labelHolder .label").filter(function () {
                    return $(this).data("correct") != true;
                });
								;
                // track before moving back labels or else results page looks like you haven't attempted to answer
                var l_options = [];
                var l_answers = [];
                var feedback = "Correct";
                state.total = 0;
                state.correct_answers = 0;

                for (var interactionNumber = 0; interactionNumber < state.answerData.length; interactionNumber++) {
                    var correctAnswer = state.answerData[interactionNumber][0];
                    var labelSource = state.labelAnswers[correctAnswer];
                    var option = {source: labelSource, target: correctAnswer};
                    l_options.push(option);
                    if (option.source == option.target) {
                        state.correct_answers++;
                    }

                    var l_answer = labelSource + "-->" + correctAnswer;
                    l_answers.push(l_answer);
                    state.total++;
                }
                var correct = (state.total == state.correct_answers);
                var result = {
                    success: correct,
                    score: (correct ? 100.0 : 0.0)
                };
                if (!correct) { feedback = "Incorrect"; }
                XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, l_options, l_answers, feedback);

                gapFillBlock.finishTracking(blockid);

                if (!state.isTracked) {
                    // reset incorrect labels so you can try again
                    $incorrectTargets
                        .html("")
                        .focusin(targetFocusIn)
                        .focusout(targetFocusOut)
                        .keypress(function (e) {
                            return targetKeyPress(e, blockid);
                        })
                        .droppable("option", "disabled", false)
                        .addClass("highlight");

                    $incorrectTargets.each(function() {
                        $(this).attr("title", state.targetTxt1 + " " + ($(this).data("index") + 1));
                        delete state.labelAnswers[$(this).data("answer")];
                    });

                    $incorrectLabels
                        .attr("title", state.labelTxt1)
                        .draggable("option", "disabled", false)
                        .focusin(labelFocusIn)
                        .focusout(labelFocusOut)
                        .keypress(labelKeyPress)
                        .css({
                            "opacity": 1,
                            "left": "auto",
                            "top": "auto"
                        });

                    if ($targetHolder.find(".target.highlight").length == 0) {
                        jGetElement(blockid, ".submitBtn, .showBtn").hide();
                    } else if (pageXML.getAttribute("showHint") != "false") {
                        state.attempts++;
                        if (state.attempts >= (pageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(pageXML.getAttribute("attemptsBeforeHint")) ? Number(pageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                            jGetElement(blockid, ".showBtn").show();
                        }
                    }

                } else {
                    // if tracked then you don't get to try again (is this how it should be?)
                    $incorrectTargets.addClass("incorrect");
                    jGetElement(blockid, ".submitBtn").hide();
                    state.finished = true;

                    if (correct !== true) {
                        jGetElement(blockid, ".showBtn").show();
                    }
                }

                // feedback...
                if (state.score == jGetElement(blockid, ".targetHolder .target").length) {
                    jGetElement(blockid, ".labelHolder").hide();
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFillBlock.audioFbResize(true, blockid);
                    state.finished = true;
                } else {
                    if (state.score == 0) {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillWrongTracking") != undefined && pageXML.getAttribute("gapFillWrongTracking") != "" ? pageXML.getAttribute("gapFillWrongTracking") : "You have not filled any gaps correctly.") + '</p>');
                    } else {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillPartWrongTracking") != undefined && pageXML.getAttribute("gapFillPartWrongTracking") != "" ? pageXML.getAttribute("gapFillPartWrongTracking") : "Your correct answers are shown in green.") + '</p>');
                    }
                    $feedbackTxt.fadeIn();
                }

                // if force tracking mode is on then you must fully complete before checking answers
            } else {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(pageXML.getAttribute("gapFillIncomplete") != undefined && pageXML.getAttribute("gapFillIncomplete") != "" ? pageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }
        }
    }

    //Starting the tracking
    this.initTracking = function(blockid) {
        let pageXML = x_getBlockXML(blockid);
        const state = x_getPageDict("state", blockid);
        // Track the gapfill page
        if (pageXML.getAttribute("interactivity") == "Drop Down Menu" || pageXML.getAttribute("interactivity") == "Fill in Blank")
        {
            // XTSetPageType(x_currentPage, 'numeric', state.answerData.length, this.weighting);
        }
        else { // text fill in blank or drag & drop
            // XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);
        }
    }

    //Stopping the tracking
    this.finishTracking = function(blockid) {

    }
};
