function InteractionState(id, page_nr, ia_nr, ia_type, ia_name, grouping, context, ia_sub_nr){
    this.id = id;
    this.page_nr = page_nr;
    this.ia_nr = ia_nr;
    this.ia_sub_nr = ia_sub_nr;
    this.ia_type = ia_type;
    this.ia_name = ia_name;
		this.grouping = "";
		this.context = "";
    this.start = new Date();
    this.end = this.start;
    this.count = 0;
    this.duration = 0;
    this.weighting = 0.0;
    this.score = 0.0;
    this.correctOptions = [];
    this.correctAnswers = [];
    this.learnerAnswers = [];
    this.learnerOptions = [];
    this.pageXML = {};
		this.result = {
				success: false,
				score: 0,
		};

    this.exit = exit;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;
		this.getPageDescription = getPageDescription;
    this.getxApiDescription = getxApiDescription;
		this.getxApiId = getxApiId;
    this.setPageXML = setPageXML;
		this.getPageId = getPageId;
		this.setVars = setVars;
    this.leavePage = null;
    this.modelState = {};
        
		if (typeof grouping != "undefined" && grouping != "" && grouping !=
        null) {
        this.grouping = grouping;
    } else {
        this.grouping = "";
    }
		
    if (typeof context != "undefined" && context != "" && context !=
        null) {
        this.context = context;
    } else {
        this.context = "";
    }

    function exit()
    {
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        if (duration > 100)
        {
            this.duration += duration;
            this.count++;
            return true;
        }
        else
        {
            return false;
        }

    }

    function enterInteraction(correctAnswers, correctOptions)
    {
        this.correctAnswers = correctAnswers;
        this.correctOptions = correctOptions;
				console.log("enter fun", this);

        var id = this.getxApiId();
        var description = this.getxApiDescription();

        var statement = {
            actor: actor,
            context: {
                extensions: {
                    "http://xerte.org.uk/learningObjectLevel" : "interactivity"
                }
            },
            verb: {
                id: "http://adlnet.gov/expapi/verbs/initialized",
                display: {
                    "en-US": "initialized"
                }
            },
            object: {
                objectType: "Activity",
                id: id,
                definition: {
                    name: {
                        "en": description
                    }
                }
            },
            timestamp: this.enterInteractionStamp
        };
        statement.object.definition.name[state.language] = description;

        if (this.grouping != "") {
            var definition = {
                name: {
                    'en-US': this.grouping,
                }
            };
            definition.name[state.language] = this.grouping;
            statement.context.contextActivities =
            {
                grouping: [{
                    id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                    definition: definition,
                    objectType: "Activity"
                }]
            };
        }
        if (this.context != "")
        {
            let contextitems = this.context.split(',');
            contextitems.forEach(function (contextitem){
                let item = contextitem.split('=');
                if (item.length == 2) {
                    let key = "http://xerte.org.uk/" + item[0];
                    let value = item[1].replace(" ", "_");
                    statement.context.extensions[key] = value;
                }
            });
        }
        SaveStatement(statement);


    }

		function getPageDescription() {
        var sitp = state.findPage(this.page_nr); //TODO: maybe not use "state" here
        if (sitp != null) {
            return sitp.getPageDescription();
        }
        return "Page " + this.page_nr;
    }

		function getxApiId() {
        var id = this.getPageId();
				if (this.ia_name != null && this.ia_name != "") {
						return id + "/" + this.ia_name.replace(/[\/ ]/g, "_");
				} else {
						return id + "/" + this.ia_nr;
				}
		}
    
		function getPageId() {
				var sitp = state.findPage(this.page_nr); //TODO: maybe not use "state" here
				if (sitp != null) {
						return sitp.getPageId();
				}
				return baseUrl() + state.templateId + "/" + this.page_nr;
		}

    function getxApiDescription() {
        if (this.ia_nr >= 0) {
            if (this.ia_name != null && this.ia_name != "") {
                return $("<div>").html(this.ia_name).text();
            } else {
                return "Interactivity " + this.ia_nr;
            }
        } else {
            return this.getPageDescription();
        }
    }

    function exitInteraction(result, learnerAnswers, learnerOptions, feedback) { // TODO: maybe not use "state" here 
        this.learnerAnswers = learnerAnswers;
        this.learnerOptions = learnerOptions;
        this.result = result;
        this.feedback = feedback;
				if(result.score != null) {
						this.score = result.score;
				}
				console.log("exit fun", this);

        var pagename = this.getPageDescription();

        var pageref = " page " + this.page_nr + " of object " + state.templateId +
            " of Xerte Installation " + baseUrl();
        if (pagename.substr(0, 4) != "Page") {
            pageref = " page \"" + pagename + "\" (page " + this.page_nr +
                ") of object " + state.templateId + " of Xerte Installation " +
                baseUrl();
        }
        var id = this.getxApiId();
        var description = this.getxApiDescription();

        if (this.exit()) {
            if (state.scoremode != 'first' || this.count <= 1) {

                if (!state.trackingmode != 'none' && ((this.ia_nr < 0 && (state
                        .trackingmode != 'full' || this.nrinteractions ==
                        0)) || (this.ia_nr >= 0 && state.trackingmode ==
                        'full'))) {

                    var statement = {
                        timestamp: this.end,
                        actor: actor,
                        context: {
                            extensions: {
                                "http://xerte.org.uk/learningObjectLevel" : "interactivity"
                            }
                        },
                        verb: {
                            id: "http://adlnet.gov/expapi/verbs/answered",
                            display: {
                                "en-US": "answered"
                            }
                        },
                        object: {
                            objectType: "Activity",
                            id: id
                        }
                    };

                    var psit = state.findPage(this.page_nr);
                    if (psit != null) {
                        var pweighting = psit.weighting;
                        var nrinteractions = psit.nrinteractions;
                    } else {
                        var pweighting = 1.0;
                        var nrinteractions = 1.0;
                    }
                    switch (this.ia_type) {
                        case 'match':
                            // We have an options as an array of objects with source and target
                            // and we have corresponding array of answers strings
                            // Construct answers like a:Answerstring
                            var scormAnswerArray = [];
                            var i = 0;
                            for (i = 0; i < learnerOptions.length; i++) {
                                // Create ascii characters from option number and ignore answer string
                                var entry = learnerOptions[i];
                                if (typeof(entry.source) == "undefined")
                                    entry.source = "";
                                scormAnswerArray.push(entry.source.replace(/ /g,
                                    "_") + "[.]" + entry.target.replace(
                                    / /g, "_"));
                            }
                            var scorm_lanswer = scormAnswerArray.join('[,]');

                            // Do the same for the answer pattern
                            var sourceArray = [];
                            var targetArray = [];
                            var scormCorrectArray = [];
                            var i = 0;
                            for (i = 0; i < this.correctOptions.length; i++) {
                                // Create ascii characters from option number and ignore answer string
                                var entry = this.correctOptions[i];
                                var entryobject = {
                                    id: entry.source.replace(/ /g, "_"),
                                    description: {
                                        "en-US": entry.source
                                    }
                                };
                                entryobject.description[state.language] = entry.source;
                                sourceArray.push(entryobject);
                                // Only add to target array if not already present
                                var found = false;
                                var targetid = entry.target.replace(/ /g, "_");
                                for (var j = 0; j < targetArray.length; j++) {
                                    if (targetid == targetArray[j]['id']) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    var targetObj = {
                                        id: entry.target.replace(/ /g,
                                            "_"),
                                        description: {
                                            "en-US": entry.target
                                        }
                                    };
                                    targetObj.description[state.language] = entry.target;
                                    targetArray.push(targetObj);
                                }
                                scormCorrectArray.push(entry.source.replace(
                                    / /g, "_") + "[.]" + entry.target.replace(
                                    / /g, "_"));
                            }
                            var scorm_canswer = scormCorrectArray.join('[,]');
                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Matching interaction " + description + " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "matching",
                                source: sourceArray,
                                target: targetArray,
                                correctResponsesPattern: [scorm_canswer]
                            };
                            statement.object.definition.name[state.language] = description;
                            statement.result = {
                                duration: calcDuration(this.start, this.end),
                                score: {
                                    raw: result.score,
                                    min: 0.0,
                                    max: 100.0,
                                    scaled: result.score / 100.0
                                },
                                response: scorm_lanswer,
                                success: result.success,
                                completion: true,
                                extensions: {
                                    "http://xerte.org.uk/result/match": scorm_lanswer
                                }
                            };
                            break;
                        case 'multiplechoice':
                            // We have an options as an array of numbers
                            // and we have corresponding array of answers strings
                            // Construct answers like a:Answerstring
                            var scormAnswerArray = [];
                            var i = 0;

                            for (i = 0; i < learnerOptions.length; i++) {
                                var entry = learnerOptions[i]['answer'].replace(
                                    / /g, "_");
                                scormAnswerArray.push(entry);
                            }
                            var scorm_lanswer = scormAnswerArray.join('[,]');

                            // Do the same for the answer pattern
                            var scormArray = [];
                            var scormCorrectArray = [];
                            var i = 0;
                            for (i = 0; i < this.correctOptions.length; i++) {
                                var entry = {
                                    id: this.correctOptions[i].answer.replace(
                                        / /g, "_"),
                                    description: {
                                        "en-US": this.correctOptions[i][
                                            'answer'
                                        ]
                                    }
                                };
                                entry.description[state.language] = this.correctOptions[i]['answer'];
                                scormArray.push(entry);
                                if (this.correctOptions[i].result) {
                                    scormCorrectArray.push(this.correctOptions[
                                        i].answer.replace(/ /g, "_"));
                                }
                            }
                            var scorm_canswer = [scormCorrectArray.join('[,]')];

                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Choice interaction " + description +
                                        " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "choice",
                                choices: scormArray,
                                correctResponsesPattern: scorm_canswer
                            };
                            statement.object.definition.name[state.language] = description;
                            statement.result = {
                                duration: calcDuration(this.start, this.end),
                                score: {
                                    raw: result.score,
                                    min: 0.0,
                                    max: 100.0,
                                    scaled: result.score / 100.0
                                },
                                response: scorm_lanswer,
                                success: result.success,
                                completion: true,
                                extensions: {
                                    "http://xerte.org.uk/result/multiplichoice": scorm_lanswer
                                }
                            };
                            break;
                        case 'numeric':
                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Numeric interaction " + description +
                                        " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "numeric",
                                correctResponsesPattern: ["0[:]100"]
                            };
                            statement.object.definition.name[state.language] = description;
                            if (this.ia_nr < 0) // Page mode
                            {
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: this.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: this.score / 100.0
                                    },
                                    response: this.score + "",
                                    success: (this.score >= state.lo_passed),
                                    completion: true
                                };
                            } else { // Interaction mode
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0
                                    },
                                    response: this.learnerAnswers + "",
                                    success: result.success,
                                    completion: true
                                };
                            }
                            break;
                        case 'text':
                        case 'fill-in':

                            // Hmmm is this the page or the interaction itself
                            if (this.ia_nr < 0) {
                                //This is the page
                                // Get the interaction, it is always assumed to be 0
                                var siti = state.findInteraction(this.page_nr,
                                    0);
                                this.correctAnswers = siti.correctAnswers;
                                this.learnerAnswers = siti.learnerAnswers;
                            }
                            statement.object.definition = {
                                name: {
                                    "en-US": description
                                },
                                description: {
                                    "en-US": "Fill-in interaction " + description +
                                        " of " + pageref
                                },
                                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                                interactionType: "fill-in",
                                correctResponsesPattern: [this.correctAnswers]
                            };
                            statement.object.definition.name[state.language] = this.ia_name;
                            if (this.ia_type == 'text') {
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0,
                                    },
                                    response: this.learnerAnswers,
                                    success: result.success,
                                    completion: true,
                                    extensions: {
                                        "http://xerte.org.uk/result/text": this.learnerAnswers
                                    }
                                };
                                statement.object.definition = {
                                    name: {
                                        "en-US": this.ia_name
                                    },
                                    description: {
                                        "en-US": "Model answer interaction " +
                                            this.ia_name + " of " + pageref
                                    }
                                };
                                statement.object.definition.name[state.language] = this.ia_name;
                            } else {
                                statement.result = {
                                    duration: calcDuration(this.start, this
                                        .end),
                                    score: {
                                        raw: result.score,
                                        min: 0.0,
                                        max: 100.0,
                                        scaled: result.score / 100.0
                                    },
                                    response: this.learnerAnswers,
                                    success: result.success,
                                    completion: true,
                                    extensions: {
                                        "http://xerte.org.uk/result/fill-in": this
                                            .learnerAnswers
                                    }
                                };
                            }
                            break;
                        case 'page':
                        default:
                            statement.verb = {
                                id: "http://adlnet.gov/expapi/verbs/interacted",
                                display: {
                                    "en-US": "interacted"
                                }
                            };
                            statement.object.definition = {
                                name: {
                                    "en": description
                                },
                                description: {
                                    "en": "Interaction with " + pageref
                                }
                            };
                            statement.object.definition.name[state.language] = description;
                            var duration = calcDuration(this.start, this.end);
                            statement.result = {
                                duration: duration,
                                success: result.success,
                                completion: Math.abs(this.end.getTime() -
                                    this.start.getTime()) > state.page_timeout
                            };
                    }
                    if (this.grouping != "") {
                        var definition = {
                            name: {
                                'en-US': this.grouping
                            }
                        };
                        definition.name[state.language] = this.grouping;
                        statement.context.contextActivities =
                            {
                                grouping: [{
                                    id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                                    definition: definition,
                                    objectType: "Activity"
                                }]
                            };
                    }
                    if (this.context != "")
                    {
                        let contextitems = this.context.split(',');
                        contextitems.forEach(function (contextitem){
                           let item = contextitem.split('=');
                           if (item.length == 2) {
                               let key = "http://xerte.org.uk/" + item[0];
                               let value = item[1];
                               statement.context.extensions[key] = value;
                           }
                        });
                    }
                    SaveStatement(statement);
                    if (typeof statement.result.score != 'undefined') {
                        var scoredstatement = {
                            timestamp: new Date(),
                            actor: actor,
                            context: {
                                extensions: {
                                    "http://xerte.org.uk/learningObjectLevel" : "interactivity"
                                }
                            },
                            verb: {
                                id: "http://adlnet.gov/expapi/verbs/scored",
                                display: {
                                    "en-US": "scored"
                                }
                            },
                            object: {
                                objectType: "Activity",
                                definition: {
                                    name: statement.object.definition.name,
                                    description: statement.object.definition
                                        .description
                                },
                                id: id
                            },
                            result: statement.result
                        };
                        if (this.grouping != "") {
                            scoredstatement.context.contextActivities = statement.context.contextActivities;
                        }
                        if (this.context != "")
                        {
                            let contextitems = this.context.split(',');
                            contextitems.forEach(function (contextitem){
                                let item = contextitem.split('=');
                                if (item.length == 2) {
                                    let key = "http://xerte.org.uk/" + item[0];
                                    let value = item[1];
                                    statement.context.extensions[key] = value;
                                }
                            });
                        }
                        SaveStatement(scoredstatement);
                    }
                }


                if (surf_mode) {
                    var statement = {
                        actor: actor,
                        verb: {
                            id: "http://lrs.surfuni.org/verb/submitted",
                            display: {
                                "en-US": "Submitted"
                            }
                        },
                        object: {
                            objectType: "Activity",
                            id: id
                        },
                        context: {
                            extensions: {
                                "http://lrs.surfuni.org/context/course": surf_course,
                                "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                "http://lrs.surfuni.org/context/label": ""
                            }
                        },
                        timestamp: new Date()
                    };
                    if (this.grouping != "") {
                        var definition = {
                            name: {
                                'en-US': this.grouping,
                            }
                        };
                        definition.name[state.language] = this.grouping;
                        statement.context.contextActivities = {
                            grouping: [{
                                id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                                definition: definition,
                                objectType: "Activity"
                            }]
                        };
                    }
                    if (this.context != "")
                    {
                        let contextitems = this.context.split(',');
                        contextitems.forEach(function (contextitem){
                            let item = contextitem.split('=');
                            if (item.length == 2) {
                                let key = "http://xerte.org.uk/" + item[0];
                                let value = item[1];
                                statement.context.extensions[key] = value;
                            }
                        });
                    }
                    SaveStatement(statement);
                    // If not a page
                    if (this.ia_nr >= 0) {
                        var statement = {
                            actor: actor,
                            verb: {
                                id: "http://adlnet.gov/expapi/verbs/scored",
                                display: {
                                    "en-US": "Scored"
                                }
                            },
                            object: {
                                objectType: "Activity",
                                id: id
                            },
                            result: {
                                duration: calcDuration(this.start, this.end),
                                completion: true,
                                success: result.success,
                                score: {
                                    scaled: result.score / 100.0,
                                    raw: result.score,
                                    min: 0.0,
                                    max: 100.0
                                },
                                duration: calcDuration(sit.start, sit.end)
                            },
                            context: {
                                extensions: {
                                    "http://lrs.surfuni.org/context/course": surf_course,
                                    "http://lrs.surfuni.org/context/recipe": surf_recipe,
                                    "http://lrs.surfuni.org/context/label": ""
                                }
                            },
                            timestamp: new Date()
                        };
                        if (this.grouping != "") {
                            var definition = {
                                name: {
                                    'en-US': this.grouping,
                                }
                            };
                            definition.name[state.language] = this.grouping;
                            statement.context.contextActivities = {
                                grouping: [{
                                    id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                                    definition: definition,
                                    objectType: "Activity"
                                }]
                            };
                        }
                        if (this.context != "")
                        {
                            let contextitems = this.context.split(',');
                            contextitems.forEach(function (contextitem){
                                let item = contextitem.split('=');
                                if (item.length == 2) {
                                    let key = "http://xerte.org.uk/" + item[0];
                                    let value = item[1];
                                    statement.context.extensions[key] = value;
                                }
                            });
                        }
                        SaveStatement(statement);
                    }
                }
            }
        }
        if (!surf_mode) {
            var statement;
            if (this.ia_nr >= 0) {
                statement = {
                    actor: actor,
                    context: {
                        extensions: {
                            "http://xerte.org.uk/learningObjectLevel" : "interactivity"
                        }
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/exited",
                        display: {
                            "en": "exited"
                        }
                    },
                    object: {
                        objectType: "Activity",
                        id: id,
                        definition: {
                            name: {
                                "en": description
                            }
                        }
                    },
                    timestamp: new Date()
                };
                statement.object.definition.name[state.language] = description;

            } else {
                statement = {
                    actor: actor,
                    context: {
                        extensions: {
                            "http://xerte.org.uk/learningObjectLevel" : "page"
                        }
                    },
                    verb: {
                        id: "http://adlnet.gov/expapi/verbs/exited",
                        display: {
                            "en": "exited"
                        }
                    },
                    object: {
                        objectType: "Activity",
                        id: id,
                        definition: {
                            name: {
                                "en": description
                            }
                        }
                    },
                    timestamp: new Date()
                };
                statement.object.definition.name[state.language] = description;
            }
            if (this.grouping != "") {
                var definition = {
                    name: {
                        'en-US': this.grouping,
                    }
                };
                definition.name[state.language] = this.grouping;
                statement.context.contextActivities = {
                        grouping: [{
                            id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
                            definition: definition,
                            objectType: "Activity"
                        }]
                    };
            }
            if (this.context != "")
            {
                let contextitems = this.context.split(',');
                contextitems.forEach(function (contextitem){
                    let item = contextitem.split('=');
                    if (item.length == 2) {
                        let key = "http://xerte.org.uk/" + item[0];
                        let value = item[1];
                        statement.context.extensions[key] = value;
                    }
                });
            }
            SaveStatement(statement);
        }
    }

    function setPageXML(pageXML){
        this.pageXML = pageXML;
    }

		function setVars(jsonObj){
				this.id = jsonObj.id;
				this.page_nr = jsonObj.page_nr;
				this.ia_nr = jsonObj.ia_nr;
				this.ia_sub_nr = jsonObj.ia_sub_nr;
				this.ia_type = jsonObj.ia_type;
				this.ia_name = jsonObj.ia_name;
				this.grouping = jsonObj.grouping;
				this.context = jsonObj.context;
				this.start = jsonObj.start;
				this.end = jsonObj.end;
				this.count = jsonObj.count;
				this.duration = jsonObj.duration;
				this.weighting = jsonObj.weighting;
				this.score = jsonObj.score;
				this.correctOptions = jsonObj.correctOptions;
				this.correctAnswers = jsonObj.correctAnswers;
				this.learnerAnswers = jsonObj.learningAnswers;
				this.learnerOptions = jsonObj.learningOptions;
				this.result = jsonObj.result;
				//this.pageXML = jsonObj.pageXML;
		}
}
