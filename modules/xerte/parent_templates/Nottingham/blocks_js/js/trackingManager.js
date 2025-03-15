function TrackingManager(tracking_type) {

	this.pageStates = new Array();
	this.initialised = false;
	this.trackingmode = "full";
	this.mode = "normal";
	this.scoremode = 'first';
	this.nrpages = 0;
	this.toCompletePages = new Array();
	this.completedPages = new Array();
	this.start = new Date();
	this.lo_completed = 0;
	this.lo_passed = -1;
	this.page_timeout = 0;
	this.forcetrackingmode = false;
	this.debug = false;
	this.tracking_type = tracking_type;

	this.initialise = initialise;
	this.terminate = terminate;
	this.canResume = canResume;
	this.doResume = doResume;
	this.setVars = setVars;
	this.makeId = makeId;
	this.find = find;
	this.findCreatePageState = findCreatePageState;
	this.enterPage = enterPage;
	this.initialise = initialise;
	this.pageCompleted = pageCompleted;
	this.getCompletionStatus = getCompletionStatus;
	this.getSuccessStatus = getSuccessStatus;
	this.getdScaledScore = getdScaledScore;
	this.getdRawScore = getdRawScore;
	this.getdMinScore = getdMinScore;
	this.getdMaxScore = getdMaxScore;
	this.getScaledScore = getScaledScore;
	this.getRawScore = getRawScore;
	this.getMinScore = getMinScore;
	this.getMaxScore = getMaxScore;
	this.setPageType = setPageType;
	this.setInteractionWeighting = setInteractionWeighting;
	this.setPageScore = setPageScore;
	this.setPageScoreJSON = setPageScoreJSON;
	this.setInteractionPageXML = setInteractionPageXML;
	this.getInteractionPageXML = getInteractionPageXML;
	this.enterInteraction = enterInteraction;
	this.exitInteraction = exitInteraction;
	this.exitPage = exitPage;
	this.findPage = findPage;
	this.findInteraction = findInteraction;
	this.findAllInteractions = findAllInteractions;
	this.findAllSubInteractions = findAllSubInteractions;
	this.verifyResult = verifyResult;
	this.verifyEnterInteractionParameters = verifyEnterInteractionParameters;
	this.verifyExitInteractionParameters = verifyExitInteractionParameters;
	this.setLeavePage = setLeavePage;
	this.setInteractionModelState = setInteractionModelState;
	this.getInteractionModelState = getInteractionModelState;
	this.video = video;

	this.resumedSessions = new Array();

	function initialise(category) {
			if(this.tracking_type == "xapi") {
					initialise_xapi(category);
			}
	}

	function terminate() {
			if(this.tracking_type == "xapi") {
					terminate_xapi();
			}
	}

	function canResume() {
		if(this.tracking_type == "xapi") {
				if (actor.objectType === 'Agent') {
						// Try to fetch previous exit statement
						var q = {};
						q['agent'] = JSON.stringify(actor);
						q['verb'] = ADL.verbs.exited.id;
						q['activity'] = baseUrl() + state.templateId;
						var suspend_str = "";
						var result = getStatements(q, true);
						if (result.length > 0
								&& result[0].result != undefined
								&& result[0].result.extensions != undefined
								&& result[0].result.extensions["http://xerte.org.uk/xapi/trackingstate"] != undefined) {
								suspend_str = result[0].result.extensions["http://xerte.org.uk/xapi/trackingstate"];
						}
						if (suspend_str.length > 0) {
								var tmp = new InteractionState();
								tmp.setVars(suspend_str, false);
								if (tmp.getCompletionStatus() != 'completed') {
										return { canResume: true, date: result[0].timestamp };
								}
								else {
										return { canResume: false, date: "" };
								}
						}
						else {
								return { canResume: false, date: "" };
						}
				}
				else {
						return { canResume: false, date: "" };
				}
		}else {
				console.log("\"canResume\" function is only supported for xapi. current tracking type: ", this.tracking_type);
				return { canResume: false,  date: "" };
		}
	}

	function doResume() {
		if(this.tracking_type == "xapi") {
				if (this.resume) {
					if (actor.objectType === 'Agent') {
							// Try to fetch previous exit statement
							var q = {};
							q['agent'] = JSON.stringify(actor);
							q['verb'] = ADL.verbs.exited.id;
							q['activity'] = baseUrl() + state.templateId;
							var suspend_str = "";
							var result = getStatements(q, true);
							if (result.length > 0
									&& result[0].result != undefined
									&& result[0].result.extensions != undefined
									&& result[0].result.extensions["http://xerte.org.uk/xapi/trackingstate"] != undefined) {
									var suspend_str = result[0].result.extensions["http://xerte.org.uk/xapi/trackingstate"];
							}
							if (suspend_str.length > 0) {
									var tmp = new TrackingManager();
									tmp.setVars(suspend_str, false);
									if (tmp.getCompletionStatus() != 'completed') {
											this.setVars(suspend_str);
									}
							}
					}
				}
		} else {
			console.log("\"doResume\" function is only supported for xapi. current tracking type: ", this.tracking_type);
		}
	}

	function setVars(jsonStr, restoreXerteState) {
		if(this.tracking_type == "xapi") {
				var restore = true;
				if (restoreXerteState != undefined) {
						restore = restoreXerteState;
				}
				if (jsonStr.length > 0) {
						var jsonObj = JSON.parse(jsonStr);
						// Do NOT touch scormmode, don't touch start and don't touch finished
						this.currentid = jsonObj.currentid;
						this.currentpageid = jsonObj.currentpageid;
						this.trackingmode = jsonObj.trackingmode;
						this.forcetrackingmode = jsonObj.forcetrackingmode;
						this.scoremode = jsonObj.scoremode;
						this.nrpages = jsonObj.nrpages;
						this.toCompletePages = jsonObj.toCompletePages;
						this.completedPages = jsonObj.completedPages;
						//            this.start = new Date(jsonObj.start);
						this.lo_completed = jsonObj.lo_completed;
						this.lo_type = jsonObj.lo_type;
						this.lo_passed = jsonObj.lo_passed;
						this.page_timeout = jsonObj.page_timeout;
						this.templateId = jsonObj.templateId;
						this.templateName = jsonObj.templateName;
						this.debug = jsonObj.debug;
						// this.sessionId = "";
						this.category = jsonObj.category;
						// this.language = "en";
						// this.resume = false;
						// this.finished = jsonObj.finished;
						//this.pageStates = jsonObj.pageStates;
						this.pageStates = new Array();
						for (let i = 0; i < jsonObj.pageStates.length; i++) {
								let jsonPage = jsonObj.pageStates[i];
								let page = new pageState(jsonPage.id, jsonPage.page_nr, jsonPage.ia_type, jsonPage.ia_name);
								page.setVars(jsonPage);
								this.pageStates.push(page);
						}
						/*
							this.interactions = new Array();
							var i=0;
							for (i=0; i<jsonObj.interactions.length; i++)
							{
							var jsonSit = jsonObj.interactions[i];
							var sit = new XApiInteractionTracking(jsonSit.page_nr, jsonSit.ia_nr, jsonSit.ia_type, jsonSit.ia_name);
							sit.setVars(jsonSit, restoreXerteState);
							this.interactions.push(sit);
							}
						*/
						if (restore) {
								if (typeof jsonObj.pageHistory != "undefined") {
										x_pageHistory = jsonObj.pageHistory;
								}
								if (typeof jsonObj.pagesViewed != "undefined") {
										x_restorePagesViewed(jsonObj.pagesViewed);
								}
								if (typeof jsonObj.resumedSessions != "undefined") {
										this.resumedSessions = jsonObj.resumedSessions;
								}
								if (typeof jsonObj.pageDicts != "undefined") {
										x_pageDicts = jsonObj.pageDicts;
								}
								this.resumedSessions.push(jsonObj.sessionId);
						}
				}
		} else {
			console.log("\"setVars\" function is only supported for xapi. current tracking type: ", this.tracking_type);
		}
	}

	function makeId(page_nr, ia_nr, ia_type, ia_name) {

		var tmpid = 'urn:x-xerte:p-' + (page_nr + 1);
		if (ia_nr >= 0) {
			tmpid += ':' + (ia_nr + 1);
			if (ia_type.length > 0) {
				tmpid += '-' + ia_type;
			}
		}

		if (ia_name) {
			// ia_nam can be HTML, just extract text from it
			var div = $("<div>").html(ia_name);
			var strippedName = div.text();
			tmpid += ':' + encodeURIComponent(strippedName.replace(/[^a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
			// Truncate to max 255 chars, this should be 4000
			tmpid = tmpid.substr(0, 255);
		}
		return tmpid;
	}

	function find(id) {
		for (let i = 0; i < this.pageStates.length; i++) {
			if (this.pageStates[i].id == id)
				return this.pageStates[i];
		}

		return null;

	}

	function findCreatePageState(page_nr, ia_type, ia_name, grouping) {
		debugger;
		var tmpid = makeId(page_nr, -1, ia_type, ia_name);

		for (var i = 0; i < this.pageStates.length; i++) {
			if (this.pageStates[i].id === tmpid)
				return this.pageStates[i];
		}
		// Not found
		let sit = new pageState(tmpid, page_nr, ia_type, ia_name);
		if (ia_type !== "page" && ia_type !== "result") {
			this.lo_type = "interactive";
			if (this.lo_passed === -1) {
				this.lo_passed = 55;
			}
		}

		this.pageStates.push(sit);
		return sit;
	}

	function enterPage(page_nr, ia_type, ia_name, grouping) {
		let sitp = this.findCreatePageState(page_nr, ia_type, ia_name, grouping);
		sitp.enter();
		return sitp;
	}

	function getCompletionStatus() {
		var completed = true;
		for (var i = 0; i < this.completedPages.length; i++) {
			if (this.completedPages[i] === false) {
				completed = false;
				break;
			}
			//if( i == this.completedPages.length-1 && this.completedPages[i] == true)
			//{
			//completed = true;
			//
		}

		if (completed) {
			return "completed";

		}
		else if (!completed) {
			return 'incomplete';
		}
		else {
			return "unknown"
		}
	}

	function getSuccessStatus() {
		if (this.lo_type !== "pages only") {
			if (this.getScaledScore() > (this.lo_passed / 100)) {
				return "passed";
			}
			else {
				return "failed";
			}
		}
		else {
			if (getCompletionStatus() === 'completed') {
				return "passed";
			}
			else {
				return "unknown";
			}
		}
	}

	function getdScaledScore() {
		return this.getdRawScore() / (this.getdMaxScore() - this.getdMinScore());
	}

	function getScaledScore() {
		return Math.round(this.getdScaledScore() * 100) / 100 + "";
	}

	function getdRawScore() {
		if (this.lo_type === "pages only") {
			if (getCompletionStatus() === 'completed')
				return 100;
			else
				return 0;
		}
		else {
			var score = [];
			var weight = [];
			var totalweight = 0.0;
			// Walk passed the pages
			var i = 0;
			for (i = 0; i < this.nrpages; i++) {
				var sit = this.findPage(i);
				if (sit != null && sit.weighting > 0) {
					totalweight += sit.weighting;
					score.push(sit.score);
					weight.push(sit.weighting);
				}
			}
			var totalscore = 0.0;
			if (totalweight > 0.0) {
				for (i = 0; i < score.length; i++) {
					totalscore += (score[i] * weight[i]);
				}
				totalscore = totalscore / totalweight;
			}
			else {
				// If the weight is 0.0, set the score to 100
				totalscore = 100.0;
			}
			return totalscore;
		}
	}

	function getRawScore() {
		return Math.round(this.getdRawScore() * 100) / 100 + "";
	}

	function getdMinScore() {
		if (this.lo_type === "pages only") {
			return 0.0;
		}
		else {
			return 0.0;
		}
	}

	function getMinScore() {
		return this.getdMinScore() + "";
	}

	function getdMaxScore() {
		if (this.lo_type === "pages only") {
			return 100.0;
		}
		else {
			return 100.0;
		}
	}

	function getMaxScore() {
		return this.getdMaxScore() + "";
	}


	function pageCompleted(sit) {
		var sits = this.findAllInteractions(sit.page_nr);
		if (sits.length !== sit.nrinteractions) {
			return false;
		}
		var done = true;
		for (var i = 0; i < sits.length; i++) {
			var s = sits[i].result.success;
			if (!s) {
				done = false;
			}
		}
		if (sit.ia_type === "page" && sit.duration < this.page_timeout) {
			return false;
		}
		return done;
	}

	function enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, grouping, context, ia_sub_nr = 0) {

		var tempid = makeId(page_nr, ia_nr, ia_type, ia_name);
		var page = this.findPage(page_nr);

		let interaction = page.createInteraction(tempid, page_nr, ia_nr, ia_type, ia_name, grouping, context, ia_sub_nr);
		this.verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback);
		interaction.enterInteraction(correctanswer, correctoptions);
		page.nrInteraction += 1;
		page.interactions.push(interaction);
	}

	function exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback, ia_sub_nr = 0) {
		var sit = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
		if (sit != null) {
			if (ia_nr !== -1) {
				this.verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback);
				sit.exitInteraction(result, learneranswer, learneroptions, feedback);
			}
			sit.exit();
		}
	}

	function exitPage(page_nr, ia_sub_nr = 0) {
		;
		let temp = false;
		let i = 0;


		var page = this.findPage(page_nr);
		var tempscore = 0;
		for (i = 0; i < page.interactions.length; i++) {
			if (page.interactions[i].result === undefined) {
				var result = {
					success: false,
					score: 0.0
				};
				page.interactions[i].result = result;
			}
			tempscore += page.interactions[i].result.score;
		}

		tempscore /= page.interactions.length;
		page.score = tempscore;
		for (i = 0; i < this.toCompletePages.length; i++) {
			var currentPageNr = this.toCompletePages[i];
			if (currentPageNr === page_nr) {
				temp = true;
				break;
			}
		}
		if (temp) {
			if (!this.completedPages[i]) {
				var sit = this.findPage(page_nr);
				if (sit != null) {
					// Skip results page completely
					if (sit.ia_type !== "result") {
						this.completedPages[i] = this.pageCompleted(sit);
						sit.exit();
					}
				}
			}
		}

		for (i = 0; i < page.interactions.length; i++) {
			var interaction = page.interactions[i];
			if (interaction.leavePage != null) {
				var blockid = "block" + (interaction.ia_nr + 1);
				interaction.leavePage(blockid);
			}
		}
	}

	function setPageType(page_nr, page_type, nrinteractions, weighting) {
		var sit = this.findPage(page_nr);
		if (sit != null) {
			sit.ia_type = page_type;

			if (sit.nrinteractions == null) {
				sit.nrinteractions = nrinteractions;
			}
			sit.weighting = parseFloat(weighting);
		}
	}
	// TODO: gebruik beide: setpagetype en interaction? het gaat nu mis omdat ia_type van de page niet t zelfde is als interaction ia_type.
	// wsl moet op multinav altijd een numeric type
	function setInteractionWeighting(page_nr, ia_nr, weighting, sub_ia_nr = 0) {
		var sit = this.findPage(page_nr);
		if (sit != null) {
			sit.nrinteractions = sit.nrinteractions + 1;
			sit.weighting += parseFloat(weighting);
		}

		var int = this.findInteraction(page_nr, ia_nr, sub_ia_nr);
		if (int != null) {
			int.weighting = parseFloat(weighting);
		}
	}

	function setPageScore(page_nr) {
		var page = this.findPage(page_nr);
		var tempscore = 0;
		var maxweight = 0;
		for (i = 0; i < page.interactions.length; i++) {
			if (page.interactions[i].result != null || page.interactions[i].result != undefined) {
				tempscore += page.interactions[i].result.score * page.interactions[i].weighting;
			}
			maxweight += page.interactions[i].weighting;
		}
		
		tempscore /= maxweight;
		
		if(Number.isNaN(tempscore)){
				tempscore = 0;
				console.error("tempscore was NaN");
		}

		if (page != null && (this.scoremode !== 'first' || page.count < 1)) {
			page.setScore(tempscore);
			page.count++;
		}
	}

	function setPageScoreJSON(page_nr, jsonGraph) {
		var page = this.findPage(page_nr);
		var tempscore = 0;
		var maxweight = 0;
		for (i = 0; i < page.interactions.length; i++) {
			if (page.interactions[i].result != null || page.interactions[i].result != undefined) {
				tempscore += page.interactions[i].result.score * page.interactions[i].weighting;
			}
			maxweight += page.interactions[i].weighting;
		}
		if (maxweight == 0) {
			tempscore /= maxweight;
		} else {
			tempscore = 0;
		}

		if (page != null && (this.scoremode !== 'first' || page.count < 1)) {
			page.setScoreJSON(tempscore, jsonGraph);
			page.count++;
		}
	}

	function setInteractionPageXML(page_nr, ia_nr, x_currentPage, ia_sub_nr = 0) {
		var interactionState = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
		if (interactionState == null) {
			return;
		}
		interactionState.setPageXML(x_currentPage);
	}

	function getInteractionPageXML(page_nr, ia_nr, ia_sub_nr = 0) {
		var interactionState = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
		if (interactionState == null) {
			return;
		}
		return interactionState.pageXML;
	}

	function findPage(page_nr) {
		for (let i = 0; i < this.pageStates.length; i++) {
			if (this.pageStates[i].page_nr === page_nr)
				return this.pageStates[i];
		}
		return null;
	}

	function findInteraction(page_nr, ia_nr, ia_sub_nr = 0, ignoreSubId = false) {
		;
		var page = this.findPage(page_nr)
		if (page == null) {
			return null;
		}
		var i = 0;
		for (i = 0; i < page.interactions.length; i++) {
			if (page.interactions[i].page_nr === page_nr && page.interactions[i].ia_nr === ia_nr) {
				if (!ignoreSubId) {
					if (page.interactions[i].ia_sub_nr === ia_sub_nr) {
						return page.interactions[i];
					}
				} else {
					return page.interactions[i];
				}
			}

		}
		return null;
	}

	function findAllInteractions(page_nr) {
		for (var i = 0; i < this.pageStates.length; i++) {
			if (this.pageStates[i].page_nr == page_nr) {
				return this.pageStates[i].interactions;
			}
		}
	}

	function findAllSubInteractions(page_nr, ia_nr) {
		let interactions = [];
		for (var i = 0; i < this.pageStates.length; i++) {
			if (this.pageStates[i].page_nr == page_nr) {
				for (var j = 0; j < this.pageStates[i].interactions.length; j++) {
					if (this.pageStates[i].interactions[j].ia_nr === ia_nr) {
						interactions.push(this.pageStates[i].interactions[j]);
					}
				}
			}
		}
		return interactions;
	}

	/**
	 * Check whether result has the valid structure and contents
	 * @param result
	 *
	 * result should be an object with a boolean field success and a float field score
	 */
	function verifyResult(result) {
		if (this.debug) {
			if (typeof result != 'object' || typeof result['success'] != 'boolean' || typeof result['score'] != 'number' || result['score'] < 0.0 || result['score'] > 100.0) {
				console.log("Invalid result structure: " + result);
			}
		}
	}

	/**
	 *
	 * @param ia_type
	 * @param ia_name
	 * @param correctoptions
	 * @param correctanswer
	 * @param feedback
	 *
	 *  correctoptions and correctanswer depends on the sit_iatype
	 *
	 *  1. matching
	 *      correctoptions: array of objects with source and target strings
	 *              [
	 *              {
	 *                  source: 'lettuce',
	 *                  target: 'vegetable'
	 *              },
	 *              {
	 *                  source: 'apple',
	 *                  target: 'fruit'
	 *              },
	 *              {
	 *                  source: 'pear',
	 *                  target: 'vegetable'
	 *              }
	 *              ]
	 *      correctanswer: array of matching representation
	 *              [
	 *              'lettuce --> vegetable',
	 *              'apple --> fruit',
	 *              'pear --> fruit'
	 *              ]
	 *
	 *   2. multiplechoice
	 *       correctoptions: array of objects containg all possible options numbered "1" to max nr of options.
	 *              [
	 *              {
	 *                  id: '1',
	 *                  answer: 'London',
	 *                  result: true
	 *              },
	 *              {
	 *                  id: '2',
	 *                  answer: 'Paris',
	 *                  result: false
	 *              },
	 *              {
	 *                  id: '3',
	 *                  answer: 'Amsterdam',
	 *                  result: false
	 *              }
	 *              ]
	 *       correctanswers contains an array with the answer string of the above structure
	 *              [
	 *                  'London',
	 *                  'Paris',
	 *                  'Amsterdam'
	 *              ]
	 *
	 *    3. numeric
	 *        correctoptions is ignored
	 *        correctanswers is ignored
	 *
	 *    4. text, fill-in
	 *        correctoptions contains an array of strings that are correct. With type text, array is assumed to be empty
	 *        correctanswers is ignored
	 *
	 *    5. page
	 *         correctoptions is ignored
	 *         correctanswers is ignored
	 *
	 *    6. default
	 *          flag warning
	 *
	 */
	function verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback) {
		if (this.debug) {
			switch (ia_type) {
				case 'match':
					/*
					*  1. matching
					*      correctoptions: array of objects with source and target strings
					*              [
					*              {
					*                  source: 'lettuce',
					*                  target: 'vegetable'
					*              },
					*              {
					*                  source: 'apple',
					*                  target: 'fruit'
					*              },
					*              {
					*                  source: 'pear',
					*                  target: 'fruit'
					*              }
					*              ]
					*      learneranswer: array of matching representation
					*              [
					*              'lettuce --> vegetable',
					*              'apple --> fruit',
					*              'pear --> fruit'
					*              ]
					*/
					if (typeof correctoptions == 'object') {
						for (var i = 0; i < correctoptions.length; i++) {
							var item = correctoptions[i];
							if (typeof item != 'object' || typeof item['source'] != 'string' || typeof item['target'] != 'string') {
								console.log("Invalid structure for correctoptions for type match: " + correctoptions);
							}
						}
					}
					else {
						console.log("Invalid structure for correctoptions for type match: " + correctoptions);
					}
					if (typeof correctanswer == 'object') {
						for (var i = 0; i < correctanswer.length; i++) {
							var item = correctanswer[i];
							if (typeof item != 'string') {
								console.log("Invalid structure for correctanswer for type match: " + correctanswer);
							}
						}
					}
					else {
						console.log("Invalid structure for correctanswer for type match: " + correctanswer);
					}
					break;
				case 'multiplechoice':
					/*
					 * 2. multiplechoice
					 *       correctoptions: array of objects containg all possible options numbered "1" to max nr of options.
					 *              [
					 *              {
					 *                  id: '1',
					 *                  answer: 'London',
					 *                  result: true
					 *              },
					 *              {
					 *                  id: '2',
					 *                  answer: 'Paris',
					 *                  result: false
					 *              },
					 *              {
					 *                  id: '3',
					 *                  answer: 'Amsterdam',
					 *                  result: false
					 *              }
					 *              ]
					 *       correctanswers contains an array with the answer string of the above structure
					 *              [
					 *                  'London',
					 *                  'Paris',
					 *                  'Amsterdam'
					 *              ]
					 */
					if (typeof correctoptions == 'object') {
						for (var i = 0; i < correctoptions.length; i++) {
							var item = correctoptions[i];
							if (typeof item != 'object' || typeof item['id'] != 'string' || typeof item['answer'] != 'string' || typeof item['result'] != 'boolean') {
								console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
							}
						}
					}
					else {
						console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
					}
					if (typeof correctanswer == 'object') {
						for (var i = 0; i < correctanswer.length; i++) {
							var item = correctanswer[i];
							if (typeof item != 'string') {
								console.log("Invalid structure for correctanswer for type multiplechoice: " + correctanswer);
							}
						}
					}
					else {
						console.log("Invalid structure for correctanswer for type multiplechoice: " + correctanswer);
					}
					break;
				case 'numeric':
					/**
					 * 3. numeric
					 *        correctoptions is ignored
					 *        correctanswers is ignored
					 */
					// Nothing to check
					break;
				case 'text':
				case 'fill-in':
					/**
					 * 4. text, fill-in
					 *        correctoptions contains an array of strings that are correct. With type text, array is assumed to be empty
					 *        correctanswers is ignored
					 *
					 */
					if (typeof correctoptions == 'object') {
						for (var i = 0; i < correctoptions.length; i++) {
							var item = correctoptions[i];
							if (typeof item != 'string') {
								console.log("Invalid structure for correctoptions for type " + ia_type + ": " + correctoptions);
							}
						}
					}
					else {
						console.log("Invalid structure for correctoptions for type " + ia_type + ": " + correctoptions);
					}
					break;
				case 'page':
				case 'result':
					/**
					 * 5. page
					 *         correctoptions is ignored
					 *         correctanswers is ignored
					 */
					// Nothing to check
					break;

				default:
					console.log("Invalid ia_type " + ia_type + " entering interaction.");
					break;
			}
		}
	}


	/**
	 * Routine to verify the structures of result, learneroptions and learneranswer given sit.ia_type
	 * @param sit
	 * @param result
	 * @param learneroptions
	 * @param learneranswer
	 * @param feedback
	 *
	 *  result should be an object
	 *          {
	 *              success: true,
	 *              score: 100.0
	 *          }
	 *
	 *  learneroptions and learneranswer depends on the sit_iatype
	 *
	 *  1. matching
	 *      learneroptions: array of objects with source and target strings
	 *              [
	 *              {
	 *                  source: 'lettuce',
	 *                  target: 'vegetable'
	 *              },
	 *              {
	 *                  source: 'apple',
	 *                  target: 'fruit'
	 *              },
	 *              {
	 *                  source: 'pear',
	 *                  target: 'vegetable'
	 *              }
	 *              ]
	 *      learneranswer: array of matching representation
	 *              [
	 *              'lettuce --> vegetable',
	 *              'apple --> fruit',
	 *              'pear --> vegetable'
	 *              ]
	 *
	 *   2. multiplechoice
	 *       learneroptions: array of objects indicating selected options numbered "1" to max nr of options. Therer are only more than one entries, if there are multiple answers allowed
	 *              [
	 *              {
	 *                  id: '2',
	 *                  answer: 'Paris'
	 *                  result: false
	 *              }
	 *              ]
	 *       learneranswers contains an array with the answer string of the above structure
	 *              [
	 *                  'Paris'
	 *              ]
	 *
	 *    3. numeric
	 *        learneroptions: ignored
	 *        learneranswer contains a number between 0 and 100
	 *
	 *    4. text, fill-in
	 *        learneroptions is ignored
	 *        learneranswers contains the selected/entered text
	 *
	 *    5. page
	 *         learneroptions is ignored
	 *         learneranswers is ignored
	 *
	 *    6. default
	 *          flag warning
	 *
	 */
	function verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback) {
		if (this.debug) {
			verifyResult(result);
			switch (sit.ia_type) {
				case 'match':
					/*
					*  1. matching
					*      learneroptions: array of objects with source and target strings
					*              [
					*              {
					*                  source: 'lettuce',
					*                  target: 'vegetable'
					*              },
					*              {
					*                  source: 'apple',
					*                  target: 'fruit'
					*              },
					*              {
					*                  source: 'pear',
					*                  target: 'vegetable'
					*              }
					*              ]
					*      learneranswer: array of matching representation
					*              [
					*              'lettuce --> vegetable',
					*              'apple --> fruit',
					*              'pear --> vegetable'
					*              ]
					*/
					if (typeof learneroptions == 'object') {
						for (var i = 0; i < learneroptions.length; i++) {
							var item = learneroptions[i];
							if (typeof item != 'object' || typeof item['source'] != 'string' || typeof item['target'] != 'string') {
								console.log("Invalid structure for learneroptions for type match: " + learneroptions);
							}
						}
					}
					else {
						console.log("Invalid structure for learneroptions for type match: " + learneroptions);
					}
					if (typeof learneranswer == 'object') {
						for (var i = 0; i < learneranswer.length; i++) {
							var item = learneranswer[i];
							if (typeof item != 'string') {
								console.log("Invalid structure for learneranswer for type match: " + learneranswer);
							}
						}
					}
					else {
						console.log("Invalid structure for learneranswers for type match: " + learneranswer);
					}
					break;
				case 'multiplechoice':
					/*
					 * 2. multiplechoice
					 *       learneroptions: array of objects indicating selected options numbered "1" to max nr of options. Therer are only more than one entries, if there are multiple answers allowed
					 *              [
					 *              {
					 *                  id: '2',
					 *                  answer: 'Paris'
					 *                  result: false
					 *              }
					 *              ]
					 *       learneranswers contains an array with the answer string of the above structure
					 *              [
					 *                  'Paris'
					 *              ]
					 */
					if (typeof learneroptions == 'object') {
						for (var i = 0; i < learneroptions.length; i++) {
							var item = learneroptions[i];
							if (typeof item != 'object' || typeof item['id'] != 'string' || typeof item['answer'] != 'string' || typeof item['result'] != 'boolean') {
								console.log("Invalid structure for learneroptions for type multiplechoice: " + learneroptions);
							}
						}
					}
					else {
						console.log("Invalid structure for learneroptions for type multiplechoice: " + learneroptions);
					}
					if (typeof learneranswer == 'object') {
						for (var i = 0; i < learneranswer.length; i++) {
							var item = learneranswer[i];
							if (typeof item != 'string') {
								console.log("Invalid structure for learneranswer for type multiplechoice: " + learneranswer);
							}
						}
					}
					else {
						console.log("Invalid structure for learneranswers for type multiplechoice: " + learneranswer);
					}
					break;
				case 'numeric':
					/**
					 * 3. numeric
					 *        learneroptions: ignored
					 *        learneranswer contains a number between 0 and 100
					 */
					if (typeof learneranswer != 'number') {
						console.log("Invalid structure for learneranswers for type numeric: " + learneranswer);
					}
					break;
				case 'text':
				case 'fill-in':
					/**
					 * 4. text, fill-in
					 *        learneroptions is ignored
					 *        learneranswers contains the selected/entered text
					 *
					 */
					if (typeof learneranswer != 'string') {
						console.log("Invalid structure for learneranswers for type fill-in: " + learneranswer);
					}
				case 'page':
				case 'result':
					/**
					 * 5. page
					 *         learneroptions is ignored
					 *         learneranswers is ignored
					 */
					// Nothing to check
					break;
				default:
					console.log("Invalid ia_type " + sit.ia_type + " exiting interaction.");
					break;
			}
		}
	}

	function setInteractionModelState(page_nr, ia_nr, modelState, ia_sub_nr, toAll) {
		if (toAll) {
			for (let i = 0; i < this.pageStates.length; i++) {
				if (this.pageStates[i].page_nr === page_nr) {
					for (let j = 0; j < this.pageStates[i].interactions.length; j++) {
						if (this.pageStates[i].interactions[j].ia_nr === ia_nr) {
							this.pageStates[i].interactions[j].modelState = JSON.parse(JSON.stringify(modelState));
						}
					}
				}
			}

		} else {
			let interaction = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
			if (interaction != null) {
				interaction.modelState = JSON.parse(JSON.stringify(modelState));
			}
		}
	}


	function getInteractionModelState(page_nr, ia_nr, ia_sub_nr, ignoreSubId) {
		var interaction = this.findInteraction(page_nr, ia_nr, ia_sub_nr, ignoreSubId);
		if (interaction != null) {
			return interaction.modelState;
		} else {
			return null;
		}
	}

	function setLeavePage(page_nr, ia_nr, ia_sub_nr, leavepage) {
		var interaction = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
		if (interaction != null) {
			interaction.leavePage = leavepage;
		}
	}

	function video(page_nr, name, verb, videostate, set_grouping) {
			if(this.tracking_type == "xapi") {
					video_xapi(page_nr, name, verb, videostate, set_grouping);
			}
	}
}

