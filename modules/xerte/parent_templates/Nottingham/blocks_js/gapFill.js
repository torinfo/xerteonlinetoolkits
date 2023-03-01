var gapFill = new function() {
    var gapFillModelState = {
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

    var $pageContents,
        $targetHolder,
        $feedbackTxt,
        $audioHolder;

    this.resetModelState = function(){
        gapFillModelState = {
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

    this.refreshPageVariables = function(blockid){
        $pageContents = jGetElement(blockid, ".pageContents");
        $targetHolder = jGetElement(blockid, ".targetHolder");
        $feedbackTxt = jGetElement(blockid, ".feedbackTxt");
        $audioHolder = jGetElement(blockid, ".audioHolder");
    }

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function(blockid) {
        gapFillModelState = XTGetInteractionModelState(x_currentPage, XTGetBlockNr(blockid));
        this.refreshPageVariables(blockid);

        gapFillModelState.casesensitive = $pageContents.data('casesensitive');
        gapFillModelState.answerData = $pageContents.data('answerData');
        gapFillModelState.allDropDownAnswers = $pageContents.data('allDropDownAnswers');
        gapFillModelState.labelAnswers = $pageContents.data('labelAnswers');
        gapFillModelState.finished = $pageContents.data('finished');
        gapFillModelState.score = $pageContents.data('score');
        gapFillModelState.attempts = $pageContents.data('attempts');

        if (XTGetMode() == "normal") { this.isTracked = true; };

        $pageContents.find("#hint").remove();
        XTSetInteractionModelState(x_currentPage, XTGetBlockNr(blockid), gapFillModelState)
    }

    this.leavePage = function(blockid) {
        gapFill.refreshPageVariables(blockid);
        $pageContents.data({
            'casesensitive': gapFillModelState.casesensitive,
            'answerData': gapFillModelState.answerData,
            'allDropDownAnswers': gapFillModelState.allDropDownAnswers,
            'labelAnswers': gapFillModelState.labelAnswers,
            'finished': gapFillModelState.finished,
            'score': gapFillModelState.score,
            'attempts': gapFillModelState.attempts
        });

        if (gapFillModelState.finished == false) {
            if(x_currentPageXML.getAttribute("interactivity") == "Drag Drop")
            {
                gapFill.dragDropSubmit(true, blockid);
            }
            else if(x_currentPageXML.getAttribute("interactivity") == "Fill in Blank")
            {
                gapFill.fillInSubmit(true, blockid);
            }
            else if (x_currentPageXML.getAttribute("interactivity") == "Drop Down Menu")
            {
                gapFill.dropDownSubmit(true, blockid);
            }
        }
    };

    // function called every time the size of the LO is changed
    this.sizeChanged = function(blockid) {
        this.refreshPageVariables(blockid);
        var $panel = jGetElement(blockid, ".mainPanel");

        if (x_browserInfo.mobile == false) {
            $panel.height(Math.max(
                jGetElement(blockid, ".targetHolder").height() + jGetElement(blockid, ".labelHolder").outerHeight(true) + jGetElement(blockid, ".btnHolder").height(),
                $x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5
            ));
        }
        $pageContents.find("#hint").remove();

        if ($audioHolder.length > 0) {
            this.audioFbResize(false, blockid);
        }

        $targetHolder.find("input, select").css("font-size", jGetElement(blockid, ".dragDropHolder").css("font-size"));
    }

    this.audioFbResize = function(show, blockid) {
        this.refreshPageVariables(blockid);
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

    this.init = function(pageXML, blockid) {
        x_currentPageXML = pageXML;
        this.resetModelState();
        this.refreshPageVariables(blockid);

        $dragDropHolder = jGetElement(blockid, ".dragDropHolder");
        $dragDropHolder.addClass(blockid);

        const blocknr = XTGetBlockNr(blockid);

        gapFillModelState.delimiter = x_currentPageXML.getAttribute("answerDelimiter") != undefined && x_currentPageXML.getAttribute("answerDelimiter") != "" ? x_currentPageXML.getAttribute("answerDelimiter")  : ",";

        if(XTGetMode() == "normal") {
            this.isTracked = true;
        } else {
            this.isTracked = false;
        }

        // add aria-label to answer box input/selects
        jGetElement(blockid, ".submitBtn").attr("aria-label", x_currentPageXML.getAttribute("checkBtn") != undefined && x_currentPageXML.getAttribute("checkBtn") != "" ? x_currentPageXML.getAttribute("checkBtn") : "Check");
        jGetElement(blockid, ".showBtn")
            .attr("aria-label", x_currentPageXML.getAttribute("showBtn") != undefined && x_currentPageXML.getAttribute("showBtn") != "" ? x_currentPageXML.getAttribute("showBtn") : "Show Answers")
            .hide();

        // set panel appearance
        var panelWidth = x_currentPageXML.getAttribute("panelWidth");
        if (panelWidth == "Full") {
            jGetElement(blockid, ".mainText").remove();
            jGetElement(blockid, ".dragDropHolder").appendTo($pageContents);
            jGetElement(blockid, ".pageContents .splitScreen").remove();

        } else {
            jGetElement(blockid, ".mainText").html(x_addLineBreaks(x_currentPageXML.getAttribute("text")));
            if (panelWidth == "Small") {
                jGetElement(blockid, ".pageContents .splitScreen").addClass("large"); // make text area on left large so panel on right is small
            } else if (panelWidth == "Large") {
                jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
            } else {
                jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
            }
        }

        var	origPassage = x_addLineBreaks(x_currentPageXML.getAttribute("passage"));

        if (origPassage.indexOf("<p>") != -1){
            origPassage = origPassage.replace(/<p>/gi,"").replace(/<\/p>/gi,"<br/><br/>");
        }

        var passageArray = origPassage.split(x_currentPageXML.getAttribute("mainDelimiter") != undefined && $.trim(x_currentPageXML.getAttribute("mainDelimiter")) != "" ? x_currentPageXML.getAttribute("mainDelimiter") : "|"),
            markedWord = false,
            i;

        gapFillModelState.answerData = []; // contains array of possible correct texts for blanks
        gapFillModelState.allDropDownAnswers = [];

        var dropDownDelimiter,
            dropDownNoise;
        if (x_currentPageXML.getAttribute("interactivity") == "Drop Down Menu") {
            dropDownDelimiter = x_currentPageXML.getAttribute("dropDownDelimiter") != undefined && x_currentPageXML.getAttribute("dropDownDelimiter") != "" ? x_currentPageXML.getAttribute("dropDownDelimiter")  : "/";

            if (x_currentPageXML.getAttribute("noise") != undefined && x_currentPageXML.getAttribute("noise") != "") {
                var noiseDelimiter = x_currentPageXML.getAttribute("noiseDelimiter") != "" && x_currentPageXML.getAttribute("noiseDelimiter") != undefined ? x_currentPageXML.getAttribute("noiseDelimiter") : " ";
                dropDownNoise = x_currentPageXML.getAttribute("noise").split(noiseDelimiter);
            }
        }

        // add aria-label to answer box input/selects
        var answerFieldLabel = x_currentPageXML.getAttribute("answerFieldLabel");
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
                if (x_currentPageXML.getAttribute("interactivity") == "Drag Drop") {
                    gapFillStr += '<span id="gap' + (i-1)/2 + '" class="target highlight" tabindex="0">' + decodedAnswer + '</span>';
                    gapFillModelState.answerData.push(decodedAnswer.split(gapFillModelState.delimiter));

                } else if (x_currentPageXML.getAttribute("interactivity") == "Drop Down Menu") {

                    var answer = $("<div>").html(decodedAnswer).text();
                    var allAnswers = answer.split(dropDownDelimiter);
                    gapFillModelState.answerData.push(allAnswers[0].split(gapFillModelState.delimiter));

                    // options in combo boxes include all correct answers (1st answers separated by gapFillModelState.delimiter ","), all incorrect answers (subsequent answers separated by dropDownDelimiter "/") & all noise answers (separated by noiseDelimiter)
                    // e.g. dog,cat/fish/bird - where dog & cat are possible correct answers & fish & bird are distractors
                    allAnswers = allAnswers.concat(allAnswers[0].split(gapFillModelState.delimiter));
                    allAnswers.splice(0,1);
                    if (dropDownNoise != undefined) {
                        allAnswers = allAnswers.concat(dropDownNoise);
                    }

                    var dropDownSort = x_currentPageXML.getAttribute("dropDownSort");
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

                    gapFillModelState.allDropDownAnswers.push(allAnswers);
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
                    tempArray = answer.split(gapFillModelState.delimiter);

                    gapFillModelState.casesensitive = x_currentPageXML.getAttribute("casesensitive") != "true" && x_currentPageXML.getAttribute("casesensitive") != "1" ? false : true;

                    if (!gapFillModelState.casesensitive) {
                        for (var j=0; j < tempArray.length; j++) {
                            tempArray[j] = tempArray[j].toLowerCase();
                        }
                    }
                    gapFillModelState.answerData.push(tempArray);
                }
                markedWord = false;
            }
        }

        var $gapFillTxt = $('<div>' + gapFillStr + '</div>').appendTo($targetHolder);
        $gapFillTxt.find("span.target, input").each(function(i) {
            var $this = $(this);
            if (x_currentPageXML.getAttribute("interactivity") == "Drag Drop") {
                $this.data("answer", $this.html());
                var	answers = $this.html().split(gapFillModelState.delimiter),
                    longest = answers.sort(function (a, b) { return b.length - a.length; })[0];
                $this.html(longest);

            } else if (x_currentPageXML.getAttribute("interactivity") != "Drop Down Menu") { // text fill in blank
                var	answers = $this.attr("value").split(gapFillModelState.delimiter),
                    longest = answers.sort(function (a, b) { return b.length - a.length; })[0];
                $this.attr("value", longest);
            }
        });

        if (x_currentPageXML.getAttribute("interactivity") == "Drag Drop") {
            this.setUpDragDrop(blockid);
        } else if (x_currentPageXML.getAttribute("interactivity") == "Drop Down Menu") {
            this.setUpDropDown(blockid);
        } else { // text fill in blank
            this.setUpFillBlank(blockid);
        }

        $feedbackTxt
            .hide()
            .find(".txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));

        if (x_currentPageXML.getAttribute("audioFeedback") != "" && x_currentPageXML.getAttribute("audioFeedback") != undefined) {
            $audioHolder.mediaPlayer({
                type	:"audio",
                source	:x_currentPageXML.getAttribute("audioFeedback"),
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
        if(x_currentPageXML.getAttribute("interactivity") == "Fill in Blank"){
            for (interactionNumber=0;  interactionNumber<gapFillModelState.answerData.length;  interactionNumber++) {
                name = "interaction number" + " " + interactionNumber;
                correctAnswer = gapFillModelState.answerData[interactionNumber];
                XTEnterInteraction(x_currentPage,  blocknr , 'fill-in', name, [], correctAnswer, "Correct", x_currentPageXML.getAttribute("grouping"), null, interactionNumber);
                XTSetLeavePage(x_currentPage, blocknr, this.leavePage);
                XTSetInteractionPageXML(x_currentPage, blocknr, x_currentPageXML, interactionNumber);
                XTSetInteractionModelState(x_currentPage, blocknr, gapFillModelState, interactionNumber);
            }
        }
        else if(x_currentPageXML.getAttribute("interactivity") == "Drag Drop"){
            correctAnswers = [];
            correctOptions = [];
            name = x_currentPageXML.getAttribute("name");
            if (x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "")
            {
                name = x_currentPageXML.getAttribute("trackinglabel");
            }
            for (interactionNumber=0;  interactionNumber<gapFillModelState.answerData.length;  interactionNumber++) {
                correctAnswer = gapFillModelState.answerData[interactionNumber][0];
                correctAnswer = correctAnswer + "-->" + correctAnswer;
                correctAnswers.push(correctAnswer);
                correctOption = {source: gapFillModelState.answerData[interactionNumber][0], target: gapFillModelState.answerData[interactionNumber][0]}
                correctOptions.push(correctOption);
            }
            debugger
            XTEnterInteraction(x_currentPage,  blocknr , 'match', name, correctOptions, correctAnswers, "", x_currentPageXML.getAttribute("grouping"), null);
            XTSetLeavePage(x_currentPage, blocknr, this.leavePage);
            XTSetInteractionPageXML(x_currentPage, blocknr, x_currentPageXML)
            XTSetInteractionModelState(x_currentPage, blocknr, gapFillModelState)
        }
        else{ // drop down menu
            for (interactionNumber=0;  interactionNumber<gapFillModelState.answerData.length;  interactionNumber++) {
                correctAnswers = [];
                correctOptions = [];
                name = "interaction number" + " " + interactionNumber;
                for (var i=0; i<gapFillModelState.answerData[interactionNumber].length; i++) {
                    correctAnswers.push(gapFillModelState.answerData[interactionNumber][i]);
                }
                for (var i=0; i<gapFillModelState.allDropDownAnswers[interactionNumber].length; i++)
                {
                    var correctAnswer = false;
                    var p = gapFillModelState.answerData[interactionNumber].indexOf(gapFillModelState.allDropDownAnswers[interactionNumber][i]);
                    if (p >=0)
                    {
                        correctAnswer = true;
                    }

                    correctOptions.push({
                        id: (i + 1) + "",
                        answer: gapFillModelState.allDropDownAnswers[interactionNumber][i],
                        result: correctAnswer
                    });
                }
                XTEnterInteraction(x_currentPage,  blocknr , 'multiplechoice', name, correctOptions, correctAnswers, "Correct", x_currentPageXML.getAttribute("grouping"), null, interactionNumber);
                XTSetLeavePage(x_currentPage, blocknr, this.leavePage);
                XTSetInteractionPageXML(x_currentPage, blocknr, x_currentPageXML, interactionNumber);
                XTSetInteractionModelState(x_currentPage, blocknr, gapFillModelState, interactionNumber);
            }
        }

// start tracking
        this.initTracking(blockid);
        this.sizeChanged(blockid);
        x_pageLoaded();
    }

    this.setUpDropDown = function(blockid) {
        this.refreshPageVariables(blockid);
        jGetElement(blockid, ".labelHolder").remove();

        if (x_currentPageXML.getAttribute("spaceLines") != "false") {
            $targetHolder.find("span").css("line-height", $targetHolder.find("select").outerHeight() + 12 + "px");
        }

        jGetElement(blockid, ".submitBtn")
            .button({
                label:	x_currentPageXML.getAttribute("checkBtn") != undefined && x_currentPageXML.getAttribute("checkBtn") != "" ? x_currentPageXML.getAttribute("checkBtn") : "Check"
            })
            .click(function() {
                gapFill.dropDownSubmit(false, blockid);
            });

        jGetElement(blockid, ".showBtn")
            .button({
                label:	x_currentPageXML.getAttribute("showBtn") != undefined && x_currentPageXML.getAttribute("showBtn") != "" ? x_currentPageXML.getAttribute("showBtn") : "Show Answers"
            })
            .click(function() {
                $targetHolder.find("select").each(function(i) {
                    var $this = $(this);
                    if ($.inArray($this.val(), gapFillModelState.answerData[i]) != -1) {
                        $this.attr("disabled", "disabled");
                    } else {
                        $this
                            .val(gapFillModelState.answerData[i][0])
                            .attr("disabled", "disabled")
                            .addClass("answerShown");
                    }

                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFill.audioFbResize(true, blockid);
                });

                $(this).hide();
                jGetElement(blockid, ".submitBtn").hide();

                gapFillModelState.finished = true;
            });

        $targetHolder.find("select").on("change", function() {
            $feedbackTxt.hide();
        });
    }

    this.setUpFillBlank = function(blockid) {
        this.refreshPageVariables(blockid);

        jGetElement(blockid, ".labelHolder").remove();

        if (x_currentPageXML.getAttribute("spaceLines") != "false") {
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

        if ((x_currentPageXML.getAttribute("markEnd") == undefined || x_currentPageXML.getAttribute("markEnd") == "false") && !this.isTracked) {
            jGetElement(blockid, ".submitBtn, .showBtn").remove();

            $targetHolder.find("input")
                .addClass("incorrect")
                .on("keypress", function() {
                    gapFillModelState = XTGetInteractionModelState(x_currentPage, XTGetBlockNr(blockid));
                    if (gapFillModelState.finished == false) {
                        var $this = $(this);
                        setTimeout(function() {
                            x_currentPageXML = XTGetPageXML(x_currentPage, XTGetBlockNr(blockid));
                            gapFill.refreshPageVariables(blockid);
                            var currvalue = !gapFillModelState.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();
                            if (gapFillModelState.answerData[$this.data("index")].indexOf(currvalue) != -1) { // correct
                                $this
                                    .attr("readonly", "readonly")
                                    .addClass("correct")
                                    .removeClass("incorrect");

                                $pageContents.find("#hint").remove();

                                if ($targetHolder.find("input.correct").length == $targetHolder.find("input").length) {
                                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                                    $feedbackTxt.fadeIn();
                                    gapFill.audioFbResize(true, blockid);
                                }


                                gapFillModelState.correct_answers++;
                                gapFillModelState.total++;
                                var result = {
                                    success: true,
                                    score: 100.0
                                };
                                let answer = !gapFillModelState.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();

                                XTExitInteraction(x_currentPage, XTGetBlockNr(blockid) , result, [], answer, "Correct", $this.data("index"), x_currentPageXML.getAttribute("trackinglabel"));
                                XTSetInteractionModelState(x_currentPage, XTGetBlockNr(blockid), gapFillModelState, $this.data("index"));
                            } else { // wrong - start showing hint after 3 wrong characters entered - this only gives hint if there's only 1 possible correct answer for the gap
                                if (x_currentPageXML.getAttribute("showHint") != "false") {
                                    var wrong = 0;
                                    for (i=0; i<$this.val().length; i++) {
                                        if (gapFillModelState.answerData[$this.data("index")].length == 1 && (i+1 > gapFillModelState.answerData[$this.data("index")][0].length || currvalue[i] != gapFillModelState.answerData[$this.data("index")][0][i])) {
                                            wrong++;
                                        }
                                    }

                                    if (wrong > 0) {
                                        if ($this.data("attempt") == undefined) {
                                            $this.data("attempt", 1);

                                        } else if ($this.data("attempt") >= (x_currentPageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(x_currentPageXML.getAttribute("attemptsBeforeHint")) ? Number(x_currentPageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                                            // show hint - add extra letter at every other wrong answer
                                            $this.data("attempt", $this.data("attempt")+1);
                                            if ($this.data("attempt") % 2 != 0) { // odd num
                                                var currentHint = $this.data("hint"),
                                                    correctAnswer = gapFillModelState.answerData[$this.data("index")][0]

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
                    label:	x_currentPageXML.getAttribute("checkBtn") != undefined && x_currentPageXML.getAttribute("checkBtn") != "" ? x_currentPageXML.getAttribute("checkBtn") : "Check"
                })
                .click(function() {
                    gapFill.fillInSubmit(blockid);
                });

            jGetElement(blockid, ".showBtn")
                .button({
                    label:	x_currentPageXML.getAttribute("showBtn") != undefined && x_currentPageXML.getAttribute("showBtn") != "" ? x_currentPageXML.getAttribute("showBtn") : "Show Answers"
                })
                .click(function() {
                    $targetHolder.find("input").each(function() {
                        var $this = $(this),
                            currvalue = !gapFillModelState.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();

                        if (gapFillModelState.answerData[$this.data("index")].indexOf(currvalue) != -1) {
                            $this.attr("readonly", "readonly");
                            $this.attr("correct", "correct");
                        } else {
                            $this.val(gapFillModelState.answerData[$this.data("index")][0]);
                            $this
                                .addClass("answerShown")
                                .attr("readonly", "readonly");
                        }
                    });

                    $(this).hide();
                    jGetElement(blockid, ".submitBtn").hide();
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFill.audioFbResize(true, blockid);

                    gapFillModelState.finished = true;
                });
        }

        $targetHolder.find("input").on("keypress", function() {
            if (gapFillModelState.finished == false) {
                $feedbackTxt.hide();
            }
        });
    }

    this.setUpDragDrop = function(blockid) {
        debugger
        this.refreshPageVariables(blockid);
        let blocknr = XTGetBlockNr(blockid);
        // if mark at end is off but tracking is on then it will mark at end anyway
        if (!this.isTracked && (x_currentPageXML.getAttribute("markEnd") == undefined || x_currentPageXML.getAttribute("markEnd") == "false")) {
            jGetElement(blockid, ".submitBtn").hide();

        } else {
            jGetElement(blockid, ".submitBtn")
                .button({
                    label:	x_currentPageXML.getAttribute("checkBtn") != undefined && x_currentPageXML.getAttribute("checkBtn") != "" ? x_currentPageXML.getAttribute("checkBtn") : "Check"
                })
                .click(function() {
                    gapFill.dragDropSubmit(false, blockid);
                });

            jGetElement(blockid, ".showBtn")
                .button({
                    label:	x_currentPageXML.getAttribute("showBtn") != undefined && x_currentPageXML.getAttribute("showBtn") != "" ? x_currentPageXML.getAttribute("showBtn") : "Show Answers"
                })
                .click(function() {
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
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFill.audioFbResize(true, blockid);

                    gapFillModelState.finished = true;
                });
        }

        // store strings used to give titles to labels and targets when keyboard is being used (for screen readers)
        gapFillModelState.labelTxt1 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "name", "Draggable Item");
        gapFillModelState.labelTxt2 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "selected", "Item Selected");
        gapFillModelState.labelTxt3 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "toSelect", "Press space to select");
        gapFillModelState.targetTxt1 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "description", "Drop zone for");
        gapFillModelState.targetTxt2 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "toSelect", "Press space to drop the selected item.");
        debugger
        // set up targets
        var	maxW = 0,
            i;
        for (i=0; i<$targetHolder.find(".target").length; i++) {
            maxW = Math.max(maxW, $targetHolder.find(".target:eq(" + i + ")").width());
        }

        $($targetHolder.find(".target")).each(function(i) {
            $(this)
                .attr("title", gapFillModelState.targetTxt1 + " " + (i + 1))
                .data("index", i); // stored here as using .index() won't return result needed as there are other elements (line breaks etc.) in $targetHolder
        });
        //reminder
        let height = ($targetHolder.find(".target").height() + 10);

        $targetHolder.find(".target")
            .css({
                "width":maxW + 30,
                "height": "" + ($targetHolder.find(".target").height() + 10) + "px",
                "line-height":$targetHolder.find(".target").height() + 10 + "px"
            })
            .html("")
            .droppable({
                drop:	function(event, ui) {
                    gapFill.dropLabel($(this), ui.draggable, blockid); // target, label
                }
            });

        if (x_currentPageXML.getAttribute("spaceLines") != "false") {
            $targetHolder.find("span:not(.target)").css("line-height", parseInt($targetHolder.find(".target").css("line-height")) + 10 + "px");
        }

        this.setUpTargetListeners($targetHolder.find(".target"), blockid);

        var allLabels = gapFillModelState.answerData.slice();

        // set up labels
        if (x_currentPageXML.getAttribute("noise") != undefined && x_currentPageXML.getAttribute("noise") != "") { // save distractor data
            var noiseDelimiter = x_currentPageXML.getAttribute("noiseDelimiter") != "" && x_currentPageXML.getAttribute("noiseDelimiter") != undefined ? x_currentPageXML.getAttribute("noiseDelimiter") : " ",
                distractors = x_currentPageXML.getAttribute("noise").split(noiseDelimiter);
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
                    arrayString += gapFillModelState.delimiter;
                }
                arrayString += allLabels[i][j];
            }

            // where there are multiple gaps where the answers can be placed in any order, only create the labels for these once
            if (tempMultiAnswers.indexOf(arrayString) == -1) {
                for (var j=0; j<allLabels[i].length; j++) {
                    $('<div class="label panel" title="' + gapFillModelState.labelTxt1 + '">' + allLabels[i][j] + '</div>')
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
                        jGetElement(blockid, ".labelHolder .label.focus").attr("title", gapFillModelState.labelTxt1);
                    }
                    if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                        $pageContents.data("selectedLabel").attr("title", gapFillModelState.labelTxt1);
                        $pageContents.data("selectedLabel", "");
                    }
                    var targetInFocus = jGetElement(blockid, ".targetHolder .target.highlightDark");
                    if (targetInFocus.length > 0) {
                        targetInFocus.attr("title", gapFillModelState.targetTxt1 + " " + (targetInFocus.index() + 1));
                    }
                    jGetElement(blockid, ".dragDropHolder .selected").removeClass("selected");
                    jGetElement(blockid, ".dragDropHolder .focus").removeClass("focus");
                    jGetElement(blockid, ".dragDropHolder .highlightDark").removeClass("highlightDark");
                }
            })
            .disableSelection();

        this.setUpLabelListeners(jGetElement(blockid, ".dragDropHolder .label"));

        for (i=0; i<jGetElement(blockid, ".targetHolder .target").length; i++) {
            jGetElement(blockid, ".targetHolder .target:eq(" + i + ")").droppable({
                accept:	(!this.isTracked && (x_currentPageXML.getAttribute("markEnd") == undefined || x_currentPageXML.getAttribute("markEnd") == "false")) ?
                    jGetElement(blockid, ".labelHolder .label").filter(function() {
                        return $(this).data("answer") == jGetElement(blockid, ".targetHolder .target:eq(" + i + ")").data("answer");
                    }) : jGetElement(blockid, ".labelHolder .label")
            });
        }
    }

    // function called when label dropped on target - by mouse or keyboard
    this.dropLabel = function($thisTarget, $thisLabel, blockid) {
        this.refreshPageVariables(blockid);
        gapFillModelState = XTGetInteractionModelState(x_currentPage, XTGetBlockNr(blockid));
        $feedbackTxt.hide();

        $thisLabel
            .removeAttr("title")
            .removeClass("selected")
            .draggable("disable")
            .off("keypress focusin focusout")
            .css("opacity", 0);

        if (this.isTracked || x_currentPageXML.getAttribute("markEnd") == "true") {
            if ($thisLabel.data("answer") == $thisTarget.data("answer")) {
                gapFillModelState.score++;
                $thisLabel.add($thisTarget).data("correct", true);
            }
        } else {
            $thisTarget.addClass("correct");
            if ($thisLabel.data("answer") == $thisTarget.data("answer")) {
                gapFillModelState.score++;
                $thisLabel.add($thisTarget).data("correct", true);
            }
        }

        $thisTarget
            .removeAttr("title")
            .html($thisLabel.html())
            .off("keypress focusin focusout")
            .droppable("option", "disabled", true)
            .removeClass("highlight highlightDark ui-state-disabled");

        $pageContents.data("selectedLabel", "");
        gapFillModelState.labelAnswers[$thisTarget.data("answer")] = $thisLabel.data("answer");

        // if it's marked as completed (can only drop on correct targets) then show feedback immediately when complete
        if (!this.isTracked && (x_currentPageXML.getAttribute("markEnd") != "true" && $targetHolder.find(".target.highlight").length == 0)) {
            jGetElement(blockid, ".labelHolder").hide();
            jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
            $feedbackTxt.fadeIn();
            gapFill.audioFbResize(true, blockid);
            gapFill.dragDropSubmit(false, blockid);
            //reminder
        }
        XTSetInteractionModelState(x_currentPage, XTGetBlockNr(blockid), gapFillModelState)
    }

    // set up events used when keyboard rather than mouse is used
    this.setUpTargetListeners = function($targets, blockid) {
        this.refreshPageVariables(blockid);
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
        gapFill.refreshPageVariables(blockid);
        var $this = $(this);
        $this.addClass("highlightDark");
        if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
            $this.attr("title", gapFillModelState.targetTxt1 + " " + ($this.data("index") + 1) + " - " + gapFillModelState.targetTxt2);
        }
    }

    var targetFocusOut = function(e, blockid) {
        gapFill.refreshPageVariables(blockid);
        var $this = $(this);
        $this
            .removeClass("highlightDark")
            .attr("title", gapFillModelState.targetTxt1 + " " + ($this.data("index") + 1));
    }

    var targetKeyPress = function(e, blockid) {
        gapFill.refreshPageVariables(blockid);
        var charCode = e.charCode || e.keyCode;
        if (charCode == 32) {
            var $selectedLabel = $pageContents.data("selectedLabel");
            if ($selectedLabel != undefined && $selectedLabel != "") {
                if (gapFillModelState.answerData[$(this).data("index")].indexOf($selectedLabel.html()) != -1 || (x_currentPageXML.getAttribute("markEnd") != undefined && x_currentPageXML.getAttribute("markEnd") != "false") || (this.isTracked)) {
                    gapFill.dropLabel($(this), $selectedLabel, blockid); // target, label
                } else {
                    $(this).attr("title", gapFillModelState.targetTxt1 + " " + ($(this).data("index") + 1));
                    $selectedLabel
                        .removeClass("selected")
                        .attr("title", gapFillModelState.labelTxt1);
                    $pageContents.data("selectedLabel", "");
                }
            }
        }
    }

    // set up events used when keyboard rather than mouse is used
    this.setUpLabelListeners = function($labels) {
        // highlight selected labels / targets and set the title attr which the screen readers will use
        $labels
            .focusin(labelFocusIn)
            .focusout(labelFocusOut)
            .keypress(labelKeyPress);
    }

    var labelFocusIn = function(e) {
        var $this = $(this);
        if ($this.is($pageContents.data("selectedLabel")) == false) {
            $this
                .addClass("focus")
                .attr("title", gapFillModelState.labelTxt1 + " - " + gapFillModelState.labelTxt3);
        }
    }

    var labelFocusOut = function(e) {
        var $this = $(this);
        $this.removeClass("focus");
        if ($this.is($pageContents.data("selectedLabel")) == false) {
            $this.attr("title", gapFillModelState.labelTxt1);
        }
    }

    var labelKeyPress = function(e) {
        var charCode = e.charCode || e.keyCode;
        if (charCode == 32) {
            if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
                $pageContents.data("selectedLabel")
                    .removeClass("selected")
                    .attr("title", gapFillModelState.labelTxt1);
            }
            var $this = $(this);
            $this
                .removeClass("focus")
                .addClass("selected")
                .attr("title", gapFillModelState.labelTxt1 + ' - ' + gapFillModelState.labelTxt2);
            $pageContents.data("selectedLabel", $this);
        }
    };

    this.dropDownSubmit = function(forced, blockid) {
        let blocknr = XTGetBlockNr(blockid);
        gapFillModelState = XTGetInteractionModelState(x_currentPage, blocknr);
        this.refreshPageVariables(blockid);

        // no answers given
        if ($targetHolder.find('select option:selected[value=" "]').parent().length == $targetHolder.find('select').length) {
            // prompt to complete exercise unless this has been triggered by leaving the page
            if (forced != true) {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillIncomplete") != undefined && x_currentPageXML.getAttribute("gapFillIncomplete") != "" ? x_currentPageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }

            // an attempt (even if partial) has been made
        } else {
            // mark exercise (unless force tracking mode is on & exercise is incomplete)
            if ($targetHolder.find('select option:selected[value=" "]').parent().length == 0 || !this.isTracked) {
                var wrong = 0,
                    correct,
                    result,
                    answer,
                    answers,
                    options;

                gapFillModelState.total = 0;
                gapFillModelState.correct_answers = 0;

                $targetHolder.find("select").each(function(i) {
                    var $this = $(this);
                    answers = [];
                    options = [];
                    answer = $this.val();
                    gapFillModelState.total++;

                    if ($.inArray($this.val(), gapFillModelState.answerData[i]) != -1) {
                        $this
                            .attr("disabled", "disabled")
                            .addClass('correct');
                        correct = true;
                        gapFillModelState.correct_answers++;
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
                            id: $.inArray($this.val(), gapFillModelState.allDropDownAnswers[i]) + 1 + "",
                            answer: $this.val(),
                            result: ($.inArray($this.val(), gapFillModelState.answerData[i]) != -1)
                        });
                    });

                    XTExitInteraction(x_currentPage, blocknr, result, options, answers, [], i, x_currentPageXML.getAttribute("trackinglabel"));
                });

                gapFill.finishTracking(blockid);

                if (wrong == 0) { // all correct
                    jGetElement(blockid, ".submitBtn, .showBtn").hide();
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFill.audioFbResize(true, blockid);

                    gapFillModelState.finished = true;

                } else {
                    if (x_currentPageXML.getAttribute("showHint") != "false") {
                        $targetHolder.find("select").each(function() {
                            if ($(this).val() != " ") {
                                gapFillModelState.attempts++;
                                if (gapFillModelState.attempts >= (x_currentPageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(x_currentPageXML.getAttribute("attemptsBeforeHint")) ? Number(x_currentPageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                                    jGetElement(blockid, ".showBtn").show();
                                }
                                return false;
                            }
                        });
                    }

                    // show feedback - might be different if tracking on/off
                    var gapFillWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillWrong") != undefined && x_currentPageXML.getAttribute("gapFillWrong") != "" ? x_currentPageXML.getAttribute("gapFillWrong") : "You have not filled any gaps correctly. Try again."),
                        gapFillPartWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillPartWrong") != undefined && x_currentPageXML.getAttribute("gapFillPartWrong") != "" ? x_currentPageXML.getAttribute("gapFillPartWrong") : "Your correct answers are shown in green. Try again with those you have got wrong.");

                    if (this.isTracked) {
                        gapFillWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillWrongTracking") != undefined && x_currentPageXML.getAttribute("gapFillWrongTracking") != "" ? x_currentPageXML.getAttribute("gapFillWrongTracking") : "You have not filled any gaps correctly.");
                        gapFillPartWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillPartWrongTracking") != undefined && x_currentPageXML.getAttribute("gapFillPartWrongTracking") != "" ? x_currentPageXML.getAttribute("gapFillPartWrongTracking") : "Your correct answers are shown in green.");

                        jGetElement(blockid, ".submitBtn").hide();
                        jGetElement(blockid, ".showBtn").show();
                        gapFillModelState.finished = true;

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
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillIncomplete") != undefined && x_currentPageXML.getAttribute("gapFillIncomplete") != "" ? x_currentPageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }
        }
    };

    this.fillInSubmit = function(forced, blockid){
        this.refreshPageVariables(blockid);
        let blocknr = XTGetBlockNr(blockid);
        x_currentPageXML = XTGetPageXML(x_currentPage, blocknr);
        // no answers given
        if ($targetHolder.find("input").filter(function() { return $(this).val() != ""; }).length == 0) {
            // prompt to complete exercise unless this has been triggered by leaving the page
            if (forced != true) {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillIncomplete") != undefined && x_currentPageXML.getAttribute("gapFillIncomplete") != "" ? x_currentPageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }

            // an attempt (even if partial) has been made
        } else {
            // mark exercise (unless force tracking mode is on & exercise is incomplete)
            if ($targetHolder.find("input").filter(function() { return $(this).val() == ""; }).length == 0 || !this.isTracked) {
                if (x_currentPageXML.getAttribute("showHint") != "false") {
                    gapFillModelState.attempts++;
                    if (gapFillModelState.attempts >= (x_currentPageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(x_currentPageXML.getAttribute("attemptsBeforeHint")) ? Number(x_currentPageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                        jGetElement(blockid, ".showBtn").show();
                    }
                }

                var wrong = 0;
                gapFillModelState.total = 0;
                gapFillModelState.correct_answers = 0;

                $targetHolder.find("input").each(function() {
                    var $this = $(this),
                        currvalue = !gapFillModelState.casesensitive ? $this.val().trim().toLowerCase() : $this.val().trim();
                    var feedback = "Incorrect";
                    var correct = false;
                    var answer = currvalue;

                    if (gapFillModelState.answerData.length > 0 && gapFillModelState.answerData[$this.data("index")].indexOf(currvalue) != -1) { // correct
                        $this.attr("readonly", "readonly");
                        $this.attr("correct", "correct");
                        $this.addClass("correct");
                        feedback = "Correct";
                        correct = true;
                        gapFillModelState.correct_answers++;

                    } else {
                        if(XTGetMode() == "normal") {
                            $this.attr("readonly", "readonly");
                        }

                        $this.attr("incorrect", "incorrect");
                        wrong++;
                    }

                    gapFillModelState.total++;
                    var result = {
                        success: correct,
                        score: (correct ? 100.0 : 0.0)
                    };

                    XTExitInteraction(x_currentPage, blocknr , result, [], answer, feedback, $this.data("index"), x_currentPageXML.getAttribute("trackinglabel"));
                });

                gapFill.finishTracking(blockid);

                // show feedback - might be different if tracking on/off
                var gapFillWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillWrong") != undefined && x_currentPageXML.getAttribute("gapFillWrong") != "" ? x_currentPageXML.getAttribute("gapFillWrong") : "You have not filled any gaps correctly. Try again."),
                    gapFillPartWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillPartWrong") != undefined && x_currentPageXML.getAttribute("gapFillPartWrong") != "" ? x_currentPageXML.getAttribute("gapFillPartWrong") : "Your correct answers are shown in green. Try again with those you have got wrong.");

                if (this.isTracked) {
                    gapFillWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillWrongTracking") != undefined && x_currentPageXML.getAttribute("gapFillWrongTracking") != "" ? x_currentPageXML.getAttribute("gapFillWrongTracking") : "You have not filled any gaps correctly.");
                    gapFillPartWrong = x_addLineBreaks(x_currentPageXML.getAttribute("gapFillPartWrongTracking") != undefined && x_currentPageXML.getAttribute("gapFillPartWrongTracking") != "" ? x_currentPageXML.getAttribute("gapFillPartWrongTracking") : "Your correct answers are shown in green.");

                    gapFillModelState.finished = true;
                }

                if (wrong == 0) {
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    jGetElement(blockid, ".showBtn,.submitBtn").hide();
                    $feedbackTxt.fadeIn();
                    gapFill.audioFbResize(true, blockid);

                    gapFillModelState.finished = true;

                } else {
                    if (wrong == $targetHolder.find("input").length) {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + gapFillWrong + '</p>');
                    } else {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + gapFillPartWrong + '</p>');
                    }
                    $feedbackTxt.fadeIn();

                    if (this.isTracked) {
                        jGetElement(blockid, ".submitBtn").hide();
                        jGetElement(blockid, ".showBtn").show();
                    }
                }

                // if force tracking mode is on then you must fully complete before checking answers
            } else {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillIncomplete") != undefined && x_currentPageXML.getAttribute("gapFillIncomplete") != "" ? x_currentPageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }
        }
    };

    this.dragDropSubmit = function(forced, blockid) {
        this.refreshPageVariables(blockid);
        // no blanks completed
        if ($targetHolder.find(".target:not(.highlight)").length == 0) {
            // prompt to complete exercise unless this has been triggered by leaving the page
            if (forced != true) {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillIncomplete") != undefined && x_currentPageXML.getAttribute("gapFillIncomplete") != "" ? x_currentPageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }

            // an attempt (even if partial) has been made
        } else {
            // mark exercise (unless force tracking mode is on & exercise is incomplete)
            if ($targetHolder.find(".target.highlight").length == 0 || !this.isTracked) {
                jGetElement(blockid, ".targetHolder .target").filter(function () {
                    return $(this).data("correct") == true;
                }).addClass("correct");

                var $incorrectTargets = jGetElement(blockid, ".targetHolder .target").filter(function () {
                    return !($(this).data("correct") == true || $(this).hasClass("correct")) && !$(this).hasClass("highlight");
                });

                var $incorrectLabels = jGetElement(blockid, ".labelHolder .label").filter(function () {
                    return $(this).data("correct") != true;
                });

                // track before moving back labels or else results page looks like you haven't attempted to answer
                var l_options = [];
                var l_answers = [];
                var feedback = "Correct";
                gapFillModelState.total = 0;
                gapFillModelState.correct_answers = 0;

                for (var interactionNumber = 0; interactionNumber < gapFillModelState.answerData.length; interactionNumber++) {
                    var correctAnswer = gapFillModelState.answerData[interactionNumber][0];
                    var labelSource = gapFillModelState.labelAnswers[correctAnswer];
                    var option = {source: labelSource, target: correctAnswer};
                    l_options.push(option);
                    if (option.source == option.target) {
                        gapFillModelState.correct_answers++;
                    }

                    var l_answer = labelSource + "-->" + correctAnswer;
                    l_answers.push(l_answer);
                    gapFillModelState.total++;
                }
                var correct = (gapFillModelState.total == gapFillModelState.correct_answers);
                var result = {
                    success: correct,
                    score: (correct ? 100.0 : 0.0)
                };
                if (!correct) { feedback = "Incorrect"; }
                XTExitInteraction(x_currentPage, XTGetBlockNr(blockid), result, l_options, l_answers, feedback);

                gapFill.finishTracking(blockid);

                if (!this.isTracked) {
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
                        $(this).attr("title", gapFillModelState.targetTxt1 + " " + ($(this).data("index") + 1));
                        delete gapFillModelState.labelAnswers[$(this).data("answer")];
                    });

                    $incorrectLabels
                        .attr("title", gapFillModelState.labelTxt1)
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
                    } else if (x_currentPageXML.getAttribute("showHint") != "false") {
                        gapFillModelState.attempts++;
                        if (gapFillModelState.attempts >= (x_currentPageXML.getAttribute("attemptsBeforeHint") != undefined && $.isNumeric(x_currentPageXML.getAttribute("attemptsBeforeHint")) ? Number(x_currentPageXML.getAttribute("attemptsBeforeHint")) : 2)) {
                            jGetElement(blockid, ".showBtn").show();
                        }
                    }

                } else {
                    // if tracked then you don't get to try again (is this how it should be?)
                    $incorrectTargets.addClass("incorrect");
                    jGetElement(blockid, ".submitBtn").hide();
                    gapFillModelState.finished = true;

                    if (correct !== true) {
                        jGetElement(blockid, ".showBtn").show();
                    }
                }

                // feedback...
                if (gapFillModelState.score == jGetElement(blockid, ".targetHolder .target").length) {
                    jGetElement(blockid, ".labelHolder").hide();
                    jGetElement(blockid, ".feedbackTxt .txt").html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));
                    $feedbackTxt.fadeIn();
                    gapFill.audioFbResize(true, blockid);
                    gapFillModelState.finished = true;
                } else {
                    if (gapFillModelState.score == 0) {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillWrongTracking") != undefined && x_currentPageXML.getAttribute("gapFillWrongTracking") != "" ? x_currentPageXML.getAttribute("gapFillWrongTracking") : "You have not filled any gaps correctly.") + '</p>');
                    } else {
                        jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillPartWrongTracking") != undefined && x_currentPageXML.getAttribute("gapFillPartWrongTracking") != "" ? x_currentPageXML.getAttribute("gapFillPartWrongTracking") : "Your correct answers are shown in green.") + '</p>');
                    }
                    $feedbackTxt.fadeIn();
                }

                // if force tracking mode is on then you must fully complete before checking answers
            } else {
                jGetElement(blockid, ".feedbackTxt .txt").html('<p>' + x_addLineBreaks(x_currentPageXML.getAttribute("gapFillIncomplete") != undefined && x_currentPageXML.getAttribute("gapFillIncomplete") != "" ? x_currentPageXML.getAttribute("gapFillIncomplete") : "Please complete the exercise.") + '</p>');
                $feedbackTxt.fadeIn();
            }
        }
    }

    //Starting the tracking
    this.initTracking = function(blockid) {
        // Track the gapfill page
        gapFillModelState = XTGetInteractionModelState(x_currentPage, XTGetBlockNr(blockid));
        this.weighting = 1.0;
        if (x_currentPageXML.getAttribute("trackingWeight") != undefined)
        {
            this.weighting = x_currentPageXML.getAttribute("trackingWeight");
        }
        if (x_currentPageXML.getAttribute("interactivity") == "Drop Down Menu" || x_currentPageXML.getAttribute("interactivity") == "Fill in Blank")
        {
            XTSetPageType(x_currentPage, 'numeric', gapFillModelState.answerData.length, this.weighting);
        }
        else { // text fill in blank or drag & drop
            XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);
        }
    }

    //Stopping the tracking
    this.finishTracking = function(blockid) {

    }
}