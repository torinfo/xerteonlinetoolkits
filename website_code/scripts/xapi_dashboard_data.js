function DashboardState(info) {
  this.info = info;
  this.conf = {
    endpoint: info.lrs.lrsendpoint + "/",
    user: info.lrs.lrskey,
    password: info.lrs.lrssecret,
    strictCallbacks: true,
  };
  ADL.XAPIWrapper.changeConfig(this.conf);
  this.rawData = undefined;
  this.pageIndex = 0;
  this.pageSize = JSON.parse(info.dashboard.display_options).pageSize;
  if (this.pageSize == undefined) {
    this.pageSize = 5;
  }
  this.currentGroup = {
    group_id: "all-groups",
  };
  this.state = undefined;
}

DashboardState.prototype.clear = function () {
  this.rawData = [];
  this.state = undefined;
};

DashboardState.prototype.getStatements = function (q, one, callback, force_xapi = false) {
  if (this.info.lrs.db && callback != null && !force_xapi) {
    this.getStatementsFromDB(q, one).then(() => callback());
  }
  else if (this.info.lrs.aggregate && !force_xapi) {
    this.getStatementsAggregate(q, one, callback);
  } else {
    this.getStatementsxAPI(q, one, callback);
  }
};

DashboardState.prototype.httpGetStatements = async function (url, query) {
  const auth = btoa(this.info.lrs.lrskey + ":" + this.info.lrs.lrssecret);
  try {
    const result = await $.ajax({
      url: url,
      type: "POST",
      headers: {
        'X-XERTE-USEDB': 'true',
        'Authorization': 'Basic ' + auth
      },
      data: query,
      dataType: "json"
    });
    return result;
  }
  catch (error) {
    console.log(error);
    return null;
  }
}

DashboardState.prototype.getStatementsFromDB = async function (q, one) {
  let search = {};
  let activity = "";
  if (q['filter_current_users'] != undefined) {
    if (q['filter_current_users'] == 'true') {
      const lti_user_list = lti_users.split(',');
      search['actor'] = lti_user_list;
    }
    delete q['filter_current_users'];
  }
  if (q['activity'] != undefined && typeof this.info.lrs.extra != 'undefined' && this.info.lrs.extra['source'] != undefined > 0 && q['activity'].indexOf(this.info.lrs.extra['source']) == 0) {
    search['xapiobjectid'] = [q['activity'], q['activity'].replace(this.info.lrs.extra['source'], this.info.lrs.extra['extra'])];
    activity = q['activity'];
    delete q['activity'];
  }
  $.each(q, function (i, value) {
    search[i] = value;
  });
  if (one) {
    limit = 1;
  } else {
    limit = 5000;
  }
  search['unsorted'] = 1;

  let query = 'statements=1&realtime=1&query=' + JSON.stringify(search) + '&limit=' + limit + '&offset=0';
  this.clear();
  $this = this;
  do {
    const response = await this.httpGetStatements(this.info.lrs.lrsendpoint, query);
    $this.rawData = [...$this.rawData, ...response.statements];
    $('#loader_text').html(
      XAPI_DASHBOARD_DATA_RETRIEVE_DATA + " " + Math.round(($this.rawData.length * 100) / response.nrrecords) + "%"
    );
    if (response.more) {
      query = response.more;
    }
    else {
      query = null;
    }
  } while (query != null && query != "");
  $('#loader_text').html(
    XAPI_DASHBOARD_DATA_PREPARE_GRAPHS
  );
  // Transform the statements to the correct activity
  if (typeof this.info.lrs.extra != 'undefined' && this.info.lrs.extra['extra'] != undefined > 0 && activity.indexOf(this.info.lrs.extra['extra']) == 0) {
    for (let i = 0; i < $this.rawData.length; i++) {
      if ($this.rawData[i].object.id.indexOf(this.info.lrs.extra['extra']) == 0) {
        $this.rawData[i].object.id.replace(this.info.lrs.extra['extra'], this.info.lrs.extra['source']);
      }
    }
  }
  // Sort statements in descending order
  $this.rawData.sort((a, b) => {
    if (a.timestamp < b.timestamp) {
      return 1;
    }
    return -1;
  });
  $this._rebuildRawDatamap();
}