function initialise_xapi(category){
	// Tom Reijnders 2022-10-06: Trying to handle tracking of standalone pages where the page is a page of the same LO
	// Specifically when the standalone page is shown in a lightbox
	// We make use of the fact that in javascript, assigning a variable is done through reference, so we actually
	// point the state variable (of the standalone page) to the parent state variable (of the main LO)
	if (parent != self && parent.x_TemplateId != undefined && parent.x_TemplateId == x_TemplateId && parent.state != undefined) {
		state = parent.state;
		actor = parent.actor;
		try {
			/*
			lrsInstance = new TinCan.LRS(
				{
					endpoint: lrsEndpoint,
					username: lrsUsername,
					password: lrsPassword,
					allowFail: false,
					version: "1.0.2"
				}
			);
			*/

			// // Check if aggretate is set for the lrsEndpoint, than assume this is learning locker and change normal API accordingly and save aggregate for XTGetStatements
			// if (lrsEndpoint.indexOf("api/statements/aggregate/") >= 0)
			// {
			//     state.aggregate = true;
			//     state.lrsAggregateEndpoint = lrsEndpont;
			//     apos = lrsEndpoint.indexOf("api/statements/aggregate");
			//     lrsEndpoint = lrsEndpoint.substr(0, lrsEndpoint.Length - apos) + 'data/xAPI';
			// }
			// else {
			//     state.aggregate = false;
			// }
			var conf = {
				"endpoint": lrsEndpoint + '/',
				"user": lrsUsername,
				"password": lrsPassword,
				"strictCallbacks": true
			};
			ADL.XAPIWrapper.log.debug = true;
			ADL.XAPIWrapper.changeConfig(conf);

		} catch (ex) {
			//alert("Failed LRS setup. Error: " + ex);
			state.mode = "none";
		}
	} else {
		state.sessionId = new Date().getTime() + "" + Math.round(Math.random() * 10000000);
		// Initialise actor object
		if (typeof studentidmode != "undefined" && typeof studentidmode == 'string') {
			studentidmode = parseInt(studentidmode);
		}
		if (typeof studentidmode == "undefined" || (studentidmode <= 0 && studentidmode > 3)) {
			// set actor to global group
			actor = {
				objectType: "Group",
				account: {
					name: "global",
					homePage: baseUrl() + state.templateId
				}
			};
		} else {
			if (typeof username == "undefined" || username == "") {
				userEMail = "mailto:email@test.com"
			} else {
				userEMail = "mailto:" + username;
			}
			if (typeof fullusername == 'undefined' || fullusername == "")
				fullusername = "Unknown";
			if (typeof groupname != "undefined" && groupname != "") {
				state.group = {
					objectType: "Group",
					account: {
						name: groupname,
						homePage: baseUrl()
					}
				};
			} else {
				state.group = "";
			}
			if (typeof coursename != "undefined" && coursename != "") {
				state.course = {
					id: baseUrl() + 'course/' + coursename
				};
				state.coursename = coursename;
			} else if (typeof x_params['course'] != "undefined" && x_params['course'] != "") {
				state.course = {
					id: baseUrl() + 'course/' + x_params['course']
				};
				state.coursename = x_params['course'];
			} else {
				state.course = "";
				state.coursename = "";
			}
			if (typeof modulename != "undefined" && modulename != "") {
				state.module = {
					id: baseUrl() + 'module/' + modulename
				};
				state.modulename = modulename;
			} else if (typeof x_params['module'] != "undefined" && x_params['module'] != "") {
				state.module = {
					id: baseUrl() + 'module/' + x_params['module']
				};
				state.modulename = x_params['module'];
			} else {
				state.module = "";
				state.modulename = "";
			}
			if (typeof lti_context_id != "undefined" && lti_context_id != "") {
				state.lti_context_id = lti_context_id;
			} else if (typeof x_params['lti_context_id'] != "undefined" && x_params['lti_context_id'] != "") {
				state.lti_context_id = x_params['lti_context_id'];
			} else {
				state.lti_context_id = "";
			}
			if (typeof lti_context_name != "undefined" && lti_context_name != "") {
				state.lti_context_name = lti_context_name;
			} else if (typeof x_params['lti_context_name'] != "undefined" && x_params['lti_context_name'] != "") {
				state.lti_context_name = x_params['lti_context_name'];
			} else {
				state.lti_context_name = "";
			}
			switch (studentidmode) {
				case 0: //mbox
					actor = {
						objectType: "Agent",
						mbox: userEMail
					};
					break;
				case 1:
					actor = {
						objectType: "Agent",
						mbox_sha1sum: mboxsha1
					};
					break;
				case 2:
					actor = {
						objectType: "Agent",
						mbox: userEMail,
						name: fullusername
					};
					break;
				case 3:
					if (groupname != undefined && groupname != "") {
						actor = {
							objectType: "Group",
							account: {
								name: groupname,
								homePage: baseUrl() + state.templateId
							}
						};
					} else {
						actor = {
							objectType: "Group",
							account: {
								name: "global",
								homePage: baseUrl() + state.templateId
							}
						};
					}

			}
		}
		if (typeof x_urlParams.embedded_from != "undefined") {
			state.embedded = true;
			state.embedded_from = decodeURIComponent(x_urlParams.embedded_from);
			state.embedded_fromTitle = decodeURIComponent(x_urlParams.embedded_fromTitle);
			state.embedded_fromSessionId = decodeURIComponent(x_urlParams.embedded_fromSessionId);
			if (state.embedded_fromSessionId != undefined && state.embedded_fromSessionId != "") {
				state.sessionId = state.embedded_fromSessionId;
			}
		} else {
			state.embedded = false;
		}

		if (!state.initialised) {
			state.initialised = true;
			state.initialise();
		}
		state.mode = "normal";
		if (typeof category != "undefined" && category != "") {
			state.category = category;
		} else {
			state.category = "";
		}
		if (x_params.language != "undefined" && x_params.language != "") {
			state.language = x_params.language.substr(0, 2);
		}

		//    if(lrsInstance == undefined){
		try {
			/*
			lrsInstance = new TinCan.LRS(
				{
					endpoint: lrsEndpoint,
					username: lrsUsername,
					password: lrsPassword,
					allowFail: false,
					version: "1.0.2"
				}
			);
			*/

			// // Check if aggretate is set for the lrsEndpoint, than assume this is learning locker and change normal API accordingly and save aggregate for XTGetStatements
			// if (lrsEndpoint.indexOf("api/statements/aggregate/") >= 0)
			// {
			//     state.aggregate = true;
			//     state.lrsAggregateEndpoint = lrsEndpont;
			//     apos = lrsEndpoint.indexOf("api/statements/aggregate");
			//     lrsEndpoint = lrsEndpoint.substr(0, lrsEndpoint.Length - apos) + 'data/xAPI';
			// }
			// else {
			//     state.aggregate = false;
			// }
			var conf = {
				"endpoint": lrsEndpoint + '/',
				"user": lrsUsername,
				"password": lrsPassword,
				"strictCallbacks": true
			};
			ADL.XAPIWrapper.log.debug = true;
			ADL.XAPIWrapper.changeConfig(conf);

		} catch (ex) {
			//alert("Failed LRS setup. Error: " + ex);
			state.mode = "none";
		}


		//TinCan.enableDebug();
		//    }
		if (surf_course != undefined && surf_recipe != undefined) {
			surf_mode = true;
		}

		//    if(lrsInstance != undefined)
		//    {
		state.initStamp = new Date();

		if (!surf_mode) {
			var statement = {
				actor: actor,
				context: {
					extensions: {
						"http://xerte.org.uk/learningObjectLevel": "lo"
					}
				},
				verb: {
					id: "http://adlnet.gov/expapi/verbs/launched",
					display: {
						"en-US": "launched"
					}
				},
				object: {
					objectType: "Activity",
					id: baseUrl() + state.templateId,
					definition: {
						name: {
							"en": x_params.name
						}
					}
				},
				timestamp: state.initStamp
			};
			statement.object.definition.name[state.language] = x_params.name;

			SaveStatement(statement);
		}
		if (surf_mode) {
			var statement = {
				actor: actor,
				verb: {
					id: "http://lrs.surfuni.org/verb/joined",
					display: {
						"en-US": "Joined"
					}
				},
				object: {
					objectType: "Activity",
					id: "http://lrs.surfuni.org/object/course",
					definition: {
						name: {
							"en-US": "Course"
						}
					}
				},
				context: {
					extensions: {
						"http://lrs.surfuni.org/context/course": surf_course,
						"http://lrs.surfuni.org/context/recipe": surf_recipe,
						"http://lrs.surfuni.org/context/label": ""
					}
				},
				target: {
					id: baseUrl() + state.templateId
				},
				timestamp: state.initStamp
			};
			SaveStatement(statement);
		}
		//    }
	}
}

