var topXQBlock = new (function () {
	this.pageChanged = function (blockid) {
		$pageContents = jGetElement(blockid, ".pageContents");
	};

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".pageContents .panel");
			$panel.height(
				$x_pageHolder.height() -
				parseInt($x_pageDiv.css("padding-top")) * 2 -
				parseInt($panel.css("padding-top")) * 2 -
				5,
			);
		}
	};

	this.leavePage = function (blockid) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_getPageDict("state", blockid)
		if (!state.hasExited) {
			topXQBlock.fillInputs(blockid);

			var checkAnswers = state.checkAnswers;
			for (var i = 0; i < checkAnswers.length; i++) {
				topXQBlock.checkSingleAnswer(i, blockid);
			}

			var answers = state.answers,
				inputs = state.inputs,
				doneAnswers = [];

			for (i = 0; i < inputs.length; i++) {
				for (k = 0; k < answers.length; k++) {
					for (j = 0; j < answers[k].options.length; j++) {
						if (
							!doneAnswers.includes(k) &&
							inputs[i] === answers[k].options[j].trim()
						) {
							doneAnswers.push(k);
							jGetElement(blockid, "#topXQ-correctAnswer-" + k)
								.addClass("fa")
								.addClass("fa-fw")
								.addClass("fa-long-arrow-left");
						}
					}
				}
			}
		}
	};

	this.fillInputs = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_getPageDict("state", blockid)
		var inputs = [];
		jGetElement(blockid, ".input-answer").each(function () {
			inputs.push($(this).val());
		});

		var checkAnswers = [];
		for (i = 0; i < inputs.length; i++) {
			checkAnswers.push({
				correct: false,
				comment: "",
			});
		}

		var answers = state.answers;
		for (i = 0; i < answers.length; i++) {
			answers[i].counter = 0;
		}

		state.inputs = inputs;
		state.checkAnswers = checkAnswers;
		state.answers = answers;
	};

	this.checkSingleAnswer = function (i, blockid) {
		let pageXML = x_getBlockXML(blockid);
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_getPageDict("state", blockid)
		var inputs = state.inputs,
			answers = state.answers,
			checkAnswers = state.checkAnswers,
			isCorrect = false;

		for (j = 0; j < answers.length; j++) {
			for (x = 0; x < answers[j].options.length; x++) {
				var givenAnswer =
					pageXML.getAttribute("caseSensitivity") == "true" ||
						pageXML.getAttribute("caseSensitivity") == undefined
						? inputs[i]
						: inputs[i].toLowerCase(),
					correctAnswer =
						pageXML.getAttribute("caseSensitivity") == "true" ||
							pageXML.getAttribute("caseSensitivity") == undefined
							? answers[j].options[x].trim()
							: answers[j].options[x].trim().toLowerCase();

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

		state.checkAnswers = checkAnswers;
		state.answers = answers;
	};

	this.exitPage = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_getPageDict("state", blockid)
		var amountOfCorrect = 0,
			checkAnswers = state.checkAnswers,
			inputs = state.inputs;

		for (i = 0; i < inputs.length; i++) {
			var result = {
				success: checkAnswers[i].correct,
				score: checkAnswers[i].correct ? 100.0 : 0.0,
			};

			XTExitInteraction(
				x_currentPage,
				x_getBlockNr(blockid),
				result,
				"",
				inputs[i],
				"",
				i,
				pageXML.getAttribute("trackinglabel"),
			);

			if (checkAnswers[i].correct) {
				amountOfCorrect++;
			}
		}

		var amountOfInputs = 0;
		jGetElement(blockid, ".input-answer").each(function () {
			amountOfInputs++;
		});

		var setScore = 0;
		if (amountOfInputs === undefined || amountOfInputs === 0) {
			amountOfInputs = 0;
		}

		if (amountOfInputs > 0 && amountOfCorrect > 0) {
			setScore = (100 / amountOfInputs) * amountOfCorrect;
		}

		//XTSetPageScore(x_currentPage, setScore);
	};

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_pushToPageDict({}, "state", blockid);

		jGetElement(blockid, ".result, .mainFeedback, .correctAnswer").hide();

		state.hasExited = false;

		var panelWidth = pageXML.getAttribute("panelWidth"),
			$splitScreen = jGetElement(blockid, ".pageContents .splitScreen");
		var $textHolder = jGetElement(blockid, ".textHolder");

		if (panelWidth === "Full") {
			jGetElement(blockid, ".pageContents .panel").appendTo(
				jGetElement(blockid, ".pageContents"),
			);
			$splitScreen.remove();
		} else {
			$textHolder.html(x_addLineBreaks(pageXML.getAttribute("instruction")));

			var textAlign = pageXML.getAttribute("align");
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

		var attemptLabel = pageXML.getAttribute("attemptLabel");
		if (pageXML.getAttribute("attemptLabel") == null) {
			attemptLabel = "Attempt";
		}

		var instruction = pageXML.getAttribute("instruction");
		$textHolder.html(instruction);

		var $question = jGetElement(blockid, ".titleQuestion .question");
		var prompt = pageXML.getAttribute("prompt");
		$question.html(prompt);

		var $panelWidth = pageXML.getAttribute("panelWidth");
		var $optionHolder = jGetElement(blockid, ".OptionHolder");

		var $attempts = jGetElement(blockid, ".attempts");
		var amountofTries = parseInt(pageXML.getAttribute("amountOfTries"));
		if (amountofTries != undefined && $.isNumeric(amountofTries)) {
			$attempts
				.html(pageXML.getAttribute("attemptLabel") + ": " + amountofTries)
				.show();
			state.amountofTries = amountofTries;
		} else {
			$attempts.remove();
		}

		var elements = [];
		$(pageXML)
			.children()
			.each(function (i) {
				elements.push({
					label: this.getAttribute("name"),
					answer: $("<div>").html(this.getAttribute("answer")).text(),
					correct: this.getAttribute("correct"),
					feedback: this.getAttribute("feedback"),
				});
			});

		var j = 0;
		var amountOfAnswers = pageXML.getAttribute("numberAnswers");
		if (amountOfAnswers === "*") {
			amountOfAnswers = elements.length;
		} else if (amountOfAnswers > elements.length) {
			amountOfAnswers = elements.length;
		}

		var answerFieldLabel = pageXML.getAttribute("answerFieldLabel");
		if ((answerFieldLabel === undefined) | (answerFieldLabel === null)) {
			answerFieldLabel = "Answer";
		}
		for (i = 0; i < amountOfAnswers; i++) {
			var actualFieldLabel = answerFieldLabel + " " + (i + 1);
			$optionHolder.append(
				'<div class="answer"><input class="input-answer" id="input-answer-' +
				i +
				'" aria-label="' +
				actualFieldLabel +
				'"/><span id="topXQ-result-' +
				i +
				'"></span></div>',
			);
			j++;
		}

		var answers = [];
		for (i = 0; i < elements.length; i++) {
			var answer = elements[i].answer.split(",");
			answers.push({
				options: answer,
				counter: 0,
				counter2: 0,
			});
		}
		state.answers = answers;

		var correctOptionsFeedback = [];
		for (i = 0; i < elements.length; i++) {
			correctOptionsFeedback.push(
				x_GetTrackingTextFromHTML(elements[i].feedback, ""),
			);
		}

		state.correctOptionsFeedback = correctOptionsFeedback;

		var checkBtnTxt = pageXML.getAttribute("checkBtnTxt");
		if (checkBtnTxt === undefined) {
			checkBtnTxt = "Submit";
		}
		var attempt = 1;

		//Enter the interaction
		var blankAnswers = [];
		var correctAnswers = state.answers;
		for (i = 0; i < correctAnswers.length; i++) {
			blankAnswers.push(correctAnswers[i].options);
		}
		let weighting =
			pageXML.getAttribute("trackingWeight") != undefined
				? pageXML.getAttribute("trackingWeight")
				: 1.0;
		for (i = 0; i < blankAnswers.length; i++) {
			XTEnterInteraction(
				x_currentPage,
				x_getBlockNr(blockid),
				"fill-in",
				x_GetTrackingTextFromHTML(pageXML.getAttribute("prompt"), ""),
				blankAnswers[i],
				blankAnswers[i],
				state.correctOptionsFeedback,
				pageXML.getAttribute("grouping"),
				null,
				i,
			);
			XTSetInteractionPageXML(
				x_currentPage,
				x_getBlockNr(blockid),
				x_getBlockXML(blockid),
				i,
			);
			XTSetInteractionType(
				x_currentPage,
				x_getBlockNr(blockid),
				"fill-in",
				weighting,
				i,
			);
		}

		jGetElement(blockid, ".checkButton")
			.button({
				label: checkBtnTxt,
			})
			.click(function () {
				const state = x_getPageDict("state", blockid)
				var tries;
				if (
					pageXML.getAttribute("amountOfTries") != undefined &&
					$.isNumeric(pageXML.getAttribute("amountOfTries"))
				) {
					tries = parseInt(pageXML.getAttribute("amountOfTries"));
					state.amountofTries = state.amountofTries - 1;

					if (state.amountofTries > 0) {
						$attempts.html(
							pageXML.getAttribute("attemptLabel") +
							": " +
							state.amountofTries,
						);
					} else {
						$attempts.html("");
					}
				}

				if (!state.hasExited) {
					state.hasExited = true;
				}

				showFeedback = function (blockid) {
					let pageXML = x_getBlockXML(x_getBlockNr(blockid));
					var correctAnswersLabel = pageXML.getAttribute("correctAnswersLabel"),
						answers = state.answers;

					jGetElement(blockid, ".correctAnswer").html("");

					if (
						pageXML.getAttribute("showAnswers") === "true" ||
						pageXML.getAttribute("showAnswers") === undefined
					) {
						jGetElement(blockid, ".correctAnswer").append(
							"<h3>" + correctAnswersLabel + "</h3><ul>",
						);

						if (
							jGetElement(blockid, ".correctAnswer ul").has("li").length === 0
						) {
							for (i = 0; i < answers.length; i++) {
								jGetElement(blockid, ".correctAnswer ul").append(
									"<li>" +
									answers[i].options +
									"<span id='topXQ-correctAnswer-" +
									i +
									"'></span> </li>",
								);
							}
						}

						jGetElement(blockid, ".correctAnswer").show();
					}

					AllAnswersCheckt = function () {
						var inputs = state.inputs,
							answers = state.answers;

						for (i = 0; i < answers.length; i++) {
							answers[i].counter2 = 0;
						}

						var amountOfGood = 0;
						if (
							pageXML.getAttribute("caseSensitivity") == "true" ||
							pageXML.getAttribute("caseSensitivity") == undefined
						) {
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
								for (j = 0; j < answers.length; j++) {
									for (x = 0; x < answers[j].options.length; x++) {
										var givenAnswer = inputs[i].toLowerCase();
										var correctAnswer = answers[j].options[x]
											.trim()
											.toLowerCase();

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

						state.answers = answers;

						if (amountOfGood === inputs.length) {
							return true;
						}
					};

					var passedTxt = pageXML.getAttribute("passed");
					if (passedTxt === undefined) {
						passedTxt = "Well done, you have completed the activity";
					}

					var failedTxt = pageXML.getAttribute("failed");
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
						.html('<p><span id="finalResult"></span>' + passedOrFailed + "</p>")
						.show();

					if (passed === true) {
						if (passedTxt !== "") {
							jGetElement(blockid, "#finalResult")
								.removeClass("fa-x-cross")
								.addClass("fa")
								.addClass("fa-fw")
								.addClass("fa-x-tick");
						}
					} else {
						if (failedTxt !== "") {
							jGetElement(blockid, "#finalResult")
								.removeClass("fa-x-tick")
								.addClass("fa")
								.addClass("fa-fw")
								.addClass("fa-x-cross");
						}
					}

					var mainFeedback = pageXML.getAttribute("feedback");
					if (mainFeedback === null) {
						mainFeedback = "";
					}

					if (mainFeedback != "") {
						jGetElement(blockid, ".mainFeedback")
							.html(
								(pageXML.getAttribute("feedbackLabel") != undefined &&
									pageXML.getAttribute("feedbackLabel").trim() != ""
									? "<h3>" + pageXML.getAttribute("feedbackLabel") + "</h3>"
									: "") + mainFeedback,
							)
							.show();
					}

					jGetElement(blockid, ".attempts").hide();
				};

				topXQBlock.fillInputs(blockid);

				var checkAnswers = state.checkAnswers,
					wrong = checkAnswers.length;

				if ((attempt < tries && wrong > 0) || tries == undefined) {
					for (var i = 0; i < checkAnswers.length; i++) {
						if (checkAnswers[i].correct === false) {
							topXQBlock.checkSingleAnswer(i, blockid);
							if (checkAnswers[i].correct === false) {
								jGetElement(blockid, "#input-answer-" + i).val("");
							}
						}
						if (checkAnswers[i].correct === true) {
							//disable the input field
							jGetElement(blockid, "#input-answer-" + i).prop("readonly", true);
							jGetElement(blockid, "#topXQ-result-" + i)
								.removeClass("fa-x-cross")
								.addClass("fa")
								.addClass("fa-fw")
								.addClass("fa-x-tick");
							wrong--;
						} else {
							jGetElement(blockid, "#topXQ-result-" + i)
								.removeClass("fa-x-tick")
								.addClass("fa")
								.addClass("fa-fw")
								.addClass("fa-x-cross");
						}
					}
					attempt++;

					if (tries === undefined) {
						showFeedback(blockid);
						topXQBlock.exitPage(blockid);
					}
				} else {
					jGetElement(blockid, ".checkButton").hide();

					for (var i = 0; i < checkAnswers.length; i++) {
						jGetElement(blockid, "#input-answer-" + i).prop("readonly", true);

						if (tries == 1 && checkAnswers[i].correct === true) {
							jGetElement(blockid, "#topXQ-result-" + i)
								.removeClass("fa-x-cross")
								.addClass("fa")
								.addClass("fa-fw")
								.addClass("fa-x-tick");
						}

						if (checkAnswers[i].correct === false) {
							topXQBlock.checkSingleAnswer(i, blockid);
							if (checkAnswers[i].correct === false) {
								if (attempt === tries) {
									jGetElement(blockid, "#topXQ-result-" + i)
										.removeClass("fa-x-tick")
										.addClass("fa")
										.addClass("fa-fw")
										.addClass("fa-x-cross");
								}
							} else {
								jGetElement(blockid, "#topXQ-result-" + i)
									.removeClass("fa-x-cross")
									.addClass("fa")
									.addClass("fa-fw")
									.addClass("fa-x-tick");
							}
						}
					}

					showFeedback(blockid);
					topXQBlock.exitPage(blockid);
				}

				if (wrong === 0) {
					jGetElement(blockid, ".checkButton").hide();
					showFeedback(blockid);
					topXQBlock.exitPage(blockid);
				}
			})
			.show();

		this.sizeChanged(blockid);

		// call this function in every model once everything is loaded
		x_pageLoaded();
	};
})();