DashboardState.prototype.getStatementsxAPI = function (q, one, callback) {
  //ADL.XAPIWrapper.log.debug = true;
  ADL.XAPIWrapper.changeConfig(this.conf);

  var search = ADL.XAPIWrapper.searchParams();
  var activities = q.activities;
  var query = q;
  $.each(q, function (i, value) {
    if (i != "activities" && i != "actor")
      search[i] = value;
  });
  if (one) {
    search['limit'] = 1;
  } else {
    search['limit'] = 1000;
  }
  if (q['actor'] != undefined) {
    search['agent'] = '{ "mbox" : "mailto:' + q['actor'] + '" }';
  }
  var beginDate = moment(q['since']);
  var endDate = moment(q['until']);
  var days = moment.duration(endDate.diff(beginDate)).as('days');
  var nractivities = 1;
  if (q['activities'] != undefined) {
    nractivities = q['activities'].length;
  }
  var limit = search['limit'];
  this.clear();
  $this = this;
  ADL.XAPIWrapper.getStatements(search, null,
    function getmorestatements(err, res, body) {
      for (x = 0; x < body.statements.length; x++) {
        var statement = body.statements[x];
        if ($this.info.role == "Teacher") {
          if (statement.actor.mbox != undefined) {
            if ($this.info.users.findIndex(u => 'mailto:' + u.email === statement.actor.mbox) === -1) {
              // Skip this user
              continue;
            }
          }
          else if (statement.actor.mbox_sha1sum != undefined) {
            if ($this.info.users.findIndex(u => u.sha1 === statement.actor.mbox_sha1sum) === -1) {
              // Skip this user
              continue;
            }
          }
        }
        if ($this.info.dashboard.anonymous) {
          if (statement.actor.mbox != undefined) {
            // Key is email
            // cutoff mailto: and calc sha1:
            var sha1 = DS.sha1(statement.actor.mbox);
            statement.actor.mbox_sha1sum = sha1;
            delete statement.actor.mbox;
            if (statement.actor.name) {
              delete statement.actor.name;
            }

          } else if (statement.actor.mbox_sha1sum != undefined) {
            // Nothing to do

          } else {
            // Key is session_id, transform to pseudo mbox_sha1sum
            var key = statement.context.extensions['http://xerte.org.uk/sessionId'];
            if (key == undefined) {
              key = statement.context.extensions[site_url + "sessionId"];
            }
            if (key != undefined) {
              delete statement.actor;

              var sha1 = DS.sha1("mailto:" + key + "@example.com");
              statement.actor = {
                mbox_sha1sum: sha1,
              };

              // remove group
            }
          }
          body.statements[x].actor;
        }
        $this.rawData.push(statement);
      }
      if (err !== null) {
        console.log("Failed to query statements: " + err);
        // TODO: do something with error, didn't get statements
        return;
      }
      if (body.more && body.more !== "") {
        ADL.XAPIWrapper.getStatements(null, body.more, getmorestatements);
      } else {
        if (activities == undefined) {
          activities = [];
        }
        activities[0] = undefined;
        activities = activities.filter(function (s) {
          return s != undefined;
        });
        if (activities.length > 0) {
          search = ADL.XAPIWrapper.searchParams();
          search["activity"] = activities[0];
          $.each(query, function (i, value) {
            if (i != "activities" && i != "activity" && i != "actor")
              search[i] = value;
          });
          if (query["actor"] != undefined) {
            search["agent"] = '{ "mbox" : "mailto:' + query["actor"] + '" }';
          }
          search["limit"] = limit;
          ADL.XAPIWrapper.getStatements(search, null, getmorestatements);
        } else {
          $this._rebuildRawDatamap();
          callback();
        }
      }
    }
  );
};

