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
var modifyBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		jGetElement(blockid, ".button").show();

		jGetElement(blockid, ".modelTxt") 
			.hide()
			.html("");
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {

	}

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		var answerHeaderTxt = pageXML.getAttribute("answerHeaderTxt");
		if (answerHeaderTxt == undefined) {
			answerHeaderTxt = "Write your answer here:"
		};
		var feedbackBtnTxt = pageXML.getAttribute("feedbackBtnTxt");
		if (feedbackBtnTxt == undefined) {
			feedbackBtnTxt = "Feedback"
		};
		var feedbackBtnTip = pageXML.getAttribute("feedbackBtnTip");
		if (feedbackBtnTip == undefined) {
			feedbackBtnTip = "Feedback"
		};
		let weighting = 1.0;
		if (pageXML.getAttribute("trackingWeight") != undefined) {
			weighting = pageXML.getAttribute("trackingWeight");
		}
		// XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);
		XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "text", weighting);
		var label = "";
		var modelAnswerTxt = "";
		if (pageXML.getAttribute("trackinglabel") != null && pageXML.getAttribute("trackinglabel") != "") {
			label = pageXML.getAttribute("trackinglabel");
		}else {
			label = $("<div>").html(pageXML.getAttribute("name")).text()
		}
		if (pageXML.getAttribute("answer") != null && pageXML.getAttribute("answer") != "") {
			modelAnswerTxt = pageXML.getAttribute("answer");
		}
		var initText = $("<div>").html(pageXML.getAttribute("text")).text()
		var ansText = $("<div>").html(pageXML.getAttribute("prompt")).text()
		var feedbackText = $("<div>").html(pageXML.getAttribute("answer")).text()
		XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'text', label, [], modelAnswerTxt, [], pageXML.getAttribute("grouping"));
		jGetElement(blockid, ".instruction").html(x_addLineBreaks(pageXML.getAttribute("instruction")));
		jGetElement(blockid, ".initText").html(initText);
		jGetElement(blockid, ".answer").html(answerHeaderTxt);
		jGetElement(blockid, ".answerTxt").html(ansText);

		jGetElement(blockid, ".modelTxt").hide();

		jGetElement(blockid, ".button")
			.button({ label: feedbackBtnTxt })
			.click(function () {
				$(this).hide();
				jGetElement(blockid, ".modelTxt")
					.show()
					.html(feedbackText);
				var answerTxt = jGetElement(blockid, ".answerTxt").val();
				result =
				{
					success: (answerTxt.trim() == "" ? false : true),
					score: (answerTxt.trim() == "" ? 0.0 : 100.0)
				};

				XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, [], answerTxt, []);
			});

		x_pageLoaded();
	}
}
