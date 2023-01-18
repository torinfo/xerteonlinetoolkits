/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created with JetBrains PhpStorm.
 * User: tom
 * Date: 28-3-13
 * Time: 11:47
 * To change this template use File | Settings | File Templates.
 */


function makeId(page_nr, ia_nr, ia_type, ia_name)
{
    var tmpid = 'urn:x-xerte:p-' + (page_nr + 1);
    if (ia_nr >= 0)
    {
        tmpid += ':' + (ia_nr + 1);
        if (ia_type.length > 0)
        {
            tmpid += '-' + ia_type;
        }
    }

    if (ia_name)
    {
        // ia_nam can be HTML, just extract text from it
        var div = $("<div>").html(ia_name);
        var strippedName = div.text();
        tmpid += ':' + encodeURIComponent(strippedName.replace(/[^a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
        // Truncate to max 255 chars, this should be 4000
        tmpid = tmpid.substr(0,255);
    }
    return tmpid;
}

function PedITTrackingState()
{
	this.initialised = false;
    this.ALOConnectionPoint = null;
    this.trackingmode = "full";
    this.mode = "normal";
    this.scoremode = 'first';
    this.nrpages = 0;
    this.toCompletePages = new Array();
    this.completedPages = new Array();
    this.start = new Date();
    this.interactions = new Array();
    this.lo_completed = 0;
    this.lo_passed = -1;
    this.lo_type = "pages only";

    this.page_timeout = 5000;
    this.forcetrackingmode = false;


    this.initialise = initialise;
    this.pageCompleted = pageCompleted;
    this.getCompletionStatus = getCompletionStatus;
    this.getCompletionPercentage = getCompletionPercentage;
    this.getSuccessStatus = getSuccessStatus;
    this.getdScaledScore = getdScaledScore;
    this.getdRawScore = getdRawScore;
    this.getdMinScore = getdMinScore;
    this.getdMaxScore = getdMaxScore;
    this.getScaledScore = getScaledScore;
    this.getRawScore = getRawScore;
    this.getMinScore = getMinScore;
    this.getMaxScore = getMaxScore;
    this.setPageType = setPageType;
    this.setPageScore = setPageScore;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
    this.findCreate = findCreate;
    this.enterPage = enterPage;


    function initialise()
    {
        this.ALOConnectionPoint = new ALOConnection();

        this.ALOConnectionPoint.handshake();
    }

    function getCompletionStatus()
    {
        var completed = true;
        for(var i = 0; i<state.completedPages.length; i++)
        {
            if(state.completedPages[i] == false)
            {
                completed = false;
                break;
            }
            //if( i == state.completedPages.length-1 && state.completedPages[i] == true)
            //{
            //completed = true;
            //
        }

        if (completed)
        {
            return "completed";

        }
        else if(!completed)
        {
            return 'incomplete';
        }
        else
        {
            return "unknown"
        }
    }

    function getCompletionPercentage()
    {
        var completed = true;
        var completedpages = 0;
        if (state.completedPages.length == 0)
        {
            return 0;
        }
        for(var i = 0; i<state.completedPages.length; i++)
        {
            if(state.completedPages[i] == true)
            {
                completedpages++;
            }
        }
        return (completedpages / state.completedPages.length) * 100.0;
    }

    function getSuccessStatus()
    {
        if (this.lo_type != "pages only")
        {
            if (state.getScaledScore() > state.lo_passed)
            {
                return "passed";
            }
            else
            {
                return "failed";
            }
        }
        else
        {
            if (getCompletionStatus() == 'completed')
            {
                return "passed";
            }
            else
            {
                return "unknown";
            }
        }
    }

    function getdScaledScore()
    {
        return this.getdRawScore() / (this.getdMaxScore() - this.getdMinScore());
    }

    function getScaledScore()
    {
        return Math.round(this.getdScaledScore()*100)/100 + "";
    }

    function getdRawScore()
    {
        if (this.lo_type == "pages only")
        {
            if (getCompletionStatus() == 'completed')
                return 100;
            else
                return 0;
        }
        else
        {
            var score = [];
            var weight = [];
            var totalweight = 0.0;
            // Walk passed the pages
            var i=0;
            for (i=0; i<this.nrpages; i++)
            {
                var sit = this.findPage(i);
                if (sit != null && sit.weighting > 0)
                {
                    totalweight += sit.weighting;
                    score.push(sit.score);
                    weight.push(sit.weighting);
                }
            }
            var totalscore = 0.0;
            if (totalweight > 0.0)
            {
                for (i=0; i<score.length; i++)
                {
                    totalscore += (score[i] * weight[i]);
                }
                totalscore = totalscore / totalweight;
            }
            else
            {
                // If the weight is 0.0, set the score to 100
                totalscore = 100.0;
            }
            return Math.round(totalscore*100)/100;
        }
    }

    function getRawScore()
    {
        return this.getdRawScore() + "";
    }

    function getdMinScore()
    {
        if (this.lo_type == "pages only")
        {
            return 0.0;
        }
        else
        {
            return 0.0;
        }
    }

    function getMinScore()
    {
        return this.getdMinScore() + "";
    }

    function getdMaxScore()
    {
        if (this.lo_type == "pages only")
        {
            return 100.0;
        }
        else
        {
            return 100.0;
        }
    }

    function getMaxScore()
    {
        return this.getdMaxScore() + "";
    }


    function pageCompleted(sit)
    {
        for (i=0; i<sit.nrinteractions; i++)
        {
            var sit2 = this.findInteraction(sit.page_nr, i);
            if (sit2 == null)
            {
                return false;
            }
        }
        if (sit.ia_type=="page" && sit.duration < this.page_timeout)
        {
            return false;
        }
        return true;
    }

    function enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback)
    {
    	interaction = new NoopTracking(page_nr, ia_nr, ia_type, ia_name);
    	interaction.enterInteraction(correctanswer, correctoptions);
        this.interactions.push(interaction);
    }

    function exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback)
    {
    	var sit = this.findInteraction(page_nr, ia_nr);
    	if(ia_nr != -1){
    		sit.exitInteraction(result,learneranswer, learneroptions, feedback);
    	}
    	sit.exit();
    	if (ia_nr<0) {
            var temp = false;
            var i = 0;
            for (i = 0; i < state.toCompletePages.length; i++) {
                var currentPageNr = state.toCompletePages[i];
                if (currentPageNr == page_nr) {
                    temp = true;
                    break;
                }
            }
            if (temp) {
                if (!state.completedPages[i]) {
                    var sit = state.findInteraction(page_nr, -1);
                    if (sit != null) {
                        // Skip results page completely
                        if (sit.ia_type != "result") {
                            state.completedPages[i] = state.pageCompleted(sit);
                        }
                    }
                }
            }
        }
    }

    function setPageType(page_nr, page_type, nrinteractions, weighting)
    {
    	var sit = state.findPage(page_nr);
        if (sit != null)
        {
            sit.ia_type = page_type;

            sit.nrinteractions = nrinteractions;
            sit.weighting = parseFloat(weighting);
        }
    }

    function setPageScore(page_nr, score)
    {
    	var sit = state.findPage(page_nr);
        if (sit != null && (state.scoremode != 'first' || sit.count < 1))
        {
            sit.score = score;
            sit.count++;
        }
    }

    function findCreate(page_nr, ia_nr, ia_type, ia_name)
    {
        var tmpid = makeId(page_nr, ia_nr, ia_type, ia_name);
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == tmpid)
                return this.interactions[i];
        }
        // Not found
        var sit =  new NoopTracking(page_nr, ia_nr, ia_type, ia_name);
        if (ia_type != "page" && ia_type != "result")
        {
            this.lo_type = "interactive";
            if (this.lo_passed == -1)
            {
                this.lo_passed = 0.55;
            }
        }

        this.interactions.push(sit);
        return sit;
    }

    function find(id)
    {
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].id == id)
                return this.interactions[i];
        }

        return null;
    }

    function findPage(page_nr)
    {
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].page_nr == page_nr && this.interactions[i].ia_nr == -1)
                return this.interactions[i];
        }
        return null;
    }

    function findInteraction(page_nr, ia_nr)
    {
        if (ia_nr < 0)
        {
            return this.findPage(page_nr);
        }
        var i=0;
        for (i=0; i<this.interactions.length; i++)
        {
            if (this.interactions[i].page_nr == page_nr && this.interactions[i].ia_nr == ia_nr)
                return this.interactions[i];
        }
        return null;
    }


    function enterPage(page_nr, ia_nr, ia_type, ia_name)
    {
        var sit = this.findCreate(page_nr, ia_nr, ia_type, ia_name);
        return sit;
    }


}

