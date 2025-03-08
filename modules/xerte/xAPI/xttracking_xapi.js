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

function makeId(page_nr, ia_nr, ia_type, ia_name) {
	var tmpid = 'urn:x-xerte:p-' + (page_nr + 1);
	if (ia_nr >= 0) {
		tmpid += ':' + (ia_nr + 1);
		if (ia_type.length > 0) {
			tmpid += '-' + ia_type;
		}
	}

	if (ia_name) {
		// ia_nam can be HTML, just extract text from it
		var div = $("<div>").html(ia_name);
		var strippedName = div.text();
		tmpid += ':' + encodeURIComponent(strippedName.replace(
			/[^a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
		// Truncate to max 255 chars, this should be 4000
		tmpid = tmpid.substr(0, 255);
	}
	return tmpid;
}

baseUrl = function () {
	var pathname = window.location.href;
	var newPathname = pathname.split("/");
	var urlPath = "";
	for (var i = 0; i < newPathname.length - 1; i++) {
		urlPath += newPathname[i] + "/";
	}
	if (newPathname[0] != "http:" && newPathname[0] != "https:" &&
		newPathname[0] != "localhost") {
		urlPath = "http://xerte.org.uk/";
	}
	return urlPath;
};

var state = new TrackingManager("xapi");

// enable debug for now
state.debug = true;

var scorm = false,
	lrsInstance,
	userEMail;

var surf_mode = false;
var surf_recipe, surf_course;

var answeredQs = [];

function XTInitialise(category) {
		state.initialise(category);
}

function XTTrackingSystem() {
	return "xAPI";
}

function XTLogin(login, passwd) {
	this.loginStamp = new Date();

	if (!surf_mode) {
		var statement = {
			actor: actor,
			verb: {
				id: "http://adlnet.gov/expapi/verbs/logged-in",
				display: {
					"en-US": "Logged in"
				}
			},
			target: {
				id: baseUrl() + state.templateId
			},
			timestamp: this.loginStamp
		};

		SaveStatement(statement);
	}
	// TODO: Compare the login and the password with credentials from the LRS.

	return true;
}

function XTGetMode(extended) {
	if (state.forcetrackingmode === 'true') {
		if (extended != null && (extended == true || extended == 'true')) {
			return state.mode;
		}
		else {
			return "normal";
		}
	}
	else
		return "";
}

function XTStartPage() {
	if (state.mode == 'normal') {
		state.doResume();
		if (state.resume && typeof state.currentpageid != "undefined") {
			var currentid = state.currentpageid;
			state.currentpageid = "";
			var sit = state.find(currentid);
			if (sit != null)
				return sit.page_nr;
			else
				return -1;
		}
		else {
			return -1;
		}
	}
}

function XTGetUserName() {
	return "";
}

function XTNeedsLogin() {
	return false;
}

function XTSetOption(option, value) {
	switch (option) {
		case "nrpages":
			state.nrpages = value;
			break;
		case "toComplete":
			state.toCompletePages = value;
			//completedPages = new Array(length(toCompletePages));
			for (i = 0; i < state.toCompletePages.length; i++) {
				state.completedPages[i] = false;
			}

			break;
		case "tracking-mode":
			switch (value) {
				case 'full_first':
					state.trackingmode = "full";
					state.scoremode = "first";
					state.mode = "normal";
					break;
				case 'minimal_first':
					state.trackingmode = "minimal";
					state.scoremode = "first";
					state.mode = "normal";
					break;
				case 'full':
					state.trackingmode = "full";
					state.scoremode = "last";
					state.mode = "normal";
					break;
				case 'minimal':
					state.trackingmode = "minimal";
					state.scoremode = "last";
					state.mode = "normal";
					break;
				case 'none':
					state.trackingmode = "none";
					state.mode = "no-tracking";
					break;
			}
			break;
		case "completed":
			state.lo_completed = value;
			break;
		case "objective_passed":
			if (Number(value) <= 1) {
				state.lo_passed = Number(value) * 100;
			}
			break;
		case "page_timeout":
			// Page timeout in seconds
			state.page_timeout = Number(value) * 1000;
			break;
		case "templateId":
			state.templateId = value;
			break;
		case "templateName":
			state.templateName = value;
			break;
		case "force_tracking_mode":
			state.forcetrackingmode = value;
			break;
		case "course":
			// If overruled by request parameters (or LTI) do not use coursename, else set coursename and course
			if (state.coursename != "" && value != undefined && value != "") {
				state.course = {
					id: baseUrl() + 'course/' + value
				};
				state.coursename = value;
			}
			break;
		case "module":
			// If overruled by request parameters (or LTI) do not use coursename, else set coursename and course
			if (state.modulename != "" && value != undefined && value != "") {
				state.module = {
					id: baseUrl() + 'modules/' + value
				};
				state.modulename = value;
			}
			break;
		case "resume":
			state.resume = value;
			break;
	}
}

function XTEnterPage(page_nr, page_name, grouping) {
	var sitp = state.enterPage(page_nr, -1, page_name, grouping);
}

function XTExitPage(page_nr) {
	state.exitPage(page_nr);
}

function XTSetPageType(page_nr, page_type, nrinteractions, weighting) {
	state.setPageType(page_nr, page_type, nrinteractions, weighting);
}

function XTSetInteractionType(page_nr, ia_nr, page_type, weighting, sub_ia_nr) {
	state.setInteractionType(page_nr, ia_nr, page_type, weighting, sub_ia_nr);
}

function XThelperConsolidateSegments(videostate) {
	// 1. Sort played segments on start time (first make a copy)
	var segments = $.extend(true, [], videostate.segments);
	segments.sort(function (a, b) {
		return (parseFloat(a.start) > parseFloat(b.start)) ? 1 : ((parseFloat(b.start) > parseFloat(a.start)) ? -1 : parseFloat(a.end) - parseFloat(b.end));
	});
	// 2. Combine the segments
	var csegments = [];
	var i = 0;
	while (i < segments.length) {
		var segment = $.extend(true, {}, segments[i]);
		i++;
		while (i < segments.length && parseFloat(segment.end) >= parseFloat(segments[i].start)) {
			segment.end = segments[i].end;
			i++;
		}
		csegments.push(segment);
	}
	/*
	var segstr = "[";
	for (var i=0; i<csegments.length; i++)
	{
		if (i>0)
			segstr += ", ";
		segstr += "(" + csegments[i].start + ", " + csegments[i].end + ")";
	}
	segstr += "]";
	console.log("Consolidated segments: " + segstr);
	*/
	return csegments;
}

function XThelperDetermineProgress(videostate) {
	var csegments = XThelperConsolidateSegments(videostate);
	var videoseen = 0;
	for (var i = 0; i < csegments.length; i++) {
		videoseen += csegments[i].end - csegments[i].start;
	}
	// normalized between 0 and 1
	if (!isNaN(videostate.duration) && videostate.duration > 0) {
		return Math.round(videoseen / videostate.duration * 100.0) / 100.0;
	}
	return 0.0;
}

function XTVideo(page_nr, name, block_name, verb, videostate, set_grouping) {
	var id = baseUrl() + state.templateId + "/" + page_nr + "/video";
	var pagename = "Page " + page_nr;
	if (name != null && name != "") {
		id = baseUrl() + state.templateId + "/" + name.replace(/[\/ ]/g, "_") + "/video";
		pagename = name;
	}

	var grouping = "";
	if (typeof set_grouping != "undefined" && set_grouping != "" && set_grouping !=
		null) {
		grouping = set_grouping;
	}
	if (grouping != "") {
		var definition = {
			name: {
				'en-US': grouping,
			}
		};
		definition.name[state.language] = grouping;
		statementgrouping = {
			grouping: [{
				id: baseUrl() + grouping.replace(/[\/ ]/g, "_"),
				definition: definition,
				objectType: "Activity"
			}]
		};
	}

	switch (verb) {

		case "initialized":
			state.videostart = new Date();
			var statement = {
				"actor": actor,
				"verb": {
					"id": "http://adlnet.gov/expapi/verbs/initialized",
					"display": {
						"en-US": "initialized"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "played":
			var statement = {
				"actor": actor,
				"verb": {
					"id": "https://w3id.org/xapi/video/verbs/played",
					"display": {
						"en-US": "played"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"result": {
					"extensions": {
						"https://w3id.org/xapi/video/extensions/time": videostate.time
					},
					"duration": calcDuration(state.videostart, new Date())
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
						"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "paused":
			var played_segments = "";
			for (var i = 0; i < videostate.segments.length; i++) {
				if (i > 0) {
					played_segments += "[,]"
				}
				played_segments += videostate.segments[i].start + "[.]" + videostate.segments[i].end;
			}
			var statement = {
				"actor": actor,
				"verb": {
					"id": "https://w3id.org/xapi/video/verbs/paused",
					"display": {
						"en-US": "paused"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"result": {
					"extensions": {
						"https://w3id.org/xapi/video/extensions/time": videostate.time,
						"https://w3id.org/xapi/video/extensions/progress": XThelperDetermineProgress(videostate),
						"https://w3id.org/xapi/video/extensions/played-segments": played_segments
					},
					"duration": calcDuration(state.videostart, new Date())
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
						"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "seeked":
			var statement = {
				"actor": actor,
				"verb": {
					"id": "https://w3id.org/xapi/video/verbs/seeked",
					"display": {
						"en-US": "seeked"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"result": {
					"extensions": {
						"https://w3id.org/xapi/video/extensions/time-from": videostate.prevTime,
						"https://w3id.org/xapi/video/extensions/time-to": videostate.time
					},
					"duration": calcDuration(state.videostart, new Date())
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
						"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "interacted":
			break;
		case "exit": // Not really the verb. will send termintaed or completed depending on state
			var played_segments = "";
			for (var i = 0; i < videostate.segments.length; i++) {
				if (i > 0) {
					played_segments += "[,]"
				}
				played_segments += videostate.segments[i].start + "[.]" + videostate.segments[i].end;
			}
			var progress = XThelperDetermineProgress(videostate);
			// 3. Determine whther to use completed or terminated
			if (progress >= 99.9) {
				// Use completed
				var statement = {
					"actor": actor,
					"verb": {
						"id": "http://adlnet.gov/expapi/verbs/completed",
						"display": {
							"en-US": "completed"
						}
					},
					"object": {
						"id": id,
						"definition": {
							"name": {
								"en-US": "Video of " + pagename
							},
							"description": {
								"en-US": "Watching video on " + pagename
							},
							"type": "https://w3id.org/xapi/video/activity-type/video"
						},
						"objectType": "Activity"
					},
					"result": {
						"extensions": {
							"https://w3id.org/xapi/video/extensions/time": videostate.time,
							"https://w3id.org/xapi/video/extensions/progress": progress,
							"https://w3id.org/xapi/video/extensions/played-segments": played_segments
						},
						"completion": true,
						"duration": calcDuration(state.videostart, new Date())
					},
					"context": {
						"contextActivities": {
							"category": [{
								"id": "https://w3id.org/xapi/video"
							}]
						},
						"extensions": {
							"http://xerte.org.uk/learningObjectLevel": "video",
							"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
							"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
						}
					}
				};
				statement.object.definition.name[state.language] = pagename;
			} else {
				// use terminated, so first send paused as according to standards (if not already sent)
				if (state.prevVerb != "paused") {
					var statement = {
						"actor": actor,
						"verb": {
							"id": "https://w3id.org/xapi/video/verbs/paused",
							"display": {
								"en-US": "paused"
							}
						},
						"object": {
							"id": id,
							"definition": {
								"name": {
									"en-US": "Video of " + pagename
								},
								"description": {
									"en-US": "Watching video on " + pagename
								},
								"type": "https://w3id.org/xapi/video/activity-type/video"
							},
							"objectType": "Activity"
						},
						"result": {
							"extensions": {
								"https://w3id.org/xapi/video/extensions/time": videostate.time,
								"https://w3id.org/xapi/video/extensions/progress": XThelperDetermineProgress(videostate),
								"https://w3id.org/xapi/video/extensions/played-segments": played_segments
							},
							"duration": calcDuration(state.videostart, new Date())
						},
						"context": {
							"contextActivities": {
								"category": [{
									"id": "https://w3id.org/xapi/video"
								}]
							},
							"extensions": {
								"http://xerte.org.uk/learningObjectLevel": "video",
								"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
								"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
							}
						}
					};
					statement.object.definition.name[state.language] = pagename;
					if (grouping != "") {
						statement.context.contextActivities = statementgrouping;
					}
					SaveStatement(statement);
				}
				var statement = {
					"actor": actor,
					"verb": {
						"id": "http://adlnet.gov/expapi/verbs/terminated",
						"display": {
							"en-US": "terminated"
						}
					},
					"object": {
						"id": id,
						"definition": {
							"name": {
								"en-US": "Video of " + pagename
							},
							"description": {
								"en-US": "Watching video on " + pagename
							},
							"type": "https://w3id.org/xapi/video/activity-type/video"
						},
						"objectType": "Activity"
					},
					"result": {
						"extensions": {
							"https://w3id.org/xapi/video/extensions/time": videostate.time,
							"https://w3id.org/xapi/video/extensions/progress": progress,
							"https://w3id.org/xapi/video/extensions/played-segments": played_segments
						},
						"duration": calcDuration(state.videostart, new Date())
					},
					"context": {
						"contextActivities": {
							"category": [{
								"id": "https://w3id.org/xapi/video"
							}]
						},
						"extensions": {
							"http://xerte.org.uk/learningObjectLevel": "video",
							"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
							"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
						}
					}
				};
				statement.object.definition.name[state.language] = pagename;
			}
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;

	}
	state.prevVerb = verb;
}

function XTSetPageScore(page_nr, score) {
	state.setPageScore(page_nr);
}

function calcDuration(s, e) {
	var delta = Math.abs(e.getTime() - s.getTime()) / 1000;

	var days = Math.floor(delta / 86400);
	delta -= days * 86400;
	var hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;
	var minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;
	var seconds = delta;
	return "PT" + hours + "H" + minutes + "M" + seconds + "S"
}

function XTSetPageScoreJSON(page_nr, score, JSONGraph) {
	state.setPageScoreJSON(page_nr, JSONGraph);
}

function XTEnterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions,
	correctanswer, feedback, grouping, context, sub_ia_nr = 0) {
	state.enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions,
		correctanswer, feedback, grouping, context, sub_ia_nr);
}

function XTExitInteraction(page_nr, ia_nr, result, learneroptions,
	learneranswers, feedback, sub_ia_nr = 0) {
	state.exitInteraction(page_nr, ia_nr, result, learneroptions,
		learneranswers, feedback, sub_ia_nr);
}

function XTGetStatements(q, one, callback) {
	state.getStatements(q, one, callback);
}

function XTCanResume() {
	return state.canResume();
}

function XTTerminate() {
	state.terminate();
}

function SaveStatement(statement, async) {
	var key = "http://xerte.org.uk/sessionId";
	extension = {
		"http://xerte.org.uk/sessionId": state.sessionId,
		"http://xerte.org.uk/learningObjectId": baseUrl() + state.templateId,
		"http://xerte.org.uk/learningObjectTitle": $("<div>").html(x_params.name).text()
	};
	if (state.embedded) {
		extension["http://xerte.org.uk/launchedFrom"] = state.embedded_from;
		extension["http://xerte.org.uk/launchedFromTitle"] = state.embedded_fromTitle;
	}
	if (state.coursename != "") {
		extension["http://xerte.org.uk/course"] = state.coursename;
	}
	if (state.modulename != "") {
		extension["http://xerte.org.uk/module"] = state.modulename;
	}
	if (state.lti_context_id != "") {
		extension["http://xerte.org.uk/lti_context_id"] = state.lti_context_id;
	}
	if (state.lti_context_name != "") {
		extension["http://xerte.org.uk/lti_context_name"] = state.lti_context_name;
	}
	if (typeof statement.context == "undefined") {
		statement.context = {
			"extensions": extension
		};
	} else if (typeof statement.context.extensions == "undefined") {
		statement.context.extensions = extension;
	} else {
		// Loop over all keys in extension and add to existing extension
		$.each(extension, function (key, value) {
			statement.context.extensions[key] = value;
		});
	}
	var parentId = baseUrl() + state.templateId;
	if (statement.object.id != parentId) {
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		var parentObj = {
			"definition": {
				"name": {
					"en-US": x_params.name
				}
			},
			"id": parentId,
			"objectType": "Activity"
		};
		parentObj.definition.name[state.language] = x_params.name;
		statement.context.contextActivities.parent = [parentObj];
	}
	if (state.category != "") {
		//Place Xerte Category in contextActivities/Other, NOT in categoryContext/category, because that is used for different puposes by xAPI
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		if (typeof statement.context.contextActivities.other == "undefined") {
			statement.context.contextActivities.other = [{
				id: baseUrl() + state.category.replace(/[\/ ]/g, "_")
			}];
		} else {
			statement.context.contextActivities.other.push({
				id: baseUrl() + state.category.replace(/[\/ ]/g, "_")
			});
		}
	}
	if (state.course != "") {
		//Place course in contextActivities/Other
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		if (typeof statement.context.contextActivities.other == "undefined") {
			statement.context.contextActivities.other = [state.course];
		} else {
			statement.context.contextActivities.other.push(state.course);
		}
	}
	if (state.module != "") {
		//Place module in contextActivities/Other
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		if (typeof statement.context.contextActivities.other == "undefined") {
			statement.context.contextActivities.other = [state.module];
		} else {
			statement.context.contextActivities.other.push(state.module);
		}
	}
	if (state.group != "") {
		// Place in context team
		statement.context.team = state.group;
	}

	/*
	statement = new TinCan.Statement(statement);
	statement.id = null;
	if (typeof async == 'undefined')
	{
		async = true;
	}
	if(async){
		lrsInstance.saveStatement(
			statement,
			{
				callback: function (err, xhr) {
					if (err !== null) {
						if (xhr !== null) {
							//alert("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
							// TODO: handle error accordingly when needed
							return;
						}

						//alert("Failed to save statement: " + err);
						// TODO: handle error accordingly when needed
						return;
					}

				}
			}
		);
	}else{
		lrsInstance.saveStatement(
			statement
		);
	}
	*/
	statement.id = null;
	statement.timestamp = new Date();
	if (typeof async == 'undefined') {
		async = true;
	}
	if (async) {
		ADL.XAPIWrapper.sendStatement(statement, function (err, res, body) {
			ADL.XAPIWrapper.log("[" + body.id + "]: " + res.status +
				" - " + res.statusText);
		});
	} else {
		var res = ADL.XAPIWrapper.sendStatement(statement);
		ADL.XAPIWrapper.log("[" + res.id + "]: " + res.xhr.status + " - " + res
			.xhr.statusText);
	}

}

/*
function XTResults(fullcompletion) {
	var completion = 0;
	var nrcompleted = 0;
	var nrvisited = 0;
	var completed;
	$.each(state.completedPages, function(i, completed) {
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
		} else {
			completion = Math.round((nrcompleted / state.toCompletePages.length) *
				100);
		}
	} else {
		completion = 0;
	}

	var results = {};
	results.mode = x_currentPageXML.getAttribute("resultmode");

	var score = 0,
		nrofquestions = 0,
		totalWeight = 0,
		totalDuration = 0;
	results.interactions = Array();

	for (i = 0; i < state.interactions.length; i++) {


		score += state.interactions[i].score * state.interactions[i].weighting;
		if (state.interactions[i].ia_nr < 0 || state.interactions[i].nrinteractions >
			0) {

			var interaction = {};
			interaction.score = Math.round(state.interactions[i].score);
			interaction.title = state.interactions[i].ia_name;
			interaction.type = state.interactions[i].ia_type;
			interaction.correct = state.interactions[i].result;
			interaction.duration = Math.round(state.interactions[i].duration /
				1000);
			interaction.weighting = state.interactions[i].weighting;
			interaction.subinteractions = Array();

			var j = 0;
			for (j; j < state.toCompletePages.length; j++) {
				var currentPageNr = state.toCompletePages[j];
				if (currentPageNr == state.interactions[i].page_nr) {
					if (state.completedPages[j]) {
						interaction.completed = "true";
					} else if (!state.completedPages[j]) {
						interaction.completed = "false";
					} else {
						interaction.completed = "unknown";
					}
				}
			}

			results.interactions[nrofquestions] = interaction;
			totalDuration += state.interactions[i].duration;
			nrofquestions++;
			totalWeight += state.interactions[i].weighting;

		} else if (results.mode == "full-results") {
			var subinteraction = {};

			var learnerAnswer, correctAnswer;
			switch (state.interactions[i].ia_type) {
				case "match":
					// If unique targets, match answers by target, otherwise match by source
					const targets = [];
					for (let j = 0; j < state.interactions[i].correctOptions.length; j++) {
						targets.push(state.interactions[i].correctOptions[j].target);
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
					learnerAnswer = state.interactions[i].learnerAnswers[0] !=
						undefined ? state.interactions[i].learnerAnswers[0] :
						"";
					for (var j = 1; j < state.interactions[i].learnerAnswers.length; j++) {
						learnerAnswer += "\n" + state.interactions[i].learnerAnswers[
							j];
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
					correctAnswer = "-"; // Not applicable
					//TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
					break;
				case "fill-in":
					learnerAnswer = state.interactions[i].learnerAnswers;
					correctAnswer = state.interactions[i].correctAnswers;
					break;
			}
			if (state.interactions[i].ia_type != "match" && state.interactions[i].result != undefined) {
				subinteraction.question = state.interactions[i].ia_name;
				subinteraction.correct = state.interactions[i].result.success;
				subinteraction.learnerAnswer = learnerAnswer;
				subinteraction.correctAnswer = correctAnswer;
				results.interactions[nrofquestions - 1].subinteractions.push(
					subinteraction);
			}
		}
	}
	results.completion = completion;
	results.score = score;
	results.nrofquestions = nrofquestions;
	results.averageScore = Math.round(state.getdScaledScore() * 10000.0) / 100.0;
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

*/
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
		if (typeof (completed) != "undefined") {
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

	for (i = 0; i < state.pageStates.length; i++) {

		if (state.pageStates[i].nrinteractions > 0) {
			score += state.pageStates[i].score * state.pageStates[i].weighting;
			var interaction = {};
			interaction.score = Math.round(state.pageStates[i].score);
			interaction.title = state.pageStates[i].ia_name;
			interaction.type = state.pageStates[i].ia_type;
			interaction.correct = state.pageStates[i].result;
			interaction.duration = Math.round(state.pageStates[i].duration / 1000);
			interaction.weighting = state.pageStates[i].weighting;
			interaction.subinteractions = Array();


			var j = 0;
			for (j; j < state.toCompletePages.length; j++) {
				var currentPageNr = state.toCompletePages[j];
				if (currentPageNr == state.pageStates[i].page_nr) {
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
			totalDuration += state.pageStates[i].duration;
			nrofquestions++;

			totalWeight += state.pageStates[i].weighting;

			function compare(a, b) {
				if (a.ia_nr < b.ia_nr) {
					return -1;
				}
				if (a.ia_nr > b.ia_nr) {
					return 1;
				}
				return 0;
			}


			state.pageStates[i].interactions.sort(compare);

			if (results.mode == "full-results") {

				for (var x = 0; x < state.pageStates[i].interactions.length; x++) {
					var subinteraction = {};

					var learnerAnswer, correctAnswer;
					switch (state.pageStates[i].interactions[x].ia_type) {
						case "match":
							for (var c = 0; c < state.pageStates[i].interactions[x].correctOptions.length; c++) {
								var matchSub = {}; //Create a subinteraction here for every match sub instead
								correctAnswer = state.pageStates[i].interactions[x].correctOptions[c].source + ' --> ' + state.pageStates[i].interactions[x].correctOptions[c].target;
								source = state.pageStates[i].interactions[x].correctOptions[c].source;
								if (state.pageStates[i].interactions[x].learnerOptions.length == 0) {
									learnerAnswer = source + ' --> ' + ' ';
								}
								else {
									for (var d = 0; d < state.pageStates[i].interactions[x].learnerOptions.length; d++) {
										if (source == state.pageStates[i].interactions[x].learnerOptions[d].source) {
											learnerAnswer = source + ' --> ' + state.pageStates[i].interactions[x].learnerOptions[d].target;
											break;
										}
										else {
											learnerAnswer = source + ' --> ' + ' ';
										}
									}
								}

								matchSub.question = state.pageStates[i].interactions[x].ia_name;
								matchSub.correct = (learnerAnswer === correctAnswer);
								matchSub.learnerAnswer = learnerAnswer;
								matchSub.correctAnswer = correctAnswer;
								results.interactions[nrofquestions - 1].subinteractions.push(matchSub);
							}

							break;
						case "text":
							learnerAnswer = state.pageStates[i].interactions[x].learnerAnswers;
							correctAnswer = state.pageStates[i].interactions[x].correctAnswers;
							break;
						case "multiplechoice":
							learnerAnswer = state.pageStates[i].interactions[x].learnerAnswers[0] != undefined ? state.pageStates[i].interactions[x].learnerAnswers[0] : "";
							for (var j = 1; j < state.pageStates[i].interactions[x].learnerAnswers.length; j++) {
								learnerAnswer += "\n" + state.pageStates[i].interactions[x].learnerAnswers[j];
							}
							correctAnswer = "";
							for (var j = 0; j < state.pageStates[i].interactions[x].correctAnswers.length; j++) {
								if (correctAnswer.length > 0)
									correctAnswer += "\n";
								correctAnswer += state.pageStates[i].interactions[x].correctAnswers[j];
							}
							break;
						case "numeric":

							learnerAnswer = state.pageStates[i].interactions[x].learnerAnswers;
							correctAnswer = "-";  // Not applicable
							//TODO: We don't have a good example of an interactivity where the numeric type has a correctAnswer. Currently implemented for the survey page.
							break;
						case "fill-in":
							learnerAnswer = state.pageStates[i].interactions[x].learnerAnswers;
							correctAnswer = state.pageStates[i].interactions[x].correctAnswers;
							break;
					}

					if (state.pageStates[i].interactions[x].ia_type != "match" && state.pageStates[i].interactions[x].result != undefined) {
						subinteraction.question = state.pageStates[i].interactions[x].ia_name;
						subinteraction.correct = state.pageStates[i].interactions[x].result.success;
						subinteraction.learnerAnswer = learnerAnswer;
						subinteraction.correctAnswer = correctAnswer;
						results.interactions[nrofquestions - 1].subinteractions.push(subinteraction);
					}
				}

			}
		}
	}

	results.completion = completion;
	results.score = score;
	results.nrofquestions = nrofquestions;
	results.averageScore = Math.round(state.getdScaledScore() * 10000.0) / 100.0;
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

function XTSetInteractionPageXML(page_nr, ia_nr, pageXML, ia_sub_nr = 0) {
	//    trackingManager.setInteractionPageXML(page_nr, ia_nr, pageXML, ia_sub_nr);
	console.log("called XTSetInteractionPageXML.", { page_nr, ia_nr, pageXML, ia_sub_nr });
}

function XTGetPageXML(page_nr, ia_nr, ia_sub_nr = 0) {
	//    return trackingManager.getInteractionPageXML(page_nr, ia_nr, ia_sub_nr);
	console.log("called XTGetPageXML.", { page_nr, ia_nr, ia_sub_nr });
}

function XTSetLeavePage(page_nr, ia_nr, leavePage, ia_sub_nr = 0) {
	//   return trackingManager.setLeavePage(page_nr, ia_nr, ia_sub_nr,leavePage);
	console.log("called XTSetLeavePage.", { page_nr, ia_nr, leavePage, ia_sub_nr });
}

function XTSetInteractionModelState(page_nr, ia_nr, modelState, ia_sub_nr = 0, toAll = true) {
	//    trackingManager.setInteractionModelState(page_nr, ia_nr, modelState, ia_sub_nr, toAll);
	console.log("called XTSetInteractionModelState.", { page_nr, ia_nr, modelState, ia_sub_nr, toAll });
}

function XTGetInteractionModelState(page_nr, ia_nr, ia_sub_nr = 0, ignoreSubId = true) {
	//    return trackingManager.getInteractionModelState(page_nr, ia_nr, ia_sub_nr, ignoreSubId);
	console.log("called XTGetInteractionModelState.", { page_nr, ia_nr, ia_sub_nr, ignoreSubId });
}
