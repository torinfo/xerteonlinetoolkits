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
var gridBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		jGetElement(blockid, ".checkBtn").show();
		jGetElement(blockid, ".ui-draggable").draggable("enable");
		this.removeFocus(blockid);
	}

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		if($("#x_page" + x_currentPage).is(":hidden")){
			$("#x_page" + x_currentPage).show();
		}
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		let separator = state.separator;
		let {fixedRows, fixedCols} = state;
		var $grid = jGetElement(blockid, ".grid");
		var data = pageXML.getAttribute("data").split("||");
		this.addLabelRefresh(blockid, data);

		let row = data[0].split(separator);
		jGetElement(blockid, ".content").css({
			'width': ""
		})

		var colWidth = jGetElement(blockid, ".pageContents").width() - jGetElement(blockid, ".otherContent").width();
		if (pageXML.getAttribute("align") == "top") {
			colWidth = jGetElement(blockid, ".pageContents").width()
		}
		colWidth = colWidth - (colWidth / 6);
		colWidth = colWidth / row.length;
		/*
		if(fixedCols.length>0){
			colWidth = colWidth/(row.length-1);
		}else{
			colWidth = colWidth/row.length;
		}
		*/
		var column;

		$grid.css('width', colWidth)

		//jGetElement(blockid, ".listHolder ul:not(:first)").css('width', colWidth)

		jGetElement(blockid, "ul[class!='preview']")
			.css("width", "")
			.css("height", "")
			.find("li")
			.css("width", "")
			.css("height", "");

		jGetElement(blockid, ".gridHolder")
			.css("width", "")
			.css("height", "");
		jGetElement(blockid, ".gridBorders")
			.css("width", "")
			.css("height", "");
		if (pageXML.getAttribute("constrain") == "col") {
			var column = 0;
			var maxW, maxH = 0;

			$grid.find("ul").each(function () {
				maxW = 0;
				$(this).find("li").each(function (i) {
					maxW = Math.max(maxW, $(this).width());
					if ($.inArray(i, fixedRows) == -1) {
						maxH = Math.max(maxH, $(this).height());
					}
				}).width(maxW + 5 + "px");
				column += maxW + 5;
			}).find("li")
				.height(maxH + "px");


			// ...unless they're in a fixed row when they must just have same height as other labels on that row
			for (i = 0; i < fixedRows.length; i++) {
				maxH = 0;
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[1] == fixedRows[i]) {
						$(this).css("height", "");
						maxH = Math.max(maxH, $(this).height());
					}
				});
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[1] == fixedRows[i]) {
						$(this).css("height", maxH);
					}
				});
			}

		} else if (pageXML.getAttribute("constrain") == "row") {
			// labels on each row should be same height & all labels should be same width...
			var maxW = 0, maxH;
			$grid.find("ul").each(function () {
				maxH = 0;
				$(this).find("li").each(function (i) {
					maxH = Math.max(maxH, $(this).height());
					if ($.inArray(i, fixedCols) == -1) {
						maxW = Math.max(maxW, $(this).width());
					}
					/*if(maxW > ($grid.width()-24)){
						maxW = $grid.width()-24;
					}*/
				}).height(maxH + "px");
			}).find("li")
				.width(maxW + 5 + "px");

			column = maxW + 5;
			// ...unless they're in a fixed column when they must just have same width as other labels on that column
			for (i = 0; i < fixedCols.length; i++) {
				maxW = 0;
				$grid.find("ul").find("li:eq(" + fixedCols[i] + ")").each(function () {
					$(this).css("width", "");
					maxW = Math.max(maxW, $(this).width());
				}).width(maxW + 5 + "px");
			}

		} else {
			// every label should be same width & height...
			var maxW = 0, maxH = 0;
			$grid.find("ul li").each(function (i) {
				if ($.inArray($(this).data("xy")[0], fixedCols) == -1) {
					maxW = Math.max(maxW, $(this).width());
				}
				if ($.inArray(i, fixedRows) == -1) {
					maxH = Math.max(maxH, $(this).height());
				}
			})
				.width(maxW + 5 + "px")
				.height(maxH + "px");

			column = maxW + 5;

			// ...unless they're in a fixed column/row when they must just have same width/height as other labels on that column/row
			for (var i = 0; i < fixedCols.length; i++) {
				maxW = 0;
				var $labels = $([]);
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[0] == fixedCols[i]) {
						$(this).css("width", "");
						maxW = Math.max(maxW, $(this).width());
						if ($labels == undefined) { $labels = $(this); } else { $labels = $labels.add($(this)); }
					}
				});
				$labels.width(maxW + 5 + "px");
			}

			for (var i = 0; i < fixedRows.length; i++) {
				maxH = 0;
				var $labels = $([]);
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[1] == fixedRows[i]) {
						$(this).css("height", "");
						maxH = Math.max(maxH, $(this).height());
						if ($labels == undefined) { $labels = $(this) } else { $labels = $labels.add($(this)); }
					}
				});
				$labels.height(maxH);
			}
		}

		var gridWidth;
		if (pageXML.getAttribute("constrain") != "col") {
			if (fixedCols.length > 0) {
				//gridWidth = column * (row.length-1) + maxW + 5 + (24*row.length);
				gridWidth = column * (row.length - 1) + (24 * row.length);
			} else {
				//gridWidth = column * (row.length) + maxW + 5 + (24*row.length);
				gridWidth = column * (row.length) + (24 * row.length);
			}
			jGetElement(blockid, ".listHolder ul:first").css('width', gridWidth);
			jGetElement(blockid, ".listHolder ul:not(:first)").css('width', gridWidth);
		} else {
			if (fixedCols.length > 0) {
				gridWidth = column + (24 * row.length);
			} else {
				gridWidth = column + (24 * row.length);
			}
			$grid.css('width', gridWidth);
		}
		// limit #otherContent to what is left when alignment is right
		const align = pageXML.getAttribute('align');
		if (align == 'right') {
			jGetElement(blockid, '.otherContent').css('width', jGetElement(blockid, '.pageContents').width() - $grid.width());
		}

		jGetElement(blockid, ".gridBorders").css('width', gridWidth);

		jGetElement(blockid, ".gridHolder")
			.width($grid.width())
			.height($grid.height());

		console.log($grid.height());

		if (align == 'top') {
			jGetElement(blockid, ".gridHolder").css("margin", "10px auto auto");
		}

		var num = data[0].split(separator).length;

		jGetElement(blockid, ".gridBorders").find("tr").each(function (i) {
			var $li = $grid.find("ul[class != 'preview']:eq(0) li:eq(" + i + ")")
			if (pageXML.getAttribute("constrain") == "col") {
				$(this).height($li.outerHeight(true) - 5);
			} else {
				$(this).height($li.outerHeight(true));
			}
		});



		jGetElement(blockid, ".gridBorders").find("tr:eq(0) td").each(function (i) {
			if (pageXML.getAttribute("constrain") == "col") {
				$(this).width($grid.find("ul[class != 'preview']:eq(" + i + ") li:eq(0)").width());
			} else {
				$(this).width($grid.find("ul[class != 'preview']:eq(0) li:eq(" + i + ")").width());
			}

		});



	}

	this.leavePage = function (blockid) {
		const state = x_getPageDict("state", blockid);
		if (!state.checked) {
			this.showFeedBackandTrackScore(blockid);
		}
	};

	this.showFeedBackandTrackScore = function (blockid) {
		let pageXML = x_getBlockXML(blockid);	
		const state = x_getPageDict("state", blockid);
		// there are loads of variations on how we could mark this - at the moment it has to be in exact position (taking identical labels into account)
		// maybe at some point add an option to editor for how they want it marked (e.g. mark correct if in correct row but order in row irrelevant)
		var Correct = true,
			l_options = [],
			l_answers = [],
			l_feedbacks = [],
			l_answer,
			l_option,
			l_feedback,
			counter = 0;
		var numOfQuestions = 0, correct = 0;
		let labelData = state.labelData;
		let allCorrectLocal = true;
		jGetElement(blockid, ".grid").find("ul:not(.preview) li:not(.static)").each(function () {
			Correct = true;
			var $this = $(this);
			var columnLength = pageXML.getAttribute("data").split("||")[0].split("|").length;
			var xPos = ($this.index() % columnLength) + 1;
			var yPos = (Math.floor($this.index() / columnLength)) + 1;
			l_answer = ($this.text().trim() + " --> [" + yPos + "," + xPos + "]");
			l_option = { source: $this.text().trim(), target: "[" + xPos + "," + yPos + "]" };

			if ($this.data("correct") == $this.index() || labelData[jGetElement(blockid, ".grid .listHolder").index($this.parents(".listHolder"))][$this.index()] == $this.html()) {
				$this.append('<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Correct") + '</span><span class="result fa fa-fw fa-x-tick"></span></span>');
				numOfQuestions++;
				correct++;
				l_option.result = true;
				l_feedback = "Correct";
			} else {
				Correct = false;
				$this.append('<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Incorrect") + '</span><span class="result fa fa-fw fa-x-cross"></span></span>');
				numOfQuestions++;
				l_option.result = false;
				l_feedback = "Incorrect";
				allCorrectLocal = false;
			}
			l_options.push(l_option);
			l_answers.push(l_answer);
			l_feedbacks.push(l_feedback);
			counter++;
		});
		state.allCorrect = allCorrectLocal;
		var result = {
			success: state.allCorrect,
			score: ((correct / numOfQuestions) * 100.0)
		};

		state.checked = true;
		XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, l_options, l_answers, l_feedbacks, 0, pageXML.getAttribute("trackinglabel"));


		if (XTGetMode() == "normal") {
			jGetElement(blockid, ".checkBtn").hide();
			jGetElement(blockid, ".ui-draggable").draggable("disable");
		}
		//XTSetPageScore(x_currentPage, ((correct / numOfQuestions) * 100.0), pageXML.getAttribute("trackinglabel"));
	};

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		let tempState = {
				fixedRows: [],
				fixedCols: [],
				fixedCells: [],
				labelData: [], 
				separator: "|"
		};
		const state = x_pushToPageDict(tempState, "state", blockid);
		tempState = null;
		state.checked = false;

		jGetElement(blockid, ".textHolder").html(x_addLineBreaks(pageXML.getAttribute("text")));
		if (pageXML.getAttribute("feedback") != undefined && pageXML.getAttribute("feedback") != "") {
			jGetElement(blockid, ".feedback")
				.html(x_addLineBreaks(pageXML.getAttribute("feedback")))
				.hide();
		} else {
			jGetElement(blockid, ".feedback").remove();
		}

		if (pageXML.getAttribute("align") == "top") {
			jGetElement(blockid, ".gridHolder")
				.appendTo(jGetElement(blockid, ".pageContents"))

			jGetElement(blockid, ".feedback").appendTo(jGetElement(blockid, ".pageContents"));
			jGetElement(blockid, ".btnHolder").appendTo(jGetElement(blockid, ".pageContents"));
		} else if (pageXML.getAttribute("align") == "right") {
			jGetElement(blockid, ".gridHolder")
				.addClass("x_floatLeft")
		} else if (pageXML.getAttribute("align") == "left") {
			jGetElement(blockid, ".gridHolder")
				.addClass("x_floatRight")
			jGetElement(blockid, ".btnHolder").appendTo(jGetElement(blockid, ".pageContents"))
		}


		var $grid = jGetElement(blockid, ".grid");
		var $text = jGetElement(blockid, ".otherContent");
		let gridSize = pageXML.getAttribute("gridSize");
		if (gridSize == undefined) {
			if (pageXML.getAttribute("text") == undefined) {
				gridSize = "full";
			}
			else {
				gridSize = "medium";
			}
		}
		if (gridSize == "small") {
			$text.css("max-width", "75%");
		} else if (gridSize == "large") {
			$text.css("max-width", "25%");
		} else if (gridSize == "full") {
			$text.remove()
		} else if (gridSize != "top") {
			$text.css("max-width", "50%");
		}

		var $content = jGetElement(blockid, ".content");

		if (pageXML.getAttribute("align") == "left") {
			$content.css({
				"flex-direction": "row"
			})
		} else if (pageXML.getAttribute("align") == "right") {
			$content.css({
				"flex-direction": "row-reverse",
				"justify-content": "space-between"
			})
		} else {
			$content.css("flex-direction", "column")
			$text.css("max-width", "100%");
		}

		jGetElement(blockid, ".checkBtn")
			.button({ label: pageXML.getAttribute("checkBtnTxt") != undefined ? pageXML.getAttribute("checkBtnTxt") : "Check Answers" })
			.click(function () {
				if ($(this).data("state") == "check") {
					const state = x_getPageDict("state", blockid);
					gridBlock.removeFocus(blockid);
					gridBlock.showFeedBackandTrackScore(blockid);
					if (state.allCorrect == true) {
						$(this)
							.button({ label: pageXML.getAttribute("resetBtnTxt") != undefined ? pageXML.getAttribute("resetBtnTxt") : "Reset" })
							.data("state", "reset");
						jGetElement(blockid, ".feedback").show();
						jGetElement(blockid, ".grid .listHolder ul li.ui-draggable")
									.draggable("option", "disabled", true)
							.off("focusin focusout keypress");
					}
				} else {
					$(this)
						.button({ label: pageXML.getAttribute("checkBtnTxt") != undefined ? pageXML.getAttribute("checkBtnTxt") : "Check Answers" })
						.data("state", "check");

					jGetElement(blockid, ".feedback").hide();
					jGetElement(blockid, ".grid .tick").remove();
					jGetElement(blockid, ".grid .listHolder ul li.ui-draggable")
						.draggable("option", "disabled", false)
						.on("focusin focusout keypress"); //
					gridBlock.randomiseLabels(blockid);
				}
			})
			.data("state", "check");

		if (pageXML.getAttribute("url") != undefined && pageXML.getAttribute("url") != "") {
			$.ajax({
				type: "GET",
				url: x_evalURL(pageXML.getAttribute("url")),
				dataType: "text",
				success: function (csv) {
					const state = x_getPageDict("state", blockid);
					var csvData = csv.split("\r\n");
					if (csvData[csvData.length - 1] == "") {
						csvData.splice(csvData.length - 1, 1);
					}
					state.separator = ",";
					gridBlock.sortData(blockid, csvData);
				},
				error: function () {
					gridBlock.sortData(blockid, pageXML.getAttribute("data").split("||"), false);
				}
			});
		} else {
			gridBlock.sortData(blockid, pageXML.getAttribute("data").split("||"), false);
		}
		this.initTracking(blockid);
		// call this function in every model once everything has loaded
		//this.sizeChanged(blockid);
		x_pageLoaded();
	}


	/*this.gridSize = function (blockid, size){
		let pageXML = x_getBlockXML(blockid);
		var $grid = jGetElement(blockid, ".grid"), $ul, $holder, row;
		var $text = jGetElement(blockid, ".otherContent");
		var $content = jGetElement(blockid, ".content");
		if(pageXML.getAttribute("gridSize") == "small"){
			$grid.width(size);
			$text.css("max-width", "75%");
		}else if(pageXML.getAttribute("gridSize") == "medium"){
			$grid.width(size * 2);
			$text.css("max-width", "50%");
		}else if(pageXML.getAttribute("gridSize") == "large"){
			$grid.width(size * 3);
			$text.css("max-width", "25%");
		}else{
			$text.remove()
		}


		if(pageXML.getAttribute("align") == "left"){
			$content.css("flex-direction", "row")
		}else if(pageXML.getAttribute("align") == "right"){
			$content.css("flex-direction", "row-reverse")
		}else{
			$content.css("flex-direction", "column")
		}
	}*/



	this.sortData = function (blockid, data) {
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		var $grid = jGetElement(blockid, ".grid"), $ul, $holder, row,
			$gridBorders = jGetElement(blockid, ".gridBorders"), $tr;
		let labelData = state.labelData;
		let separator = state.separator;
		const {fixedRows,	fixedCols, fixedCells} = state;

		// rows, columns & individual labels can be fixed
		var tempR = pageXML.getAttribute("fixedRows") != undefined ? pageXML.getAttribute("fixedRows").split(",") : [],
			tempC = pageXML.getAttribute("fixedCols") != undefined ? pageXML.getAttribute("fixedCols").split(",") : [],
			tempCE = pageXML.getAttribute("fixedCells") ? pageXML.getAttribute("fixedCells").split("|") : [],
			i, j;

		for (i = 0; i < tempR.length; i++) {
			if ($.isNumeric(tempR[i])) {
				fixedRows.push(Number(tempR[i]) - 1);
			}
		}

		if (pageXML.getAttribute("header") == "row" || pageXML.getAttribute("header") == "both") {
			$gridBorders.addClass("header");
			if ($.inArray(0, fixedRows) == -1) {
				fixedRows.push(0);
			}
		}

		for (i = 0; i < tempC.length; i++) {
			if ($.isNumeric(tempC[i])) {
				fixedCols.push(Number(tempC[i]) - 1);
			}
		}

		if (pageXML.getAttribute("header") == "col" || pageXML.getAttribute("header") == "both") {
			$gridBorders.addClass("headerCol");
			if ($.inArray(0, fixedCols) == -1) {
				fixedCols.push(0);
			}
		}

		for (i = 0; i < tempCE.length; i++) {
			var cells = tempCE[i].split(",");
			if (cells.length == 2) {
				if ($.isNumeric(cells[0]) && $.isNumeric(cells[1])) {
					fixedCells.push([Number(cells[0]) - 1, Number(cells[1]) - 1]);
				}
			}
		}

		// create labels - each label is a li with its parent ul determining which labels it can be sorted/swapped with
		// labels can be constrained to their row or column, or can be placed anywhere
		let gridSize = pageXML.getAttribute("gridSize");
		if (gridSize == undefined) {
			if (pageXML.getAttribute("text") == undefined) {
				gridSize = "full";
			}
			else {
				gridSize = "medium";
			}
		}
		row = data[0].split(separator);
		var colWidth = jGetElement(blockid, ".pageContents").width() - jGetElement(blockid, ".otherContent").width();
		const align = pageXML.getAttribute("align");
		switch (align) {
			case "top":
				colWidth = jGetElement(blockid, ".pageContents").width();
				break;
			case "left":
			case "right":
				switch (gridSize) {
					case "small":
						colWidth = jGetElement(blockid, ".pageContents").width() * 0.25;
						break;
					case "medium":
						colWidth = jGetElement(blockid, ".pageContents").width() * 0.5;
						break;
					case "large":
						colWidth = jGetElement(blockid, ".pageContents").width() * 0.75;
						break;
					case "full":
						colWidth = jGetElement(blockid, ".pageContents").width();
						break;
				}
				break;
		}
		/*
		if(fixedCols.length>0){
			colWidth = colWidth - (colWidth/6)
			colWidth = colWidth/(row.length-1);
		}else{
			colWidth = colWidth - (colWidth/6)
			colWidth = colWidth/row.length;
		}
		*/
		colWidth = colWidth - (colWidth / 6)
		colWidth = colWidth / (row.length - 1);
		$grid.css('width', colWidth)

		if (pageXML.getAttribute("constrain") == "col") {
			for (i = 0; i < data.length; i++) {
				row = data[i].split(separator);
				$tr = $('<tr/>').appendTo($gridBorders);

				if (i == 0) {
					for (j = 0; j < row.length; j++) {
						$holder = $('<div class="listHolder constrainC"></div>').appendTo($grid);
						$('<ul></ul>').appendTo($holder);
						labelData.push([]);
					}
				}
				for (j = 0; j < row.length; j++) {
					this.addLabel(blockid, row[j], $grid.find(".listHolder:eq(" + j + ") ul"), i, j);
					$tr.append('<td/>');
				}
			}

			// labels on each column should be same width & all labels should be same height...
			var maxW, maxH = 0;
			$grid.find("ul").each(function () {
				maxW = 0;
				$(this).find("li").each(function (i) {
					maxW = Math.max(maxW, $(this).width());
					if ($.inArray(i, fixedRows) == -1) {
						maxH = Math.max(maxH, $(this).height());
					}
				}).width(maxW + 5 + "px");
			}).find("li")
				.height(maxH + "px");

			// ...unless they're in a fixed row when they must just have same height as other labels on that row
			for (i = 0; i < fixedRows.length; i++) {
				maxH = 0;
				var $labels = $([]);
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[1] == fixedRows[i]) {
						$(this).css("height", "");
						maxH = Math.max(maxH, $(this).height());
					}
				});
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[1] == fixedRows[i]) {
						$(this).css("height", maxH);
					}
				});
				$labels.height(maxH);
			}


		} else if (pageXML.getAttribute("constrain") == "row") {
			for (i = 0; i < data.length; i++) {
				$holder = $('<div class="listHolder constrainR"></div>').appendTo($grid);
				$ul = $('<ul/>').appendTo($holder);
				labelData.push([]);
				row = data[i].split(separator);
				$tr = $('<tr/>').appendTo($gridBorders);

				for (j = 0; j < row.length; j++) {
					this.addLabel(blockid, row[j], $ul, i, j);
					$tr.append('<td/>');
				}
			}

			// labels on each row should be same height & all labels should be same width...
			var maxW = 0, maxH;
			$grid.find("ul").each(function () {
				maxH = 0;
				$(this).find("li").each(function (i) {
					maxH = Math.max(maxH, $(this).height());
					if ($.inArray(i, fixedCols) == -1) {
						maxW = Math.max(maxW, $(this).width());
					}
				}).height(maxH + "px");
			}).find("li")
				.width(maxW + 5 + "px");

			// ...unless they're in a fixed column when they must just have same width as other labels on that column
			for (i = 0; i < fixedCols.length; i++) {
				maxW = 0;
				$grid.find("ul").find("li:eq(" + fixedCols[i] + ")").each(function () {
					$(this).css("width", "");
					maxW = Math.max(maxW, $(this).width());
				}).width(maxW + 5 + "px");
			}

		} else {
			
			$holder = $('<div class="listHolder"></div>').appendTo($grid);
			$ul = $('<ul/>').appendTo($holder);
			labelData.push([]);

			for (i = 0; i < data.length; i++) {
				row = data[i].split(separator);
				$tr = $('<tr/>').appendTo($gridBorders);

				for (j = 0; j < row.length; j++) {
					this.addLabel(blockid, row[j], $ul, i, j);
					$tr.append('<td/>');
				}
			}

			// every label should be same width & height...
			var maxW = 0, maxH = 0;

			$grid.find("ul li").each(function (i) {
				if ($.inArray($(this).data("xy")[0], fixedCols) == -1) {
					maxW = Math.max(maxW, $(this).width());
				}
				if ($.inArray(i, fixedRows) == -1) {
					maxH = Math.max(maxH, $(this).height());
				}
			})
				.width(maxW + 5 + "px")
				.height(maxH + "px");

			// ...unless they're in a fixed column/row when they must just have same width/height as other labels on that column/row
			for (i = 0; i < fixedCols.length; i++) {
				maxW = 0;
				var $labels = $([]);
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[0] == fixedCols[i]) {
						$(this).css("width", "");
						maxW = Math.max(maxW, $(this).width());
						if ($labels == undefined) { $labels = $(this); } else { $labels = $labels.add($(this)); }
					}
				});
				$labels.width(maxW + 5 + "px");
			}

			for (i = 0; i < fixedRows.length; i++) {
				maxH = 0;
				var $labels = $([]);
				$grid.find("ul li.static").each(function () {
					if ($(this).data("xy")[1] == fixedRows[i]) {
						$(this).css("height", "");
						maxH = Math.max(maxH, $(this).height());
						if ($labels == undefined) { $labels = $(this) } else { $labels = $labels.add($(this)); }
					}
				});
				$labels.height(maxH);
			}
		}

		// insert rows & cells that make up grid borders (has to be overlaid as the swapping of labels would be too complicated if labels were really in the table)
		$gridBorders.insertBefore($grid);

		// fix width of grid so the correct amount of labels are on each row
		if (pageXML.getAttribute("constrain") != "col") {
			var $li = $grid.find("li"),
				rowW = 0;
			for (i = 0; i < data[0].split(separator).length; i++) {
				rowW += $grid.find("li:eq(" + i + ")").width();
			}
			$grid.find("ul").width(rowW + (((parseInt($li.css("padding-left")) + parseInt($li.css("margin-left")) + parseInt($li.css("border-left-width"))) * 2) * data[0].split(separator).length));
		}

		// style borders & match their size to grid labels
		if (pageXML.getAttribute("style") != "none") {
			$gridBorders.addClass(pageXML.getAttribute("style"));

			if (pageXML.getAttribute("constrain") != "col") {
				$gridBorders.width($grid.find("ul:eq(0)").width());
				$gridBorders.find("tr:eq(0) td").each(function (i) {
					$(this).width($grid.find("ul:eq(0) li:eq(" + i + ")").width());
				});

				if (pageXML.getAttribute("constrain") == "row") {
					$gridBorders.find("tr").each(function (i) {
						$(this).height($grid.find("ul:eq(" + i + ") li:eq(0)").outerHeight(true));
					});
				} else {
					var num = data[0].split(separator).length;
					$gridBorders.find("tr").each(function (i) {
						rowW += $grid.find("li:eq(" + i + ")").width();
						$(this).height($grid.find("li:eq(" + i * num + ")").outerHeight(true));
					});
				}
			} else {
				var totalW = 0;
				$grid.find("ul").each(function () {
					totalW += $(this).width();
				});
				$gridBorders
					.width(totalW)
					.find("tr:eq(0) td").each(function (i) {
						$(this).width($grid.find("ul:eq(" + i + ") li:eq(0)").width());
					});
				$gridBorders.find("tr").each(function (i) {
					$(this).height($grid.find("li:eq(" + i + ")").outerHeight(true) - 5);
				});
			}

			// additional styling of table - shade alternative rows / shade headers etc.
			if (pageXML.getAttribute("shadeHeader") == "true") {
				$gridBorders.addClass("shaded");
			}

			if (pageXML.getAttribute("shade") == "true") {
				$gridBorders.find("tr").each(function () {
					var $this = $(this),
						thisIndex = $this.index();
					if ($gridBorders.hasClass("header") && $gridBorders.hasClass("shaded")) { // shade even no. rows, except for 1st row
						if (thisIndex % 2 == 0 && thisIndex != 0) {
							$this.addClass("shaded");
						}
					} else if (thisIndex % 2 != 0) { // shade odd no. rows
						$this.addClass("shaded");
					}
				});
			}

			if ((pageXML.getAttribute("header") == "col" || pageXML.getAttribute("header") == "both") && pageXML.getAttribute("shadeHeader") == "true") {
				$gridBorders.find("tr td:first-child").addClass("header");
			}

			$grid.width($gridBorders.width() + 2);

		} else {
			$gridBorders.remove();
			if (pageXML.getAttribute("constrain") != "col") {
				$grid.width($grid.find("ul:eq(0)").width());
			} else {
				var totalW = 0;
				$grid.find("ul").each(function () {
					totalW += $(this).width();
				});
				$grid.width(totalW);
			}
		}

		jGetElement(blockid, ".gridHolder")
			.width($grid.width())
			.height($grid.height());

		if (align == 'top') {
			jGetElement(blockid, ".gridHolder").css("margin", "10px auto auto");
		}

		if (align == 'right') {
			jGetElement(blockid, '.otherContent').css('width', jGetElement(blockid, '.pageContents').width() - $grid.width());
		}

		this.randomiseLabels(blockid);

		// create duplicate labels used to show previews when dragging the real labels
		$grid.find("ul").each(function () {
			$(this).clone()
				.insertBefore($(this))
				.addClass("preview")
				.find("li")
				.css("visibility", "hidden")
				.removeClass("shadow");
		});

		var tabIndex = 3;

		// this uses draggable & droppable rather than sortable as sortable doesn't deal with fixed labels well
		$grid
			.find("ul:not(.preview) li:not(.static)")
			.draggable({
				stack: ".grid ul:not(.preview) li", // item being dragged is always on top (z-index)
				revert: "invalid", // snap back to original position if not dropped on target
				start: function () {
					gridBlock.removeFocus(blockid);

					$(this)
						.removeClass("shadow")
						.addClass("panel");

					$grid.find(".tick").hide();
				},
				stop: function () {
					$(this)
						.removeClass("panel")
						.addClass("shadow");
				}
			})

			// set up events used when keyboard rather than mouse is used
			.on("focusin", function () {
				var $this = $(this);
				const state = x_getPageDict("state", blockid);
				if (state.selectedLabel != undefined && state.selectedLabel != "") { // a label has been selected...
					if ($this.is(state.selectedLabel) == false) { // ...it's not the label in focus...
						if ($this.parent().is(state.selectedLabel.parent())) { // ... and the label in focus can have the selected label dropped on it
							gridBlock.overEvent(blockid, $this, state.selectedLabel);
							$this
								.html(state.selectedLabel.html())
								.addClass("selected");
						} else {
							$this.addClass("focus");
						}
					}

				} else {
					$this.addClass("focus");
				}
			})
			.on("focusout", function () {
				const state = x_getPageDict("state", blockid);
				var $this = $(this);
				$this.removeClass("focus selected");
				if (state.selectedLabel != undefined && state.selectedLabel != "" && $this.is(state.selectedLabel) == false) {
					if ($this.parent().is(state.selectedLabel.parent())) {
						gridBlock.outEvent(blockid, $this, 0);
						$this.html(labelData[jGetElement(blockid, ".grid .listHolder").index($this.parents(".listHolder"))][$this.data("correct")]);
					}
				}
				x_pageContentsUpdated();
			})
			.on("keypress", function (e) {
				var charCode = e.charCode || e.keyCode;
				const state = x_getPageDict("state", blockid);
				if (charCode == 32) {
					var $this = $(this);
					if (state.selectedLabel != undefined && state.selectedLabel != "") { // a label has been selected...
						if ($this.is(state.selectedLabel) == false) { // ...it's not the label in focus...
							if ($this.parent().is(state.selectedLabel.parent())) { // ... and the label in focus can have the selected label dropped on it
								$this.html(labelData[jGetElement(blockid, ".grid .listHolder").index($this.parents(".listHolder"))][$this.data("correct")]);

								state.selectedLabel
									.removeClass("selected")
									.addClass("focus");

								$this.removeClass("focus");

								gridBlock.dropEvent(blockid, $this, state.selectedLabel);
							}

						} else {
							$this
								.removeClass("selected")
								.addClass("focus");
						}

						state.selectedLabel = "";

					} else {
						$this
							.removeClass("focus")
							.addClass("selected");

						state.selectedLabel = $this;
					}
				}
			})
			.disableSelection()
			.each(function (i) {
				$(this).attr({
					"tabindex": tabIndex
				});
				tabIndex++;
			});

		$grid.find("ul:not(.preview) li:not(.static)")
			.droppable({
				accept: function ($dragged) {
					if ($(this).parent()[0] == $dragged.parent()[0]) {
						return true;
					}
				},
				drop: function (event, ui) {
					gridBlock.dropEvent(blockid, $(this), ui.draggable);
				},
				over: function (event, ui) {
					gridBlock.overEvent(blockid, $(this), ui.draggable);
				},
				out: function () {
					gridBlock.outEvent(blockid, $(this), 200);
				},
				hoverClass: "ui-state-highlight"
			});

		$grid.find("ul li").css("color", $x_body.css("color")); // override jquery ui style
		state.fixedRows = fixedRows;
		state.fixedCols = fixedCols;
		state.fixedCells = fixedCells;
	}

	this.sortDataRefresh = function (blockid, data) {
		let pageXML = x_getBlockXML(blockid);
		const state = x_getPageDict("state", blockid);
		var $grid = jGetElement(blockid, ".grid"), $ul, $holder, row,
			$gridBorders = jGetElement(blockid, ".gridBorders"), $tr;
		let separator = state.separator;

		if (pageXML.getAttribute("constrain") == "col") {
			for (var i = 0; i < data.length; i++) {
				row = data[i].split(separator);

				for (var j = 0; j < row.length; j++) {
					this.addLabelRefresh(blockid, i, j);
				}
			}

		} else if (pageXML.getAttribute("constrain") == "row") {
			let labelData = state.labelData;
			for (i = 0; i < data.length; i++) {
				labelData.push([]);
				row = data[i].split(separator);
				for (j = 0; j < row.length; j++) {
					this.addLabelRefresh(blockid, i, j);
				}
			}
		} else {

			for (i = 0; i < data.length; i++) {
				row = data[i].split(separator);

				for (j = 0; j < row.length; j++) {
					this.addLabelRefresh(blockid, i, j);
				}
			}
		}
	}

	this.addLabelRefresh = function (blockid, data) {
		const state = x_getPageDict("state", blockid);
		let separator = state.separator;
		var row = data[0].split(separator).length;

		jGetElement(blockid, ".listHolder ul:first li").each(function (index) {
			$(this).data({
				"correct": $(this).index(),
				"xy": [index % row, Math.floor(index / row)]
			});
		})

	}

	this.addLabel = function (blockid, txt, $parent, i, j) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		let {fixedRows, fixedCols, fixedCells} = state;
		var $li = $('<li>' + txt + '</li>')
			.appendTo($parent)
			.addClass("ui-state-default");

		if (i == 0 && (pageXML.getAttribute("header") == "row" || pageXML.getAttribute("header") == "both")) {
			$li.addClass("header static");
		} else if (j == 0 && (pageXML.getAttribute("header") == "col" || pageXML.getAttribute("header") == "both")) {
			$li.addClass("header static");
		} else {
			if ($.inArray(i, fixedRows) >= 0 || $.inArray(j, fixedCols) >= 0) {
				$li.addClass("static");
			} else {
				for (var k = 0; k < fixedCells.length; k++) {
					if (j == fixedCells[k][0] && i == fixedCells[k][1]) {
						$li.addClass("static");
					}
				}
			}
		}

		if (!$li.hasClass("static")) {
			$li.addClass("shadow");
		}

		$li
			.data({
				"correct": $li.index(),
				"xy": [j, i]
			});
		let labelData = state.labelData;
		labelData[$parent.parent().index()].push(txt);
	}

	// randomise labels (keeping fixed ones in correct place)
	this.randomiseLabels = function (blockid) {
		jGetElement(blockid, ".grid").find("ul").each(function (i) {
			var fixedLabels = $(this).find("li.static"),
				$ul = $(this);

			$ul.find("li.static").detach();

			var labels = $ul.children("li");
			labels = x_shuffleArray(labels);
			$ul.children("li").detach();
			for (var i = 0; i < labels.length; i++) {
				$ul.append(labels[i]);
			}

			fixedLabels.each(function () {
				if ($ul.find("li").length <= $(this).data("correct")) {
					$ul.append($(this));
				} else {
					$ul.find("li:eq(" + ($(this).data("correct")) + ")").before($(this));
				}
			});
		});
	}

	this.overEvent = function (blockid, $this, draggable) {
		const state = x_getPageDict("state", blockid);
		let pageXML = x_getBlockXML(blockid);
		clearTimeout(state.timeout);
		var $thisParent = $this.parent();

		if (pageXML.getAttribute("drag") == "insert") {
			// show preview for all labels that will be moved
			var toPreview = [], newTxt = [],
				indexDrag = draggable.index(),
				indexDrop = $this.index(),
				lowest = Math.min(indexDrop, indexDrag),
				highest = Math.max(indexDrag, indexDrop);

			$this.parent().find("li").css("visibility", "visible");
			$this.parent().prev(".preview").find("li").css("visibility", "hidden");

			for (var i = 0; i < highest - lowest + 1; i++) {
				if (!$thisParent.find("li:eq(" + (i + lowest) + ")").hasClass("static")) {
					toPreview.push(i + lowest);
					newTxt.push(i + lowest);
				}
			}
			toPreview.splice(lowest == indexDrag ? toPreview.length - 1 : 0, 1);
			newTxt.splice(lowest == indexDrag ? 0 : newTxt.length - 1, 1);

			for (i = 0; i < toPreview.length; i++) {
				$thisParent.prev(".preview").find("li:eq(" + toPreview[i] + ")")
					.html($thisParent.find("li:eq(" + newTxt[i] + ")").html())
					.css("visibility", "visible");

				var $label = $thisParent.find("li:eq(" + toPreview[i] + ")");
				if ($label[0] != draggable[0]) {
					$label.css("visibility", "hidden");
				}
			}

		} else {
			// show preview for two labels that will be swapped
			$thisParent.prev(".preview").find("li:eq(" + draggable.index() + ")")
				.css("visibility", "visible")
				.html($this.html());

			if (state.selectedLabel != undefined && state.selectedLabel != "") {
				state.selectedLabel.css("visibility", "hidden");
			}
		}
	}

	this.outEvent = function (blockid, $this, time) {
		const state = x_getPageDict("state", blockid);
		// slight delay in removing previews on roll over to avoid flickers over gaps between labels
		let timeout = setTimeout(function () {
			$this.parent().find("li").css("visibility", "visible");
			$this.parent().prev(".preview").find("li").css("visibility", "hidden");
		}, time);
		state.timeout = timeout;
	}

	this.dropEvent = function (blockid, $this, draggable) {
		let pageXML = x_getBlockXML(blockid);
		this.removeFocus(blockid);

		if (pageXML.getAttribute("drag") == "insert") {
			// insert dragged label into list
			if (draggable.index() > $this.index()) {
				draggable.insertBefore($this);
			} else {
				draggable.insertAfter($this);
			}
			draggable.css({ "top": "auto", "left": "auto" });

			// adjust position of fixed labels
			var fixedLabels = $this.parent().find("li.static"),
				$ul = $this.parent();

			fixedLabels.detach();
			fixedLabels.each(function () {
				if ($ul.find("li").length <= $(this).data("correct")) {
					$ul.append($(this));
				} else {
					$ul.find("li:eq(" + ($(this).data("correct")) + ")").before($(this));
				}
			});

		} else {
			// swap dragged label with label it's dropped on
			var index = $this.index();
			$this.insertBefore(draggable);
			if ($this.index() < index) {
				draggable.insertAfter($this.parent().find("li")[index]);
			} else if (index != 0) {
				draggable.insertAfter($this.parent().find("li")[index - 1]);
			} else {
				draggable.insertBefore($this.parent().find("li")[index]);
			}

			draggable.css({ "top": "auto", "left": "auto" });
		}

		var tabIndex = 3;
		jGetElement(blockid, ".grid ul:not(.preview) li:not(.static)").each(function (i) {
			$(this).attr({
				"tabindex": tabIndex
			});
			tabIndex++;
		});
	}

	this.removeFocus = function (blockid) {
		const state = x_getPageDict("state", blockid);
		state.selectedLabel = "";

		jGetElement(blockid, ".grid ul.preview li").css("visibility", "hidden");
		jGetElement(blockid, ".grid ul:not(.preview) li")
			.css("visibility", "visible")
			.blur()
			.removeClass("focus selected");
	}
	//Starting the tracking
	this.initTracking = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		// Track the dictation page
		let weighting = 1.0;
		if (pageXML.getAttribute("trackingWeight") != undefined) {
			weighting = pageXML.getAttribute("trackingWeight");
		}

		let correctOptions = [];
		let correctAnswer = [];
		let correctFeedback = [];
		let rows = pageXML.getAttribute("data").split("||");
		let rowCount = 1;

		var header = (pageXML.getAttribute("header") != undefined ? pageXML.getAttribute("header") : "");
		var fixedCells = (pageXML.getAttribute("fixedCells") != undefined ? pageXML.getAttribute("fixedCells") : "");
		var fixedRows = (pageXML.getAttribute("fixedRows") != undefined ? pageXML.getAttribute("fixedRows") : "");
		var fixedCols = (pageXML.getAttribute("fixedCols") != undefined ? pageXML.getAttribute("fixedCols") : "");

		fixedCells = fixedCells.trim().replace(/ /g, '');
		fixedRows = fixedRows.trim().replace(/ /g, '');
		fixedCols = fixedCols.trim().replace(/ /g, '');

		for (row in rows) {
			if (rowCount == 1 && (header == "row" || header == "both")) {
				rowCount++;
				continue;
			}
			let columnCount = 1;

			columns = rows[row].split("|");
			for (column in columns) {
				if (columnCount == 1 && (header == "col" || header == "both")) {
					columnCount++;
					continue;
				}
				if (fixedCells.indexOf(columnCount + "," + rowCount) == -1 &&
					fixedRows.indexOf(rowCount) == -1 &&
					fixedCols.indexOf(columnCount) == -1) {
					correctAnswer.push(columns[column] + " --> [" + columnCount + "," + rowCount + "]");
					correctFeedback.push("Correct");
					correctOption = { source: columns[column], target: "[" + columnCount + "," + rowCount + "]" };
					correctOptions.push(correctOption);
				}
				columnCount++;

			}
			rowCount++;
		}
		//XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);
		XTSetLeavePage(x_currentPage, x_getBlockNr(blockid), this.leavePage);

		var label = pageXML.getAttribute("name");
		if (pageXML.getAttribute("trackinglabel") != null && pageXML.getAttribute("trackinglabel") != "") {
			label = pageXML.getAttribute("trackinglabel");
		}
		XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'match', label, correctOptions, correctAnswer, correctFeedback, pageXML.getAttribute("grouping"));
		XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), "match", weighting);
		/*
		for(var i = 0; i < correctOptions.length; i++)
		{
			options = []
			options.push(correctOptions[i])
			XTEnterInteraction(x_currentPage, i, 'match', correctOptions[i].target, options, correctAnswer[i], correctFeedback[i]);
		}
		*/
	}
}
