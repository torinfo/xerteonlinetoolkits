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

var documentationBlock = new function () {
	var currentPage = 0,
		docData = {
			'filename': 'documentation',
			'pages': []
		},
	notAnsweredDefault = '',
		required = [];

	this.pageChanged = function (blockid) {

	}

	this.sizeChanged = function (blockid) {
		if (x_browserInfo.mobile == false) {
			var $panel = jGetElement(blockid, ".pageContents .panel"),
				$btnHolder = jGetElement(blockid, ".btnHolder"),
				$slideTxt = jGetElement(blockid, ".slideTxt");

			var btnHolderH = $btnHolder.length > 0 ? $btnHolder.height() + parseInt($btnHolder.css("margin-top")) : 0,
				slideTxtH = $slideTxt.length > 0 ? $slideTxt.height() + parseInt($slideTxt.css("margin-top")) + (parseInt($slideTxt.css("padding-top")) * 2) : 0;
			var footerH = Math.max(btnHolderH, slideTxtH);

			$panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);
			jGetElement(blockid, ".pages").height($panel.height() - footerH);
		}
	}

	this.init = function (blockid) {
		let x_currentPageXML = x_getBlockXML(blockid);
		// styles used in downloaded word doc
		var styles = '';
		styles += 'body, .ui-widget { font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; color: black; font-size: 12pt; } ';
		styles += 'table.tableDoc { font-size: 1em; margin: 0.2em; padding: 0.2em; width: 100%; border-collapse: collapse; } ';
		jGetElement(blockid, '.pageContents').data('downloadStyles', styles);

		var pageIndex = 0;

		// Set up main layout structure & add in all non-subpage text
		jGetElement(blockid, ".textHolder").append(x_currentPageXML.getAttribute("text"));

		switch (x_currentPageXML.getAttribute("panelWidth")) {
			case "Full":
				jGetElement(blockid, ".textHolder")
					.unwrap()
					.removeClass("left");

				jGetElement(blockid, ".panel").unwrap();

				jGetElement(blockid, ".textHolder").remove();
				break;

			case "Small":
				jGetElement(blockid, ".pageContents .splitScreen").addClass("large");
				break;

			case "Large":
				jGetElement(blockid, ".pageContents .splitScreen").addClass("small");
				break;

			default:
				jGetElement(blockid, ".pageContents .splitScreen").addClass("medium");
		}

		if (x_currentPageXML.getAttribute("intro") != "") {
			jGetElement(blockid, ".mainIntro").append(x_currentPageXML.getAttribute("intro"));
		} else {
			jGetElement(blockid, ".mainIntro").remove();
		}


		// Process filename
		if (x_currentPageXML.getAttribute('filename')) {
			var filename = x_currentPageXML.getAttribute('filename').trim();
			if (filename.length > 0) {
				docData.filename = filename;
			}
		}

		// Process document details
		docData.documentName = x_currentPageXML.getAttribute('name');
		docData.documentText = x_currentPageXML.getAttribute('text');
		docData.documentIntro = x_currentPageXML.getAttribute('intro');

		// Store 'No answer' text
		if (x_currentPageXML.getAttribute('notAnswered')) notAnsweredDefault = x_currentPageXML.getAttribute('notAnswered');

		// Introductory page
		if (x_currentPageXML.getAttribute('intro') != "" && x_currentPageXML.getAttribute('display') == 'separate') {
			jGetElement(blockid, ".mainIntro")
				.attr("id", "page" + pageIndex++)
				.addClass("page");
		}

		// Loop through all pages
		for (var page = 0; page < $(x_currentPageXML).children().length; page++) {
			var pageXML = $(x_currentPageXML).children()[page];

			if ($(pageXML).children().length != 0 || pageXML.getAttribute('name') != "" || pageXML.getAttribute('text') != "") {
				docData.pages[page] = {};

				// Create the pages and hide them all
				$page = $('<div>')
					.attr('class', 'page' + pageIndex++)
					.addClass('page');

				if (pageIndex > 1)
					$page.attr('class', 'page hidepage');

				docData.pages[page].pageName = pageXML.getAttribute('name');
				docData.pages[page].pageText = pageXML.getAttribute('text');

				var $intro = $('<div class="intro">').appendTo($page);
				if (docData.pages[page].pageName.length > 0) {
					$('<h3>')
						.html(docData.pages[page].pageName)
						.appendTo($intro);
				}
				if (docData.pages[page].pageText.length > 0) {
					$('<div>')
						.html(docData.pages[page].pageText)
						.appendTo($intro);
				}
				if ($intro.children().length == 0) {
					$intro.remove();
				}

				// Create any sections
				if ($(pageXML).children().length > 0) {
					docData.pages[page].sections = [];
					for (var section = 0, noSections = $(pageXML).children().length; section < noSections; section++) {
						var sectionXML = $(pageXML).children()[section];
						docData.pages[page].sections[section] = { 'items': [] };

						// Create the sections
						if (sectionXML.nodeName == 'section') {
							if (sectionXML.getAttribute('exclude') != 'doc') {
								docData.pages[page].sections[section].sectionName = sectionXML.getAttribute('name');
								docData.pages[page].sections[section].sectionText = sectionXML.getAttribute('text');
							}

							var $section = $('<fieldset>').attr('class', 'section'),
								checkChildren = false;

							if (sectionXML.getAttribute('exclude') != 'lo') {
								if (sectionXML.getAttribute('exclude') == 'doc') {
									checkChildren = 'doc';
								}

								if (sectionXML.getAttribute('name').length > 0) {
									$('<legend>')
										.html('<p>' + sectionXML.getAttribute('name') + '</p>')
										.appendTo($section);
								}
								if (sectionXML.getAttribute('text').length > 0) {
									$('<div class="intro">')
										.html(sectionXML.getAttribute('text'))
										.appendTo($section);
								}

							} else {
								checkChildren = 'lo';
							}

							// section is excluded from either LO or documentation so exclude all its children from same too
							if (checkChildren != false) {
								for (var item = 0, noItems = $(sectionXML).children().length; item < noItems; item++) {
									var itemXML = $(sectionXML).children()[item],
										otherExclude = checkChildren == 'lo' ? 'doc' : 'lo';
									if (itemXML.getAttribute('exclude') == otherExclude) {
										// item is excluded from LO & documentation so remove altogether
										itemXML.remove();
										item--;
										noItems--;
									} else {
										itemXML.setAttribute('exclude', checkChildren);
									}
								}
							}

							// Create each item
							for (var item = 0, noItems = $(sectionXML).children().length; item < noItems; item++) {
								var itemXML = $(sectionXML).children()[item],
									$newItem = documentationBlock.processItem(blockid, page, section, item, itemXML);

								if ($newItem !== null) $newItem.appendTo($section);
							}

							if (sectionXML.getAttribute('exclude') != 'lo') {
								$page.append($section);
							}
						}
						else {
							docData.pages[page].sections[section].items[0] = {};
							var $newItem = documentationBlock.processItem(blockid, page, section, 0, sectionXML);
							if ($newItem !== null) $newItem.appendTo($page);
						}
					}
				}

				jGetElement(blockid, '.pages').append($page);
			}
		}

		// Add download button
		var $downloadBtn = $('<button class="downloadBtn">');
		var $downloadSection = $('<div class="item"/>');
		$downloadBtn.appendTo($downloadSection);
		if (x_currentPageXML.getAttribute('download') && x_currentPageXML.getAttribute('download') == 'extra') {
			$page = $('<div>')
				.attr('class', 'page' + pageIndex + ' page hidepage');

			$downloadSection.appendTo($page);
			jGetElement(blockid, '.pages').append($page);
		}
		else {
			$downloadSection.insertAfter(jGetElement(blockid, '.pages').children().last().children().last());
		}

		if (x_currentPageXML.getAttribute('instructions') && x_currentPageXML.getAttribute('instructions') != "") {
			$('<div>' + x_currentPageXML.getAttribute('instructions') + '</div>').insertBefore($downloadBtn);
		}

		jGetElement(blockid, ".pageContents").data("numPages", jGetElement(blockid, ".pages").children(".page").length);

		$downloadBtn.button({
			icons: {
				primary: "fa fa-x-download"
			},
			label: x_currentPageXML.getAttribute('downloadTxt') != undefined ? x_currentPageXML.getAttribute('downloadTxt') : "Download"
		})
			.click(function () {
				documentationBlock.download(blockid);
			})


		// Wire up navigation buttons or hide them
		if (jGetElement(blockid, '.pages').children(".page").length > 1) {
			jGetElement(blockid, ".prevBtn")
				.button({
					icons: {
						primary: "fa fa-x-prev"
					},
					label: x_currentPageXML.getAttribute('prevTxt') != undefined ? x_currentPageXML.getAttribute('prevTxt') : "Previous",
					text: false
				})
				.click(function () {
					documentationBlock.previousPage(blockid);
					jGetElement(blockid, ".pages").scrollTop(0);
				})
				.prop('disabled', true);

			jGetElement(blockid, ".nextBtn")
				.button({
					icons: {
						primary: "fa fa-x-next"
					},
					label: x_currentPageXML.getAttribute('nextTxt') != undefined ? x_currentPageXML.getAttribute('nextTxt') : "Next",
					text: false
				})
				.click(function () {
					documentationBlock.nextPage(blockid);
					jGetElement(blockid, ".pages").scrollTop(0);
				})

			jGetElement(blockid, ".slideTxt").html((currentPage + 1) + " / " + (jGetElement(blockid, ".pageContents").data("numPages")));

		}
		else {
			jGetElement(blockid, '.btnHolder').remove();
		}

		this.sizeChanged();

		jGetElement(blockid, ".pageContents").data("docData", docData);

		x_pageLoaded();
	};

	this.processItem = function (blockid, page, section, item, xml) {
		// Item to be excluded?
		var exclude = '';
		if (xml.getAttribute('exclude')) {
			exclude = xml.getAttribute('exclude');
		}

		if (exclude != 'doc') {
			docData.pages[page].sections[section].items[item] = {};
			docData.pages[page].sections[section].items[item].itemName = xml.getAttribute('name');
			docData.pages[page].sections[section].items[item].itemText = xml.getAttribute('text');

			if (xml.nodeName != 'tableDoc') {
				docData.pages[page].sections[section].items[item].itemValue = "";
			} else {
				docData.pages[page].sections[section].items[item].itemValue = documentationBlock.formatTableForDownload(this.createTable(xml, 'tableDoc ' + xml.getAttribute("borders")), '');
			}
		}

		if (exclude != 'lo') {
			var $item = $('<div>')
				.attr('class', 'item');

			if (exclude != 'lo' &&
				xml.getAttribute('name') &&
				xml.getAttribute('name').length > 0
			) {
				$('<h3>')
					.html(xml.getAttribute('name'))
					.appendTo($item);
			}

			// Required?
			var requiredKey = '';
			if (
				xml.getAttribute('required') &&
				xml.getAttribute('required') == 'true'
			) {
				$("<span>")
					.html("* Required")
					.addClass("required")
					.appendTo($item);
				requiredKey = 'idP' + page + 'S' + section + 'I' + item;
				required.push({ 'page': page, 'section': section, 'item': item, 'key': requiredKey });
			}

			if (
				xml.getAttribute('text') &&
				xml.getAttribute('text').length > 0
			) {
				$('<div>')
					.html(xml.getAttribute('text'))
					.appendTo($item);
			}

			// Work out which Not Answered option to use
			var notAnsweredText = notAnsweredDefault;
			if (xml.getAttribute('notAnswered')) notAnsweredText = xml.getAttribute('notAnswered');

			var $element;
			switch (xml.nodeName) {
				case 'textarea':
					var rows = 3, width;
					if (xml.getAttribute('rows')) rows = parseInt(xml.getAttribute('rows'));

					switch (xml.getAttribute("width")) {
						case "Small":
							width = "width40";
							break;

						case "Large":
							width = "width80";
							break;

						default:
							width = "width60";
					}

					$textarea = $('<textarea class="' + width + '">')
						.attr('rows', rows);

					//Add aria-label to answer box
					var answerFieldLabel = xml.getAttribute("answerFieldLabel");
					if (answerFieldLabel === undefined | answerFieldLabel === null) {
						answerFieldLabel = "Answer";
					}
					$textarea.attr({ "aria-label": answerFieldLabel });

					if (xml.getAttribute('defaultTxt')) $textarea.attr('placeholder', xml.getAttribute('defaultTxt'));

					if (requiredKey.length > 0) $textarea.attr('id', requiredKey);

					if (exclude != 'doc') {
						documentationBlock.updateData(blockid, page, section, item, notAnsweredText);
						(function (p, s, i) {
							$textarea.on('change', function () {
								var temp = $(this).val().replace(/\r?\n/g, '<br>');
								documentationBlock.updateData(blockid, p, s, i, $(this).val().length == 0 ? notAnsweredText : temp);
							})
						})(page, section, item);
					}

					$element = $('<div class="question"/>').append($textarea);
					break;
				case 'checkbox':
					var display = ['Checked', 'Unchecked'],
						thisId = 'idP' + page + 'S' + section + 'I' + item;

					if (xml.getAttribute('checked')) display[0] = xml.getAttribute('checked');
					if (xml.getAttribute('unchecked')) display[1] = xml.getAttribute('unchecked');
					var label = xml.getAttribute("label") == undefined ? "" : '<label class="optionTxt" for="' + thisId + '">' + xml.getAttribute("label") + '</label>';

					$item.attr("id", "optionHolder");
					$input = $('<input>')
						.attr({
							'id': thisId,
							'type': 'checkbox'
						});

					if (xml.getAttribute("default") == "true") $input.prop('checked', true);

					if (requiredKey.length > 0) $input.attr('id', requiredKey);

					if (exclude != 'doc') {
						documentationBlock.updateData(blockid, page, section, item, display[$input.prop('checked') ? 0 : 1]);
						(function (blockid, p, s, i, d) {
							$input.on('change', function () {
								documentationBlock.updateData(blockid, p, s, i, d[$(this).prop('checked') ? 0 : 1]);
							})
						})(blockid, page, section, item, display);
					}

					$element = $('<div class="question optionGroup"/>').append($input).append(label);
					break;
				case 'media':
					if (xml.getAttribute('url') != undefined && xml.getAttribute('url') != '') {
						if (exclude != 'doc') {
							docData.pages[page].sections[section].items[item].itemText = '<img class="itemImg" src="' + xml.getAttribute('url') + '">';
						}
						$element = $('<img class="itemImg">')
							.attr('src', xml.getAttribute('url'));
					}
					else {
						$element = $('<div>')
							.html("<p class='alert'>" + (x_currentPageXML.getAttribute('mediaError') != undefined ? x_currentPageXML.getAttribute('mediaError') : "No media selected") + "</p>");
					}
					break;
				case 'description':
					break;
				case 'tableDoc':
					var header = false,
						footer = false,
						classes = 'tableDoc ' + xml.getAttribute("borders");

					if (xml.getAttribute("header") == "header" || xml.getAttribute("header") == "both") {
						header = true;
						classes += ' header';
					}
					if (xml.getAttribute("header") == "footer" || xml.getAttribute("header") == "both") {
						footer = true;
						classes += ' footer';
					}
					if (xml.getAttribute("shadeHeader") == "true" && (header == true || footer == true)) {
						classes += ' shaded';
					}

					$element = this.createTable(xml, classes);

					if (xml.getAttribute("shade") == "true") {
						var $tr = $element.find('tr');

						$element.find('table tbody').children().each(function (i) {
							var $this = $(this);
							if (footer != true || (footer == true && i != $element.find('table tbody').children().length - 1)) {
								if (i % 2 != 0) { // shade odd no. rows
									$this.addClass("shaded");
								}
							}
						});
					}

					if (requiredKey.length > 0) $element.find('textarea').attr('id', requiredKey);

					if (exclude != 'doc') {
						documentationBlock.updateData(blockid, page, section, item, documentationBlock.formatTableForDownload($element, notAnsweredText));

						(function (blockid, p, s, i) {
							$element.find('textarea').on('change', function () {
								documentationBlock.updateData(blockid, p, s, i, documentationBlock.formatTableForDownload($element, notAnsweredText));
							})
						})(blockid, page, section, item);
					}
					break;
				case 'line':
					if (exclude != 'doc') {
						docData.pages[page].sections[section].items[item].itemText = '<hr/>';
					}
					$element = $('<hr />');
					break;
				case 'selectlist': // radio,checkbox
					$item.attr("id", "optionHolder");

					var $input, type = xml.getAttribute('type');
					$element = $('<div>');

					if (type === null) type = 'radio';
					switch (type) {
						case 'checkbox':
						case 'radio':
							$element = $('<div class="question">');
							for (var i = 0; i < $(xml).children().length; i++) {
								$input = $('<input>')
									.attr('type', type)
									.attr('value', $(xml).children()[i].getAttribute('text'))
									.attr({
										'name': 'idP' + page + 'S' + section + 'I' + item,
										'id': 'idP' + page + 'S' + section + 'I' + item + '_' + i,
									});

								if (exclude != 'doc') {
									documentationBlock.updateData(blockid, page, section, item, notAnsweredText);
									switch (type) {
										case 'checkbox':
											(function (blockid, p, s, i, d) {
												$input.on('change', function () {
													var checkbox = [];
													$("input[name='" + ('idP' + page + 'S' + section + 'I' + item) + "']:checked").map(function (_, el) {
														checkbox.push($(el).val());
													}).get();
													documentationBlock.updateData(blockid, p, s, i, (checkbox.length > 0) ? checkbox.join(', ') : notAnsweredText);
												})
											})(blockid, page, section, item, display);
											break;
										case 'radio':
											(function (p, s, i, d) {
												$input.on('change', function () {
													documentationBlock.updateData(blockid, p, s, i, $(this).val());
												})
											})(blockid, page, section, item, display);
									}
								}

								var $label = $('<label class="optionTxt" for="' + $input.attr("id") + '">')
									.append($(xml).children()[i].getAttribute('text'));

								var $optHolder = $('<div class="optionGroup"/>')
									.append($input)
									.append($label)
									.appendTo($element);

								if (xml.getAttribute('display') === 'horizontal')
									$optHolder.addClass('horizontal');
							}
							break;
						default:
							break;
					}
					break;
				case 'textbox':
				default:
					$input = $('<input>')
						.attr('type', 'text')
						.attr('aria-label', 'Answer')
						.attr('value', '');

					if (xml.getAttribute('defaultTxt')) $input.attr('placeholder', xml.getAttribute('defaultTxt'));

					if (requiredKey.length > 0) $input.attr('id', requiredKey);

					var width;
					switch (xml.getAttribute("width")) {
						case "Small":
							width = "width40";
							break;

						case "Large":
							width = "width80";
							break;

						default:
							width = "width60";
					}
					$input.addClass(width);

					if (exclude != 'doc') {
						documentationBlock.updateData(blockid, page, section, item, notAnsweredText);
						(function (blockid, p, s, i) {
							$input.on('change', function () {
								documentationBlock.updateData(blockid, p, s, i, $(this).val().length == 0 ? notAnsweredText : $(this).val());
							})
						})(blockid, page, section, item);
					}

					$element = $('<div class="question"/>').append($input);
					break;
			}

			return $item.append($element);
		}
		else {
			return null;
		}
	}

	this.updateData = function (blockid, p, s, i, data) {
		var temp = jGetElement(blockid, ".pageContents").data("docData") == undefined ? docData : jGetElement(blockid, ".pageContents").data("docData");
		temp.pages[p].sections[s].items[i].itemValue = data;
		jGetElement(blockid, ".pageContents").data("docData", temp);
	};

	this.previousPage = function (blockid) {
		//if (documentation.checkRequired(currentPage)) {
		if (currentPage > 0) {
			jGetElement(blockid, '.page' + currentPage).addClass('hidepage');
			if ((currentPage == 1 && x_currentPageXML.getAttribute("display") != "all") || x_currentPageXML.getAttribute("display") == "all") jGetElement(blockid, ".mainIntro").show();
			currentPage--;
			jGetElement(blockid, '.page' + currentPage).removeClass('hidepage');
			if (currentPage == 0) jGetElement(blockid, '.prevBtn').prop('disabled', true);
		}
		jGetElement(blockid, '.nextBtn').prop('disabled', false);
		jGetElement(blockid, ".slideTxt").html((currentPage + 1) + " / " + (jGetElement(blockid, ".pageContents").data("numPages")));

		documentationBlock.showPage(blockid, currentPage + 1);
		//}
	};

	this.nextPage = function (blockid) {
		if (documentationBlock.checkRequired(blockid, currentPage)) {
			if (currentPage < jGetElement(blockid, '.pages').children(".page").length - 1) {
				jGetElement(blockid, '.page' + currentPage).addClass('hidepage');
				if ((currentPage == 0 && x_currentPageXML.getAttribute("display") != "all") || (currentPage + 1 == jGetElement(blockid, '.pages').children(".page").length - 1 && x_currentPageXML.getAttribute("download") == "extra")) jGetElement(blockid, ".mainIntro").hide();
				currentPage++;
				jGetElement(blockid, '.page' + currentPage).removeClass('hidepage');
				if (currentPage == jGetElement(blockid, '.pages').children(".page").length - 1) jGetElement(blockid, '.nextBtn').prop('disabled', true);
			}
			jGetElement(blockid, '.prevBtn').prop('disabled', false);
			jGetElement(blockid, ".slideTxt").html((currentPage + 1) + " / " + (jGetElement(blockid, ".pageContents").data("numPages")));

			documentationBlock.showPage(blockid, currentPage + 1);
		}
	};

	this.checkRequired = function (blockid, page) {
		jGetElement(blockid, ".alertBorder").removeClass('alertBorder');
		var ok = true;
		for (var i = 0; i < required.length; i++) {
			if (required[i].page == page) {
				if (jGetElement(blockid, '#' + required[i].key).attr('type') == 'checkbox') {
					if (!jGetElement(blockid, '#' + required[i].key).prop('checked')) {
						ok = false;
						jGetElement(blockid, '#' + required[i].key).closest('.item').addClass('alertBorder');
					}
				} else {
					if (jGetElement(blockid, '#' + required[i].key).parents('table.tableDoc').length > 0) {
						var $tableDoc = jGetElement(blockid, '#' + required[i].key).parents('table.tableDoc');
						// when an editable table is required all the text areas in it must be completed
						for (var j = 0; j < $tableDoc.find('textarea').length; j++) {
							if ($tableDoc.find('textarea')[j].value == '') {
								ok = false;
								jGetElement(blockid, '#' + required[i].key).closest('.item').addClass('alertBorder');
								break;
							}
						}
					} else {
						if (jGetElement(blockid, '#' + required[i].key).val() == '') {
							ok = false;
							jGetElement(blockid, '#' + required[i].key).closest('.item').addClass('alertBorder');
						}
					}
				}
			}
		}

		if (!ok) { alert(x_currentPageXML.getAttribute('requiredTxt') != undefined ? x_currentPageXML.getAttribute('requiredTxt') : "Please complete all required fields") }

		return ok;
	};

	this.createTable = function (xml, classes) {
		var separators = ['||', '|'],
			tableString = '<table class="' + classes + '">',
			rows = xml.getAttribute('data').split(separators[0]),
			id = 0,
			rowNum = xml.hasAttribute('rows') ? parseInt(xml.getAttribute('rows')) : 3,
			tbodySetUp = false;

		var header = classes.indexOf('header') >= 0;

		for (i = 0; i < rows.length; i++) {
			var dataTag = "td";
			if (header == true && i == 0) {
				tableString += "<thead>";
				dataTag = "th";
			} else if (tbodySetUp == false) {
				tableString += "<tbody>";
				tbodySetUp = true;
			}
			tableString += '<tr>';

			var cells = rows[i].split(separators[1]);
			for (var j = 0; j < cells.length; j++) {
				if (xml.getAttribute('replace') != 'false') {
					if ($.trim(cells[j]) == '') {
						var textarea = '<textarea class="cell' + id + '" rows="' + rowNum + '"></textarea>';
						tableString += '<' + dataTag + ' class="editable">' + textarea + '</' + dataTag + '>';
						id++;

					} else if ($.trim(cells[j]) == (xml.hasAttribute('empty') ? xml.getAttribute('empty') : '[empty]')) {
						tableString += '<' + dataTag + '></' + dataTag + '>';
					} else {
						tableString += '<' + dataTag + '>' + cells[j] + '</' + dataTag + '>';
					}
				} else {
					tableString += '<' + dataTag + '>' + cells[j] + '</' + dataTag + '>';
				}
			}

			tableString += '</tr>';

			if (header == true && i == 0) {
				tableString += "</thead>";
			} else if (i == rows.length - 1) {
				tableString += "</tbody>";
			}
		}

		tableString += '</table>';

		return $('<div class="table">' + tableString + '</div>');
	};

	this.formatTableForDownload = function ($table, notAnsweredText) {
		var $tempTable = $('<div>').append($table.find('table').clone());

		$tempTable.find('textarea').each(function () {
			$(this).before('<em>' + ($(this).val().length == 0 ? notAnsweredText : $(this).val().replace(/\r?\n/g, '<br>')) + '</em>');
			$(this).remove();
		});

		$tempTable.find('table').attr('border', '1');

		return '<span style="font-style:">' + $tempTable.html() + '</span>';
	};

	this.download = function (blockid) {
		if (documentationBlock.checkRequired(blockid, currentPage)) {
			documentationBlock.postData(blockid, jGetElement(blockid, ".pageContents").data("docData"));
		}
	};

	this.showPage = function (blockid, page) {
		jGetElement(blockid, '.pagenumber').html(page + " / " + jGetElement(blockid, '.pages').children().length);
	};

	this.postData = function (blockid, data) {
		// remove anything that's excluded from document
		var temp = jQuery.extend(true, {}, data),
			i, j, k;

		for (i = 0; i < temp.pages.length; i++) {
			if (typeof temp.pages[i].sections == "undefined") {
				temp.pages[i].sections = [];
			}
			for (j = 0; j < temp.pages[i].sections.length; j++) {
				if (typeof temp.pages[i].sections[j].items == "undefined") {
					temp.pages[i].sections[j].items = [];
				}
				for (k = 0; k < temp.pages[i].sections[j].items.length; k++) {
					if (jQuery.isEmptyObject(temp.pages[i].sections[j].items[k])) {
						temp.pages[i].sections[j].items.splice(k, 1);
					}
				}
			}
		}

		temp.styles = jGetElement(blockid, '.pageContents').data('downloadStyles');
		temp.orientation = x_currentPageXML.getAttribute('fileOrientation') != '' && x_currentPageXML.getAttribute('fileOrientation') != undefined ? x_currentPageXML.getAttribute('fileOrientation') : 'portrait';
		temp.size = x_currentPageXML.getAttribute('fileOrientation') == 'landscape' ? '841.7pt 595.45pt' : '595.45pt 841.7pt';
		temp.h1 = x_currentPageXML.getAttribute('h1') != null ? x_currentPageXML.getAttribute('h1') : 20 + "px";
		temp.h2 = x_currentPageXML.getAttribute('h2') != null ? x_currentPageXML.getAttribute('h2') : 18 + "px";
		temp.h3 = x_currentPageXML.getAttribute('h3') != null ? x_currentPageXML.getAttribute('h3') : 16 + "px";
		temp.p = x_currentPageXML.getAttribute('p') != null ? x_currentPageXML.getAttribute('p') : 15 + "px";

		var form = document.createElement("form");
		form.method = 'post';
		form.target = 'displayjson';
		form.action = (typeof x_downloadURL != 'undefined') ? x_downloadURL : 'download.php';

		$('<input type="hidden">') // IE compatibility
			.attr({
				name: 'data',
				value: JSON.stringify(temp)
			})
			.appendTo(form);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	};
}
