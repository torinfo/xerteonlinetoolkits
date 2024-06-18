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
var hotspotImageBlock = new function () {

	// function called every time the page is viewed after it has initially loaded
	this.pageChanged = function (blockid) {
		jGetElement(blockid, "area").mapster('set', false);

		jGetElement(blockid, ".selected").removeClass("selected");
		jGetElement(blockid, ".infoHolder").html("");
		jGetElement(blockid, ".nextHS").button("enable");
		jGetElement(blockid, ".prevHS").button("disable");
	};

	// function called every time the size of the LO is changed
	this.sizeChanged = function (blockid) {
		if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
		jGetElement(blockid, ".image").css({
			"opacity": 0,
			"filter": 'alpha(opacity=0)'
		});

		this.resizeImg(blockid, false);
	};

	this.init = function (blockid) {
		$img = jGetElement(blockid, ".image");
		let pageXML = x_getBlockXML(blockid);

		if (pageXML.getAttribute("align") == "Right") {
			jGetElement(blockid, ".panel").addClass("left");
		} else {
			jGetElement(blockid, ".panel").addClass("right");
		}

		jGetElement(blockid, ".mainText").html(x_addLineBreaks(pageXML.getAttribute("text")));

		$img
			.css({
				"opacity": 0,
				"filter": 'alpha(opacity=0)'
			})
			.one("load", function () {
				hotspotImageBlock.resizeImg(blockid, true);

				// call this function in every model once everything's loaded
				x_pageLoaded();
			})
			.attr({
				"src": x_evalURL(pageXML.getAttribute("url")),
				"alt": pageXML.getAttribute("tip"),
				"usemap": "#" + blockid + "_hsHolder_map"
			})
			.each(function () { // called if loaded from cache as in some browsers load won't automatically trigger
				if (this.complete) {
					$(this).trigger("load");
				}
			});

		if (pageXML.getAttribute("interactivity") == "Show Me") {
			// if language attributes aren't in xml will have to use english fall back
			var nextTxt = pageXML.getAttribute("nextTxt");
			if (nextTxt == undefined) {
				nextTxt = "Next";
			}
			var priorTxt = pageXML.getAttribute("priorTxt");
			if (priorTxt == undefined) {
				priorTxt = "Previous";
			}

			jGetElement(blockid, ".nextHS")
				.button({
					icons: {
						primary: "fa fa-x-next"
					},
					label: nextTxt,
					text: false
				})
				.click(function () {
					hotspotImageBlock.selectHs(blockid, "next");
				});

			jGetElement(blockid, ".prevHS")
				.button({
					icons: {
						primary: "fa fa-x-prev"
					},
					label: priorTxt,
					text: false,
					disabled: true
				})
				.click(function () {
					hotspotImageBlock.selectHs(blockid, "prev");
				});

		} else { // click explore
			jGetElement(blockid, ".btnHolder").remove();

		}
	};

	this.resizeImg = function (blockid, firstLoad) {
		var imgMaxW = Math.round($x_pageHolder.width() * (400.0 / 800.0)),
			imgMaxH = Math.round($x_pageHolder.height() * (550.0 / 600.0) - 100);

		jGetElement(blockid, ".image").mapster('unbind');

		x_scaleImg(jGetElement(blockid, ".image"), imgMaxW, imgMaxH, true, firstLoad, false);

		jGetElement(blockid, ".image").css({
			"opacity": 1,
			"filter": 'alpha(opacity=100)'
		});

		this.createHS(blockid);
	};

	this.createHS = function (blockid) {
		let pageXML = x_getBlockXML(blockid);
		// create hotspots - taking scale of image into account
		var selected = jGetElement(blockid, ".pageContents .hotspot.selected").length > 0 ? jGetElement(blockid, ".pageContents .hotspot.selected").index() : undefined;

		jGetElement(blockid, ".hsHolder").html("<map class=\"hsHolder_map\" name=\"" + blockid + "_hsHolder_map\"></map>");

		var stroke = true;
		var highlightColour = "#ffff00";
		var strokeWidth = 2;
		var strokeOpacity = 1;
		var fill = true;
		var fillColor = "#000000";
		var fillOpacity = 0.1;

		if (pageXML.getAttribute("hicol") != undefined && pageXML.getAttribute("hicol") != "") {
			highlightColour = x_getColour(pageXML.getAttribute("hicol"));
		}
		if (pageXML.getAttribute("hs_strokeWidth") != undefined && pageXML.getAttribute("hs_strokeWidth") != "") {
			strokeWidth = parseInt(pageXML.getAttribute("hs_strokeWidth"));
			if (strokeWidth == 0) {
				stroke = false;
			}
		}
		if (pageXML.getAttribute("hs_strokeOpacity") != undefined && pageXML.getAttribute("hs_strokeOpacity") != "") {
			strokeOpacity = parseFloat(pageXML.getAttribute("hs_strokeOpacity"));
		}
		if (pageXML.getAttribute("hs_fill") != undefined && pageXML.getAttribute("hs_fill") != "") {
			fill = pageXML.getAttribute("hs_fill") === "true";
		}
		if (pageXML.getAttribute("hs_fillColor") != undefined && pageXML.getAttribute("hs_fillColor") != "") {
			fillColor = x_getColour(pageXML.getAttribute("hs_fillColor"));
		}
		if (pageXML.getAttribute("hs_fillOpacity") != undefined && pageXML.getAttribute("hs_fillOpacity") != "") {
			fillOpacity = parseFloat(pageXML.getAttribute("hs_fillOpacity"));
		}

		var options = {
			render_highlight:
			{
				fill: false,
				fillColor: fillColor.substr(1),
				fillOpacity: fillOpacity,
				stroke: stroke,
				strokeColor: highlightColour.substr(1),
				strokeOpacity: (strokeOpacity > 0 ? strokeOpacity : 1),
				strokeWidth: strokeWidth
			},
			render_select:
			{
				fill: fill,
				fillColor: fillColor.substr(1),
				fillOpacity: fillOpacity,
				stroke: stroke,
				strokeColor: highlightColour.substr(1),
				strokeOpacity: strokeOpacity,
				strokeWidth: strokeWidth
			},
			scaleMap: true,
			clickNavigate: true
		};

		// Make sure focus is ALWAYS visible, even if strokewidth is set to 0
		var tabfocusoptions = JSON.parse(JSON.stringify(options));
		tabfocusoptions.render_highlight.stroke = true;
		tabfocusoptions.render_highlight.strokeWidth = (strokeWidth == 0 ? 1 : strokeWidth * 2);

		$(pageXML).children()
			.each(function (i) {
				var _this = this;

				var $hotspot = $('<area class="hotspot" shape="poly" href="#" tabindex="0" />');

				var coords = [];
				var coords_string = "";
				// Old way of specifying hotspot: x,y,w,h
				if (this.getAttribute("mode") == undefined && this.getAttribute("x") != undefined && this.getAttribute("y") != undefined && this.getAttribute("w") != undefined && this.getAttribute("h") != undefined) {
					// create polygon, start with topleft
					coords[0] = { x: parseFloat(this.getAttribute("x")), y: parseFloat(this.getAttribute("y")) };
					coords[1] = { x: parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("w")), y: parseFloat(this.getAttribute("y")) };
					coords[2] = { x: parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("w")), y: parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("h")) };
					coords[3] = { x: parseFloat(this.getAttribute("x")), y: parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("h")) };
				}
				if (coords.length == 4 || (this.getAttribute("points") != undefined && this.getAttribute("mode") != undefined)) {
					if (coords.length != 4) {
						coords = JSON.parse(this.getAttribute("points"));
					}

					if (coords.length > 0) {
						for (var j in coords) {
							// No more need to scale the points, handled by the plugin
							if (j > 0) {
								coords_string += ",";
							}
							coords_string += coords[j].x + "," + coords[j].y;
						}
					}
				}

				$hotspot
					.attr("coords", coords_string)
					.click(function () {
						jGetElement(blockid, ".infoHolder").html("<hr/><h3>" + _this.getAttribute("name") + "</h3>" + x_addLineBreaks(_this.getAttribute("text")));

						jGetElement(blockid, ".selected").removeClass("selected");
						if (pageXML.getAttribute("highlight") !== "true") {
							jGetElement(blockid, "area").mapster('deselect');
						}
						var $this = $(this);
						$this.addClass("selected");
						if (pageXML.getAttribute("interactivity") == "Show Me") {
							var nextHS = jGetElement(blockid, ".nextHS"),
								prevHS = jGetElement(blockid, ".prevHS");

							if ($this.index() + 1 == jGetElement(blockid, ".pageContents .hotspot").length) {
								nextHS.button("disable");
								prevHS.button("enable");
							} else if ($this.index() == 0) {
								nextHS.button("enable");
								prevHS.button("disable");
							} else {
								nextHS.button("enable");
								prevHS.button("enable");
							}
						}

						if (pageXML.getAttribute("highlight") == "true") {
							setTimeout(function () {
								jGetElement(blockid, "area").mapster('select');
							}, 100);
						}

						x_pageContentsUpdated();
					})
					.focusin(function () {
						jGetElement(blockid, ".image").mapster('set_options', tabfocusoptions);
						$(this)
							.removeClass("transparent")
							.addClass("highlight");
						$(this).mapster('highlight');
					})
					.focusout(function () {
						jGetElement(blockid, ".image").mapster('set_options', options);
						$(this)
							.removeClass("highlight")
							.addClass("transparent");
						jGetElement(blockid, ".image").mapster('highlight', false);

					})
					.keypress(function (e) {
						var charCode = e.charCode || e.keyCode;
						if (charCode == 32) {
							$(this).trigger("click");
						}
					});

				if (pageXML.getAttribute("hs_showTooltip") != undefined && pageXML.getAttribute("hs_showTooltip") !== "false") {
					if (this.getAttribute("alttext") != undefined && this.getAttribute("alttext") != "")
						$hotspot.attr("title", this.getAttribute("alttext"));
					else
						$hotspot.attr("title", this.getAttribute("name"));
				} else {
					if (this.getAttribute("alttext") != undefined && this.getAttribute("alttext") != "")
						$hotspot.attr("alt", this.getAttribute("alttext"));
					else
						$hotspot.attr("alt", this.getAttribute("name"));
				}

				jGetElement(blockid, ".hsHolder_map").append($hotspot);
			});

		if (selected != undefined) {
			jGetElement(blockid, ".pageContents .hotspot:eq(" + selected + ")").trigger("click");
		}

		jGetElement(blockid, ".image").mapster(options);

		if (pageXML.getAttribute("highlight") == "true") {
			setTimeout(function () {
				jGetElement(blockid, "area").mapster('select');
			}, 100);
		}
		else {
			jGetElement(blockid, ".pageContents .hotspot.selected").mapster("select");
		}
	};

	this.selectHs = function (blockid, type) {
		let pageXML = x_getBlockXML(blockid);

		var currentSelection = jGetElement(blockid, ".pageContents .selected"),
			i = currentSelection.index();

		currentSelection.removeClass("selected");

		if (pageXML.getAttribute("highlight") !== "true") {
			jGetElement(blockid, "area").mapster('deselect');
		}

		if (type == "next") {
			i = i + 1;
		} else {
			i = i - 1;
		}

		if (i > 0) {
			jGetElement(blockid, ".prevHS").button("enable");
		} else {
			jGetElement(blockid, ".prevHS").button("disable");
		}

		if (i < pageXML.childNodes.length - 1) {
			jGetElement(blockid, ".nextHS").button("enable");
		} else {
			jGetElement(blockid, ".nextHS").button("disable");
		}

		jGetElement(blockid, ".pageContents .hotspot:eq(" + i + ")").addClass("selected").trigger("click");

		if (pageXML.getAttribute("highlight") !== "true") {
			jGetElement(blockid, ".image").mapster('set', true, i);
		}
	};

};
