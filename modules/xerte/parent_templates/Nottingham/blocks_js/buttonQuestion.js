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
var buttonQuestionBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		jGetElement(blockid, ".button").show();
		jGetElement(blockid, ".answer").empty(); // emptied rather than hidden so it's read immediately by screenreaders when text appears
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".pageContents .panel");
			//$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
		}
	}

	this.init = function (blockid) {
		// labelWidth attribute not used as button will be sized automatically
		let pageXML = x_getBlockXML(blockid);
		var panelWidth = pageXML.getAttribute("panelWidth"),
			$splitScreen = jGetElement(blockid, ".pageContents .splitScreen"),
			$textHolder = jGetElement(blockid, ".textHolder");

		if (panelWidth == "Full") {
			jGetElement(blockid, ".pageContents .panel").appendTo(jGetElement(blockid, ".pageContents"));
			$splitScreen.remove();
		} else {
			$textHolder.html(x_addLineBreaks(pageXML.getAttribute("instruction")));
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

		jGetElement(blockid, ".prompt").html(x_addLineBreaks(pageXML.getAttribute("prompt")));
		var btnTxt = pageXML.getAttribute("label");
		if (btnTxt == undefined || btnTxt == "") {
			btnTxt = "Let's See";
		}
		jGetElement(blockid, ".button")
			.button({
				label: btnTxt
			})
			.click(function () {
				$(this).hide();
				jGetElement(blockid, ".answer").html(x_addLineBreaks(pageXML.getAttribute("feedback")));
				x_pageContentsUpdated();
			});

		this.sizeChanged();
		x_pageLoaded();
	}
}
