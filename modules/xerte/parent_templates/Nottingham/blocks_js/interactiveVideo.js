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
var interactiveVideBlock = new function () {
	var $panelHolder,
		plugins = ["mediaconstructor", "textplus", "subtitleplus", "xot", "mediaplus", "mcq", "slides", "sortholder", "blockpanel"], // list of popcorn plugins to load
		css = ["subtitleplus", "mcq", "overlaygeneric", "slides"], // list of popcorn plugin css to load
		vidFullWatched,
		trackinglabel = "",
		toResize = false,
		isPlaying = false,
		isMuted = false,
		trackBarEnabled = true;


	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function () {
		this.panelbaseid = "panel_" + x_currentPage + '_';

		$panelHolder = $("#panelHolder");

		if ($("#pageContents").data("mediaElement") != undefined) {
			$("#pageContents").data("mediaElement").setCurrentTime(0);
		}

		$(".embed").each(function () {
			$(this).data("popcornInstance").pause();
		});

		// if audio is in footer (outside pageHolder) it will need reloading on every page change
		if ($("#pageContents").data("audioBar") == true && $x_footerBlock.find(".mainMedia").length == 0) {
			this.loadAudioInFooter();
		}

		this.setUp();
	};

	// function called from mediaPlayer.js when video player has been set up
	this.mediaFunct = function (mediaElement, mediaSrc) {
		if ($(mediaElement).closest(".mainMedia").length != 0) {
			$("#pageContents").data("mediaElement", mediaElement);
		}
	};

	// function called every time the size of the LO is changed
	this.sizeChanged = function () {
		$panelHolder = $("#panelHolder");
		var panels = $panelHolder.find(".panel");
		this.resizePanels();
	};

	this.resizePanels = function () {
		var zoomLevel = window.devicePixelRatio;
		var zoomCorrection = -1 / zoomLevel;
		// make sure no scroll bars are on screen during panel sizing
		var curroverflow = $x_pageHolder.css("overflow");
		$x_pageHolder.css("overflow", "hidden");
		var numTileH = $("#panelHolder .panel.tileH").length,
			numTileV = $("#panelHolder .panel.tileV").length;

		if (x_currentPageXML.getAttribute("layout") == "grid" && $("#panelHolder .top").length > 0) {
			numTileH = $("#panelHolder .top .panel.tileH").length;
		}

		var marginR = parseInt($panelHolder.find(".panel.tileH").css("margin-right")) == 0 ? 15 : parseFloat($panelHolder.find(".panel.tileH").css("margin-right"));

		$panelHolder.find(".panel.tileH")
			.width(Math.floor(($x_pageHolder.width() - (parseFloat($x_pageDiv.css("padding-left")) * 2) - (parseFloat($panelHolder.find(".panel.tileH").css("padding-left")) * numTileH * 2) - (marginR * (numTileH - 1))) / numTileH) - 2 + zoomCorrection);

		$panelHolder.css("margin-top", $("#infoHolder .accTitle").height() + parseFloat($("#infoHolder .accTitle").css("padding-top")) * 2);

		$panelHolder.find(".panel.tileV")
			.height(Math.floor(($x_mainHolder.height() - $x_headerBlock.height() - $x_footerBlock.height() - parseFloat($x_pageDiv.css("padding-top")) * 2) / numTileV) - (parseFloat($panelHolder.find(".panel.tileV").css("padding-top")) * 2) - Math.floor((parseInt($panelHolder.find(".panel.tileV").css("margin-bottom")) * (numTileV - 1)) / numTileV) - 2)
			.css('width', '');

		var infoHolderHeight = 0;
		if (x_currentPageXML.getAttribute("intro") != "" && x_currentPageXML.getAttribute("intro") != undefined) {
			var infoHolderHeight = $("#infoHolder .accTitle").height() + parseFloat($("#infoHolder .accTitle").css("padding-top")) * 2
		}

		$panelHolder.find(".panel.fullH")
			.height($x_mainHolder.height() - $x_headerBlock.height() - $x_footerBlock.height() -
				(parseFloat($x_pageDiv.css("padding-top")) * 2) - (parseFloat($panelHolder.find(".panel.fullH").css("padding-top")) * 2
					+ infoHolderHeight) - 5);

		$panelHolder.find(".panel.halfH")
			.height(Math.floor(($x_mainHolder.height() - $x_headerBlock.height() - $x_footerBlock.height() - (parseFloat($x_pageDiv.css("padding-top")) * 2) - (parseFloat($panelHolder.find(".panel.halfH").css("padding-top")) * 4) - parseInt($panelHolder.find(".panel.halfH").css("margin-bottom"))) / 2) - 2);

		$x_pageHolder.css("overflow", curroverflow);

		this.resizeMedia();
	};

	var vimeoFixed = false;
	// function resizes media controls
	this.resizeMedia = function ($holder) {
		// resize if the media is now the wrong size for its holder
		// this is done by manually triggering the window resize event (mediaelement.js listens to this event)

		var triggerResize = true;
		$(".popcornMedia video").each(function (i) {
			var $this = $(this),
				$popcornMedia = $this.closest(".popcornMedia");
			var holderHeight = toResize ? $('#trackBarHolder').height() : 0;
			var titleHeight = $(".panelTitle").outerHeight(true);

			var tempW = $popcornMedia.data("max-width");
			var tempH = $popcornMedia.data("max-height") - titleHeight - holderHeight;
			if (tempW > $popcornMedia.closest(".panel").width()) {
				var scale = $popcornMedia.closest(".panel").width() / tempW;
				tempW = $popcornMedia.closest(".panel").width();
				tempH = Math.floor(tempH * scale);
			}
			if (tempH > $popcornMedia.closest(".panel").height() - titleHeight - holderHeight) {
				var scale = ($popcornMedia.closest(".panel").height() - titleHeight - holderHeight) / tempH;
				tempH = $popcornMedia.closest(".panel").height() - titleHeight - holderHeight;
				tempW = Math.floor(tempW * scale);
			}

			$popcornMedia.css({
				"max-width": tempW,
				"max-height": tempH
			});

			$popcornMedia.children().each(function (i, e) {
				$(this).css("max-height", $(this).parent().css("max-height"));
			});

			if ($this.width() != $popcornMedia.width() && triggerResize == true) {
				triggerResize = false;
				$x_window.resize();
			}
			if ($popcornMedia.next().hasClass("transcriptHolder")) {
				$popcornMedia.next().width($popcornMedia.width());
			}
		});
		var ratio = 16 / 9;
		if ($(x_currentPageXML).children("mediaPanel").attr("aspectRatio") != undefined)
			ratio = parseFloat($(x_currentPageXML).children("mediaPanel").attr("aspectRatio"));
		$(".popcornMedia.embed").each(function (i) {
			resizeEmbededMedia($(this), { ratio: ratio });
		});

		$(".audioImg").each(function () {
			var $this = $(this);
			x_scaleImg($this, $this.closest(".panel").width(), $this.closest(".panel").height() - x_audioBarH, true, false);
			$this.closest(".mediaHolder").width($this.width());
		});

		$(".popcornMedia audio").each(function (i) {
			var audioBarW = 0;
			$(this).closest(".mejs-inner").find(".mejs-controls").children().each(function () {
				audioBarW += $(this).outerWidth();
			});
			if (audioBarW != $(this).closest(".popcornMedia").width() && triggerResize == true) {
				triggerResize = false;
				$x_window.resize();
			}
		});

		// 1) Resize trackbar holder. 2) Move slider. 3) Move all markers
		if (toResize == true && this.popcornInstance != null) {
			if ($(".mainMedia") != undefined) {
				$('#trackBarHolder').css("width", $(".mainMedia").width());
				UIWidth = 2 * parseFloat(($('.trackBarButton').outerWidth(true) + $('.trackBarTime').width() + 2 * parseFloat($('#trackBarRail').css("margin-left"))));
				newWidth = $('#trackBarHolder').width() - UIWidth;
				$('#trackBarRail').css("width", newWidth);
				frac = interactiveVideo.popcornInstance.currentTime() / interactiveVideo.popcornInstance.duration();
				sliderOffset = frac * ($('#trackBarRail').width() - $('#trackBarSlider').width());
				$('#trackBarSlider').css("left", sliderOffset);

				$(".trackBarEventMarker").each(function (i, e) {
					eventOffset = e.getAttribute("synchFrac") * $('#trackBarRail').width()
					e.style.left = eventOffset + "px";
					if ($('#marker_mandatory_' + i).length == 1) {
						$('#marker_mandatory_' + i).css("left", eventOffset - 0.25 * $('.trackBarEventMarkerMandatory').width());
					}
				});
				if (vimeoFixed == false) {
					if ($(x_currentPageXML).children("ivMediaPanel").attr("autoplay") == "true") {
						$('#playButton').removeClass('fa-x-play').addClass('fa-x-pause');
					}
					else {
						$('#playButton').removeClass('fa-x-pause').addClass('fa-x-play');
					}
				}
				$(".popcornMedia.vimeo").each(function (i) {
					if (vimeoFixed == false) {// || ($('#playButton').hasClass('fa-x-play') || $('#playButton').hasClass('fa-x-pause'))){
						$('#playButton').removeClass('fa-x-play').removeClass('fa-x-pause');
						$('#playButton').css("height", "0em");
						vimeoFixed = true;
					}
				});
			}
		}
		else if (toResize) { // no media loaded
			$("#panelHolder").html("No media was loaded.");
		}

		$panelHolder.find(".panel .fullH").each(function () {
			interactiveVideo.resizeContent($(this));
		});

		$panelHolder.find(".contentBlock.textplusHolder").each(function () {
			interactiveVideo.resizeContent($(this));
		});
	}

	// function resizes contentBlocks that should fill available space
	this.resizeContent = function ($holder) {
		var excludeH = $holder.data("exclude") != undefined ? $holder.data("exclude").outerHeight(true) : 0,
			$panel = $holder.parents(".panel");

		// if content is overlay on media then use media for max sizes
		if ($holder.parents(".panelContent").length == 0) {
			$panel = $holder.parents(".overlay").parent();
		}

		if (!$holder.data("max")) {
			$holder.height($panel.height() - (parseInt($panel.css("padding-top")) * 2) - $panel.find(".panelTitle").outerHeight() - excludeH);
		} else {
			$holder.css("max-height", $panel.height() - (parseInt($panel.css("padding-top")) * 2) - $panel.find(".panelTitle").outerHeight() - excludeH);
		}

		if ($holder.hasClass("googlemapHolder")) {
			//google.maps.event.trigger($holder.find(".gm-style")[0], "resize");
		}
	}

	this.isFullScreen = function () {
		if (document.fullscreenElement ||    // alternative standard method
			document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {  // current working methods
			return true;
		}
		else {
			return false;
		}
	};
	this.exitFullScreen = function () {
		if (document.fullscreenElement ||    // alternative standard method
			document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {  // current working methods
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
	};

	this.leavePage = function () {

		$this = this;

		$x_pageHolder.css("overflow", '');
		$(".embed").each(function () {
			$(this).data("popcornInstance").pause();
		});
		// Finish tracking of video
		// This will also account for last video segment, so there might be race conditions
		// Also we do let popcorn handle the destruction (doNotCloseTrackiong parameter in loadMedia) of popcorn, so we need to do that hear at the end
		vidFullWatched.segment.end = vidFullWatched.lastTime || -1;
		// Calculate page score
		var questions = x_currentPageXML.getElementsByTagName("synchMCQ");
		var numOfQuestions = questions.length;
		var trackVideo = x_currentPageXML.getAttribute('trackVideo') === 'yes' ||
			x_currentPageXML.getAttribute('trackVideo') === 'only_video' ||
			x_currentPageXML.getAttribute('trackVideo') === 'no_mcqs' && numOfQuestions == 0;

		score = 0;
		for (var i = 0; i < numOfQuestions; i++) {
			if ($this.questions[i]) {
				score++;
			}
		}
		mcqScore = score / numOfQuestions;

		let videoState = $this.popcornInstance.videoState;
		let progress = 0;
		if (videoState != undefined && trackVideo) {
			// Calculate progress
			progress = XThelperDetermineProgress(videoState);
		}
		let trackVideoSetting = 'no_mcqs';
		if (x_currentPageXML.getAttribute('trackVideo') != undefined) {
			trackVideoSetting = x_currentPageXML.getAttribute('trackVideo');
		}
		switch (trackVideoSetting) {
			case 'yes':
				totalScore = (mcqScore + progress) / 2;
				break;
			case 'only_video':
				totalScore = progress;
				break;
			case 'no_mcqs':
				if (numOfQuestions == 0) {
					totalScore = progress;
				} else {
					totalScore = mcqScore;
				}
				break;
			case 'no':
				if (numOfQuestions == 0) {
					// count as page with no interactions
					totalScore = 1;
				} else {
					totalScore = mcqScore;
				}
		}
		totalScore = Math.round(totalScore * 10000.0) / 100.0;
		XTSetPageScore(x_currentPage, totalScore);

		//Destroy popcornInstance
		if ($this.popcornInstance) {
			removeEvents($this.popcornInstance);
			$this.popcornInstance.destroy();
		}
		$("div.popcornMedia").remove();
	};

	this.loadMedia = function ($holder, type, data) {
		loadMedia($holder, type, data);
	}

	this.init = function () {
		this.panelbaseid = "panel_" + x_currentPage + '_';
		if (!!document.createElement("canvas").getContext) {
			// load popcorn library and plugins
			var loadFiles = true;
			if (xot_offline) {
				/* files are already loaded statically */
				loadFiles = false;
			}
			for (var i = 0; i < x_pageInfo.length; i++) {
				if (i != x_currentPage && x_pageInfo[i].type == x_pageInfo[x_currentPage].type && x_pageInfo[i].built != false) {
					// a page of this type has already been loaded - don't reload popcorn files
					loadFiles = false;
					break;
				}
			}

			if (loadFiles == true) {
				this.loadPopcorn();
			} else {
				this.setUp();
			}

		} else {
			$("#infoHolder, #panelHolder, #contentCover").remove();
			$("#pageContents").append('<p class="alert">' + x_getLangInfo(x_languageData.find("errorBrowser")[0], "label", "Your browser does not fully support this page type") + '</p>');
			x_pageLoaded();
		}
	}

	this.initTracking = function () {
		var questions = x_currentPageXML.getElementsByTagName("ivSynchMCQ");
		var numOfQuestions = questions.length;
		// Number the quesion in the order they appear in the editor

		trackinglabel = $('<div>').html(x_currentPageXML.getAttribute("name")).text();
		if (x_currentPageXML.getAttribute("trackinglabel") != undefined && x_currentPageXML.getAttribute("trackinglabel") != "") {
			trackinglabel = x_currentPageXML.getAttribute("trackinglabel");
		}
		interactiveVideo.questions = [];
		var nr = 0;
		$(questions).each(function (key, value) {
			value.setAttribute("total_questions", numOfQuestions);
			value.setAttribute("tracking_nr", nr);
			interactiveVideo.questions[nr] = false;
			nr++;
		});
		this.weighting = 1.0;
		if (x_currentPageXML.getAttribute("trackingWeight") != undefined) {
			this.weighting = x_currentPageXML.getAttribute("trackingWeight");
		}

		window.correctQuestions = 0;
		XTSetPageType(x_currentPage, 'numeric', numOfQuestions, this.weighting);
		//XTVideo(x_currentPage, trackinglabel, "", "initialized", vidFullWatched, x_currentPageXML.getAttribute("grouping"));
	};

	// function loads the popcorn files
	this.loadPopcorn = function () {
		$.getScript(x_templateLocation + "common_html5/js/popcorn/popcorn-complete.js")
			.done(function () {
				interactiveVideo.loadPlugins();
			})
			.fail(function (jqxhr, settings, exception) {
				console.log("Failed to load Popcorn.js & plugins" + exception);
			});
	}

	this.loadPlugins = function () {
		var i = 0;
		plugins.forEach(function (plugin) {
			var fileLocation = "common_html5/js/popcorn/plugins/popcorn." + plugin;
			if (jQuery.inArray(plugin, css) != -1) {
				x_insertCSS(x_templateLocation + fileLocation + ".css");
			}
			$.getScript(x_templateLocation + fileLocation + ".js")
				.done(function (setttings, textStatus) {
					if (++i >= plugins.length)
						interactiveVideo.setUp();
				})
				.fail(function (jqxhr, settings, exception) {
					console.log("Failed to load plugin:" + exception);
				});
		});
	}

	// function called when popcorn.js & plugin files have all loaded
	this.setUp = function () {
		// _____ SORT PAGE LAYOUT _____

		$panelHolder = $("#panelHolder");

		// Clear panelholder
		$panelHolder.html("");

		var panelData = $(x_currentPageXML).children(),
			panelLayout = "grid";

		var mediaFile = $(x_currentPageXML).children("ivMediaPanel").attr("media"),
			mediaType = "video",
			maxPanels = 4,
			mediaPanelIndex;

		// get index of media panel
		for (var i = 0; i < panelData.length; i++) {
			if (panelData[i].nodeName == "ivMediaPanel") {
				mediaPanelIndex = i;
				break;
			}
		}

		// get type of media (video/audio)
		if (mediaFile.indexOf(".mp3") != -1) {
			mediaType = "audio";

			// will audio appear in its own panel or across the bottom like narration?
			var audioPosition = panelData[mediaPanelIndex].getAttribute("audioPosition") == "bottom" && (panelData[mediaPanelIndex].getAttribute("audioImage") == "" || panelData[mediaPanelIndex].getAttribute("audioImage") == undefined) ? "bottom" : "panel";

			if (audioPosition == "bottom") {
				$("#pageContents").data("audioBar", true);
				this.popcornInstance = this.loadAudioInFooter();
				mediaPanelIndex = -1;
			}

		} else if (mediaFile.indexOf(".") == -1) {
			// no media
			mediaType = undefined;
			panelData.splice(mediaPanelIndex, 1);
			mediaPanelIndex = -1;
		}

		// if media is in a panel then make sure the number of panels doesn't exceed maxPanels
		if (mediaPanelIndex != -1 && panelData.length > maxPanels) {
			if (mediaPanelIndex >= maxPanels) {
				panelData.splice(maxPanels - 1, 0, panelData[mediaPanelIndex]);
				panelData.splice(mediaPanelIndex + 1, 1);
				mediaPanelIndex = maxPanels - 1;
			}
			panelData.splice(maxPanels, panelData.length - maxPanels);
		}

		// set up accordion if there's some intro text
		if (x_currentPageXML.getAttribute("intro") != "" && x_currentPageXML.getAttribute("intro") != undefined) {
			var $contentCover = $("#contentCover");
			$contentCover
				.css("background-image", 'url("' + x_templateLocation + 'common_html5/highlight.png")')
				.hide();

			var $infoHolder = $("#infoHolder"),
				closeTxt = x_currentPageXML.getAttribute("introClose") != undefined && x_currentPageXML.getAttribute("introClose") != "" ? x_currentPageXML.getAttribute("introClose") : "close";

			$infoHolder.find(".accContent").html('<div>' + x_addLineBreaks(x_currentPageXML.getAttribute("intro")) + '</div><div class="closeTxt"><a href="#">' + closeTxt + '</a></div>');
			$infoHolder.find(".accTitle a").html(x_currentPageXML.getAttribute("introTitle"));

			$infoHolder.accordion({
				icons: {
					header: "fa fa-x-acc-hide",
					activeHeader: "fa fa-x-acc-show"
				},
				collapsible: true,
				heightStyle: "content",
				beforeActivate: function (event, ui) {
					if ($(this).find("h3").hasClass("ui-state-active")) { //  close
						$contentCover.fadeOut();
					} else { // open
						$contentCover.fadeIn();
					}
				}
			});

			$infoHolder.find(".closeTxt a").add($contentCover).on("click", function () {
				$infoHolder.accordion("option", "active", false);
			});

			// Check if the accordion is open (it might be closed if you return to this page
			const $h3 = $("#infoHolder hr.ui-state-active");
			if ($h3.length > 0) {
				// infoHolder panel is open, show contentCover
				$("#contentCover").show();
			}

		} else {
			// no introduction text - remove accordion
			$("#infoHolder").remove();
			$("#contentCover").hide();
		}

		// create all panels, including the overlay panel
		for (var i = 0; i < panelData.length; i++) {
			var title = "";
			// give the panel a name
			if (panelData[i].getAttribute("name") != "") {
				title = '<h3 class="panelTitle">' + panelData[i].getAttribute("name") + '</h3>';
			}
			// mark the overlay panel and all its relevant children as such
			if (panelData[i].nodeName == "ivOverlayPanel") {
				$(panelData[i].children).each(function (j) {
					if (this.nodeName == "ivSynchSlides") {
						$(this.children).each(function (k) {
							this.setAttribute("overlayPan", "true");

						});
					}
					this.setAttribute("overlayPan", "true");
					this.setAttribute("clearPanel", "true");
				});
			}
			// name and id all other panels
			else {
				$('<div class="panel">' + title + '</div>')
					.appendTo($panelHolder)
					.attr("id", interactiveVideo.panelbaseid + i);
			}
		}
		// layouts where panels are roughly the same size - either in grid or stacked vertically/horizontally
		if (panelLayout == "tileH") {
			$panelHolder.find(".panel").addClass("tileH fullH");

		} else if (panelLayout == "tileV") {
			$panelHolder.find(".panel").addClass("tileV fullW");

		} else if (panelLayout == "grid") {
			if (panelData.length > 2) {
				$panelHolder.append('<div class="top"></div><div class="bottom"></div>');

				var panels = $panelHolder.find(".panel");

				for (var i = 0; i < panels.length; i++) {
					if (i < 2) {
						$(panels[i]).appendTo($panelHolder.find(".top")).addClass("tileH halfH");
					} else {
						$(panels[i]).appendTo($panelHolder.find(".bottom")).addClass("tileH halfH");
					}
				}

			} else if (panelData.length > 1) {
				var $mainHolder = $("#x_mainHolder");
				// Two panels. If in portrait mode, stack vertical, otherwise show horizontal
				// Use mainHolder, because height of panelHolder is not set on touch/mobile devices
				if ($mainHolder.width() >= $mainHolder.height()) {
					$panelHolder.find(".panel").addClass("tileH fullH");
				}
				else {
					$panelHolder.find(".panel").addClass("tileV fullW");
				}

			} else {
				$panelHolder.find(".panel").addClass("fullH");
			}

			// layouts where screen is split with large panel on one side and smaller panels on other side - can be horizontally or vertically
		} else if (panelLayout == "top" || panelLayout == "bottom") {
			$panelHolder.append('<div class="top"></div><div class="bottom"></div>');

			var panels = $panelHolder.find(".panel");

			if (panelLayout == "top") {
				for (var i = 0; i < panels.length; i++) {
					if (i == 0) {
						$(panels[i]).appendTo($panelHolder.find(".top")).addClass("fullW halfH");
					} else {
						$(panels[i]).appendTo($panelHolder.find(".bottom")).addClass("tileH halfH");
					}
				}

			} else if (panelLayout == "bottom") {
				for (var i = 0; i < panels.length; i++) {
					if (i == panels.length - 1) {
						$(panels[i]).appendTo($panelHolder.find(".bottom")).addClass("fullW halfH");
					} else {
						$(panels[i]).appendTo($panelHolder.find(".top")).addClass("tileH halfH");
					}
				}
			}

		} else {
			$panelHolder.append('<div class="splitScreen"><div class="left"></div><div class="right"></div></div>');

			var panels = $panelHolder.find(".panel");

			if (panelLayout == "left") {
				for (var i = 0; i < panels.length; i++) {
					if (i == 0) {
						$(panels[i]).appendTo($panelHolder.find(".left")).addClass("fullH");
					} else {
						$(panels[i]).appendTo($panelHolder.find(".right")).addClass("tileV");
					}
				}

			} else if (panelLayout == "right") {
				for (var i = 0; i < panels.length; i++) {
					if (i == panels.length - 1) {
						$(panels[i]).appendTo($panelHolder.find(".right")).addClass("fullH");
					} else {
						$(panels[i]).appendTo($panelHolder.find(".left")).addClass("tileV");
					}
				}
			}
		}

		this.resizePanels();


		// loadMedia & sortPopcorn are called below & also in the media plus plugin which deals with additional media added to panels

		// _____ LOAD MEDIA _____
		// Loading media is now handled by the mediaconstructor plugin. (22/12/2021)
		var mcqBool = true;
		this.isMCQ = (node) => {
			var childs = node.childNodes
			for (var i = 0; i < childs.length; i++) {
				if (childs[i].nodeName === 'synchMCQ') {
					mcqBool = false;
					console.log(childs[i].nodeName);
				}
				console.log(childs[i].nodeName);
				this.isMCQ(childs[i]);
			}
		}

		this.isMCQ(x_currentPageXML);
		var trackVideo = x_currentPageXML.getAttribute('trackVideo') === 'yes' ||
			x_currentPageXML.getAttribute('trackVideo') === 'only_video' ||
			x_currentPageXML.getAttribute('trackVideo') === 'no_mcqs' && mcqBool;
		var mediaPanelData = $(x_currentPageXML).children("ivMediaPanel");
		if (mediaPanelIndex != -1) {
			this.popcornInstance = loadMedia(
				$('#' + interactiveVideo.panelbaseid + mediaPanelIndex),
				mediaType,
				{
					tip: mediaPanelData.attr("tip"),
					width: mediaPanelData.attr("width"),
					height: mediaPanelData.attr("height"),
					media: mediaPanelData.attr("media"),
					autoplay: mediaPanelData.attr("autoplay"),
					aspect: mediaPanelData.attr("aspect"),
					transcript: mediaPanelData.attr("transcript"),
					transcriptBtnTxt: mediaPanelData.attr("transcriptBtnTxt"),
					audioImage: mediaPanelData.attr("audioImage"),
					audioImageTip: mediaPanelData.attr("audioImageTip"),
					pageName: "interactiveVideo",
					trackMedia: true,
					doNotCloseTracking: true
				},
				true
			);
		}

		// _____ BUILD TRACKBAR HOLDER ____

		// Build trackbar structure hierarchy and add it to the media panel.
		var $trackBarHolder = $('<div id="trackBarHolder"></div>')
			.appendTo($('#' + interactiveVideo.panelbaseid + mediaPanelIndex)[0]);
		var $playButton = $('<div id="playButton" class="trackBarButton fa fa-fw fa-x-pause" tabindex=0/>')
			.appendTo($trackBarHolder); 2
		var $trackBarTime = $('<div id="trackBarCurrentTime" class="trackBarTime">00:00:00</div>')
			.appendTo($trackBarHolder);
		var $trackBarRail = $('<div id="trackBarRail"></div>')
			.appendTo($trackBarHolder);
		var $trackBarSlider = $('<div id="trackBarSlider"></div>')
			.appendTo($trackBarRail);
		var $trackBarDuration = $('<div id="trackBarDuration" class="trackBarTime">00:00:00</div>')
			.appendTo($trackBarHolder);
		var $muteButton = $('<div id="muteButton" class="trackBarButton fa fa-fw fa-x-mute" tabindex=1/>')
			.appendTo($trackBarHolder);


		// Fit the structure to the panel by hijacking the main media margins.
		toResize = true;
		this.resizeMedia();

		// Handle interactivity of slider.
		var duration = 0;
		var mp = interactiveVideo.popcornInstance;

		$trackBarSlider.on('mousedown', function (e) {
			if ($playButton.hasClass('fa-x-play') == false && $playButton.hasClass('fa-x-pause') == false) {
				return;
			}
			mp.pause();
			var dr = $(this).addClass("drag").css("cursor", "pointer");
			xpos = dr.offset().left + dr.outerWidth() - e.pageX;

			minx = $trackBarRail.offset().left;
			maxx = $trackBarRail.width() + $trackBarRail.offset().left - dr.outerWidth();

			//convert video duration (s) to HH:MM:SS
			$trackBarDuration.text("" + new Date(mp.duration() * 1000).toISOString().substr(11, 8));

			$(document.body).on('mousemove', function (e) {
				var ileft = e.pageX + xpos - dr.outerWidth();
				newTime = mp.duration() * ((dr.offset().left - minx) / ($trackBarRail.width() - dr.outerWidth()));
				ileft = ileft <= minx ? minx : ileft >= maxx ? maxx : ileft;

				if (dr.hasClass("drag")) {
					dr.offset({ left: ileft });
					$trackBarTime.text((new Date(newTime * 1000).toISOString().substr(11, 8)));
				}
			}).on('mouseup', function (e) {
				offset = $trackBarSlider.offset().left - $trackBarRail.offset().left;
				mp.currentTime(mp.duration() * ((dr.offset().left - minx) / ($trackBarRail.width() - dr.outerWidth())));
				dr.removeClass("drag");
			});
		});
		$trackBarRail.on('hover', function (e) {
			if ($playButton.hasClass('fa-x-play') == false && $playButton.hasClass('fa-x-pause') == false) {
				return;
			}
			$(this).css("cursor", "pointer")
		}).on('mousedown', function (e) {
			if ($playButton.hasClass('fa-x-play') == false && $playButton.hasClass('fa-x-pause') == false) {
				return;
			}
			$trackBarSlider.offset({ left: e.pageX });
			mp.currentTime(mp.duration() * (e.offsetX / $trackBarRail.width()));
		});
		$playButton.on('click', function (e) {
			if (isPlaying) {
				mp.pause();
			}
			else {
				mp.play();
			}
		});
		$muteButton.on('click', function (e) {
			if ($(this).hasClass('fa-x-mute')) {
				mp.mute();
				isMuted = true;
				$(this).removeClass('fa-x-mute').addClass('fa-x-unmute');
			}
			else {
				mp.unmute();
				isMuted = false;
				$(this).removeClass('fa-x-unmute').addClass('fa-x-mute');
			}
		});

		keyPressHandler = function (e) {
			if (trackBarEnabled == true) {
				time = mp.currentTime();
				switch (e.key) {
					case "m":
						if (isMuted) {
							mp.unmute();
							isMuted = false;
							$muteButton.removeClass('fa-x-unmute').addClass('fa-x-mute');
						}
						else {
							mp.mute();
							isMuted = true;
							$muteButton.removeClass('fa-x-mute').addClass('fa-x-unmute');
						}
						break;
					case "k":
					case " ":
						if ($playButton.hasClass('fa-x-play') || $playButton.hasClass('fa-x-pause')) {
							if (isPlaying) {
								mp.pause();
							} else {
								mp.play();
							}
						}
						break;
					case "l":
						if ($playButton.hasClass('fa-x-play') || $playButton.hasClass('fa-x-pause')) {
							mp.currentTime(time + 10);
						}
						break;
					case "j":
						if ($playButton.hasClass('fa-x-play') || $playButton.hasClass('fa-x-pause')) {
							mp.currentTime(time - 10);
						}
						break;
				}
			}
		}

		document.addEventListener("keypress", keyPressHandler);

		//Append the OVERLAY PANEL to the main media.
		for (i = 0; i < panelData.length; i++) {
			if (panelData[i].nodeName == "ivOverlayPanel") {
				$('<div class="overlay" id="mydiv"></div>')
					.appendTo($('#' + interactiveVideo.panelbaseid + mediaPanelIndex).children(".mainMedia"))
					.attr("id", interactiveVideo.panelbaseid + i)
					.hide();
				$('<div class="overlayGray"></div>')
					.appendTo($('#' + interactiveVideo.panelbaseid + mediaPanelIndex).children(".mainMedia"))
					.attr("id", "overlay")
					.hide();
				$('<div class="overlayGray"></div>')
					.appendTo($('#' + interactiveVideo.panelbaseid + mediaPanelIndex).children(".mainMedia"))
					.attr("id", "overlayGray")
					.hide();
				//.css("opacity", "0.75")
				break;
			}
		}
		$("#overlay").on('click', function (e) {
			if (isPlaying) {
				mp.pause();
			}
			else {
				mp.play();
			}
		});

		$(".panel").each(function (i) {
			if (i == 0)
				$('<div id="panelContent' + 0 + '" class="panelContent" />').appendTo($(this));
			else
				$('<div id="panelContent' + i + '" class="panelContent" style="height: 80%"/>').appendTo($(this));
		});

		// _____ SORT & CREATE SYNCH POINT EVENTS FOR EACH PANEL _____
		if (this.popcornInstance != undefined) {
			if (vidFullWatched == null || vidFullWatched == undefined) {
				vidFullWatched = {
					time: 0,
					prevTime: 0,
					lastTime: 0,
					duration: this.popcornInstance.duration(),
					synchName: "video",
					watched: [],
					segments: [],
					segment: { start: 0, end: -1 }
				}
			}

			panelData.each(function (i) {
				interactiveVideo.sortPopcorn($(this).children(), interactiveVideo.panelbaseid + i, interactiveVideo.popcornInstance, $(".mainMedia"));
			});
			//Adds events to popcorn
			this.addEvents();
		}
		this.initTracking();
		x_pageLoaded();
	};

	this.addEvents = function () {
		this.popcornInstance.on("timeupdate", function () {
			$("#overlayGray").hide();
			vidFullWatched = addTrackingOnTimeUpdate(interactiveVideo.popcornInstance, vidFullWatched);
			interactiveVideo.enableControls(this.media, false, true);

			//Update time and Slider location on trackbar timeline
			var popTime = interactiveVideo.popcornInstance.currentTime();
			$('#trackBarCurrentTime').text(convertTime(popTime));
			$('#trackBarDuration').text(convertTime(interactiveVideo.popcornInstance.duration()));
			$slider = $('#trackBarSlider');
			frac = popTime / interactiveVideo.popcornInstance.duration();
			sliderOffset = frac * ($('#trackBarRail').width() - $slider.width());
			$slider.css("left", sliderOffset);

			function convertTime(seconds) {
				if ($.isNumeric(seconds)) {
					return new Date(seconds * 1000).toISOString().substr(11, 8);
				}
				return "00:00"
			}
		});
		this.popcornInstance.on("play", function () {
			vidFullWatched = addTrackingOnPlay(interactiveVideo.popcornInstance, vidFullWatched);
			$("#overlay").hide();
			$("#overlayGray").hide();
			$('#playButton').removeClass('fa-x-play').addClass('fa-x-pause');
			isPlaying = true;
		});
		this.popcornInstance.on("pause", function () {
			vidFullWatched = addTrackingOnPause(interactiveVideo.popcornInstance, vidFullWatched);
			$('#playButton').removeClass('fa-x-pause').addClass('fa-x-play');
			console.log("Pause   : " + interactiveVideo.popcornInstance.currentTime());
			isPlaying = false;
		});
		this.popcornInstance.on("seeked", function () {
			vidFullWatched = addTrackingOnSeeked(interactiveVideo.popcornInstance, vidFullWatched);
			console.log("Seeked  : " + interactiveVideo.popcornInstance.currentTime() + ", prevTime=" + vidFullWatched.prevTime);
		});
		this.popcornInstance.on("ended", function () {
			vidFullWatched = addTrackingOnEnded(interactiveVideo.popcornInstance, vidFullWatched);
			console.log("End     : " + interactiveVideo.popcornInstance.currentTime());
		});
	};

	this.removeEvents = function () {
		if (this.popcornInstance != null) {
			this.popcornInstance.off("timeupdate");
			this.popcornInstance.off("play");
			this.popcornInstance.off("pause");
			this.popcornInstance.off("seeked");
			this.popcornInstance.off("ended");
		};
	}

	this.getBlock = function (time) {
		if (blocks.length == 0) {
			return null;
		}
		for (var i = 0; i < blocks.length; i++) {
			if (parseFloat(blocks[i].synchStart) + parseFloat(blocks[i].duration) > time) {
				return blocks[i];
			}
		}
		return blocks[i];
	};

	// helper function for lookupTable, called on time updates, checks what part of a video block is being watched (in %).
	this.updateTable = function (block, current) {
		if (block != null) {
			if (block.duration < 30) {
				var i = Math.round((current - block.synchStart) / block.duration * 20) * 5;
			}
			else {
				var i = Math.round((current - block.synchStart) / block.duration * 100);
			}
			block.watched[i] = 1;
			if (i == 100) {
				this.sendXAPI(block, 100);
			}
		}
	};

	this.sendXAPI = function (block, percentageWatched) {
		//if (block != null)
		//TSetViewed(x_currentPage, block.synchName, percentageWatched)
	};

	// function calculates the time watched within a video block based on an array (in %).
	this.lookupTable = function (block) {
		var playedTime = 0;
		if (block == null || block.watched == undefined || block.duration == undefined) {
			return 0;
		}
		if (block.duration >= 30) {
			for (var i = 1; i < 100; i++) {
				if (block.watched[i] == 1) {
					playedTime++;
				}
			}
		}
		else {
			for (var i = 1; i < 100; i++) {
				if (block.watched[i] == 1) {
					playedTime += 5;
				}
			}
		}
		return playedTime;
	}
	// function loads media - can be either main media in media panel or additional media to appear in another panel (called from media plugin)
	this.loadMedia = function ($holder, mediaType, mediaData, mainMedia) {
		var $mediaHolder,
			popcornInstance,
			classes = "popcornMedia";

		if (mainMedia == true) {
			classes += " mainMedia";
		}

		if (mediaType == "video") {
			// load video - max dimensions set in mediaMetaData function below when dimensions received
			$mediaHolder = $holder;
			var $myVideo = $('<div class="' + classes + '"/>').appendTo($mediaHolder);

			// is it from youtube or vimeo?
			if (mediaData.media.indexOf("www.youtube.com") != -1 || mediaData.media.indexOf("//youtu") != -1) {
				var $youTube = $holder.find(".popcornMedia").addClass("youTube");
				$youTube.attr("aspect", mediaData.aspect);
				interactiveVideo.resizeYouTube($youTube);
				var urlsep = (mediaData.media.indexOf("?") < 0 ? "?" : "&");
				popcornInstance = Popcorn.smart("#" + $holder.attr("id") + " .youTube", mediaData.media + urlsep + "controls=2&playsinline=1"); // force controls to appear, and force online play on iPhone
				$youTube.data("popcornInstance", popcornInstance);
				if (mediaData.autoplay == "true") {
					popcornInstance.play();
				}

			} else if (mediaData.media.indexOf("vimeo.com") != -1) {
				var $vimeo = $holder.find(".popcornMedia").addClass("vimeo");
				$vimeo.attr("aspect", mediaData.aspect);
				interactiveVideo.resizeVimeo($vimeo);
				popcornInstance = Popcorn.smart("#" + $holder.attr("id") + " .vimeo", mediaData.media);
				$vimeo.data("popcornInstance", popcornInstance);
				if (mediaData.autoplay == "true") {
					popcornInstance.play();
				}
			} else if (mediaData.media.indexOf("mediamission.nl") != -1) {
				var $mediasite = $holder.find(".popcornMedia").addClass("mediasite");

				$mediasite.attr("aspect", mediaData.aspect);
				interactiveVideo.resizeMediasite($mediasite);

				popcornInstance = Popcorn.smart("#" + $holder.attr("id") + " .mediasite", mediaData.media);
				$mediasite.data("popcornInstance", popcornInstance);
				if (mediaData.autoplay == "true") {
					popcornInstance.play();
				}
			} else {
				$myVideo
					.attr("title", mediaData.tip)
					.css("margin", "0 auto")
					.mediaPlayer({
						type: "video",
						source: mediaData.media,
						width: "100%",
						height: "100%",
						autoPlay: mediaData.autoplay,
						pageName: "interactiveVideo"
					});

				popcornInstance = Popcorn("#" + $holder.attr("id") + " video");
				if (mainMedia == true) {
					$("#" + $holder.attr("id") + " video").attr('id', 'mainVideo');
				} else {
					$("#" + $holder.attr("id") + " video").attr('id', 'video_'
						+ $("#" + $holder.attr("id") + " video").parents('.mejs-video').attr('id'));
				}
			}

		} else if (mediaType == "audio") {
			// load audio in panel - width is either with of audioImage (if exists) or full width of panel
			$mediaHolder = $('<div class="mediaHolder"></div>').appendTo($holder);
			var $myAudio = $('<div class="' + classes + '"/>').appendTo($mediaHolder);

			$myAudio
				.attr("title", mediaData.tip)
				.mediaPlayer({
					type: "audio",
					source: mediaData.media,
					width: "100%",
					autoPlay: mediaData.autoplay
				});

			popcornInstance = Popcorn("#" + $holder.attr("id") + " audio");
			if (mainMedia == true) {
				$("#" + $holder.attr("id") + " audio").attr('id', 'mainAudio');
			} else {
				$("#" + $holder.attr("id") + " audio").attr('id', 'audio_' +
					$("#" + $holder.attr("id") + " audio").parents('.mejs-audio').attr('id'));
			}

			if (mediaData.audioImage != "" && mediaData.audioImage != undefined) {
				var $imgHolder = $('<div class="audioImgHolder"></div>').insertBefore($myAudio),
					$img = $('<img class="audioImg" style="visibility: hidden" />').appendTo($imgHolder);

				$img
					.one("load", function () {
						x_scaleImg(this, $holder.width(), $holder.height() - x_audioBarH, true, true);
						$mediaHolder.width($(this).width());
						interactiveVideo.resizeMedia();
					})
					.attr("src", x_evalURL(mediaData.audioImage))
					.each(function () { // called if loaded from cache as in some browsers load won't automatically trigger
						if (this.complete) {
							$(this).trigger("load");
						}
					});
				if (mediaData.audioImageTip != "" && mediaData.audioImageTip != undefined) {
					$img.attr("alt", mediaData.audioImageTip);
				}
			}
		}

		// add transcript to media panel if required
		if (mediaData.transcript != "" && mediaData.transcript != undefined) {
			$mediaHolder.append('<div class="transcriptHolder"><div class="transcript">'
				+ x_addLineBreaks(mediaData.transcript) + '</div><button class="transcriptBtn"></button></div>');
			$mediaHolder.find(".transcript").hide();
			$mediaHolder.find(".transcriptBtn")
				.button({
					icons: { secondary: "fa fa-x-btn-hide" },
					label: mediaData.transcriptBtnTxt != undefined && mediaData.transcriptBtnTxt != "" ? mediaData.transcriptBtnTxt : "Transcript"
				})
				.click(function () {
					// transcript slides in and out of view on click
					var $transcript = $(this).prev(".transcript");
					if ($transcript.is(":hidden") == true) {
						$(this).button({ icons: { secondary: "fa fa-x-btn-show" } });
						$transcript.slideDown();
					} else {
						$transcript.slideUp();
						$(this).button({ icons: { secondary: "fa fa-x-btn-hide" } });
					}
				});

			if (mediaType == "video") {
				$mediaHolder.find(".transcriptHolder")
					.width($mediaHolder.find(".popcornMedia").width())
					.css("margin", "0 auto");
			}
		}
		return popcornInstance;
	}

	// function loads audio in the footer bar (like narration) when it doesn't go in a panel
	this.loadAudioInFooter = function () {
		var $mainAudio = $('<div class="x_pageNarration popcornMedia mainMedia"/>').insertBefore($("#x_footerBlock div:first"));
		$mainAudio
			.attr("title", $(x_currentPageXML).children("ivMediaPanel").attr("tip"))
			.mediaPlayer({
				type: "audio",
				source: $(x_currentPageXML).children("ivMediaPanel").attr("media"),
				width: "100%",
				autoPlay: $(x_currentPageXML).children("ivMediaPanel").attr("autoplay")
			});
		return Popcorn(".mainMedia audio");
		x_updateCss(false);
	}

	// the following three functions sort synchData (so events have correct start / end points), 
	// creates popcorn instance and calls plugins to create synch points
	// function can be called for mainMedia & additional media from mediaPlus plugin
	this.sortPopcorn = function (synchData, targetRef, popcornInstance, $mediaDiv) {
		// wait until metadata has loaded before continuing
		if (popcornInstance.duration()) {
			interactiveVideo.sortPopcornNow(synchData, targetRef, popcornInstance, $mediaDiv);
		} else if (popcornInstance.media._util != undefined && popcornInstance.media._util.type == "Vimeo") {
			function onMessageReceived(event) {
				if (!(/^https?:\/\/player.vimeo.com/).test(event.origin)) {
					return false;
				}

				var data = JSON.parse(event.data);
				if (data.event == "loadProgress") {
					$mediaDiv.data("duration", data.data.duration);
					interactiveVideo.sortPopcornNow(synchData, targetRef, popcornInstance, $mediaDiv);
					window.removeEventListener("message", onMessageReceived, false);
					// ** vimeo events are unreliable. Sometimes they only start working after play/pause/play again - can't work out why.
					// Possible issue in popcorn.js itself
				}
			}
			window.addEventListener("message", onMessageReceived, false);
		} else {
			popcornInstance.on("loadedmetadata", function () {
				interactiveVideo.sortPopcornNow(synchData, targetRef, popcornInstance, $mediaDiv);
			});
		}
	};

	// function gets correct synch point - either from absolute value or by converting relative synch points (relative are in format "+5")
	this.sortRelativeSynchPoints = function (type, thisSynch, relativeTo, defaultEnd) {
		var synch;
		if (type == "start") {
			if (thisSynch[0] == "+") {
				// relative start synch is to previous sibling on panel
				synch = $.isNumeric(thisSynch.slice(1)) ? Number(thisSynch.slice(1)) : 0;
				synch += relativeTo;
			} else {
				synch = $.isNumeric(thisSynch) ? Number(thisSynch) : 0;
			}
		} else {
			if (thisSynch != undefined && thisSynch[0] == "+") {
				// relative end synch is to its own start point
				synch = $.isNumeric(thisSynch.slice(1)) ? Number(thisSynch.slice(1)) : defaultEnd;
				synch += relativeTo;
			} else {
				synch = $.isNumeric(thisSynch) ? Number(thisSynch) : defaultEnd;
			}
		}
		return synch;
	};

	this.sortPopcornNow = function (synchData, targetRef, popcornInstance, $mediaDiv) {
		var data = new Array(), // array of objects containing details of a synch point event
			prevStart = 0,
			start, end;
		if ($(synchData).context.getAttribute("overlay")) {
			$(synchData).each(function () {
				this.overlay = true;
			});
		}
		$(synchData).each(function (j) {
			// ignore the media synchCues as they will be set up separately
			if (this.nodeName != "synchCue") {
				if (this.nodeName != "synchSubtitlePlus") {
					start = interactiveVideo.sortRelativeSynchPoints("start", this.getAttribute("synchStart"), prevStart);
					end = interactiveVideo.sortRelativeSynchPoints("end", this.getAttribute("synchEnd"), start, undefined);
					prevStart = start;
				} else {
					// there's no start or end synch on subtitle holder - 
					// store previous sibling's start for relative synching to be done against
					start = 0;
				}
				data.push({
					type: this.nodeName,
					start: start,
					end: end,
					target: targetRef + "_" + j,
					optional: this.getAttribute("optional"),
					allInfo: this
				});

				if ($(this).children().length > 0) {
					if (this.nodeName == "synchMediaPlus") {  //TODO What is this? Nodename does not exist
						// store child data of media content as they aren't synced to the mainMedia
						data[data.length - 1].childNodes = $(this).children();
					} else {
						var $parent = $(this),
							syncChildren = true,
							prevStartII = prevStart;

						this.setAttribute("child", false);
						$parent.children().each(function (k) {
							// if child nodes have a synch point then include their details too
							// with reference to the parent as this will create the holder for the child
							// e.g. for subtitles the parent creates a holder and 1st caption
							// the children then have their own synch points and load in the same holder
							if (this.getAttribute("synchStart") == undefined) {
								syncChildren = false;
							} else {
								// if no end point is set force it to be at the start of the next child
								//otherwise it won't revert if rewinding (if no next child then use parent synchEnd)
								// this won't be right if the next child is using relative synching so it's fixed later after that has been calculated
								var defaultEnd = $parent.children()[k + 1] ? $parent.children()[k + 1].getAttribute("synchStart") : $.isNumeric($parent[0].getAttribute("synchEnd")) ? ($parent[0].getAttribute("synchEnd")[0] == "+" ? end : Number($parent[0].getAttribute("synchEnd"))) : undefined;
								this.setAttribute("child", true);

								var start = interactiveVideo.sortRelativeSynchPoints("start", this.getAttribute("synchStart"), prevStartII),
									end = interactiveVideo.sortRelativeSynchPoints("end", this.getAttribute("synchEnd"), start, defaultEnd);
								prevStartII = start;
								data.push({
									type: $(this).parent()[0].nodeName,
									start: start,
									end: end,
									target: targetRef + "_" + j, // ref. to parent synch point to make sure it loads in correct place
									optional: $(this).parent()[0].optional,
									allInfo: this
								});
							}
						});
						// store child data if children aren't being synced to media so plugin can use it
						if (syncChildren == false) {
							data[data.length - 1].childNodes = $(this).children();
						}
					}
				}
			} else {
				start = interactiveVideo.sortRelativeSynchPoints("start", this.getAttribute("synch"), prevStart);
				prevStart = start;
				this.setAttribute("synch", start);
				if (this.getAttribute("destination") != undefined && this.getAttribute("destination")[0] == "+") {
					this.setAttribute("destination", Number(this.getAttribute("destination").slice(1)) + start);
				}
			}
		});

		// fixes any end points that weren't calculated right because of relative synching
		for (var j = 0; j < data.length; j++) {
			if (data[j].end != undefined && data[j].end[0] == "+") {
				data[j].end = data[j + 1].start;
			}
		}

		// sort panel synch events into order (of start synch point)
		data.sort(function (a, b) {
			if (a.start > b.start) {
				return 1;
			}
			if (a.start < b.start) {
				return -1;
			}
			return 0;
		});

		// add end points for content already on panel if they are to be removed with "Empty Panel" or because new content clears panel
		for (var j = 0; j < data.length; j++) {
			// is content to be cleared?
			if (data[j].type == "synchEmpty" || data[j].allInfo.getAttribute("clearPanel") == "true") {
				var thisStart = data[j].start;
				for (var k = 0; k < j; k++) {
					// does previous content need end time added because it's being cleared by next content block?
					if ((data[k].end == undefined || data[k].end > thisStart) && (data[k].type != "synchEmpty" && data[k].type != "synchCue" && data[k].type != "synchSubtitlePlus")) {
						data[k].end = thisStart;
					}
				}
			}
		}

		// set end point to end of media if still undefined
		for (var j = 0; j < data.length; j++) {
			if (data[j].end == undefined && data[j].type != "synchEmpty" && data[j].type != "synchCue") {
				if (popcornInstance.duration()) {
					data[j].end = popcornInstance.duration() - 1;
				} else {
					data[j].end = $mediaDiv.data("duration") - 1;
				}
				data[j].autoEnd = true;
			}
		}

		// _____ ADD EVENTS FOR EACH SYNCH POINT _____
		// add pause points for mainMedia/mediaPlus
		for (var j = 0; j < synchData.length; j++) {
			if (synchData[j].nodeName == "synchCue") {
				interactiveVideo.setUpPopcornCue(popcornInstance, synchData[j]);
			}
		}
		let amountOfInteractiveBlocks = 0;
		let blockNrOffset = 0;
		// add all other synch events
		for (var j = 0; j < data.length; j++) {
			// each synch event
			var thisContent = data[j],
				pluginName = thisContent.type.split("ivSynch")[1].toLowerCase();
			// ____ ADD SYNCH EVENT ON SLIDER ____
			// Clear Content should not be counted as an event.
			if (thisContent.type != "synchEmpty") {
				var $eventMarker = $('<div id=marker_' + j + ' class="trackBarEventMarker ui-icon-play"></div>')
					.appendTo($('#trackBarRail'));
				var duration = isNaN(popcornInstance.duration()) ? $mediaDiv.data("duration") : popcornInstance.duration();
				frac = thisContent.start / duration
				// Do not add this event to the timeline if it doesn't occur during the duration of the video.
				if (frac < 0 || frac > 1) {
					$eventMarker.remove();
				}
				else {
					$eventMarker.attr("synchFrac", frac);
					eventOffset = frac * $('#trackBarRail').width();
					$eventMarker.css("left", eventOffset);
					if (thisContent.optional == "false") {
						$eventMarkerMandatory = $('<div id=marker_mandatory_' + j + ' class="trackBarEventMarkerMandatory"></div>')
							.appendTo($('#trackBarRail'));
						$eventMarkerMandatory.css("left", eventOffset - $eventMarkerMandatory.width() * 0.25);
					}
				}
			}
			if (thisContent.type == "ivSynchSlides") {
				$.each(thisContent.allInfo.children, function (i, e) {
					e.optional = thisContent.optional;
					e.setAttribute("_w", parseFloat(thisContent.allInfo.attributes._w.value));
					e.setAttribute("_x", parseFloat(thisContent.allInfo.attributes._x.value));
					e.setAttribute("_y", parseFloat(thisContent.allInfo.attributes._y.value));
				});
			}
			if (thisContent.type != "synchEmpty") {
				if (thisContent.type == "ivSynchMCQ" || thisContent.type == "ivSynchTextPlus" || thisContent.type == "ivSynchSlides" || thisContent.type == "ivSynchXot") {
					// Collect Look-and-Feel data for hotspots.
					var optional = thisContent.allInfo.getAttribute("optional");
					optional = optional == '' || optional == undefined ? 'false' : optional;

					var tooltip = thisContent.allInfo.getAttribute("tooltip");
					tooltip = tooltip == '' || tooltip == undefined ? 'label' : tooltip;

					var icon = thisContent.allInfo.getAttribute("icon");
					icon = icon == '' || icon == undefined ? 'fas fa-info' : icon;
					// Background Color
					var colour1 = thisContent.allInfo.getAttribute("colour1");
					colour1 = colour1 == '' || colour1 == undefined ? '#000000' : colour1;
					colour1 = colour1.indexOf('0x') === 0 ? colour1.replace("0x", "#") : colour1;
					// Icon Color
					var colour2 = thisContent.allInfo.getAttribute("colour2");
					colour2 = colour2 == '' || colour2 == undefined ? '#FFFFFF' : colour2;
					colour2 = colour2.indexOf('0x') === 0 ? colour2.replace("0x", "#") : colour2;

					var hsSize = thisContent.allInfo.getAttribute("hsSize");
					hsSize = hsSize == '' || hsSize == undefined ? '24px' : hsSize;

					var hsAttributes = {
						optional: optional,
						tooltip: tooltip,
						icon: icon,
						colour1: colour1,
						colour2: colour2,
						hsSize: hsSize,
					};
					var pluginAttributes = {
						start: thisContent.start,
						end: thisContent.end,
						target: thisContent.target,
						optional: thisContent.optional,
						attrib: hsAttributes,
						overlayPan: thisContent.ivOverlayPanel
					};
				}
				else {
					var pluginAttributes = {
						start: thisContent.start,
						end: thisContent.end,
						target: thisContent.target,
						optional: thisContent.optional,
						overlayPan: thisContent.ivOverlayPanel
					};
				}

				// add other info to pluginAttributes
				$.each(thisContent.allInfo.attributes, function (i, attrib) {
					// ignore attributes that aren't need ed or are dealt with here rather than in individual plugins
					if (attrib.name != "synchStart" && attrib.name != "synchEnd" && attrib.name != "clearPanel"
						&& attrib.name != "pauseMedia" && attrib.name != "linkID") {
						pluginAttributes[attrib.name] = attrib.value;
					}
				});
				if (thisContent.childNodes) { // used in some plugins e.g. mediaPlus
					pluginAttributes.childNodes = thisContent.childNodes;
				}

				// create the holder for the content if it doesn't exist & position it correctly
				var $target = $("#" + targetRef);
				if ($target.find("#" + pluginAttributes.target).length == 0) {
					var $holder;
					var $targetDiv = ($("#" + targetRef + " .panelContent").length > 0 ? $("#" + targetRef + " .panelContent") : $target);
					// ^^ targetDiv is different if it's content to show on top of additional media

					if (pluginAttributes.position == "top") {
						$holder = $('<div>').prependTo($targetDiv);
					} else {
						$holder = $('<div>').appendTo($targetDiv);
					}

					$holder
						.addClass("contentBlock " + pluginName + "Holder")
						.attr("id", pluginAttributes.target);
				}

				if (x_params.authorSupport == "true") {
					var startTxt = x_currentPageXML.getAttribute("supportStart") != undefined ? x_currentPageXML.getAttribute("supportStart") : "start",
						endTxt = x_currentPageXML.getAttribute("supportEnd") != undefined ? x_currentPageXML.getAttribute("supportEnd") : "end",
						authorSupportTxt = thisContent.autoEnd != true ? startTxt + ":" + thisContent.start + " " + endTxt + ":" + thisContent.end : startTxt + ":" + thisContent.start;
					pluginAttributes.name = pluginAttributes.name + ' <span class="alert">[' + authorSupportTxt + ']</span>';
				}

				if (pluginName === "blockpanel") {
					pluginAttributes.targetRef = targetRef;
					pluginAttributes.blockNrOffset = blockNrOffset;
					blockNrOffset += thisContent.childNodes.length;
				}
				debugger;
				popcornInstance[pluginName](pluginAttributes);


				// ^^ plugins called are either bespoke ones in popcorn/plugins folder or from popcorn-complete.min.js
				// ^^ for those from popcorn-complete.min.js, the xwd node names & values must match the expected popcorn properties for the plugin

				if ($.inArray(pluginName, plugins) == -1) {
					// plugin is being called from popcorn-complete.min.js - need to call this too (gets holder in correct state with titles & visibility)
					popcornInstance["sortholder"](pluginAttributes);
				}

				// pauses media at synch point if needed
				if (thisContent.allInfo.getAttribute("pauseMedia") == "true") {
					popcornInstance.cue(thisContent.start, function () {
						this.pause();
						// Gray out the background and fix z-index if the media is paused on an overlay panel
						if (thisContent.allInfo.getAttribute("overlayPan") == "true" && thisContent.type == "ivSynchXot") {
							$("#overlayGray").show();
						}
						if (thisContent.allInfo.getAttribute("overlay") != "true") {
							interactiveVideo.exitFullScreen();
						}
					});
				}

				if (data[0].type == "ivSynchMCQ") {
					debugger;
					$(data).each(function (e) {
						var testSynch = this.allInfo.getAttribute("synchStart");
						if (this.allInfo.children.length !== 0) {
							var isJump = this.allInfo.children[0].getAttribute("synch");
						}
						if (testSynch !== null && isJump !== null) {
							$(this.childNodes).each(function (jmp) {
								var syn = this.getAttribute("synch");
								var nam = this.getAttribute("text");
								if (!isDuplicate(blocks, syn)) {
									blocks.splice(calcIndex(syn), 0, {
										synchStart: syn,
										synchName: nam,
										watched: []
									});
								}
							});
						}
					});

					for (var i = 0; i < blocks.length; i++) {
						var start1 = blocks[i].synchStart;
						if (i < blocks.length - 1) {
							var end1 = blocks[i + 1].synchStart;
						}
						else {
							end1 = popcornInstance.duration();
						}
						var durat1 = end1 - start1;
						blocks[i]["duration"] = durat1;
					}
				}
			}
		}
		x_pageContentsUpdated();
	}

	function isDuplicate(testArr, time) {
		return testArr.some(function (el) {
			return el.synchStart == time;
		});
	}

	function calcIndex(time) {
		for (var i = 0; i < blocks.length; i++) {
			if (parseInt(time) < parseInt(blocks[i].synchStart)) {
				return i;
			}
		}
		return i + 1;
	}

	// function sets up the popcorn sync events for pausing and skipping the media
	// Also shows or hide streams for the mediasite API.
	this.setUpPopcornCue = function (popcornInstance, synchData) {
		popcornInstance.cue(Number(synchData.getAttribute("synch")), function () {
			// pause / play media
			if (synchData.getAttribute("pauseMedia") == "true") { //TODO not here
				this.pause();
				if (synchData.getAttribute("overlay") != "true") {
					interactiveVideo.exitFullScreen();
				}
			} else {
				this.play()
			}

			// Show the following streams (Mediasite)
			// 0: Video 1
			// 1: Document
			// 2: Slides
			// 3: Presentation
			// 4: Video 2
			// 5: Video 3
			if (this.video._util !== undefined && this.video._util.type === "Mediasite")
				if (synchData.getAttribute("visibleStreamTypes") != undefined)
					this.setVST(synchData.getAttribute("visibleStreamTypes"));


			// disable media controls
			if (synchData.getAttribute("disable") == "true") {
				interactiveVideo.enableControls(this.media, false, true, true);
			}

			// skip media
			if (synchData.getAttribute("destination") != undefined && $.isNumeric(synchData.getAttribute("destination"))) {
				this.currentTime(synchData.getAttribute("destination"));
			}
		});
	}

	// function disables / enables media controls
	this.enableControls = function (media, enable, includeMejs = true, includeTrackbar = false) {
		if (includeMejs == true)
			$("#overlay").hide();
		if (enable == true) {
			// enable
			if (media.player) {
				media.player.controls = true;
				media.player.controlsEnabled = true;
				media.player.options.clickToPlayPause = true;
				if (includeMejs == true) {
					if (media.nodeName == "VIDEO") {
						$(media).parent().parent().find(".mejs-controls").show()
						$(media).parent().parent().find(".mejs-layers").show();
					} else {
						$(media).parent().parent().find(".mejs-controls").children("div").show();
					}
				}
				if (includeTrackbar == true) {
					trackBarEnabled = true;
					$("#trackBarHolder").show();
				}
			}
		} else {
			// disable
			if (includeMejs == true) {}
			$("#overlay").show();
			if (media.player) {
				media.player.controlsEnabled = false;
				media.player.options.clickToPlayPause = false;
				if (includeMejs == true) {
					if (media.nodeName == "VIDEO") {
						$(media).parent().parent().find(".mejs-controls").hide()
						$(media).parent().parent().find(".mejs-layers").hide();
					} else {
						$(media).parent().parent().find(".mejs-controls").children("div").hide();
					}
				}
				if (includeTrackbar == true) {
					trackBarEnabled = false;
					$("#trackBarHolder").hide();
				}
			}
		}

	}

	this.hideControlLayer = function (media) {
		if (media.nodeName == "VIDEO") {
			$(media).parent().parent().find(".mejs-controls").hide()
			$(media).parent().parent().find(".mejs-layers").hide();
		} else {
			$(media).parent().parent().find(".mejs-controls").children("div").hide();
		}
	}

	// function receives dimensions of video from mediaPlayer.js to set its max dimensions
	this.mediaMetadata = function ($video, dimensions) {
		$video.closest(".popcornMedia")
			.css({
				"max-width": dimensions[0],
				"max-height": dimensions[1]
			})
			.data({
				"max-width": dimensions[0],
				"max-height": dimensions[1]
			});

		this.resizeMedia();
	}
}
