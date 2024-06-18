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
var hotSpotQuestionBlock= new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		this.resizeImg(blockid, false);
	};

	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		const state = x_getPageDict("state", blockid)
		var resizehighlightArray = []
		let allHighlightsArray = state.allHighlightsArray;
		allHighlightsArray.forEach((highlight, index) => {
			if (jGetElement(blockid, 'area[data-key="' + index + '"]').hasClass('selected')) {
				resizehighlightArray.push(index)
			}
		});
		let highlightsArray = state.highlightsArray;
		allHighlightsArray = [];

		this.resizeImg(blockid, false);

		resizehighlightArray.forEach((h) => {
			jGetElement(blockid, 'area[data-key="' + h + '"]').mapster('select')
			jGetElement(blockid, 'area[data-key="' + h + '"]').addClass("selected")
		});

		if (jGetElement(blockid, '.markingIcons .correct, #markingIcons .incorrect').length > 0) {

			jGetElement(blockid, '.markingIcons').empty();

			highlightsArray.forEach((highlight) => {
				var points = JSON.parse(highlight.getAttribute("points")),
					lowestPoint = points[0];

				for (var i = 0; i < points.length; i++) {
					if (points[i].y > lowestPoint.y) {
						lowestPoint = points[i];
					} else if (points[i].y == lowestPoint.y && points[i].x > lowestPoint.x) {
						lowestPoint = points[i];
					}
				}

				var $markIcon = $("<div class='" + (highlight.getAttribute("truth") === "true" ? "correct" : "incorrect") + "'><span></span></div>")
				let resize = jGetElement(blockid, ".image").width() / jGetElement(blockid, ":not(.mapster_el).image").data("origSize")[0];

				$markIcon
					.css({ top: lowestPoint.y * resize, left: lowestPoint.x * resize })
					.appendTo("#markingIcons");
			});
		}
	};

	this.init = function (blockid) {
		const state = x_pushToPageDict({}, "state", blockid);
		let pageXML = x_getBlockXML(blockid);
		var weighting = 1.0;
		let attempts = 0;
		let highlightsIndexArray = [];
		let highlightsArray = [];
		let allHighlightsArray = [];
		state.attempts = attempts;
		state.highlightsIndexArray = highlightsIndexArray;
		state.highlightsArray = highlightsArray;
		state.allHighlightsArray = allHighlightsArray;
		if (pageXML.getAttribute("trackingWeight") != null) {
			weighting = pageXML.getAttribute("trackingWeight");
		}
		XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "multiplechoice", weighting);

		var $textHolder = jGetElement(blockid, '.textHolder');
		if (pageXML.getAttribute("textWidth") == "none") {
			$textHolder.remove();
			jGetElement(blockid, ".pageContents").css("text-align", "center");
			// Remove panel
			jGetElement(blockid, ".panel").removeClass("panel");
		} else {
			jGetElement(blockid, '.textHolder').html(x_addLineBreaks(pageXML.getAttribute("text")));

			if (pageXML.getAttribute("align") == "Right") {
				jGetElement(blockid, ".panel").addClass("left");
			} else {
				jGetElement(blockid, ".panel").addClass("right");
			}
		}

		jGetElement(blockid, ".image")
			.css({
				"opacity": 0,
				"filter": 'alpha(opacity=0)',
			})
			.one("load", function () {
				if($("#x_page" + x_currentPage).is(":hidden")){
						$("#x_page" + x_currentPage).show();
				}
				jGetElement(blockid, ".image").data("origSize", [jGetElement(blockid, ".image").width(), jGetElement(blockid, ".image").height()]);
				hotSpotQuestionBlock.resizeImg(blockid, true);

				// call this function in every model once everything's loaded
				x_pageLoaded();
			})
			.attr({
				"src": x_evalURL(pageXML.getAttribute("url")),
				"alt": pageXML.getAttribute("tip"),
				"usemap": "#" + blockid + "_hsHolder_map"
			})
			.each(function () { // called if loaded from cache as in some browsers load won't automatically trigger
				if (this.complete) {
					$(this).trigger("load");
				}
			});

		jGetElement(blockid, ".checkButton")
			.button({ label: pageXML.getAttribute("btnLabel") != undefined ? pageXML.getAttribute("btnLabel") : "Submit" })
			.click(function () {
				const state = x_getPageDict("state", blockid)
				var stroke = true;
				var highlightColour = "#ffff00";
				var strokeWidth = 2;
				var strokeOpacity = 1;
				var fill = true;
				var fillColor = "#000000";
				var fillOpacity = 0.3;
				if (pageXML.getAttribute("hicol") != undefined && pageXML.getAttribute("hicol") != "") {
					highlightColour = x_getColour(pageXML.getAttribute("hicol"));
				}
				if (pageXML.getAttribute("hs_strokeWidth") != undefined && pageXML.getAttribute("hs_strokeWidth") != "") {
					strokeWidth = parseInt(pageXML.getAttribute("hs_strokeWidth"));
					if (strokeWidth == 0) {
						stroke = false;
					}
				}
				if (pageXML.getAttribute("hs_strokeOpacity") != undefined && pageXML.getAttribute("hs_strokeOpacity") != "") {
					strokeOpacity = parseFloat(pageXML.getAttribute("hs_strokeOpacity"));
				}
				if (pageXML.getAttribute("hs_fill") != undefined && pageXML.getAttribute("hs_fill") != "") {
					fill = pageXML.getAttribute("hs_fill") === "true";
				}
				if (pageXML.getAttribute("hs_fillColor") != undefined && pageXML.getAttribute("hs_fillColor") != "") {
					fillColor = x_getColour(pageXML.getAttribute("hs_fillColor"));
				}
				if (pageXML.getAttribute("hs_fillOpacity") != undefined && pageXML.getAttribute("hs_fillOpacity") != "") {
					fillOpacity = parseFloat(pageXML.getAttribute("hs_fillOpacity"));
				}
				optionsCorrect = {
					render_select:
					{
						fill: fill,
						fillColor: fillColor.substr(1),
						fillOpacity: fillOpacity,
						stroke: stroke,
						strokeColor: "008000",
						strokeOpacity: strokeOpacity,
						strokeWidth: strokeWidth
					},
					scaleMap: true,
					clickNavigate: true
				};

				if (pageXML.getAttribute("answers") == "true") {
					jGetElement(blockid, 'img').mapster('set_options', optionsCorrect);
				} else {
					jGetElement(blockid, ".pageContents .hotspot.selected").mapster("select");
				}

				var amountOfCorrectOptions = 0; // total number of correct hotspots available

				allHighlightsArray.forEach((highlight) => {
					if (highlight.getAttribute("truth") === "true") {
						amountOfCorrectOptions++;
					}
				})

				var amountOfCorrect = 0, // number of correct hotspots selected
					amountOfWrong = 0; // number of incorrect hotspots selected

				highlightsArray.forEach((highlight) => {
					if (highlight.getAttribute("truth") === "true") {
						amountOfCorrect++;
					} else {
						amountOfWrong++
					}
				})

				attempts++;
				var maxAttempts = parseInt(pageXML.getAttribute("attempts")),
					remainingAttempts = maxAttempts - attempts;

				// activity is complete - either because max attempts reached (even if some still incorrect) or all correct & no incorrect have been found
				if ((attempts >= maxAttempts || (amountOfCorrect === amountOfCorrectOptions && amountOfWrong === 0)) && amountOfCorrect + amountOfWrong > 0) {

					if (pageXML.getAttribute("answers") == "true") {

						highlightsArray.forEach((highlight) => {
							var points = JSON.parse(highlight.getAttribute("points")),
								lowestPoint = points[0];
							for (var i = 0; i < points.length; i++) {
								if (points[i].y > lowestPoint.y) {
									lowestPoint = points[i];
								} else if (points[i].y == lowestPoint.y && points[i].x > lowestPoint.x) {
									lowestPoint = points[i];
								}
							}

							var $markIcon = $("<div class='" + (highlight.getAttribute("truth") === "true" ? "correct" : "incorrect") + "'><span></span></div>")
							let resize = jGetElement(blockid, ".image").width() / jGetElement(blockid, ":not(.mapster_el).image").data("origSize")[0];

							$markIcon
								.css({ top: lowestPoint.y * resize, left: lowestPoint.x * resize })
								.appendTo("#markingIcons");
						})

						allHighlightsArray.forEach((highlight, index) => {
							if (highlight.getAttribute('truth') === "true" && $.inArray(highlight, highlightsArray) == -1) {
								jGetElement(blockid, 'area[data-key="' + index + '"]').mapster('deselect')
								jGetElement(blockid, 'img').mapster('set_options', optionsCorrect);
								jGetElement(blockid, 'area[data-key="' + index + '"]').mapster('select')
							}
						})
					}

					var scoreLabel;
					// all correct
					if (amountOfCorrect === amountOfCorrectOptions && amountOfWrong === 0) {
						scoreLabel = pageXML.getAttribute("allGood") != undefined ? pageXML.getAttribute("allGood") : "Well done, you have selected all of the correct answers.";

						// all incorrect
					} else if (amountOfCorrect == 0) {
						scoreLabel = pageXML.getAttribute("allWrong") != undefined ? pageXML.getAttribute("allWrong") : "You have not selected any of the /c correct answers."
						scoreLabel = scoreLabel.replace("/c", amountOfCorrectOptions);

						// some correct, some incorrect
					} else {
						scoreLabel = pageXML.getAttribute("scoreTxt") != undefined ? pageXML.getAttribute("scoreTxt") : "You have /r answer(s) right (out of /c) and /w wrong.";
						scoreLabel = scoreLabel.replace("/r", amountOfCorrect);
						scoreLabel = scoreLabel.replace("/w", amountOfWrong);
						scoreLabel = scoreLabel.replace("/c", amountOfCorrectOptions);
					}

					highlightsArray.forEach((highlight) => {
						jGetElement(blockid, "area").off('click')
					})

					jGetElement(blockid, '.hsHolder').addClass('complete');

					jGetElement(blockid, ".checkButton").hide();
					var h3 = $('<h3>').append(scoreLabel)
					jGetElement(blockid, ".score").html(h3);
					jGetElement(blockid, ".generalFeedback").html(pageXML.getAttribute("generalFeedback"));

					// score tracking
					var setScore = 0;
					if (amountOfCorrect == highlightsArray.length) {
						setScore = 100.0;
					}
					var correct = true,
						l_options = [],
						l_answers = [],
						l_feedbacks = [];

					highlightsArray.forEach((highlight, index) => {
						var currCorrect = highlight.getAttribute("truth") === "true",
							answerTxt;
						correct = correct && currCorrect;
						if (highlight.getAttribute("name") != undefined) {
							answerTxt = highlight.getAttribute("name");
						} else {
							answerTxt = 'Hotspot ' + highlight.getAttribute("id") + 1;
						}
						l_options.push({
							id: highlight.getAttribute("id") + 1 + "",
							answer: answerTxt,
							result: currCorrect
						});
						l_answers.push(answerTxt);
						l_feedbacks.push(x_GetTrackingTextFromHTML(highlight.text, ""));
					});

					var result = {
						success: correct,
						score: setScore
					}
					XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, l_options, l_answers, l_feedbacks);
					//XTSetPageScore(x_currentPage, setScore, pageXML.getAttribute("trackinglabel"));

					// activity is incomplete - some incorrect are selected or not all correct are selected (& max attempts not made)
				} else {

					if (amountOfCorrect > 0 || amountOfWrong > 0) {
						var scoreTxt;

						if (amountOfCorrect == 0) {
							// all wrong
							scoreTxt = pageXML.getAttribute("allWrong") != undefined ? pageXML.getAttribute("allWrong") : "You have not selected any of the /c correct answers."
							scoreTxt += pageXML.getAttribute("again") != undefined ? (pageXML.getAttribute("again") != '' ? '<br/>' + pageXML.getAttribute("again") : '') : '<br/>Try again, you have /a attempt(s) left.';
							scoreTxt = scoreTxt.replace("/c", amountOfCorrectOptions);
							scoreTxt = scoreTxt.replace("/a", remainingAttempts);

						} else if (amountOfWrong == 0) {
							// all correct
							if (pageXML.getAttribute("allGood2") == undefined) {
								// for projects made before allGood2 added to xwd
								scoreTxt = pageXML.getAttribute("scoreTxt") != undefined ? pageXML.getAttribute("scoreTxt") : "You have /r answer(s) right (out of /c) and /w wrong.";
							} else {
								scoreTxt = pageXML.getAttribute("allGood2") != undefined ? pageXML.getAttribute("allGood2") : "You have not selected all of the /c correct answers."
							}
							scoreTxt += pageXML.getAttribute("again") != undefined ? (pageXML.getAttribute("again") != '' ? '<br/>' + pageXML.getAttribute("again") : '') : '<br/>Try again, you have /a attempt(s) left.';
							scoreTxt = scoreTxt.replace("/r", amountOfCorrect);
							scoreTxt = scoreTxt.replace("/w", amountOfWrong);
							scoreTxt = scoreTxt.replace("/c", amountOfCorrectOptions);
							scoreTxt = scoreTxt.replace("/a", remainingAttempts);

						} else {
							// some correct, some incorrect
							scoreTxt = pageXML.getAttribute("scoreTxt") != undefined ? pageXML.getAttribute("scoreTxt") : "You have /r answer(s) right (out of /c) and /w wrong.";
							scoreTxt += pageXML.getAttribute("again") != undefined ? (pageXML.getAttribute("again") != '' ? '<br/>' + pageXML.getAttribute("again") : '') : '<br/>Try again, you have /a attempt(s) left.';
							scoreTxt = scoreTxt.replace("/r", amountOfCorrect);
							scoreTxt = scoreTxt.replace("/w", amountOfWrong);
							scoreTxt = scoreTxt.replace("/c", amountOfCorrectOptions);
							scoreTxt = scoreTxt.replace("/a", remainingAttempts);
						}

						var h3 = $('<h3>').append(scoreTxt);
						jGetElement(blockid, ".score").html(h3);

					} else {
						// no attempt was made
						var warning = pageXML.getAttribute("warning") != undefined ? pageXML.getAttribute("warning") : "You have not selected anything";
						var h3 = $('<h3>').append(warning)
						jGetElement(blockid, ".score").html(h3);
						attempts--;
					}

				}

				state.attempts = attempts;
			});

		state.attempts = attempts;
		state.highlightsIndexArray = highlightsIndexArray;
		state.highlightsArray = highlightsArray;
		state.allHighlightsArray = allHighlightsArray;
	};

	this.resizeImg = function (blockid, firstLoad) {
		let pageXML = x_getBlockXML(blockid);

		if($("#x_page" + x_currentPage).is(":hidden")){
			$("#x_page" + x_currentPage).show();
		}
		jGetElement(blockid, '.mapster_el').remove(); // force this to be removes as sometimes it's not (don't know why unbind below doesn't always work)
		jGetElement(blockid, ".image").mapster('unbind');

		var imgMaxW, imgMaxH;
		if (pageXML.getAttribute("textWidth") == "none") {
			imgMaxW = Math.round($x_pageHolder.width() * 0.85 - 20);
			imgMaxH = Math.round($x_pageHolder.height() * 0.85 - 20);
		} else if (pageXML.getAttribute("textWidth") == "narrow") {
			imgMaxW = Math.round($x_pageHolder.width() * 0.6 - 20);
			imgMaxH = Math.round($x_pageHolder.height() - 0.6 - 20);

		} else if (pageXML.getAttribute("textWidth") == "max") {
			imgMaxW = Math.round($x_pageHolder.width() * 0.3 - 20);
			imgMaxH = Math.round($x_pageHolder.height() - 50);
		} else {
			imgMaxW = Math.round($x_pageHolder.width() * 0.55 - 20);
			imgMaxH = Math.round($x_pageHolder.height() - 50);
		}

		if (imgMaxH + 70 > $x_pageHolder.height()) {
			imgMaxH *= 0.75
		}
		x_scaleImg(jGetElement(blockid, ".image"), imgMaxW, imgMaxH, true, firstLoad, false);

		jGetElement(blockid, ".image").css({
			"opacity": 1,
			"filter": 'alpha(opacity=100)',
			"max-height": imgMaxH,
			"max-width": imgMaxW
		});
		jGetElement(blockid, '.panel').css({
			'max-width': jGetElement(blockid, ".image").width() + 'px',
		});

		this.createHS(blockid, firstLoad);
	};

	this.createHS = function (blockid, first = false) {
		const state = x_getPageDict("state", blockid)
		let pageXML = x_getBlockXML(blockid);
		const highlightsIndexArray = state.highlightsIndexArray;
		const highlightsArray = state.highlightsArray;
		const allHighlightsArray = state.allHighlightsArray;
		// create hotspots - taking scale of image into account
		var scale = jGetElement(blockid, ".image").width() / jGetElement(blockid, ":not(.mapster_el).image").data("origSize")[0],
			correctOptions = [],
			correctAnswer = [],
			correctFeedback = [];

		jGetElement(blockid, ".hsHolder").html("<map class=\"hsHolder_map\" name=\"" + blockid + "_hsHolder_map\"></map>");
		allHighlightsArray.length = 0;
		$(pageXML).children().each(function (i) {
			var _this = this;
			_this.setAttribute("id", i);
			allHighlightsArray.push(_this);
			if (this.getAttribute("name") != undefined) {
				var answerTxt = this.getAttribute("name");
			}
			else {
				var answerTxt = 'Hotspot ' + i + 1;
			}
			correctOptions.push({
				id: (i + 1) + "",
				answer: answerTxt,
				result: this.getAttribute('truth') == 'true'
			});
			if (this.getAttribute('truth') == 'true') {
				correctAnswer.push(answerTxt);
			}
			correctFeedback.push(x_GetTrackingTextFromHTML(this.getAttribute('text'), ""));
			var $hotspot = $('<area class="hotspot" data-key="' + i + '"  shape="poly" href="#" tabindex="0" />');
			var coords = [];
			var coords_string = "";

			// Old way of specifying hotspot: x,y,w,h
			if (this.getAttribute("mode") == undefined && this.getAttribute("x") != undefined && this.getAttribute("y") != undefined && this.getAttribute("w") != undefined && this.getAttribute("h") != undefined) {
				// create polygon, start with topleft
				coords[0] = { x: parseFloat(this.getAttribute("x")), y: parseFloat(this.getAttribute("y")) };
				coords[1] = { x: parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("w")), y: parseFloat(this.getAttribute("y")) };
				coords[2] = { x: parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("w")), y: parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("h")) };
				coords[3] = { x: parseFloat(this.getAttribute("x")), y: parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("h")) };
			}
			if (coords.length == 4 || (this.getAttribute("points") != undefined && this.getAttribute("mode") != undefined)) {
				if (coords.length != 4) {
					coords = JSON.parse(this.getAttribute("points"));
				}

				if (coords.length > 0) {
					for (var j in coords) {
						if (j > 0) {
							coords_string += ",";
						}
						coords_string += coords[j].x + "," + coords[j].y;
					}
				}
			}

			$hotspot
				.attr("coords", coords_string)
				.click(function () {
					const state = x_getPageDict("state", blockid)
					var $this = $(this);
					if ($this.hasClass('hotspot') && highlightsIndexArray.indexOf(i) == -1) {
						$this.addClass("selected");
						highlightsArray.push(_this);
						highlightsIndexArray.push(i);

					} else {
						$this.removeClass("selected")
						const index = highlightsArray.indexOf(_this);
						if (index > -1) {
							highlightsArray.splice(index, 1);
							highlightsIndexArray.splice(index, 1);
						}
					}

					state.highlightsArray = highlightsArray;
					state.highlightsIndexArray = highlightsIndexArray;
				})
				.focusin(function () {
					jGetElement(blockid, 'img').mapster('set_options', tabfocusoptions);
					$(this)
						.removeClass("transparent")
						.addClass("highlight");
					$(this).mapster('highlight');

				})
				.focusout(function () {
					jGetElement(blockid, 'img').mapster('set_options', options);
					$(this)
						.removeClass("highlight")
						.addClass("transparent");
					jGetElement(blockid, "img").mapster('highlight', false);
				})
				.keypress(function (e) {
					var charCode = e.charCode || e.keyCode;
					if (charCode == 32) {
						$(this).trigger("click");
					}
				});

			if (pageXML.getAttribute("hs_showTooltip") != undefined && pageXML.getAttribute("hs_showTooltip") !== "false") {
				if (this.getAttribute("alttext") != undefined && this.getAttribute("alttext") != "")
					$hotspot.attr("title", this.getAttribute("alttext"));
				else
					$hotspot.attr("title", this.getAttribute("name"));
			} else {
				if (this.getAttribute("alttext") != undefined && this.getAttribute("alttext") != "")
					$hotspot.attr("alt", this.getAttribute("alttext"));
				else
					$hotspot.attr("alt", this.getAttribute("name"));
			}

			jGetElement(blockid, ".hsHolder_map").append($hotspot);
		});
			var label = x_GetTrackingTextFromHTML(pageXML.getAttribute('name'), "Hotspot question " + (x_currentPage + 1));
		if (pageXML.getAttribute("trackinglabel") != undefined && pageXML.getAttribute("trackinglabel") != "") {
			label = pageXML.getAttribute("trackinglabel");
		}
		if(first) {
			XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'multiplechoice', label, correctOptions, correctAnswer, correctFeedback, pageXML.getAttribute("grouping"));
		}
		
		var stroke = true;
		var highlightColour = "#ffff00";
		var strokeWidth = 2;
		var strokeOpacity = 1;
		var fill = true;
		var fillColor = "#000000";
		var fillOpacity = 0.1;
		if (pageXML.getAttribute("hicol") != undefined && pageXML.getAttribute("hicol") != "") {
			highlightColour = x_getColour(pageXML.getAttribute("hicol"));
		}
		if (pageXML.getAttribute("hs_strokeWidth") != undefined && pageXML.getAttribute("hs_strokeWidth") != "") {
			strokeWidth = parseInt(pageXML.getAttribute("hs_strokeWidth"));
			if (strokeWidth == 0) {
				stroke = false;
			}
		}
		if (pageXML.getAttribute("hs_strokeOpacity") != undefined && pageXML.getAttribute("hs_strokeOpacity") != "") {
			strokeOpacity = parseFloat(pageXML.getAttribute("hs_strokeOpacity"));
		}
		if (pageXML.getAttribute("hs_fill") != undefined && pageXML.getAttribute("hs_fill") != "") {
			fill = pageXML.getAttribute("hs_fill") === "true";
		}
		if (pageXML.getAttribute("hs_fillColor") != undefined && pageXML.getAttribute("hs_fillColor") != "") {
			fillColor = x_getColour(pageXML.getAttribute("hs_fillColor"));
		}
		if (pageXML.getAttribute("hs_fillOpacity") != undefined && pageXML.getAttribute("hs_fillOpacity") != "") {
			fillOpacity = parseFloat(pageXML.getAttribute("hs_fillOpacity"));
		}

		options = {
			render_highlight:
			{
				fill: false,
				fillColor: fillColor.substr(1),
				fillOpacity: fillOpacity,
				stroke: false,
				strokeColor: highlightColour.substr(1),
				strokeOpacity: strokeOpacity,
				strokeWidth: strokeWidth
			},
			render_select:
			{
				fill: fill,
				fillColor: fillColor.substr(1),
				fillOpacity: fillOpacity,
				stroke: stroke,
				strokeColor: highlightColour.substr(1),
				strokeOpacity: strokeOpacity,
				strokeWidth: strokeWidth
			},
			scaleMap: true,
			clickNavigate: true
		};

		var tabfocusoptions = JSON.parse(JSON.stringify(options));
		// Make sure focus is ALWAYS visible, even if strokewidth is set to 0
		tabfocusoptions.render_highlight.stroke = true;
		tabfocusoptions.render_highlight.strokeWidth = (strokeWidth == 0 ? 1 : strokeWidth * 2);

		jGetElement(blockid, 'img').mapster(options);

		for (var i = 0; i < highlightsIndexArray.length; i++) {
			jGetElement(blockid, ".pageContents .hotspot:eq(" + highlightsIndexArray[i] + ")").mapster("select");
		}

		// if activity is complete, make sure the click functionality doesn't start working again after resize
		if (jGetElement(blockid, '.hsHolder').hasClass('complete')) {
			highlightsArray.forEach((highlight) => {
				jGetElement(blockid, "area").off('click')
			})
		}
	};
};
