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

var allParams		= {},	// all attributes of learningObject
    urlParams       = {},	// url parameters
    allQParams		= {},	// all attributes of quiz
	allSections		= [],	// array containing an object with details of each section
	allSteps		= [],	// array containing an object with details for each possible step
	
	decisionHistory = [],	// array of arrays - each one contains ids & options selected for that decision
	storedResultTxt	= [],	// array of arrays - each one contains text stored until presented as a collated result (optional)
	currentDecision,
	currentStep,
	currentStepInfo,
	currentSection,
	
	languageData	= [],
	x_theme 		= "default",
	x_volume        = 1,
	x_audioBarH     = 40,
	x_mediaText     = [];

var $mainHolder, $headerBlock, $backBtn, $infoBtn,	$fwdBtn, $newBtn,	$contentHolder,	$stepHolder, $submitBtn, $introHolder, $overviewHolder, $footerBlock,	$dialog, $head;


function init() {
	$mainHolder		= $("#mainHolder");
	$headerBlock	= $("#headerBlock");
	$backBtn		= $("#backBtn");
	$infoBtn		= $("#infoBtn");
	$fwdBtn			= $("#fwdBtn");
	$newBtn			= $("#newBtn");
	$contentHolder	= $("#contentHolder");
	$stepHolder		= $("#stepHolder");
	$submitBtn		= $("#submitBtn");
	$introHolder	= $("#introHolder");
	$overviewHolder	= $("#overviewHolder");
	$footerBlock	= $("#footerBlock");
	$dialog			= $(".dialog");
	$head           = $("head");
	
	smallScreen = screen.width <= 550 ? true : false;
	
	// _____ GET & SORT XML DATA _____
	var now = new Date().getTime();
	let url = "website_code/php/templates/get_template_xml.php?file=" + projectXML + "&time=" + now;
	if (typeof use_url !== "undefined" && use_url)
	{
		url = projectXML + "?time=now";
	}

	$.ajax({
		type: "GET",
		url: url,
		dataType: "text",
		success: function(text) {
			var	newString = fixLineBreaks(makeURLsAbsolute(text)),
				xmlData = $($.parseXML(newString)).find("learningObject"),
				quizXML,
				i, len;
			
			// get attributes of LO & quiz
			for (var i=0, len=xmlData[0].attributes.length; i<len; i++) {
				allParams[xmlData[0].attributes[i].name] = xmlData[0].attributes[i].value;
			}
			
			quizXML = xmlData.children("quiz");
			for (var i=0, len=quizXML[0].attributes.length; i<len; i++) {
				allQParams[quizXML[0].attributes[i].name] = quizXML[0].attributes[i].value;
			}
			
			// get info for all sections
			quizXML.children("section").each(function() {
				var section = {};
				
				for (var i=0; i<this.attributes.length; i++) {
					section[this.attributes[i].name] = this.attributes[i].value;
				}
				
				allSections.push(section);
				
				var sectionAttrs = this.attributes;
				
				// get info for all steps in section
				$(this).children().each(function() {
					var step = {
						type:		this.nodeName,
						built:		false
					};
					
					// if step's section info will be shown, keep note of which section it belongs to
					if (sectionAttrs.show.value == "true") {
						step.section = sectionAttrs.name.value;
					}
					
					for (var i=0; i<this.attributes.length; i++) {
						step[this.attributes[i].name] = this.attributes[i].value;
					}
					
					// if it's a question, get the options - otherwise, get the text
					if (step.type == "mcq" || step.type == "slider") {
						step.options = $(this).children();
					} else {
						step.text = $(this).attr("text");
					}
					
					allSteps.push(step);
				});
			});
			
			getLangData(allParams.language);
		},
		error: function() {
			// can't have translation for this as if it fails to load we don't know what language file to use
			$("body").append("<p>The project data has not loaded.</p>");
		}
	});
}


// _____ GET LANGUAGE DATA _____
function getLangData(lang) {
	if (lang == undefined || lang == "undefined") {
		lang = "en-GB";
	}
	$.ajax({
		type: "GET",
		url: "languages/engine_" + lang + ".xml",
		dataType: "xml",
		success: function (xml) {
			languageData = $(xml).find("language");
			sortLangData();
			setUpInterface();
		},
		error: function () {
			if (lang != "en-GB") { // no language file found - try default GB one
				getLangData("en-GB");
			} else { // hasn't found GB language file - set up anyway, will use fallback text in code
				languageData = $("");
				sortLangData();
				setUpInterface()
			}
		}
	});
}

function sortLangData() {
	// store language data for mediaelement buttons - use fallbacks in mediaElementText array if no lang data
	var mediaElementText = [{name:"stopButton", label:"Stop", description:"Stop Media Button"},{name:"playPauseButton", label:"Play/Pause", description:"Play/Pause Media Button"},{name:"muteButton", label:"Mute Toggle", description:"Toggle Mute Button"},{name:"fullscreenButton", label:"Fullscreen", description:"Fullscreen Movie Button"},{name:"captionsButton", label:"Captions/Subtitles", description:"Show/Hide Captions Button"}];

	for (var i=0, len=mediaElementText.length; i<len; i++) {
		x_mediaText.push({
			label: getLangInfo(languageData.find("mediaElementControls").find(mediaElementText[i].name)[0], "label", mediaElementText[i].label[0]),
			description: getLangInfo(languageData.find("mediaElementControls").find(mediaElementText[i].name)[0], "description", mediaElementText[i].description[0])
		});
	}
	
	x_mediaText.push(
		{label: getLangInfo(languageData.find("mediaElementControls")[0], "video", "")},
		{label: getLangInfo(languageData.find("mediaElementControls")[0], "audio", "")}
	);
}


// _____ GET STRING FROM LANGUAGE FILE _____
function getLangInfo(node, attribute, fallBack) {
    var string = fallBack;
    if (node != undefined && node != null) {
        if (attribute == false) {
            string = node.childNodes[0].nodeValue;
        } else {
            string = node.getAttribute(attribute);
        }
    }
    return string;
}


