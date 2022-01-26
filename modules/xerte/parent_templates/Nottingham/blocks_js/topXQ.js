var topXQ = new function () {

    var $pageContents;

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function () {
        $pageContents = jGetElement(blockid, '.pageContents');
    };

    // function called every time the size of the LO is changed
    this.sizeChanged = function (blockid) {
        if (x_browserInfo.mobile == false) {
            var $panel = jGetElement(blockid, ".pageContents .panel");
            $panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
        }
    };

    this.leavePage = function (blockid) {
        if (!$pageContents.data('hasExited')) {
            topXQ.fillInputs(blockid);

            var checkAnswers = $pageContents.data('checkAnswers');
            for (var i = 0; i < checkAnswers.length; i++) {
                topXQ.checkSingleAnswer(i);
            }

            var answers = $pageContents.data('answers'),
                inputs = $pageContents.data('inputs'),
                doneAnswers = [];

            for (i = 0; i < inputs.length; i++) {
                for (k = 0; k < answers.length; k++) {
                    for (j = 0; j < answers[k].options.length; j++) {
                        if (!doneAnswers.includes(k) && inputs[i] === answers[k].options[j].trim()) {
                            doneAnswers.push(k);
                            jGetElement(blockid, "#topXQ-correctAnswer-" + k).addClass("fa").addClass("fa-fw").addClass("fa-long-arrow-left")
                        }
                    }
                }
            }
        }
    };

    this.fillInputs = function (blockid) {
        var inputs = [];
        jGetElement(blockid, '.input-answer').each(function () {
            inputs.push($(this).val());
        });

        var checkAnswers = [];
        for (i = 0; i < inputs.length; i++) {
            checkAnswers.push({
                correct: false,
                comment: ""
            });
        }

        var answers = $pageContents.data('answers');
        for (i = 0; i < answers.length; i++) {
            answers[i].counter = 0;
        }

        $pageContents.data({
            'inputs': inputs,
            'checkAnswers': checkAnswers,
            'answers': answers
        });
    }

    this.checkSingleAnswer = function (i) {
        var inputs = $pageContents.data('inputs'),
            answers = $pageContents.data('answers'),
            checkAnswers = $pageContents.data('checkAnswers'),
            isCorrect = false;

        for (j = 0; j < answers.length; j++) {
            for (x = 0; x < answers[j].options.length; x++) {
                var givenAnswer = x_currentPageXML.getAttribute("caseSensitivity") == "true" || x_currentPageXML.getAttribute("caseSensitivity") == undefined ? inputs[i] : inputs[i].toLowerCase(),
                    correctAnswer = x_currentPageXML.getAttribute("caseSensitivity") == "true" || x_currentPageXML.getAttribute("caseSensitivity") == undefined ? answers[j].options[x].trim() : answers[j].options[x].trim().toLowerCase();

                if (givenAnswer === correctAnswer) {
                    isCorrect = true;
                    checkAnswers[i].correct = true;
                    answers[j].counter++;

                    if (answers[j].counter > 1) {
                        checkAnswers[i].correct = false;
                        checkAnswers[i].comment = "Duplicate";
                    }
                    break;
                }
            }
        }

        if (!isCorrect) {
            checkAnswers[i].comment = "Wrong Answer";
        }

        $pageContents.data({
            'checkAnswers': checkAnswers,
            'answers': answers
        });
    };

    this.exitPage = function (blockid) {
        var amountOfCorrect = 0,
            checkAnswers = $pageContents.data('checkAnswers'),
            inputs = $pageContents.data('inputs');

        for (i = 0; i < inputs.length; i++) {

            var result = {
                success: checkAnswers[i].correct,
                score: checkAnswers[i].correct ? 100.0 : 0.0
            };
            XTExitInteraction(x_currentPage, i, result, "", inputs[i], "", x_currentPageXML.getAttribute("trackinglabel"));


            if (checkAnswers[i].correct) {
                amountOfCorrect++;
            }
        }

        var amountOfInputs = 0;
        jGetElement(blockid, '.input-answer').each(function () {
            amountOfInputs++;
        });

        var setScore = 0;
        if (amountOfInputs === undefined || amountOfInputs === 0) {
            amountOfInputs = 0;
        }

        if (amountOfInputs > 0 && amountOfCorrect > 0) {
            setScore = 100 / amountOfInputs * amountOfCorrect;
        }

        XTSetPageScore(x_currentPage, setScore);
    };

    this.init = function (pageXML, blockid) {
        x_currentPageXML = pageXML;
        $pageContents = jGetElement(blockid, '.pageContents');

        jGetElement(blockid, '.result, .mainFeedback, .correctAnswer').hide();

        $pageContents.data('hasExited', false);

        this.weighting = 1.0;

        if (x_currentPageXML.getAttribute("trackingWeight") != undefined) {
            this.weighting = x_currentPageXML.getAttribute("trackingWeight");
        }
        XTSetPageType(x_currentPage, 'fill-in', 1, this.weighting);

        var panelWidth = x_currentPageXML.getAttribute("panelWidth"),
            $splitScreen = jGetElement(blockid, ".pageContents .splitScreen");
        var $textHolder = jGetElement(blockid, ".textHolder");

        if (panelWidth === "Full") {
            jGetElement(blockid, ".pageContents .panel").appendTo(jGetElement(blockid, ".pageContents"));
            $splitScreen.remove();
        } else {
            $textHolder.html(x_addLineBreaks(x_currentPageXML.getAttribute("instruction")));

            var textAlign = x_currentPageXML.getAttribute("align");
            if (textAlign !== "Right") {
                if (panelWidth === "Small") {
                    $splitScreen.addClass("large");
                } else if (panelWidth === "Large") {
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
                if (panelWidth === "Small") {
                    $splitScreen.addClass("medium");
                } else if (panelWidth === "Large") {
                    $splitScreen.addClass("large");
                } else {
                    $splitScreen.addClass("large");
                }
            }
        }

        var attemptLabel = x_currentPageXML.getAttribute("attemptLabel");
        if (x_currentPageXML.getAttribute("attemptLabel") == null) {
            attemptLabel = "Attempt";
        }

        var instruction = x_currentPageXML.getAttribute("instruction");
        $textHolder.html(instruction);

        var $question = jGetElement(blockid, ".question");
        var prompt = x_currentPageXML.getAttribute("prompt");
        $question.html(prompt);

        var $panelWidth = x_currentPageXML.getAttribute("panelWidth");
        var $optionHolder = jGetElement(blockid, ".OptionHolder");

        var $attempts = jGetElement(blockid, ".attempts");
        var amountofTries = parseInt(x_currentPageXML.getAttribute("amountOfTries"));
        if (amountofTries != undefined && $.isNumeric(amountofTries)) {
            $attempts.html(x_currentPageXML.getAttribute("attemptLabel") + ": " + amountofTries).show();
            $pageContents.data('amountofTries', amountofTries);
        } else {
            $attempts.remove();
        }

        var elements = [];
        $(x_currentPageXML).children().each(function (i) {
            elements.push(
                {
                    label: this.getAttribute("name"),
                    answer: $("<div>").html(this.getAttribute("answer")).text(),
                    correct: this.getAttribute("correct"),
                    feedback: this.getAttribute("feedback")
                }
            );
        });

        this.optionElements = elements;
        var j = 0;
        var amountOfAnswers = x_currentPageXML.getAttribute("numberAnswers");
        if (amountOfAnswers === "*") {
            amountOfAnswers = elements.length;
        } else if (amountOfAnswers > elements.length) {
            amountOfAnswers = elements.length;
        }

        var answerFieldLabel = x_currentPageXML.getAttribute("answerFieldLabel");
        if (answerFieldLabel === undefined | answerFieldLabel === null) {
            answerFieldLabel = "Answer";
        }
        for (i = 0; i < amountOfAnswers; i++) {
            var actualFieldLabel = answerFieldLabel + ' ' + (i + 1);
            $optionHolder.append('<div class="answer"><input class="input-answer" id="input-answer-' + i + '" aria-label="' + actualFieldLabel + '"/><span id="topXQ-result-' + i + '"></span></div>');
            j++;
        }

        var answers = [];
        for (i = 0; i < elements.length; i++) {
            var answer = elements[i].answer.split(",");
            answers.push({
                options: answer,
                counter: 0,
                counter2: 0
            });
        }
        $pageContents.data('answers', answers);

        var correctOptionsFeedback = [];
        for (i = 0; i < elements.length; i++) {
            correctOptionsFeedback.push(x_GetTrackingTextFromHTML(elements[i].feedback, ""))
        }

        $pageContents.data('correctOptionsFeedback', correctOptionsFeedback);

        var checkBtnTxt = x_currentPageXML.getAttribute("checkBtnTxt");
        if (checkBtnTxt === undefined) {
            checkBtnTxt = "Submit";
        }
        var attempt = 1;

        jGetElement(blockid, ".checkButton")
            .button({
                label: checkBtnTxt
            })
            .click(function () {
                var tries;
                if (x_currentPageXML.getAttribute("amountOfTries") != undefined && $.isNumeric(x_currentPageXML.getAttribute("amountOfTries"))) {
                    tries = parseInt(x_currentPageXML.getAttribute("amountOfTries"));
                    $pageContents.data('amountofTries', $pageContents.data('amountofTries') - 1);

                    if ($pageContents.data('amountofTries') > 0) {
                        $attempts.html(x_currentPageXML.getAttribute("attemptLabel") + ": " + $pageContents.data('amountofTries'));
                    } else {
                        $attempts.html("");
                    }
                }

                var blankAnswers = [];
                for (i = 0; i < x_currentPageXML.getAttribute("numberAnswers"); i++) {
                    blankAnswers.push("-");
                }

                for (i = 0; i < blankAnswers.length; i++) {
                    XTEnterInteraction(x_currentPage, i, "fill-in", x_GetTrackingTextFromHTML(x_currentPageXML.getAttribute("prompt"), ""), "", blankAnswers[i], $pageContents.data('correctOptionsFeedback'), x_currentPageXML.getAttribute("grouping"));
                }

                if (!$pageContents.data('hasExited')) {
                    $pageContents.data('hasExited', true);
                }

                showFeedback = function () {
                    var correctAnswersLabel = x_currentPageXML.getAttribute("correctAnswersLabel"),
                        answers = $pageContents.data('answers');

                    jGetElement(blockid, ".correctAnswer").html('');
                    if (x_currentPageXML.getAttribute("showAnswers") === "true" || x_currentPageXML.getAttribute("showAnswers") === undefined) {
                        jGetElement(blockid, ".correctAnswer").append('<h3>' + correctAnswersLabel + '</h3><ul>');

                        if (jGetElement(blockid, '.correctAnswer ul').has("li").length === 0) {
                            for (i = 0; i < answers.length; i++) {
                                jGetElement(blockid, ".correctAnswer ul").append("<li>" + answers[i].options + "<span id='topXQ-correctAnswer-" + i + "'></span> </li>");
                            }
                        }

                        jGetElement(blockid, '.correctAnswer').show();
                    }

                    AllAnswersCheckt = function () {
                        var inputs = $pageContents.data('inputs'),
                            answers = $pageContents.data('answers');

                        for (i = 0; i < answers.length; i++) {
                            answers[i].counter2 = 0;
                        }

                        var amountOfGood = 0;
                        if (x_currentPageXML.getAttribute("caseSensitivity") == "true" || x_currentPageXML.getAttribute("caseSensitivity") == undefined) {

                            for (i = 0; i < inputs.length; i++) {
                                for (j = 0; j < answers.length; j++) {
                                    for (x = 0; x < answers[j].options.length; x++) {

                                        var givenAnswer = inputs[i];
                                        var correctAnswer = answers[j].options[x].trim();
                                        if (givenAnswer === correctAnswer) {
                                            answers[j].counter2++;
                                            amountOfGood++;
                                            if (answers[j].counter2 > 1) {
                                                amountOfGood--;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        } else {
                            for (i = 0; i < inputs.length; i++) {
                                var isCorrect = false;
                                for (j = 0; j < answers.length; j++) {
                                    for (x = 0; x < answers[j].options.length; x++) {

                                        var givenAnswer = inputs[i].toLowerCase();
                                        var correctAnswer = answers[j].options[x].trim().toLowerCase();

                                        if (givenAnswer === correctAnswer) {
                                            answers[j].counter2++;
                                            amountOfGood++;
                                            if (answers[j].counter2 > 1) {
                                                amountOfGood--;
                                            }
                                            break;
                                        }
                                    }
                                }

                            }
                        }

                        $pageContents.data('answers', answers);

                        if (amountOfGood === inputs.length) {
                            return true;
                        }
                    };

                    var passedTxt = x_currentPageXML.getAttribute("passed");
                    if (passedTxt === undefined) {
                        passedTxt = "Well done, you have completed the activity";
                    }

                    var failedTxt = x_currentPageXML.getAttribute("failed");
                    if (failedTxt === undefined) {
                        failedTxt = "Not all of the answers are correct";
                    }

                    var passedOrFailed = "";

                    var passed = AllAnswersCheckt();
                    if (passed === true) {
                        passedOrFailed = passedTxt;
                    } else {
                        passedOrFailed = failedTxt;
                    }

                    jGetElement(blockid, ".result")
                        .html('<p><span id="finalResult"></span>' + passedOrFailed + '</p>')
                        .show();

                    if (passed === true) {
                        if (passedTxt !== "") {
                            jGetElement(blockid, "#finalResult")
                                .removeClass("fa-x-cross")
                                .addClass("fa").addClass("fa-fw").addClass("fa-x-tick");
                        }
                    } else {
                        if (failedTxt !== "") {
                            jGetElement(blockid, "#finalResult")
                                .removeClass("fa-x-tick")
                                .addClass("fa").addClass("fa-fw").addClass("fa-x-cross");
                        }

                    }

                    var mainFeedback = x_currentPageXML.getAttribute("feedback");
                    if (mainFeedback === null) {
                        mainFeedback = "";
                    }

                    if (mainFeedback != '') {
                        jGetElement(blockid, ".mainFeedback")
                            .html((x_currentPageXML.getAttribute("feedbackLabel") != undefined && x_currentPageXML.getAttribute("feedbackLabel").trim() != '' ? '<h3>' + x_currentPageXML.getAttribute("feedbackLabel") + '</h3>' : '') + mainFeedback)
                            .show();
                    }

                    jGetElement(blockid, '.attempts').hide();
                };

                topXQ.fillInputs(blockid);

                var checkAnswers = $pageContents.data('checkAnswers'),
                    wrong = checkAnswers.length;

                if ((attempt < tries && wrong > 0) || tries == undefined) {
                    for (var i = 0; i < checkAnswers.length; i++) {
                        if (checkAnswers[i].correct === false) {
                            topXQ.checkSingleAnswer(i);
                            if (checkAnswers[i].correct === false) {
                                jGetElement(blockid, "#input-answer-" + i).val("");
                            }

                        }
                        if (checkAnswers[i].correct === true) {
                            //disable the input field
                            jGetElement(blockid, "#input-answer-" + i).prop('readonly', true);
                            jGetElement(blockid, "#topXQ-result-" + i)
                                .removeClass("fa-x-cross")
                                .addClass("fa").addClass("fa-fw").addClass("fa-x-tick");
                            wrong--;
                        } else {
                            jGetElement(blockid, "#topXQ-result-" + i)
                                .removeClass("fa-x-tick")
                                .addClass("fa").addClass("fa-fw").addClass("fa-x-cross");
                        }

                    }
                    attempt++;

                    if (tries === undefined) {
                        showFeedback();
                        topXQ.exitPage(blockid);
                    }


                } else {
                    jGetElement(blockid, '.checkButton').hide();

                    for (var i = 0; i < checkAnswers.length; i++) {
                        jGetElement(blockid, "#input-answer-" + i).prop('readonly', true);

                        if (tries == 1 && checkAnswers[i].correct === true) {
                            jGetElement(blockid, "#topXQ-result-" + i)
                                .removeClass("fa-x-cross")
                                .addClass("fa").addClass("fa-fw").addClass("fa-x-tick");
                        }

                        if (checkAnswers[i].correct === false) {
                            topXQ.checkSingleAnswer(i);
                            if (checkAnswers[i].correct === false) {
                                if (attempt === tries) {
                                    jGetElement(blockid, "#topXQ-result-" + i)
                                        .removeClass("fa-x-tick")
                                        .addClass("fa").addClass("fa-fw").addClass("fa-x-cross");
                                }
                            } else {
                                jGetElement(blockid, "#topXQ-result-" + i)
                                    .removeClass("fa-x-cross")
                                    .addClass("fa").addClass("fa-fw").addClass("fa-x-tick");
                            }
                        }
                    }

                    showFeedback();
                    topXQ.exitPage(blockid);
                }

                if (wrong === 0) {
                    jGetElement(blockid, '.checkButton').hide();
                    showFeedback();
                    topXQ.exitPage(blockid);
                }
            })
            .show();

        this.sizeChanged(blockid);

        // call this function in every model once everything is loaded
        x_pageLoaded();
    }
};
