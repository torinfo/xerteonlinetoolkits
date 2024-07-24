var categoriesBlock = new function() {
    // var labelTxt1,
    //     labelTxt2,
    //     labelTxt3,
    //     targetTxt1,
    //     targetTxt2,
    //     checked,
    //     total_options;

    updateContainment = function(){
        $.widget("ui.sortable", $.ui.sortable, {
            _setContainment: function () {
                var ce, co, over, maxHeight,
                    o = this.options;
                if (o.containment === "parent") {
                    o.containment = this.helper[0].parentNode;
                }
                if (o.containment === "document" || o.containment === "window") {
                    this.containment = [
                        0 - this.offset.relative.left - this.offset.parent.left,
                        0 - this.offset.relative.top - this.offset.parent.top,
                        $(o.containment === "document" ? document : window).width() - this.helperProportions.width - this.margins.left,
                        ($(o.containment === "document" ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
                    ];
                }

                if (!(/^(document|window|parent)$/).test(o.containment)) {
                    ce = $(o.containment)[0];
                    co = $(o.containment).offset();
                    over = ($(ce).css("overflow") !== "hidden");
                    maxHeight = (parseInt($(ce).css("max-height"), 10) || 0);

                    this.containment = [
                        co.left +
                        (parseInt($(ce).css("borderLeftWidth"), 10) || 0) +
                        (parseInt($(ce).css("paddingLeft"), 10) || 0) -
                        this.margins.left,
                        co.top +
                        (parseInt($(ce).css("borderTopWidth"), 10) || 0) +
                        (parseInt($(ce).css("paddingTop"), 10) || 0) -
                        this.margins.top,
                        co.left +
                        (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) -
                        (parseInt($(ce).css("borderLeftWidth"), 10) || 0) -
                        (parseInt($(ce).css("paddingRight"), 10) || 0) -
                        this.helperProportions.width -
                        this.margins.left,
                        co.top +
                        (over ?
                            ((maxHeight && ce.scrollHeight > maxHeight) ?
                                    maxHeight : Math.max(ce.scrollHeight, ce.offsetHeight)
                            ) : ce.offsetHeight) -
                        (parseInt($(ce).css("borderTopWidth"), 10) || 0) -
                        (parseInt($(ce).css("paddingBottom"), 10) || 0) -
                        this.helperProportions.height -
                        this.margins.top
                    ];
                }
            }
        });
    }

    // function called every time the page is viewed after it has initially loaded
    this.pageChanged = function(blockid) {
        //jGetElement(blockid,".dragDropHolder .label").remove();
        //jGetElement(blockid,".feedback").hide();
        //this.createLabels(blockid);
    }

    // function called every time the size of the LO is changed
    this.sizeChanged = function(blockid) {
        if(jGetElement(blockid, ".pageContents").length == 0){
            return
        }
        let tallestLabel = 0;
				let labelCount = 0;
        jGetElement(blockid,".dragDropHolder .label").each(function() {
						labelCount += 1;
            var $this = $(this);
            if ($this.outerHeight() > tallestLabel) {
                tallestLabel = $this.outerHeight();
            }
        });

        jGetElement(blockid,".initHolder").height(tallestLabel);

        var $categoryHolder = jGetElement(blockid,".categoryHolder"),
            $category = $categoryHolder.find(".category");


        if ($("#x_page" + x_currentPage).is(":hidden")){
            $("#x_page" + x_currentPage).show();
        }
        let standalone = $("#"+blockid).parent().parent().attr('id') == "x_pageDiv";
        let pageHolder_standin = standalone ? $x_pageHolder :  $("#"+blockid).parent().parent();
        let pageDiv_standin = standalone ? $x_pageDiv :  $("#"+blockid).parent().parent();
        if ($("#"+blockid).parent().parent().attr("class") == "panelPage"){
            pageHolder_standin = $("#"+blockid).parent().parent().parent();
        }
        let categoryHolderOffset = parseInt($categoryHolder.offset().top) - parseInt($("#"+blockid).offset().top);
				let pageScroll = $("#"+blockid).scrollParent().scrollTop;  
        let blockOffset = parseInt($("#"+blockid).parent().children().first().offset().top) - parseInt(pageHolder_standin.offset().top) + parseInt($("#"+blockid).css("padding-top")) * 2 + parseInt($("#"+blockid).css("margin-bottom"));
        let min_height = pageHolder_standin.height() - parseInt(pageDiv_standin.css("padding-top")) * 2 - (-blockOffset) - categoryHolderOffset - parseInt($category.css("padding-top")) * 2 - jGetElement(blockid,".button").height() - 25;

        $category.css("min-height", tallestLabel*labelCount);
    }

    this.leavePage = function(blockid)
    {
				const state = x_getPageDict("state", blockid);
        if (state.checked)
        {
            this.showFeedBackandTrackScore(blockid);
        }
    }

    this.showFeedBackandTrackScore = function(blockid)
    {
				const state = x_getPageDict("state", blockid);
        var l_options = [],
            l_answers = [],
            l_feedback = [],
            l_total=0,
            l_correct=0;

        jGetElement(blockid,".dragDropHolder .tick").remove();

        jGetElement(blockid,".categoryHolder .category .label").each(function() {
            var $this = $(this);
            var l_answer, l_option = {};
            l_option.source = $this.data("name");
            //l_option.target = $this.data("category").data("name");
            l_option.target = $this.parent().data("name");
            l_answer = $this.data("name") + "-->" + $this.parent().data("name");
            l_answers.push(l_answer);

            l_total++;
            if ($this.data("category").is($this.parent())) {
                $this.html($this.html() + '<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Correct") + '</span><span class="fa fa-fw fa-x-tick"></span></span>');
                l_feedback.push("correct");
                l_option.result = true;
                l_correct++;
            }
            else {
                $this.html($this.html() + '<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Incorrect") + '</span><span class="fa fa-fw fa-x-cross"></span></span>');
                l_feedback.push("incorrect");
                l_option.result = false;
            }
            l_options.push(l_option);
        });

        jGetElement(blockid,"#scoreTxt").html(l_correct);
        jGetElement(blockid,"#totalTxt").html(state.totaloptions);
        jGetElement(blockid,".feedback").show();
        var result = {
            success: (l_correct == state.totaloptions),
            score: (l_correct * 100.0)/state.totaloptions
        }
        ;
        XTExitInteraction(x_currentPage, x_getBlockNr(blockid), result, l_options, l_answers, l_feedback);
        //XTSetPageScore(x_currentPage, (l_correct * 100.0)/variables.totaloptions);
        state.checked = true;
    }

    this.init = function(blockid) {
        updateContainment();
        var blockXML = x_getBlockXML(blockid);
        let temp_state = {checked: false,
                         totaloptions: 0,
                         weighting: 1.0};
				const state = x_pushToPageDict(temp_state, "state", blockid);

        var correctOptions = [],
            correctAnswer = [],
            correctFeedback = [];

        // store strings used to give titles to labels and categories when keyboard is being used (for screen readers)
        // These string values are never changed so we can push them to the pagedict as is. (not in an object like checked, totaloptions and weighting)
        let labelTxt1 = state.labelTxt1 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "name", "Draggable Item");
        let labelTxt2 = state.labelTxt2 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "selected", "Item Selected");
        let labelTxt3 = state.labelTxt3 = x_getLangInfo(x_languageData.find("interactions").find("draggableItem")[0], "toSelect", "Press space to select");
        let targetTxt1 = state.targetTxt1 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "description", "Drop zone for");
        let targetTxt2 = state.targetTxt2 = x_getLangInfo(x_languageData.find("interactions").find("targetArea")[0], "toSelect", "Press space to drop the selected item.");

        jGetElement(blockid,".textHolder")
            .html(x_addLineBreaks(blockXML.getAttribute("text")))
            .addClass("transparent"); /* without the text having a bg the labels strangely aren't selectable in IE */

        var $feedback = jGetElement(blockid,".feedback");
        if (blockXML.getAttribute("feedback") != undefined && blockXML.getAttribute("feedback") != "") {
            $feedback.html(x_addLineBreaks(blockXML.getAttribute("feedback")));
        }
        if (blockXML.getAttribute("feedbackScore") != undefined && blockXML.getAttribute("feedbackScore") != "") {
            $feedback.append('<p>' + x_addLineBreaks(blockXML.getAttribute("feedbackScore").replace("{i}", '<span id="scoreTxt"></span>').replace("{n}", '<span id="totalTxt"></span>')) + '</p>');
        } else if ($feedback.html().length == 0) {
            $feedback.remove();
        }
        $feedback.hide();

        // buttonWidth attribute not used as button will be sized automatically
        var buttonLabel = blockXML.getAttribute("buttonLabel");
        if (buttonLabel == undefined) {
            buttonLabel = "Check Answers";
        }

        var $button = jGetElement(blockid,".button")
            .button({
                label:	buttonLabel
            })
            .click(function() { // mark labels and show feedback
                categoriesBlock.showFeedBackandTrackScore(blockid);
                const state = x_getPageDict("state", blockid);
                state.checked = true;
            });

        // create categories
        var $categoryHolder = jGetElement(blockid,".categoryHolder"),
            $firstCategory = $categoryHolder.find(".category"),
            labels = [];
        $(blockXML).children()
            .each(function(i) {
                var $thisCategory,
                    catName,
                    itemName;

                if (i != 0) {
                    $thisCategory = $firstCategory.clone().appendTo($categoryHolder);
                } else {
                    $thisCategory = $firstCategory;
                }
                catName = this.getAttribute("name");
                $thisCategory.find("h3").html(catName);
                $thisCategory.data("name", catName);
                $(this).children().each(function(j) {
                    var correctOption={};
                    itemName = this.getAttribute("name");
                    labels.push({name:itemName, correct:$thisCategory});
                    correctOption.source = itemName;
                    correctOption.target = catName;
                    correctOptions.push(correctOption);
                    correctAnswer.push(itemName + "-->" + catName);
                    correctFeedback.push("Correct");
										state.totaloptions++;
                });
            });

        var label = $('<div>').html(blockXML.getAttribute("name")).text();
        if (blockXML.getAttribute("trackinglabel") != null && blockXML.getAttribute("trackinglabel") != "")
        {
            label = blockXML.getAttribute("trackinglabel");
        }

        // Track the quiz page
        ;
        XTEnterInteraction(x_currentPage, x_getBlockNr(blockid), 'match', label, correctOptions, correctAnswer, correctFeedback, blockXML.getAttribute("grouping"), null);
        if (blockXML.getAttribute("trackingWeight") != undefined)
        {
            state.weighting = blockXML.getAttribute("trackingWeight");
        }
        XTSetInteractionType(x_currentPage, x_getBlockNr(blockid), 'match', state.weighting);

        var $pageContents = jGetElement(blockid,".pageContents");
        state.labels = labels;

        // style categories
        var numColumns = $(blockXML).children().length,
            spacerWidth = ((numColumns - 1) * 2) + (numColumns * 2), // 2% gap between categories & 1% left & 1% right padding inside categories
            columnWidth = Math.floor((100 - spacerWidth) / numColumns),
            edgeWidth = Math.floor((100 - spacerWidth - (columnWidth * numColumns)) / 2);

        jGetElement(blockid,".categoryHolder .category, .initHolder")
            .css({
                width			:columnWidth + "%",
                "margin-left"	:"2%"
            });
        jGetElement(blockid,".categoryHolder .category:first").css("margin-left", edgeWidth + "%");

        // set up events used when keyboard rather than mouse is used
        // these highlight selected labels / targets and set the title attr which the screen readers will use
        jGetElement(blockid,".categoryHolder .category")
            .focusin(function(e) {
                if ($(e.target).hasClass("category")) {
                    $(this).addClass("highlightDark");
										const state = x_getPageDict("state", blockid);
                    var $pageContents = jGetElement(blockid,".pageContents");
                    var categoryTitle = $("<div>").html($(this).find("h3").html()).text();
                    if (state.selectedLabel != undefined && state.selectedLabel != "") {
                        $(this).attr("title", targetTxt1 + " " + categoryTitle + " - " + targetTxt2);
                    }
                }
            })
            .focusout(function() {
                var $pageContents = jGetElement(blockid,".pageContents");
                var categoryTitle = $("<div>").html($(this).find("h3").html()).text();

                $(this)
                    .removeClass("highlightDark")
                    .attr("title", targetTxt1 + " " + categoryTitle);
            })
            .keypress(function(e) {
                if ($(e.target).hasClass("category")) {
                    var charCode = e.charCode || e.keyCode;
                    if (charCode == 32) {
												const state = x_getPageDict("state", blockid);
                        var $pageContents = jGetElement(blockid,".pageContents");
                        var $selectedLabel = state.selectedLabel;
                        // drop selected label on target, remove selection and show next label
                        if ($selectedLabel != undefined && $selectedLabel != "") {
                            if ($selectedLabel.parent().is(jGetElement(blockid,".initHolder"))) {
                                jGetElement(blockid,".initHolder .label:eq(1)").show();
                            }
                            $selectedLabel
                                .removeClass("selected")
                                .attr("title", labelTxt1)
                                .appendTo($(this));
                            state.selectedLabel = "";
                            var categoryTitle = $("<div>").html($(this).find("h3").html()).text();

                            $(this).attr("title", targetTxt1 + " " + categoryTitle);

                            // change tab index of label so it's now after the target it's on
                            var categoryIndex = $(this).attr("tabindex");
                            $(this).children(".label").each(function(i) {
                                $(this).attr("tabindex", categoryIndex + i + 1);
                            });
                        }
                    }
                }
            });

        // set tab index for targets - leaving space between them for any labels that are put on them
        var tabIndex = 0;
        for (let i=0; i<$categoryHolder.find(".category").length; i++) {
            tabIndex = (i + 1) * (state.labels.length + 1) + 1;
            var $category = $categoryHolder.find(".category:eq(" + i + ")");
            var categoryTitle = $("<div>").html($category.find("h3").html()).text();

            $category.attr({
                "tabindex"	:tabIndex,
                "title"		:targetTxt1 + " " + categoryTitle
            });
        }
        tabIndex += state.labels.length;
        $button.attr("tabindex", tabIndex + 1);
        $feedback.attr("tabindex", tabIndex + 2);

        this.createLabels(blockid);

        this.sizeChanged(blockid);
        x_pageLoaded();
    };

    this.createLabels = function(blockid) {
				const state = x_getPageDict("state", blockid);
        let labelTxt1 = state.labelTxt1;
        let labelTxt2 = state.labelTxt2;
        let labelTxt3 = state.labelTxt3;
        let targetTxt1 = state.targetTxt1;
        // randomise order and create labels
        var $pageContents = jGetElement(blockid,".pageContents"),
            labels = [],
            tempLabels = state.labels.slice(0),
            i;

        for (i=0; i<state.labels.length; i++) {
            var labelNum = Math.floor(Math.random() * tempLabels.length);
            labels.push(tempLabels[labelNum]);
            tempLabels.splice(labelNum, 1);
        }
        for (i=0; i<labels.length; i++) {
            jGetElement(blockid,".initHolder").append('<li class="label panel" id="label' + i + '" tabindex="' + (i+2) + '" title="' + labelTxt1 + '"><p>' + labels[i].name + '</p></li>');
            var $thisLabel = jGetElement(blockid,"#label" + i);
            $thisLabel.data("category", labels[i].correct);
            $thisLabel.data("name", labels[i].name);

            if (i != 0) {
                $thisLabel.hide();
            }
        }
        jGetElement(blockid,".initHolder, .categoryHolder .category").sortable({
            connectWith:	".categoryHolder .category",
            items:			".label",
            containment:	"#"+blockid +" .dragDropHolder",
            stop:	function(event, ui) {
                if (ui.item.parent().is(jGetElement(blockid,".initHolder")) == false) {
                    // show next label if it came from initHolder
                    if ($(this).is(jGetElement(blockid,".initHolder"))) {
                        jGetElement(blockid,".initHolder .label:first").show();
                    }

                    // change tab index of label so it's now after the target it's on
                    var categoryIndex = ui.item.parent().attr("tabindex");
                    ui.item.parent().children(".label").each(function(i) {
                        $(this).attr("tabindex", categoryIndex + i + 1);
                    });
                }
                if ($("#infoHolder").length != 0){
                    $("#infoHolder").css("overflow", "auto");
                    $("#infoHolder").css("padding-right", "");
                }else{
                    $("#"+blockid).parent().css("overflow", "auto");
                    $("#"+blockid).parent().css("padding-right", '');
                }
            },
            start:	function() {
								const state = x_getPageDict("state", blockid);
                // remove any focus/selection highlights made by tabbing to labels/targets
                var $pageContents = jGetElement(blockid,".pageContents");
                if (jGetElement(blockid,".dragDropHolder .label.focus").length > 0) {
                    jGetElement(blockid,".dragDropHolder .label.focus").attr("title", labelTxt1);
                } else if (state.selectedLabel != undefined && state.selectedLabel != "") {
                    state.selectedLabel.attr("title", labelTxt1);
                    state.selectedLabel = "";
                }
                var targetInFocus = jGetElement(blockid,".dragDropHolder .category.highlightDark");
                if (targetInFocus.length > 0) {
                    var categoryTitle = $("<div>").html(targetInFocus.find("h3").html()).text();
                    targetInFocus.attr("title", targetTxt1 + " " + categoryTitle);
                }
                jGetElement(blockid,".dragDropHolder .selected").removeClass("selected");
                jGetElement(blockid,".dragDropHolder .focus").removeClass("focus");
                jGetElement(blockid,".dragDropHolder .highlightDark").removeClass("highlightDark");

                jGetElement(blockid,".feedback").hide();
                jGetElement(blockid,".dragDropHolder .tick").remove();

                //TODO: this is kind of a hack because the containment doesnt work when infoholder can scroll
                if ($("#infoHolder").length != 0) {
                    $("#infoHolder").css("overflow", "hidden");
                    //TODO: this works for firefox but might not be the correct scrollbarwidth for other browsers:
                    $("#infoHolder").css("padding-right", "8px");
                }else{
                    $("#"+blockid).parent().css("overflow", "hidden");
                    let pad = $("#"+blockid).parent().css('padding-right');
                    $("#"+blockid).parent().css("padding-right", parseFloat(pad) + 8.0);
                }
            }
        }).disableSelection();

        // set up events used when keyboard rather than mouse is used
        // these highlight selected labels / targets and set the title attr which the screen readers will use
        jGetElement(blockid,".dragDropHolder .label")
            .focusin(function() {
								const state = x_getPageDict("state", blockid);
                var $this = $(this);
                if ($this.is(state.selectedLabel) == false) {
                    $this
                        .addClass("focus")
                        .attr("title", labelTxt1 + " - " + labelTxt3);
                }
            })
            .focusout(function() {
                var $this = $(this);
                $this.removeClass("focus");
                if ($this.is(state.selectedLabel) == false) {
                    $this.attr("title", labelTxt1);
                }
            })
            .keypress(function(e) {
                var charCode = e.charCode || e.keyCode;
                if (charCode == 32) {
										const state = x_getPageDict("state", blockid);
                    var $pageContents = jGetElement(blockid,".pageContents");
                    if (state.selectedLabel != undefined && state.selectedLabel != "") {
                        state.selectedLabel
                            .removeClass("selected")
                            .attr("title", labelTxt1);
                    }
                    var $this = $(this);
                    $this
                        .removeClass("focus")
                        .addClass("selected")
                        .attr("title", labelTxt1 + ' - ' + labelTxt2);
                    state.selectedLabel = $this;

                    jGetElement(blockid,".feedback").hide();
                    jGetElement(blockid,".dragDropHolder .tick").remove();
                }
            });
    }
}
