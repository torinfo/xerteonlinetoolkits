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
	
	langToolsHistory = [],	// array of arrays - each one contains ids & options selected for that langTools
	storedResultTxt	= [],	// array of arrays - each one contains text stored until presented as a collated result (optional)
	currentLangTools,
	currentStep,
	currentStepInfo,
	currentSection,
	
	languageData	= [],
	x_theme 		= "default",
	x_volume        = 1,
	x_audioBarH     = 30,
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
	$.ajax({
		type: "GET",
		url: projectXML,
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

			genConfig(allParams);

			//NOUD vanaf hier is allParams gevuld!
			
		},
		error: function() {
			// can't have translation for this as if it fails to load we don't know what language file to use
			$("body").append("<p>The project data has not loaded.</p>");
		}
	});
}

//NOUD Neem me niet kwalijk.
//Het is een heel rushed POC. Dit zou natuurlijk niet zo gebeuren, maar voor nu het werkt lol.
function genConfig(pars)
{
	debugger;
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

// Make absolute urls from urls with FileLocation + ' in their strings
function makeURLsAbsolute(html){
    return html.replace(/FileLocation \+ \'([^\']*)\'/g, FileLocation + '$1');
}

$(document).ready(init);