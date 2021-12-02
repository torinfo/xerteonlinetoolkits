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

const trackingManager = new TrackingManager();

trackingManager.debug = true;

function XTInitialise(category)
{
	if (! trackingManager.initialised)
    {
        trackingManager.initialised = true;
        trackingManager.initialise();
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

function XTGetMode(extended)
{
    if (trackingManager.forcetrackingmode === 'true') {
        if (trackingManager.trackingmode !== "none") {
            if (extended != null && (extended == true || extended == 'true')) {
                if (trackingManager.scoremode == "first")
                    return "normal";
                else
                    return "normal-last";
            }
            else {
                return "normal";
            }
        }
        else {
            return "tracking";
        }
    }
    else
        return "";
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
            trackingManager.nrpages = value;
            break;
        case "toComplete":
            trackingManager.toCompletePages = value;
            break;
        case "tracking-mode":
            switch(value)
            {
                case 'full_first':
                    trackingManager.trackingmode = "full";
                    trackingManager.scoremode = "first";
                    //trackingManager.mode = "normal";
                    break;
                case 'minimal_first':
                	trackingManager.trackingmode = "minimal";
                	trackingManager.scoremode = "first";
                	//trackingManager.mode = "normal";
                    break;
                case 'full':
                	trackingManager.trackingmode = "full";
                	trackingManager.scoremode = "last";
                	//trackingManager.mode = "normal";
                    break;
                case 'minimal':
                	trackingManager.trackingmode = "minimal";
                	trackingManager.scoremode = "last";
                	//trackingManager.mode = "normal";
                    break;
                case 'none':
                	trackingManager.trackingmode = "none";
                	//trackingManager.mode = "no-tracking";
                    break;
            }
            break;
        case "completed":
        	trackingManager.lo_completed = value;
            break;
        case "objective_passed":
        	trackingManager.lo_passed = Number(value) * 100;
            break;
        case "page_timeout":
            // Page timeout in seconds
            trackingManager.page_timeout = Number(value) * 1000;
            break;
        case "force_tracking_mode":
            trackingManager.forcetrackingmode = value;
            break;
    }
}

function XTEnterPage(page_nr, page_name, grouping)
{

	trackingManager.enterPage(page_nr,"page", page_name);
}

function XTExitPage(page_nr)
{
    trackingManager.exitPage(page_nr);
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting)
{
	trackingManager.setPageType(page_nr, page_type, nrinteractions, weighting);
}

function XTSetPageScore(page_nr, score)
{
	trackingManager.setPageScore(page_nr, score);
}

function XTSetPageScoreJSON(page_nr, score)
{
    trackingManager.setPageScore(page_nr, score);
}

function XThelperConsolidateSegments(videotrackingManager)
{
    // 1. Sort played segments on start time (first make a copy)
    var segments = $.extend(true, [], videotrackingManager.segments);
    segments.sort(function(a,b) {return (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : 0);} );
    // 2. Combine the segments
    var csegments = [];
    var i=0;
    while(i<segments.length) {
        var segment = $.extend(true, {}, segments[i]);
        i++;
        while (i<segments.length && segment.end >= segments[i].start) {
            segment.end = segments[i].end;
            i++;
        }
        csegments.push(segment);
    }
    return csegments;
}

function XThelperDetermineProgress(videotrackingManager)
{
    var csegments = XThelperConsolidateSegments(videotrackingManager);
    var videoseen = 0;
    for (var i=0; i<csegments.length; i++)
    {
        videoseen += csegments[i].end - csegments[i].start;
    }
    // normalized between 0 and 1
    if (!isNaN(videotrackingManager.duration) && videotrackingManager.duration > 0) {
        return Math.round(videoseen / videotrackingManager.duration * 100.0) / 100.0;
    }
    return 0.0;
}

function XTVideo(page_nr, name, block_name, verb, videotrackingManager, grouping) {
    return;
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, grouping)
{
	trackingManager.enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback);
}

function XTExitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback)
{
	trackingManager.exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback);
}