function NoopTracking(page_nr, ia_nr, ia_type, ia_name)
{
    this.id = makeId(page_nr, ia_nr, ia_type, ia_name);
	this.page_nr = page_nr;
	this.ia_nr = ia_nr;
    this.ia_type = ia_type;
    this.ia_name = ia_name;
    this.start = new Date();
    this.end = this.start;
    this.count = 0;
    this.duration = 0;
    this.nrinteractions = 0;
    this.weighting = 0.0;
    this.score = 0.0;
    this.correctOptions = [];
    this.correctAnswers = [];
    this.learnerAnswers = [];
    this.learnerOptions = [];

    this.exit = exit;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;

    function exit()
    {
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        if (duration > 100)
        {
            this.duration += duration;
            this.count++;
            return true;
        }
        else
        {
            return false;
        }

    }

    function enterInteraction(correctAnswers, correctOptions)
    {
    	this.correctAnswers = correctAnswers;
        this.correctOptions = correctOptions;
    }

    function exitInteraction(result, learnerAnswers, learnerOptions, feedback)
    {
    	this.learnerAnswers = learnerAnswers;
        this.learnerOptions = learnerOptions;
        this.result = result;
        this.feedback = feedback;
    }

}





var state = new PedITTrackingState();

function XTInitialise()
{
    // Tom Reijnders 2022-10-06: Trying to handle tracking of standalone pages where the page is a page of the same LO
    // Specifically when the standalone page is shown in a lightbox
    // We make use of the fact that in javascript, assigning a variable is done through reference, so we actually
    // point the state variable (of the standalone page) to the parent state variable (of the main LO)
    if (parent != self && parent.x_TemplateId != undefined && parent.x_TemplateId == x_TemplateId && parent.state != undefined) {
        state = parent.state;
    }
    else {
        if (!state.initialised) {
            state.initialised = true;
            state.initialise();
        }
    }
}

