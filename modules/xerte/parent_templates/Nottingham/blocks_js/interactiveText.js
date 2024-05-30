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
var interactiveTextBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		jGetElement(blockid, ".pageContents").data("currentGroup", -1);
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");

		jGetElement(blockid, ".passage .group").removeClass("on");
		for (var group = 0; group < groupInfo.length; group++)
			jGetElement(blockid, ".passage span").removeClass("wrongOn" + group);
		jGetElement(blockid, ".groupInfo")
			.html("")
			.removeAttr("tabindex");
		jGetElement(blockid, ".btnHolder .listItem").removeClass("highlight");

		if (pageXML.getAttribute("interactivity") == "explore") {
			jGetElement(blockid, ".showBtn").hide();
		} else if (pageXML.getAttribute("interactivity") == "show2") {
			jGetElement(blockid, ".prevBtn").button("disable");
			jGetElement(blockid, ".nextBtn").button("enable");
		} else if (pageXML.getAttribute("interactivity") == "mcq") {
			//this.createQuiz(blockid);
		} else if (pageXML.getAttribute("interactivity") == "find" || pageXML.getAttribute("interactivity") == "find2") {
			jGetElement(blockid, ".feedback").hide();

			/*
				This was here, I'm not sure why you would delete the progress of a user when they change pages
				I kept it in this comment because there might be a good reason I don't know.
			jGetElement(blockid, ".pageContents").data({
				"found" : [],
				"wrongFound": [],
				"complete" : []
			});
			this.setUpFind(false);
			*/
		}
	};

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {

	};

	this.leavePage = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		const mcqAnswers = jGetElement(blockid, ".pageContents").data("mcqAnswers");
		var numQs = pageXML.getAttribute("mcqNumQs") == undefined || pageXML.getAttribute("mcqNumQs") == "*" ? mcqAnswers.length : isNaN(pageXML.getAttribute("mcqNumQs")) ? mcqAnswers.length : Number(pageXML.getAttribute("mcqNumQs"));
		if (jGetElement(blockid, ".pageContents").data("checked") && (numQs > 0 || pageXML.getAttribute("interactivity") == "find2")) {
			interactiveTextBlock.finishTracking(blockid);
		}
	};

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		let interactionText = x_addLineBreaks(pageXML.getAttribute("passage"));
		jGetElement(blockid, ".pageContents").data({
			openTagInfo: [],
			groupInfo: [],
			subGroups: [],
			mcqAnswers: [],
			mcqAnswerOptions: [],
			currentGroup: -1,
			tempTxtPos: 0,
			tempTag: -1,
			interactionText: interactionText,
			tempTxt: "",
			tabIndex: 2,
			mcqCurrentQ: null,
		});
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		const subGroups = jGetElement(blockid, ".pageContents").data("subGroups");

		if (pageXML.getAttribute("text") != undefined && pageXML.getAttribute("text") != "") {
			jGetElement(blockid, ".pageTxt").html(x_addLineBreaks(pageXML.getAttribute("text")));
		} else {
			jGetElement(blockid, ".pageTxt").remove();
		}

		// layout
		if (pageXML.getAttribute("panelWidth") != "full") { // text to go on left with panel on right
			if (x_browserInfo.mobile != true) {
				jGetElement(blockid, ".passageHolder")
					.addClass("inline")
					.css("float", "right");
			} else {
				jGetElement(blockid, ".passageHolder")
					.addClass("mobileInline")
					.insertAfter(jGetElement(blockid,".pageTxt"));
			}
			if (pageXML.getAttribute("panelWidth") == "small") {
				jGetElement(blockid, ".passageHolder").addClass("width40");
			} else if (pageXML.getAttribute("panelWidth") == "large") {
				jGetElement(blockid, ".passageHolder").addClass("width80");
			} else {
				jGetElement(blockid, ".passageHolder").addClass("width60");
			}
		} else { // text above
			jGetElement(blockid, ".passageHolder").insertAfter(jGetElement(blockid, ".instructions"));
		}

		var groupStyles = "<style type='text/css'>";
		var illegalDelims = [];

		// get group info
		for (var i = 0; i < pageXML.childNodes.length; i++) {
			if ("&<>;".indexOf(pageXML.childNodes[i].getAttribute("delimiter")) != -1) {
				illegalDelims.push(pageXML.childNodes[i].getAttribute("delimiter"));
			} else {
				var group = new Object();
				for (var j = 0; j < pageXML.childNodes[i].attributes.length; j++) {
					group[pageXML.childNodes[i].attributes[j].name] = pageXML.childNodes[i].attributes[j].value;
				}
				group.numSubGroups = 0;
				groupInfo.push(group);

				var bgColour = x_getColour(group.bgColour);
				var textDeco = "none";

				groupStyles += " .group" + i + ".on {color:" + x_blackOrWhite(bgColour) + "; background-color:" + bgColour + "; " + "border-radius: 2px ;}";
				if (pageXML.getAttribute("interactivity") == "find") {
					bgColour = 'red';
					textDeco = "line-through";
				}

				groupStyles += ".wrongOn" + i + "  {color:" + x_blackOrWhite(bgColour) + "; background-color:" + bgColour + "; " + "text-decoration: " + textDeco + ";" + "border-radius: 2px; padding-top: 5px}";

				if (pageXML.getAttribute("highlight") == "true") {

					jGetElement(blockid, ".pageContents").addClass("line");
					groupStyles += " .group" + i + " {border-bottom: 2px solid " + x_getColour(group.bgColour) + ";} ";
				}
			}
		}

		groupStyles += ".pageContents a.listItem:link, .passageHolder a.listItem:visited, .passageHolder a.listItem:hover, .passageHolder a.listItem:active { color: " + $x_body.css("color") + "; } ";
		groupStyles += "</style>";
		jGetElement(blockid, ".pageContents").prepend($(groupStyles));

		if (illegalDelims.length > 0) {
			var str1 = "",
				str2 = "";
			for (var i = 0; i < illegalDelims.length; i++) {
				if (i > 0) {
					if (i != illegalDelims.length - 1) {
						str1 += ", " + illegalDelims[i];
					} else if (i == illegalDelims.length - 1) {
						str2 += illegalDelims[i];
					}
				} else {
					str1 += illegalDelims[i];
				}
			}
			var delimiterErrorMsg = illegalDelims.length > 1 ? (pageXML.getAttribute("delimiterErrorMsg") != undefined ? pageXML.getAttribute("delimiterErrorMsg") : "Error: The delimiters {n} and {m} are not allowed.") : (pageXML.getAttribute("delimiterErrorMsg2") != undefined ? pageXML.getAttribute("delimiterErrorMsg2") : "Error: The delimiter {n} is not allowed.");
			delimiterErrorMsg = delimiterErrorMsg.replace("{n}", str1).replace("{m}", str2);
			jGetElement(blockid, ".pageContents").prepend('<p class="alert">' + delimiterErrorMsg + '</p>');
		}

		// get info about position of every delimiter in every group - create subgroups from these with an opening & closing delimiter
		for (var i = 0; i < groupInfo.length; i++) {
			var temp = interactionText,
				index = 0,
				open = true,
				count = 0;

			if (temp.indexOf(groupInfo[i].delimiter) != -1) {
				while (temp.indexOf(groupInfo[i].delimiter) != -1) {
					var tempIndex = temp.indexOf(groupInfo[i].delimiter);
					index = index + tempIndex;

					if (!(groupInfo[i].delimiter == "#" && temp.indexOf("&#") != -1 && temp.indexOf("&#") + 1 == tempIndex)) { // ignore if fits this as it's likely to be a html code not delimiter
						if (open == true) {
							var subGroup = new Object({
								delim: groupInfo[i].delimiter,
								open: index,
								ref: i,
								overlap: []
							});
							subGroups.push(subGroup);

							count++;
							open = false;
						} else {
							subGroups[subGroups.length - 1].close = index;
							open = true;

						}
					}

					temp = temp.substring(tempIndex + groupInfo[i].delimiter.length);
					index += groupInfo[i].delimiter.length;
				}

				// if the last delimiter isn't closed then ignore it
				if (subGroups[subGroups.length - 1].close == undefined) {
					subGroups.pop();
					count--;
				}
			}

			groupInfo[i].numSubGroups = count;
		}

		// distractors are only relevant in the find interactions
		var findUseDistractors = (pageXML.getAttribute("findUseDistractors") != undefined ? pageXML.getAttribute("findUseDistractors") === "true" : false);
		if (findUseDistractors && pageXML.getAttribute("interactivity") == "find" || pageXML.getAttribute("interactivity") == "find2") {
			var findDistractorDelimiter = (pageXML.getAttribute("findDistractorDelimiter") != undefined && pageXML.getAttribute("findDistractorDelimiter").length < 4 ? pageXML.getAttribute("findDistractorDelimiter") : "");
			if (findDistractorDelimiter != "") {
				var group = new Object();
				group['name'] = '#distractor#';

				group.numSubGroups = 0;
				var temp = interactionText,
					index = 0,
					open = true,
					count = 0;

				if (temp.indexOf(findDistractorDelimiter) != -1) {
					while (temp.indexOf(findDistractorDelimiter) != -1) {
						var tempIndex = temp.indexOf(findDistractorDelimiter);
						index = index + tempIndex;

						if (!(findDistractorDelimiter == "#" && temp.indexOf("&#") != -1 && temp.indexOf("&#") + 1 == tempIndex)) { // ignore if fits this as it's likely to be a html code not delimiter
							if (open == true) {
								var subGroup = new Object({
									delim: findDistractorDelimiter,
									open: index,
									ref: i,
									overlap: []
								});
								subGroups.push(subGroup);

								count++;
								open = false;
							} else {
								subGroups[subGroups.length - 1].close = index;
								open = true;

							}
						}

						temp = temp.substring(tempIndex + findDistractorDelimiter.length);
						index += findDistractorDelimiter.length;
					}

					// if the last delimiter isn't closed then ignore it
					if (subGroups[subGroups.length - 1].close == undefined) {
						subGroups.pop();
						count--;
					}
				}

				group.numSubGroups = count;
				groupInfo.push(group);
			}
		}
		// sort subgroups by opening tag position
		subGroups.sort(function (a, b) { return a.open - b.open; });

		// check for any overlaps within subgroups (because spans can't overlap we will need to add some extra tags in to display them properly)
		for (var i = 0; i < subGroups.length; i++) {
			var thisOpen = subGroups[i].open,
				thisClose = subGroups[i].close;

			for (var j = 0; j < subGroups.length - (i + 1); j++) { // check against every subsequent subgroups
				var thatOpen = subGroups[j + i + 1].open,
					thatClose = subGroups[j + i + 1].close;

				if (thisOpen < thatOpen && thisClose > thatOpen && thisClose < thatClose) {
					subGroups[i].overlap.push(j + i + 1);
				}
			}
		}
		let tabIndex = jGetElement(blockid, ".pageContents").data("tabIndex");
		if (pageXML.getAttribute("interactivity") == "show" || pageXML.getAttribute("interactivity") == "find" || pageXML.getAttribute("interactivity") == "find2") {
			tabIndex = tabIndex + groupInfo.length;
		} else if (pageXML.getAttribute("interactivity") == "mcq") {
			tabIndex--;
			jGetElement(blockid, ".instructions").remove();
		}
		jGetElement(blockid, ".pageContents").data("tabIndex", tabIndex);

		let tempTxtPos = jGetElement(blockid, ".pageContents").data("tempTxtpos");
		let tempTxt = jGetElement(blockid, ".pageContents").data("tempTxt");
		// insert span tags into interactionText
		while (tempTxtPos != interactionText.length) {
			this.createTags(blockid);
			tempTxtPos = jGetElement(blockid, ".pageContents").data("tempTxtpos");
			tempTxt = jGetElement(blockid, ".pageContents").data("tempTxt");
			tabIndex = jGetElement(blockid, ".pageContents").data("tabIndex");
		}
		interactionText = tempTxt;
		jGetElement(blockid, ".pageContents").data("interactionText", interactionText);

		jGetElement(blockid, ".passage").html(interactionText);

		if (pageXML.getAttribute("interactivity") == "find" || pageXML.getAttribute("interactivity") == "find2") {
			// Make every regular word a span so that they can be counted as wrong answers
			let findAllowSelectionOfAllWords = (pageXML.getAttribute("findAllowSelectionOfAllWords") != undefined ? pageXML.getAttribute("findAllowSelectionOfAllWords") === "true" : false);

			jGetElement(blockid, ".pageContents").data("findAllowSelectionOfAllWords", findAllowSelectionOfAllWords);

			if (findAllowSelectionOfAllWords) {
				var passage = jGetElement(blockid, ".passage").children("p");
				for (var p = 0; p < passage.length; p++) {
					var passageArray = passage[p].childNodes;
					for (var i = 0; i < passageArray.length; i++) {
						if (passageArray[i].nodeName == "#text") {
							var textArray = passageArray[i].textContent.split(/(\s+)/);
							var newNodeArray = [];
							for (var j = 0; j < textArray.length; j++) {
								if ($.trim(textArray[j]) != '') {
									var newNode = document.createElement('SPAN');
									newNode.innerHTML = textArray[j];
									newNode.className += 'wrongWord';
									newNodeArray.push(newNode);
								} else {
									var newNode = document.createTextNode(textArray[j]);
									newNodeArray.push(newNode);
								}
							}
							for (var k = 0; k < newNodeArray.length; k++) {
								passage[p].insertBefore(newNodeArray[k], passageArray[i + k])
							}
							i += newNodeArray.length;
							passageArray[i].remove();
						}
					}
				}
			}


			correctOptions = [];
			correctAnswers = [];
			var index = 0;
			jGetElement(blockid, ".passage span").each(function () {
				var span = $(this);
				span.attr("data-index", index);
				span.attr("tabindex", tabIndex + index);

				if (span.hasClass("group")) {
					var groupNumber = parseInt(span.attr("class")[span.attr("class").length - 1]);
					var groupName = groupInfo[groupNumber].name;
					if (correctOptions[groupNumber] === undefined) {
						correctAnswers[groupNumber] = [];
						correctOptions[groupNumber] = [];
					}

					correctOptions[groupNumber].push(
						{
							id: span.attr("data-index"),
							answer: span.text(),
							result: true
						}
					);
					correctAnswers[groupNumber].push(span.text() + "<br>");
				}
				index++;
			});
			tabIndex += index;

			if (pageXML.getAttribute("interactivity") == "find2") {
				// Track the page
				this.weighting = 1.0;
				if (pageXML.getAttribute("trackingWeight") != undefined) {
					this.weighting = pageXML.getAttribute("trackingWeight");
				}
				//XTSetPageType(x_currentPage, 'numeric', groupInfo.filter(gi => gi.name !== '#distractor#').length, this.weighting);
				XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "numeric", this.weighting, 0)
				for(let i = 1; i < groupInfo.filter(gi => gi.name !== '#distractor#').length; i++){
					XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "numeric", this.weighting, i)
				}
				XTSetLeavePage(x_currentPage, x_getBlockNr(blockid), interactiveTextBlock.leavePage);
			}
		}

		jGetElement(blockid, ".pageContents").data({
			"groupInfo": groupInfo,
			"subGroups": subGroups
		});
		this.setUpInteraction(blockid);

		x_pageLoaded();
	};

	this.createTags = function (blockid) {
		const openTagInfo = jGetElement(blockid, ".pageContents").data("openTagInfo");
		const subGroups = jGetElement(blockid, ".pageContents").data("subGroups");
		let tempTag = jGetElement(blockid, ".pageContents").data("tempTag");
		let tempTxtPos = jGetElement(blockid, ".pageContents").data("tempTxtpos");
		let tempTxt = jGetElement(blockid, ".pageContents").data("tempTxt");
		let tabIndex = jGetElement(blockid, ".pageContents").data("tabIndex");
		let interactionText = jGetElement(blockid, ".pageContents").data("interactionText");

		if (openTagInfo.length == 0) { // there are no tags currently open...
			if (subGroups.length - 1 == tempTag) { // ...no more tags to add
				tempTxt += interactionText.substring(tempTxtPos);
				tempTxtPos = interactionText.length;

			} else { // ...insert next tag
				this.openTag(blockid);
				tempTag = jGetElement(blockid, ".pageContents").data("tempTag");
				tempTxtPos = jGetElement(blockid, ".pageContents").data("tempTxtpos");
				tempTxt = jGetElement(blockid, ".pageContents").data("tempTxt");
				tabIndex = jGetElement(blockid, ".pageContents").data("tabIndex");
			}

		} else { // there are some tags already open...
			var toClose = openTagInfo[0];
			for (var i = 0; i < openTagInfo.length - 1; i++) {
				toClose = subGroups[openTagInfo[i + 1]].close < subGroups[toClose].close ? openTagInfo[i + 1] : toClose;
			}

			if (subGroups.length - 1 == tempTag || subGroups[toClose].close < subGroups[tempTag + 1].open) { // ...close a tag (ensuring no overlapping tags)
				tempTxt += interactionText.substring(tempTxtPos, subGroups[toClose].close);
				for (var j = 0; j < subGroups[toClose].overlap.length; j++) {
					tempTxt += '</span>';
				}
				tempTxt += '</span>';
				tempTxtPos = subGroups[toClose].close + subGroups[toClose].delim.length;
				for (var j = 0; j < subGroups[toClose].overlap.length; j++) {
					tabIndex++;
					tempTxt += '<span class="group' + subGroups[subGroups[toClose].overlap[j]].ref + '" data-index="' + subGroups[toClose].overlap[j] + '" tabindex="' + tabIndex + '">';
				}
				debugger;
				jGetElement(blockid, ".pageContents").data("openTagInfo", jQuery.grep(openTagInfo, function (value) {
					return value != toClose;
				}));

			} else { //...open another tag
				this.openTag(blockid);
			}
		}
		jGetElement(blockid, ".pageContents").data("tempTxtpos", tempTxtPos);
		jGetElement(blockid, ".pageContents").data("tempTxt", tempTxt);
		jGetElement(blockid, ".pageContents").data("tabIndex", tabIndex);
	};

	this.openTag = function (blockid) {
		const openTagInfo = jGetElement(blockid, ".pageContents").data("openTagInfo");
		const subGroups = jGetElement(blockid, ".pageContents").data("subGroups");
		let tempTag = jGetElement(blockid, ".pageContents").data("tempTag");
		let tempTxtPos = jGetElement(blockid, ".pageContents").data("tempTxtpos");
		let tempTxt = jGetElement(blockid, ".pageContents").data("tempTxt");
		let interactionText = jGetElement(blockid, ".pageContents").data("interactionText");
		let tabIndex = jGetElement(blockid, ".pageContents").data("tabIndex");
		tabIndex++;
		tempTag++;
		tempTxt += interactionText.substring(tempTxtPos, subGroups[tempTag].open);
		tempTxt += '<span class="group group' + subGroups[tempTag].ref + '" data-index="' + tempTag + '" tabindex="' + tabIndex + '">';
		tempTxtPos = subGroups[tempTag].open + subGroups[tempTag].delim.length;
		openTagInfo.push(tempTag);
		jGetElement(blockid, ".pageContents").data("tempTag", tempTag);
		jGetElement(blockid, ".pageContents").data("tempTxtpos", tempTxtPos);
		jGetElement(blockid, ".pageContents").data("tempTxt", tempTxt);
		jGetElement(blockid, ".pageContents").data("tabIndex", tabIndex);
	};

	this.setUpInteraction = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		const subGroups = jGetElement(blockid, ".pageContents").data("subGroups");
		var intType = pageXML.getAttribute("interactivity");
		let lang2 = x_getLangInfo(x_languageData.find("interactions").find("moreInfoItem")[0], "selected", "Selected");
		let lang1 = x_getLangInfo(x_languageData.find("interactions").find("moreInfoItem")[0], "moreInfo", "Press space to learn more");
		let tabIndex = jGetElement(blockid, ".pageContents").data("tabIndex");
		jGetElement(blockid, ".pageContents").addClass(intType);
		// --- EXPLORE ---
		// click any subgroup - you then get info about the group it falls into, with the option of showing all related subgroups
		if (intType == "explore") {
			$('<button class="showBtn"></button>')
				.appendTo(jGetElement(blockid, ".btnHolder"))
				.hide();
			var instructions = pageXML.getAttribute("exploreTxt") != undefined ? pageXML.getAttribute("exploreTxt") : "Explore the text. Click on a section to learn more.";
			jGetElement(blockid, ".instructions").html('<p>' + instructions + '</p>');

			jGetElement(blockid, ".questionHolder").hide();

			jGetElement(blockid, ".passage").click(function (e) {
				var $this = $(this);
				$this.find(".group")
					.removeClass("on")
					.removeAttr("title");

				if ($(e.target).hasClass("group")) {
					var clicked = $.merge($(e.target), $(e.target).parents(".group"));
					interactiveTextBlock.clickExplore(blockid, $(clicked[0]));

				} else {
					jGetElement(blockid, ".pageContents").data("currentGroup", -1);
					jGetElement(blockid, ".groupInfo")
						.html("")
						.removeAttr("tabindex");
					jGetElement(blockid, ".showBtn").hide();
				}
			});

			jGetElement(blockid, ".passage .group")
				.focusin(function (e) {
					var $this = $(this);
					$this.addClass("highlight");

					if (!$this.hasClass("on")) {
						$(this).attr("title", lang1);
					}
				})
				.focusout(function () {
					var $this = $(this);
					$this.removeClass("highlight");

					if (!$this.hasClass("on")) {
						$this.removeAttr("title");
					}
				})
				.keypress(function (e) {
					var charCode = e.charCode || e.keyCode;
					if (charCode == 32) {
						jGetElement(blockid, ".passage").find(".group")
							.removeClass("on")
							.removeAttr("title");

						interactiveTextBlock.clickExplore(blockid, $(this));
					}
				});

			jGetElement(blockid, ".showBtn")
				.button({
					label: (pageXML.getAttribute("showBtnTxt") != undefined ? pageXML.getAttribute("showBtnTxt") : "Show All")
				}).click(function () {
					jGetElement(blockid, ".passage .group" + jGetElement(blockid, ".pageContents").data("currentGroup"))
						.addClass("on")
						.attr("title", lang2 + ": " + groupInfo[jGetElement(blockid, ".pageContents").data("currentGroup")].name);

					$(this).hide();
				});


			// --- SHOW ME (BY NAME) ---
			// group names are shown and subgroups are highlighted when a group is selected
		} else if (intType == "show") {
			jGetElement(blockid, ".questionHolder").hide();
			jGetElement(blockid, ".instructions").html('<p>' + (pageXML.getAttribute("showMeTxt2") != undefined ? pageXML.getAttribute("showMeTxt2") : "Click a group to learn more.") + '</p>');

			var $btnHolder = jGetElement(blockid, ".btnHolder");
			$btnHolder.insertBefore(jGetElement(blockid, ".passage"));

			for (var i = 0; i < groupInfo.length; i++) {
				var $groupBtn = $('<a/>');
				$groupBtn
					.addClass("listItem")
					.html(groupInfo[i].name)
					.attr({
						"tabindex": jGetElement(blockid, ".passage .group:eq(0)").attr("tabindex") - groupInfo.length + i,
						"href": "#"
					})
					.data("index", i);

				$btnHolder.append($groupBtn);
			}

			$btnHolder.find(".listItem")
				.click(function (e) {
					e.preventDefault();

					var index = $(this).data("index");

					if (jGetElement(blockid, ".pageContents").data("currentGroup") != index) {
						jGetElement(blockid, ".btnHolder .listItem.highlight").removeClass("highlight");
						jGetElement(blockid, ".passage .group")
							.removeClass("on")
							.removeAttr("title");

						$(this).addClass("highlight");
						jGetElement(blockid, ".passage .group" + index)
							.addClass("on")
							.attr("title", lang2 + ": " + groupInfo[index].name);

						jGetElement(blockid, ".groupInfo")
							.hide()
							.html('<h3>' + groupInfo[index].name + '</h3>' + x_addLineBreaks(groupInfo[index].text))
							.attr("tabindex", tabIndex++)
							.fadeIn();

						jGetElement(blockid, ".pageContents").data("currentGroup", index);
						x_pageContentsUpdated();
					}
				});


			// --- SHOW ME (IN ORDER) ---
			// next/prev buttons show details of each group in turn, highlighting relevant subgroups
		} else if (intType == "show2") {
			jGetElement(blockid, ".questionHolder").hide();
			jGetElement(blockid, ".instructions").html('<p>' + (pageXML.getAttribute("showMeTxt") != undefined ? pageXML.getAttribute("showMeTxt") : "Click the arrow buttons to learn more.") + '</p>');
			jGetElement(blockid, ".btnHolder")
				.html('<button class="prevBtn"></button><button class="nextBtn"></button>')
				.insertAfter(jGetElement(blockid, ".passage"));

			var btnTxt = [
				pageXML.getAttribute("nextTxt") != undefined ? pageXML.getAttribute("nextTxt") : "Next",
				pageXML.getAttribute("prevTxt") != undefined ? pageXML.getAttribute("prevTxt") : "Previous"
			];

			jGetElement(blockid, ".nextBtn")
				.button({
					icons: {
						primary: "fa fa-x-next"
					},
					label: btnTxt[0],
					text: false,
					disabled: (groupInfo.length == 0)
				})
				.click(function () {
					var currentGroup = jGetElement(blockid, ".pageContents").data("currentGroup");
					currentGroup++;

					jGetElement(blockid, ".passage .group")
						.removeClass("on")
						.removeAttr("title");

					jGetElement(blockid, ".passage .group" + currentGroup)
						.addClass("on")
						.attr("title", lang2 + ": " + groupInfo[currentGroup].name);

					jGetElement(blockid, ".groupInfo")
						.hide()
						.html('<h3>' + groupInfo[currentGroup].name + '</h3>' + x_addLineBreaks(groupInfo[currentGroup].text))
						.attr("tabindex", tabIndex + 3)
						.fadeIn();

					if (currentGroup == groupInfo.length - 1) {
						$(this).button("disable");
					}
					jGetElement(blockid, ".prevBtn").button("enable");

					jGetElement(blockid, ".pageContents").data("currentGroup", currentGroup);
					x_pageContentsUpdated();
				})
				.attr("tabindex", tabIndex + 1);

			jGetElement(blockid, ".prevBtn")
				.button({
					icons: {
						primary: "fa fa-x-prev"
					},
					label: btnTxt[1],
					text: false,
					disabled: true
				})
				.click(function () {
					var currentGroup = jGetElement(blockid, ".pageContents").data("currentGroup");
					currentGroup--;
					jGetElement(blockid, ".passage .group")
						.removeClass("on")
						.removeAttr("title");

					if (currentGroup == -1) {
						$(this).button("disable");
						jGetElement(blockid, ".groupInfo")
							.html("")
							.removeAttr("tabindex");
					} else {
						jGetElement(blockid, ".passage .group" + currentGroup)
							.addClass("on")
							.attr("title", lang2 + ": " + groupInfo[currentGroup].name);

						jGetElement(blockid, ".groupInfo")
							.hide()
							.html('<h3>' + groupInfo[currentGroup].name + '</h3>' + x_addLineBreaks(groupInfo[currentGroup].text))
							.attr("tabindex", tabIndex + 3)
							.fadeIn();
					}
					jGetElement(blockid, ".nextBtn").button("enable");

					jGetElement(blockid, ".pageContents").data("currentGroup", currentGroup);
					x_pageContentsUpdated();
				})
				.attr("tabindex", tabIndex + 2);


			// --- FIND ---
			// select a group and then click to find all of its subgroups
		} else if (intType == "find" || intType == "find2") {
			if (intType == "find") {
				jGetElement(blockid, ".pageContents").data({
					"found": [],
					"wrongFound": [],
					"complete": [],
					"findTxt2": pageXML.getAttribute("findTxt2") != undefined ? pageXML.getAttribute("findTxt2") : "You have found {i} of {n}"
				});
			} else {
				jGetElement(blockid, ".pageContents").data({
					"found": [],
					"wrongFound": [],
					"complete": [],
					"findTxt2": pageXML.getAttribute("findTxt22") != undefined ? pageXML.getAttribute("findTxt22") : "You have selected {i} of {n}"
				});
			}

			var $btnHolder = jGetElement(blockid, ".btnHolder");
			$btnHolder.insertBefore(jGetElement(blockid, ".passage"));
			jGetElement(blockid, ".questionHolder").hide();

			var count = this.setUpFind(blockid, true);

			jGetElement(blockid, ".feedback")
				.insertAfter(jGetElement(blockid, ".passage"))
				.attr("tabindex", tabIndex + 1);

			//If the type is Find(Mark at End), add a button to let the user finish up
			if (intType == "find2") {
				$("<div class='buttonHolder'><button disabled class='markAtEnd'>Check</button></div>").insertBefore(jGetElement(blockid, ".feedback"));
				var markAtEndLabel = pageXML.getAttribute("findCheckTxt") != undefined ? pageXML.getAttribute("findCheckTxt") : "Check";
				jGetElement(blockid, ".markAtEnd").button({
					label: markAtEndLabel,
					disabled: true
				});
			}

			// there's only one group marked up - no need for listItems
			if (count == 1) {
				var currentGroup = jGetElement(blockid, ".btnHolder .listItem").data("index");
				jGetElement(blockid, ".btnHolder .listItem").remove();
				jGetElement(blockid, ".instructions").html('<p>' + (pageXML.getAttribute("findTxt3") != undefined ? pageXML.getAttribute("findTxt3") : "Can you find all of the examples?") + '</p>');

				jGetElement(blockid, ".groupInfo")
					.hide()
					.html('<h3>' + groupInfo[currentGroup].name + '</h3>' + x_addLineBreaks(groupInfo[currentGroup].text))
					.attr("tabindex", tabIndex + 2)
					.fadeIn();

				if (intType == "find") {
					jGetElement(blockid, ".feedback")
						.html('<p>' + jGetElement(blockid, ".pageContents").data("findTxt2")
							.replace("{i}", jGetElement(blockid, ".pageContents").data("found")[currentGroup].length)
							.replace("{n}", groupInfo[currentGroup].numSubGroups) + '</p>')
						.show();
				} else if (intType == "find2") {
					jGetElement(blockid, ".feedback")
						.html('<p>' + jGetElement(blockid, ".pageContents").data("findTxt2")
							.replace("{i}", jGetElement(blockid, ".pageContents").data("found")[currentGroup].length + jGetElement(blockid, ".pageContents").data("wrongFound")[currentGroup].length)
							.replace("{n}", groupInfo[currentGroup].numSubGroups) + '</p>')
						.show();
				}
				jGetElement(blockid, ".pageContents").data("currentGroup", currentGroup);
			} else {
				jGetElement(blockid, ".instructions").html('<p>' + (pageXML.getAttribute("findTxt") != undefined ? pageXML.getAttribute("findTxt") : "Click a group to begin, then click the text to find all examples.") + '</p>');
			}

			jGetElement(blockid, ".btnHolder .listItem").click(function (e) {
				e.preventDefault();

				var index = $(this).data("index"),
					currentGroup = jGetElement(blockid, ".pageContents").data("currentGroup");

				if (currentGroup != index) {
					currentGroup = index;
					jGetElement(blockid, ".btnHolder .listItem.highlight").removeClass("highlight");
					$(this).addClass("highlight");

					jGetElement(blockid, ".groupInfo")
						.hide()
						.html('<h3>' + groupInfo[index].name + '</h3>' + x_addLineBreaks(groupInfo[index].text))
						.attr("tabindex", tabIndex + 2)
						.fadeIn();

					if ($.inArray(0, jGetElement(blockid, ".pageContents").data("complete")) != -1) {
						if (intType == "find") {
							jGetElement(blockid, ".feedback")
								.html('<p>' + jGetElement(blockid, ".pageContents").data("findTxt2")
									.replace("{i}", jGetElement(blockid, ".pageContents").data("found")[currentGroup].length)
									.replace("{n}", groupInfo[currentGroup].numSubGroups) + '</p>')
								.show();
						} else if (intType == "find2") {
							jGetElement(blockid, ".feedback")
								.html('<p>' + jGetElement(blockid, ".pageContents").data("findTxt2")
									.replace("{i}", jGetElement(blockid, ".pageContents").data("found")[currentGroup].length + jGetElement(blockid, ".pageContents").data("wrongFound")[currentGroup].length)
									.replace("{n}", groupInfo[currentGroup].numSubGroups) + '</p>')
								.show();
						}
					}

					// remove all highlights
					jGetElement(blockid, ".passage .group")
						.removeClass("on")
						.removeAttr("title");

					for (var group = 0; group < groupInfo.length; group++) {
						jGetElement(blockid, ".passage span").removeClass("wrongOn" + group);
					}

					// add correct highlights for this group
					for (var i = 0; i < jGetElement(blockid, ".pageContents").data("found")[index].length; i++) {
						jGetElement(blockid, ".passage .group" + currentGroup + "[data-index=" + jGetElement(blockid, ".pageContents").data("found")[index][i] + "]")
							.addClass("on")
							.attr("title", lang2 + ": " + groupInfo[currentGroup].name);
					}

					for (var i = 0; i < jGetElement(blockid, ".pageContents").data("wrongFound")[index].length; i++) {
						jGetElement(blockid, ".wrongGroup" + currentGroup + "[data-index=" + jGetElement(blockid, ".pageContents").data("wrongFound")[index][i] + "]")
							.addClass("wrongOn" + currentGroup)
					}

					var passageList = jGetElement(blockid, '.passage').children()[0].childNodes;

					jGetElement(blockid, ".pageContents").data("currentGroup", currentGroup);
				}
			});

			jGetElement(blockid, ".passage").click(function (e) {
				interactiveTextBlock.clickFind(blockid, $(e.target))
			});

			let lang3 = x_getLangInfo(x_languageData.find("interactions").find("moreInfoItem")[0], "toSelect", "Press space to select");
			jGetElement(blockid, ".passage .group")
				.focusin(function (e) {
					if (!$(this).hasClass("on")) {
						$(this).attr("title", lang3);
					}
				})
				.focusout(function () {
					if (!$(this).hasClass("on")) {
						$(this).removeAttr("title");
					}
				})
				.keypress(function (e) {
					if (!$(this).hasClass("on")) {
						var charCode = e.charCode || e.keyCode;
						if (charCode == 32) {
							interactiveTextBlock.clickFind(blockid, $(this));
						} else {
							$(this).removeAttr("title");
						}
					}
				});

			jGetElement(blockid, ".markAtEnd").click(function () { interactiveTextBlock.endFindInteraction(blockid); jGetElement(blockid, ".markAtEnd").hide(); });

			// --- MCQ ---
			// quiz asks what is highlighted
		} else if (intType == "mcq") {

			// set up dialog object for later if it hasn't already been set up on another page of this type
			// xenith.js contains the function used for creating/attaching dialogs - x_openDialog()
			var newDialog = true;
			$(x_dialogInfo).each(function (i) {
				if (this.type == "interactiveText") {
					newDialog = false;
				}
			});
			if (newDialog == true) {
				var dialog = new Object();
				dialog.type = "interactiveText";
				dialog.built = false;
				x_dialogInfo.push(dialog);
			}

			// get all fixed strings used in quiz
			var phrases = {},
				langOptions = ["mcqText", "mcqQuesCount", "mcqCorrect", "mcqWrong", "mcqFeedback", "mcqMore", "mcqScore", "mcqBtnTxt", "mcqBtnTxt2", "mcqBtnTxt3"],
				defaultText = ["What is highlighted in the text? Choose from the following options:", "Question {i} of {n}", "That's right.", "No, the correct answer is {i}.", "You have completed the quiz.", "More Information", "You scored {i} / {n}", "Check", "Next", "Restart"];

			for (var i = 0; i < langOptions.length; i++) {
				phrases[langOptions[i]] = pageXML.getAttribute(langOptions[i]) != undefined ? pageXML.getAttribute(langOptions[i]) : defaultText[i];
			}
			jGetElement(blockid, ".pageContents").data("phrases", phrases);


			jGetElement(blockid, ".questionHolder").html('<h3 class="qNum" tabindex="' + (tabIndex + 1) + '"></h3><div class="qText" tabindex="' + (tabIndex + 2) + '"><p>' + phrases.mcqText + '</p></div><div class="optionHolder"></div>');

			jGetElement(blockid, ".feedback")
				.html('<div class="marking"><a class="more" class="fa fa-x-info-circle fa-lg" title="' + phrases.mcqMore + '" href="#"/></div>')
				.appendTo(jGetElement(blockid, ".questionHolder"))
				.attr("tabindex", tabIndex + 3)
				.on("click", ".more", function (e) {
					e.preventDefault();

					var mcqAnswers = jGetElement(blockid, ".pageContents").data("mcqAnswers"),
						mcqCurrentQ = jGetElement(blockid, ".pageContents").data("mcqCurrentQ"),
						correctGroup = pageXML.getAttribute("mcqType") == "all" ? mcqAnswers[mcqCurrentQ] : subGroups[mcqAnswers[mcqCurrentQ]].ref;

					x_openDialog("interactiveText", groupInfo[correctGroup].name, x_getLangInfo(x_languageData.find("closeBtnLabel")[0], "label", "Close"), { left: "center", top: "middle", width: undefined, height: undefined }, x_addLineBreaks(groupInfo[correctGroup].text));
				});

			jGetElement(blockid, ".btnHolder")
				.html('<button class="quizBtn"></button>')
				.appendTo(jGetElement(blockid, ".questionHolder"))
				.after(jGetElement(blockid, ".groupInfo"));

			jGetElement(blockid, ".quizBtn")
				.button()
				.click(function () {
					const mcqAnswers = jGetElement(blockid, ".pageContents").data("mcqAnswers");
					const mcqAnswerOptions = jGetElement(blockid, ".pageContents").data("mcqAnswerOptions");
					var	mcqCurrentQ = jGetElement(blockid, ".pageContents").data("mcqCurrentQ"),
						correct,
						l_options = [],
						l_answer = [],
						l_feedback = [];

					jGetElement(blockid, ".x_popupDialog").parent().detach();

					if ($(this).data("state") == 0) { // check
						var correctGroup = pageXML.getAttribute("mcqType") == "all" ? mcqAnswers[mcqCurrentQ] : subGroups[mcqAnswers[mcqCurrentQ]].ref;

						var $moreInfo = jGetElement(blockid, ".more");
						$moreInfo.remove();

						l_answer.push(mcqAnswerOptions[jGetElement(blockid, ".optionHolder input:checked").val()]['text']);
						l_feedback.push(jGetElement(blockid, ".marking").text().trim());

						jGetElement(blockid, ".optionHolder input").prop('disabled', true);

						if (correctGroup == jGetElement(blockid, ".optionHolder input:checked").val()) {
							jGetElement(blockid, ".marking").html('<p>' + jGetElement(blockid, ".pageContents").data("phrases").mcqCorrect + '</p>');
							jGetElement(blockid, ".pageContents").data("mcqScore", jGetElement(blockid, ".pageContents").data("mcqScore") + 1);
							correct = true;
						} else {
							jGetElement(blockid, ".marking").html('<p>' + jGetElement(blockid, ".pageContents").data("phrases").mcqWrong.replace("{i}", groupInfo[correctGroup].name) + '</p>');
							correct = false;
						}

						jGetElement(blockid, ".marking").children().last().append($moreInfo);
						jGetElement(blockid, ".feedback").show();
						if ($("<div/>").html(groupInfo[correctGroup].text).text().trim() != "") {
							jGetElement(blockid, ".more").show();
						} else {
							jGetElement(blockid, ".more").hide();
						}

						var result = {
							success: correct,
							score: correct ? 100.0 : 0.0
						};
						l_options.push({
							id: parseInt(jGetElement(blockid, ".optionHolder input:checked").val()) + 1 + "",
							answer: mcqAnswerOptions[jGetElement(blockid, ".optionHolder input:checked").val()]['text'],
							result: correct,
						});

						XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, l_options, l_answer, l_feedback, mcqCurrentQ);

						$(this)
							.button({ "label": jGetElement(blockid, ".pageContents").data("phrases").mcqBtnTxt2 })
							.data("state", 1);

					} else if ($(this).data("state") == 1) { // next
						if (mcqCurrentQ + 1 == mcqAnswers.length) {
							jGetElement(blockid, ".passage .group")
								.removeClass("on")
								.removeAttr("title");

							jGetElement(blockid, ".qText").hide();
							jGetElement(blockid, ".optionHolder").hide();

							var $moreInfo = jGetElement(blockid, ".more");
							$moreInfo.remove();
							jGetElement(blockid, ".marking")
								.html('<p>' + jGetElement(blockid, ".pageContents").data("phrases").mcqScore.replace("{i}", jGetElement(blockid, ".pageContents").data("mcqScore")).replace("{n}", mcqAnswers.length) + '</p>' + (pageXML.getAttribute("mcqFB") != "" && pageXML.getAttribute("mcqFB") != undefined ? '<p>' + x_addLineBreaks(pageXML.getAttribute("mcqFB")) + '</p>' : ""))
								.children().last().append($moreInfo);
							jGetElement(blockid, ".more").hide();

							jGetElement(blockid, ".qNum").html(jGetElement(blockid, ".pageContents").data("phrases").mcqFeedback);

							finalFeedbackMcq(blockid, jGetElement(blockid, ".pageContents").data("mcqScore"), mcqAnswers.length);
							jGetElement(blockid, ".feedback").show();

							if (XTGetMode() == "normal") {
								$(this)
									.button("disable").hide()
									.data("state", 2);
							}
							else {
								$(this)
									.button({ "label": jGetElement(blockid, ".pageContents").data("phrases").mcqBtnTxt3 })
									.data("state", 2);
							}

							interactiveTextBlock.finishTracking(blockid);
						} else {
							interactiveTextBlock.createQ(blockid);
						}
					} else if (XTGetMode() != "normal") { // restart

						jGetElement(blockid, ".feedbackTxt").empty();
						interactiveTextBlock.createQuiz(blockid);
					}
				});
			this.createQuiz(blockid);
		}
		jGetElement(blockid, ".pageContents").data("tabIndex", tabIndex);
	};

	// only used in explore interaction - triggered when subgroup selected (with or without mouse)
	this.clickExplore = function (blockid, $this) {
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		const subGroups = jGetElement(blockid, ".pageContents").data("subGroups");
		let tabIndex = jGetElement(blockid, ".pageContents").data("tabIndex");
		let lang2 = x_getLangInfo(x_languageData.find("interactions").find("moreInfoItem")[0], "selected", "Selected");
		var index = $this.data("index"),
			currentGroup = jGetElement(blockid, ".pageContents").data("currentGroup"),
			prevGroup = currentGroup;

		currentGroup = subGroups[index].ref;

		jGetElement(blockid, ".passage").find(".group[data-index='" + index + "']")
			.addClass("on")
			.attr("title", lang2 + ": " + groupInfo[currentGroup].name);

		jGetElement(blockid, ".passage .group").removeClass("highlight");

		if (prevGroup != currentGroup) {
			jGetElement(blockid, ".groupInfo")
				.hide()
				.html('<h3>' + groupInfo[currentGroup].name + '</h3>' + x_addLineBreaks(groupInfo[currentGroup].text))
				.attr("tabindex", tabIndex++)
				.fadeIn();

			jGetElement(blockid, ".showBtn").hide();
		}

		// button offers option of viewing all related subgroups
		if (jGetElement(blockid, ".passage").find(".group" + currentGroup).length > 1) {
			jGetElement(blockid, ".showBtn").fadeIn();
		} else {
			jGetElement(blockid, ".showBtn").hide();
		}

		jGetElement(blockid, ".pageContents").data("tabIndex", tabIndex);
		jGetElement(blockid, ".pageContents").data("currentGroup", currentGroup);
		x_pageContentsUpdated();
	};

	// only used in find interactions - sets up arrays to hold found/complete data & create buttons
	this.setUpFind = function (blockid, firstLoad) {
		let pageXML = x_getBlockXML(blockid); 
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		var count = 0;
		for (var i = 0; i < groupInfo.length; i++) {
			if (firstLoad) {
				jGetElement(blockid, ".pageContents").data("found").push([]);
				jGetElement(blockid, ".pageContents").data("wrongFound").push([]);
			}
			if (groupInfo[i].numSubGroups > 0 && groupInfo[i].name != "#distractor#") {
				if (firstLoad == true) {
					var $groupBtn = $('<a/>');
					$groupBtn
						.addClass("listItem")
						.html(groupInfo[i].name)
						.attr({
							"tabindex": jGetElement(blockid, ".passage .group:eq(0)").attr("tabindex") - groupInfo.length + i,
							"href": "#"
						})
						.data("index", i);

					jGetElement(blockid, ".btnHolder").append($groupBtn);
				}

				count++;
				jGetElement(blockid, ".pageContents").data("complete").push(0);
			} else {
				jGetElement(blockid, ".pageContents").data("complete").push(1);
			}
		}
		return count;
	};

	// only used in find interaction - triggered when subgroup selected (with or without mouse)
	this.clickFind = function (blockid, $this) {
		let pageXML = x_getBlockXML(blockid); 
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		if (jGetElement(blockid, ".pageContents").data("checked"))
			return;
		let lang2 = x_getLangInfo(x_languageData.find("interactions").find("moreInfoItem")[0], "selected", "Selected");

		let findAllowSelectionOfAllWords = jGetElement(blockid, ".pageContents").data("findAllowSelectionOfAllWords");

		var currentGroup = jGetElement(blockid, ".pageContents").data("currentGroup");
		var intType = pageXML.getAttribute("interactivity");
		if (currentGroup != -1) { // If no group is selected, do nothing.

			// If the user wants to undo their choice:
			if ($this.hasClass("on")) {
				$this.removeClass("on");
				var arr = jGetElement(blockid, ".pageContents").data("found")[currentGroup];
				arr.splice(arr.indexOf($this.data("index")), 1);
			} else if ($this.hasClass("wrongOn" + currentGroup)) {
				$this.removeClass("wrongOn" + currentGroup);
				$this.removeClass("wrongGroup" + currentGroup);
				var arr = jGetElement(blockid, ".pageContents").data("wrongFound")[currentGroup];
				arr.splice(arr.indexOf($this.data("index")), 1);
			}
			// if the clicked word is a "wrongWord" count it as wrong.
			else if ($this.hasClass('wrongWord') && !$this.hasClass('group') && findAllowSelectionOfAllWords) {
				markWrong(blockid, $this, intType, currentGroup);
			}

			else if ($this.hasClass('group')) {
				var clicked = $.merge($this, $this.parents(".group"));
				var wrong = true;
				if (!checkComplete(blockid, intType, currentGroup)) {
					for (var i = 0; i < clicked.length; i++) {
						if ($(clicked[i]).hasClass("group" + currentGroup)) {
							wrong = false;

							if (!$(clicked[i]).hasClass('on')) {
								$(clicked[i])
									.addClass("on")
									.attr("title", lang2 + ": " + groupInfo[currentGroup].name);

								//Add found (correct) answer to the found array
								jGetElement(blockid, ".pageContents").data("found")[currentGroup].push($(clicked[i]).data("index"));
							}

							break; // break out of loop when one correct answer is found, no need to check further parents, this would only result in false negatives
						} else if (!$(clicked[i]).hasClass("on")) {
							$(clicked[i]).removeAttr("title");
						}
					}
				}
				// if a grouped word was clicked, but it and its parents belong to the wrong group, count it as wrong.
				if (wrong && !$this.hasClass('wrongWord')) {
					markWrong(blockid, $this, intType, currentGroup);
				}
			}

			if (intType == "find") {
				jGetElement(blockid, ".feedback")
					.html('<p>' + jGetElement(blockid, ".pageContents").data("findTxt2")
						.replace("{i}", jGetElement(blockid, ".pageContents").data("found")[currentGroup].length)
						.replace("{n}", groupInfo[currentGroup].numSubGroups) + '</p>')
					.show();

				// If all answers in this groups are found:
				if (jGetElement(blockid, ".pageContents").data("found")[currentGroup].length == groupInfo[currentGroup].numSubGroups) {
					// Put a 1 in the complete array on the index of this group
					jGetElement(blockid, ".pageContents").data("complete").splice(currentGroup, 1, 1);
					// If there are no more 0's in the "complete array" (aka everything is complete)
					if ($.inArray(0, jGetElement(blockid, ".pageContents").data("complete")) == -1) {
						var incorrectFound = jGetElement(blockid, ".pageContents").data("wrongFound");
						finalFeedback(blockid, incorrectFound);
						jGetElement(blockid, ".feedback").html('<p>' + (pageXML.getAttribute("findFeedback") != undefined ? pageXML.getAttribute("findFeedback") : "You have completed this activity.") + '</p>');
					}
				}
			} else if (intType == "find2") {
				jGetElement(blockid, ".feedback")
					.html('<p>' + jGetElement(blockid, ".pageContents").data("findTxt2")
						.replace("{i}", jGetElement(blockid, ".pageContents").data("found")[currentGroup].length + jGetElement(blockid, ".pageContents").data("wrongFound")[currentGroup].length)
						.replace("{n}", groupInfo[currentGroup].numSubGroups) + '</p>')
					.show();

				// If there are as many selections made as there are right answers to be found in this group:
				if (jGetElement(blockid, ".pageContents").data("found")[currentGroup].length + jGetElement(blockid, ".pageContents").data("wrongFound")[currentGroup].length == groupInfo[currentGroup].numSubGroups) {
					// Put a 1 in the complete array on the index of this group:
					jGetElement(blockid, ".pageContents").data("complete").splice(currentGroup, 1, 1);
					// If there are no more 0's in the "complete array" (aka everything is complete)
					if ($.inArray(0, jGetElement(blockid, ".pageContents").data("complete")) == -1) {
						jGetElement(blockid, ".feedback").html('<p>' + (pageXML.getAttribute("find2Feedback") != undefined ? pageXML.getAttribute("find2Feedback") : "You have selected the the correct number of items, please click the button to check your answers.") + '</p>');
						jGetElement(blockid, ".markAtEnd").button("enable");
					}
				}
			}
		}
	};

	/*
		To end the find2 interaction, we cheat a bit and use a multiple choice interaction. We already know the correct answers since the begining, but we can add the
		wrong answers the user chose as false options.
		  he order of chosen answers does not matter, because the result score is based on the amount of correctFound answers.
		However, how it results.html / xttracking_noop.js work right now, you cannot have 2 same answers where 1 is wrong
		this situation would happen if the answer depended on the context ("select the instances where 'trip' is used as a verb, not a noun")
		We can see the difference now because we include the "data-index" in the answer, but for a user this is unintuitive and we need to find a better solution, or forbid it.
		if the answers on the resultpage are checked by their options data instead of their answers data,
		we could see the difference between a right and wrong answer that is the same word
	*/
	this.endFindInteraction = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		var correctFound = jGetElement(blockid, ".pageContents").data("found");
		var incorrectFound = jGetElement(blockid, ".pageContents").data("wrongFound");
		var groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		var endScore = 0;
		var l_options = [];
		var l_answers = [];
		for (var group = 0; group < correctFound.length; group++) {
			if (groupInfo[group].name == "#distractor#") {
				continue;
			}
			l_options[group] = [];
			l_answers[group] = [];

			var groupName = groupInfo[group].name;

			for (var i = 0; i < correctFound[group].length; i++) {
				var span = jGetElement(blockid, '*[data-index=' + correctFound[group][i] + ']');
				l_options[group].push(
					{
						id: span.attr("data-index"),
						answer: span.text(),
						result: true
					}
				);
				l_answers[group].push(span.text() + "<br>");
			}

			var percentageCorrect = 0;
			if (correctOptions[group].length != 0)
				percentageCorrect = correctFound[group].length / correctOptions[group].length * 100;
			// endScore += correctFound[group].length;
			endScore += (correctFound[group].length == correctOptions[group].length ? 1 : 0);

			for (var i = 0; i < incorrectFound[group].length; i++) {
				var span = jGetElement(blockid, '*[data-index=' + incorrectFound[group][i] + ']')
				wrongOption =
				{
					id: span.attr("data-index"),
					answer: span.text(),
					result: false
				}
				l_options[group].push(wrongOption);
				correctOptions[group].push(wrongOption);
				l_answers[group].push(span.text() + "<br>");
			}

			var correct = percentageCorrect == 100;
			var result = {
				success: correct,
				//score: percentageCorrect
				score: (correct ? 100 : 0)
			};

			XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'multiplechoice', groupName, correctOptions[group], correctAnswers[group], [], pageXML.getAttribute("grouping"), null, group);
			XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, l_options[group], l_answers[group], [], group);
		}
		//finalFeedback(incorrectFound);
		showAnswers(blockid, l_answers, l_options, correctAnswers, correctOptions);
		var total = 0;
		//for (var i = 0; i < correctAnswers.length; i++)
		//	total += correctAnswers[i].length;
		// var score = endScore / total * 100;
		for (var group = 0; group < correctFound.length; group++) {
			if (groupInfo[group].name == "#distractor#") {
				continue;
			}
			total++;
		}
		var score = endScore / total * 100;
		jGetElement(blockid, ".pageContents").data("checked")
	};

	//Mark a wrong word as wrong in the find2 interaction
	function markWrong(blockid, target, intType, currentGroup) {
		if (checkComplete(blockid, intType, currentGroup)) {
			return;
		}
		if (!$(target).hasClass("wrongGroup" + currentGroup + " wrongOn" + currentGroup)) {
			$(target).addClass("wrongGroup" + currentGroup + " wrongOn" + currentGroup);

			jGetElement(blockid, ".pageContents").data("wrongFound")[currentGroup].push($(target).data("index"))
		}
	};

	// Check if enough words have been chosen in the find2 interaction
	function checkComplete(blockid, intType, currentGroup) {
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		if (intType == "find") {
			return (jGetElement(blockid, ".pageContents").data("found")[currentGroup].length >= groupInfo[currentGroup].numSubGroups);
		} else if (intType == "find2") {
			return (jGetElement(blockid, ".pageContents").data("found")[currentGroup].length + jGetElement(blockid, ".pageContents").data("wrongFound")[currentGroup].length >= groupInfo[currentGroup].numSubGroups);
		}
	};

	// Show the answers in the find2 interaction, in feedback and colors wrong and right answers
	function showAnswers(blockid, l_answers, l_options, correctAnswers, correctOptions) {
		let pageXML = x_getBlockXML(blockid); 
		var groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		var feedbackTxt = (pageXML.getAttribute('feedbackTxt') != undefined ? pageXML.getAttribute('feedbackTxt') : "Feedback");
		var groupTxt = (pageXML.getAttribute('groupTxt') != undefined ? pageXML.getAttribute('groupTxt') : "Group");
		var yourAnswerTxt = (pageXML.getAttribute('yourAnswerTxt') != undefined ? pageXML.getAttribute('yourAnswerTxt') : "Your Answer");
		var correctAnswerTxt = (pageXML.getAttribute('correctAnswerTxt') != undefined ? pageXML.getAttribute('correctAnswerTxt') : "Correct Answer");
		var text = "<h3>" + feedbackTxt + "</h3><table class='full header shaded'> <thead><tr> <th>" + groupTxt + "</th><th>" + yourAnswerTxt + "</th><th>" + correctAnswerTxt + "</th></tr></thead><tbody>";

		for (var group = 0; group < correctAnswers.length; group++) {
			if (groupInfo[group].name == "#distractor#") {
				continue;
			}
			text += ("<tr>");
			text += ("<td>" + groupInfo[group].name + "</td>");
			text += ("<td>");

			for (var i = 0; i < l_answers[group].length; i++) {

				if (l_options[group][i].result === true) {
					text += '<span class="feedbackResult fa fa-fw fa-x-tick"></span>';
					text += (l_answers[group][i]);
				} else {
					text += '<span class="finalResult fa fa-fw fa-x-cross"></span>'
					text += (l_answers[group][i]);
				}
			}
			text += ("</td>");
			text += ("<td>");
			for (var i = 0; i < correctAnswers[group].length; i++) {
				text += (correctAnswers[group][i]);
			}
			text += ("</td>");
			text += ("</tr>");
		}
		text += ("</tbody></table>");

		jGetElement(blockid, ".feedback").empty().append(text).show();

		for (var group = 0; group < correctOptions.length; group++) {
			if (groupInfo[group].name == "#distractor#") {
				continue;
			}
			for (var i = 0; i < correctOptions[group].length; i++) {
				if (correctOptions[group][i].result)
					$("*[data-index=" + correctOptions[group][i].id + ']').css({ "border-bottom": "2px solid " + x_getColour(groupInfo[group].bgColour) });
			}
		}
		// Add cross-through style for wrong answers
		var linethrough = ".wrongWord .wordOn";
		for (var group = 0; group < correctOptions.length; group++) {
			linethrough += ", .wrongGroup" + group + ".wrongOn" + group;
		}
		linethrough += "{ text-decoration:line-through; }";
		jGetElement(blockid, ".pageContents style").append(linethrough);
	}

	function finalFeedback(blockid, incorrect) {
		let pageXML = x_getBlockXML(blockid); 

		var correct = true;

		for (var i = 0; i < incorrect.length; i++) {
			if (incorrect[i].length !== 0) {
				correct = false;
			}
		}

		if (correct) {
			jGetElement(blockid, ".feedbackTxt").html((pageXML.getAttribute("passedFindTxt") != undefined ? pageXML.getAttribute("passedFindTxt") : "All selections are correct"));
		} else {
			jGetElement(blockid, ".feedbackTxt").html((pageXML.getAttribute("failedFindTxt") != undefined ? pageXML.getAttribute("failedFindTxt") : "You still have incorrect selections"));
		}

		jGetElement(blockid, ".feedbackTxt").prepend("<span class=finalResult/>")

		if (correct) {
			jGetElement(blockid, ".finalResult").addClass("fa").addClass("fa-fw").addClass("fa-x-tick");
		} else {
			jGetElement(blockid, ".finalResult").addClass("fa").addClass("fa-fw").addClass("fa-x-cross");
		}

	}

	function finalFeedbackMcq(blockid, good, total) {
		let pageXML = x_getBlockXML(blockid); 

		var correct = true;

		if (good !== total) {
			correct = false;
		}

		if (correct) {
			jGetElement(blockid, ".feedbackTxt").html((pageXML.getAttribute("passedQuestionTxt") != undefined ? pageXML.getAttribute("passedQuestionTxt") : "You passed the question"));
		} else {
			jGetElement(blockid, ".feedbackTxt").html((pageXML.getAttribute("failedQuestionTxt") != undefined ? pageXML.getAttribute("failedQuestionTxt") : "Not all answers are correct"));
		}

		jGetElement(blockid, ".feedbackTxt").prepend("<span class=finalResult/>");

		if (correct) {
			jGetElement(blockid, ".finalResult").addClass("fa").addClass("fa-fw").addClass("fa-x-tick");
		} else {
			jGetElement(blockid, ".finalResult").addClass("fa").addClass("fa-fw").addClass("fa-x-cross");
		}
	}
	// only used in mcq interaction - creates new quiz
	this.createQuiz = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		let mcqCurrentQ = -1;
		const mcqAnswers = jGetElement(blockid, ".pageContents").data("mcqAnswers");
		const groupInfo = jGetElement(blockid, ".pageContents").data("groupInfo");
		const mcqAnswerOptions = jGetElement(blockid, ".pageContents").data("mcqAnswerOptions");
		const subGroups = jGetElement(blockid, ".pageContents").data("subGroups");
		mcqAnswers.length = 0;
		mcqAnswerOptions.length = 0;

		jGetElement(blockid, ".qText").show();
		jGetElement(blockid, ".questionHolder").show();
		jGetElement(blockid, ".feedback").hide();
		jGetElement(blockid, ".pageContents").data("mcqCurrentQ", mcqCurrentQ);

		// highlight shown for question can be either for all group or an individual sub group
		if (pageXML.getAttribute("mcqType") == "all") {
			for (var i = 0; i < groupInfo.length; i++) {
				mcqAnswers.push(i);
			}
		} else {
			for (var i = 0; i < subGroups.length; i++) {
				mcqAnswers.push(i);
			}
		}
		x_shuffleArray(mcqAnswers);

		var numQs = pageXML.getAttribute("mcqNumQs") == undefined || pageXML.getAttribute("mcqNumQs") == "*" ? mcqAnswers.length : isNaN(pageXML.getAttribute("mcqNumQs")) ? mcqAnswers.length : Number(pageXML.getAttribute("mcqNumQs"));

		for (var i = 0; i < groupInfo.length; i++) {
			mcqAnswerOptions.push({ index: i, text: groupInfo[i].name });
		}

		jGetElement(blockid, ".pageContents").data({
			"mcqAnswers": mcqAnswers.slice(0, numQs),
			"mcqScore": 0
		});

		// start tracking
		this.startTracking(blockid);
		this.createQ(blockid);
	};

	// only used in mcq interaction - creates new question
	this.createQ = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		let mcqCurrentQ = jGetElement(blockid, ".pageContents").data("mcqCurrentQ");
		mcqCurrentQ++;
		jGetElement(blockid, ".pageContents").data("mcqCurrentQ", mcqCurrentQ);
		const mcqAnswers = jGetElement(blockid, ".pageContents").data("mcqAnswers");
		const mcqAnswerOptions = jGetElement(blockid, ".pageContents").data("mcqAnswerOptions");
		const subGroups = jGetElement(blockid, ".pageContents").data("subGroups");
		let lang2 = x_getLangInfo(x_languageData.find("interactions").find("moreInfoItem")[0], "selected", "Selected");

		jGetElement(blockid, ".feedback").hide();
		jGetElement(blockid, ".passage .group")
			.removeClass("on")
			.removeAttr("title");

		jGetElement(blockid, ".qNum").html(jGetElement(blockid, ".pageContents").data("phrases").mcqQuesCount.replace("{i}", (mcqCurrentQ + 1)).replace("{n}", mcqAnswers.length));
		jGetElement(blockid, ".quizBtn")
			.button({ "label": jGetElement(blockid, ".pageContents").data("phrases").mcqBtnTxt })
			.data("state", 0)
			.button("disable");

		// turn on highlight & set up answers - correct answer plus number of random incorrect wrong answers
		var options = mcqAnswerOptions.slice(0),
			correct,
			name,
			correctOptions = [],
			correctAnswer = [],
			correctFeedback = [];

		if (pageXML.getAttribute("mcqType") == "all") {
			jGetElement(blockid, ".passage .group" + mcqAnswers[mcqCurrentQ])
				.addClass("on")
				.attr("title", lang2);

			correct = options[mcqAnswers[mcqCurrentQ]];
			options.splice(mcqAnswers[mcqCurrentQ], 1);
			name = mcqAnswerOptions[mcqAnswers[mcqCurrentQ]]['text'];
		} else {
			jGetElement(blockid, ".passage .group[data-index='" + mcqAnswers[mcqCurrentQ] + "']")
				.addClass("on")
				.attr("title", lang2);

			correct = options[subGroups[mcqAnswers[mcqCurrentQ]].ref];
			options.splice(correct.index, 1);
			name = jGetElement(blockid, '.passage .on').html();
		}

		// Push the correct answers to correctOptions array
		correctOptions.push({
			id: correct['index'] + 1 + "",
			answer: correct['text'],
			result: true
		});
		correctAnswer.push(correct['text']);
		correctFeedback.push(jGetElement(blockid, ".pageContents").data("phrases").mcqCorrect);

		x_shuffleArray(options);
		var numOptions = pageXML.getAttribute("mcqNumAs") == undefined ? 3 : pageXML.getAttribute("mcqNumAs") == "*" ? options.length + 1 : isNaN(pageXML.getAttribute("mcqNumAs")) ? 3 : Number(pageXML.getAttribute("mcqNumAs"));
		options = options.length <= numOptions - 1 ? options : options.slice(0, numOptions - 1);
		// options conatins the added answers, add them to correctOptions, correctAnswers and correctDeedback
		$.each(options, function (i, thisOption) {
			correctOptions.push({
				id: thisOption['index'] + 1 + "",
				answer: thisOption['text'],
				result: false
			});
			correctAnswer.push(thisOption['text']);
			correctFeedback.push(jGetElement(blockid, ".pageContents").data("phrases").mcqWrong);
		});
		options.push(correct);

		x_shuffleArray(options);

		var answerText = [];
		answerText.push(correct['text']);


		XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'multiplechoice', name, correctOptions, answerText, correctFeedback, pageXML.getAttribute("grouping"),null, mcqCurrentQ);
		var $optionHolder = jGetElement(blockid, ".questionHolder .optionHolder")
			.html('<div class="optionGroup"><input type="radio" name="option" /><label class="optionTxt"></label></div>')
			.show();

		var $optionGroup = $optionHolder.find(".optionGroup");
		for (i = 0; i < options.length; i++) {
			var $thisOptionGroup;
			if (i != 0) {
				$thisOptionGroup = $optionGroup.clone().appendTo($optionHolder);
			} else {
				$thisOptionGroup = $optionGroup;
			}

			$thisOptionGroup.find("input")
				.attr({
					"value": options[i].index,
					"id": "option" + i
				})
				.change(function () {
					jGetElement(blockid, ".quizBtn").button("enable");
				})
				.focusin(function () {
					$(this).parent().addClass("highlight");
				})
				.focusout(function () {
					$(this).parent().removeClass("highlight");
				});

			$thisOptionGroup.find(".optionTxt")
				.attr("for", "option" + i)
				.html(options[i].text);
		}
	};

	this.startTracking = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		const mcqAnswers = jGetElement(blockid, ".pageContents").data("mcqAnswers");
		var numQs = pageXML.getAttribute("mcqNumQs") == undefined || pageXML.getAttribute("mcqNumQs") == "*" ? mcqAnswers.length : isNaN(pageXML.getAttribute("mcqNumQs")) ? mcqAnswers.length : Number(pageXML.getAttribute("mcqNumQs")),
			weighting = (pageXML.getAttribute("trackingWeight") != undefined) ? pageXML.getAttribute("trackingWeight") : 1.0;
		//XTSetPageType(x_currentPage, 'numeric', numQs, weighting);
		XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "multiplechoice", weighting, 0);
		for(let i = 1; i < numQs;i++){
				XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "multiplechoice", weighting, i);
		}
	};

	this.finishTracking = function (blockid) {
		let pageXML = x_getBlockXML(blockid); 
		const mcqAnswers = jGetElement(blockid, ".pageContents").data("mcqAnswers");
		// if this is a find2 interaction
		if (pageXML.getAttribute("interactivity") == "find2") {
			interactiveTextBlock.endFindInteraction(blockid);
			jGetElement(blockid, ".pageContents").data("checked", true);
			return;
		}

		//used for mcq:
		var score = jGetElement(blockid, ".pageContents").data("mcqScore"),
			numQs = pageXML.getAttribute("mcqNumQs") == undefined || pageXML.getAttribute("mcqNumQs") == "*" ? mcqAnswers.length : isNaN(pageXML.getAttribute("mcqNumQs")) ? mcqAnswers.length : Number(pageXML.getAttribute("mcqNumQs"));

		if (numQs === 0) {
			//XTSetPageScore(x_currentPage, score, pageXML.getAttribute("trackinglabel"));
		}
		else {
			//XTSetPageScore(x_currentPage, score * 100 / numQs, pageXML.getAttribute("trackinglabel"));
		}

		jGetElement(blockid, ".pageContents").data("checked", true);
	};

	this.showFeedBackandTrackResults = function (blockid) {
		//
	};
};
