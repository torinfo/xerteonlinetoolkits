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
var dialogBlock = new function () {
	var casesensitive,
		tick;

	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		var tick = x_getLangInfo(x_languageData.find("tick")[0], "label", "Tick");

		// reset questions
		jGetElement(blockid, ".pageContents").data("currentQ", 0);
		jGetElement(blockid, ".submitBtn")
			.button({ label: jGetElement(blockid, ".pageContents").data("submitTxt") })
			.data({
				"attempt": 0,
				"state": 0
			})
			.show();

		jGetElement(blockid, ".pageContents .result")
			.addClass("hidden")
			.parent().find(".tickTxt").html("");

		jGetElement(blockid, ".pageContents input")
			.prop("readonly", false)
			.val("");
		jGetElement(blockid, ".pageContents .question:first input").focus();
		jGetElement(blockid, ".pageContents .question:not(:first)").hide();
		jGetElement(blockid, ".feedback").html("");
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".pageContents .panel");
			//$panel.height(jGetElement(blockid, "").height() - parseInt(jGetElement(blockid, "").css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
		}
	}

	this.init = function (blockid) {
		var tick = x_getLangInfo(x_languageData.find("tick")[0], "label", "Tick");
		let pageXML = x_getBlockXML(blockid);

		var panelWidth = pageXML.getAttribute("panelWidth");
		if (panelWidth == "Full") {
			jGetElement(blockid, ".pageContents .right div:first").appendTo(jGetElement(blockid, "pageContents"));
			jGetElement(blockid, ".pageContents .splitScreen").remove();
		} else {
			jGetElement(blockid, ".textHolder").html(x_addLineBreaks(pageXML.getAttribute("text")));
			if (panelWidth == "Small") {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("large");
			} else if (panelWidth == "Medium") {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
			} else {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
			}
		}

		var casesensitive = pageXML.getAttribute("casesensitive") != "true" && pageXML.getAttribute("casesensitive") != "1" ? false : true;
		var answerDelimeter = pageXML.getAttribute("answerDelimeter");
		if (answerDelimeter == undefined) {
			answerDelimeter = ",";
		}


		// if language attributes aren't in xml will have to use english fall back
		var tryTxt = pageXML.getAttribute("tryTxt");
		if (tryTxt == undefined) {
			tryTxt = "Try again.";
		}
		var correctTxt = pageXML.getAttribute("correctTxt");
		if (correctTxt == undefined) {
			correctTxt = "The correct answer is shown.";
		}
		var moveOnTxt = pageXML.getAttribute("moveOnTxt");
		if (moveOnTxt == undefined) {
			moveOnTxt = "Press enter to move on.";
		}
		var submitTxt = pageXML.getAttribute("submitBtnTxt");
		if (submitTxt == undefined) {
			submitTxt = "Submit";
		}
		var nextTxt = pageXML.getAttribute("nextBtnTxt");
		if (nextTxt == undefined) {
			nextTxt = "Next";
		}

		jGetElement(blockid, ".pageContents").data({
			"currentQ": 0,
			"tryTxt": tryTxt,
			"correctTxt": correctTxt,
			"moveOnTxt": moveOnTxt,
			"submitTxt": submitTxt,
			"nextTxt": nextTxt
		});

		var $question = jGetElement(blockid, ".pageContents .question:first");
		$question.find(".result")
			.addClass("hidden")
			.parent().find(".tickTxt").html("");

		$(pageXML).children()
			.each(function (i) {
				var $thisQ;
				if (i != 0) {
					$thisQ = $question.clone().appendTo($question.parent());
					$thisQ.hide();
				} else {
					$thisQ = $question;
					let answers = this.getAttribute("answer").split(answerDelimeter);
					XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'fill-in', 1, 0);
					XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'fill-in', this.getAttribute("question"), answers, answers, null /* never used*/, x_currentPageXML.getAttribute("grouping"), null, 0);
				}

				$thisQ.find("div")
					.html(x_addLineBreaks(this.getAttribute("question")));

				//Add aria-label to answer box
				var answerFieldLabel = this.getAttribute("answerFieldLabel");
				if (answerFieldLabel === undefined | answerFieldLabel === null) {
					answerFieldLabel = "Answer";
				}
				$thisQ.find("input").attr({ "aria-label": answerFieldLabel });
			});

		jGetElement(blockid, ".submitBtn")
			.button({
				label: submitTxt
			})
			.data({
				"attempt": 0,
				"state": 0,
				"click": true,
				"pause": false
			})
			.click(function () {
				var $this = $(this);
				if ($this.data("click") == true) {
					var $pageContents = jGetElement(blockid, ".pageContents"),
						$feedback = jGetElement(blockid, ".feedback");

					if ($this.data("state") == 0) { // mark answer
						// Decode answer
						var qNo = $pageContents.data("currentQ"),
							$thisInput = jGetElement(blockid, ".pageContents .question:eq(" + qNo + ") input"),
							isCorrect = false,
							correctAnswer = $('<div/>').html($(pageXML).children()[qNo].getAttribute("answer")).text();

						if (correctAnswer.indexOf(answerDelimeter) != -1) {
							var splitAnswers = correctAnswer.split(answerDelimeter);
							for (var i = 0; i < splitAnswers.length; i++) {
								if (casesensitive) {
									if ($.trim($thisInput.val()) == $.trim(splitAnswers[i])) {
										isCorrect = true;
										break;
									}
								}
								else {
									if ($.trim($thisInput.val().toLowerCase()) == $.trim(splitAnswers[i]).toLowerCase()) {
										isCorrect = true;
										break;
									}
								}
							}
						} else {
							if (casesensitive) {
								if ($.trim($thisInput.val()) == correctAnswer) {
									isCorrect = true;
								}
							}
							else {
								if ($.trim($thisInput.val().toLowerCase()) == correctAnswer.toLowerCase()) {
									isCorrect = true;
								}
							}
						}

						let userAnswer = $thisInput.val();
						if (isCorrect == true) { // correct
							$thisInput
								.val($.trim($thisInput.val()))
								.prop("readonly", true);

							$thisInput.parent().find(".result")
								.removeClass("hidden")
								.parent().find(".tickTxt").html(tick);

							$feedback.html("");
							$this.focus();
							if (qNo + 1 != $(pageXML).children().length) {
								$this
									.button({ label: $pageContents.data("nextTxt") })
									.data("state", 1);
							} else {
								$this.hide();
							}

							let result = {
								success: true,
								score: 100,
								//judge: judge
							};
							XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, null/* ignored for fill-in*/, userAnswer, null/*not used*/, qNo);
						} else { // incorrect
							$this.data("attempt", $this.data("attempt") + 1);
							var currentAttempt = $this.data("attempt"),
								allowedAttempts = pageXML.getAttribute("attempts");

							if (allowedAttempts == undefined) {
								allowedAttempts = 0;
							}
							if (currentAttempt == allowedAttempts) { // show hint
								$feedback.html($(pageXML).children()[qNo].getAttribute("hint"));
								$thisInput.focus();
							} else if (currentAttempt > allowedAttempts) { // show correct answer
								$feedback.html($pageContents.data("correctTxt"));
								$this.focus();
								var correctAnswer = $('<div/>').html($(pageXML).children()[qNo].getAttribute("answer")).text();
								if (correctAnswer.indexOf(answerDelimeter) != -1) {
									correctAnswer = $.trim(correctAnswer.split(answerDelimeter)[0]);
								}
								$thisInput
									.val(correctAnswer)
									.prop("readonly", true);
								if (qNo + 1 != $(pageXML).children().length) {
									$this
										.button({ label: $pageContents.data("nextTxt") })
										.data("state", 1);
									$feedback.html($feedback.html() + "</br>" + $pageContents.data("moveOnTxt"));
								} else {
									$this.hide();
								}
							} else { // another attempt allowed
								$feedback.html($pageContents.data("tryTxt"));
								$thisInput.focus();
							}
							let result = {
								success: false,
								score: 0,
								//judge: judge
							};
							XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, null/* ignored for fill-in*/, userAnswer, null/*not used*/, qNo);
						}
					} else { // move to next question
						$feedback.html("");
						jGetElement(blockid, ".pageContents .question:eq(" + ($pageContents.data("currentQ") + 1) + ")").fadeIn();
						$this
							.data({
								"attempt": 0,
								"state": 0
							})
							.button({ label: jGetElement(blockid, ".pageContents").data("submitTxt") });

						var qNo = $pageContents.data("currentQ");
						jGetElement(blockid, ".pageContents .question:eq(" + qNo + ") .result")
							.removeClass("hidden")
							.parent().find(".tickTxt").html(tick);
  
						jGetElement(blockid, ".pageContents .question:eq(" + (qNo + 1) + ") input").focus();
						let question = $(pageXML).children()[qNo+1];
						let answers = question.getAttribute("answer").split(answerDelimeter);
						XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'fill-in', question.getAttribute("question"), answers, answers, null /* never used*/, x_currentPageXML.getAttribute("grouping"), null, qNo+1);
						XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'fill-in', 0, qNo+1);
						$pageContents.data("currentQ", qNo + 1);
  					}
        }
				// this is needed as if this is triggered via keypress in IE/Opera it's triggered twice so messes up no. attempts
				if ($this.data("pause") == true) {
					$this.data({
						"click": false,
						"pause": false
 					});
					setTimeout(function () {
						$this.data("click", true)
					}, 1);
				}
			});

		jGetElement(blockid, ".pageContents input").keypress(function (e) {
			if ((e.keyCode ? e.keyCode : e.which) == 13) { // return key
				jGetElement(blockid, ".submitBtn")
					.data({
						"click": true,
						"pause": true
					})
					.trigger("click");
			}
		});

		this.sizeChanged();
		x_pageLoaded();
	}
}