function XTTrackingSystem()
{
    return "";
}

function XTLogin(login, passwd)
{
    return true;
}

function XTGetMode()
{
    return "normal";
}

function XTStartPage()
{
    return -1;
}

function XTGetUserName()
{
    return "";
}

function XTNeedsLogin()
{
    return false;
}

function XTSetOption(option, value)
{
    switch (option)
    {
        case "nrpages":
            state.nrpages = value;
            break;
        case "toComplete":
            state.toCompletePages = value;
            for(i = 0; i< state.toCompletePages.length;i++)
            {
                state.completedPages[i] = false;
            }
            break;
        case "tracking-mode":
            switch(value)
            {
                case 'full_first':
                    state.trackingmode = "full";
                    state.scoremode = "first";
                    //state.mode = "normal";
                    break;
                case 'minimal_first':
                	state.trackingmode = "minimal";
                	state.scoremode = "first";
                	//state.mode = "normal";
                    break;
                case 'full':
                	state.trackingmode = "full";
                	state.scoremode = "last";
                	//state.mode = "normal";
                    break;
                case 'minimal':
                	state.trackingmode = "minimal";
                	state.scoremode = "last";
                	//state.mode = "normal";
                    break;
                case 'none':
                	state.trackingmode = "none";
                	//state.mode = "no-tracking";
                    break;
            }
            break;
        case "completed":
        	state.lo_completed = value;
            break;
        case "objective_passed":
        	state.lo_passed = Number(value);
            break;
        case "page_timeout":
            // Page timeout in seconds
            state.page_timeout = Number(value) * 1000;
            break;
        case "force_tracking_mode":
            state.forcetrackingmode = value;
            break;
    }
}

function XTEnterPage(page_nr, page_name)
{
	state.enterPage(page_nr, -1, "page", page_name);
}

