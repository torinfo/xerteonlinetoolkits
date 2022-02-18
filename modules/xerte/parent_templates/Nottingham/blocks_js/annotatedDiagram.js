var annotatedDiagram = new function () {
    var scale,
        $textContents,
        $hsHolder,
        $imageHolder,
        $img,
        $canvas,
        $pageContents,
        padding,
        firstLoad;

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
        this.resizeImg(firstLoad, blockid)
    }


    // function called every time the size of the LO is changed
    this.sizeChanged = function (blockid) {

        //this.checkHeight();

        var $canvas = jGetElement(blockid, ".canvas");
        if ($canvas.length > 0 && $canvas[0].getContext) {
            var context = $canvas[0].getContext("2d"),
                highlightColour = context.strokeStyle;

            $canvas.attr({
                width: $x_pageDiv.width(),
                height: $x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2
            });

            $x_pageHolder.scrollTop(0);
            context.clearRect($canvas.position().left, $canvas.position().top, $canvas.attr("width"), $canvas.attr("height"));
            context.strokeStyle = highlightColour;
            context.fillStyle = highlightColour;
            context.lineWidth = 2;
        }

        jGetElement(blockid, ".pageContents .selected").removeClass("selected");
        jGetElement(blockid, ".pageContents .highlight").removeClass("highlight");
        jGetElement(blockid, "#infoHolder").html("");

        if (x_currentPageXML.getAttribute("align") == "Top") {
            var imgIndent = ($x_pageDiv.width() - (jGetElement(blockid, ".imageHolder img").width() + (padding * 4))) / 2;
            jGetElement(blockid, ".imageHolder").css("margin-left", imgIndent);
            jGetElement(blockid, ".hsHolder").css("margin-left", imgIndent + padding);
        }
        this.resizeImg(firstLoad, blockid);
        firstLoad = false;
    }

    this.resizeImg = function (firstLoad, blockid) {
        ;
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

    this.init = function (pageXML, blockid) {
        x_currentPageXML = pageXML;
        $pageContents = jGetElement(blockid, ".pageContents");
        $imageHolder = jGetElement(blockid, ".imageHolder");
        $canvas = jGetElement(blockid, ".canvas");
        $hsHolder = jGetElement(blockid, ".hsHolder");
        $textContents = jGetElement(blockid, ".textContents");
        firstLoad = true;

        if (x_currentPageXML.getAttribute("align") != "Top") {
            $imageHolder.css("right", $x_pageDiv.css("padding-right"));
            var margin = parseFloat($('#x_mainHolder').css('margin-right'));
            var padding = parseFloat($x_pageDiv.css("padding-right"));
            var right = padding - margin;
            $hsHolder.css("right", $x_pageDiv.css("padding-right"));
        }
        $textContents.find(".mainText").html(x_addLineBreaks(x_currentPageXML.getAttribute("text")));

        //padding = parseInt($imageHolder.css("padding-left"));
        $hsHolder.css("margin", $imageHolder.css("padding-left"));

        if (x_currentPageXML.getAttribute("url").split(".")[1].slice(0, -1) != "swf") {
            var imgMaxW = 400, imgMaxH = 450;
            if (x_browserInfo.mobile == true) {
                imgMaxW = 250; // mobile
                imgMaxH = 250;
            } else if (x_currentPageXML.getAttribute("align") == "Top") {
                imgMaxW = 600;
                imgMaxH = 250;
            }

            $imageHolder.append('<img />');
            $img = $imageHolder.find("img");

            $img
                .css({ // stops flicker on 1st load of image
                    "opacity": 0,
                    "filter": 'alpha(opacity=0)'
                })
                .one("load", function () {
                    //x_scaleImg(this, imgMaxW, imgMaxH, true, true);
                    $(this).css({
                        "opacity": 1,
                        "filter": 'alpha(opacity=100)'
                    })
                    annotatedDiagram.sizeChanged(blockid);
                })
                .attr({
                    "src": x_evalURL(x_currentPageXML.getAttribute("url")),
                    "alt": x_currentPageXML.getAttribute("tip")
                })
                .each(function () { // called if loaded from cache as in some browsers load won't automatically trigger
                    if (this.complete) {
                        $(this).trigger("load");
                    }
                });

        } else {
            // have had to add this in I found one old project where a swf was used instead of an image on this page
            var size = [300, 300];
            if (x_currentPageXML.getAttribute("movieSize") != "" && x_currentPageXML.getAttribute("movieSize") != undefined) {
                var dimensions = x_currentPageXML.getAttribute("movieSize").split(",");
                if (Number(dimensions[0]) != 0 && Number(dimensions[1]) != 0) {
                    size = [Number(dimensions[0]), Number(dimensions[1])];
                }
            }

            $imageHolder.append('<div id="pageSWF"><h3 class="alert">' + x_getLangInfo(x_languageData.find("errorFlash")[0], "label", "You need to install the Flash Player to view this content.") + '</h3><p><a href="http://www.adobe.com/go/getflashplayer"><img class="flashImg" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="' + x_getLangInfo(x_languageData.find("errorFlash")[0], "description", "Get the Flash Player") + '" /></a></p></div>');
            $img = jGetElement(blockid, "#pageSWF");

            $img.data("origSize", size);

            this.imgLoaded(blockid);

            swfobject.embedSWF(x_evalURL(x_currentPageXML.getAttribute("url")), "pageSWF", size[0], size[1], "9.0.0", x_templateLocation + "common_html5/expressInstall.swf", "", "", "");
            jGetElement(blockid, "#pageSWF").attr("title", x_currentPageXML.getAttribute("tip"));
        }
        //this.sizeChanged();
    }

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
                            jGetElement(blockid, "#infoHolder").html(/*"<h3>" + $this.data("name") + "</h3><br/>" + */x_addLineBreaks($this.data("text")));
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
}