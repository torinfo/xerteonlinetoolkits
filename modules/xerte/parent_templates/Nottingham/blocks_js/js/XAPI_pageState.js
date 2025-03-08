function pageState(id, page_nr, ia_type, ia_name, grouping) {

	this.exit = exit;
	this.enter = enter;
	this.getPageId = getPageId;
	this.getPageDescription = getPageDescription;
	this.setVars = setVars;
	this.setScore = setScore;
	this.setScoreJSON = setScoreJSON;
	this.createInteraction = createInteraction;

	this.id = id;
	this.page_nr = page_nr;
	this.ia_type = ia_type;
	this.ia_name = ia_name;
	this.grouping = grouping;
	this.start = new Date();
	this.end = this.start;
	this.interactions = new Array();
	this.count = 0;
	this.duration = 0;
	this.nrinteractions = 0;
	this.weighting = 0.0;
	this.score = 0.0;
	this.correctOptions = [];
	this.correctAnswers = [];
	this.learnerAnswers = [];
	this.learnerOptions = [];
	this.duration = 0;
	this.start = new Date();
	this.end = this.start;

	function getPageId() {
		return this.id;
	}

	function getPageDescription() {
		return $("<div>").html(this.ia_name).text();
	}


	function exit() {
		this.end = new Date();
		var duration = this.end.getTime() - this.start.getTime();
		this.duration += duration
		// if (duration > 100)
		// {
		//     ;
		//     this.count++;
		//     return true;
		// }
		// else
		// {
		//     return false;
		// }
	}

	function enter() {

		this.start = new Date();
		var id = this.getPageId();
		var description = this.getPageDescription();
		state.currentpageid = id;

		if (!surf_mode) {
			if (typeof grouping != "undefined" && grouping != "" && grouping !=
				null) {
				this.grouping = grouping;
			} else {
				this.grouping = "";
			}

			var statement = {
				actor: actor,
				context: {
					extensions: {
						"http://xerte.org.uk/learningObjectLevel": "page"
					}
				},
				verb: {
					id: "http://adlnet.gov/expapi/verbs/initialized",
					display: {
						"en": "initialized"
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
				timestamp: this.Start

			};
			statement.object.definition.name[state.language] = description;
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
			SaveStatement(statement);
		}
	}

	function createInteraction(id, page_nr, ia_nr, ia_type, ia_name, grouping, context, ia_sub_nr) {
		let sit = new InteractionState(id, page_nr, ia_nr, ia_type, ia_name, grouping, context, ia_sub_nr);

		return sit;
	}

	function setScore(score) {
		this.score = score;
		let pageEnd = new Date();
		var id = this.getPageId();
		var description = this.getPageDescription();
		var statement = {
			actor: actor,
			context: {
				extensions: {
					"http://xerte.org.uk/learningObjectLevel": "page"
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
				id: id,
				definition: {
					name: {
						"en": description
					}
				}
			},
			result: {
				completion: true,
				success: score >= state.lo_passed,
				score: {
					min: 0.0,
					max: 100.0,
					raw: score,
					scaled: score / 100
				},
				duration: calcDuration(this.start, pageEnd)
			},
			timestamp: pageEnd

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
					id: baseUrl() + sitp.grouping.replace(/[\/ ]/g, "_"),
					definition: definition,
					objectType: "Activity"
				}]
			};
		}

		SaveStatement(statement);
	}

	function setScoreJSON(score, json) {
		this.score = score;
		let pageEnd = new Date();
		var id = this.getPageId();
		var description = this.getPageDescription();
		var duration = calcDuration(this.start, pageEnd);
		var endtime = pageEnd;
		if (!surf_mode) {
			var statement = {
				actor: actor,
				context: {
					extensions: {
						"http://xerte.org.uk/learningObjectLevel": "page"
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
					id: id,
					definition: {
						name: {
							"en": description
						}
					}
				},
				result: {
					completion: true,
					success: score >= state.lo_passed,
					score: {
						min: 0.0,
						max: 100.0,
						raw: score,
						scaled: score / 100
					},
					duration: duration,
					extensions: {
						"http://xerte.org.uk/xapi/JSONGraph": json
					}
				},
				timestamp: endtime
			};
			if (this.grouping != "") {
				var definition = {
					name: {
						'en-US': this.grouping,
					}
				};
				definition.name[state.language] = sitp.grouping;
				statement.context.contextActivities = {
					grouping: [{
						id: baseUrl() + this.grouping.replace(/[\/ ]/g, "_"),
						definition: definition,
						objectType: "Activity"
					}]
				};
			}

			SaveStatement(statement);
			let page = this;
			// save score for each class
			var graph = JSON.parse(json);
			$.each(graph.classnames, function (i, classname) {
				var id = page.getPageId() + "/" + classname.replace(/ /g, "_");
				var classdescription = description + "(class=" + classname + ")";
				var value = graph.classvalues[i];
				// Round to two decimals
				value = Math.round(value * 100.0) / 100.0;
				var statement = {
					actor: actor,
					verb: {
						id: "http://adlnet.gov/expapi/verbs/scored",
						display: {
							"en-US": "scored"
						}
					},
					object: {
						objectType: "Activity",
						id: id,
						definition: {
							name: {
								"en": classdescription
							}
						}
					},
					result: {
						completion: true,
						success: value >= state.lo_passed,
						score: {
							min: 0.0,
							max: 100.0,
							raw: value,
							scaled: Math.round(value) / 100.0
						},
						duration: duration
					},
					timestamp: endtime
				};
				if (page.grouping != "") {
					var definition = {
						name: {
							'en-US': page.grouping,
						}
					};
					definition.name[state.language] = page.grouping;
					statement.context.contextActivities = {
						grouping: [{
							id: baseUrl() + page.grouping.replace(/[\/ ]/g, "_"),
							definition: definition,
							objectType: "Activity"
						}]
					};
				}

				SaveStatement(statement);

			});

		}
	}

	function setVars(jsonObj) {
		this.page_nr = jsonObj.page_nr;
		this.ia_nr = jsonObj.ia_nr;
		this.ia_type = jsonObj.ia_type;
		this.ia_name = jsonObj.ia_name;
		this.start = new Date(jsonObj.start);
		this.end = new Date(jsonObj.end);
		this.count = jsonObj.count;
		this.duration = jsonObj.duration;
		this.nrinteractions = jsonObj.nrinteractions;
		this.weighting = jsonObj.weighting;
		this.score = jsonObj.score;
		this.grouping = jsonObj.grouping;
		this.context = jsonObj.context;
		this.correctOptions = jsonObj.correctOptions;
		this.correctAnswers = jsonObj.correctAnswers;
		this.learnerOptions = jsonObj.learnerOptions;
		this.learnerAnswers = jsonObj.learnerAnswers;
		this.id = jsonObj.id;
		for (let i = 0; i < jsonObj.interactions.length; i++) {
			let jsonSit = jsonObj.interactions[i];
			let sit = new XAPI_InteractionState(jsonSit.id, jsonSit.page_nr, jsonSit.ia_nr, jsonSit.ia_type, jsonSit.ia_name, jsonSit.grouping, jsonSit.context, jsonSit.ia_sub_nr);
			sit.setVars(jsonSit);
		}
	}
}