function XTExitPage(page_nr)
{
    state.exitInteraction(page_nr, -1, false, "", "", "", false);
    XTSendScoreToPedIT();
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{
	state.setPageType(page_nr, page_type, nrinteractions, weighting);
}

function XTSetPageScore(page_nr, score)
{
	state.setPageScore(page_nr, score);
    XTSendScoreToPedIT();
}

function XTSetPageScoreJSON(page_nr, score)
{
    state.setPageScore(page_nr, score);
}

function XTSetViewed(page_nr, name, score)
{
    state.setPageScore(page_nr, score);
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback)
{
	state.enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctanswer, feedback);
}

function XTExitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback)
{
	state.exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback);
	//XTSendScoreToPedIT();
}

function XTGetInteractionScore(page_nr, ia_nr, ia_type, ia_name, idName, callback)
{
    var JSONGraph = {
        label: "Enter Page Title",
        classnames: ["C-1", "C-2", "C-3"],
        classvalues: [0, 30, 20]
    };
    var JSONGraph2 = {
        label: "Enter Page Title",
        classnames: ["C-1", "C-2", "C-3"],
        classvalues: [100, 30, 40]
    };
    var JSONGraphArray = [JSONGraph, JSONGraph2];
    callback(JSONGraphArray);
}

function XTGetInteractionCorrectAnswer(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}

function XTGetInteractionCorrectAnswerFeedback(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}

function XTGetInteractionLearnerAnswer(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}

function XTGetInteractionLearnerAnswerFeedback(page_nr, ia_nr, ia_type, ia_name)
{
    return "";
}

function XTSendScoreToPedIT()
{
    // Duration
    var end = new Date();
    var delta = Math.abs(end.getTime() - state.start.getTime()) / 1000;
    var completion, nrvisited=0, nrcompleted=0;

    // Get Full completion (like in results)
    $.each(state.completedPages, function (i, completed) {
        // indices not defined will be visited anyway.
        // In that case 'completed' will be undefined
        if (completed) {
            nrcompleted++;
        }
        if (typeof(completed) != "undefined") {
            nrvisited++;
        }
    })

    if (nrcompleted != 0) {
        completion = Math.round((nrcompleted / state.toCompletePages.length) * 100);
    }
    else {
        completion = 0;
    }

    // Send results to PedIT
    state.ALOConnectionPoint.notify("activity",
        {
            completed: completion,
            score: Math.round(state.getRawScore()),
            passed: (state.getSuccessStatus() == "passed"),
            duration: Math.round(delta)
        });
}

function XTTerminate()
{
    XTSendScoreToPedIT();
}

