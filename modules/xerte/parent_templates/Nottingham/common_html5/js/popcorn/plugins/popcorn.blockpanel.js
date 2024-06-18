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

/* _____BlockPanel POPCORN PLUGIN_____
Adds interactive blocks to the overlay panel

required: target start name text type button|radio|list answerType single|multiple clearPanel* pauseMedia*
optional: end feedback position* line overlay
language: feedbackLabel singleRight singleWrong multiRight multiWrong checkBtnTxt continueBtnTxt topOption

*dealt with in interactiveVideo.html

*/


(function (Popcorn) {
    Popcorn.plugin("blockpanel", function(options) {

        // define plugin wide variables / functions here
        var $target, $optHolder, $checkBtn, $feedbackDiv, $continueBtn, media, selected, judge, autoEnable, $showHs, $showLbl, $showHsActive, $learningObjectParent;

        return {
            _setup: function(options) {
                media = this;
                judge = false;
                autoEnable = true;
                var tempEnable = false;
                $learningObjectParent = eval(x_currentPageXML.nodeName);
                $target = $("#" + options.target);
                $target.hide();


                $optHolder = $('<div class="optionHolder"/>').appendTo($target);
								$panel = $('<div class="panel"></div>').appendTo($optHolder); //.attr("id","testBlock")
								let start = options.blockNrOffset?? 0;
								
								for(let i = 0; i < options.childNodes.length; i++){
										x_createBlock($panel, options.childNodes[i], start + (i + 1));
								}
            },

            start: function(event, options) {
								console.log(event, options);
                console.log("I am probably missing code here");
                // fire on options.start
                if (options.overlayPan) {
                    if ($showHsActive == true) {
                        $target.parent().css({"margin-right" : "5px", "overflow-x": "hidden"});
                    }

                    if ($showHsActive == true || options.optional == "false" || options.optional == undefined) {
                        $target.parent().addClass("qWindow").addClass("panel");
                        $target.parent().css({
                            "padding": "5px",
                            "width" : options._w + "%",
                            "overflow-x": "hidden"
                        });
                        $optHolder.show();
                    }
                    else {
                        var hh = $(".mainMedia").height();
                        var size = options.attrib.hsSize;
                        $showHs.css({
                            "height"  :       (size * 0.008) * hh + "px",
                            "width"   :       (size * 0.008) * hh + "px",
                            "padding" :       (size * 0.001) * hh + "px",
                            "border-radius" : (size / 2 + 1) * 0.01 * hh + "px",
                            "font-size" : 	  (size * 0.007) * hh + "px",
                        });
                        if(options.attrib.tooltip == "label") {
                            // Cap the fontsize to reasonable values
                            var fs = size * 0.4 <= 12 ? 12 : size * 0.4 > 32 ? 32 : size * 0.4;
                            $showLbl.css({
                                "padding": 5,
                                "padding-left": (size * 0.55) * 0.01 * hh + 5,
                                "left": (size * 0.005) * hh + 5,
                                "top": (size * 0.005) * hh - 2,
                                "font-size": fs
                            });
                        }
                        else if(options.attrib.tooltip == "tooltip"){
                            $showHs.hover(function(){
                                $showLbl.css({
                                    "left": $showLbl.outerWidth()  * -0.5 + (size * 0.005 * hh),
                                    "top" : $showLbl.outerHeight() * -1,
                                    'box-shadow': 'none',
                                    "overflow" : 'hidden'
                                }).show();
                            }, function() {
                                $showLbl.css({
                                    'box-shadow': 'none',
                                    'z-index': 1
                                }).hide();
                            });
                        }
                        $target.parent().css({
                            "padding": 0,
                            "height": 0
                        });
                    }
                    $target.parent().css({
                        "max-width": options._w + "%",
                        "top": options._y + "%",
                        "left": options._x + "%"
                    }).show();
                }
								$target.append($("<button>close</button>").button({label: "Close"}).click(()=>{
										media.play();
										$learningObjectParent.enableControls(media.media, true);
										$target.parent().hide();
								}));
                $target.show();
								$(window).trigger("resize");
            },

            end: function(event, options) {

                // fire on options.end
                $learningObjectParent.enableControls(this.media, true);
                if (options.overlayPan) {
                    $target.parent().removeClass("qWindow").removeClass("panel");
                    $target.parent().css( //The overlay panel
                        {
                            "top": 0,
                            "left": 0,
                            "padding": 0,
                            "height": "auto",
                            "margin-right" : 0,
                            "overflow-x": '',
                            "overflow" : '',
                            "max-width": ''
                        }).hide();
                }
                $target.hide();
            },
        };
    });
})(Popcorn);