// _____ SET UP INTERFACE _____
function setUpInterface() {
    // if there's a valid step ID set in URL, use this as 1st step
    var tempUrlParams = window.location.href.split("&").splice(0);
    for (i=0; i<tempUrlParams.length; i++) {
        urlParams[tempUrlParams[i].split("=")[0]] = tempUrlParams[i].split("=")[1];
    }
    if (urlParams.theme != undefined && (allParams.themeurl == undefined || allParams.themeurl != 'true'))
	{
		allParams.theme = urlParams.theme;
	}

	if (allParams.theme != undefined && allParams.theme != "default") {
		
		$('head').append('<link rel="stylesheet" href="' + themePath + allParams.theme + '/' + allParams.theme + '.css' + '" type="text/css" />');
        
        $('head').append('<script src="'+ themePath + allParams.theme + '/'+ allParams.theme + '.js"' + '</script>');
		
	}
	
	// stylesheet can be added in editor
	if (allParams.stylesheet != undefined) {
		insertCSS(evalURL(allParams.stylesheet));
	}
	if (allParams.styles != undefined){
        $head.append('<style type="text/css">' +  allParams.styles + '</style>');
    }

	
	if (allParams.displayMode == "fixed" && smallScreen == false) {
		$mainHolder
			.width(800)
			.height(600)
			.addClass("bgColour");
	} else {
		$("body").addClass("bgColour");
	}
	
	$headerBlock.find("#titles h1").html(allParams.name);
	$headerBlock.find("#titles h2").html(allQParams.name);
	
	if (allParams.logo != undefined && allParams.logo != "") {
		var alt = "";
		if (allParams.logoAlt != undefined && allParams.logoAlt != "") {
			alt = 'alt="' + allParams.logoAlt + '"';
		}
		
		var floatClass = allParams.logoPos == undefined || allParams.logoPos.indexOf('Left') > -1 ? 'floatL' : 'floatR';
		if (allParams.logoPos == undefined || allParams.logoPos.indexOf('foot') > -1) {
			$footerBlock.append('<img id="logo1" src="' + evalURL(allParams.logo) + '" ' + alt + ' class="' + floatClass + '" />');
		} else {
			$headerBlock.prepend('<img id="logo1" src="' + evalURL(allParams.logo) + '" ' + alt + ' class="' + floatClass + '" />');
		}
		
		if (allParams.logo2 != undefined && allParams.logo2 != "") {
			alt = "";
			if (allParams.logoAlt2 != undefined && allParams.logoAlt2 != "") {
				alt = 'alt="' + allParams.logoAlt2 + '"';
			}
			
			floatClass = allParams.logoPos2 == undefined || allParams.logoPos2.indexOf('Right') > -1 ? 'floatR' : 'floatL';
			if (allParams.logoPos2 == undefined || allParams.logoPos2.indexOf('foot') > -1) {
				$footerBlock.append('<img id="logo2" src="' + evalURL(allParams.logo2) + '" ' + alt + ' class="' + floatClass + '" />');
			} else {
				$headerBlock.prepend('<img id="logo2" src="' + evalURL(allParams.logo2) + '" ' + alt + ' class="' + floatClass + '" />');
			}
		}
		
		// footerBlock's position should always be at bottom of window or content - which ever is lower
		// trigger function that sorts this on window resize / device orientation change
		var $window = $(window);
		$window.on("resizeEnd", function() {
			setFooterPosition();
		});
		
		if (!!("ontouchstart" in window)) {
			$window.on("orientationchange", function() {
				setFooterPosition();
			});
		}
		
	} else {
		$footerBlock.remove();
	}
	
	
	// _____ HISTORY BACK BTN _____
	$backBtn
		.click(function() {
			if ($introHolder.is(":visible") || $overviewHolder.is(":visible")) {
				showHideHolders($stepHolder);
				if (currentStep == 0) {
					$(this).attr("disabled","disabled");
				}
				if (currentStep + 1 >= decisionHistory[currentDecision].length) {
					$fwdBtn.attr("disabled","disabled");
				}
			} else {
				currentStep--;
				setUpStep(decisionHistory[currentDecision][currentStep].id)
			}
			$dialog.dialog("close");
		})
		.attr("title", allParams.backBtn)
		.find(".btnLabel").html(allParams.backBtn);
	
	
	// _____ HISTORY FWD BTN _____
	$fwdBtn
		.click(function() {
			if ($introHolder.is(":visible") || $overviewHolder.is(":visible")) {
				showHideHolders($stepHolder);
				if (currentStep + 1 >= decisionHistory[currentDecision].length) {
					$(this).attr("disabled","disabled");
				}
			} else {
				currentStep++;
				setUpStep(decisionHistory[currentDecision][currentStep].id)
			}
			$dialog.dialog("close");
			
		})
		.attr("title", allParams.fwdBtn)
		.find(".btnLabel").html(allParams.fwdBtn);
	
	
	// _____ INTRO BTN _____
	if (allQParams.text != undefined && allQParams.text != "") {
		$introHolder.append('<h3>' + allQParams.title + '</h3>' + addLineBreaks(iFrameCheck(allQParams.text)));
		
		$infoBtn
			.click(function() {
				if ($introHolder.is(":visible")) {
					showHideHolders($stepHolder);
					
					// bck/fwd btns should only be active if there are previous/subsequent questions in history
					if (currentStep == 0) {
						$backBtn.attr("disabled","disabled");
					}
					if (currentStep + 1 >= decisionHistory[currentDecision].length) {
						$fwdBtn.attr("disabled","disabled");
					}
					
				} else {
					showHideHolders($introHolder);
					$fwdBtn.removeAttr("disabled");
				}
				
				$dialog.dialog("close");
				
				$(this).blur();
				})
			.attr("title", allQParams.title)
			.find(".btnLabel").html(allQParams.title);
		
	} else {
		$introHolder.remove();
		$infoBtn.remove();
	}
	
	
	// _____ NEW BTN _____
	$newBtn
		.click(function() {
			startNewDecision();
			})
		.attr("title", allParams.newBtnLabel)
		.hide()
		.find(".btnLabel").html(allParams.newBtnLabel)
	
	
	// _____ CONTENT HOLDER BUTTONS _____
	
	// _____ SUBMIT BTN _____
	$submitBtn
		.button() // title for button is set individually for each question
		.click(function() {
			if (currentStep + 1 != decisionHistory[currentDecision].length) {
				decisionHistory[currentDecision] = decisionHistory[currentDecision].slice(0, currentStep + 1);
				storedResultTxt[currentDecision] = storedResultTxt[currentDecision].slice(0, currentStep + 1);
			}
			
			// button does different things depending on type of currentStep:
			if (currentStepInfo.type == "mcq") {
				
				// save answer and load the new step associated with it
				var $step = $stepHolder.children(".step"),
					answer, target;
				
				if (currentStepInfo.format == "menu") {
					answer = $step.find("select").prop("selectedIndex");
					target = $step.find("select #opt" + answer).data("target");
					
					// store resultTxt (optional) so it can be shown as collated result at the end
					storedResultTxt[currentDecision].push($step.find("select #opt" + answer).data("resultTxt"));
					
				} else {
					answer = $step.find("input").index($step.find("input:checked"))
					target = $step.find("input:checked").data("target");
					
					// store resultTxt (optional) so it can be shown as collated result at the end
					storedResultTxt[currentDecision].push($step.find("input:checked").data("resultTxt"));
				}
				
				decisionHistory[currentDecision][decisionHistory[currentDecision].length-1].option = answer;
				setUpStep(target, true);
				
			} else if (currentStepInfo.type == "slider") {
				// save value, work out which option it falls in to (between min & max values) and load the new step associated with it
				decisionHistory[currentDecision][decisionHistory[currentDecision].length-1].option = $stepHolder.find("#amount").val();
				
				var exists = false;
				currentStepInfo.options.each(function(i) {
					var $this = $(this),
						$slider = $stepHolder.find("#slider");
					
					if ($slider.slider("value") >= $this.attr("min") && $slider.slider("value") <= $this.attr("max")) {
						// store resultTxt associated with this answer (optional) so it can be shown as collated result at the end
						storedResultTxt[currentDecision].push($this.attr("resultTxt"));
						
						setUpStep($this.attr("target"), true);
						exists = true;
						return false;
					}
				});
				if (exists == false) {
					alert(allParams.sliderError ? allParams.sliderError : "There is no next step for this value!");
				}
				
			} else if (currentStepInfo.type == "info") {
				
				// there can't be any resultTxt stored for info steps so store empty string
				storedResultTxt[currentDecision].push("");
				
				// load new step
				setUpStep(currentStepInfo.target, true);
			}
			
			$dialog.dialog("close");
			document.getElementById("mainHolder").scrollIntoView();
		});
	
	
	// _____ EMAIL/PRINT OVERVIEW BTNS _____
	if (allQParams.email != "false" && allQParams.email != "") {
		$("#emailBtn")
			.click(function() {
				// create string for email containing details of how result was reached
				var emailString = "Subject=" + encodeURIComponent(allParams.name + " - " + allQParams.name) + "&body=";
				
				for (var i=0; i<decisionHistory.length; i++) {
					emailString += encodeURIComponent(jQuery('<div>' + createDecStr(i) + '</div>').text()); // removes html tags
				}
				
				window.location.href = "mailto:?" + emailString;
				})
			.attr("title", allParams.emailBtn)
			.find(".btnLabel").html(allParams.emailBtn);
	} else {
		$("#emailBtn").remove();
	}
	
	if (allQParams.print != "false" && allQParams.print != "") {
		$("#printBtn")
			.click(function() {
				$('html, body').css('overflow-x', 'visible');
				document.getElementById("mainHolder").scrollIntoView();
				window.print();
				$('html, body').css('overflow-x', 'hidden');
			})
			.attr("title", allParams.printBtn)
			.find(".btnLabel").html(allParams.printBtn);
	} else {
		$("#printBtn").remove();
	}
	
	showHideHolders($introHolder);
	$mainHolder.css("visibility", "visible");
	

	if (urlParams.step != undefined) {
		startNewDecision(urlParams.step);
	} else {
		startNewDecision();
	}
}


