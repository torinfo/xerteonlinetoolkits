var modelAnswer = new function () {
    var modelAnswerModel = {
        tracked: false
    }

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function (blockid) {
        jGetElement(blockid, ".button").show();
        jGetElement(blockid, ".fbTxt").empty();
        jGetElement(blockid, ".copyBtn, .copyTxt").hide();
    };

    // function called every time the size of the LO is changed
    this.sizeChanged = function (blockid) {
        if (x_browserInfo.mobile == false) {
            var $panel = jGetElement(blockid, ".pageContents .panel");
            $panel.height($x_pageHolder.height() - parseInt($x_pageDiv.css("padding-top")) * 2 - parseInt($panel.css("padding-top")) * 2 - 5);

            // makes sure image doesn't take up too much vertical space & will try to fit text, image, answer box on screen without scrolling if possible
            if (jGetElement(blockid, ".panelImg img").length > 0) {
                var totalHeight = 0;
                $panel.children().each(function () {
                    totalHeight = totalHeight + $(this).outerHeight(true);
                });
                totalHeight -= jGetElement(blockid, ".panelImg img").height();
                var maxH = Math.max($panel.innerHeight() - totalHeight, 100);
                jGetElement(blockid, ".panelImg img").css("max-height", maxH);
            }
        }
    };

    this.leavePage = function (blockid) {
        this.finishTracking(blockid);
    };

    this.init = function (pageXML, blockid) {
        x_currentPageXML = pageXML;
        this.modelAnswer.tracked = false;
        // if language attributes aren't in xml will have to use english fall back
        var instructA = x_currentPageXML.getAttribute("instructHeaderATxt");
        if (instructA == undefined) {
            instructA = "The instruction and question on page"
        }
        var instructB = x_currentPageXML.getAttribute("instructHeaderBTxt");
        if (instructB == undefined) {
            instructB = "was:"
        }
        var responseTxt = x_currentPageXML.getAttribute("responseHeaderTxt");
        if (responseTxt == undefined) {
            responseTxt = "Your response was:"
        }
        var noAnswerTxt = x_currentPageXML.getAttribute("noAnswerHeaderTxt");
        if (noAnswerTxt == undefined) {
            noAnswerTxt = "You didn't answer this question"
        }
        var exampleTxt = x_currentPageXML.getAttribute("exampleHeaderTxt");
        if (exampleTxt == undefined) {
            exampleTxt = "The example answer was:"
        }
        var pageNo = x_currentPage;
        if (x_pageInfo[x_currentPage].standalone == true) {
            // if the page is a standalone page then use the page name instead of page number
            pageNo = "'" + x_currentPageXML.getAttribute("name") + "'";
        } else {
            if (x_pageInfo[0].type != "menu") {
                pageNo++;
            }
        }

        jGetElement(blockid, ".pageContents").data({
            "dataString": '<p class="pageBlock">' + instructA + ' ' + pageNo + ' ' + instructB + '</p>' + x_addLineBreaks(x_currentPageXML.getAttribute("prompt")) + '<p><br/>' + x_addLineBreaks(responseTxt) + '</p><p>' + '{A}' + '</p><p><br/>' + x_addLineBreaks(exampleTxt) + '</p>' + x_addLineBreaks(x_currentPageXML.getAttribute("feedback")),
            "noAnswerTxt": '<p>' + noAnswerTxt + '</p>'
        });

        var label = $('<div>').html(pageTitle).text();
        if (x_currentPageXML.getAttribute("trackinglabel") != null && x_currentPageXML.getAttribute("trackinglabel") != "") {
            label = x_currentPageXML.getAttribute("trackinglabel");
        }

        this.weighting = 1.0;
        if (x_currentPageXML.getAttribute("trackingWeight") != undefined) {
            this.weighting = x_currentPageXML.getAttribute("trackingWeight");
        }

        XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);

        var modelAnswerTxt = $('<div>').html(x_currentPageXML.getAttribute("feedback")).text();
        XTEnterInteraction(x_currentPage, XTGetBlockNr(blockid), 'text', label, [], modelAnswerTxt, [], x_currentPageXML.getAttribute("grouping"));
        XTSetLeavePage(x_currentPage, XTGetBlockNr(blockid), this.leavePage);
        XTSetInteractionPageXML(x_currentPage, XTGetBlockNr(blockid), x_currentPageXML);
        XTSetInteractionModelState(x_currentPage, XTGetBlockNr(blockid), this.modelAnswerModel);

        // feedbackBtnWidth attribute not used as button will be sized automatically
        var panelWidth = x_currentPageXML.getAttribute("panelWidth"),
            $splitScreen = jGetElement(blockid, ".pageContents .splitScreen"),
            $textHolder = jGetElement(blockid, ".textHolder"),
            $prompt = jGetElement(blockid, ".prompt");

        if (panelWidth == "Full") {
            jGetElement(blockid, ".pageContents .panel").appendTo(jGetElement(blockid, ".pageContents"));
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


        var promptString = x_addLineBreaks(x_currentPageXML.getAttribute("prompt")),
            url = x_currentPageXML.getAttribute("image");
        if (url != undefined && url != "") {
            if (url.split('.').pop().slice(0, -1) == "swf") {
                promptString += '<div class="centerAlign"><div id="pageSWF"><h3 class="alert">' + x_getLangInfo(x_languageData.find("errorFlash")[0], "label", "You need to install the Flash Player to view this content.") + '</h3><p><a href="http://www.adobe.com/go/getflashplayer"><img class="flashImg" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="' + x_getLangInfo(x_languageData.find("errorFlash")[0], "description", "Get the Flash Player") + '" /></a></p></div></div>';
            } else {
                promptString += '<div class="panelImg"><img src="' + x_evalURL(url) + '"';
                if (x_currentPageXML.getAttribute("tooltip") != undefined && x_currentPageXML.getAttribute("tooltip") != "") {
                    promptString += 'alt="' + x_currentPageXML.getAttribute("tooltip") + '" ';
                }
                promptString += '/></div>';
            }
        }
        $prompt.html(promptString);

        if (url != undefined && url != "" && url.split('.').pop().slice(0, -1) == "swf") {
            swfobject.embedSWF(x_evalURL(url), "pageSWF", "100", "100", "9.0.0", x_templateLocation + "common_html5/expressInstall.swf");
        }


        var copyTxt = x_currentPageXML.getAttribute("copypasteinfo2"),
            copyTxtFlash = x_currentPageXML.getAttribute("copypasteinfo");

        // should instructions about copying & pasting answer be shown?
        if ((copyTxt != undefined && copyTxt != "") || (copyTxtFlash != undefined && copyTxtFlash != "")) {
            if (copyTxt == undefined || copyTxt == "") {
                // the only copy text is for Flash version - the instructions need to be different for HTML version so am forced to use English fall back
                copyTxt = "<p>Note: Click the 'Select Text' button to highlight the instruction, question, your response and the example answer and then Ctrl + C to copy this text to the clipboard. You can then paste (Ctrl + V) into another application such as Open Office, Word or an email to save for future reference.</p>";
            }

            var copyBtnLabel = x_currentPageXML.getAttribute("copyBtnLabel") != undefined ? x_currentPageXML.getAttribute("copyBtnLabel") : "Select Text",
                copyBtnSRInfo = x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") != "" && x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") != null ? " " + x_getLangInfo(x_languageData.find("screenReaderInfo")[0], "dialog", "") : "";

            jGetElement(blockid, ".copyTxt")
                .html(copyTxt)
                .hide();

            jGetElement(blockid, ".copyBtn")
                .button({
                    label: copyBtnLabel
                })
                .click(function () {
                    // unlike in Flash version we can't automatically copy text to clipboard - instead the text to copy is put together, shown highlighted in a dialog, and the user is prompted to Ctrl-C to copy
                    jGetElement(blockid, ".x_popupDialog").parent().detach(); // removes any dialogs already open
                    var $thisDialog = $('<div id="modelAnswerDialog" class="x_popupDialog">' + x_pageInfo[x_currentPage].savedData + '</div>').appendTo($x_body);

                    $thisDialog.dialog({
                        closeOnEscape: true,
                        title: copyShortcutTxt,
                        closeText: closeBtnTxt,
                        close: function () {
                            $thisDialog.parent().detach();
                        }
                    });

                    $thisDialog.html(x_pageInfo[x_currentPage].savedData);
                    x_setDialogSize($thisDialog);

                    x_selectText("modelAnswerDialog");
                })
                .attr("aria-label", copyBtnLabel + copyBtnSRInfo)
                .hide();

        } else {
            jGetElement(blockid, ".copyBtn, .copyTxt").remove();
        }

        jGetElement(blockid, ".pageContents").data("feedback", x_addLineBreaks(x_currentPageXML.getAttribute("feedback")));

        var btnTxt = x_currentPageXML.getAttribute("feedbackBtnTxt");
        if (btnTxt == undefined || btnTxt == "") {
            btnTxt = "Feedback";
        }

        // feedbackBtnTip attribute not used
        jGetElement(blockid, ".button")
            .button({
                label: btnTxt
            })
            .click(function () {
                var $this = $(this);
                $this.hide();
                jGetElement(blockid, ".fbTxt")
                    .empty()
                    .html(jGetElement(blockid, ".pageContents").data("feedback"));

                jGetElement(blockid, ".copyBtn, .copyTxt").show();

                x_pageContentsUpdated();

                modelAnswer.finishTracking();
                if (x_currentPageXML.getAttribute("copypasteinfo") != undefined && x_currentPageXML.getAttribute("copypasteinfo") != "") {

                }
            });

        if (x_currentPageXML.getAttribute("required") == 'true') {
            jGetElement(blockid, ".button").prop("disabled", true);
        }

        jGetElement(blockid, ".answerTxt").on('input', function () {
            // if answer is required, only show submit button when something has been typed in box
            if (x_currentPageXML.getAttribute("required") == 'true' && jGetElement(blockid, ".answerTxt").val().trim() == '') {
                jGetElement(blockid, ".button").prop("disabled", true);
            } else {
                jGetElement(blockid, ".button").prop("disabled", false);
            }

            modelAnswer.saveData(blockid);
        });


        var copyShortcutTxt = x_currentPageXML.getAttribute("copyShortcutTxt");
        if (copyShortcutTxt == undefined) {
            copyShortcutTxt = "Press Ctrl + C to copy"
        }
        var closeBtnTxt = x_currentPageXML.getAttribute("closeBtnTxt");
        if (closeBtnTxt == undefined) {
            closeBtnTxt = "close"
        }

        var answerFieldLabel = x_currentPageXML.getAttribute("answerFieldLabel");
        if (answerFieldLabel === undefined | answerFieldLabel === null) {
            answerFieldLabel = "Answer";
        }
        jGetElement(blockid, ".answerTxt").attr({"aria-label": answerFieldLabel});

        this.sizeChanged(blockid);
        this.saveData(blockid);
        x_pageLoaded();
    };


    // function saves data to pageData array in xenith.js so it can be used later by modelAnswerResults page
    this.saveData = function (blockid) {
        var $pageContents = jGetElement(blockid, ".pageContents"),
            stringToSave = $pageContents.data("dataString"),
            answerTxt = jGetElement(blockid, ".answerTxt").val();

        if (answerTxt.trim() == "") {
            answerTxt = $pageContents.data("noAnswerTxt");
        }

        stringToSave = stringToSave.replace("{A}", x_addLineBreaks(answerTxt, true));
        x_pageInfo[x_currentPage].savedData = stringToSave;
    };

    this.finishTracking = function (blockid) {
        this.modelAnswerModel = XTGetInteractionModelState(x_currentPage, XTGetBlockNr(blockid))
        if(this.modelAnswerModel.tracked !== true){
            var answerTxt = jGetElement(blockid, ".answerTxt").val();
            result = {
                success: (answerTxt.trim() == "" ? false : true),
                score: (answerTxt.trim() == "" ? 0.0 : 100.0)
            };

            XTExitInteraction(x_currentPage, XTGetBlockNr(blockid), result, [], answerTxt, []);
            this.tracked = true;
        }

    };

};