DashboardState.prototype.getStatementsAggregate = function (q, one, callback) {
  var role = this.info ? this.info.role : "";
  var matchLaunched =
    '{"statement.verb.id" : { "$eq" : "http://adlnet.gov/expapi/verbs/launched" } }';
  var matchCourse = "";
  if (typeof q["activities"] != "undefined") {
    matchCourse = DashboardState._buildMatchCourseFromActivities(q["activities"], "$");
  } else if (typeof q["activity"] != "undefined") {
    matchCourse =
      '{ "statement.object.id" :  { "$eq": "' + q["activity"] + '"} }';
  }

  var matchActor = DashboardState._buildMatchActor(role, q, this.info.users);
  var matchDateRange = "";
  if (typeof q["since"] != "undefined" && typeof q["until"] != "undefined") {
    matchDateRange = DashboardState._buildPeriodMatch(q["since"], q["until"]);
  } else if (typeof q["since"] != "undefined") {
    matchDateRange = '{"statement.timestamp": {"$gte": "' + q["since"] + '"}}';
  } else if (typeof q["until"] != "undefined") {
    matchDateRange = '{"statement.timestamp": {"$lte": "' + q["until"] + '"}}';
  }

  var startDate = moment(q["since"]);
  var endDate = moment(q["until"]);
  // Create a week array
  var periods = [];
  var currDate = endDate;
  var beginOfPeriod = moment(currDate).subtract(15, "days").add(1, "ms");
  while (startDate <= beginOfPeriod) {
    periods.push(DashboardState._buildPeriodMatch(beginOfPeriod.toISOString(), currDate.toISOString()));
    currDate = moment(currDate).subtract(15, "days");
    beginOfPeriod = beginOfPeriod = moment(currDate)
      .subtract(15, "days")
      .add(1, "ms");
  }
  periods.push(DashboardState._buildPeriodMatch(startDate.toISOString(), currDate.toISOString()));

  // var project = '{"$project": { "statement.actor": 1, "statement.context" : 1, "statement.id" : 1, "statement.object" : 1,  "statement.timestamp" : 1, "statement.stored" : 1, "statement.verb" :  1, "_id": 0 }}';
  var project = '{"$project": { "statement": 1, "_id": 0 }}';
  var sort = '{"$sort" : {   "timestamp": -1,   "_id": 1 }}';
  var auth = btoa(this.info.lrs.lrskey + ":" + this.info.lrs.lrssecret);
  this.clear();
  if (
    typeof q["verb"] != "undefined" &&
    q["verb"] == "http://adlnet.gov/expapi/verbs/launched"
  ) {
    this.fetchData(
      q,
      role,
      [matchCourse, matchLaunched],
      matchActor,
      [sort, project],
      this.info.lrs.lrsendpoint + "?pipeline=",
      auth,
      periods,
      0,
      callback,
      null,
      "#loader_text",
      XAPI_DASHBOARD_DATA_PREPARE_RETRIEVAL
    );
  } else {
    this.fetchData(
      q,
      role,
      [matchCourse, matchLaunched],
      matchActor,
      [sort, project],
      this.info.lrs.lrsendpoint + "?pipeline=",
      auth,
      periods,
      0,
      callback,
      this.retrieveDataThroughAggregate,
      "#loader_text",
      XAPI_DASHBOARD_DATA_PREPARE_RETRIEVAL
    );
  }
};