// _____ START NEW DECISION FROM 1st STEP _____
function startNewDecision(urlStep) {
	if (allSteps.length == 0) {
		$("#contentHolder").html('<span class="alert">' + (allParams.noQ ? allParams.noQ : "No questions have been added") + '</span>');
		$("#btnHolder span").hide();
	} else {
		$submitBtn.show();
		$("#btnHolder #group1 button").attr("disabled","disabled");
		
		// is it the 1st decision?
		if (currentDecision == undefined) {
			currentDecision = 0;
		} else {
			currentDecision++;
		}
		
		currentStep = 0;
		decisionHistory.push([]); // new array to hold history of steps for this decision
		storedResultTxt.push([]); // new array to hold any strings to be used in collated results
		
		// set up 1st step - could be from URL parameter, set in xml, or 1st in array
		var firstStep = allSteps[0].name;
		if (findStep(urlStep) != undefined) {
			firstStep = urlStep;
		} else if (findStep(allQParams.firstStep) != null) {
			firstStep = allQParams.firstStep;
		}
		
		setUpStep(firstStep, true);
		
		if ($mainHolder.find($introHolder).length > 0) {
			$infoBtn.removeAttr("disabled");
			
			if (urlStep == undefined) {
				showHideHolders($introHolder);
				$fwdBtn.removeAttr("disabled");
			} else {
				showHideHolders($stepHolder);
				$fwdBtn.attr("disabled", "disabled");
			}
		} else {
			// there's no intro text - go straight to 1st step
			showHideHolders($stepHolder);
		}
	}
}


// _____ SET UP STEP _____
function setUpStep(stepID, isNew) {
	$stepHolder.children(".step").detach();
	$newBtn.hide();
	
	currentStepInfo = findStep(stepID);
	
	// set up step depending on its type
	if (currentStepInfo != null) {
		
		if (isNew) { // new step (not part of history)
			if (decisionHistory[currentDecision].length > 0) {
				currentStep++;
			} else {
				// info only gets added to this array when submit button clicked so add blank first entry so it keeps same length as decisionHistory
				storedResultTxt[currentDecision].push("");
			}
			decisionHistory[currentDecision].push({id: currentStepInfo.name});
		}
	
		if (currentStepInfo.type == "mcq" || currentStepInfo.type == "slider") {
			setUpQ(isNew);
		} else if (currentStepInfo.type == "info") {
			setUpI();
		} else if (currentStepInfo.type == "result") {
			setUpR();
		}
		
		$submitBtn.button({label: currentStepInfo.btnLabel});
		
		// enable/disable fwd & bck history btns
		if (currentStep + 1 >= decisionHistory[currentDecision].length && $introHolder.is(":hidden")) {
			$fwdBtn.attr("disabled", "disabled");
		} else {
			$fwdBtn.removeAttr("disabled");
		}
		
		if (currentStep == 0) {
			$backBtn.attr("disabled", "disabled");
		} else {
			$backBtn.removeAttr("disabled");
		}
		
	} else {
		// step matching ID not found
		$stepHolder.prepend('<div class="step alert" >' + allParams.errorString + ' "' + stepID + '"</div>');
		
		if (decisionHistory[currentDecision].length > 0) {
			currentStep++;
		}
		$submitBtn.button("disable");
	}
	
	setFooterPosition();
}