function terminate_xapi(){
	if (!state.finished && state.initialised) {
		// End tracking of page
		currentpageid = state.currentpageid;
		x_endPageTracking(false, -1);
		state.finished = true;
		state.currentpageid = currentpageid;
		x_pageHistory.splice(x_pageHistory.length - 1, 1);
		state.pageHistory = x_pageHistory;
		state.pagesViewed = x_pagesViewed();
		state.pageDicts = x_pageDicts;
		let rawScore = state.getdRawScore();
		let scaledScore = state.getdScaledScore();

		if (!rawScore) {
			rawScore = 0;
		}
		if (!scaledScore) {
			scaledScore = 0;
		}

		// Save completed when a learning object is completed
		if (state.getCompletionStatus() == "completed") {
			var statement = {
				actor: actor,
				verb: {
					id: "http://adlnet.gov/expapi/verbs/completed",
					display: {
						"en-US": "completed"
					}
				},
				object: {
					objectType: "Activity",
					id: baseUrl() + state.templateId,
					definition: {
						name: {
							"en": x_params.name
						}
					}
				},
				result: {
					completion: true,
					success: (state.getSuccessStatus() == "passed"),
					score: {
						min: 0.0,
						max: 100.0,
						raw: rawScore,
						scaled: scaledScore
					},
					duration: calcDuration(state.start, new Date()),
					extensions: {
						"http://xerte.org.uk/xapi/trackingstate": JSON.stringify(state)
					}
				},
				timestamp: new Date()
			};
			statement.object.definition.name[state.language] = x_params.name;
			SaveStatement(statement);
			if (state.getSuccessStatus() == "passed") {
				// Sen passsed
				var statement = {
					actor: actor,
					verb: {
						id: "http://adlnet.gov/expapi/verbs/passed",
						display: {
							"en-US": "passed"
						}
					},
					object: {
						objectType: "Activity",
						id: baseUrl() + state.templateId,
						definition: {
							name: {
								"en": x_params.name
							}
						}
					},
					result: {
						completion: true,
						success: true,
						score: {
							min: 0.0,
							max: 100.0,
							raw: rawScore,
							scaled: scaledScore

						},
						duration: calcDuration(state.start, new Date())
					},
					timestamp: new Date()
				};
				statement.object.definition.name[state.language] = x_params.name;
				SaveStatement(statement);
			} else {
				// Send failed
				var statement = {
					actor: actor,
					verb: {
						id: "http://adlnet.gov/expapi/verbs/failed",
						display: {
							"en-US": "failed"
						}
					},
					object: {
						objectType: "Activity",
						id: baseUrl() + state.templateId,
						definition: {
							name: {
								"en": x_params.name
							}
						}
					},
					result: {
						completion: true,
						success: false,
						score: {
							min: 0.0,
							max: 100.0,
							raw: rawScore,
							scaled: scaledScore

						},
						duration: calcDuration(state.start, new Date()),
					},
					timestamp: new Date()
				};
				statement.object.definition.name[state.language] = x_params.name;
				SaveStatement(statement);
			}
			// Save scored
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
					id: baseUrl() + state.templateId,
					definition: {
						name: {
							"en": x_params.name
						}
					}
				},
				result: {
					completion: true,
					success: (state.getSuccessStatus() == "passed"),
					score: {
						min: 0.0,
						max: 100.0,
						raw: rawScore,
						scaled: scaledScore

					},
					duration: calcDuration(state.start, new Date())
				},
				timestamp: new Date()
			};
			statement.object.definition.name[state.language] = x_params.name;
			SaveStatement(statement);

		}

		// Save exited
		var statement = {
			actor: actor,
			verb: {
				id: "http://adlnet.gov/expapi/verbs/exited",
				display: {
					"en": "exited"
				}
			},
			object: {
				objectType: "Activity",
				id: baseUrl() + state.templateId,
				definition: {
					name: {
						"en": x_params.name
					}
				}
			},
			result: {
				completion: (state.getCompletionStatus() == 'completed'),
				success: (state.getSuccessStatus() == 'passed'),
				score: {
					min: 0.0,
					max: 100.0,
					raw: rawScore,
					scaled: scaledScore
				},
				extensions: {
					"http://xerte.org.uk/xapi/trackingstate": JSON.stringify(
						state)
				},
				duration: calcDuration(state.start, new Date())
			},
			timestamp: new Date()
		};
		statement.object.definition.name[state.language] = x_params.name;
		SaveStatement(statement);
		if (typeof lti_enabled !== 'undefined' && lti_enabled) {
			// Send ajax request to store grade through LTI to gradebook
			var url = window.location.href;
			if (url.indexOf("lti_launch.php") >= 0) {
				url = url.replace("lti_launch.php", "website_code/php/lti/sendgrade.php");
			} else if (url.indexOf("lti13_launch.php") >= 0) {
				url = url.replace("lti13_launch.php", "website_code/php/lti/sendgrade.php");
			} else {
				url = "";
			}
			if (url.length > 0) {
				$.ajax({
					method: "POST",
					url: url,
					data: {
						grade: state.getdScaledScore()
					}
				})
					.done(function (msg) {
						//alert("Data Saved: " + msg);
					});
			}
		}
	} else {
		//if (!state.finished && state.initialised) {
		console.log("XTTerminate didn't execute because " + (state.finished ? "state was already finished " : "") + (state.initialised ? "" : "state was not initialised"))
	}
}