DashboardState.prototype.retrieveDataThroughAggregate = function (
  q,
  dashboard_state,
  data,
  callback
) {
  var role = this.info ? this.info.role : "";
  var startDate = moment(q["since"]);
  var endDate = moment(q["until"]);

  var matchCourse = "";
  var related_activities = false;
  if (
    typeof q["related_activities"] != "undefined" &&
    q["related_activities"] == true
  ) {
    related_activities = true;
  }
  if (typeof q["activities"] != "undefined") {
    var postfix = related_activities ? "(/|$)" : "$";
    matchCourse = DashboardState._buildMatchCourseFromActivities(q["activities"], postfix);
  } else if (typeof q["activity"] != "undefined") {
    if (related_activities) {
      matchCourse =
        '{ "statement.object.id" :  { "$regex" :  "^' +
        q["activities"][0].replace(/\//g, "\\/") +
        '(/|$)" } }';
    } else {
      matchCourse = '{ "statement.object.id" :  { "' + q["activity"] + '" }';
    }
  }

  var matchActor = DashboardState._buildMatchActor(role, q, dashboard_state.info.users);

  var matchVerb = "";
  if (typeof q["verb"] != "undefined") {
    matchVerb =
      '{"statement.verb.id" : { "$eq" : "http://adlnet.gov/expapi/verbs/launched" } }';
  }
  // Create a week array
  var periods = [];
  var currindex = 49;
  var currDate = endDate;
  var beginOfPeriod;
  while (currindex < data.length) {
    beginOfPeriod = moment(data[currindex].timestamp).add(1, "ms");
    periods.push(DashboardState._buildPeriodMatch(beginOfPeriod.toISOString(), currDate.toISOString()));
    currDate = moment(data[currindex].timestamp);
    currindex += 50;
  }
  periods.push(DashboardState._buildPeriodMatch(startDate.toISOString(), currDate.toISOString()));
  var sort = '{"$sort" : {   "timestamp": -1,   "_id": 1 }}';
  var project = '{"$project": { "statement": 1, "_id": 0 }}';
  var auth = btoa(
    dashboard_state.info.lrs.lrskey + ":" + dashboard_state.info.lrs.lrssecret
  );
  dashboard_state.clear();
  dashboard_state.fetchData(
    q,
    role,
    [matchCourse, matchVerb],
    matchActor,
    [sort, project],
    dashboard_state.info.lrs.lrsendpoint + "?pipeline=",
    auth,
    periods,
    0,
    callback,
    null,
    "#loader_text",
    XAPI_DASHBOARD_DATA_RETRIEVE_DATA
  );
};

DashboardState.prototype.fetchData = function (
  q,
  role,
  matcharray,
  matchactor,
  otherstages,
  url,
  auth,
  periods,
  currperiod,
  orgcallback,
  callback,
  loaderid,
  label
) {
  var $this = this;
  var match = '{ "$match": {"$and" : [' + periods[currperiod];
  for (var i = 0; i < matcharray.length; i++) {
    if (matcharray[i] != "") {
      match += ", " + matcharray[i];
    }
  }
  match += "]}}";

  var pipeline = "[" + match;
  for (var i = 0; i < otherstages.length; i++) {
    pipeline += ", " + otherstages[i];
  }
  pipeline += "]";

  $(loaderid).html(
    label + " " + Math.round((currperiod * 100) / periods.length) + "%"
  );

  $.ajax({
    type: "GET",
    url: url + encodeURIComponent(pipeline),
    dataType: "text",
    headers: {
      Authorization: "Basic " + auth,
    },
    success: function (data) {
      var rawData = JSON.parse(data.replace(/&46;/g, "."));
      for (var i = 0; i < rawData.length; i++) {
        $this.rawData.push(rawData[i].statement);
      }
      if (currperiod + 1 < periods.length) {
        $this.fetchData(
          q,
          role,
          matcharray,
          matchactor,
          otherstages,
          url,
          auth,
          periods,
          currperiod + 1,
          orgcallback,
          callback,
          loaderid,
          label
        );
      } else if (callback != null) {
        callback(q, $this, $this.rawData, orgcallback);
      } else {
        $(loaderid).html(XAPI_DASHBOARD_DATA_PREPARE_GRAPHS);
        $this._rebuildRawDatamap();
        setTimeout(function () {
          orgcallback($this.rawData);
        }, 0);
      }
    },
  });
};

DashboardState._buildMatchActor = function (role, q, users) {
  var matchActor = "";
  if (typeof q["actor"] != "undefined") {
    matchActor = '{"statement.actor.mbox" : "mailto:' + q["actor"] + '"}';
  }
  if (role == "Teacher") {
    matchActor = '{"statement.actor.mbox" :  { "$in": [';
    users.forEach(function (user, i) {
      matchActor += '"mailto:' + user.email + '"';
      if (i < users.length - 1) {
        matchActor += ", ";
      }
    });
    matchActor += "] } }";
  }
  return matchActor;
};

DashboardState._buildMatchCourseFromActivities = function (activities, postfix) {
  if (activities.length == 1) {
    return '{ "statement.object.id" :  { "$regex" :  "^' +
      activities[0].replace(/\//g, "\\/") +
      postfix +
      '" } }';
  }
  var matchCourse = '{ "statement.object.id" :  { "$regex" :  "^(';
  for (var i = 0; i < activities.length; i++) {
    matchCourse += activities[i];
    if (i < activities.length - 1) {
      matchCourse += "|";
    }
  }
  matchCourse += ")" + postfix + '" } }';
  return matchCourse;
};

DashboardState._buildPeriodMatch = function (sinceISO, untilISO) {
  return '{"timestamp": { "$gte": { "$dte": "' +
    sinceISO +
    '" }, "$lte": { "$dte": "' +
    untilISO +
    '" }}}';
};

DashboardState.prototype._rebuildRawDatamap = function () {
  this.rawDatamap = [];
  for (var i = 0; i < this.rawData.length; i++) this.rawDatamap[i] = i;
};

DashboardState.prototype.combineUrls = function () {
  var url = site_url + this.info.template_id;
  var urls = [url];
  if (
    this.info.lrs.lrsurls != null &&
    this.info.lrs.lrsurls != "undefined" &&
    this.info.lrs.lrsurls != "" &&
    this.info.lrs.site_allowed_urls != null &&
    this.info.lrs.site_allowed_urls != "undefined" &&
    this.info.lrs.site_allowed_urls != ""
  ) {
    $this = this;
    urls = [url]
      .concat(this.info.lrs.lrsurls.split(","))
      .concat(
        this.info.lrs.site_allowed_urls.split(",").map(function (url) {
          return url + $this.info.template_id;
        })
      )
      .filter(function (url) {
        return url != "";
      });
  }
  var mapping = function (url) {
    return url;
  };
  if (urls.length > 1) {
    mapping = function (url) {
      urls.forEach(function (mUrl) {
        url = url.replace(mUrl, urls[0]);
      });
      return url;
    };
  }
  for (index in this.rawData) {
    statement = this.rawData[index];
    statement.object.id = mapping(statement.object.id);
    if (statement.context != undefined) {
      statement.context.extensions["http://xerte.org.uk/learningObjectId"] =
        mapping(
          statement.context.extensions["http://xerte.org.uk/learningObjectId"]
        );
    }
    this.rawData[index] = statement;
  }
  return this.rawData;
};