// _____ BUILD QUESTION STEP (mcq/slider) _____
function setUpQ(isNew) {
	
	$submitBtn.show();
	
	if (currentStepInfo.built != false) {
		
		// _____ Q ALREADY BUILT - RELOAD IT _____
		$stepHolder.prepend(currentStepInfo.built);
		
		var $thisStep = $stepHolder.children(".step");
		
		setUpSection(currentStepInfo.section, $thisStep);
		
		if ($(".stepAudio audio, .stepVideo:not(.iframe) video").length > 0) {
			$(".stepAudio audio, .stepVideo video")[0].setCurrentTime(0);
		}
		
		// reset if it's being viewed fresh rather than via history
		if (isNew == true) {
			
			if (currentStepInfo.type == "mcq") {
				// should an option be selected by default?
				var defaultSelect = -1;
				currentStepInfo.options.each(function(i) {
					if ($(this).attr("selected") == "true") {
						defaultSelect = i;
					}
				});
				
				if (currentStepInfo.format == "menu") {
					$thisStep.find("select").prop("selectedIndex", defaultSelect);
				} else {
					if (defaultSelect == -1) {
						$thisStep.find("input:checked").prop("checked", false);
					} else {
						$thisStep.find("#opt" + defaultSelect).prop("checked", true);
					}
				}
				
				if (defaultSelect != -1) {
					$submitBtn.button("enable");
				} else {
					$submitBtn.button("disable");
				}
				
			} else if (currentStepInfo.type == "slider") {
				var $slider = $thisStep.find("#slider");
				$slider.slider({value: Number(currentStepInfo.value)});
				$thisStep.find("#labelHolder #amount").val($slider.slider("value"));
				
				$submitBtn.button("enable");
			}
		
		// if part of history make sure it's showing the correct answer
		} else {
			if (currentStepInfo.type == "mcq") {
				var answer = decisionHistory[currentDecision][currentStep].option;
				if (answer == undefined) {
					answer = -1;
					$submitBtn.button("disable");
				} else {
					$submitBtn.button("enable");
				}
				
				if (currentStepInfo.format == "menu") {
					$thisStep.find("select").prop("selectedIndex", answer);
					
				} else {
					$thisStep.find("input").prop("checked", false);
					$($thisStep.find("input")[answer]).prop("checked", true);
				}
				
			} else if (currentStepInfo.type == "slider") {
				var $slider = $thisStep.find("#slider");
				if (currentStep + 1 >= decisionHistory[currentDecision].length) {
					// there is no value stored for this - set value to initial value
					$slider.slider({value: Number(currentStepInfo.value)});
					$thisStep.find("#labelHolder #amount").val($slider.slider("value"));
				} else {
					$slider.slider({value: Number(decisionHistory[currentDecision][currentStep].option)});
					$thisStep.find("#labelHolder #amount").val(decisionHistory[currentDecision][currentStep].option);
				}
				
				$submitBtn.button("enable");
			}
		}
		
		sizeChanged();
	
	
	} else {
		
		// _____ BUILD NEW Q _____
		var icon = "fa-question";
		if (currentStepInfo.faIcon != undefined && currentStepInfo.faIcon != "") {
			icon = "fa-" + currentStepInfo.faIcon;
		}
		
		var authorSupport = "";
		if (allParams.authorSupport == "true") {
			authorSupport =  '<span class="hint">' + currentStepInfo.name + ' </span>';
		}
		
		var mediaInfo = checkForMedia();
		
		$stepHolder.prepend('<div class="step"><span class="fa ' + icon + ' fa-2x pull-left fa-border fa-fw"/><div class="instruction">' + mediaInfo[0] + authorSupport + addLineBreaks(iFrameCheck(currentStepInfo.text)) + '</div></div>');
		
		if (mediaInfo[1] == 'loadVideo') {
			var $stepVideo = $stepHolder.find('.step').last().find('.stepVideo');
			
			// VIDEO SCALING
			// 1. if video size optional property is added then this overrides all other sizing options
			var videoDimensions = [];
			if (currentStepInfo.movieSize != "" && currentStepInfo.movieSize != undefined) {
				var dimensions = currentStepInfo.movieSize.split(",");
				if (dimensions[0] != 0 && dimensions[1] != 0) {
					videoDimensions = dimensions;
				}
			}
			
			if (videoDimensions.length == 2) {
				$stepVideo.data('dimensions', videoDimensions);
				
			// 2. if embedded video (youtube/vimeo) or an iframe is in the src field then an iframeRatio will be used
			} else if (currentStepInfo.img.substr(0,7) == "<iframe" || currentStepInfo.img.substr(0,4) == "http") {
				var iframeRatio = currentStepInfo.iframeRatio != "" && currentStepInfo.iframeRatio != undefined ? currentStepInfo.iframeRatio : '16:9';
				iframeRatio = iframeRatio.split(':');
				
				// iframe ratio can be one entered in editor or fallback to 16:9
				if (!$.isNumeric(iframeRatio[0]) || !$.isNumeric(iframeRatio[1])) {
					iframeRatio = [16,9];
				}
				$stepVideo
					.data('iframeRatio', iframeRatio)
					.addClass('iframe');
			}
			
			// 3. if uploaded video & none of above apply then we'll wait until we have metadata & just video responsive (never exceeding orig size)
		}
		
		var $thisStep = $stepHolder.children(".step");
		
		if (currentStepInfo.options.length == 0) {
			$thisStep.append('<span class="alert">' + (allParams.noA ? allParams.noA : "No answer options have been added") + '</span>');
			$submitBtn.button("disable");
		} else {
			if (mediaInfo[1] != undefined) {
				var $stepMedia = $(".stepAudio, .stepVideo");
				if ($stepMedia.hasClass("stepAudio")) {
					$stepMedia.appendTo($stepMedia.parent());
				}
				window[mediaInfo[1]]($stepMedia, currentStepInfo.img);
			}
			
			setUpSection(currentStepInfo.section, $thisStep);
			
			if (currentStepInfo.helpTxt != undefined && currentStepInfo.helpTxt != "") {
				setUpHelp($thisStep);
			}
			
			if (currentStepInfo.type == "mcq") {
				
				// _____ MCQ _____
				var select = -1;
				$submitBtn.button("disable");
				
				// set up answer options
				currentStepInfo.options.each(function(i) {
					var	$this = $(this);
					
					var authorSupport = "";
					if (allParams.authorSupport == "true") {
						var	bracket1 = currentStepInfo.format == "menu" ? "(" : "" ,
							bracket2 = currentStepInfo.format == "menu" ? ")" : "" ;
						authorSupport =  '<span class="hint"> ' + bracket1 + $this.attr("target") + bracket2 + '</hint>';
					}
					
					// is answer given via drop down menu or radio buttons
					if (currentStepInfo.format == "menu") {
						if (i == 0) {
							$thisStep.append('<div class="dropDownAnswer"><select></select></div>');
						}
						
						$thisStep.find("select").append('<option id="opt' + i + '">' + $this.attr("name") + authorSupport + '</option>');
						
						if ($this.attr("selected") == "true") {
							select = i;
							$thisStep.find("select").prop("selectedIndex", select);
							$submitBtn.button("enable");
						}
						
					} else {
						var $parent = $thisStep;
						if (i == 0) {
							$parent = $('<div class="radioAnswers"/>').appendTo($thisStep);
						} else {
							$parent = $thisStep.find(".radioAnswers");
						}
						
						$parent.append('<div><input type="radio" name="option" id="opt' + i + '" value="' + $this.attr("name") + '"/><label class="optionTxt" for="opt' + i + '">' + addLineBreaks($this.attr("name")) + authorSupport + '</label></div>');
						
						if ($this.attr("selected") == "true") {
							$thisStep.find("#opt" + i).prop("checked", true);
							$submitBtn.button("enable");
						}
					}
					
					// store destination in option data
					$thisStep.find("#opt" + i).data({
						"target":		$this.attr("target"),
						"resultTxt":	$this.attr("resultTxt")
					});
				});
				
				// disable $submitBtn when no answer is selected
				if (currentStepInfo.format == "menu") {
					$thisStep.find("select").change(function() {
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
						.change(function() {
							if ($thisStep.find("input:checked").length > 0) {
								$submitBtn.button("enable");
							} else {
								$submitBtn.button("disable");
							}
							$dialog.dialog("close");
						})
						.focusin(function() {
							$(this).parent().addClass("highlight");
						})
						.focusout(function() {
							$(this).parent().removeClass("highlight");
						});
				}
				
			} else if (currentStepInfo.type == "slider") {
				
				// _____ SLIDER _____
				var answerBox = '<input type="text" id="amount"/><label for="amount">' + currentStepInfo.unit + '</label>';
				if (currentStepInfo.unitPos == "start") {
					answerBox = '<label for="amount">' + currentStepInfo.unit + '</label><input type="text" id="amount"/>';
				}
				
				// work out max length of answer string
				var stepDec = currentStepInfo.step.split('.').length > 1 ? currentStepInfo.step.split('.')[1].length : 0,
					minDec = currentStepInfo.min.split('.').length > 1 ? currentStepInfo.min.split('.')[1].length : 0,
					maxDec = currentStepInfo.max.split('.').length > 1 ? currentStepInfo.max.split('.')[1].length : 0;
				var maxDecimals = Math.max(stepDec, minDec, maxDec);
				var inputW = currentStepInfo.max.split('.')[0].length + (maxDecimals > 0 ? 1 + maxDecimals : 0);
				
				var authorSupport = "";
				if (allParams.authorSupport == "true") {
					authorSupport += '<span class="hint">';
					currentStepInfo.options.each(function(i) {
						var $this = $(this);
						authorSupport += "<p>" + $this.attr("min") + " - " + $this.attr("max") + " : " + $this.attr("target") + "</p>";
					});
					authorSupport += '</span>';
				}
				
				$thisStep
					.append('<div id="labelHolder">' + authorSupport + answerBox + '</div><div id="slider"></div>')
					.find("#amount").css("width", inputW + "em");
				
				var $slider = $thisStep.find("#slider"),
					$amount = $thisStep.find("#labelHolder #amount");
				
				$slider.slider({
					value:	Number(currentStepInfo.value),
					min:	Number(currentStepInfo.min),
					max:	Number(currentStepInfo.max),
					step:	Number(currentStepInfo.step),
					slide:	function(event, ui) {
						$amount.val(ui.value);
						
						$dialog.dialog("close");
					}
				})
				
				$amount
					.val($slider.slider("value"))
					.change(function() {
						var value = Number($(this).val()),
							step = Number(currentStepInfo.step),
							min = Number(currentStepInfo.min),
							max = Number(currentStepInfo.max);
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
						$slider.slider({value: value});
						
						$dialog.dialog("close");
					});
				
				$submitBtn.button("enable");
			}
			
			// save reference to this step so it can be reloaded later if needed
			allSteps[currentStepInfo.index].built = $thisStep;
		}
	}
}


// _____ BUILD INFORMATION STEP _____
function setUpI() {
	if (currentStepInfo.built != false && currentStepInfo.collate != "true") {
		
		// _____ INFO ALREADY BUILT - RELOAD IT _____
		$stepHolder.prepend(currentStepInfo.built);
		
		if (currentStepInfo.lastStep == "true") {
			$newBtn.show();
		}
		
		setUpSection(currentStepInfo.section, $stepHolder.children(".step"));
		
	} else {
		
		// _____ BUILD NEW INFO _____
		var icon = "fa-exclamation";
		if (currentStepInfo.faIcon != undefined && currentStepInfo.faIcon != "") {
			icon = "fa-" + currentStepInfo.faIcon;
		}
		
		var authorSupport = "";
		if (allParams.authorSupport == "true") {
			authorSupport =  '<span class="hint">' + currentStepInfo.name + ' </span>';
		}
		
		var mediaInfo = checkForMedia();
		
		$stepHolder.prepend('<div class="step"><span class="fa ' + icon + ' fa-2x pull-left fa-border fa-fw"/><div class="info">' + mediaInfo[0] + authorSupport + addLineBreaks(iFrameCheck(currentStepInfo.text)) + collateResult(currentStepInfo.collate, currentDecision, "html") + '</div></div>');
		
		var $thisStep = $stepHolder.children(".step");
		
		if (mediaInfo[1] != undefined) {
			var $stepMedia = $(".stepAudio, .stepVideo");
			if ($stepMedia.hasClass("stepAudio")) {
				$stepMedia.appendTo($stepMedia.parent());
			}
			window[mediaInfo[1]]($stepMedia, currentStepInfo.img);
		}
		
		if (currentStepInfo.helpTxt != undefined && currentStepInfo.helpTxt != "") {
			setUpHelp($thisStep);
		}
		// can this be the last step? If yes, the option to continue will still be there but the overview can also be viewed too
		if (currentStepInfo.lastStep == "true") {
			$thisStep.append('<a id="viewThisBtn" href="javascript:viewThisClickFunct()" class="floatL">' + allParams.viewThisBtn + '</a>');
			$newBtn.show();
		}
		setUpSection(currentStepInfo.section, $stepHolder.children(".step"));
		
		// save reference to this step so it can be reloaded later if needed
		allSteps[currentStepInfo.index].built = $stepHolder.children(".step");
	}
	
	$submitBtn
		.show()
		.button("enable");
}


// _____ BUILD RESULT STEP _____
function setUpR() {
	if (currentStepInfo.built != false && currentStepInfo.collate != "true") {
		
		// _____ RESULT ALREADY BUILT - RELOAD IT _____
		$stepHolder.prepend(currentStepInfo.built);
		
		$newBtn.show();
		
		setUpSection(currentStepInfo.section, $stepHolder.children(".step"));
		
	} else {
		
		// _____ BUILD NEW RESULT _____
		var icon = "fa-lightbulb-o";
		if (currentStepInfo.faIcon != undefined && currentStepInfo.faIcon != "") {
			icon = "fa-" + currentStepInfo.faIcon;
		}
		
		var authorSupport = "";
		if (allParams.authorSupport == "true") {
			authorSupport =  '<span class="hint">' + currentStepInfo.name + ' </span>';
		}
		
		var resultEndString = "";
		if (allParams.resultEndString != undefined && allParams.resultEndString != "") {
			resultEndString = '<p>' + allParams.resultEndString + '</p>';
		}
		
		var mediaInfo = checkForMedia();
		
		$stepHolder.prepend('<div class="step"><span class="fa ' + icon + ' fa-2x pull-left fa-border fa-fw"/><div class="result">' + mediaInfo[0] + authorSupport + addLineBreaks(iFrameCheck(currentStepInfo.text)) + collateResult(currentStepInfo.collate, currentDecision, "html") + resultEndString + '</div><a id="viewThisBtn" href="javascript:viewThisClickFunct()" class="floatL">' + allParams.viewThisBtn + '</a></div>');
		
		if (mediaInfo[1] != undefined) {
			var $stepMedia = $(".stepAudio, .stepVideo");
			if ($stepMedia.hasClass("stepAudio")) {
				$stepMedia.appendTo($stepMedia.parent());
			}
			window[mediaInfo[1]]($stepMedia, currentStepInfo.img);
		}
		
		$newBtn.show();
		
		setUpSection(currentStepInfo.section, $stepHolder.children(".step"));
		
		// save reference to this step so it can be reloaded later if needed
		allSteps[currentStepInfo.index].built = $stepHolder.children(".step");
	}
	
	$submitBtn.hide();
}

// _____ CREATE IMAGE / AUDIO / VIDEO TO INSERT IN STEP _____
function checkForMedia() {
	var mediaInfo = [],
		alt = currentStepInfo.imgTip != undefined && currentStepInfo.imgTip != "" ? currentStepInfo.imgTip : "";
	
	if (currentStepInfo.img != undefined && currentStepInfo.img != "") {
		// image
		var mediaFile = currentStepInfo.img.toLowerCase();
		if (mediaFile.indexOf(".jpeg") != -1 || mediaFile.indexOf(".jpg") != -1 || mediaFile.indexOf(".gif") != -1 || mediaFile.indexOf(".png") != -1) {
			var css = smallScreen == true ? ' class="stepImg small"' : ' class="stepImg"';
			alt = alt != "" ? ' alt="' + alt + '"' : "";
			mediaInfo.push('<img src="' + evalURL(currentStepInfo.img) + '"' + alt + css + ' />');
			
		// audio
		} else if (mediaFile.indexOf(".mp3") != -1) {
			alt = alt != "" ? ' title="' + alt + '"' : "";
			mediaInfo.push('<div class="stepAudio" ' + alt + '></div>', "loadAudio");
			
		// video
		} else {
			alt = alt != "" ? ' title="' + alt + '"' : "";
			mediaInfo.push('<div class="panel inline"><div class="stepVideo" ' + alt + '></div></div>', "loadVideo");
		}
	} else {
		mediaInfo.push("");
	}
	
	return mediaInfo;
}

function loadVideo($video, src) {
	
	if ($video.data("dimensions") != undefined) {
		$video.css({
			'width': 'auto',
			'min-width': 'auto'
		});
	}
	
	$video.mediaPlayer({
		type: 'video',
		source: src,
		width: $video.data("dimensions") != undefined ? $video.data("dimensions")[0] : undefined,
		height: $video.data("dimensions") != undefined ? $video.data("dimensions")[1] : undefined,
		title: $video.attr('title')
	});
}


function loadAudio($audio, src) {
	$audio.mediaPlayer({
		type: "audio",
		source: src,
		width: "100%"
	});
}

function mediaMetadata(video, wh) {
	
	var $stepVideo = $(video).parents('.stepVideo');
	
	if (wh != undefined) {
		// video isn't a fixed size so set up to be responsive
		if ($stepVideo.data('dimensions') == undefined && $stepVideo.data('iframeRatio') == undefined) {
			// info received about orig size of video - don't show larger than this & keep aspect ratio
			$stepVideo
				.css('max-width', wh[0])
				.data('mediaProp', wh[0] / wh[1]);
		}
	}
	
	sizeChanged();
}


// _____ COLLATE RESULT TEXT FROM STORED STRINGS _____
function collateResult(collate, dec, type) {
	if (collate == "true") {
		var string = "";
		
		for (var i=0; i<storedResultTxt[dec].length; i++) {
			if (storedResultTxt[dec][i] != "" && storedResultTxt[dec][i] != undefined) {
				if (type == "html") {
					string += '<div class="collatedResult">' + addLineBreaks(iFrameCheck(storedResultTxt[dec][i])) + '</div>';
				} else {
					string += '\n\n' + storedResultTxt[dec][i];
				}
			}
		}
		
		return string;
	} else {
		return "";
	}
}


// _____ CALLED WHEN VIEW THIS DECISION BTN CLICKED _____
function viewThisClickFunct() {
	// if overview is clicked from an info step (where it can be a last step) then remove any later history
	if (currentStepInfo.type == "info" && currentStep < decisionHistory[currentDecision].length - 1) {
		decisionHistory[currentDecision] = decisionHistory[currentDecision].splice(0,currentStep + 1);
		storedResultTxt[currentDecision] = storedResultTxt[currentDecision].splice(0,currentStep + 1);
		$fwdBtn.attr("disabled", "disabled");
	}
	
	$overviewHolder.find(".decisionInfo").parent().remove();
	$("#viewAllBtn").remove();
	showHideHolders($overviewHolder);
	
	showDecision(currentDecision);
	
	if (decisionHistory.length > 1) {
		$overviewHolder.append('<a id="viewAllBtn" href="#">' + allParams.viewAllString + '</a>');
	}
	
	$dialog.dialog("close");
	document.getElementById("mainHolder").scrollIntoView();
	
	// _____ VIEW ALL DECISIONS BTN _____
	$("#viewAllBtn")
		.click(function() {
			$overviewHolder.find(".decisionInfo").parent().remove();
			$("#viewAllBtn").remove();
			showHideHolders($overviewHolder);
			
			for (var i=0; i<decisionHistory.length; i++) {
				showDecision(i);
			}
			
			document.getElementById("mainHolder").scrollIntoView();
		});
}


// _____ DISPLAY STEPS TAKEN IN DECISION _____
function showDecision(dec) {
	var string = '<div id="dec' + dec + '">' + createDecStr(dec, "html") + '<a class="detailsBtn" href="#">' + allParams.moreInfoString + '</a></div>'
	
	$overviewHolder.append(string);
	
	$overviewHolder.find(".stepAudio").each(function() {
		loadAudio($(this), $(this).data("src"));
	});
	
	$overviewHolder.find(".stepVideo").each(function() {
		loadVideo($(this), $(this).data("src"));
	});
	
	$(".extraInfo").hide();
	
	// link toggles extraInfo in and out
	$("#dec" + dec + " .detailsBtn")
		.click(function(){
			var $this = $(this);
			if ($this.html() == allParams.moreInfoString) {
				$this.parent().find(".extraInfo").slideDown();
				$this.html(allParams.lessInfoString);
			} else {
				$this.parent().find(".extraInfo").slideUp();
				$this.html(allParams.moreInfoString);
			}
			
			setFooterPosition();
		});
	
	setFooterPosition();
}

// _____ CREATE OVERVIEW STRING FOR EMAIL & OVERVIEW _____
// string is formatted differently depending on whether it's for email or overview shown in browser
function createDecStr(dec, type) {
	var string = "";
	
	if (type == "html") {
		string += '<div class="decisionInfo"><h3>' + allParams.overviewString + " " + (dec + 1) + ':</h3>';
	} else {
		string += allParams.overviewString + " " + (dec + 1) + ':\n';
	}
	
	// add details of each step in decision to string
	for (var i=0; i<decisionHistory[dec].length; i++) {
		var thisStep = findStep(decisionHistory[dec][i].id),
			media = "";
		
		if (type == "html") {
			string += '<div class="overviewStep">';

			// if the step has an image, audio or video get the tag ready to insert
			if (thisStep.img != undefined && thisStep.img != "") {
				var alt = thisStep.imgTip != undefined && thisStep.imgTip != "" ? thisStep.imgTip : "";
				
				// image
				if (thisStep.img.indexOf(".jpeg") != -1 || thisStep.img.indexOf(".jpg") != -1 || thisStep.img.indexOf(".gif") != -1 || thisStep.img.indexOf(".png") != -1) {
					alt = alt != "" ? ' alt="' + alt + '"' : "";
					media = '<img src="' + evalURL(thisStep.img) + '"' + alt + ' class="stepImg" />';
					
				// audio
				} else if (thisStep.img.indexOf(".mp3") != -1) {
					alt = alt != "" ? ' title="' + alt + '"' : "";
					media = '<div class="stepAudio" ' + alt + ' data-src="' + thisStep.img + '"></div>';
					
				// video
				} else {
					alt = alt != "" ? ' title="' + alt + '"' : "";
					media = '<div class="stepVideo" ' + alt + ' data-src="' + thisStep.img + '"></div>';
				}
			}
		}
		
		if (thisStep.type == "mcq" || thisStep.type == "slider") {
			if (type == "html") {
				var icon = "fa-question";
				if (thisStep.faIcon != undefined && thisStep.faIcon != "") {
					icon = "fa-" + thisStep.faIcon;
				}
				string += '<div><span class="fa ' + icon + ' fa-fw"/>' + media + addLineBreaks(iFrameCheck(thisStep.text)) + '</div>';
			} else {
				string += '\n' + thisStep.text;
			}
			
			if (thisStep.type == "mcq") {
				if (type == "html") {
					// include details of answers which weren't chosen too - these will show if 'more' is clicked
					string += '<div class="overviewAnswer"><span class="fa fa-angle-right fa-fw"/>' + addLineBreaks($(thisStep.options[decisionHistory[dec][i].option]).attr("name")) + '</div>';
					string += '<div class="extraInfo"><span class="fa fa-angle-right fa-fw"/>' + allParams.posAnswerString + ': ';
					
					thisStep.options.each(function(j) {
						if (j != decisionHistory[dec][i].option) {
							string += addLineBreaks($(thisStep.options[j]).attr("name"));
							
							if (j+1 == thisStep.options.length || (j+1 == decisionHistory[dec][i].option && j+2 == thisStep.options.length)) {
							} else {
								string += ', ';
							}
						}
					});
					
					string += '</div>';
					
				} else {
					string += '\n > ' + $(thisStep.options[decisionHistory[dec][i].option]).attr("name");
				}
				
			} else if (thisStep.type == "slider") {
				var	answer = decisionHistory[dec][i].option + ' ' + thisStep.unit,
					posAnswer = thisStep.min + ' - ' + thisStep.max + ' ' + thisStep.unit;
				
				if (thisStep.unitPos == "start") {
					answer = thisStep.unit + ' ' + decisionHistory[dec][i].option;
					posAnswer = thisStep.unit + ' ' + thisStep.min + ' - ' + thisStep.max;
				}
				
				if (type == "html") {
					string += '<div class="overviewAnswer"><span class="fa fa-angle-right fa-fw"/>' + answer + '</div>';
					string += '<div class="extraInfo"><span class="fa fa-angle-right fa-fw"/>' + allParams.fromRangeString + ' ' + posAnswer + '</div>';
				} else {
					string += '\n > ' + answer;
				}
				
			}
			
		} else if (thisStep.type == "info") {
			if (type == "html") {
				var icon = "fa-exclamation";
				if (thisStep.faIcon != undefined && thisStep.faIcon != "") {
					icon = "fa-" + thisStep.faIcon;
				}
				string += '<div><span class="fa ' + icon + ' fa-fw"/>' + media + addLineBreaks(iFrameCheck(thisStep.text)) + '</div>';
			} else {
				string += '\n' + thisStep.text;
			}
			string += collateResult(thisStep.collate, dec, type);
			
		} else if (thisStep.type == "result") {
			if (type == "html") {
				var icon = "fa-lightbulb-o";
				if (thisStep.faIcon != undefined && thisStep.faIcon != "") {
					icon = "fa-" + thisStep.faIcon;
				}
				string += '<div><span class="fa ' + icon + ' fa-fw"/>';
			} else {
				string += '\n' + allParams.resultString + ':';
			}
			if (type == "html") {
				string += media + addLineBreaks(iFrameCheck(thisStep.text)) + '</div>';
			} else {
				string += '\n' + thisStep.text;
			}
			string += collateResult(thisStep.collate, dec, type);
		}
		
		if (type == "html") {
			string += '</div>';
		} else {
			string += '\n';
		}
	}
	
	if (type != "html") {
		string += '\n';
		
		if (dec + 1 < decisionHistory.length) {
			string += '-------------------------------------------------\n\n';
		}
	}
	
	return string;
}


// _____ ADD LINK TO MORE INFORMATION FOR STEP _____
function setUpHelp($thisStep) {
	$thisStep.append('<a id="helpBtn" href="#" class="floatL"><span class="fa fa-info-circle fa-lg"></span><span class="alt"></span>' + allParams.helpString + '</a>');
	
	$("#helpBtn").click(function() {
		$dialog.dialog("close");
		
		if ((currentStepInfo.helpTxt.indexOf("http://") == 0 || currentStepInfo.helpTxt.indexOf("https://") == 0) && currentStepInfo.helpTxt.indexOf(" ") == -1) {
			// treat helpString as link - open straight away
			window.open(currentStepInfo.helpTxt);
		} else {
			// show helpString in dialog
			$mainHolder.append('<div id="helpDialog"/>');
			var $helpDialog = $("#helpDialog");
			
			$dialog = $helpDialog
				.dialog({
					closeOnEscape:  true,
					title:		allParams.helpString,
					closeText:	allParams.closeBtn
					})
				.html(addLineBreaks(iFrameCheck(currentStepInfo.helpTxt)));
		}
	});
}


// _____ APPLY SECTION STYLES TO CURRENT STEP _____
function setUpSection(section, $step) {
	// section will be shown
	
	if (section != undefined) {
		
		// correct section div isn't already there
		if (currentSection != section || $headerBlock.find(".section").length == 0) {
			
			$(".section").remove();
			
			// find matching section
			for (var i=0; i<allSections.length; i++) {
				if (allSections[i].name == section) {
					
					currentSection = section;
					
					var $section = $('<div class="section"/>').appendTo($headerBlock);
					
					if (allSections[i].colour != undefined) {
						var col = allSections[i].colour.substr(2);
						while (col.length < 6) {
							col = "0" + col;
						}
						
						var rgbval = parseInt(col, 16),
							brightness = ((rgbval >> 16) * 0.299) + (((rgbval & 65280) >> 8) * 0.587) + ((rgbval & 255) * 0.114),
							txtColour = (brightness > 160) ? "dark" : "light"; // checks whether black or white text is best on bg colour
						
						$section
							.css("background-color", "#" + col)
							.addClass(txtColour);
					}
					
					$section.append('<h3>' + allSections[i].name + '</h3>');
					
					if (allSections[i].img != undefined && allSections[i].img != "") {
						if (allSections[i].img.substr(0,3) == "fa-") {
							// use font awesome icon
							$section.find("h3").prepend('<span class="sectionIcon fa ' + allSections[i].img + '" title="' + allSections[i].name + '"></span>');
						} else {
							$section.find("h3").prepend('<img class="sectionIcon" src="' + evalURL(allSections[i].img) + '" alt="' + allSections[i].name + '"/>');
						}
						
					}
					
					if (allSections[i].description != undefined && allSections[i].description != "") {
						$section
							.addClass("cursorPointer")
							.click(function() {
								$dialog.dialog("close");
								
								$mainHolder.append('<div id="sectionDialog"/>');
								
								var $sectionDialog = $("#sectionDialog");
								
								$dialog = $sectionDialog
									.dialog({
										closeOnEscape:  true,
										title:		allSections[i].name,
										closeText:	allParams.closeBtn
										})
									.html(addLineBreaks(iFrameCheck(allSections[i].description)));
								
								if (allSections[i].img != undefined && allSections[i].img != "") {
									if (allSections[i].img.substr(0,3) == "fa-") {
										$sectionDialog.parent().find(".ui-dialog-title").prepend('<span class="sectionIcon fa ' + allSections[i].img + '" title="' + allSections[i].name + '"/>');
									} else {
										$sectionDialog.parent().find(".ui-dialog-title").prepend('<img class="sectionIcon" src="' + evalURL(allSections[i].img) + '" alt="' + allSections[i].name + '"/>');
									}
								}
							})
							.focusin(function() {
								
							});
					}
					
					break;
				}
			}
		}
	
	// section is just used in organising xml & there's nothing to show for it
	} else {
		$(".section").remove();
		currentSection = undefined;
	}
}


// _____ RETURN STEP WITH REQUESTED ID _____
function findStep(stepID) {
	for (var i=0; i<allSteps.length; i++) {
		if (allSteps[i].name == stepID) {
			var thisStep = allSteps[i];
			thisStep.index = i;
			return thisStep;
		}
	}
	return null;
}


// _____ JUMP TO STEP _____
// can be called from a link, e.g. to jump to a particular step from the introduction page
function jumpToStep(stepID) {
	if (currentStepInfo.type == "result" || (currentStepInfo.type == "info" && currentStepInfo.lastStep == "true")) {
		startNewDecision(stepID);
	} else {
		// remove partially completed workflow from history
		if (currentDecision == 0) {
			currentDecision = undefined;
		} else {
			currentDecision--;
		}
		decisionHistory = decisionHistory.splice(0,decisionHistory.length - 1);
		storedResultTxt = storedResultTxt.splice(0,storedResultTxt.length - 1);
		startNewDecision(stepID);
	}
	
	$dialog.dialog("close");
	document.getElementById("mainHolder").scrollIntoView();
}


// _____ TOGGLE HOLDER VISIBILITY _____
function showHideHolders($show) {
	$introHolder.hide();
	$overviewHolder.hide();
	$stepHolder.hide();
	
	$show.show();
	
	if ($(".stepAudio audio, .stepVideo video").length > 0) {
		$(".stepAudio audio, .stepVideo video").each(function() {
			this.pause();
		});
	}
	
	// remove section div if not required
	if ($show != $stepHolder) {
		$(".section").remove();
	} else {
		setUpSection(currentStepInfo.section, $stepHolder.children(".step"));
		sizeChanged();
	}
	
	setFooterPosition();
}


// _____ MANUALLY SET FOOTER POSITION _____
// so it's always at the bottom - either content or window, which ever is lower
function setFooterPosition() {
	if ($("#footerBlock").length > 0) {
		$mainHolder.addClass("full"); // height 100%
		
		var chHeight = $contentHolder.height() + parseInt($contentHolder.css("padding-top")) + parseInt($contentHolder.css("padding-bottom")),
			hbHeight = $headerBlock.height() + parseInt($headerBlock.css("padding-top")) + parseInt($headerBlock.css("padding-bottom")),
			fbHeight = $footerBlock.height() + parseInt($footerBlock.css("padding-top")) + parseInt($footerBlock.css("padding-bottom")) + parseInt($footerBlock.css("margin-top")),
			mhHeight = $mainHolder.height() + parseInt($mainHolder.css("padding-top")) + parseInt($mainHolder.css("padding-bottom"));
		
		$mainHolder.removeClass("full");
		
		if (chHeight + hbHeight + fbHeight > mhHeight) {
			$footerBlock.css("position", "relative");
		} else {
			$footerBlock.css("position", "absolute");
		}
	}
}


// _____ APPLY CSS FILE TO PAGE _____
function insertCSS(href) {
	// can't do this using media attribute in link tag or the jQuery way as in IE the page won't update with new styles
	var css = document.createElement("link");
	css.rel = "stylesheet";
	css.href = href;
	css.type = "text/css";
	document.getElementsByTagName("head")[0].appendChild(css);
}


// _____ PRESERVE LINE BREAKS IN XML _____
function fixLineBreaks(text) {
	// replace all line breaks in attributes with ascii code - otherwise these are replaced with spaces when parsed to xml
	var	split_up = text.split(/<\!\[CDATA\[|\]\]>/),
		temp, i, j, len, len2;
	
	for (var i=0, len=split_up.length; i<len; i+=2) {
		temp = split_up[i].split('"');
		for (var j=1, len2=temp.length; j<len2; j+=2) {
			temp[j] = temp[j].replace(/(\n|\r|\r\n)/g, "&#10;");
		}
		split_up[i] = temp.join('"');
	}
	
	// Put the CDATA blocks back
	temp = [];
	for (var i=0, len=split_up.length-1; i<len; i+=2) {
		temp.push(split_up[i] + "<![CDATA[" + split_up[i+1]);
	}
	temp.push(split_up[i]);
	
	return temp.join("]]>");
}


// _____ REPLACE LINE BREAKS IN XML WITH HTML WHEN ADDING TO PAGE _____
function addLineBreaks(text) {
	// test to see if it was created in the new editor
	if (allParams.editorVersion && parseInt("0" + allParams.editorVersion, 10) >= 3)
	{
		return text; // Return text unchanged
	}
	// Now try to identify v3beta created LOs
	var trimmedText = $.trim(text);
	if ((trimmedText.indexOf("<p") == 0 || trimmedText.indexOf("<h") == 0) && (trimmedText.lastIndexOf("</p") == trimmedText.length-4 || trimmedText.lastIndexOf("</h") == trimmedText.length-5))
	{
		return text; // Return text unchanged
	}
	
    // Now assume it's v2.1 or before
    if (text.indexOf("<math") == -1 && text.indexOf("<table") == -1) {
        return text.replace(/(\n|\r|\r\n)/g, "<br />");
		
    } else { // ignore any line breaks inside these tags as they don't work correctly with <br>
        var newText = text;
        if (newText.indexOf("<math") != -1) { // math tag found
            var tempText = "",
                mathNum = 0;

            while (newText.indexOf("<math", mathNum) != -1) {
                var text1 = newText.substring(mathNum, newText.indexOf("<math", mathNum)),
                    tableNum = 0;
                while (text1.indexOf("<table", tableNum) != -1) { // check for table tags before/between math tags
                    tempText += text1.substring(tableNum, text1.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                    tempText += text1.substring(text1.indexOf("<table", tableNum), text1.indexOf("</table>", tableNum) + 8);
                    tableNum = text1.indexOf("</table>", tableNum) + 8;
                }
                tempText += text1.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += newText.substring(newText.indexOf("<math", mathNum), newText.indexOf("</math>", mathNum) + 7);
                mathNum = newText.indexOf("</math>", mathNum) + 7;
            }

            var text2 = newText.substring(mathNum),
                tableNum = 0;
            while (text2.indexOf("<table", tableNum) != -1) { // check for table tags after math tags
                tempText += text2.substring(tableNum, text2.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += text2.substring(text2.indexOf("<table", tableNum), text2.indexOf("</table>", tableNum) + 8);
                tableNum = text2.indexOf("</table>", tableNum) + 8;
            }
            tempText += text2.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
            newText = tempText;

        } else if (newText.indexOf("<table") != -1) { // no math tags - so just check table tags
            var tempText = "",
                tableNum = 0;
            while (newText.indexOf("<table", tableNum) != -1) {
                tempText += newText.substring(tableNum, newText.indexOf("<table", tableNum)).replace(/(\n|\r|\r\n)/g, "<br />");
                tempText += newText.substring(newText.indexOf("<table", tableNum), newText.indexOf("</table>", tableNum) + 8);
                tableNum = newText.indexOf("</table>", tableNum) + 8;
            }
            tempText += newText.substring(tableNum).replace(/(\n|\r|\r\n)/g, "<br />");
            newText = tempText;
        }

        return newText;
    }
}


function evalURL(url) {
    if (url == null)
        return null;
    var trimmedURL = $.trim(url);
    if (trimmedURL.indexOf("'") == 0 || trimmedURL.indexOf("+") >= 0) {
        return eval(url)
    } else {
        return url;
    }
}

// Make absolute urls from urls with FileLocation + ' in their strings
function makeURLsAbsolute(html){
    return html.replace(/FileLocation \+ \'([^\']*)\'/g, FileLocation + '$1');
}


// if project is being viewed as https then force iframe src to be https too
function iFrameCheck(txt) {
	// if project is being viewed as https then force iframe src to be https too
	if (window.location.protocol == "https:") {
		function changeProtocol(iframe) {
			if (/src="http:/.test(iframe)){
				iframe = iframe.replace(/src="http:/g, 'src="https:').replace(/src='http:/g, "src='https:");
			}
			return iframe;
		}
		txt = txt.replace(/(<iframe([\s\S]*?)<\/iframe>)/g, changeProtocol);
	}
	
	return txt;
}


$(window).resize(function() {
	sizeChanged();
});

function sizeChanged() {
	if (this.resizeTo) {
		clearTimeout(this.resizeTo);
	}
	this.resizeTo = setTimeout(function() {
		$(this).trigger("resizeEnd");
	}, 200);
	
	var $pageVideo = $(".stepVideo");
	
	// the video isn't a fixed size
	if ($pageVideo.data('dimensions') == undefined) {
		// iframe aspect ratio
		if ($pageVideo.data('iframeRatio') != undefined) {
			// scale the iframe so it stays the right aspect ratio
			var width = $('#contentHolder').width() * (smallScreen == true ? 1 : 0.6);
				height = (width / Number($pageVideo.data('iframeRatio')[0])) * Number($pageVideo.data('iframeRatio')[1]);
			
			$pageVideo.height(height);
		
		// responsive
		} else {
			
			// some divs might need to be manually resized
			var divsToScale = [$('.stepVideo .mejs-video video'), $('.stepVideo .mejs-container'), $('.stepVideo .mejs-mediaelement'), $('.stepVideo .mejs-overlay-play')],
				maxW, minW;
			
			for (var i=0; i<divsToScale.length; i++) {
				if (i == 0) {
					maxW = divsToScale[i].width();
					minW = divsToScale[i].width();
				} else {
					maxW = Math.max(maxW, divsToScale[i].width());
					minW = Math.min(minW, divsToScale[i].width());
				}
			}
			
			if ($('.stepVideo').width() < maxW || $('.stepVideo').width() > minW) {
				for (var i=0; i<divsToScale.length; i++) {
					divsToScale[i].css({
						width: $('.stepVideo').width(),
						height: $('.stepVideo').width() / $('.stepVideo').data('mediaProp'),
						'max-width': $('.stepVideo').width(),
						'max-height': $('.stepVideo').width() / $('.stepVideo').data('mediaProp')
					});
				}
			}
		}
	}
}

$(document).ready(init);