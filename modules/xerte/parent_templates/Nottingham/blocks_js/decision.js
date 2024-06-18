"use strict";
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
 * Unless required by appicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// BASED ON THE DECISION TREE MODULE (this is a simplified version)

// pageChanged & sizeChanged functions are needed in every model file
// other functions for model should also be in here to avoid conflicts
var decisionBlock = new function () {

	// Called from xenith if tab level deeplinking is available
	this.deepLink = function (blockid, item) {
		this.startNewDecision(blockid, item);
	}
		
	this.setVars = function (blockid) {
		if(x_getBlockNr(blockid) < 0 || blockid == undefined | isNaN(x_getBlockNr(blockid)))
			console.trace(blockid);
	}

	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".pageContents .panel"),
					$btnHolder = jGetElement(blockid, ".btnHolder");

			//$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
			//jGetElement(blockid, ".contentHolder").height($panel.height() - $btnHolder.height() - parseInt($btnHolder.css("margin-top")));
		}
	}

	this.init = function (blockid) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		let $backBtn = jGetElement(blockid, ".backBtn");
		let $fwdBtn = jGetElement(blockid, ".fwdBtn");
		let $stepHolder = jGetElement(blockid, ".stepHolder");
		let $submitBtn = jGetElement(blockid, ".submitBtn");
		let $helpBtn = jGetElement(blockid, ".helpBtn");
		let $overviewHolder = jGetElement(blockid, ".overviewHolder");
		let pageXML = x_getBlockXML(blockid);

		// set up the data that needs to be saved between page changes
		let tempState = {
			"allSteps": [], // array containing an object with details for each possible step
			"decisionHistory": [], // ids & options selected
			"storedResultTxt": [], // text stored until presented as a collated result (optional)
			"currentStep": 0,
			"currentStepInfo": 0
		};
		const state = x_pushToPageDict(tempState, "state", blockid);
		tempState = null;

		// page layout
		var panelWidth = pageXML.getAttribute("panelWidth");
		if (panelWidth == "Full") {
			jGetElement(blockid, ".pageContents .right div:first").appendTo(jGetElement(blockid, ".pageContents"));
			jGetElement(blockid, ".pageContents .splitScreen").remove();
		} else {
			// divs for every bit of display text are added to displayInfo div below as you go through steps - every div has class info* where * is step num that it goes with (so we can hide if we go backwards)
			// divs will have class of clear if text from previous steps are to be hidden
			jGetElement(blockid, ".textHolder").html('<div class="intro">' + x_addLineBreaks(pageXML.getAttribute("text")) + '</div><div class="displayInfo"></div>');

			if (panelWidth == "Small") {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("large"); // make text area on left large so accordion on right is small
			} else if (panelWidth == "Large") {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
			} else {
				jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
			}
		}

		if ($(pageXML).children().length == 0) {
			jGetElement(blockid, ".contentHolder").html('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noQ", "No questions have been added") + '</span>');
			jGetElement(blockid, ".btnHolder").hide();
			this.sizeChanged(blockid);
		} else {
			// get info for all steps
			$(pageXML).children().each(function () {
				var step = {
					type: this.nodeName,
					built: false
				};

				for (var i = 0; i < this.attributes.length; i++) {
					step[this.attributes[i].name] = this.attributes[i].value;
				}

				// if it's a question, get the options - otherwise, get the text
				if (step.type == "mcqStep" || step.type == "sliderStep") {
					step.options = $(this).children();
				} else {
					step.text = $(this).attr("text");
				}

				state.allSteps.push(step);
			});


			// _____ SET UP MAIN BUTTONS IN PANEL _____

			// _____ HISTORY BACK BTN _____
			$backBtn
				.button({
					icons: { primary: "fa fa-fw fa-x-prev" },
					label: pageXML.getAttribute("backBtn") ? pageXML.getAttribute("backBtn") : "Previous Step",
					text: false
				})
				.click(function () {
					const state = x_getPageDict("state", blockid);
					if ($overviewHolder.is(":visible")) {
						decisionBlock.showHideHolders(blockid, $stepHolder);
						if (state.currentStep == 0) {
							$(this).button("disable");
						}
						if (state.currentStep + 1 >= state.decisionHistory.length) {
							$fwdBtn.button("disable");
						}
					} else {
						jGetElement(blockid, ".displayInfo .info" + state.currentStep).hide();
						state.currentStep = state.currentStep - 1;
						decisionBlock.setUpStep(blockid, state.decisionHistory[state.currentStep].id);
					}
					jGetElement(blockid, ".x_popupDialog").parent().detach();
				});


			// _____ HISTORY FWD BTN _____
			$fwdBtn
				.button({
					icons: { primary: "fa fa-fw fa-x-next" },
					label: pageXML.getAttribute("fwdBtn") ? pageXML.getAttribute("fwdBtn") : "Next Step",
					text: false
				})
				.click(function () {
					const state = x_getPageDict("state", blockid);
					if ($overviewHolder.is(":visible")) {
						decisionBlock.showHideHolders(blockid, $stepHolder);
						if (state.currentStep == 0) {
							$backBtn.button("disable");
						}
						if (state.currentStep + 1 >= state.decisionHistory.length) {
							$(this).button("disable");
						}
					} else {
						state.currentStep = state.currentStep + 1;
						jGetElement(blockid, ".displayInfo .info" + state.currentStep).show();
							decisionBlock.setUpStep(blockid,state.decisionHistory[state.currentStep].id);
					}
					jGetElement(blockid, ".x_popupDialog").parent().detach();
				});


			// _____ NEW BTN _____
			jGetElement(blockid, ".newBtn")
				.button({
					icons: { primary: "fa fa-fw fa-x-refresh" },
					label: pageXML.getAttribute("newBtnLabel") ? pageXML.getAttribute("newBtnLabel") : "Restart",
					text: false
				})
				.click(function () {
					jGetElement(blockid, ".contentHolder").scrollTop(0);
					decisionBlock.startNewDecision(blockid);
				});


			// _____ SUBMIT BTN _____
			$submitBtn
				.button({
					label: pageXML.getAttribute("btnLabel") ? pageXML.getAttribute("btnLabel") : "Next"
				})
				.click(function () {
					const state = x_getPageDict("state", blockid);
					if (state.currentStep + 1 != state.decisionHistory.length) {
						state.decisionHistory = state.decisionHistory.slice(0, state.currentStep + 1);
						state.storedResultTxt = state.storedResultTxt.slice(0, state.currentStep + 1);

						jGetElement(blockid, ".displayInfo div[class^='info']:hidden").remove(); // remove any historical hidden displayInfo divs that are no longer required
					}

					let currentStepInfo = state.currentStepInfo;

					// button does different things depending on type of currentStep
					if (currentStepInfo.type == "mcqStep") {
						// save answer and load the new step associated with it
						var $step = $stepHolder.children(".step"),
							answer, target;

						if (currentStepInfo.format == "menu") {
							answer = $step.find("select").prop("selectedIndex");
							var $selected = $step.find("select .opt" + answer);
							target = $selected.data("target");

							// store resultTxt (optional) so it can be shown as collated result at the end
							state.storedResultTxt.push($selected.data("resultTxt"));

							// add text to left side
							if ($selected.data("displayTxt") != undefined && $selected.data("displayTxt") != "") {
								var clear = $selected.data("clear") == "true" ? " clear" : ""; // class used when previous info is to be cleared
								jGetElement(blockid, ".textHolder .displayInfo").append('<div class="info' + (state.currentStep + 1) + clear + '">' + $selected.data("displayTxt") + '</div>');
							}

						} else {
							var $selected = $step.find("input:checked");
							answer = $step.find("input").index($selected);
							target = $selected.data("target");

							// store resultTxt (optional) so it can be shown as collated result at the end
							state.storedResultTxt.push($selected.data("resultTxt"));

							// add text to left side
							if ($selected.data("displayTxt") != undefined && $selected.data("displayTxt") != "") {
								var clear = $selected.data("clear") == "true" ? " clear" : ""; // class used when previous info is to be cleared
								jGetElement(blockid, ".textHolder .displayInfo").append('<div class="info' + (state.currentStep + 1) + clear + '">' + $selected.data("displayTxt") + '</div>');
							}
						}

						state.decisionHistory[state.decisionHistory.length - 1].option = answer;

						decisionBlock.setUpStep(blockid, target, true);

					} else if (currentStepInfo.type == "sliderStep") {
						// save value, work out which option it falls in to (between min & max values) and load the new step associated with it
						state.decisionHistory[state.decisionHistory.length - 1].option = $stepHolder.find(".amount").val();

						var exists = false;
						currentStepInfo.options.each(function (i) {
							var $this = $(this),
								$slider = $stepHolder.find(".slider");

							if ($slider.slider("value") >= $this.attr("min") && $slider.slider("value") <= $this.attr("max")) {
								// store resultTxt associated with this answer (optional) so it can be shown as collated result at the end
								state.storedResultTxt.push($this.attr("resultTxt"));

								// add text to left side
								if ($this.attr("displayTxt") != undefined && $this.attr("displayTxt") != "") {
									var clear = $this.attr("clear") == "true" ? " clear" : ""; // class used when previous info is to be cleared
									jGetElement(blockid, ".textHolder .displayInfo").append('<div class="info' + (state.currentStep + 1) + clear + '">' + $this.attr("displayTxt") + '</div>');
								}

								var thisTarget = $this.attr("targetNew") != undefined && $this.attr("targetNew") != "" ? $this.attr("targetNew") : $this.attr("target");
								decisionBlock.setUpStep(blockid, thisTarget, true);
								exists = true;
								return false;
							}
						});
						if (exists == false) {
							alert(pageXML.getAttribute("sliderError") ? pageXML.getAttribute("sliderError") : "There is no next step for this value!");
						}

					} else if (currentStepInfo.type == "infoStep") {
						// there can't be any resultTxt stored for info steps so store empty string
						state.storedResultTxt.push("");

						// load new step
						var thisTarget = currentStepInfo.targetNew != undefined && currentStepInfo.targetNew != "" ? currentStepInfo.targetNew : currentStepInfo.target;
						decisionBlock.setUpStep(blockid, thisTarget, true);
					}

					jGetElement(blockid, ".x_popupDialog").parent().detach();
					jGetElement(blockid, ".contentHolder").scrollTop(0);
				});


			// _____ HELP BTN _____
			$helpBtn
				.button({
					icons: { primary: "fa fa-fw fa-x-info-circle" },
					label: pageXML.getAttribute("helpString") ? pageXML.getAttribute("helpString") : "More information"
				})
				.click(function () {	
					const state = x_getPageDict("state", blockid);
					jGetElement(blockid, ".x_popupDialog").parent().detach();
					let currentStepInfo = state.currentStepInfo;

					if ((state.currentStepInfo.helpTxt.indexOf("http://") == 0 || state.currentStepInfo.helpTxt.indexOf("https://") == 0) && state.currentStepInfo.helpTxt.indexOf(" ") == -1) {
						// treat helpString as link - open straight away
						window.open(state.currentStepInfo.helpTxt);
					} else {
						// show helpString in dialog
						jGetElement(blockid, ".x_popupDialog").parent().detach();
						jGetElement(blockid, ".pageContents").append('<div class="helpDialog x_popupDialog"/>');
						var $helpDialog = jGetElement(blockid, ".helpDialog");

						$dialog = $helpDialog
							.dialog({
								closeOnEscape: true,
								title: pageXML.getAttribute("helpString") ? pageXML.getAttribute("helpString") : "More information",
								closeText: x_getLangInfo(x_languageData.find("closeBtnLabel")[0], "label", "Close")
							})
							.html(x_addLineBreaks(state.currentStepInfo.helpTxt));

						x_setDialogSize($dialog);
					}
				});


			// _____ COPY BTN _____
			jGetElement(blockid, ".copyBtn")
				.button({
					icons: { primary: "fa fa-fw fa-x-copy" },
					label: pageXML.getAttribute("copyBtn") ? pageXML.getAttribute("copyBtn") : "Copy Overview",
					text: false
				})
				.click(function () {
					// we can't automatically copy text to clipboard - instead the text to copy is put together, shown highlighted in a dialog, and the user is prompted to Ctrl-C to copy
					jGetElement(blockid, ".x_popupDialog").parent().detach(); // removes any dialogs already open
					var $dialog = $('<div class="copyDialog x_popupDialog">' + decisionBlock.createDecStr(blockid, "copy") + '</div>').appendTo($x_body);

					$dialog.dialog({
						closeOnEscape: true,
						title: pageXML.getAttribute("copyShortcutTxt") ? pageXML.getAttribute("copyShortcutTxt") : "Press Ctrl + C to copy",
						closeText: x_getLangInfo(x_languageData.find("closeBtnLabel")[0], "label", "Close")
					});

					x_setDialogSize($dialog);
					x_selectText("copyDialog");
				});
			this.sizeChanged(blockid);
			this.startNewDecision(blockid);
		}

		// call this function in every model once everything has loaded
		x_pageLoaded();
	}


	// _____ START NEW DECISION FROM 1st STEP _____
	this.startNewDecision = function (blockid, deepLink) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		let $stepHolder = jGetElement(blockid, ".stepHolder");
		let $submitBtn = jGetElement(blockid, ".submitBtn");
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		state.currentStep = 0;
		state.decisionHistory = [];
		state.storedResultTxt = [];	

		jGetElement(blockid, ".textHolder .displayInfo").empty();

		$submitBtn.button("disable");

		// set up 1st step - use firstStep from xml if valid id, otherwise use first step in array
		var firstStep = deepLink != undefined ? state.allSteps[deepLink].name : this.findStep(blockid, pageXML.getAttribute("firstStep")) ? pageXML.getAttribute("firstStep") : state.allSteps[0].name;
		this.setUpStep(blockid, firstStep, true);

		this.showHideHolders(blockid, $stepHolder);
	}


	// _____ SET UP STEP _____
	this.setUpStep = function (blockid, stepID, isNew) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		let $backBtn = jGetElement(blockid, ".backBtn");
		let $fwdBtn = jGetElement(blockid, ".fwdBtn");
		let $stepHolder = jGetElement(blockid, ".stepHolder");
		let $submitBtn = jGetElement(blockid, ".submitBtn");
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		$stepHolder.children(".step").detach();

		state.currentStepInfo = this.findStep(blockid, stepID);

		// set up step depending on its type
		if (state.currentStepInfo != null) {

			if (isNew) { // new step (not part of history)
				if (state.decisionHistory.length > 0) {
					state.currentStep = state.currentStep + 1;
				} else {
					// info only gets added to this array when submit button clicked so add blank first entry so it keeps same length as decisionHistory
					state.storedResultTxt.push("");
				}
				state.decisionHistory.push({ id: state.currentStepInfo.name });
			}

			if (state.currentStepInfo.type == "mcqStep" || state.currentStepInfo.type == "sliderStep") {
				this.setUpQ(blockid, isNew);
			} else if (state.currentStepInfo.type == "infoStep") {
				this.setUpI(blockid, isNew);
			} else if (state.currentStepInfo.type == "resultStep") {
				this.setUpR(blockid, isNew);
			}

			// enable/disable fwd & bck history btns
			if (state.currentStep + 1 >= state.decisionHistory.length) {
				$fwdBtn.button("disable");
			} else {
				$fwdBtn.button("enable");
			}

			if (state.currentStep == 0) {
				$backBtn.button("disable");
			} else {
				$backBtn.button("enable");
			}

			this.clearText(blockid);

		} else {
			// step matching ID not found
			var errorString = pageXML.getAttribute("errorString") ? pageXML.getAttribute("errorString") : "ERROR! Invalid ID";
			$stepHolder.prepend('<div class="step alert" >' + errorString + ' "' + stepID + '"</div>');

			if (state.decisionHistory.length > 0) {
				state.currentStep = state.currentStep + 1;
			}

			$submitBtn.button("disable");
		}

		x_pageContentsUpdated();
	}


	// _____ BUILD QUESTION STEP (mcq/slider) _____
	this.setUpQ = function (blockid, isNew) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		let $stepHolder = jGetElement(blockid, ".stepHolder");
		let $submitBtn = jGetElement(blockid, ".submitBtn");
		let $helpBtn = jGetElement(blockid, ".helpBtn");
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		$submitBtn.show();

		if (state.currentStepInfo.built != false) {

			// _____ Q ALREADY BUILT - RELOAD IT _____
			$stepHolder.prepend(state.currentStepInfo.built);

			var $thisStep = $stepHolder.children(".step");
			var currentStep = state.currentStep;

			// reset if it's being viewed fresh rather than via history
			if (isNew == true) {

				if (state.currentStepInfo.type == "mcqStep") {

					// should an option be selected by default?
					var defaultSelect = -1;
					state.currentStepInfo.options.each(function (i) {
						if ($(this).attr("selected") == "true") {
							defaultSelect = i;
						}
					});

					if (state.currentStepInfo.format == "menu") {
						$thisStep.find("select").prop("selectedIndex", defaultSelect);
					} else {
						if (defaultSelect == -1) {
							$thisStep.find("input:checked").prop("checked", false);
						} else {
							$thisStep.find(".opt" + defaultSelect).prop("checked", true);
						}
					}

					if (defaultSelect != -1) {
						$submitBtn.button("enable");
					} else {
						$submitBtn.button("disable");
					}

				} else if (state.currentStepInfo.type == "sliderStep") {
					var $slider = $thisStep.find(".slider");
					$slider.slider({ value: Number(state.currentStepInfo.value) });
					$thisStep.find(".labelHolder .amount").val($slider.slider("value"));

					$submitBtn.button("enable");
				}

				if (state.currentStepInfo.displayTxt != undefined && state.currentStepInfo.displayTxt != "") {
					var clear = state.currentStepInfo.clear == "true" ? " clear" : ""; // class used when previous info is to be cleared
					jGetElement(blockid, ".textHolder .displayInfo").append('<div class="info' + state.currentStep + clear + '">' + state.currentStepInfo.displayTxt + '</div>');
				}

				// if part of history make sure it's showing the correct answer
			} else {
				if (state.currentStepInfo.type == "mcqStep") {
					var answer = state.decisionHistory[currentStep].option;
					if (answer == undefined) {
						answer = -1;
						$submitBtn.button("disable");
					} else {
						$submitBtn.button("enable");
					}

					if (state.currentStepInfo.format == "menu") {
						$thisStep.find("select").prop("selectedIndex", answer);

					} else {
						$thisStep.find("input").prop("checked", false);
						$($thisStep.find("input")[answer]).prop("checked", true);
					}

				} else if (state.currentStepInfo.type == "sliderStep") {
					var $slider = $thisStep.find(".slider");
					if (currentStep + 1 >= state.decisionHistory.length) {
						// there is no value stored for this - set value to initial value
						$slider.slider({ value: Number(state.currentStepInfo.value) });
						$thisStep.find(".labelHolder .amount").val($slider.slider("value"));
					} else {
						$slider.slider({ value: Number(state.decisionHistory[currentStep].option) });
						$thisStep.find(".labelHolder .amount").val(state.decisionHistory[currentStep].option);
					}

					$submitBtn.button("enable");
				}
			}


		} else {

			// _____ BUILD NEW Q _____
			var authorSupport = x_params.authorSupport == "true" ? '<p class="alert">' + state.currentStepInfo.name + ' </p>' : "";
			var $text = $(x_addLineBreaks(state.currentStepInfo.text));

			if (pageXML.getAttribute("number") == "true") {
				if ($text.length > 0) {
					$text.prepend('<span class="num">' + (state.currentStep + 1) + ': </span>');
				} else {
					$text = $('<p>' + x_addLineBreaks(state.currentStepInfo.text) + '</p>');
					$text.prepend('<span class="num">' + (state.currentStep + 1) + ': </span>');
				}
			}

			$stepHolder.prepend('<div class="step"><div class="instruction"></div></div>');
			$stepHolder.find('.instruction').append(authorSupport).append($text);
			var $thisStep = $stepHolder.children(".step");

			if (state.currentStepInfo.options.length == 0) {
				$thisStep.append('<span class="alert">' + x_getLangInfo(x_languageData.find("errorQuestions")[0], "noA", "No answer options have been added") + '</span>');
				$submitBtn.button("disable");
			} else {
				if (state.currentStepInfo.type == "mcqStep") {

					// _____ MCQ _____
					var select = -1;
					$submitBtn.button("disable");

					// set up answer options
					state.currentStepInfo.options.each(function (i) {
						var $this = $(this);

						var authorSupport = "";
						if (x_params.authorSupport == "true") {
							var bracket1 = state.currentStepInfo.format == "menu" ? "(" : "",
								bracket2 = state.currentStepInfo.format == "menu" ? ")" : "",
								thisTarget = $this.attr("targetNew") != undefined && $this.attr("targetNew") != "" ?
									(decisionBlock.findStep(blockid, $this.attr("targetNew")) != null ? decisionBlock.findStep($this.attr("targetNew")).name : $this.attr("target")) :
									$this.attr("target");
							authorSupport = '<span class="alert"> ' + bracket1 + thisTarget + bracket2 + '</span>';
						}

						// is answer given via drop down menu or radio buttons
						if (state.currentStepInfo.format == "menu") {
							if (i == 0) {
								$thisStep.append('<div class="dropDownAnswer"><select></select></div>');
							}

							$thisStep.find("select")
								.css("font-size", $x_body.css("font-size"))
								.append('<option class="opt' + i + '">' + $this.attr("name") + authorSupport + '</option>');

							if ($this.attr("selected") == "true") {
								select = i;
								$thisStep.find("select").prop("selectedIndex", select);
								$submitBtn.button("enable");
							}

						} else {
							var $parent = $thisStep;
							if (i == 0) {
								$parent = $('<div class="optionHolder radioAnswers"/>').appendTo($thisStep);
							} else {
								$parent = $thisStep.find(".radioAnswers");
							}

							$parent.append('<div class="optionGroup"><input type="radio" name="option" class="opt' + i + '"/><label class="optionTxt" for="opt' + i + '"><p>' + x_addLineBreaks($this.attr("name")) + authorSupport + '</p></label></div>');

							if ($this.attr("selected") == "true") {
								$thisStep.find(".opt" + i).prop("checked", true);
								$submitBtn.button("enable");
							}
						}

						// store destination in option data
						$thisStep.find(".opt" + i).data({
							"target": $this.attr("targetNew") != undefined && $this.attr("targetNew") != "" ? $this.attr("targetNew") : $this.attr("target"),
							"resultTxt": $this.attr("resultTxt"),
							"displayTxt": $this.attr("displayTxt"),
							"clear": $this.attr("clear")
						});
					});

					// disable $submitBtn when no answer is selected
					if (state.currentStepInfo.format == "menu") {
						$thisStep.find("select").change(function () {
							if ($thisStep.find("select").prop("selectedIndex") != -1) {
								$submitBtn.button("enable");
							} else {
								$submitBtn.button("disable");
							}
						});

						if (select == -1) {
							$thisStep.find("select").prop("selectedIndex", -1);
						}

					} else {
						$thisStep.find("input")
							.change(function () {
								if ($thisStep.find("input:checked").length > 0) {
									$submitBtn.button("enable");
								} else {
									$submitBtn.button("disable");
								}
								jGetElement(blockid, ".x_popupDialog").parent().detach();
							})
							.focusin(function () {
								$(this).parent().addClass("highlight");
							})
							.focusout(function () {
								$(this).parent().removeClass("highlight");
							});
					}

				} else if (state.currentStepInfo.type == "sliderStep") {

					// _____ SLIDER _____
					var answerBox = '<input type="text" class="amount question"/><label for="amount">' + state.currentStepInfo.unit + '</label>';
					if (state.currentStepInfo.unitPos == "start") {
						answerBox = '<label for="amount">' + state.currentStepInfo.unit + '</label><input type="text" class="amount question"/>';
					}

					// work out max length of answer string
					var stepDec = state.currentStepInfo.step.split('.').length > 1 ? state.currentStepInfo.step.split('.')[1].length : 0,
						minDec = state.currentStepInfo.min.split('.').length > 1 ? state.currentStepInfo.min.split('.')[1].length : 0,
						maxDec = state.currentStepInfo.max.split('.').length > 1 ? state.currentStepInfo.max.split('.')[1].length : 0;
					var maxDecimals = Math.max(stepDec, minDec, maxDec);
					var inputW = state.currentStepInfo.max.split('.')[0].length + (maxDecimals > 0 ? 1 + maxDecimals : 0);

					var authorSupport = "";
					if (x_params.authorSupport == "true") {
						authorSupport += '<span class="alert">';
						state.currentStepInfo.options.each(function (i) {
							var $this = $(this),
								thisTarget = $this.attr("targetNew") != undefined && $this.attr("targetNew") != "" ?
									(decisionBlock.findStep(blockid, $this.attr("targetNew")) != null ? decisionBlock.findStep($this.attr("targetNew")).name : $this.attr("target")) :
									$this.attr("target");
							authorSupport += "<p>" + $this.attr("min") + " - " + $this.attr("max") + " : " + thisTarget + "</p>";
						});
						authorSupport += '</span>';
					}

					$thisStep
						.append('<div class="labelHolder">' + authorSupport + answerBox + '</div><div class="slider"></div>')
						.find(".amount").css("width", inputW + "em");

					var $slider = $thisStep.find(".slider"),
						$amount = $thisStep.find(".labelHolder .amount");

					$slider.slider({
						value: Number(state.currentStepInfo.value),
						min: Number(state.currentStepInfo.min),
						max: Number(state.currentStepInfo.max),
						step: Number(state.currentStepInfo.step),
						slide: function (event, ui) {
							$amount.val(ui.value);

							jGetElement(blockid, ".x_popupDialog").parent().detach();
						}
					})

					$amount
						.val($slider.slider("value"))
						.change(function () {
							const state = x_getPageDict("state", blockid);
							var value = Number($(this).val()),
								step = Number(state.currentStepInfo.step),
								min = Number(state.currentStepInfo.min),
								max = Number(state.currentStepInfo.max);
							if (value > max) {
								value = max;
								$amount.val(value);
							} else if (value < min) {
								value = min;
								$amount.val(value);
							} else {
								// check the value is one allowed according to step
								var rounded = Math.round((value - min) / step);
								var calcValue = rounded * step + min;
								value = Number(calcValue.toFixed(maxDecimals));
								$amount.val(value);
							}
							$slider.slider({ value: value });

							jGetElement(blockid, ".x_popupDialog").parent().detach();
						});

					$submitBtn.button("enable");
				}

				if (state.currentStepInfo.displayTxt != undefined && state.currentStepInfo.displayTxt != "") {
					var clear = state.currentStepInfo.clear == "true" ? " clear" : ""; // class used when previous info is to be cleared
					jGetElement(blockid, ".textHolder .displayInfo").append('<div class="info' + state.currentStep + clear + '">' + state.currentStepInfo.displayTxt + '</div>');
				}

				// save reference to this step so it can be reloaded later if needed
				state.allSteps[state.currentStepInfo.index].built = $thisStep;
			}
		}

		if (state.currentStepInfo.helpTxt != undefined && state.currentStepInfo.helpTxt != "") {
			$helpBtn.show();
		} else {
			$helpBtn.hide();
		}
	}


	// _____ BUILD INFORMATION STEP _____
	this.setUpI = function (blockid, isNew) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		let $stepHolder = jGetElement(blockid, ".stepHolder");
		let $submitBtn = jGetElement(blockid, ".submitBtn");
		let $helpBtn = jGetElement(blockid, ".helpBtn");
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		if (state.currentStepInfo.built != false) {

			// _____ INFO ALREADY BUILT - RELOAD IT _____
			$stepHolder.prepend(state.currentStepInfo.built);

		} else {

			// _____ BUILD NEW INFO _____
			var authorSupport = x_params.authorSupport == "true" ? '<p class="alert">' + state.currentStepInfo.name + ' </p>' : "";
			var $text = $(x_addLineBreaks(state.currentStepInfo.text));

			if (pageXML.getAttribute("number") == "true") {
				if ($text.length > 0) {
					$text.prepend('<span class="num">' + (state.currentStep + 1) + ': </span>');
				} else {
					$text = $('<p>' + x_addLineBreaks(state.currentStepInfo.text) + '</p>');
					$text.prepend('<span class="num">' + (state.currentStep + 1) + ': </span>');
				}
			}
			$text.prepend(authorSupport);

			$stepHolder.prepend('<div class="step"><div class="info"></div></div>');
			$stepHolder.find('.info').append($text);

			// save reference to this step so it can be reloaded later if needed
			state.allSteps[state.currentStepInfo.index].built = $stepHolder.children(".step");
		}

		if (state.currentStepInfo.helpTxt != undefined && state.currentStepInfo.helpTxt != "") {
			$helpBtn.show();
		} else {
			$helpBtn.hide();
		}

		if (isNew == true) {
			if (state.currentStepInfo.displayTxt != undefined && state.currentStepInfo.displayTxt != "") {
				var clear = state.currentStepInfo.clear == "true" ? " clear" : ""; // class used when previous info is to be cleared
				jGetElement(blockid, ".textHolder .displayInfo").append('<div class="info' + state.currentStep + clear + '">' + state.currentStepInfo.displayTxt + '</div>');
			}
		}

		$submitBtn
			.show()
			.button("enable");
	}


	// _____ BUILD RESULT STEP _____
	this.setUpR = function (blockid, isNew) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		let $stepHolder = jGetElement(blockid, ".stepHolder");
		let $submitBtn = jGetElement(blockid, ".submitBtn");
		let $helpBtn = jGetElement(blockid, ".helpBtn");
		let $overviewHolder = jGetElement(blockid, ".overviewHolder");
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		if (state.currentStepInfo.built != false && state.currentStepInfo.collate != "true") {

			// _____ RESULT ALREADY BUILT - RELOAD IT _____
			$stepHolder.prepend(state.currentStepInfo.built);

		} else {

			// _____ BUILD NEW RESULT _____
			var authorSupport = "";
			if (x_params.authorSupport == "true") {
				authorSupport = '<span class="alert">' + state.currentStepInfo.name + ' </span>';
			}

			var goBtn = "";
			if (state.currentStepInfo.destination != undefined && state.currentStepInfo != "") {
				goBtn = '<button class="goBtn"/>';
			}

			var resultEndString = pageXML.getAttribute("resultEndString") ? '<p>' + pageXML.getAttribute("resultEndString") + '</p>' : "";
			$stepHolder.prepend('<div class="step"><div class="result">' + authorSupport + x_addLineBreaks(state.currentStepInfo.text) + decisionBlock.collateResult(blockid, state.currentStepInfo.collate, "html") + resultEndString + '</div>' + goBtn + '<button class="viewThisBtn" /></div>');

			if (pageXML.getAttribute("overview") != "false") {
				// set up view overview & jump to page buttons
				jGetElement(blockid, ".viewThisBtn")
					.button({
						label: pageXML.getAttribute("viewThisBtn") ? pageXML.getAttribute("viewThisBtn") : "Overview"
					})
					.click(function () {
						$overviewHolder.find(".decisionInfo").parent().remove();
						decisionBlock.showHideHolders(blockid, $overviewHolder);

						// _____ DISPLAY STEPS TAKEN IN DECISION _____
						$overviewHolder.append('<div class="dec">' + decisionBlock.createDecStr(blockid, "html") + '</div>');
						jGetElement(blockid, ".x_popupDialog").parent().detach();
						$overviewHolder.scrollTop(0);
					});
			} else {
				jGetElement(blockid, ".viewThisBtn").remove();
			}

			jGetElement(blockid, ".goBtn")
				.button({
					label: pageXML.getAttribute("destinationBtn") ? pageXML.getAttribute("destinationBtn") : "Continue"
				})
				.click(function () {
					if (x_lookupPage("linkID", state.currentStepInfo.destination) !== false) { // destination found
						x_navigateToPage(false, { type: "linkID", ID: state.currentStepInfo.destination });
					}
				});

			// save reference to this step so it can be reloaded later if needed
			state.allSteps[state.currentStepInfo.index].built = $stepHolder.children(".step");
		}

		if (isNew == true) {
			if (state.currentStepInfo.displayTxt != undefined && state.currentStepInfo.displayTxt != "") {
				var clear = state.currentStepInfo.clear == "true" ? " clear" : ""; // class used when previous info is to be cleared
				jGetElement(blockid, ".textHolder .displayInfo").append('<div class="info' + state.currentStep + clear + '">' + state.currentStepInfo.displayTxt + '</div>');
			}
		}

		$helpBtn.hide();
		$submitBtn.hide();
	}


	// _____ COLLATE RESULT TEXT FROM STORED STRINGS _____
	this.collateResult = function (blockid, collate, type) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_getPageDict("state", blockid);
		if (collate == "true") {
			var storedResultTxt = state.storedResultTxt;
			var string = "";

			for (var i = 0; i < storedResultTxt.length; i++) {
				if (storedResultTxt[i] != "" && storedResultTxt[i] != undefined) {
					if (type == "html") {
						string += '<div class="collatedResult">' + x_addLineBreaks(storedResultTxt[i]) + '</div>';
					} else {
						string += '<p>' + x_addLineBreaks(storedResultTxt[i]) + '</p>';
					}
				}
			}

			return string;
		} else {
			return "";
		}
	}


	// _____ CREATE OVERVIEW STRING FOR COPY & OVERVIEW _____
	// string is formatted differently depending on whether it's for copying or overview shown in browser
	this.createDecStr = function (blockid, type) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		var string = "";

		if (type == "html") {
			string += '<div class="decisionInfo"><h3>' + (pageXML.getAttribute("overviewString") ? pageXML.getAttribute("overviewString") : "Overview") + ':</h3>';
		} else {
			string += '<p>' + (pageXML.getAttribute("overviewString") ? pageXML.getAttribute("overviewString") : "Overview") + '</p>';
		}

		// add details of each step in decision to string
		for (var i = 0; i < state.decisionHistory.length; i++) {
			var thisStep = this.findStep(blockid, state.decisionHistory[i].id);
			// TODO look at this
			var $text = $("<p>" + x_addLineBreaks(thisStep.text) + "</p>");

			if (pageXML.getAttribute("number") == "true" && thisStep.type != "resultStep") {
				if ($text.length > 0) {
					$text.prepend('<span class="num">' + (i + 1) + ': </span>');
				} else {
					$text = $('<p>' + x_addLineBreaks(thisStep.text) + '</p>');
					$text.prepend('<span class="num">' + (i + 1) + ': </span>');
				}
			}

			if (type == "html") {
				string += '<div class="overviewStep">';
			}

			if (thisStep.type == "mcqStep" || thisStep.type == "sliderStep") {
				if (type == "html") {
					string += '<div><i class="fa fa-fw fa-x-question"/> &nbsp;' + $text.prop('outerHTML') + '</div>';
				} else {
					string += '<p>' + $text.text() + '</p>';
				}

				if (thisStep.type == "mcqStep") {
					if (type == "html") {
						// include details of answers which weren't chosen too
						string += '<div class="overviewAnswer"><i class="fa fa-fw fa-chevron-right"></i> &nbsp;' + x_addLineBreaks($(thisStep.options[state.decisionHistory[i].option]).attr("name")) + '</div>';
						string += '<div class="extraInfo"><i class="fa fa-fw fa-chevron-right"/> &nbsp;' + (pageXML.getAttribute("posAnswerString") ? pageXML.getAttribute("posAnswerString") : "Other possible answers") + ': ';

						thisStep.options.each(function (j) {
							if (j != state.decisionHistory[i].option) {
								string += x_addLineBreaks($(thisStep.options[j]).attr("name"));

								if (j + 1 == thisStep.options.length || (j + 1 == state.decisionHistory[i].option && j + 2 == thisStep.options.length)) {
								} else {
									string += ', ';
								}
							}
						});

						string += '</div>';

					} else {
						string += '<p> >> ' + $(thisStep.options[state.decisionHistory[i].option]).attr("name") + '</p>';
						string += '<p>-------------------------------------------------</p>';
					}

				} else if (thisStep.type == "sliderStep") {
					var answer = state.decisionHistory[i].option + ' ' + thisStep.unit,
						posAnswer = thisStep.min + ' - ' + thisStep.max + ' ' + thisStep.unit;

					if (thisStep.unitPos == "start") {
						answer = thisStep.unit + ' ' + state.decisionHistory[i].option;
						posAnswer = thisStep.unit + ' ' + thisStep.min + ' - ' + thisStep.max;
					}

					if (type == "html") {
						string += '<div class="overviewAnswer"><i class="fa fa-fw fa-chevron-right"/> &nbsp;' + answer + '</div>';
						string += '<div class="extraInfo"><i class="fa fa-fw fa-chevron-right"/> &nbsp;' + (pageXML.getAttribute("fromRangeString") ? pageXML.getAttribute("fromRangeString") : "From range") + ' ' + posAnswer + '</div>';
					} else {
						string += '<p> >> ' + answer + '</p>';
						string += '<p>-------------------------------------------------</p>';
					}

				}

			} else if (thisStep.type == "infoStep") {
				if (type == "html") {
					string += '<div><i class="fa fa-fw fa-x-info"/> &nbsp' + $text.prop('outerHTML') + '</div>';
				} else {
					string += '<p>' + $text.text() + '</p>';
					string += '<p>-------------------------------------------------</p>';
				}

			} else if (thisStep.type == "resultStep") {
				if (type == "html") {
					string += '<div><i class="fa fa-fw fa-x-lightbulb"/> &nbsp;' + $text.prop('outerHTML') + '</div>';
				} else {
					string += '<p>' + (pageXML.getAttribute("resultString") ? pageXML.getAttribute("resultString") : "Result") + ':</p>';
					string += '<p>' + $text.text() + '</p>';
					string += '<p>-------------------------------------------------</p>';
				}

				string += decisionBlock.collateResult(blockid, thisStep.collate, type);
			}

			if (type == "html") {
				string += '</div>';
			}
		}

		return string;
	}


	// _____ RETURN STEP WITH REQUESTED ID _____
	this.findStep = function (blockid, stepID) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_getPageDict("state", blockid);
		// original version of this page required you to type a target ID in as destination step.
		// this has changed so that there's a drop down box where you can select the destination step.
		// although original attribute (target) is deprecated & the new attribute (targetNew) is now used where it exists (it saves linkID to xml)
		// the old version still needs to work for older projects.

		for (var i = 0; i < state.allSteps.length; i++) {
			if (state.allSteps[i].name == stepID) {
				var thisStep = state.allSteps[i];
				thisStep.index = i;
				return thisStep;
			} else if (state.allSteps[i].linkID == stepID) {
				var thisStep = state.allSteps[i];
				thisStep.index = i;
				return thisStep;
			}
		}
		return null;
	}


	// _____ TOGGLE HOLDER VISIBILITY _____
	this.showHideHolders = function (blockid, $show) {
		let $stepHolder = jGetElement(blockid, ".stepHolder");
		let $overviewHolder = jGetElement(blockid, ".overviewHolder");
		let pageXML = x_getBlockXML(blockid);
		$overviewHolder.hide();
		$stepHolder.hide();
		$show.show();

		$overviewHolder.is(":visible") && pageXML.getAttribute("copy") == "true" ? jGetElement(blockid, ".copyBtn").show() : jGetElement(blockid, ".copyBtn").hide();
	}

	// _____ CLEARS / SHOWS DISPLAY TEXT AS REQUIRED _____
	this.clearText = function (blockid) {
		let $pageContents = jGetElement(blockid, ".pageContents");
		const state = x_getPageDict("state", blockid);
		// called when going forwards through steps to make sure any display text is cleared when required - and then should reappear if going back
		if (jGetElement(blockid, ".textHolder .displayInfo div.clear").length > 0) {
			var clear = false;
			for (var i = 0; i < state.currentStep + 1; i++) {
				if (clear == false) {
					jGetElement(blockid, ".textHolder .displayInfo div.info" + (state.currentStep - i)).show();
					if (jGetElement(blockid, ".textHolder .displayInfo div.clear.info" + (state.currentStep - i)).length > 0) {
						clear = true;
					}
				} else {
					jGetElement(blockid, ".textHolder .displayInfo div.info" + (state.currentStep - i)).hide();
				}
			}
		}
	}
}