function video_xapi(page_nr, name, verb, videostate, set_grouping) {
	var id = baseUrl() + state.templateId + "/" + page_nr + "/video";
	var pagename = "Page " + page_nr;
	if (name != null && name != "") {
		id = baseUrl() + state.templateId + "/" + name.replace(/[\/ ]/g, "_") + "/video";
		pagename = name;
	}

	var grouping = "";
	if (typeof set_grouping != "undefined" && set_grouping != "" && set_grouping !=
		null) {
		grouping = set_grouping;
	}
	if (grouping != "") {
		var definition = {
			name: {
				'en-US': grouping,
			}
		};
		definition.name[state.language] = grouping;
		statementgrouping = {
			grouping: [{
				id: baseUrl() + grouping.replace(/[\/ ]/g, "_"),
				definition: definition,
				objectType: "Activity"
			}]
		};
	}

	switch (verb) {

		case "initialized":
			state.videostart = new Date();
			var statement = {
				"actor": actor,
				"verb": {
					"id": "http://adlnet.gov/expapi/verbs/initialized",
					"display": {
						"en-US": "initialized"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "played":
			var statement = {
				"actor": actor,
				"verb": {
					"id": "https://w3id.org/xapi/video/verbs/played",
					"display": {
						"en-US": "played"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"result": {
					"extensions": {
						"https://w3id.org/xapi/video/extensions/time": videostate.time
					},
					"duration": calcDuration(state.videostart, new Date())
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
						"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "paused":
			var played_segments = "";
			for (var i = 0; i < videostate.segments.length; i++) {
				if (i > 0) {
					played_segments += "[,]"
				}
				played_segments += videostate.segments[i].start + "[.]" + videostate.segments[i].end;
			}
			var statement = {
				"actor": actor,
				"verb": {
					"id": "https://w3id.org/xapi/video/verbs/paused",
					"display": {
						"en-US": "paused"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"result": {
					"extensions": {
						"https://w3id.org/xapi/video/extensions/time": videostate.time,
						"https://w3id.org/xapi/video/extensions/progress": XThelperDetermineProgress(videostate),
						"https://w3id.org/xapi/video/extensions/played-segments": played_segments
					},
					"duration": calcDuration(state.videostart, new Date())
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
						"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "seeked":
			var statement = {
				"actor": actor,
				"verb": {
					"id": "https://w3id.org/xapi/video/verbs/seeked",
					"display": {
						"en-US": "seeked"
					}
				},
				"object": {
					"id": id,
					"definition": {
						"name": {
							"en-US": "Video of " + pagename
						},
						"description": {
							"en-US": "Watching video on " + pagename
						},
						"type": "https://w3id.org/xapi/video/activity-type/video"
					},
					"objectType": "Activity"
				},
				"result": {
					"extensions": {
						"https://w3id.org/xapi/video/extensions/time-from": videostate.prevTime,
						"https://w3id.org/xapi/video/extensions/time-to": videostate.time
					},
					"duration": calcDuration(state.videostart, new Date())
				},
				"context": {
					"contextActivities": {
						"category": [{
							"id": "https://w3id.org/xapi/video"
						}]
					},
					"extensions": {
						"http://xerte.org.uk/learningObjectLevel": "video",
						"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
						"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
					}
				}
			};
			statement.object.definition.name[state.language] = pagename;
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;
		case "interacted":
			break;
		case "exit": // Not really the verb. will send termintaed or completed depending on state
			var played_segments = "";
			for (var i = 0; i < videostate.segments.length; i++) {
				if (i > 0) {
					played_segments += "[,]"
				}
				played_segments += videostate.segments[i].start + "[.]" + videostate.segments[i].end;
			}
			var progress = XThelperDetermineProgress(videostate);
			// 3. Determine whther to use completed or terminated
			if (progress >= 99.9) {
				// Use completed
				var statement = {
					"actor": actor,
					"verb": {
						"id": "http://adlnet.gov/expapi/verbs/completed",
						"display": {
							"en-US": "completed"
						}
					},
					"object": {
						"id": id,
						"definition": {
							"name": {
								"en-US": "Video of " + pagename
							},
							"description": {
								"en-US": "Watching video on " + pagename
							},
							"type": "https://w3id.org/xapi/video/activity-type/video"
						},
						"objectType": "Activity"
					},
					"result": {
						"extensions": {
							"https://w3id.org/xapi/video/extensions/time": videostate.time,
							"https://w3id.org/xapi/video/extensions/progress": progress,
							"https://w3id.org/xapi/video/extensions/played-segments": played_segments
						},
						"completion": true,
						"duration": calcDuration(state.videostart, new Date())
					},
					"context": {
						"contextActivities": {
							"category": [{
								"id": "https://w3id.org/xapi/video"
							}]
						},
						"extensions": {
							"http://xerte.org.uk/learningObjectLevel": "video",
							"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
							"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
						}
					}
				};
				statement.object.definition.name[state.language] = pagename;
			} else {
				// use terminated, so first send paused as according to standards (if not already sent)
				if (state.prevVerb != "paused") {
					var statement = {
						"actor": actor,
						"verb": {
							"id": "https://w3id.org/xapi/video/verbs/paused",
							"display": {
								"en-US": "paused"
							}
						},
						"object": {
							"id": id,
							"definition": {
								"name": {
									"en-US": "Video of " + pagename
								},
								"description": {
									"en-US": "Watching video on " + pagename
								},
								"type": "https://w3id.org/xapi/video/activity-type/video"
							},
							"objectType": "Activity"
						},
						"result": {
							"extensions": {
								"https://w3id.org/xapi/video/extensions/time": videostate.time,
								"https://w3id.org/xapi/video/extensions/progress": XThelperDetermineProgress(videostate),
								"https://w3id.org/xapi/video/extensions/played-segments": played_segments
							},
							"duration": calcDuration(state.videostart, new Date())
						},
						"context": {
							"contextActivities": {
								"category": [{
									"id": "https://w3id.org/xapi/video"
								}]
							},
							"extensions": {
								"http://xerte.org.uk/learningObjectLevel": "video",
								"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
								"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
							}
						}
					};
					statement.object.definition.name[state.language] = pagename;
					if (grouping != "") {
						statement.context.contextActivities = statementgrouping;
					}
					SaveStatement(statement);
				}
				var statement = {
					"actor": actor,
					"verb": {
						"id": "http://adlnet.gov/expapi/verbs/terminated",
						"display": {
							"en-US": "terminated"
						}
					},
					"object": {
						"id": id,
						"definition": {
							"name": {
								"en-US": "Video of " + pagename
							},
							"description": {
								"en-US": "Watching video on " + pagename
							},
							"type": "https://w3id.org/xapi/video/activity-type/video"
						},
						"objectType": "Activity"
					},
					"result": {
						"extensions": {
							"https://w3id.org/xapi/video/extensions/time": videostate.time,
							"https://w3id.org/xapi/video/extensions/progress": progress,
							"https://w3id.org/xapi/video/extensions/played-segments": played_segments
						},
						"duration": calcDuration(state.videostart, new Date())
					},
					"context": {
						"contextActivities": {
							"category": [{
								"id": "https://w3id.org/xapi/video"
							}]
						},
						"extensions": {
							"http://xerte.org.uk/learningObjectLevel": "video",
							"https://w3id.org/xapi/video/extensions/session-id": state.sessionId,
							"https://w3id.org/xapi/video/extensions/length": Math.round(videostate.duration)
						}
					}
				};
				statement.object.definition.name[state.language] = pagename;
			}
			if (grouping != "") {
				statement.context.contextActivities = statementgrouping;
			}
			SaveStatement(statement);
			break;

	}
	state.prevVerb = verb;
}
