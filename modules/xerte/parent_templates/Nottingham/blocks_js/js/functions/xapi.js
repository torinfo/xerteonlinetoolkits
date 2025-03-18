function SaveStatement(statement, async) {
	var key = "http://xerte.org.uk/sessionId";
	extension = {
		"http://xerte.org.uk/sessionId": state.sessionId,
		"http://xerte.org.uk/learningObjectId": baseUrl() + state.templateId,
		"http://xerte.org.uk/learningObjectTitle": $("<div>").html(x_params.name).text()
	};
	if (state.embedded) {
		extension["http://xerte.org.uk/launchedFrom"] = state.embedded_from;
		extension["http://xerte.org.uk/launchedFromTitle"] = state.embedded_fromTitle;
	}
	if (state.coursename != "") {
		extension["http://xerte.org.uk/course"] = state.coursename;
	}
	if (state.modulename != "") {
		extension["http://xerte.org.uk/module"] = state.modulename;
	}
	if (state.lti_context_id != "") {
		extension["http://xerte.org.uk/lti_context_id"] = state.lti_context_id;
	}
	if (state.lti_context_name != "") {
		extension["http://xerte.org.uk/lti_context_name"] = state.lti_context_name;
	}
	if (typeof statement.context == "undefined") {
		statement.context = {
			"extensions": extension
		};
	} else if (typeof statement.context.extensions == "undefined") {
		statement.context.extensions = extension;
	} else {
		// Loop over all keys in extension and add to existing extension
		$.each(extension, function (key, value) {
			statement.context.extensions[key] = value;
		});
	}
	var parentId = baseUrl() + state.templateId;
	if (statement.object.id != parentId) {
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		var parentObj = {
			"definition": {
				"name": {
					"en-US": x_params.name
				}
			},
			"id": parentId,
			"objectType": "Activity"
		};
		parentObj.definition.name[state.language] = x_params.name;
		statement.context.contextActivities.parent = [parentObj];
	}
	if (state.category != "") {
		//Place Xerte Category in contextActivities/Other, NOT in categoryContext/category, because that is used for different puposes by xAPI
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		if (typeof statement.context.contextActivities.other == "undefined") {
			statement.context.contextActivities.other = [{
				id: baseUrl() + state.category.replace(/[\/ ]/g, "_")
			}];
		} else {
			statement.context.contextActivities.other.push({
				id: baseUrl() + state.category.replace(/[\/ ]/g, "_")
			});
		}
	}
	if (state.course != "") {
		//Place course in contextActivities/Other
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		if (typeof statement.context.contextActivities.other == "undefined") {
			statement.context.contextActivities.other = [state.course];
		} else {
			statement.context.contextActivities.other.push(state.course);
		}
	}
	if (state.module != "") {
		//Place module in contextActivities/Other
		if (typeof statement.context.contextActivities == "undefined") {
			statement.context.contextActivities = {};
		}
		if (typeof statement.context.contextActivities.other == "undefined") {
			statement.context.contextActivities.other = [state.module];
		} else {
			statement.context.contextActivities.other.push(state.module);
		}
	}
	if (state.group != "") {
		// Place in context team
		statement.context.team = state.group;
	}

	/*
	statement = new TinCan.Statement(statement);
	statement.id = null;
	if (typeof async == 'undefined')
	{
		async = true;
	}
	if(async){
		lrsInstance.saveStatement(
			statement,
			{
				callback: function (err, xhr) {
					if (err !== null) {
						if (xhr !== null) {
							//alert("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
							// TODO: handle error accordingly when needed
							return;
						}

						//alert("Failed to save statement: " + err);
						// TODO: handle error accordingly when needed
						return;
					}

				}
			}
		);
	}else{
		lrsInstance.saveStatement(
			statement
		);
	}
	*/
	statement.id = null;
	statement.timestamp = new Date();
	if (typeof async == 'undefined') {
		async = true;
	}
	if (async) {
		ADL.XAPIWrapper.sendStatement(statement, function (err, res, body) {
			ADL.XAPIWrapper.log("[" + body.id + "]: " + res.status +
				" - " + res.statusText);
		});
	} else {
		var res = ADL.XAPIWrapper.sendStatement(statement);
		ADL.XAPIWrapper.log("[" + res.id + "]: " + res.xhr.status + " - " + res
			.xhr.statusText);
	}

}

function getStatements(q, one, callback)
{
    var search = ADL.XAPIWrapper.searchParams();
    var group = "";
    var context_id = "";
    if (q['group'] != undefined)
    {
        group = q['group'];
        delete q['group'];
    }
    if (q['lti_context_id'] != undefined)
    {
        context_id = q['lti_context_id'];
        delete q['lti_context_id'];
    }
    $.each(q, function(i, value) {
        search[i] = value;
    });
    if (one) {
        search['limit'] = 1;
    } else {
        search['limit'] = 1000;
    }
    var statements = [];
    if (callback == null)
    {
        var tmp=ADL.XAPIWrapper.getStatements(search);
        for (x = 0; x < tmp.statements.length; x++) {
            if (group != ""
                && (tmp.statements[x].context.team == undefined
                || tmp.statements[x].context.team.account == undefined
                || tmp.statements[x].context.team.account.name == undefined
                || tmp.statements[x].context.team.account.name != group)) {
                continue;
            }
            if (context_id != ""
                && (tmp.statements[x].context.extensions == undefined
                || tmp.statements[x].context.extensions["http://xerte.org.uk/lti_context_id"] == undefined
                || tmp.statements[x].context.extensions["http://xerte.org.uk/lti_context_id"] != context_id)) {
                continue;
            }
            statements.push(tmp.statements[x]);
        }
        return statements;
    }
    else {
        ADL.XAPIWrapper.getStatements(search, null,
            function getmorestatements(err, res, body) {
                var lastSubmit = null;

                for (x = 0; x < body.statements.length; x++) {
                    //if (sr.statements[x].actor.mbox == userEMail && lastSubmit == null) {
                    //    lastSubmit = JSON.parse(sr.statements[x].result.extensions["http://xerte.org.uk/xapi/JSONGraph"]);
                    //}
                    if (group != ""
                        && (body.statements[x].context == undefined
                            || body.statements[x].context.team == undefined
                            || body.statements[x].context.team.account == undefined
                            || body.statements[x].context.team.account.name == undefined
                            || body.statements[x].context.team.account.name != group)) {
                        continue;
                    }
                    if (context_id != ""
                        && (body.statements[x].context == undefined
                            || body.statements[x].context.extensions == undefined
                            || body.statements[x].context.extensions["http://xerte.org.uk/lti_context_id"] == undefined
                            || body.statements[x].context.extensions["http://xerte.org.uk/lti_context_id"] != context_id)) {
                        continue;
                    }
                    statements.push(body.statements[x]);
                }
                //stringObjects.push(lastSubmit);
                if (err !== null) {
                    console.log("Failed to query statements: " + err);
                    // TODO: do something with error, didn't get statements
                    return;
                }
                if (body.more && body.more !== "") {
                    ADL.XAPIWrapper.getStatements(null, body.more, getmorestatements);
                } else {
                    callback(statements, search);
                }
            }
        );
    }
}
