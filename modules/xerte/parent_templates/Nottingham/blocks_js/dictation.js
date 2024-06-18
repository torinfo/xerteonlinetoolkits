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

// pageChanged & sizeChanged functions are needed in every model file
// other functions for model should also be in here to avoid conflicts
var dictationBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		const state = x_getPageDict("state", blockid);
		if (state.mediaElement != undefined) {
			state.mediaElement.setCurrentTime(state.captionInfo[state.current].start);
		}

		jGetElement(blockid, ".button").show();
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		if($("#x_page" + x_currentPage).is(":hidden")){		
				$("#x_page" + x_currentPage).show();
		}
		var $panel = jGetElement(blockid, ".pageContents .panel");
		//$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);

		var audioBarW = 0,
			$pageAudio = jGetElement(blockid, ".pageAudio");

		$pageAudio.find(".mejs-inner .mejs-controls").children().each(function () {
			audioBarW += $(this).outerWidth();
		});

		// var diff = audioBarW - $pageAudio.closest(".audioHolder").width();
		// if (diff > 1 || diff < -1) {
		// 	$x_window.resize();
		// }
	}

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		const state = x_pushToPageDict({}, "state", blockid);
		state.captionInfo = [];
		//Add aria-label to answer box
		var answerFieldLabel = pageXML.getAttribute("answerFieldLabel");
		if (answerFieldLabel === undefined | answerFieldLabel === null) {
			answerFieldLabel = "Answer";
		}
		jGetElement(blockid, ".answerTxt").attr({ "aria-label": answerFieldLabel });

		// uses data from timedText file if there is one - otherwise use nested page info
		if (pageXML.getAttribute("timedText") != "" && pageXML.getAttribute("timedText") != undefined && pageXML.getAttribute("sound") != "" && pageXML.getAttribute("sound") != undefined) {

			x_checkMediaExists(x_evalURL(pageXML.getAttribute("timedText")), function (mediaExists) {
				if (mediaExists) {
					x_checkMediaExists(x_evalURL(pageXML.getAttribute("sound")), function (mediaExists) {
						if (mediaExists) {
							// both timedText & sound files exist
							dictationBlock.ttCaptions(blockid);
						} else {
							dictationBlock.xmlCaptions(blockid);
						}
					});
				} else {
					dictationBlock.xmlCaptions(blockid);
				}
			});
		} else {
			dictationBlock.xmlCaptions(blockid);
		}
	}

	this.ttCaptions = function (blockid) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		let captionInfo = state.captionInfo;
		$.ajax({
			type: "GET",
			url: x_evalURL(pageXML.getAttribute("timedText")),
			dataType: "xml",
			success: function (xml) {
				$(xml).find("P, p").each(function () {
					var $this = $(this);
					captionInfo.push({
						prompt: "",
						answer: $this.text().replace(/(\n|\r|\r\n)/g, "<br />"),
						start: $this.attr("begin"),
						end: $this.attr("end")
					});
					// replace from x_addLineBreaks function done here directly as text from timed text file won't be changed correctly otherwise
				});

				state.captionInfo = captionInfo;
				state.audioSrc = "timedTxt";
				dictationBlock.setup(blockid);
			},

			error: function () {
				dictationBlock.xmlCaptions(blockid);
			}
		});
	}

	this.xmlCaptions = function (blockid) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		let captionInfo = state.captionInfo;
		$(pageXML).children().each(function () {
			var $this = $(this);
			captionInfo.push({
				prompt: $this.attr("prompt"),
				name: $this.attr("name"),
				answer: $this.attr("answer"),
				audio: $this.attr("audio")
			});
		});

		state.captionInfo = captionInfo;
		dictationBlock.setup(blockid);
	}

	this.setup = function (blockid) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);

		var panelWidth = pageXML.getAttribute("panelWidth");

		this.initTracking(blockid);
		state.isRestarted = false;

		let showBtnTxt = "";

		if (XTGetMode() != "normal") {
			showBtnTxt = pageXML.getAttribute("showText") != undefined && pageXML.getAttribute("showText") != "" ? pageXML.getAttribute("showText") : "Show Answer";
		}
		else {
			showBtnTxt = pageXML.getAttribute("trackedShowText") != undefined && pageXML.getAttribute("trackedShowText") != "" ? pageXML.getAttribute("trackedShowText") : "Submit";
		}

		if (panelWidth == "Full") {
			jGetElement(blockid, ".pageContents .panel").appendTo(jGetElement(blockid, ".pageContents"));
			jGetElement(blockid, ".pageContents .splitScreen").remove();
		} else {
			jGetElement(blockid, ".textHolder").html(x_addLineBreaks(pageXML.getAttribute("text")));
			if (panelWidth == "Small") {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("large"); // make text area on left large so panel on right is small
			} else if (panelWidth == "Large") {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
			} else {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
			}
		}

		jGetElement(blockid, ".showBtn")
			.button({
				label: showBtnTxt
			})
			.click(function () {
				const state = x_getPageDict("state", blockid);
				var feedback;
				var $this = $(this);
				jGetElement(blockid, ".showBtn").button("disable");
				//Formats the answer to te correct format, so we can compare it with the input to check if it is correct

				var text = $("<div/>").html(state.captionInfo[state.current].answer).text().replace(/(\r\n|\n|\r)/gm, "");
				//Checks if the answer is correct, and if so it adds one to the total of correct answers
				var answer = jGetElement(blockid, '.answerTxt').val();
				var correct = false;
				jGetElement(blockid, ".answer").slideDown(function () {
					if (state.current + 1 < state.captionInfo.length) {
						jGetElement(blockid, ".showBtn").button("enable");
					}
					else {
						if (XTGetMode() == "normal") {
							jGetElement(blockid, ".showBtn").button("disable");
						}
						else {
							jGetElement(blockid, ".showBtn").button("enable");
						}
					}
				});
				if (answer == text) {
					correct = true;
					feedback = "Correct";
					if (pageXML.getAttribute("showCorrectness") != null && pageXML.getAttribute("showCorrectness") != "false") {
						jGetElement(blockid, ".correct").show();
					}
				}
				else {
					feedback = "Incorrect";
					if (pageXML.getAttribute("showCorrectness") != null && pageXML.getAttribute("showCorrectness") != "false") {
						jGetElement(blockid, ".incorrect").show();
					}
				}
				var result =
				{
					success: correct,
					score: (correct ? 100.0 : 0.0)
				};
				XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, [], answer, feedback, state.current);

				if (state.current + 1 < state.captionInfo.length) {
					jGetElement(blockid, ".nextBtn").button("enable");
				} else {
					//Where done, finish tracking
					dictationBlock.finishTracking(blockid);
					jGetElement(blockid, ".restartBtn").button("enable");
				}

			});

		jGetElement(blockid, ".nextBtn")
			.button({
				label: pageXML.getAttribute("nextText") != undefined && pageXML.getAttribute("nextText") != "" ? pageXML.getAttribute("nextText") : "Next",
				"disabled": true
			})
			.click(function () {
				const state = x_getPageDict("state", blockid);
				$(this).button("disable");
				jGetElement(blockid, ".showBtn").button("enable");

				state.current = state.current + 1;
				dictationBlock.loadQ(blockid);
			});

		jGetElement(blockid, ".restartBtn")
			.button({
				label: pageXML.getAttribute("restartText") != undefined && pageXML.getAttribute("restartText") != "" ? pageXML.getAttribute("restartText") : "Restart",
				"disabled": true
			})
			.click(function () {
				const state = x_getPageDict("state", blockid);
				state.isRestarted = true;
				$(this).button("disable");
				jGetElement(blockid, ".showBtn").button("enable");

				dictationBlock.sortCaptions(blockid);
			});

		if (XTGetMode() == "normal") {
			jGetElement(blockid, ".restartBtn").hide();
		}

		if (state.captionInfo.length == 0) {
			jGetElement(blockid, ".answerTxt, #btnHolder").remove();
			x_pageLoaded();
		} else {
			this.sortCaptions(blockid);
		}
	}

	this.sortCaptions = function (blockid) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		let isRestarted = state.isRestarted?? false;
		state.captionInfo = pageXML.getAttribute("randomise") == "true" && !isRestarted ? x_shuffleArray(state.captionInfo) : state.captionInfo;
		state.current = 0;
		this.loadQ(blockid);
	}

	this.loadQ = function (blockid) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		let correctText = pageXML.getAttribute("correctText") != undefined && pageXML.getAttribute("correctText") != "" ? pageXML.getAttribute("correctText") : "Correct";
		let incorrectText = pageXML.getAttribute("incorrectText") != undefined && pageXML.getAttribute("incorrectText") != "" ? pageXML.getAttribute("incorrectText") : "Incorrect";
		let count = null;
		if (count != null && count != "") {
			jGetElement(blockid, ".count").html(pageXML.getAttribute("countText").replace("{i}", state.current + 1).replace("{n}", state.captionInfo.length));
		} else {
			jGetElement(blockid, ".count").hide();
		}

		if (x_addLineBreaks(state.captionInfo[state.current].prompt == "")) {
			jGetElement(blockid, ".prompt").hide();
		} else {
			jGetElement(blockid, ".prompt")
				.show()
				.html(x_addLineBreaks(state.captionInfo[state.current].prompt));
		}
		jGetElement(blockid, ".answerTxt").val("");

		//Correct answer
		var answer = $("<div/>").html(state.captionInfo[state.current].answer);

		// Answer to be shown
		jGetElement(blockid, ".answer").hide()
			.html(answer);

		// Show incorrect if requested
		jGetElement(blockid, ".incorrect")
			.hide()
			.html('<span class="tick fa fa-fw fa-x-cross"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Incorrect") + '</span></span>' + x_addLineBreaks(" " + incorrectText));
		//Show correct if requested
		jGetElement(blockid, ".correct")
			.hide()
			.html('<span class="tick fa fa-fw fa-x-tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Correct") + '</span></span>' + x_addLineBreaks(" " + correctText));

		this.loadAudio(blockid, state.captionInfo[state.current]);
		var name = $("<div/>").html(state.captionInfo[state.current].name).text().replace(/(\r\n|\n|\r)/gm, "");
		if (name == "") {
			name = pageXML.getAttribute("name");
		}
		var trackedAnswer = $("<div/>").html(state.captionInfo[state.current].answer).text().replace(/(\r\n|\n|\r)/gm, "");
		let isRestarted = state.isRestarted?? false;
		if(!isRestarted){
				XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'fill-in', name, [], trackedAnswer, "Correct", pageXML.getAttribute("grouping"), null, state.current);
		}
	}

	this.loadAudio = function (blockid, caption) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		if (state.audioSrc == "timedTxt") {
			jGetElement(blockid, ".pageAudio").mediaPlayer({
				type: "audio",
				source: pageXML.getAttribute("sound"),
				width: "100%",
				pageName: "dictation",
				startEndFrame: [Number(caption.start), Number(caption.end)]
			});
		} else {
			// load individual audio file
			jGetElement(blockid, ".pageAudio").mediaPlayer({
				type: "audio",
				source: caption.audio,
				width: "100%"
			});
		}

		if (state.loaded != true) {
			state.loaded = true;
			dictationBlock.sizeChanged(blockid);
			x_pageLoaded(); // call this function in every model once everything's loaded
		}
	}

	// function called from mediaPlayer.js when audio player has been set up
	this.mediaFunct = function (blockid,mediaElement) {
		const state = x_getPageDict("state", blockid);
		if (state.audioSrc == "timedTxt") {
			state.mediaElement = mediaElement;

			// force audio back to beginning of clip when end is reached
			mediaElement.addEventListener("timeupdate", function (e) {
				var currentTime = mediaElement.currentTime;
				if (currentTime >= state.captionInfo[state.current].end || currentTime < state.captionInfo[state.current].start) {
					mediaElement.setCurrentTime(state.captionInfo[state.current].start);
				}
			});
		}
	}
	//Stopping the tracking
	this.finishTracking = function (blockid) {
	}
	//Starting the tracking
	this.initTracking = function (blockid) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		// Track the dictation page
		let weighting = 1.0;
		if (pageXML.getAttribute("trackingWeight") != undefined) {
			weighting = pageXML.getAttribute("trackingWeight");
		}
		for(let i = 0; i < pageXML.children.length; i++){
				XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "fill-in", weighting, i);
		}
		// XTSetPageType(x_currentPage, 'numeric', state.captionInfo.length, weighting);
	}
}