function XTSetInteractionPageXML(page_nr, ia_nr, pageXML){
    trackingManager.setInteractionPageXML(page_nr, ia_nr, pageXML);
}

function XTGetPageXML(page_nr, ia_nr){

    return trackingManager.getInteractionPageXML(page_nr, ia_nr);
}

function XTGetInteractionScore(page_nr, ia_nr, ia_type, ia_name, full_id, callback, q)
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

function XTTerminate()
{
    if (!trackingManager.finished) {
        // End tracking of page
        x_endPageTracking(false, -1);

        // This code is probably obsolete, leave it in to allow for more testing
        var currentpageid = "";
        trackingManager.finished = true;
        if (trackingManager.currentid) {
            var sit = trackingManager.find(currentid);
            // there is still an interaction open, close it
            if (sit != null) {
                trackingManager.exitInteraction(sit.page_nr, sit.ia_nr, false, "", "", "", false);
            }
        }
        if (trackingManager.currentpageid) {
            currentpageid = trackingManager.currentpageid;
            var sit = trackingManager.find(currentpageid);
            // there is still an interaction open, close it
            if (sit != null) {
                trackingManager.exitInteraction(sit.page_nr, sit.ia_nr, false, "", "", "", false);
            }

        }
        if (typeof lti_enabled !== 'undefined' && lti_enabled) {
            // Send ajax request to store grade through LTI to gradebook
            var url = window.location.href;
            if (url.indexOf("lti_launch.php") >= 0) {
                url = url.replace("lti_launch.php", "website_code/php/lti/sendgrade.php");
            } else if (url.indexOf("lti13_launch.php") >= 0) {
                url = url.replace("lti13_launch.php", "website_code/php/lti/sendgrade.php");
            } else {
                url = "";
            }
            if (url.length > 0) {
                $.ajax({
                    method: "POST",
                    url: url,
                    data: {
                        grade: trackingManager.getdScaledScore()
                    }
                })
                    .done(function (msg) {
                        //alert("Data Saved: " + msg);
                    });
            }
        }

    }
}

