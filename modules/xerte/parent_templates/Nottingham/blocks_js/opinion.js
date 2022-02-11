var opinion = new function()
{
    var $pageContents;

    this.sizeChanged = function(blockid)
    {

        var $panel = jGetElement(blockid, ".pageContents .qPanel"),
            resized = false;

        if (x_browserInfo.mobile == false)
        {

            $panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
        }

        $.each(jGetElement(blockid, ".questionAudio"), function(key, qA) {
            var qAudio = jGetElement(blockid, "#" + qA.id);
            if (qAudio.children().length > 0)
            {
                if (resized == false)
                {
                    var audioBarW = 0;
                    qAudio.find(".mejs-inner").find(".mejs-controls").children().each(function() {
                        audioBarW += $(this).outerWidth();
                    });
                    if (audioBarW < qAudio.width() - 5 || audioBarW > qAudio.width() + 5)
                    {
                        resized = true;
                        $x_window.resize();
                    }
                }
            }
        });

        var audioHolder = jGetElement(blockid, ".pageContents .audioHolder");

        if (audioHolder.length > 0)
        {
            if (resized == false)
            {
                var audioBarW = 0;
                jGetElement(blockid, ".pageContents .audioHolder:eq(0) .mejs-inner .mejs-controls").children().each(function() {
                    audioBarW += $(this).outerWidth();
                });

                if (audioBarW - audioHolder.parents(".infoHolder").width() < -2 || audioBarW - audioHolder.parents(".infoHolder").width() > 2)
                {
                    resized = true;
                    $x_window.resize();
                }
            }
        }

        var width = jGetElement(blockid, ".infoHolder").width(),
            height = jGetElement(blockid, ".infoHolder").height(),
            textSize;

        if(width > height) {
            jGetElement(blockid, ".diagram")
                .width(height*0.90)
                .height(height*0.90);
            textSize = (width - height) / 10;
        }
        else {
            jGetElement(blockid, ".diagram")
                .width(width*0.90)
                .height(width*0.90);
            textSize = (height - width) / 10;
        }
        if (textSize > 20) {
            textSize = 20;
        }
        else if (textSize < 12) {
            textSize = 12;
        }

        $pageContents.data('textSize', textSize);
    };

    this.loadAudio = function(currentQuestion, soundFile)
    {
        if (soundFile != undefined && soundFile != "")
        {
            jGetElement(blockid, "#questionAudio" + currentQuestion).mediaPlayer({
                type	:"audio",
                source	:soundFile,
                width	:"100%"
            });
        }
    };

    this.startQuestions = function(blockid)
    {

        // If the language attribute is not defined in the xml, fall back to English.
        var questionNumberText = x_currentPageXML.getAttribute("quesCount");
        if (questionNumberText == undefined)
        {
            questionNumberText = "Question {i} of {n}";
        }
        $pageContents.data({
            'resultShown': false,
            'qNumTxt': questionNumberText
        });

        var showfeedback = false;
        if (x_currentPageXML.getAttribute("showfeedback") != undefined)
        {
            showfeedback = x_currentPageXML.getAttribute("showfeedback") == "true";
        }
        $pageContents.data('showfeedback', showfeedback);

        jGetElement(blockid, ".diagram").hide();
        jGetElement(blockid, ".qHolder").show();
        jGetElement(blockid, ".checkBtn")
            .show()
            .button("disable");

        $pageContents.data('currentQuestion', 0);
        var questions = []; // array of questions to use (index)

        var numberOfQuestions = $(x_currentPageXML).children().children().length; // Can't be 0

        for(var i = 0; i < $(x_currentPageXML).children().length; i++)
        {
            $(x_currentPageXML).children()[i].classId = i;
        }

        if (x_currentPageXML.getAttribute("order") == "random")
        {
            var questionNumbers = [];

            for (var i = 0; i < numberOfQuestions; i++)
            {
                questionNumbers.push(i);
            }

            for (var i = 0; i < numberOfQuestions; i++)
            {
                var questionNumber = Math.floor(Math.random() * questionNumbers.length);
                questions.push(questionNumbers[questionNumber]);
                questionNumbers.splice(questionNumber, 1);
            }
        }
        else
        {
            for (var i = 0; i < numberOfQuestions; i++)
            {
                questions.push(i);
            }
        }

        $pageContents.data('questions', questions);

        var weighting =  x_currentPageXML.getAttribute("trackingWeight") != undefined ? x_currentPageXML.getAttribute("trackingWeight") : 1.0;

        XTSetPageType(x_currentPage, 'numeric', numberOfQuestions, weighting);

        this.loadQuestions(blockid);

        x_pageContentsUpdated();
    };

    this.loadQuestions = function(blockid)
    {
        jGetElement(blockid, ".checkBtn").button("disable");

        $pageContents.data('radioButtonQuestions', []);

        var listMode = $pageContents.data('listMode'),
            pageMode = $pageContents.data('pageMode'),
            pageSize = $pageContents.data('pageSize'),
            currentQuestion = $pageContents.data('currentQuestion'),
            questions = $pageContents.data('questions');

        if (listMode || listMode == 'all')
        {
            if (pageMode || (pageMode == undefined && listMode == true))
            {
                jGetElement(blockid, ".qNo").html($pageContents.data('qNumTxt').replace("{i}", (currentQuestion + 1) + " - " + (Math.min(currentQuestion + pageSize, questions.length))).replace("{n}", questions.length));
                jGetElement(blockid, ".qHolder").html("");
                for (i=currentQuestion; i<Math.min(currentQuestion + pageSize, questions.length); i++)
                {
                    jGetElement(blockid, ".qHolder").append('<legend id="qTxt' + i + '" class="qTxt"></legend><div id="questionAudio'+ i + '" class="questionAudio"></div><div id="sliderHolder' + i
                        + '" class="sliderHolder"><div id="labelHolder' + i + '" class="labelHolder"></div><div id="rangeHolder' + i + '" class="rangeHolder"></div></div><div class="qSeparator"><hr></div>');
                    this.loadQuestion(i, blockid);
                }
            }
            else
            {
                jGetElement(blockid, ".qNo").html($pageContents.data('qNumTxt').replace("{i}", (currentQuestion + 1) + " - " + questions.length).replace("{n}", questions.length));
                jGetElement(blockid, ".qHolder").html("");
                for (i=currentQuestion; i<questions.length; i++)
                {
                    jGetElement(blockid, ".qHolder").append('<legend id="qTxt' + i + '" class="qTxt"></legend><div id="questionAudio'+ i + '" class="questionAudio"></div><div id="sliderHolder' + i
                        + '" class="sliderHolder"><div id="labelHolder' + i + '" class="labelHolder"></div><div id="rangeHolder' + i + '" class="rangeHolder"></div></div><div class="qSeparator"><hr></div>');
                    this.loadQuestion(i, blockid);
                }
            }
        }
        else
        {
            jGetElement(blockid, ".qNo").html($pageContents.data('qNumTxt').replace("{i}", currentQuestion + 1).replace("{n}", questions.length));
            jGetElement(blockid, ".qHolder").html('<legend id="qTxt' + currentQuestion + '" class="qTxt"></legend><div id="questionAudio'+currentQuestion + '" class="questionAudio"></div><div id="sliderHolder'
                + currentQuestion + '" class="sliderHolder"><div id="labelHolder' + currentQuestion + '" class="labelHolder"></div><div id="rangeHolder' + currentQuestion + '" class="rangeHolder"></div></div>');

            this.loadQuestion(currentQuestion, blockid);
        }

        this.checkButtonState(blockid);
    };

    this.checkButtonState = function(blockid)
    {
        var checked = true;
        $.each($pageContents.data('radioButtonQuestions'), function(key, value){
            if (value == false) {
                checked = false;
            }
        });
        if (checked)
        {
            jGetElement(blockid, ".checkBtn").button("enable");
        }
    };

    this.loadQuestion = function(currentQuestion, blockid)
    {
        var questions = $pageContents.data('questions');

        if ($(x_currentPageXML).children().length == 0)
        {
            jGetElement(blockid, ".optionHolder").html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noQ", "No questions have been added") + '</span>');
        }
        else
        {
            var $thisQ = $(x_currentPageXML).children().children()[questions[currentQuestion]];
            var infoString = $thisQ.getAttribute("prompt");

            if ($thisQ.getAttribute("sound") != undefined && $thisQ.getAttribute("sound") != "") {
                this.loadAudio(currentQuestion, $thisQ.getAttribute("sound"));
            }
            else
            {
                jGetElement(blockid, ".questionAudio" + currentQuestion).empty();
            }

            var url = $thisQ.getAttribute("image");

            if (url != undefined && url != "") {
                var newString = "";
                newString += '<img class="qImg" src="' + x_evalURL(url) + '" class="opinionImg"';

                if ($thisQ.getAttribute("tip") != undefined && $thisQ.getAttribute("tip") != "")
                {
                    newString += 'alt="' + $thisQ.getAttribute("tip") + '"';
                }

                newString += ' />';
                infoString = newString + infoString;
            }

            jGetElement(blockid, ".qTxt" + currentQuestion).html(x_addLineBreaks(infoString));
            jGetElement(blockid, ".feedback").html("");

            if ($($thisQ).children().length == 0)
            {
                jGetElement(blockid, "#sliderHolder" + currentQuestion).html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noA", "No answer options have been added") + '</span>');
            }
            else
            {
                var correctOptions = [],
                    correctAnswer = [],
                    name;

                if($thisQ.getAttribute("interactivity") == "radio-buttons") {
                    var $optionHolder = jGetElement(blockid, "#sliderHolder" + currentQuestion);
                    $optionHolder.html('<div class="optionGroup"><input type="radio" name="option' + currentQuestion + '" /><label class="optionTxt"></label></div>');

                    var $optionGroup = $optionHolder.find(".optionGroup");

                    var radioButtonQuestions = $pageContents.data('radioButtonQuestions');
                    radioButtonQuestions[currentQuestion] = false;
                    $pageContents.data('radioButtonQuestions', radioButtonQuestions);

                    var currentAnswers = [];
                    $($thisQ).children().each(function () {
                        currentAnswers.push(
                            {
                                text: this.getAttribute("text"),
                                correct: this.getAttribute("correct")
                            }
                        );
                    });

                    $.each(currentAnswers, function (index, value) {
                        var $thisOptionGroup, $thisOption, $thisOptionTxt;

                        if (index != 0) {
                            $thisOptionGroup = $optionGroup.clone().appendTo($optionHolder);
                        }
                        else {
                            $thisOptionGroup = $optionGroup;
                        }

                        $thisOption = $thisOptionGroup.find("input");
                        $thisOptionTxt = $thisOptionGroup.find(".optionTxt");

                        correctOptions.push((index + 1) + "");
                        correctAnswer.push(value.text);

                        $thisOption
                            .attr({
                                "value": value.text,
                                "id": "option" + currentQuestion + "_" + index
                            })
                            .change(function () {
                                var radioButtonQuestions = $pageContents.data('radioButtonQuestions');
                                radioButtonQuestions[currentQuestion] = true;
                                $pageContents.data('radioButtonQuestions', radioButtonQuestions);
                                opinion.checkButtonState(blockid);
                            });
                        $thisOption[0].score = index;
                        $thisOptionTxt
                            .attr("for", "option" + currentQuestion + "_" + index)
                            .data("option", $thisOption)
                            .html(x_addLineBreaks(value.text));
                    });

                    name = $thisQ.getAttribute("prompt");

                    if ($thisQ.getAttribute("name")) {
                        name = $thisQ.getAttribute("name");
                    }
                }
                else if($thisQ.getAttribute("interactivity") == null || $thisQ.getAttribute("interactivity") == "slider")
                {
                    var $sliderHolder = jGetElement(blockid, "#sliderHolder" + currentQuestion);
                    $sliderHolder.html('<div id="labelHolder' + currentQuestion + '" class="labelHolder"><table><tr id="labelHolderRow' + currentQuestion + '"></tr></table></div><div id="rangeHolder' + currentQuestion + '"></div>');
                    var $labelHolder = jGetElement(blockid, "#labelHolderRow" + currentQuestion),
                        $rangeHolder = jGetElement(blockid, "#rangeHolder" + currentQuestion);

                    $labelHolder.html('<td class="labelCell"><a href="#" onclick="" class="optionTxt"></a></td>');
                    var $optionTxt = $labelHolder.find(".optionTxt"),
                        $optionCell = $labelHolder.find(".labelCell");

                    var max = $($thisQ).children().length - 1;
                    var numberOfOptions = max + 1;

                    $rangeHolder.html('<form id="form' + currentQuestion + '"> <input id="slider' + currentQuestion + '" aria-label="slider' + currentQuestion + '" type="range" min="0" max = "' + max + '" step="1" class="slider"/> </form> ');

                    $.each($($thisQ).children(), function(index, value)
                    {
                        var $thisOptionTxt;

                        if (index != 0)
                        {
                            $thisOptionTxt = $optionCell.clone().appendTo($labelHolder);
                            $thisOptionTxt = $thisOptionTxt.find(".optionTxt");
                            $thisOptionTxt.after(" ");
                        }
                        else
                        {
                            $thisOptionTxt = $optionTxt;
                        }

                        $thisOptionTxt
                            .attr("for", "option" + index)
                            .html($(value.getAttribute("text")).length < 1 ? '<p>' + x_addLineBreaks(value.getAttribute("text")) + '</p>' : x_addLineBreaks(value.getAttribute("text")));

                        $thisOptionTxt[0].onclick = function()
                        {
                            jGetElement(blockid, "#slider" + currentQuestion)[0].value = index;
                        };

                        correctOptions.push(index + 1 + "");
                        correctAnswer.push(value.getAttribute("text"));
                    });

                    var cellWidth = 100.0/numberOfOptions;
                    jGetElement(blockid, "td.labelCell").css("width", cellWidth + "%");
                    jGetElement(blockid, "#slider" + currentQuestion).css("width", 100-cellWidth + 2 +"%");
                    jGetElement(blockid, "#slider" + currentQuestion).css("margin-left", cellWidth/2 - 1 + "%");

                    name = $thisQ.getAttribute("prompt");

                    if ($thisQ.getAttribute("name"))
                    {
                        name = $thisQ.getAttribute("name");
                    }
                }

                XTEnterInteraction(x_currentPage, questions[currentQuestion], 'numeric', name, correctOptions, correctAnswer, null, x_currentPageXML.getAttribute("grouping"), null);
                $pageContents.data('checked', false);
            }
        }
    };

    this.pageChanged = function()
    {
        $pageContents = jGetElement(blockid, ".pageContents");
    };

    this.trackQuestions = function(blockid)
    {
        var listMode = $pageContents.data('listMode'),
            pageMode = $pageContents.data('pageMode'),
            pageSize = $pageContents.data('pageSize'),
            currentQuestion = $pageContents.data('currentQuestion'),
            questions = $pageContents.data('questions');

        if (listMode || listMode == 'all')
        {
            if (pageMode || (pageMode == undefined && listMode == true))
            {
                for (i=currentQuestion; i<Math.min(currentQuestion + pageSize, questions.length); i++)
                {
                    this.trackQuestion(i, blockid);
                }
            }
            else
            {
                for (i=currentQuestion; i<questions.length; i++)
                {
                    this.trackQuestion(i, blockid);
                }
            }
        }
        else
        {
            this.trackQuestion(currentQuestion, blockid);
        }
        if ($pageContents.data('resultShown') == false)
        {
            this.loadQuestions(blockid);
        }
    };

    this.trackQuestion = function(currentQuestion, blockid)
    {
        x_currentPageXML = XTGetPageXML(x_currentPage, XTGetBlockNr(blockid), questions[currentQuestion]);
        var questions = $pageContents.data('questions'),
            currentQ = $(x_currentPageXML).children().children()[questions[currentQuestion]],
            selected = 0,
            options = $(currentQ).children();
        l_options = [],
            l_answer = [],
            currentQuestionValue = 0;

        if (currentQ.getAttribute("interactivity") == null || currentQ.getAttribute("interactivity") == "slider")
            selected = jGetElement(blockid, "#slider" + currentQuestion)[0].valueAsNumber;
        else if (currentQ.getAttribute("interactivity") == "radio-buttons")
            if (jGetElement(blockid, "#sliderHolder" + currentQuestion + " input:checked")[0] != null)
                selected = jGetElement(blockid, "#sliderHolder" + currentQuestion + " input:checked")[0].score;
        for (var i = 0; i < options.length; i++)
        {
            l_options.push(i + "");
        }

        function calcPercentage(index, count) {
            var value;
            if (index == 0) {
                value = 0;
            } else if (index == count - 1) {
                value = 100;
            } else {
                value = index / (count - 1) * 100;
            }
            return value;
        }

        currentQuestionValue = calcPercentage(selected, options.length);

        if (currentQ.getAttribute("scale") == "true")
        {
            currentQuestionValue = 100 - currentQuestionValue;
        }

        l_answer = Math.round(currentQuestionValue * 10.0) / 10.0;

        var currentQuestionString = currentQuestion + "";

        var answeredValues = $pageContents.data('answeredValues');
        answeredValues[currentQuestionString] = currentQuestionValue;
        $pageContents.data('answeredValues', answeredValues);

        var diagramLabels = $pageContents.data('diagramLabels');
        diagramLabels[currentQuestion] = currentQ;
        $pageContents.data('diagramLabels', diagramLabels);

        var diagramAnswers = $pageContents.data('diagramAnswers');
        diagramAnswers[currentQuestion] = (Math.round(currentQuestionValue * 10.0) / 10.0);
        $pageContents.data('diagramAnswers', diagramAnswers);

        var result = {
            success: true,
            score: Math.round(currentQuestionValue * 10.0) / 10.0
        };

        XTExitInteraction(x_currentPage, questions[currentQuestion], result, l_options, l_answer, null, 0, x_currentPageXML.getAttribute("trackinglabel"));

        // Continue to next question
        $pageContents.data('currentQuestion', $pageContents.data('currentQuestion')+1);

        // If last question has been answered - show results, else continue
        if ($pageContents.data('currentQuestion') == questions.length)
        {
            this.trackOpinion(blockid);
            $pageContents.data('resultShown', true);
        }

        x_pageContentsUpdated();
    };

    this.trackOpinion = function(blockid) {
        // Last question answered - show results
        var JSONGraph = this.createGraphObject();
        if (x_currentPageXML.getAttribute("diagram") !== "true"){
            this.createDiagram(JSONGraph, blockid);
            this.sizeChanged(blockid);
        }

        jGetElement(blockid, ".qNo").html($pageContents.data("onCompletionText"));

        var myScore = 0;
        var answeredValues = $pageContents.data('answeredValues');
        for (var key in answeredValues)
        {
            myScore += answeredValues[key];
        }
        myScore = Math.round(10 * myScore / Object.keys(answeredValues).length) / 10;

        var feedbackText = x_currentPageXML.getAttribute("feedback") != '' ? "<p>" + x_addLineBreaks(x_currentPageXML.getAttribute("feedback")) + "</p>" : '';
        if ($pageContents.data('showfeedback') && feedbackText != '') {
            jGetElement(blockid, ".feedback").html(feedbackText);
        } else {
            jGetElement(blockid, ".feedback").remove();
        }
        jGetElement(blockid, "#questionAudio").empty();

        if (x_currentPageXML.getAttribute("diagram") !== "true"){
            jGetElement(blockid, ".diagram").show();
        } else {
            jGetElement(blockid, ".diagram").hide();
        }
        jGetElement(blockid, ".qHolder").hide();
        jGetElement(blockid, ".checkBtn").hide();

        XTSetPageScoreJSON(x_currentPage, myScore, JSON.stringify(JSONGraph), x_currentPageXML.getAttribute("trackinglabel"));
        $pageContents.data('checked', true);
    };

    this.createGraphObject = function()
    {
        var classNames = [],
            classTitles = [],
            classValues = [],
            classWeighting = [];

        var diagramLabels = $pageContents.data('diagramLabels'),
            diagramAnswers = $pageContents.data('diagramAnswers');

        for(var i = 0; i< diagramLabels.length; i++){
            var q = diagramLabels[i];
            classNames[q.parentNode.classId] = q.parentNode.getAttribute("name");
            if (typeof q.parentNode.getAttribute("title") != "undefined" && q.parentNode.getAttribute("title") != "") {
                classTitles[q.parentNode.classId] = q.parentNode.getAttribute("title");
            }
            else
            {
                classTitles[q.parentNode.classId] = classNames[q.parentNode.classId];
            }
            if(classValues[q.parentNode.classId] != undefined){
                classValues[q.parentNode.classId] = classValues[q.parentNode.classId] + (diagramAnswers[i]* diagramLabels[i].getAttribute("classWeight"));
                classWeighting[q.parentNode.classId] = parseInt(classWeighting[q.parentNode.classId]) + parseInt(diagramLabels[i].getAttribute("classWeight"));
            }
            else{
                classValues[q.parentNode.classId] =(diagramAnswers[i]* diagramLabels[i].getAttribute("classWeight"));
                classWeighting[q.parentNode.classId] = diagramLabels[i].getAttribute("classWeight");
            }
        }
        for(var j=0; j<classValues.length;j++){
            classValues[j] = classValues[j] / classWeighting[j];
        }

        return {
            label: x_currentPageXML.getAttribute("name"),
            classnames: classNames,
            classtitles: classTitles,
            classvalues: classValues
        };

    };

    this.createDiagram = function(graphObject, blockid)
    {
        var htmlToChar = function(h){return $("<div>").html(h).text();},
            classTitles = graphObject.classtitles.map(function(a){return htmlToChar(a);}),
            classValues = graphObject.classvalues;

        function hexToRgb(hex, opa) {
            var bigint = parseInt(hex, 16);
            var r = (bigint >> 16) & 255;
            var g = (bigint >> 8) & 255;
            var b = bigint & 255;

            return "rgba(" + r + "," + g + "," + b + "," + opa + ")";
        }

        var bgColourIn = "0x000000";
        if (x_currentPageXML.getAttribute("colour") != null) {
            bgColourIn = x_currentPageXML.getAttribute("colour");
        }
        var bgColour = hexToRgb(bgColourIn.substr(bgColourIn.length - 6), 0.5);
        var lnColour = hexToRgb(bgColourIn.substr(bgColourIn.length - 6), 1);
        var ctx = jGetElement(blockid, ".diagram");

        var myRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: classTitles,
                datasets: [{
                    label: htmlToChar(x_currentPageXML.getAttribute("name")),
                    data: classValues,
                    backgroundColor: bgColour,
                    borderColor: lnColour
                }]
            },
            options: {
                scale: {
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                        fontSize: $pageContents.data('textSize') - 10
                    },
                    pointLabels: {
                        fontSize: $pageContents.data('textSize')
                    }
                },
                legend: {
                    labels: {
                        fontSize: $pageContents.data('textSize')
                    },
                    display: x_currentPageXML.getAttribute("key") == 'false' ? false : true,
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    };

    this.init = function(pageXML, blockid) {
        x_currentPageXML = pageXML;

        $pageContents = jGetElement(blockid, ".pageContents");

        $pageContents.data({
            'listMode': false,
            'pageMode': true,
            'pageSize': 10,
            'answeredValues': {},
            'diagramLabels': [],
            'diagramAnswers': []
        });

        if (x_currentPageXML.getAttribute("list") != undefined) {
            $pageContents.data('listMode', x_currentPageXML.getAttribute("list") === "true" ? true : x_currentPageXML.getAttribute("list") === "all" ? "all" : false);
        }

        if (x_currentPageXML.getAttribute("paging") != undefined) {
            $pageContents.data('pageMode', x_currentPageXML.getAttribute("paging") === "true");
        }

        if (x_currentPageXML.getAttribute("pagesize") != undefined) {
            $pageContents.data('pageSize', parseInt(x_currentPageXML.getAttribute("pagesize")));
        }

        var panelWidth = x_currentPageXML.getAttribute("panelWidth"),
            $splitScreen = jGetElement(blockid, ".pageContents .splitScreen"),
            $textHolder = jGetElement(blockid, ".textHolder");

        if (panelWidth == "Full")
        {
            jGetElement(blockid, ".infoHolder .panel").appendTo($pageContents);
            $splitScreen.remove();
        }
        else
        {
            $textHolder.html(x_addLineBreaks(x_currentPageXML.getAttribute("instructions")));
            var textAlign = x_currentPageXML.getAttribute("align");

            if (textAlign != "right")
            {
                if (panelWidth == "Small")
                {
                    $splitScreen.addClass("large");
                }
                else if (panelWidth == "Large")
                {
                    $splitScreen.addClass("small");
                }
                else
                {
                    $splitScreen.addClass("medium");
                }
            }
            else
            {
                $textHolder
                    .removeClass("left")
                    .addClass("right")
                    .appendTo($splitScreen);
                jGetElement(blockid, ".infoHolder")
                    .removeClass("right")
                    .addClass("left");
                if (panelWidth == "Small")
                {
                    $splitScreen.addClass("medium");
                }
                else if (panelWidth == "Large")
                {
                    $splitScreen.addClass("xlarge");
                }
                else
                {
                    $splitScreen.addClass("large");
                }
            }
        }

        if (panelWidth != "Full" && x_currentPageXML.getAttribute("img") != undefined && x_currentPageXML.getAttribute("img") != "")
        {
            var tip = x_currentPageXML.getAttribute("tip") != undefined && x_currentPageXML.getAttribute("tip") != "" ?
                'alt="' + x_currentPageXML.getAttribute("tip") + '"' : "";
            $textHolder.append('<img class="opinionImg" src="' + x_evalURL(x_currentPageXML.getAttribute("img")) + '"' + tip +'>');
        }

        var submitBtnText = x_currentPageXML.getAttribute("submitBtnText");
        if (submitBtnText == undefined)
        {
            submitBtnText = "Submit";
        }
        var resetBtnText = x_currentPageXML.getAttribute("resetBtnText");
        if (resetBtnText == undefined)
        {
            resetBtnText = "Reset";
        }

        var onCompletionText = x_currentPageXML.getAttribute("onCompletion");
        if (onCompletionText == undefined)
        {
            onCompletionText = "You have completed the questionaire";
        }

        $pageContents.data({
            "onCompletionText"	:onCompletionText,
        });

        // submit button
        jGetElement(blockid, ".checkBtn")
            .button({
                label: submitBtnText
            })
            .click(function() {
                opinion.trackQuestions(blockid);
            });

        // reset button
        jGetElement(blockid, ".resetBtn")
            .button({
                label: resetBtnText
            })
            .click(function() {
                if ($(x_currentPageXML).children().length > 0) {
                    $pageContents.data({
                        'answeredValues': {},
                        'diagramLabels': [],
                        'diagramAnswers': []
                    });

                    opinion.startQuestions(blockid);
                }
            });

        this.startQuestions(blockid);
        this.sizeChanged(blockid);
        x_pageLoaded();
    }
};