function XTResults(fullcompletion) {
    var completion = 0;
    var nrcompleted = 0;
    var nrvisited = 0;
    var completed;
    $.each(state.completedPages, function (i, completed) {
        // indices not defined will be visited anyway.
        // In that case 'completed' will be undefined
        if (completed) {
            nrcompleted++;
        }
        if (typeof(completed) != "undefined") {
            nrvisited++;
        }
    })

    if (nrcompleted != 0) {
        if (!fullcompletion) {
            completion = Math.round((nrcompleted / nrvisited) * 100);
        }
        else {
            completion = Math.round((nrcompleted / state.toCompletePages.length) * 100);
        }
    }
    else {
        completion = 0;
    }

    var results = {};
    results.mode = x_currentPageXML.getAttribute("resultmode");

    var score = 0,
        nrofquestions = 0,
        totalWeight = 0,
        totalDuration = 0;
    results.interactions = Array();

    for (i = 0; i < state.interactions.length - 1; i++) {


        score += state.interactions[i].score * state.interactions[i].weighting;
        if (state.interactions[i].ia_nr < 0 || state.interactions[i].nrinteractions > 0) {

            var interaction = {};
            interaction.score = Math.round(state.interactions[i].score);
            interaction.title = state.interactions[i].ia_name;
            interaction.type = state.interactions[i].ia_type;
            interaction.correct = state.interactions[i].result;
            interaction.duration = Math.round(state.interactions[i].duration / 1000);
            interaction.weighting = state.interactions[i].weighting;
            interaction.subinteractions = Array();

            var j = 0;
            for (j; j < state.toCompletePages.length; j++) {
                var currentPageNr = state.toCompletePages[j];
                if (currentPageNr == state.interactions[i].page_nr) {
                    if (state.completedPages[j]) {
                        interaction.completed = "true";
                    }
                    else if (!state.completedPages[j]) {
                        interaction.completed = "false";
                    }
                    else {
                        interaction.completed = "unknown";
                    }
                }
            }

            results.interactions[nrofquestions] = interaction;
            totalDuration += state.interactions[i].duration;
            nrofquestions++;
            totalWeight += state.interactions[i].weighting;

        }
        else if (results.mode == "full-results") {
            var subinteraction = {};

            var learnerAnswer, correctAnswer;
            switch (state.interactions[i].ia_type) {
                case "match":
                    // If unique targets, match answers by target, otherwise match by source
                    const targets = [];
                    for (let j = 0; j < state.interactions[i].nrinteractions; j++) {
                        targets.push(state.interactions[i].correctOptions[c].target);
                    }
                    // Check whether values of targets are unique
                    const uniqueTargets = targets.length === new Set(targets).size;
                    for (var c = 0; c < state.interactions[i].correctOptions.length; c++) {
                        var matchSub = {}; //Create a subinteraction here for every match sub instead
                        correctAnswer = state.interactions[i].correctOptions[c].source + ' --> ' + state.interactions[i].correctOptions[c].target;
                        let source = state.interactions[i].correctOptions[c].source;
                        let target = state.interactions[i].correctOptions[c].target;
                        if (state.interactions[i].learnerOptions.length == 0) {
                            if (uniqueTargets) {
                                learnerAnswer = ' --> ' + target;
                            }
                            else {
                                learnerAnswer = source + ' --> ' + ' ';
                            }
                        }
                        else {
                            for (var d = 0; d < state.interactions[i].learnerOptions.length; d++) {
                                if (uniqueTargets)
                                {
                                    if (target == state.interactions[i].learnerOptions[d].target) {
                                        learnerAnswer = state.interactions[i].learnerOptions[d].source + ' --> ' + target;
                                        break;
                                    } else {
                                        learnerAnswer = ' --> ' + target;
                                    }
                                }
                                else
                                {
                                    if (source == state.interactions[i].learnerOptions[d].source) {
                                        learnerAnswer = source + ' --> ' + state.interactions[i].learnerOptions[d].target;
                                        break;
                                    } else {
                                        learnerAnswer = source + ' --> ' + ' ';
                                    }
                                }
                            }
                        }

                        matchSub.question = state.interactions[i].ia_name;
                        matchSub.correct = (learnerAnswer === correctAnswer);
                        matchSub.learnerAnswer = learnerAnswer;
                        matchSub.correctAnswer = correctAnswer;
                        results.interactions[nrofquestions - 1].subinteractions.push(matchSub);
                    }
                    break;
                case "text":
                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = state.interactions[i].correctAnswers;
                    break;
                case "multiplechoice":
                    learnerAnswer = state.interactions[i].learnerAnswers[0] != undefined ? state.interactions[i].learnerAnswers[0] : "";
                    for (var j = 1; j < state.interactions[i].learnerAnswers.length; j++) {
                        learnerAnswer += "\n" + state.interactions[i].learnerAnswers[j];
                    }
                    correctAnswer = "";
                    for (var j = 0; j < state.interactions[i].correctAnswers.length; j++) {
                        if (correctAnswer.length > 0)
                            correctAnswer += "\n";
                        correctAnswer += state.interactions[i].correctAnswers[j];
                    }
                    break;
                case "numeric":

                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = "-";  // Not applicable
                    //TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
                    break;
                case "fill-in":
                    learnerAnswer = state.interactions[i].learnerAnswers;
                    correctAnswer = state.interactions[i].correctAnswers;
                    break;
            }
            if (state.interactions[i].ia_type != "match") {
                subinteraction.question = state.interactions[i].ia_name;
                subinteraction.correct = state.interactions[i].result.success;
                subinteraction.learnerAnswer = learnerAnswer;
                subinteraction.correctAnswer = correctAnswer;
                results.interactions[nrofquestions - 1].subinteractions.push(subinteraction);
            }
        }
    }
    results.completion = completion;
    results.score = score;
    results.nrofquestions = nrofquestions;
    results.averageScore = state.getScaledScore() * 100;
    results.totalDuration = Math.round(totalDuration / 1000);
    results.start = state.start.toLocaleString();

    //$.ajax({
    //    type: "POST",
    //    url: window.location.href,
    //    data: {
    //        grade: results.averageScore / 100
    //    }
    //});

    return results;
}

