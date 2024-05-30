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
var textHighlightBlock = new function () {
	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
	};

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		// resize panels to maximum possible height
		var textHolderH = jGetElement(blockid, '.textHolder').length > 0 ? jGetElement(blockid, '.textHolder').outerHeight(true) : 0,
			mainBtnHolderH = jGetElement(blockid, '.mainBtnHolder').length > 0 ? jGetElement(blockid, '.mainBtnHolder').outerHeight(true) : 0,
			panels = ['panelA', 'panelB'];

		for (var i = 0; i < panels.length; i++) {
			var $thisPanel = jGetElement(blockid, '.' + panels[i]),
				$thisPanelPaneHolder = $thisPanel.find('.paneHolder'),
				$thisPanelTabHolder = $thisPanel.find('.tabHolder');

			var availH;
			if (x_browserInfo.mobile == true) {
				availH = $x_mobileScroll.height() - $x_footerBlock.height() - mainBtnHolderH - (parseInt($thisPanel.css('padding-top')) * 2) - 4;
			} else {
				availH = $x_pageHolder.height() - textHolderH - mainBtnHolderH - (parseInt($x_pageDiv.css('padding-top')) * 2) - (parseInt($thisPanel.css('padding-top')) * 2) - 4;
			}

			$thisPanel.height(availH);

			// this resizing is for if the panel is a tabbed navigator
			$thisPanelPaneHolder.height($thisPanel.height() - $thisPanelTabHolder.outerHeight());
			$thisPanelPaneHolder.find('.navChild').height($thisPanelPaneHolder.height() - ($thisPanelPaneHolder.find('.navChild').outerHeight(true) - $thisPanelPaneHolder.find('.navChild').height()));
		}

		// resize the contenteditable divs within panels
		jGetElement(blockid, '.editableDiv').each(function () {
			textHighlightBlock.resizeEditable($(this));
		});
	};

	// function resizes contenteditable div
	this.resizeEditable = function ($editableDiv) {
		var btnHolderH = $editableDiv.parent().find('.btnHolder').length > 0 ? $editableDiv.parent().find('.btnHolder').outerHeight() : 0;
		$editableDiv.innerHeight(Math.floor($editableDiv.parents('.panel, .navChild').height() - btnHolderH));
	};

	this.leavePage = function (blockid) {
		if (jGetElement(blockid, '.pageContents').data('tracked') != true) {
			textHighlightBlock.finishTracking(blockid);
		}
	};

	this.init = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		let docData = {};
		jGetElement(blockid, '.pageContents').data({
			'mode': pageXML.getAttribute("mode"),
			'tracked': false
		});

		// tracking - there's no correct answer so tracking just saves highlighted text/notes text alongside the suggested text - any highlights/notes count as activity completed
		var weighting = pageXML.getAttribute("trackingWeight") != undefined ? pageXML.getAttribute("trackingWeight") : 1.0;
		var label = pageXML.getAttribute("trackinglabel") != null && pageXML.getAttribute("trackinglabel") != "" ? pageXML.getAttribute("trackinglabel") : $('<div>').html(pageXML.getAttribute('name')).text();
		//XTSetPageType(x_currentPage, 'numeric', 1, weighting);
		XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'text', weighting);
		var suggestedTxt = $('<div>').html(pageXML.getAttribute("suggestedText")).text();
		XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'text', label, [], suggestedTxt, [], pageXML.getAttribute("grouping"));
		XTSetLeavePage(x_currentPage, x_getBlockNr(blockid), this.leavePage);

		// get info about downloadable document if download is allowed
		if (pageXML.getAttribute('download') == 'true') {
			docData.documentName = pageXML.getAttribute('name');
			docData.orientation = pageXML.getAttribute('fileOrientation') != undefined ? pageXML.getAttribute('fileOrientation') : 'portrait';
			docData.size = docData.orientation == 'landscape' ? '841.7pt 595.45pt' : '595.45pt 841.7pt';
			docData.h1 = pageXML.getAttribute('h1') != null ? pageXML.getAttribute('h1') : 20 + "px";
			docData.h2 = pageXML.getAttribute('h2') != null ? pageXML.getAttribute('h2') : 18 + "px";
			docData.h3 = pageXML.getAttribute('h3') != null ? pageXML.getAttribute('h3') : 16 + "px";
			docData.p = pageXML.getAttribute('p') != null ? pageXML.getAttribute('p') : 15 + "px";


			// styles used in downloaded word doc
			var styles = '';
			styles += 'body, .ui-widget { font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; color: black; font-size: 12pt; } ';
			docData.styles = styles;

			if (pageXML.getAttribute('filename') && pageXML.getAttribute('filename').trim().length > 0) {
				docData.filename = pageXML.getAttribute('filename');
			}
		}

		// set up highlight / select style css
		var groupStyles = "<style type='text/css'>",
			highlightColour = x_getColour(pageXML.getAttribute('highlight1')),
			selectedColour = x_getColour(pageXML.getAttribute('highlight2'));
		groupStyles += " .initTxt *::selection {color:" + x_blackOrWhite(highlightColour) + "; background:" + highlightColour + ";} ";
		groupStyles += " .initTxt *::-moz-selection {color:" + x_blackOrWhite(highlightColour) + "; background:" + highlightColour + ";} ";
		groupStyles += "</style>";
		jGetElement(blockid, '.pageContents').prepend($(groupStyles));

		// selected style is added as inline css rather than a class so that it shows up in downloaded files - selected class is also used but just so the highlights can be easily removed
		jGetElement(blockid, '.pageContents').data("selectedStyle", "color:" + x_blackOrWhite(selectedColour) + "; background:" + selectedColour + ";");

		// if language attributes aren't in xml will have to use english fall back
		var selectBtnLabel = pageXML.getAttribute("selectBtn") == undefined ? "Select" : pageXML.getAttribute("selectBtn"),
			noteBtnLabel = pageXML.getAttribute("noteBtn") == undefined ? "Copy to Notes" : pageXML.getAttribute("noteBtn"),
			downloadBtnLabel = pageXML.getAttribute("downloadBtn") == undefined ? "Download" : pageXML.getAttribute("downloadBtn"),
			checkBtnLabel = pageXML.getAttribute("checkBtn") == undefined ? "Check" : pageXML.getAttribute("checkBtn"),
			clearBtnLabel = pageXML.getAttribute("clearBtn") == undefined ? "Clear" : pageXML.getAttribute("clearBtn"),
			resetBtnLabel = pageXML.getAttribute("resetBtn") == undefined ? "Reset" : pageXML.getAttribute("resetBtn"),
			initTxtLabel = pageXML.getAttribute("initTxtLabel") == undefined ? "Initial text - select text and copy to your notes" : pageXML.getAttribute("initTxtLabel"),
			initTxtLabel2 = pageXML.getAttribute("initTxtLabel2") == undefined ? "Initial text - select text before clicking highlight button" : pageXML.getAttribute("initTxtLabel2"),
			suggestedTxtLabel = pageXML.getAttribute("suggestedTxtLabel") == undefined ? "A suggested answer" : pageXML.getAttribute("suggestedTxtLabel"),
			notesTxtLabel = pageXML.getAttribute("notesTxtLabel") == undefined ? "Notes" : pageXML.getAttribute("notesTxtLabel");

		// sort layout of the different text fields & store the info that will be in the downloadable file
		var position = { top: [], left: [], panelA: [], panelB: [], lightbox: [] },
			submit = false,
			index = 0;

		// page text (instructions) - optional
		if (pageXML.getAttribute("text") != "") {
			position[pageXML.getAttribute("textPos")].push({ txt: pageXML.getAttribute("text"), title: pageXML.getAttribute("textTitle"), index: index, class: 'introTxt' });
			index++;

			if (pageXML.getAttribute('download') == 'true') {
				var txtInfo = { pageName: pageXML.getAttribute("textTitle"), pageText: pageXML.getAttribute("text") };
				docData.pages.push(txtInfo);
			}
		}

		// the initial text used for highlighting/note taking activity - mandatory
		position[pageXML.getAttribute("initialPos")].push({ txt: pageXML.getAttribute("initialText"), title: pageXML.getAttribute("initialTitle"), index: index, class: 'initTxt' });
		index++;

		if (pageXML.getAttribute('download') == 'true') {
			var txtInfo = { pageName: pageXML.getAttribute("initialTitle"), pageText: pageXML.getAttribute("initialText") };
			docData.pages.push(txtInfo);
		}

		// when in notes mode a text field for typing in will be on screen - placeholder text for this notes field is optional
		if (jGetElement(blockid, '.pageContents').data('mode') == 'Notes') {
			position[pageXML.getAttribute("notesPos")].push({ txt: pageXML.getAttribute("notesText") != undefined ? pageXML.getAttribute("notesText") : '', title: pageXML.getAttribute("notesTitle"), index: index, class: 'notesTxt' })
			index++;

			if (pageXML.getAttribute('download') == 'true') {
				var txtInfo = { pageName: pageXML.getAttribute("notesTitle"), pageText: pageXML.getAttribute("notesText") != undefined ? pageXML.getAttribute("notesText") : '' };
				docData.pages.push(txtInfo);
			}
		}

		// suggested text & feedback are optional but the activities probably make more sense if at least one is present
		if (pageXML.getAttribute("feedback") != undefined && pageXML.getAttribute("feedback") != "") {
			submit = true;
			position[pageXML.getAttribute("feedbackPos")].push({ txt: pageXML.getAttribute("feedback"), title: pageXML.getAttribute("feedbackTitle"), index: index, class: 'feedbackTxt', hide: true });
			index++;

			if (pageXML.getAttribute('download') == 'true') {
				var txtInfo = { pageName: pageXML.getAttribute("feedbackTitle"), pageText: pageXML.getAttribute("feedback") };
				docData.pages.push(txtInfo);
			}
		}

		if (pageXML.getAttribute("suggestedText") != "") {
			submit = true;
			position[pageXML.getAttribute("suggestedPos")].push({ txt: pageXML.getAttribute("suggestedText"), title: pageXML.getAttribute("suggestedTitle"), index: index, class: 'suggestedTxt', hide: true });
			index++;

			if (pageXML.getAttribute('download') == 'true') {
				var txtInfo = { pageName: pageXML.getAttribute("suggestedTitle"), pageText: pageXML.getAttribute("suggestedText") };
				docData.pages.push(txtInfo);
			}
		}

		// can't have text in two tabs & on left (not enough screen space) so move intro text to panel 1
		if (position.left.length > 0 && position.panelA.length > 0 && position.panelB.length > 0) {
			position.panelA.unshift(position.left[0]);
			position.left = [];
		}

		// add intro text to top or remove element if not needed
		if (position.top.length > 0) {
			jGetElement(blockid, '.textHolder').addClass('introTxt');
		} else {
			jGetElement(blockid, '.textHolder').remove();
		}

		// only one panel used so make sure it's panel A
		if (position.panelA.length == 0 && position.panelB.length > 0) {
			position.panelA = position.panelB;
			position.panelB = [];
		}

		// on mobiles the screen shouldn't be split - everything on left, panelA or panelB should move to panelA
		if (x_browserInfo.mobile == true) {
			position.panelA = position.left.concat(position.panelA, position.panelB);
			position.left = [];
			position.panelB = [];
		}

		// remember all the position info in case of page changes
		jGetElement(blockid, '.pageContents').data({
			'position': position,
			'docData': docData
		});

		// sort split screen & add required classes...
		var $contentHolder = jGetElement(blockid, '.contentHolder'),
			left = position.left.length > 0 ? 'left' : 'panelA',
			right = left == 'left' ? 'panelB' : position.panelB.length > 0 ? 'panelB' : undefined;

		if (right == undefined) {
			// no split screen needed
			$contentHolder.append('<div class="panel panelA"/>');

		} else {
			// create split screen layout
			$contentHolder
				.addClass('splitScreen')
				.append('<div class="left"></div><div class="right"><div class="panel"></div></div>');

			if (left == 'panelA') {
				$contentHolder.find('.left').append('<div class="panel panelA"></div>');
				$contentHolder.find('.right .panel').addClass('panelB');
			} else {
				$contentHolder.find('.right .panel').addClass('panelA');
				$contentHolder.find('.left').addClass('introTxt');
			}
		}

		// add info to the panels - if there's more than one thing to show on the panel then it will become tabbed navigator
		// an optional property also forces panels with one thing on to be tabbed navigator anyway
		var panels = ['panelA', 'panelB'];

		for (var i = 0; i < panels.length; i++) {
			var $thisPanel = $contentHolder.find('.' + panels[i]);

			// create tabs
			if (position[panels[i]].length > 1 || pageXML.getAttribute('forceTabs') == "true") {
				$thisPanel.removeClass('panel');

				var $thisTabHolder = $('<ul class="tabHolder"/>').appendTo($thisPanel),
					$thisPaneHolder = $('<div class="paneHolder"/>').appendTo($thisPanel);

				for (var j = 0; j < position[panels[i]].length; j++) {
					var tabTitle = position[panels[i]][j].title == null || position[panels[i]][j].title == '' ? ' ' : position[panels[i]][j].title;
					$thisTabHolder.append('<li class="navChildTitle" aria-hidden="false"><a id="' + panels[i] + 'Title_' + j + '" href="#' + panels[i] + '_' + j + '">' + tabTitle + '</a></li>');
					$thisPaneHolder.append('<div id="' + panels[i] + '_' + j + '" class="navChild ' + position[panels[i]][j].class + '" tabindex="0"/>')
				}

				$thisPanel.tabs({
					heightStyle: "content",
					activate: function (e, ui) {
						textHighlightBlock.resizeEditable(ui.newPanel.find('.editableDiv'));
						ui.newPanel.scrollTop(0);
					}
				});

				// tabs not needed
			} else if (position[panels[i]].length > 0) {
				$thisPanel.append('<div class="' + position[panels[i]][0].class + '">');
			}
		}

		// layout has been sorted - now add the content to the holders that have been set up
		$.each(position, function (key, info) {
			if (key != 'lightbox') {
				var hidden = 0;

				for (var i = 0; i < info.length; i++) {
					var $holder = jGetElement(blockid, '.' + info[i].class);

					if (info[i].class == 'initTxt' || info[i].class == 'notesTxt' || info[i].class == 'suggestedTxt') {
						$holder.append('<div class="' + info[i].class + '" contenteditable="true" spellcheck="false" class="editableDiv">' + info[i].txt + '</div>');

						if (info[i].class == 'initTxt') {
							$holder.append('<div class="' + info[i].class + 'BtnHolder" class="btnHolder"></div>');
						}

						// if download is enabled then keep track of the editable regions as we'll need to get text from these when download (might have changed)
						if (pageXML.getAttribute('download') == 'true') {
							if (jGetElement(blockid, '.pageContents').data('mode') == 'Notes' && info[i].class == 'notesTxt') {
								$holder.find('.editableDiv').data('docDataIndex', info[i].index);
							}

							if (jGetElement(blockid, '.pageContents').data('mode') == 'Highlight' && info[i].class == 'initTxt') {
								$holder.find('.editableDiv').data('docDataIndex', info[i].index);
							}
						}

						if (info[i].class == 'notesTxt') {
							if (info[i].txt != '') {
								$holder
									.addClass('placeHolder')
									.data('placeHolder', info[i].txt);
							} else {
								$holder.find('.editableDiv').html('<p></p>');
							}
						}

					} else {
						$holder.html(info[i].txt);
					}

					// hide suggestedTxt and feedbackTxt until work has been submitted
					if (info[i].hide == true) {
						var $pane = jGetElement(blockid, '.' + info[i].class);
						$pane.hide();
						hidden++;

						// in tab nav so tab also needs hiding
						if (this.length > 1 || pageXML.getAttribute('forceTabs') == "true") {
							if (x_browserInfo.mobile == true) {
								jGetElement(blockid, '.' + $pane.attr('aria-labelledby')).parent('.navChildTitle').hide();
							} else {
								jGetElement(blockid, '.' + $pane.attr('aria-labelledby')).parent('.navChildTitle').css('visibility', 'hidden');
							}
						}
					}
				}
			}
		});

		// set up contenteditable fields...
		// initial text has been set up as contenteditable so selection without mouse works easily & so it can still include HTML (images etc.) that textarea won't support
		// but need to intercept any attempts to change text as we don't actually want it to be editable
		jGetElement(blockid, '.initTxt, .suggestedTxt')
			.on('keypress paste dragover drop', function (e) {
				e.preventDefault();
			})
			.attr('aria-readonly', 'true');

		// also prevent editing of notes field when not in notes mode
		if (jGetElement(blockid, '.pageContents').data('mode') != 'Notes' || pageXML.getAttribute('allowTyping') == 'false') {
			jGetElement(blockid, '.notesTxt')
				.on('keypress paste dragover drop', function (e) {
					e.preventDefault();
				});

		} else if (pageXML.getAttribute('required') == "true") {
			jGetElement(blockid, '.notesTxt')
				.on('input', function (e) {
					if (pageXML.getAttribute('required') == 'true') {
						if (jGetElement(blockid, '.notesTxt').text().trim() != '') {
							jGetElement(blockid, ".checkBtn").prop('disabled', false);
						} else {
							jGetElement(blockid, ".checkBtn").prop('disabled', true);
						}
					}
				});
		}

		// add aria-labels for screen readers
		jGetElement(blockid, '.initTxt').attr('aria-label', jGetElement(blockid, '.pageContents').data('mode') == 'Notes' ? initTxtLabel : initTxtLabel2);
		jGetElement(blockid, '.suggestedTxt').attr('aria-label', suggestedTxtLabel);
		jGetElement(blockid, '.notesTxt').attr('aria-label', notesTxtLabel);


		// set up buttons...
		if (submit == false) {
			// select, clear & download buttons only - all go on the initialTxt panel
			jGetElement(blockid, '.initTxtBtnHolder').append('<button class="downloadBtn"></button><button class="selectBtn"></button><button class="clearBtn"></button>');
			jGetElement(blockid, '.mainBtnHolder').remove();
		} else {
			// select, clear, submit & download buttons
			// select on initialTxt panel & others at bottom
			jGetElement(blockid, '.initTxtBtnHolder').append('<button class="selectBtn"></button>');
			jGetElement(blockid, '.mainBtnHolder').append('<button class="downloadBtn"></button><button class="clearBtn"></button><button class="checkBtn"></button>');
		}

		// select button - depending on mode this either duplicates text or highlights it
		jGetElement(blockid, ".selectBtn")
			.button({
				label: jGetElement(blockid, '.pageContents').data('mode') == 'Notes' ? noteBtnLabel : selectBtnLabel
			})
			.click(function () {
				// selected sections of text can be moved to notes panel
				if (jGetElement(blockid, '.pageContents').data('mode') == 'Notes') {
					var selectedInfo = textHighlightBlock.getSelectionHTML();
					var selectedTxt = selectedInfo[0],
						selectedParent = selectedInfo[1];

					if ($(selectedParent).is('.initTxt') || $(selectedParent).parents('.initTxt').length > 0) {
						// wrap in p tag if plain text
						if (selectedTxt.charAt(0) != '<' || selectedTxt.charAt(selectedTxt.length - 1) != '>' || $('<div></div>').html(selectedTxt).text() == selectedTxt) {
							selectedTxt = '<p>' + selectedTxt + '</p>';
						}

						// move to notes panel & remove hightlight
						jGetElement(blockid, '.notesTxt').append(selectedTxt);
						window.getSelection().removeAllRanges();

						if (pageXML.getAttribute('required') == "true") {
							jGetElement(blockid, ".checkBtn").prop('disabled', false);
						}

						jGetElement(blockid, '.notesTxt').animate({ scrollTop: jGetElement(blockid, '.notesTxt').prop("scrollHeight") }, 1000);

					} else if (selectedTxt == '') {
						// nothing's been selected
						alert(pageXML.getAttribute("highlightTxt") == undefined ? "Selection error - no text selected" : pageXML.getAttribute("highlightTxt"));
					}

					// highlighted sections of text are marked up with css so they can be later compared with the suggested highlights
				} else {
					var selectedInfo = textHighlightBlock.getSelectionHTML();
					var selectedTxt = selectedInfo[0],
						selectedParent = selectedInfo[1];

					// wrap selected text in span to show permenant highlight
					if ($(selectedParent).parents('.initTxt').length > 0) {
						var selection = window.getSelection().getRangeAt(0),
							selectedTxt = selection.extractContents(),
							span = document.createElement("span");

						span.setAttribute('class', 'selected');
						span.setAttribute('style', jGetElement(blockid, '.pageContents').data('selectedStyle'));
						span.appendChild(selectedTxt);

						// nothing's been selected
						if ($(span).children().length == 0 && $(span).text() == '') {
							alert(pageXML.getAttribute("highlightTxt") == undefined ? "Selection error - no text selected" : pageXML.getAttribute("highlightTxt"));

						} else {
							selection.insertNode(span);

							// remove text highlight (leaving css highlight)
							window.getSelection().removeAllRanges();

							if (pageXML.getAttribute('required') == "true") {
								jGetElement(blockid, ".checkBtn").prop('disabled', false);
							}
						}

					} else if ($(selectedParent).is('.initTxt')) {
						// wrapping multiple paragraphs causes line break issues so avoid this
						alert(pageXML.getAttribute("errorTxt") == undefined ? "Selection error - you can not select content from more than one paragraph at a time" : pageXML.getAttribute("errorTxt"));
					} else if (selectedTxt == '') {
						// nothing's been selected
						alert(pageXML.getAttribute("highlightTxt") == undefined ? "Selection error - no text selected" : pageXML.getAttribute("highlightTxt"));
					}
				}
			});

		// clear button - depending on mode this either clears notes panel or clears highlights from initial text
		// also resets hidden areas if already submitted
		jGetElement(blockid, ".clearBtn")
			.button({
				label: jGetElement(blockid, '.pageContents').data('mode') != 'Notes' || jGetElement(blockid, '.notesTxt').hasClass('placeHolder') ? resetBtnLabel : clearBtnLabel
			})
			.click(function () {
				// clear the notes panel
				if (jGetElement(blockid, '.pageContents').data('mode') == 'Notes') {
					if (jGetElement(blockid, '.notesTxt').hasClass('placeHolder')) {
						jGetElement(blockid, '.notesTxt').html(jGetElement(blockid, '.notesTxt').data('placeHolder'));
					} else {
						jGetElement(blockid, '.notesTxt').html('<p></p>');
						jGetElement(blockid, ".clearBtn").button({ label: jGetElement(blockid, ".clearBtn").data('clearBtnLabel') });
					}

					// clear the highlights from the initTxt div
				} else {
					jGetElement(blockid, '.initTxt span.selected').contents().unwrap();
				}

				// disable check button if attempt required before feedback
				if (pageXML.getAttribute('required') == "true") {
					jGetElement(blockid, ".checkBtn").prop('disabled', true);
				}

				// if the activity has already been submitted then reset everything (hide suggestedTxt & feedbackTxt etc.)
				if (jGetElement(blockid, '.pageContents').data('submitted') == true) {
					jGetElement(blockid, '.pageContents').data('submitted', false);

					// rehide any bits bits of info that were hidden at the beginning of the activity
					$.each(jGetElement(blockid, '.pageContents').data('position'), function (key, info) {
						if (key == 'panelA' || key == 'panelB') {
							var hidden = 0,
								active = false;

							for (var i = 0; i < info.length; i++) {
								if (info[i].hide == true) {
									var $pane = jGetElement(blockid, '.' + info[i].class);
									$pane.hide();
									hidden++;

									// in tab nav so tab also needs hiding
									if (this.length > 1) {
										if (x_browserInfo.mobile == true) {
											jGetElement(blockid, '.' + $pane.attr('aria-labelledby')).parent('.navChildTitle').hide();
										} else {
											jGetElement(blockid, '.' + $pane.attr('aria-labelledby')).parent('.navChildTitle').css('visibility', 'hidden');
										}
									}
								} else if (this.length > 1 && active == false) {
									// if in tabbed navigator then make sure the 1st unhidden tab is active
									jGetElement(blockid, '.' + info[i].class).parents('.ui-tabs').tabs('option', 'active', i);
									active = true;
								}
							}
						}
					});
				}

				jGetElement(blockid, '.downloadBtn').prop('disabled', true);
			})
			.data({
				'resetBtnLabel': resetBtnLabel,
				'clearBtnLabel': clearBtnLabel
			});

		// check button - displays feedback & suggested answer text
		jGetElement(blockid, ".checkBtn")
			.button({
				label: checkBtnLabel
			})
			.click(function () {
				// show the suggestedTxt & feedbackTxt
				var show = ['feedbackTxt', 'suggestedTxt'],
					activateTab = true;

				for (var i = 0; i < show.length; i++) {
					var $show = jGetElement(blockid, '.' + show[i]);

					if ($show.length > 0) {
						// if in tab nav then show all related hidden bits too
						if ($show.attr('aria-labelledby') != undefined) {
							var $tab = jGetElement(blockid, '.' + $show.attr('aria-labelledby'));
							if (x_browserInfo.mobile == true) {
								$tab.parent('.navChildTitle').show();
							} else {
								$tab.parent('.navChildTitle').css('visibility', 'visible');
							}

							var activeTab = $show.parents('.ui-tabs').tabs('option', 'active');
							if (activeTab == $show.index()) {
								$show.show();
							}

							if (activateTab == true) {
								$show.parents('.ui-tabs').tabs('option', 'active', $show.index());
								activateTab = false;
							}

						} else {
							$show.show();
						}
					}
				}

				// if reset button label is 'clear' change to 'reset'
				if (jGetElement(blockid, '.pageContents').data('mode') == 'Notes' && !jGetElement(blockid, '.notesTxt').hasClass('placeHolder')) {
					jGetElement(blockid, ".clearBtn").button({ label: jGetElement(blockid, ".clearBtn").data('resetBtnLabel') });
				}

				// update data that will be used in downloadable document with changes made to any editable regions (highlights or notes)
				if (pageXML.getAttribute('download') == 'true') {
					jGetElement(blockid, '.editableDiv').each(function () {
						if ($(this).data('docDataIndex') != undefined) {
							docData.pages[$(this).data('docDataIndex')].pageText = $(this).html();
						}
					});

					jGetElement(blockid, '.downloadBtn').prop('disabled', false);
				}

				jGetElement(blockid, '.pageContents').data({
					'submitted': true,
					'tracked': true
				});

				textHighlightBlock.finishTracking(blockid);
				textHighlightBlock.sizeChanged(blockid);

				// only feedbackTxt can be in lightbox so no need to loop through them
				if (jGetElement(blockid, '.pageContents').data('position').lightbox.length > 0) {
					$.featherlight(jGetElement(blockid, '.pageContents').data('position').lightbox[0].txt);
					x_pageContentsUpdated();
				}
			});

		// download button - triggers download of all text on page
		if (pageXML.getAttribute('download') == 'true') {
			jGetElement(blockid, '.downloadBtn')
				.button({
					label: downloadBtnLabel
				})
				.click(function () {
					textHighlightBlock.postData(jGetElement(blockid, ".pageContents").data("docData"));
				})
				.prop('disabled', true)
				.prop('disabled', true);

		} else {
			jGetElement(blockid, ".downloadBtn").remove();
		}

		// is an attempt required before clicking check button?
		if (pageXML.getAttribute('required') == "true") {
			jGetElement(blockid, ".checkBtn").prop('disabled', true);
		}

		this.sizeChanged();
		x_pageLoaded();
	};

	this.getSelectionHTML = function () {
		var html = "",
			container = null;

		if (typeof window.getSelection != "undefined") {
			var sel = window.getSelection();
			if (sel.rangeCount) {
				var temp = document.createElement("div");
				for (var i = 0, len = sel.rangeCount; i < len; ++i) {
					temp.appendChild(sel.getRangeAt(i).cloneContents());
				}
				html = temp.innerHTML;

				var node = sel.getRangeAt(0).commonAncestorContainer;
				container = node.nodeType == 1 ? node : node.parentNode;
			}

			// IE
		} else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
			var textRange = document.selection.createRange();
			container = textRange.parentElement();
			text = textRange.htmlText;
		}

		return [html, container];
	};

	// function triggers the download of word document containing all the info on the screen
	this.postData = function (data) {
		debugger
		var form = document.createElement("form");
		form.method = 'post';
		form.target = 'displayjson';
		form.action = (typeof x_downloadURL != 'undefined') ? x_downloadURL : 'download.php';


		$('<input type="hidden">') // IE compatibility
			.attr({
				name: 'data',
				value: JSON.stringify(data)
			})
			.appendTo(form);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	};

	this.finishTracking = function (blockid) {
		var answerTxt;
		if (jGetElement(blockid, '.pageContents').data('mode') == 'Notes') {
			// if notes text has placeholder text only class as completed if the text here has changed
			if (jGetElement(blockid, '.notesTxt').hasClass('placeHolder') && jGetElement(blockid, '.notesTxt').html() != jGetElement(blockid, '.notesTxt').data('placeHolder')) {
				answerTxt = '';
			} else {
				answerTxt = jGetElement(blockid, '.notesTxt').html();
			}
		} else {
			if (jGetElement(blockid, '.initTxt').find('.selected').length > 0) {
				answerTxt = jGetElement(blockid, '.initTxt').html();
			} else {
				answerTxt = '';
			}
		}

		var answered = $(answerTxt).text().trim() == "" ? false : true;
		result = { success: answered, score: (answered == false ? 0.0 : 100.0) };
		XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, [], answerTxt, []);
		//XTSetPageScore(x_currentPage, (answered == false ? 0.0 : 100.0));
		jGetElement(blockid, '.pageContents').data('tracked', true);
	};

};
