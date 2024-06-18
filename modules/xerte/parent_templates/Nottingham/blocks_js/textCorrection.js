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

var textCorrectionBlock = new function () {

	this.pageChanged = function (blockid) {
	};

	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		if (x_browserInfo.mobile === false) {
			var $panel = jGetElement(blockid, ".pageContents .panel");
			//$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
		}

		var $mainPanel = jGetElement(blockid, ".mainPanel");
		var padding = $mainPanel.innerWidth() - $mainPanel.width();
	};

	this.leavePage = function (blockid) {
		const state = x_getPageDict("state", blockid)
		if (!state.hasExited) {
			textCorrectionBlock.exitTrackTextCorrection(blockid);
		}
	};

	this.exitTrackTextCorrection = function (blockid) {
		const state = x_getPageDict("state", blockid)
		var input = jGetElement(blockid, '.answerInput textarea').val();

		var checkAnswer = false;
		if (input === state.answer) {
			checkAnswer = true;
		}

		var result = {
				score: checkAnswer? 100: 0,
				success: checkAnswer
		};

		XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, "", input, []);
		//XTSetPageScore(x_currentPage, result);
	};

	this.init = function (blockid) {
		const state = x_pushToPageDict({}, "state", blockid);
		let pageXML = x_getBlockXML(blockid);
		state.hasExited = false

		var weighting = 1.0;
		if (pageXML.getAttribute("trackingWeight") != null) {
			weighting = pageXML.getAttribute("trackingWeight");
		}
		//XTSetPageType(x_currentPage, "fill in", 1, weighting);
		XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "text", weighting);

		// page layout
		var panelWidth = pageXML.getAttribute("panelWidth"),
			$splitScreen = jGetElement(blockid, ".pageContents .splitScreen");
		var $textHolder = jGetElement(blockid, ".textHolder");

		if (panelWidth == "Full") {
			jGetElement(blockid, ".pageContents .panel").appendTo(jGetElement(blockid, '.pageContents'));
			$splitScreen.remove();
		} else {
			$textHolder.html(x_addLineBreaks(pageXML.getAttribute("introduction")));

			var textAlign = pageXML.getAttribute("align");
			if (textAlign != "Right") {
				if (panelWidth == "Small") {
					$splitScreen.addClass("large");
				} else if (panelWidth == "Large") {
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
				if (panelWidth == "Small") {
					$splitScreen.addClass("medium");
				} else if (panelWidth == "Large") {
					$splitScreen.addClass("xlarge");
				} else {
					$splitScreen.addClass("large");
				}
			}
		}

		var $question = jGetElement(blockid, ".question");
		var originalQuestion = $('<div>').html(pageXML.getAttribute("wrongText")).text().trim();
		var convertedQuestion = '<p>' + originalQuestion.replace(/(?:\r\n|\r|\n)/g, '<br>') + '</p>';
		$question.html(convertedQuestion);

		var answer = $('<div>').html(pageXML.getAttribute("answer")).text().trim();
		state.answer = answer;
		if (pageXML.getAttribute("disableAnswers") !== "false") {
			var correctLabel = pageXML.getAttribute("correctLabel") !== null ? pageXML.getAttribute("correctLabel") : 'Correct Answer',
				convertedAnswer = '<p>' + answer.replace(/(?:\r\n|\r|\n)/g, '<br>') + '</p>';

			$('answer')
				.append("<h3 class='fbLabel'>" + correctLabel + "</h3>")
				.append(convertedAnswer)
				.hide();
		} else {
			$('answer').remove();
		}
		var label = x_GetTrackingTextFromHTML(pageXML.getAttribute("introduction"), "");
		XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), "text", label, [state.answer], state.answer);

		//Add aria-label to answer box
		var answerFieldLabel = pageXML.getAttribute("answerLabel");
		if (answerFieldLabel === undefined | answerFieldLabel === null) {
			answerFieldLabel = "Answer";
		}
		jGetElement(blockid, '.answerInput textarea').attr({ "aria-label": answerFieldLabel });

		if (pageXML.getAttribute("copyText") === "true") {
			var placeHolder = $('<div>').html(originalQuestion).text().trim();
			jGetElement(blockid, '.answerInput textarea')
				.val(placeHolder)
				.data('placeHolder', placeHolder);
		}

		jGetElement(blockid, ".FurtherClarification")
			.append("<h3 class='fbLabel'>" + pageXML.getAttribute("FurtherClarificationLabel") + "</h3>")
			.append(pageXML.getAttribute("FurtherClarification"))
			.hide();

		var correctIcon = '<span class="markIcon fa fa-fw fa-x-tick"></span>';
		var incorrectIcon = '<span class="markIcon fa fa-fw fa-x-cross"></span>';
		var incorrect = '<p>' + incorrectIcon + pageXML.getAttribute("textWrong") + '</p>';
		var incompleet = '<p>' + pageXML.getAttribute("textIncomplete") + '</p>';
		var correct = '<p>' + correctIcon + pageXML.getAttribute("textRight") + '</p>';
		var checkButtonTxt = pageXML.getAttribute("checkBtn");
		var attemptLabel = pageXML.getAttribute("attemptLabel");

		if (pageXML.getAttribute("attemptLabel") == null) {
			attemptLabel = "Attempts remaining";
		}

		// no. of tries allowed
		var amountOfTries = pageXML.getAttribute("amountOfTries");

		if (amountOfTries !== null && amountOfTries !== undefined) {
			state.triesLeft = parseInt(amountOfTries);
			jGetElement(blockid, '.attempts').html('<p>' + attemptLabel + ": " + amountOfTries + '</p>');
		} else {
			state.triesLeft = undefined;
			jGetElement(blockid, '.attempts').remove();
		}

		jGetElement(blockid, ".checkButton")
			.button({
				label: checkButtonTxt
			})
			.click(function () {
				const state = x_getPageDict("state", blockid)
				var input = jGetElement(blockid, '.answerInput textarea').val(),
					attemptMade = !(input === "" || (jGetElement(blockid, '.answerInput textarea').data('placeHolder') != undefined && jGetElement(blockid, '.answerInput textarea').data('placeHolder') == input));

				if (attemptMade && state.triesLeft !== undefined) {
					state.triesLeft = state.triesLeft - 1;
				}

				var triesLeft = state.triesLeft;

				if (jGetElement(blockid, '.attempts').length > 0) {
					jGetElement(blockid, '.attempts').html('<p>' + attemptLabel + ": " + state.triesLeft + '</p>');
				}
				if (pageXML.getAttribute("trackinglabel") != null && pageXML.getAttribute("trackinglabel") != "") {
					label = pageXML.getAttribute("trackinglabel");
				}

				var $correctOrNot = jGetElement(blockid, ".correctOrNot");
				$correctOrNot.html("");

				if (!attemptMade) {
					$correctOrNot.append(incompleet);

				} else {
					if (input == state.answer) {
						$correctOrNot.append(correct);
					} else {
						$correctOrNot.append(incorrect);
					}

					textCorrectionBlock.exitTrackTextCorrection(blockid);
					state.hasExited = true;
				}

				if (attemptMade && (input === state.answer || triesLeft == undefined || triesLeft <= 0)) {
					// disable check btn & text area when correct answer entered or max tries reached
					if ((triesLeft != undefined && triesLeft <= 0) || input == state.answer) {
						$(this).hide();
						jGetElement(blockid, '.attempts').hide();
						jGetElement(blockid, '.answerInput textarea').attr('readonly', 'true');
					}

					// feedback
					if (pageXML.getAttribute("showFurtherClarification") !== "false" && pageXML.getAttribute("FurtherClarification") != undefined && pageXML.getAttribute("FurtherClarification").trim() != '') {
						jGetElement(blockid, '.FurtherClarification').show();
					}

					// show the correct answer unless answer entered is correct or show answer optional property is off
					if (input !== state.answer) {
						$('answer').show();
					}
				}
			});

		this.sizeChanged(blockid);

		x_pageLoaded();
	}
};
