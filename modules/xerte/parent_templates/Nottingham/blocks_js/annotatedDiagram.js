var annotatedDiagram = new function () {
    var //tabfocusoptions,
        //options,
        //canvas,
        //context,
        borderW = 2;


    // Called from xenith if tab level deeplinking is available
    this.deepLink = function (item) {
        $('.listItem').each(function (i) {
            if (
                ($.isNumeric(item) && i === parseInt(item))
                || (item.toLowerCase() === $(this).text().toLowerCase())
            ) {
                $(this).click();
                return false;
            }
        });
    }

    this.pageChanged = function (blockid) {
        let pageContents = jGetElement(blockid, ".pageContents");
        let infoHolder = jGetElement(blockid, ".infoHolder");

        if (pageContents.data("hsType") == "centre") {
            let canvas = x_getPageDict("canvas", blockid);
            x_pushToPageDict(canvas[0].getContext("2d"), "context", blockid);
        }

        infoHolder.html("");

        this.sizeChanged(blockid);
    }

    // function called every time the size of the LO is changed
    this.sizeChanged = function (blockid) {
        this.deselect(blockid);
        let img = x_getPageDict("ïmg", blockid);
        img.css({
            "opacity": 0,
            "filter": 'alpha(opacity=0)'
        });

        this.setUp(blockid);
    }
    /*
        this.resizeImg = function (firstLoad, blockid) {
            var imgMaxW, imgMaxH;
            var footerMargin = parseInt($x_footerBlock.css('margin-bottom'));
            imgMaxH = $x_pageHolder.height() - $x_footerBlock.height() - footerMargin - 50;
            if (x_currentPageXML.getAttribute("panelWidth") == "Large") {
                imgMaxW = Math.round($x_pageHolder.width() * 0.8 - 20);
            } else if (x_currentPageXML.getAttribute("panelWidth") == "Small") {
                imgMaxW = Math.round($x_pageHolder.width() * 0.3 - 20);
            } else {
                imgMaxW = Math.round($x_pageHolder.width() * 0.55 - 20);
            }
            $img.mapster('unbind');

            x_scaleImg($img, imgMaxW, imgMaxH, true, firstLoad, true);

            $img.css({
                "opacity": 1,
                "filter": 'alpha(opacity=100)',
            });


            if (x_currentPageXML.getAttribute("align") === "Left") {
                var totalWidth = jGetElement(blockid, ".canvas").width();
                var imageWidth = jGetElement(blockid, ".imageHolder").width();
                var textWidth = totalWidth - imageWidth;
                jGetElement(blockid, ".textContents").css({
                    "width": textWidth + "px"
                })

            } else {
                var imageHeight = jGetElement(blockid, ".imageHolder").height();
                imageHeight *= 1.2;
                jGetElement(blockid, ".textContents").css({
                    "top": imageHeight + "px"
                })
            }

            jGetElement(blockid, ".hsHolder").children().remove();
            this.imgLoaded(blockid);
        };
    */

    this.init = function (pageXML, blockid) {
        var blockXML = x_getBlockXML(blockid);

        //Set "global variables" for this block
        debugger;
        let pageContents = x_pushToPageDict(jGetElement(blockid, ".pageContents"), "pageContents", blockid);
        let img = x_pushToPageDict(jGetElement(blockid, ".imageHolder img"), "img", blockid);
        let hsHolder = x_pushToPageDict(jGetElement(blockid, ".hsHolder"), "hsHolder", blockid);
        x_pushToPageDict(jGetElement(blockid, ".infoHolder"), "infoHolder", blockid);
        let panel = x_pushToPageDict(jGetElement(blockid, ".panel"), "panel", blockid);

        if (x_browserInfo.mobile != true) {
            if (blockXML.getAttribute("align") == "Right") {
                panel.addClass("left");
            } else if (blockXML.getAttribute("align") != "Top") {
                panel.addClass("right");
            }
        }

        var highlightColour = blockXML.getAttribute("colour") != undefined && blockXML.getAttribute("colour") != "" ? x_getColour(blockXML.getAttribute("colour")) : "#FFFF00";
        pageContents.data("highlightColour", highlightColour);
        // if shape is set to oval, line or arrow, the hs can't be drawn with mapster - use old method
        // when shape is outline (previously called rectangle), mapster is used - even if the hotspot is just a simple rectangle
        pageContents.data("hsType",
            blockXML.getAttribute("shape") == "Oval" ? "oval" :
                blockXML.getAttribute("shape") == "None" || blockXML.getAttribute("shape") == "Arrow" ? "centre" : "flex"
        );

        if (pageContents.data("hsType") == "centre") {
            let canvas = x_pushToPageDict(jGetElement(blockid, ".canvas"), "canvas", blockid);
            let context = x_pushToPageDict(canvas[0].getContext("2d"), "context", blockid);
        } else {
            jGetElement(blockid, ".canvas").remove();

            if (pageContents.data("hsType") == "flex") {
                hsHolder.addClass("mapster");

            } else {
                var newStyles = "<style type='text/css'> " +
                    ".annotatedDiagramBlock.pageContents .hsHolder:not(.mapster).oval .hotspot." + blockid + ".selected, "+
                    ".annotatedDiagramBlock.pageContents .hsHolder:not(.mapster).oval .hsGroup.selected .hotspot." + blockid +
                    " { border-color: " + highlightColour + ";} </style>";
                pageContents.prepend($(newStyles));
            }
        }

        jGetElement(blockid, ".mainText").html(x_addLineBreaks(blockXML.getAttribute("text")));

        // create links
        $(blockXML).children().each(function (i) {
            var $listItem = $('<a class="listItem" href="#"></a>').appendTo("#" + blockid + " .listHolder");

            // create list of links to each hs / hs group
            $listItem
                .html(this.getAttribute("name"))
                .data({
                    "group": "hsGroup" + i,
                    "text": this.getAttribute("text")
                })
                .click(function (e) {
                    e.preventDefault();

                    var $this = $(this);

                    hsHolder = x_getPageDict("hsHolder", blockid);
                    // not already selected - so select, show text & highlight hotspots
                    if (!$this.is(jGetElement(blockid, ".listItem.highlight"))) {
                        annotatedDiagram.deselect(blockid);
                        annotatedDiagram.selectLink($this, blockid);
                        if (pageContents.data("hsType") == "flex") {
                            $("area." + blockid + "." + $this.data("group")).mapster("select");

                        } else {
                            var shape = blockXML.getAttribute("shape");
                            if (shape == "Oval") {
                                hsHolder.find(".selected").removeClass("selected");
                                $(hsHolder.children()[$this.index()]).addClass("selected");

                            } else {
                                // arrow or line
                                var $hs = $(hsHolder.children()[$this.index()]);
                                if ($hs.hasClass("hsGroup")) {
                                    $hs.children()
                                        .each(function () {
                                            if (blockXML.getAttribute("link") == "false" || blockXML.getAttribute("link") == undefined) {
                                                annotatedDiagram.drawLine($(this), $this, shape, blockXML, blockid);
                                            } else {
                                                annotatedDiagram.drawLineToText($(this), shape, blockXML, blockid);
                                            }

                                        });
                                } else {
                                    if (blockXML.getAttribute("link") == "false" || blockXML.getAttribute("link") == undefined) {
                                        annotatedDiagram.drawLine($hs, $this, shape, blockXML, blockid);
                                    } else {
                                        annotatedDiagram.drawLineToText($hs, shape, blockXML, blockid);
                                    }

                                }

                            }
                        }

                        // already selected - so deselect, hide text & remove hotspots
                    } else {
                        annotatedDiagram.deselect(blockid);
                    }
                });
        });


        let url = blockXML.getAttribute("url").split(".");
        if (url.length > 1) {
            if (url[1].slice(0, -1) != "swf") {
                img
                    .data('firstLoad', true)
                    .css({
                        "opacity": 0,
                        "filter": 'alpha(opacity=0)'
                    })
                    .one("load", function () {
                        setTimeout(function() {
                            annotatedDiagram.setUp(blockid);

                            // call this function in every model once everything's loaded
                            x_pageLoaded();
                        },0);

                    })
                    .attr({
                        "src": x_evalURL(blockXML.getAttribute("url")),
                        "alt": blockXML.getAttribute("tip")
                    })
                    .each(function () { // called if loaded from cache as in some browsers load won't automatically trigger
                        if (this.complete) {
                            setTimeout(function () {
                                $(this).trigger("load");
                            }, 1);
                        }
                    });

                if (pageContents.data("hsType") == "flex") {
                    img.attr("usemap", "#hsHolder_map" + blockid);
                }

            } else {
                // have had to add this in I found one old project where a swf was used instead of an image on this page
                jGetElement(blockid, ".imageHolder").html('<p>Flash files (.swf) are no longer supported</p>');
                x_pageLoaded();
            }
        }else{
            // If no image was selected
            jGetElement(blockid, ".imageHolder").html('<p>No image selected.</p>');
            x_pageLoaded();
        }
        if (blockXML.getAttribute("link") == "true") {
            jGetElement(blockid, ".listHolder").css("display", "none")
        }
    }

    this.setUp = function (blockid) {
        var blockXML = x_getBlockXML(blockid);

        let pageContents = x_getPageDict("pageContents", blockid);
        let img = x_getPageDict( "img", blockid);
        let img2 = jGetElement(blockid, ".imageHolder img");
        let hsHolder = x_getPageDict( "hsHolder", blockid);
        let panel = x_getPageDict("panel", blockid);

        debugger;
        // if old style hotspots are used, resize the canvas first
        if (pageContents.data("hsType") == "flex") {
            img.mapster('unbind');

        } else {
            hsHolder.empty();

            if (pageContents.data("hsType") == "centre") {
                this.resizeCanvas(blockid);
            }
        }

        // if position is left or right then image size will constrain the image width - if position is top then image size will constrain the image height
        var maxPanel = blockXML.getAttribute("panelWidth") == "Large" ? 0.8 : blockXML.getAttribute("panelWidth") == "Small" ? 0.3 : 0.55,
            panelOuterW = panel.outerWidth() - panel.width(),
            panelOuterH = panel.outerHeight() - panel.height();

        var align = x_browserInfo.mobile == true ? "Top" : blockXML.getAttribute("align");

        var imgMaxW = Math.round($x_pageHolder.width() * (align == "Top" ? 1 : maxPanel) - panelOuterW - (align == "Top" ? parseInt($x_pageDiv.css("padding-left")) * 2 : 0)),
            imgMaxH = $x_pageHolder.height() * (align == "Top" ? maxPanel : 1) - (parseInt($x_pageDiv.css("padding-left")) * 2) - panelOuterH;


        x_scaleImg(img, imgMaxW, imgMaxH, true, img.data('firstLoad'), false);

        // position imageHolder correctly
        if (align == "Top") {
            panel.css("margin-left", ($x_pageDiv.width() - panel.outerWidth()) / 2);
        }

        img
            .data('firstLoad', false)
            .css({
                "opacity": 1,
                "filter": 'alpha(opacity=100)'
            });

        if (pageContents.data("hsType") == "centre" && align == "Left") {
            jGetElement(blockid, ".listItem").css("minWidth", $x_pageDiv.width() - panel.outerWidth(true) - 50);
        }

        // now get info about hotspots & create them
        if (pageContents.data("hsType") == "flex") {
            hsHolder.html('<map id="hsHolder_map' + blockid + '" name="hsHolder_map' + blockid + '"></map>');

            var stroke = true,
                strokeWidth = borderW,
                strokeOpacity = 1,
                fill = true,
                fillColor = "#000000",
                fillOpacity = 0.1;

            let options = {
                render_highlight: {
                    fill: false,
                    fillColor: fillColor.substr(1),
                    fillOpacity: fillOpacity,
                    stroke: stroke,
                    strokeColor: pageContents.data("highlightColour").substr(1),
                    strokeOpacity: (strokeOpacity > 0 ? strokeOpacity : 1),
                    strokeWidth: strokeWidth
                },
                render_select: {
                    fill: fill,
                    fillColor: fillColor.substr(1),
                    fillOpacity: fillOpacity,
                    stroke: stroke,
                    strokeColor: pageContents.data("highlightColour").substr(1),
                    strokeOpacity: strokeOpacity,
                    strokeWidth: strokeWidth
                },
                scaleMap: true,
                clickNavigate: true
            };

            let tabfocusoptions = JSON.parse(JSON.stringify(options));

            // Make sure focus is ALWAYS visible, even if strokewidth is set to 0
            tabfocusoptions.render_highlight.stroke = true;
            tabfocusoptions.render_highlight.strokeWidth = (strokeWidth == 0 ? 1 : strokeWidth * 2);

            x_pushToPageDict(options, "options", blockid);
            x_pushToPageDict(tabfocusoptions, "tabfocusoptions", blockid);

        } else {
            // Make hsHolder with same width and height as img
            let width = img.attr("width");
            let height = img.attr("height");
            hsHolder
                .width(width)
                .height(height);


            if (pageContents.data("hsType") == "centre") {
                // arrow or line
                let context = x_getPageDict("context", blockid);
                context.strokeStyle = pageContents.data("highlightColour");
                context.fillStyle = pageContents.data("highlightColour");
                context.lineWidth = borderW;

            } else if (pageContents.data("hsType") == "oval") {
                hsHolder.addClass("oval");
            }
        }

        $(blockXML).children().each(function (i) {
            var _this = this;
            if (this.nodeName == "hotspotGroup") {

                var $hsGroup;
                if (pageContents.data("hsType") != "flex") {
                    $hsGroup = $('<div class="hsGroup"></div>');
                    hsHolder.append($hsGroup);
                }

                $(this).children().each(function (j) {
                    if (pageContents.data("hsType") != "flex") {
                        annotatedDiagram.createHs(blockid, this, i, $hsGroup);

                    } else {
                        annotatedDiagram.createHs(blockid, this, i, $("#hsHolder_map"+ blockid));
                    }
                });

            } else {
                if (pageContents.data("hsType") != "flex") {
                    annotatedDiagram.createHs(blockid, this, i, hsHolder);

                } else {
                    annotatedDiagram.createHs(blockid, this, i, $("#hsHolder_map"+blockid));
                }
            }
        });
        if (pageContents.data("hsType") == "flex") {
            img.mapster(x_getPageDict("options", blockid));
        }
    }


    this.createHs = function (blockid, hsInfo, groupIndex, $parent) {

        var blockXML = x_getBlockXML(blockid);
        let pageContents = x_getPageDict("pageContents", blockid);
        let img = x_getPageDict("img", blockid);
        let options = x_getPageDict("options", blockid);
        let tabfocusoptions = x_getPageDict("tabfocusoptions", blockid);
        var $listItem = jGetElement(blockid, ".listHolder .listItem:eq(" + groupIndex + ")"),
            $hotspot;

        if (pageContents.data("hsType") == "flex") {
            var _this = hsInfo,
                coords = [],
                coords_string = "";

            $hotspot = $('<area class="hotspot ' + blockid + '" shape="poly" href="#" tabindex="0" />');

            if (hsInfo.getAttribute("mode") == undefined && hsInfo.getAttribute("x") != undefined && hsInfo.getAttribute("y") != undefined && hsInfo.getAttribute("w") != undefined && hsInfo.getAttribute("h") != undefined) {
                // old way of specifying hotspot: x,y,w,h
                // create polygon, start with top left
                coords[0] = {x: parseFloat(hsInfo.getAttribute("x")), y: parseFloat(hsInfo.getAttribute("y"))};
                coords[1] = {
                    x: parseFloat(hsInfo.getAttribute("x")) + parseFloat(hsInfo.getAttribute("w")),
                    y: parseFloat(hsInfo.getAttribute("y"))
                };
                coords[2] = {
                    x: parseFloat(hsInfo.getAttribute("x")) + parseFloat(hsInfo.getAttribute("w")),
                    y: parseFloat(hsInfo.getAttribute("y")) + parseFloat(hsInfo.getAttribute("h"))
                };
                coords[3] = {
                    x: parseFloat(hsInfo.getAttribute("x")),
                    y: parseFloat(hsInfo.getAttribute("y")) + parseFloat(hsInfo.getAttribute("h"))
                };
            }

            if (coords.length == 4 || (hsInfo.getAttribute("points") != undefined && hsInfo.getAttribute("mode") != undefined)) {
                if (coords.length != 4) {
                    coords = JSON.parse(hsInfo.getAttribute("points"));
                }

                if (coords.length > 0) {
                    for (var j in coords) {
                        if (j > 0) {
                            coords_string += ",";
                        }
                        coords_string += coords[j].x + "," + coords[j].y;
                    }
                }
            }

            $hotspot
                .attr("coords", coords_string)
                .addClass("hsGroup" + groupIndex)
                .data("listItem", $listItem)
                .click(function (e) {
                    var $this = $(this);

                    // not already selected - so select link, show text & highlight hotspots
                    if (!$this.data("listItem").is($(".listItem.highlight"))) {
                        annotatedDiagram.deselect(blockid);
                        annotatedDiagram.selectLink($(this).data("listItem"), blockid);

                        // only trigger selection on hotspots that aren't $this - otherwise $this is unselected
                        $("area." + blockid + "." + $this.data("listItem").data("group")).each(function () {
                            if (!$this.is($(this))) {
                                $(this).mapster("select");
                            }
                        });

                        // already selected - so deselect link, hide text & remove hotspots
                    } else {
                        annotatedDiagram.deselect(blockid);

                        // need this otherwise the hs that's been clicked stays highlighted
                        setTimeout(function () {
                            $this.mapster('deselect');
                        }, 1);
                    }
                })
                .focusin(function () {
                    img.mapster('set_options', tabfocusoptions);

                    $(this)
                        .removeClass("transparent")
                        .addClass("highlight");

                    $(this).mapster('highlight');
                })
                .focusout(function () {
                    img.mapster('set_options', options);

                    $(this)
                        .removeClass("highlight")
                        .addClass("transparent");

                    img.mapster('highlight', false);

                });

            if (hsInfo.getAttribute("alttext") != undefined && hsInfo.getAttribute("alttext") != "") {
                $hotspot.attr("alt", hsInfo.getAttribute("alttext"));
            } else {
                $hotspot.attr("alt", hsInfo.getAttribute("name"));
            }

        } else {
            // old way of creating hotspots needs to be used for arrow, line & oval
            $hotspot = $('<div class="hotspot ' + blockid + '" tabindex="0"/>');

            // take current scale into account
            var w, h, x, y,
                scale = img.attr("width") / img.data("origSize")[0];
            if (hsInfo.getAttribute("mode") !== null) {
                // this was drawn with polygon tool so not a rectangular hotspot
                // if oval, draw oval using furthest top, bottom, left & right points
                // if arrow or line, point to the centre of these furthest points
                var allPoints = JSON.parse(hsInfo.getAttribute("points")),
                    xPoints = [],
                    yPoints = [];

                for (var i = 0; i < allPoints.length; i++) {
                    xPoints.push(allPoints[i].x);
                    yPoints.push(allPoints[i].y);
                }
                w = Math.max(...xPoints) - Math.min(...xPoints);
                h = Math.max(...yPoints) - Math.min(...yPoints);
                x = Math.min(...xPoints);
                y = Math.min(...yPoints);

            } else {
                w = hsInfo.getAttribute("w");
                h = hsInfo.getAttribute("h");
                x = hsInfo.getAttribute("x");
                y = hsInfo.getAttribute("y");
            }

            var hsName = hsInfo.getAttribute("name");

            if ($(blockXML).children(groupIndex).nodeName == "hotspotGroup") { // hs in a group
                hsName = $(blockXML).children(groupIndex).getAttribute("name");
            }

            $hotspot
                .attr("title", (hsInfo.getAttribute("alttext") != undefined && hsInfo.getAttribute("alttext") != "") ? hsInfo.getAttribute("alttext") : hsName)
                .data("listItem", $listItem)
                .css({
                    // the border of hotspots throws position off so adjust for this
                    width: (Math.round(w * scale) - (borderW * 2)) + "px",
                    height: (Math.round(h * scale) - (borderW * 2)) + "px",
                    left: Math.round(x * scale) + "px",
                    top: Math.round(y * scale) + "px",
                    borderWidth: borderW + "px"
                })
                .click(function () {
                    $(this).data("listItem").trigger("click");
                    $x_pageHolder.scrollTop(0);
                })
                .focusin(function () {
                    $(this)
                        .removeClass("transparent")
                        .addClass("highlight");
                })
                .focusout(function () {
                    $(this)
                        .removeClass("highlight")
                        .addClass("transparent");
                })
                .keypress(function (e) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
                        $(this).trigger("click");
                    }
                });
        }

        $parent.append($hotspot);
    }

    this.selectLink = function ($link, blockid) {
        $link.addClass("highlight");

        let infoHolder = x_getPageDict("infoHolder", blockid);
        infoHolder.html(x_addLineBreaks($link.data("text")));
        x_pageContentsUpdated();
    }

    this.deselect = function (blockid) {
        let infoHolder = x_getPageDict("infoHolder", blockid);
        jGetElement(blockid, ".listItem.highlight").removeClass("highlight");
        infoHolder.html("");

        let pageContents = x_getPageDict("pageContents", blockid);;
        if (pageContents.data("hsType") == "flex") {
            $("area." + blockid).mapster('set', false);

        } else {
            // remove highlights on list links & hotspots
            pageContents.find(".hotspot.selected, .hsGroup.selected").removeClass("selected");
            pageContents.find(".hotspot.highlight").removeClass("highlight");
            let canvas = x_getPageDict("canvas", blockid);
            if (canvas) {
                let context = x_getPageDict("context", blockid);
                context.clearRect(canvas.position().left, canvas.position().top, canvas.attr("width"), canvas.attr("height"));
            }
        }
    }

    this.drawLine = function ($hs, $listItem, shape, blockXML, blockid) {
        debugger;
        var align = x_browserInfo.mobile == true ? "Top" : blockXML.getAttribute("align");
        let context = x_getPageDict("context", blockid);

        // startX/Y = centre of hotspot
        var startX = $hs.offset().left - $(context.canvas).offset().left + ($hs.width() / 2);
        var startY = $hs.offset().top - $(context.canvas).offset().top + ($hs.height() / 2);

        // endX/Y = selected link
        var endX = $listItem.offset().left + (align != "Right" ? $listItem.outerWidth() : 0) - $(context.canvas).offset().left;
        var endY = $listItem.offset().top + ($listItem.outerHeight() / 2) - $(context.canvas).offset().top;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();

        if (shape == "Arrow") {
            context.beginPath();
            context.arc(startX, startY, 2, 0, 2 * Math.PI, false);
            context.fill();
        }
    }

    this.drawLineToText = function ($hs, shape, blockXML, blockid) {
        debugger;
        var align = x_browserInfo.mobile == true ? "Top" : blockXML.getAttribute("align");
        let context = x_getPageDict("context", blockid);
        let panel = x_getPageDict("panel", blockid);
        var startX = $hs.offset().left - $(context.canvas).offset().left + ($hs.width() / 2);
        var startY = $hs.offset().top - $(context.canvas).offset().top + ($hs.height() / 2);

        var endX = panel.offset().left - parseInt(panel.css("margin-left")) - parseInt(panel.css("padding-left"));
        var endY = x_getPageDict("infoHolder", blockid).offset().top;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();

        if (shape == "Arrow") {
            context.beginPath();
            context.arc(startX, startY, 2, 0, 2 * Math.PI, false);
            context.fill();
        }
    }

    this.resizeCanvas = function (blockid) {
        $x_pageHolder.css('overflow', 'hidden');
        let canvas = x_getPageDict("canvas", blockid);
        canvas.attr({
            width: $x_pageDiv.width(),
            height: $x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2
        });

        $x_pageHolder
            .css('overflow', 'auto')
            .scrollTop(0);
    }


    /*
        this.imgLoaded = function (blockid) {

            var imgW,
                imgH = $img.height();

            if ($img.is("div")) {
                imgW = $img.data("origSize")[0];
                imgH = $img.data("origSize")[1];
            } else {
                imgW = $img.width();
                imgH = $img.height();
            }

            // position text correctly
            if (x_currentPageXML.getAttribute("align") == "Top") {
                $textContents.css("margin-top", imgH + (padding * 4) + "px");
                var imgIndent = ($x_pageDiv.width() - (imgW + (padding * 4))) / 2;
                $imageHolder.css("margin-left", imgIndent);
                $hsHolder.css("margin-left", imgIndent);
            } else {
                $textContents.css("margin-right", imgW + (padding * 4) + "px");
            }

            // create hotspots - taking scale of image into account
            var width = $imageHolder.outerWidth() - parseInt($imageHolder.css('padding-left')) - parseInt($imageHolder.css('padding-right'));
            var height = $imageHolder.outerHeight() - parseInt($imageHolder.css('padding-top')) - parseInt($imageHolder.css('padding-bottom'));

            $hsHolder
                .width(width)
                .height(height);
            scale = imgW / $img.data("origSize")[0];


            var highlightColour = "yellow";
            if (x_currentPageXML.getAttribute("colour") != undefined && x_currentPageXML.getAttribute("colour") != "") {
                highlightColour = x_getColour(x_currentPageXML.getAttribute("colour"));
            }

            var shape = x_currentPageXML.getAttribute("shape");
            if ((shape == "Arrow" || shape == "None") && $canvas[0].getContext) {
                var context = $canvas[0].getContext("2d");
                context.strokeStyle = highlightColour;
                context.fillStyle = highlightColour;
                context.lineWidth = 2;
            } else {
                $canvas.remove();
                if (shape != "Oval" && shape != "Rectangle") {
                    shape = "Rectangle"; // browser doesn't support canvas so use rectangle instead of line/arrow
                }
            }
            $pageContents.data("shape", shape);

            var $listItem = jGetElement(blockid, ".listItem:first"),
                $listHolder = jGetElement(blockid, "#listHolder");

            if ($listHolder.children().length > 1) {
                $listHolder.empty()
                $listItem.appendTo($listHolder)
            }
            $(x_currentPageXML).children()
                .each(function (i) {
                    var $thisItem;

                    if (i != 0) {
                        $thisItem = $listItem.clone().appendTo($listHolder);
                    } else {
                        $thisItem = $listItem;
                    }

                    $thisItem
                        .attr("href", "#item" + i)
                        .html(this.getAttribute("name"))
                        .data({
                            "name": this.getAttribute("name"),
                            "text": this.getAttribute("text")
                        })
                        .click(function () {
                            var $this = $(this);
                            if ($this != jGetElement(blockid, ".listItem.highlight")) {
                                jGetElement(blockid, ".listItem.highlight").removeClass("highlight");
                                $this.addClass("highlight");

                                var shape = jGetElement(blockid, ".pageContents").data("shape");
                                jGetElement(blockid, "#infoHolder").html(x_addLineBreaks($this.data("text")));
                                if (shape != "None" && shape != "Arrow") {
                                    jGetElement(blockid, ".hsHolder .selected").removeClass("selected");
                                    $(jGetElement(blockid, ".hsHolder").children()[$this.index()]).addClass("selected");
                                } else {
                                    $x_pageHolder.scrollTop(0);
                                    var $canvas = jGetElement(blockid, ".canvas"),
                                        context = $canvas[0].getContext("2d");
                                    context.clearRect($canvas.position().left, $canvas.position().top, $canvas.attr("width"), $canvas.attr("height"));
                                    var $hs = $(jGetElement(blockid, ".hsHolder").children()[$this.index()]);
                                    if ($hs.hasClass("hsGroup")) {
                                        $hs.children()
                                            .each(function () {
                                                annotatedDiagram.drawLine(context, $(this), $this, shape);
                                            });
                                    } else {
                                        annotatedDiagram.drawLine(context, $hs, $this, shape);
                                    }
                                }

                                annotatedDiagram.checkHeight();
                                x_pageContentsUpdated();
                            }
                        })

                    if (this.tagName == "hotspotGroup") {
                        var groupXML = this,
                            $hsGroup = $('<div class="hsGroup"></div>');
                        $hsHolder.append($hsGroup);
                        $(this).children()
                            .each(function () {
                                var $hs = annotatedDiagram.createHotspot(this, $hsGroup, $thisItem, groupXML);
                            });
                    } else {
                        annotatedDiagram.createHotspot(this, $hsHolder, $thisItem);
                    }
                });

            var $hotspot = jGetElement(blockid, ".pageContents .hotspot");
            if (shape == "Oval") {
                $hotspot
                    .css("border-color", highlightColour)
                    .addClass("oval");
            } else if (shape == "Rectangle") {
                $hotspot.css("border-color", highlightColour);
            }
            $hotspot.addClass("transparent");

            this.checkHeight();

            // call this function in every model once everything's loaded
            x_pageLoaded();
        }

        this.checkHeight = function () {
            if (x_browserInfo.mobile == true) {
                var height = 0;
                jGetElement(blockid, ".pageContents *").each(function () {
                    if ($(this).height() > height) {
                        height = $(this).outerHeight();
                    }
                });
                jGetElement(blockid, ".pageContents").height(height);
            }
        }

        this.createHotspot = function (hsXML, $parent, $listItem, groupXML) {
            debugger;
            var $hotspot = $('<div class="hotspot" tabindex="0"/>'),
                hsName = hsXML.getAttribute("name");
            if (groupXML != undefined) { // hs in a group
                hsName = groupXML.getAttribute("name");
            }

            $hotspot
                .attr("title", (hsXML.getAttribute("alttext") != undefined && hsXML.getAttribute("alttext") != "") ? hsXML.getAttribute("alttext") : hsName)
                .data("listItem", $listItem)
                .css({
                    width: Math.round(hsXML.getAttribute("w") * scale) + "px",
                    height: Math.round(hsXML.getAttribute("h") * scale) + "px",
                    left: Math.round(hsXML.getAttribute("x") * scale) + "px",
                    top: Math.round(hsXML.getAttribute("y") * scale) + "px"
                })
                .click(function () {
                    $(this).data("listItem").trigger("click");
                })
                .focusin(function () {
                    $(this)
                        .removeClass("transparent")
                        .addClass("highlight");
                })
                .focusout(function () {
                    $(this)
                        .removeClass("highlight")
                        .addClass("transparent");
                })
                .keypress(function (e) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
                        $(this).trigger("click");
                    }
                });
            $parent.append($hotspot);
    }


        this.drawLine = function (context, $hs, $listItem, shape) {
            // startX/Y = centre of hotspot
            var startX = $hs.offset().left - $(context.canvas).offset().left + ($hs.width() / 2);
            var startY = $hs.offset().top - $(context.canvas).offset().top + ($hs.height() / 2);

            // endX/Y = selected link
            var endX = $listItem.offset().left + $listItem.outerWidth() - $(context.canvas).offset().left;
            var endY = $listItem.offset().top + ($listItem.outerHeight() / 2) - $(context.canvas).offset().top;

            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.stroke();
            if (shape == "Arrow") {
                context.beginPath();
                context.arc(startX, startY, 2, 0, 2 * Math.PI, false);
                context.fill();
            }
            context.stroke();
        }

     */

}