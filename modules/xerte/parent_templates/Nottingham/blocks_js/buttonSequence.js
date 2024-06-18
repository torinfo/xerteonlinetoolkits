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
var buttonSequenceBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		//jGetElement(blockid, ".myPanel .infoBtn").hide();
		//jGetElement(blockid, ".myPanel .infoTxt").not(":eq(0)").empty();
		//jGetElement(blockid, ".myPanel .infoGroup:eq(0) .infoBtn").show();
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".myPanel");
			//$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
		}
	}

	this.init = function (blockid) {
		let x_currentPageXML = x_getBlockXML(blockid);
		// buttonWidth attribute not used as button will be sized automatically
		var panelWidth = x_currentPageXML.getAttribute("panelWidth"),
			$splitScreen = jGetElement(blockid, ".pageContents .splitScreen"),
			$textHolder = jGetElement(blockid, ".textHolder"),
			$panel = jGetElement(blockid, ".myPanel");

		if (panelWidth == "Full") {
			$panel.appendTo(jGetElement(blockid, ".pageContents"));
			$splitScreen.remove();
		} else {
			$textHolder.html(x_addLineBreaks(x_currentPageXML.getAttribute("text")));
			var textAlign = x_currentPageXML.getAttribute("align");
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

		var $infoGroup = jGetElement(blockid, ".infoGroup:first");

		$(x_currentPageXML).children()
			.each(function (i) {
				var $thisGroup;
				$thisGroup = $infoGroup.clone().appendTo($panel);
				if (i == $(x_currentPageXML).children().length - 1) {
					$thisGroup.find("button").remove();
				}
				$thisGroup.find(".infoBtn").hide();
			});

		$infoGroup.find(".infoTxt").html(x_addLineBreaks(x_currentPageXML.getAttribute("intro")));

		$panel.children()
			.each(function (i) {
				if (i != $panel.children().length - 1) {
					$panel.find(".infoGroup:eq(" + i + ") .infoBtn")
						.button({
							label: $(x_currentPageXML).children()[i].getAttribute("name")
						})
						.click(function () {
							var $this = $(this);
							$this.hide();
							if ($this.parent().index() != jGetElement(blockid, ".pageContents .infoGroup").length - 1) {
								var $thisGroup = jGetElement(blockid, ".pageContents .infoGroup:eq(" + ($this.parent().index() + 1) + ")");
								$thisGroup.find(".infoTxt").html(x_addLineBreaks($(x_currentPageXML).children()[$thisGroup.index() - 1].getAttribute("text")));
								$thisGroup.find(".infoBtn")
									.show()
									.focus();

								x_pageContentsUpdated();
							}
						});
				}
			});

		this.sizeChanged(blockid);
		x_pageLoaded();
	}
}