function XTResults(fullcompletion) {

    var completion = 0;
    var nrcompleted = 0;
    var nrvisited = 0;
    var completed;
    $.each(trackingManager.completedPages, function (i, completed) {
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
            completion = Math.round((nrcompleted / trackingManager.toCompletePages.length) * 100);
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

    for (i = 0; i < trackingManager.pageStates.length - 1; i++) {

        if (trackingManager.pageStates[i].nrinteractions > 0) {
            score += trackingManager.pageStates[i].score * trackingManager.pageStates[i].weighting;
            var interaction = {};
            interaction.score = Math.round(trackingManager.pageStates[i].score);
            interaction.title = trackingManager.pageStates[i].ia_name;
            interaction.type = trackingManager.pageStates[i].ia_type;
            interaction.correct = trackingManager.pageStates[i].result;
            interaction.duration = Math.round(trackingManager.pageStates[i].duration / 1000);
            interaction.weighting = trackingManager.pageStates[i].weighting;
            interaction.subinteractions = Array();

            var j = 0;
            for (j; j < trackingManager.toCompletePages.length; j++) {
                var currentPageNr = trackingManager.toCompletePages[j];
                if (currentPageNr == trackingManager.pageStates[i].page_nr) {
                    if (trackingManager.completedPages[j]) {
                        interaction.completed = "true";
                    }
                    else if (!trackingManager.completedPages[j]) {
                        interaction.completed = "false";
                    }
                    else {
                        interaction.completed = "unknown";
                    }
                }
            }

            results.interactions[nrofquestions] = interaction;
            totalDuration += trackingManager.pageStates[i].duration;
            nrofquestions++;
            totalWeight += trackingManager.pageStates[i].weighting;

            if(results.mode == "full-results"){

                for (var x = 0; x < trackingManager.pageStates[i].interactions.length; x++) {
                    var subinteraction = {};

                    var learnerAnswer, correctAnswer;
                    switch (trackingManager.pageStates[i].interactions[x].ia_type) {
                        case "match":
                            for (var c = 0; c < trackingManager.pageStates[i].interactions[x].correctOptions.length; c++) {
                                var matchSub = {}; //Create a subinteraction here for every match sub instead
                                correctAnswer = trackingManager.pageStates[i].interactions[x].correctOptions[c].source + ' --> ' + trackingManager.pageStates[i].interactions[x].correctOptions[c].target;
                                source = trackingManager.pageStates[i].interactions[x].correctOptions[c].source;
                                if (trackingManager.pageStates[i].interactions[x].learnerOptions.length == 0) {
                                    learnerAnswer = source + ' --> ' + ' ';
                                }
                                else {
                                    for (var d = 0; d < trackingManager.pageStates[i].interactions[x].learnerOptions.length; d++) {
                                        if (source == trackingManager.pageStates[i].interactions[x].learnerOptions[d].source) {
                                            learnerAnswer = source + ' --> ' + trackingManager.pageStates[i].interactions[x].learnerOptions[d].target;
                                            break;
                                        }
                                        else {
                                            learnerAnswer = source + ' --> ' + ' ';
                                        }
                                    }
                                }

                                matchSub.question = trackingManager.pageStates[i].interactions[x].ia_name;
                                matchSub.correct = (learnerAnswer === correctAnswer);
                                matchSub.learnerAnswer = learnerAnswer;
                                matchSub.correctAnswer = correctAnswer;
                                results.interactions[i].subinteractions.push(matchSub);
                            }

                            break;
                        case "text":
                            learnerAnswer = trackingManager.pageStates[i].interactions[x].learnerAnswers;
                            correctAnswer = trackingManager.pageStates[i].interactions[x].correctAnswers;
                            break;
                        case "multiplechoice":
                            learnerAnswer = trackingManager.pageStates[i].interactions[x].learnerAnswers[0] != undefined ? trackingManager.pageStates[i].interactions[x].learnerAnswers[0] : "";
                            for (var j = 1; j < trackingManager.pageStates[i].interactions[x].learnerAnswers.length; j++) {
                                learnerAnswer += "\n" + trackingManager.pageStates[i].interactions[x].learnerAnswers[j];
                            }
                            correctAnswer = "";
                            for (var j = 0; j < trackingManager.pageStates[i].interactions[x].correctAnswers.length; j++) {
                                if (correctAnswer.length > 0)
                                    correctAnswer += "\n";
                                correctAnswer += trackingManager.pageStates[i].interactions[x].correctAnswers[j];
                            }
                            break;
                        case "numeric":

                            learnerAnswer = trackingManager.pageStates[i].interactions[x].learnerAnswers;
                            correctAnswer = "-";  // Not applicable
                            //TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
                            break;
                        case "fill-in":
                            learnerAnswer = trackingManager.pageStates[i].interactions[x].learnerAnswers;
                            correctAnswer = trackingManager.pageStates[i].interactions[x].correctAnswers;
                            break;
                    }
                    if (trackingManager.pageStates[i].interactions[x].ia_type != "match" && trackingManager.pageStates[i].interactions[x].result != undefined) {
                        subinteraction.question = trackingManager.pageStates[i].interactions[x].ia_name;
                        subinteraction.correct = trackingManager.pageStates[i].interactions[x].result.success;
                        subinteraction.learnerAnswer = learnerAnswer;
                        subinteraction.correctAnswer = correctAnswer;
                        results.interactions[i].subinteractions.push(subinteraction);
                    }
                }

            }
        }
    }
    debugger
    results.completion = completion;
    results.score = score;
    results.nrofquestions = nrofquestions;
    results.averageScore = Math.round(trackingManager.getdScaledScore() * 10000.0)/100.0;
    results.totalDuration = Math.round(totalDuration / 1000);
    results.start = trackingManager.start.toLocaleString();

    //$.ajax({
    //    type: "POST",
    //    url: window.location.href,
    //    data: {
    //        grade: results.averageScore / 100
    //    }
    //});

    return results;
}
