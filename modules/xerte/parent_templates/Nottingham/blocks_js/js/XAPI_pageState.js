function XAPI_pageState(id, page_nr, ia_type, ia_name, grouping) {

	this.exit = exit;
	this.enter = enter;
	this.getPageId = getPageId;
	this.getPageDescription = getPageDescription;
	this.setVars = setVars;
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
		let sit = new XAPI_InteractionState(id, page_nr, ia_nr, ia_type, ia_name, grouping, context, ia_sub_nr);

		return sit;
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
