function pageState(id, page_nr, ia_type, ia_name) {

	this.exit = exit;
	this.enter = enter;
	this.getPageId = getPageId;
	this.getPageDescription = getPageDescription;
	this.setVars = setVars;
	this.setScore = setScore;
	this.setScoreJSON = setScore; // this is the same as this.setScore because it does the same in NOOP
	this.createInteraction = createInteraction;

	this.id = id;
	this.page_nr = page_nr;
	this.ia_type = ia_type;
	this.ia_name = ia_name;
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
	}

	function createInteraction(id, page_nr, ia_nr, ia_type, ia_name, grouping, context, ia_sub_nr) {
		let sit = new InteractionState(id, page_nr, ia_nr, ia_type, ia_name, ia_sub_nr);

		return sit;
	}

	function setScore(score) {
		this.score = score;
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
			let sit = new InteractionState(jsonSit.id, jsonSit.page_nr, jsonSit.ia_nr, jsonSit.ia_type, jsonSit.ia_name, jsonSit.ia_sub_nr);
			sit.setVars(jsonSit);
		}
	}
}
