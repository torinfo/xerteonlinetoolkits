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

// -----------------------------------------------------------------------------------------
// All drawing code based on Actionscript routines by Ric Ewing (ric@formequalsfunction.com)
// -----------------------------------------------------------------------------------------

// pageChanged & sizeChanged functions are needed in every model file
// other functions for model should also be in here to avoid conflicts
var inventoryBlock = new function () {

	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".infoHolder .panel");
			// fix sizing
			//$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
		}
	}

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		// set fixed text fields and page layout
		jGetElement(blockid, ".mainTxt").html(x_addLineBreaks(pageXML.getAttribute("instructions")));
		jGetElement(blockid, ".feedbackTxt").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
		jGetElement(blockid, ".chartTitle").html(pageXML.getAttribute("chartTitle"));

		var panelWidth = pageXML.getAttribute("panelWidth");
		var align = pageXML.getAttribute("align") == "right" ? "Right" : "Left";
		if (align == "Right") {
			jGetElement(blockid, ".textHolder")
				.removeClass("left")
				.addClass("right")
				.appendTo(jGetElement(blockid, ".pageContents .splitScreen"));
			jGetElement(blockid, ".infoHolder")
				.removeClass("right")
				.addClass("left");
		}

		if (panelWidth == "Small") {
			align == "Right" ? jGetElement(blockid, ".pageContents .splitScreen").addClass("medium") : jGetElement(blockid, ".pageContents .splitScreen").addClass("large");
		} else if (panelWidth == "Large") {
			align == "Right" ? jGetElement(blockid, ".pageContents .splitScreen").addClass("xlarge") : jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
		} else {
			align == "Right" ? jGetElement(blockid, ".pageContents .splitScreen").addClass("large") : jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
		}

		var feedbackLabel = pageXML.getAttribute("feedbackLabel");
		if (feedbackLabel == undefined) {
			feedbackLabel = "Feedback";
		}
		jGetElement(blockid, ".qFeedbackTitle").html(feedbackLabel);


		// get language strings for buttons etc. - if language attributes aren't in xml will have to use english fall back
		// submitBtnWidth/nextBtnWidth/restartBtnWidth attributes not used as buttons will be sized automatically
		var checkBtnText = pageXML.getAttribute("submitBtnText");
		if (checkBtnText == undefined) {
			checkBtnText = "Submit";
		}
		var nextBtnText = pageXML.getAttribute("nextBtnText");
		if (nextBtnText == undefined) {
			nextBtnText = "Next";
		}
		var restartBtnText = pageXML.getAttribute("restartBtnText");
		if (restartBtnText == undefined) {
			restartBtnText = "Restart";
		}

		var scoreQ = function ($btn) {
			jGetElement(blockid, ".optionHolder input").attr("disabled", "disabled");

			// add question weighted score to class score
			var currentQuestion = $(pageXML).children()[jGetElement(blockid, ".pageContents").data("questions")[jGetElement(blockid, ".pageContents").data("currentQ")]];

			jGetElement(blockid, ".optionHolder input:checked").each(function () {
				// calculate and store new score for this option's class based on it's previous score and this option's weight
				var selectedOptionData = $(currentQuestion).children()[$(this).parent().index()];
				jGetElement(blockid, ".pageContents").data("scores").splice(selectedOptionData.getAttribute("class"), 1, jGetElement(blockid, ".pageContents").data("scores")[selectedOptionData.getAttribute("class")] + Number([selectedOptionData.getAttribute("weight")]));
			});

			$btn.attr("disabled", "disabled");
			$btn.hide().show(); // hack to take care of IEs inconsistent handling of clicks
		}

		// set up buttons - check & next buttons shown during quiz and restart button shown at end with chart
		jGetElement(blockid, ".checkBtn")
			.button({
				label: checkBtnText
			})
			.attr("disabled", "disabled")
			.click(function () {
				// get feedback for selected options
				var currentQuestion = $(pageXML).children()[jGetElement(blockid, ".pageContents").data("questions")[jGetElement(blockid, ".pageContents").data("currentQ")]],
					feedbackTxt = "";

				jGetElement(blockid, ".optionHolder input:checked").each(function () {
					// id is of the form optionX, where X is the index of the option
					var index = parseInt(this.id.substr(6));
					var selectedOptionData = $(currentQuestion).children()[index];
					if (currentQuestion.getAttribute("questionFeedback") == "yes") {
						feedbackTxt += x_addLineBreaks(selectedOptionData.getAttribute("feedback")) + '<br/>';
					}
				});

				if (currentQuestion.getAttribute("questionFeedback") == "yes") {
					jGetElement(blockid, ".qFeedbackTxt").html(feedbackTxt);
					jGetElement(blockid, ".qFeedback").show();
				}

				jGetElement(blockid, ".nextBtn").removeAttr("disabled");

				scoreQ($(this));
			});

		jGetElement(blockid, ".nextBtn")
			.button({
				label: nextBtnText
			})
			.attr("disabled", "disabled")
			.click(function () {
				var currentQuestion = $(pageXML).children()[jGetElement(blockid, ".pageContents").data("questions")[jGetElement(blockid, ".pageContents").data("currentQ")]];
				if (currentQuestion.getAttribute("questionFeedback") != "yes") {
					scoreQ($(this));
				} else {
					$(this).attr("disabled", "disabled");
					$(this).hide().show(); // hack to take care of IEs inconsistent handling of clicks
				}

				jGetElement(blockid, ".pageContents").data("currentQ", jGetElement(blockid, ".pageContents").data("currentQ") + 1);
				if (jGetElement(blockid, ".pageContents").data("currentQ") == jGetElement(blockid, ".pageContents").data("questions").length) {
					inventoryBlock.drawChart(blockid);
				} else {
					inventoryBlock.loadQ(blockid);
				}
			});

		jGetElement(blockid, ".restartBtn")
			.button({
				label: restartBtnText
			})
			.click(function () {
				inventoryBlock.startQs(blockid);
			});

		if ($(pageXML).children().length == 0) {
			jGetElement(blockid, ".infoHolder .panel").html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noQ", "No questions have been added") + '</span>');
		} else {
			// store data needed later - class info and string to base qNoTxt on
			var classes = pageXML.getAttribute("classes").split(",");
			if (classes[classes.length - 1] == "") {
				classes.splice(-1, 1);
			}
			if (classes.length > 10) {
				classes.splice(10);
			}

			var qNoTxt = pageXML.getAttribute("quesCount");
			if (qNoTxt == undefined) {
				qNoTxt = "Question {i} of {n}";
			}

			jGetElement(blockid, ".pageContents").data({
				"classes": classes,
				"qNoTxt": qNoTxt
			});


			this.startQs(blockid);
		}

		this.sizeChanged();
		x_pageLoaded();
	}


	this.startQs = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		jGetElement(blockid, ".pageContents .quiz").show();
		jGetElement(blockid, ".pageContents .chart").hide();
		jGetElement(blockid, ".nextBtn, .checkBtn").attr("disabled", "disabled");

		var questions = [],
			scores = [],
			totals = [],
			numQs = $(pageXML).children().length,
			i;

		// get list of the order questions will be shown
		if (pageXML.getAttribute("order") == "random") {
			var qNums = [];
			for (i = 0; i < numQs; i++) {
				qNums.push(i);
			}
			for (i = 0; i < numQs; i++) {
				var qNum = Math.floor(Math.random() * qNums.length);
				questions.push(qNums[qNum]);
				qNums.splice(qNum, 1);
			}

		} else { // sequence
			for (i = 0; i < numQs; i++) {
				questions.push(i);
			}
		}

		// reset stored scores
		for (i = 0; i < jGetElement(blockid, ".pageContents").data("classes").length; i++) {
			scores.push(0);
			totals.push(0);
		}

		jGetElement(blockid, ".pageContents").data({
			"questions": questions,
			"currentQ": 0,
			"scores": scores,
			"totals": totals
		});

		this.loadQ(blockid);
	}


	this.loadQ = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		var thisQ = $(pageXML).children()[jGetElement(blockid, ".pageContents").data("questions")[jGetElement(blockid, ".pageContents").data("currentQ")]];

		// set up question text, image, feedback text
		jGetElement(blockid, ".qNo").html(jGetElement(blockid, ".pageContents").data("qNoTxt").replace("{i}", jGetElement(blockid, ".pageContents").data("currentQ") + 1).replace("{n}", jGetElement(blockid, ".pageContents").data("questions").length));

		var infoString = thisQ.getAttribute("prompt"),
			url = thisQ.getAttribute("image");
		if (url != undefined && url != "") {
			var newString = "";
			newString += '<img src="' + x_evalURL(url) + '" class="quizImg"';
			if (thisQ.getAttribute("tip") != undefined && thisQ.getAttribute("tip") != "") {
				newString += 'alt="' + thisQ.getAttribute("tip") + '"';
			}
			newString += ' />';
			infoString = newString + infoString;
		}
		jGetElement(blockid, ".qTxt").html(x_addLineBreaks(infoString));

		jGetElement(blockid, ".qFeedback")
			.hide()
			.find(".qFeedbackTxt").html("");

		if ($(thisQ).children().length == 0) {
			jGetElement(blockid, ".optionHolder").html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noA", "No answer options have been added") + '</span>');
		} else {
			// set up radio buttons or check boxes
			var $optionHolder = jGetElement(blockid, ".optionHolder");
			if (thisQ.getAttribute("type") == "Multiple Answer") {
				$optionHolder.html('<div class="optionGroup"><input type="checkbox" name="option" /><label class="optionTxt"></label></optionGroup>');
			} else {
				$optionHolder.html('<div class="optionGroup"><input type="radio" name="option" /><label class="optionTxt"></label></optionGroup>');
			}
			var $optionGroup = $optionHolder.find(".optionGroup"),
				$checkBtn = jGetElement(blockid, ".checkBtn"),
				$qFeedback = jGetElement(blockid, ".qFeedback");

			$(thisQ).children()
				.each(function (i) {
					var $thisOptionGroup, $thisOption, $thisOptionTxt;
					if (i != 0) {
						$thisOptionGroup = $optionGroup.clone().appendTo($optionHolder);
						$thisOption = $thisOptionGroup.find('input');
						$thisOptionTxt = $thisOptionGroup.find('.optionTxt');
					} else {
						$thisOptionGroup = $optionGroup;
						$thisOption = $thisOptionGroup.find('input');
						$thisOptionTxt = $thisOptionGroup.find('.optionTxt');
					}

					$thisOption
						.attr({
							"value": this.getAttribute("text"),
							"id": "option" + i
						})
						.change(function () {
							$qFeedback.hide();
							var $selected = jGetElement(blockid, ".optionHolder input:checked"),
								$btn = thisQ.getAttribute("questionFeedback") == "yes" ? $checkBtn : jGetElement(blockid, ".nextBtn");
							if ($selected.length > 0) {
								$btn.removeAttr("disabled");
							} else {
								$btn.attr("disabled", "disabled");
							}
						})
						.focusin(function () {
							$thisOptionGroup.addClass("highlight");
						})
						.focusout(function () {
							$thisOptionGroup.removeClass("highlight");
						});

					var optTxt = x_addLineBreaks(this.getAttribute("text"));
					if (x_params.authorSupport == "true") {
						optTxt += ' <span class="alert">[' + jGetElement(blockid, ".pageContents").data("classes")[this.getAttribute("class")] + " : " + this.getAttribute("weight") + ']</span>';
					}

					$thisOptionTxt
						.attr("for", "option" + i)
						.data("option", $thisOption)
						.html(optTxt);


					if (pageXML.getAttribute("scoreType") == "individual percent") {
						// need to keep track of max score possible for each class
						jGetElement(blockid, ".pageContents").data("totals").splice(this.getAttribute("class"), 1, jGetElement(blockid, ".pageContents").data("totals")[this.getAttribute("class")] + Number(this.getAttribute("weight")));
					}
				});
		}

		if (thisQ.getAttribute("questionFeedback") != "yes") {
			jGetElement(blockid, ".checkBtn").hide();
		} else {
			jGetElement(blockid, ".checkBtn").show();
		}

		x_pageContentsUpdated();
	}


	this.drawChart = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		jGetElement(blockid, ".pageContents .quiz").hide();
		jGetElement(blockid, ".pageContents .chart").show();

		var scores = jGetElement(blockid, ".pageContents").data("scores"),
			maxScore = 0, // max value to show on bar / line graph
			i;

		if (pageXML.getAttribute("scoreType") == "relative percent") {
			// convert scores to percentage of total points scored
			// e.g. classA = 20%, classB = 65%, classC = 15%
			var totalScore = 0;
			for (i = 0; i < scores.length; i++) {
				totalScore += scores[i];
			}
			for (i = 0; i < scores.length; i++) {
				scores.splice(i, 1, Math.round((scores[i] / totalScore) * 100));
			}
			maxScore = 100;

		} else if (pageXML.getAttribute("scoreType") == "individual percent") {
			// coverts scores to percantage of total points possible for that class
			// e.g. classA = 70%, classB = 60%, classC = 20%
			var totals = jGetElement(blockid, ".pageContents").data("totals");
			for (i = 0; i < scores.length; i++) {
				if (scores[i] > 0) {
					scores.splice(i, 1, Math.round((scores[i] / totals[i]) * 100));
				}
			}
			maxScore = 100;

		} else {
			// absolute - uses numeric scores
			// e.g. classA = 12, classB = 36, classC = 7
			for (i = 0; i < scores.length; i++) {
				maxScore = Math.max(maxScore, scores[i]);
			}

		}

		// draw everything on canvas - predominately John Smith's code from chart page model
		var chartHolder = jGetElement(blockid, ".chartHolder")[0];
		if (chartHolder.getContext) {
			var $panel = jGetElement(blockid, ".pageContents .panel"),
				availW = Math.min(550, Math.max(300, $panel.width())),
				availH = Math.min(550, Math.max(300, $x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 15 - jGetElement(blockid, ".restartBtn").height() - jGetElement(blockid, ".chartTitle").height()));

			chartHolder.width = availW;
			chartHolder.height = availH;

			var chartHolderContext = chartHolder.getContext("2d");
			if (pageXML.getAttribute("chartType") == "pie") {
				chartHolderContext.translate(60, 0); // space on left for legend
			} else {
				chartHolderContext.translate(30, 0); // space on left for y axis text
			}

			var colour = x_getColour(pageXML.getAttribute("chartColour")),
				txtColour = jGetElement(blockid, ".mainTxt").css("color");

			if (colour.substring(0, 2) == "0x") { // hex value
				colour = '#' + Array(9 - colour.length).join('0') + colour.substring(2);
			}
			chartHolderContext.strokeStyle = colour;
			chartHolderContext.fillStyle = colour;
			chartHolderContext.lineWidth = 2;


			switch (pageXML.getAttribute("chartType")) {
				case "pie":
					this.doPie(blockid, chartHolderContext, scores, colour, availW, availH, txtColour);
					break;
				case "bar":
					this.doBar(chartHolderContext, scores, maxScore, availW, availH);
					break;
				case "line":
					this.doLine(chartHolderContext, scores, maxScore, availW, availH);
			}

			if (pageXML.getAttribute("chartType") != "pie") {
				this.doAxesAndLabels(blockid, chartHolderContext, scores, maxScore, availW, availH, txtColour);
			}

			// give canvas a description including data so it's accessible
			var chartDescr = pageXML.getAttribute("chartTitle") + ":";
			for (i = 0; i < scores.length; i++) {
				chartDescr += " " + jGetElement(blockid, ".pageContents").data("classes")[i] + " = " + scores[i];
				if (pageXML.getAttribute("scoreType") == "relative percent" || pageXML.getAttribute("scoreType") == "individual percent") {
					chartDescr += "%";
				}
				if (i != scores.length - 1) {
					chartDescr += ",";
				}
			}
			jGetElement(blockid, ".chartHolder").attr("title", chartDescr);

		} else { // canvas tag not supported - display error message and data in a table
			var errorTxt = x_getLangInfo(x_languageData.find("errorBrowser")[0], "label", "Your browser does not fully support this page type"),
				tableHolder = jGetElement(blockid, ".infoHolder .chart"),
				table = '<table class="full">';

			tableHolder.find(".chartTitle, .chartHolder").hide();
			tableHolder.find("table, p").remove();

			for (var i = 0; i < scores.length; i++) {
				table += '<tr><td>' + jGetElement(blockid, ".pageContents").data("classes")[i] + '</td><td>' + scores[i];
				if (pageXML.getAttribute("scoreType") == "relative percent" || pageXML.getAttribute("scoreType") == "individual percent") {
					table += "%";
				}
				table += '</td></tr>';
			}
			table += '</table>';

			tableHolder.append('<p class="alert">' + errorTxt + '</p>' + table);
		}
	}


	// --- FUNCTIONS TO DRAW SHAPES ON CANVAS ---

	this.doBar = function (canvas, scores, maxScore, availW, availH) {
		//var	barW = 350 / scores.length,
		var barW = (availW - 40) / scores.length,
			barH,
			h = (availH - 30) / maxScore; // height on graph of each score point

		for (var i = 0; i < scores.length; i++) {
			barH = scores[i] * h;
			canvas.fillRect(barW * i, availH - 20, barW * 0.9, -barH); // xywh
		}

		canvas.fill();
		canvas.stroke();
	}

	this.doLine = function (canvas, scores, maxScore, availW, availH) {
		var barW = (availW - 40) / scores.length,
			barH,
			h = (availH - 30) / maxScore;

		canvas.beginPath();
		canvas.moveTo(barW / 2, availH - 20 - (scores[0] * h));
		for (var i = 0; i < scores.length; i++) {
			canvas.lineTo((barW * i) + (barW / 2), availH - 20 - (scores[i] * h));
		}
		canvas.stroke();
	}

	this.doAxesAndLabels = function (blockid, canvas, scores, maxScore, availW, availH, txtColour) {
		// draw x/y axis
		canvas.strokeStyle = "#000000";
		canvas.beginPath();
		canvas.moveTo(0, 10);
		canvas.lineTo(0, availH - 20 + 5);
		canvas.moveTo(-5, availH - 20);
		canvas.lineTo(availW - 40, availH - 20);
		canvas.stroke();

		// draw the x labels
		var barW = (availW - 40) / scores.length;
		for (var i = 0; i < scores.length; i++) {
			canvas.fillStyle = txtColour;
			canvas.textBaseline = "top";
			var xLength = canvas.measureText(jGetElement(blockid, ".pageContents").data("classes")[i]).width;
			canvas.fillText(jGetElement(blockid, ".pageContents").data("classes")[i], barW * (i + 0.5) - xLength / 2 - 1, availH - 16);
		}

		// draw the y labels
		canvas.fillText(0, -25, availH - 20 - 6);
		canvas.fillText(maxScore, -25, 5);
	}

	this.doPie = function (blockid, canvas, scores, colour, availW, availH, txtColour) {
		// build the colour array - convert to rgb to get different shades and then convert back to hex
		var rgbToHex = function (r, g, b) {
			return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		}

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colour);
		var rgb = result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;

		var colours = [];
		for (var i = 0; i < scores.length; i++) {
			colours.push(rgbToHex(
				parseInt(rgb.r + i * (255 - rgb.r) / scores.length),
				parseInt(rgb.g + i * (255 - rgb.g) / scores.length),
				parseInt(rgb.b + i * (255 - rgb.b) / scores.length)
			));
		}

		// draw legend
		for (var i = 0; i < scores.length; i++) {
			canvas.fillStyle = colours[i];
			canvas.fillRect(-50, 10 + i * 20, 12, 12); // xywh
			canvas.fill();
			canvas.textBaseline = "top";
			canvas.fillStyle = txtColour;
			canvas.fillText(jGetElement(blockid, ".pageContents").data("classes")[i], -30, 10 + i * 20);
		}

		// draw chart
		var total = 0;
		for (var i = 0; i < scores.length; i++) {
			total += scores[i];
		}

		var theta,
			exTheta = 0,
			diameter = Math.min(availW - 70, availH - 20);
		for (var i = 0; i < scores.length; i++) { // draw each segment
			theta = Number(scores[i]) / total * 360;
			this.drawWedge(canvas, diameter / 2, diameter / 2 + 10, diameter / 2, theta, exTheta, colours[i]);
			exTheta += theta;
		}
	}

	this.drawWedge = function (canvas, x, y, radius, arc, r, colour) { // xy are to centre of circle
		canvas.save();
		canvas.translate(x, y);
		canvas.rotate(-r * Math.PI / 180);
		canvas.fillStyle = colour;
		canvas.strokeStyle = colour;
		canvas.beginPath();
		canvas.moveTo(0, 0);
		var segAngle, theta, angle, angleMid, segs, ax, ay, bx, by, cx, cy;
		if (Math.abs(arc) > 360) {
			arc = 360;
		}
		segs = Math.ceil(Math.abs(arc) / 45);
		segAngle = arc / segs;
		theta = - Math.PI * segAngle / 180;
		angle = - Math.PI * 0 / 180;
		if (segs > 0) {
			ax = Math.cos(0 * Math.PI / 180) * radius;
			ay = Math.sin(-0 * Math.PI / 180) * radius;
			canvas.lineTo(ax, ay);
			for (var i = 0; i < segs; i++) {
				angle += theta;
				angleMid = angle - theta / 2;
				bx = Math.cos(angle) * radius;
				by = Math.sin(angle) * radius;
				cx = Math.cos(angleMid) * radius / Math.cos(theta / 2);
				cy = Math.sin(angleMid) * radius / Math.cos(theta / 2);
				canvas.quadraticCurveTo(cx, cy, bx, by);
			}
			canvas.lineTo(0, 0);
		}
		canvas.closePath();
		canvas.fill();
		canvas.globalAlpha = 100;
		canvas.stroke();
		canvas.restore();
	}
}
