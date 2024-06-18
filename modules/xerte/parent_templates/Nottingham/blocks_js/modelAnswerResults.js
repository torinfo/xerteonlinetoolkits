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
var modelAnswerResultsBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		jGetElement(blockid, ".panelTxt").html(modelAnswerResultsBlock.getData());
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".pageContents .panel");
			//$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
		}
	}

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		var panelWidth = pageXML.getAttribute("panelWidth");
		if (panelWidth == "Small") {
			jGetElement(blockid, ".pageContents .splitScreen").addClass("large");
		} else if (panelWidth == "Large") {
			jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
		} else {
			jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
		}

		// if language attributes aren't in xml will have to use english fall back
		var copyBtnLabel = pageXML.getAttribute("copyBtnLabel");
		if (copyBtnLabel == undefined) {
			copyBtnLabel = "Select Text";
		}
		var copyTxt = pageXML.getAttribute("copypasteinfo");
		if (copyTxt == undefined) {
			copyTxt = "Note: Click the 'Select Text' button to highlight the text on the right and then Ctrl + C to copy this text to the clipboard. You can then paste (Ctrl + V) into another application such as Open Office, Word or an email to save for future reference.";
		}

		jGetElement(blockid, ".textHolder").html(x_addLineBreaks(pageXML.childNodes[0].nodeValue) + '<hr/><div id="copyTxt"><p>' + copyTxt + '</p></div><button id="copyBtn">' + copyBtnLabel + '</button>');

		jGetElement(blockid, ".copyBtn")
			.button({
				label: copyBtnLabel
			})
			.click(function () {
				x_selectText("panelTxt");
				jGetElement(blockid, ".screenReaderInfo").html(x_getLangInfo(x_languageData.find("screenReaderInfo").find("modelAnswerResults")[0], "selected", "") != null ? x_getLangInfo(x_languageData.find("screenReaderInfo").find("modelAnswerResults")[0], "selected", "") : "");
			})
			.focusout(function () {
				jGetElement(blockid, ".screenReaderInfo").html("");
			});

		jGetElement(blockid, ".panelTxt").html(modelAnswerResultsBlock.getData());

		this.sizeChanged(blockid);
		x_pageLoaded();
	}

	// function gets saved data about all modelAnswer pages in the project
	this.getData = function () {
		var dataString = "";
		for (var i = 0; i < x_pageInfo.length; i++) {
			var thisObject = x_pageInfo[i];
			console.log(thisObject);
			if (thisObject.type == "modelAnswer") {
				if (thisObject.savedData != undefined) { // ignores skipped pages
					dataString += thisObject.savedData;
				}
			}
		}
		return dataString;
	}
}
