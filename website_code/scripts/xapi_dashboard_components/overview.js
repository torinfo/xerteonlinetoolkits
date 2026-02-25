export class Overview {
  /** The activity chart lib */
  #activityChartLib;

  /** The canvas to draw on */
  #canvas;

  /** The start date of the dashboard */
  #date_first_launch;

  /** The end date of the dashboard */
  #date_last_launch;

  /** The id of the graph */
  #id

  /** The dashboard state */
  #state;

  /**
  *
  * @param {string} canvas - The html element to draw on
  * @param {object} state - The dashboard state
  * @param {string} id - The dashboard state
  */
  constructor(canvas, state, id) {
    this.#canvas = canvas;
    this.#state = state;
    this.#id = `overviewLaunchesGraph${id ? `-${id}` : ''}`;

    this.#date_first_launch = luxon.DateTime
      .fromFormat($('#dp-start').val(), 'dd/MM/yyyy')
      .minus({ days: 1 })

    this.#date_last_launch = luxon.DateTime
      .fromFormat($('#dp-end').val(), 'dd/MM/yyyy')
      .plus({ days: 1 })
  }

  async init() {
    this.#activityChartLib = await import('./graphs/activity.js');

    this.createOverviewContainer(this.#canvas);
  }

  /**
   * Create a column div
   *
   * @param {string} title - The title of the column
   * @param {string} value - The content of the column
   */
  static makeColumnDiv(title, value) {
    return `
      <div class="col-lg col-md-6">
        <div class="bg-white rounded w-100 h-100 text-center pt-4 pb-2">
          <dl>
            <div class="h6 font-weight-normal">${title}</div>
            <div class="h2" style="color: #f86718;">${value}</div>
          </dl>
        </div>
      </div>`;
  }

  /**
      * Create the overview container
      *
      * @param canvas - The html element to draw on
      * @returns The html for the row
      */
  createOverviewContainer(canvas) {
    const row = `
      <div class="journeyOverview">
        ${this.createOverviewHeader()}
        ${this.createOverviewActivity()}
        ${this.createOverviewStatistics()}
      </div>`;

    canvas.append(row);

    // Draw the activity chart
    this.#activityChartLib.drawActivityChart(
      this.#state,
      this.#id,
      this.#date_first_launch,
      this.#date_last_launch,
    );
  }

  /**
   * Create the overview header
   *
   * @returns The html for the header
   */
  createOverviewHeader() {
    return `
      <div class="row">
        <div class="col-12">
          <h3>${XAPI_DASHBOARD_OVERVIEW}</h3>
        </div>
      </div>`;
  }

  /**
   * Create the overview activity row
   *
   * @returns The html for the activity row
   */
  createOverviewActivity() {
    return `
      <div class="row">
        <div class="col-12">
          <div class="bg-white rounded">
            <canvas id="${this.#id}" style="height: 300px; max-height: 300px;"></canvas>
          </div>
        </div>
      </div>`;
  }

  /**
   * Create the overview statistics row
   *
   * @returns The html for the statistics row
   */
  createOverviewStatistics() {
    return `
      <div class="container-fluid px-0 mt-4">${this.createUserStats()}</div>
      <div class="container-fluid px-0 mt-4">${this.createSessionStats()}</div>`;
  }

  /**
   * Create the user statistics
   *
    * @returns The html for the user statistics
   */
  createUserStats() {
    const userStatsTitle = `
      <div class="col text-lg-left text-sm-center">
        <h3>${XAPI_DASHBOARD_USERSTATS}</h3>
      </div>`;

    return `
      <div class="row">
        ${userStatsTitle}
      </div>
      <div class="row">
        ${this.widgetNumberOfUsers()}
        ${this.widgetNumberOfUsersCompleted()}
        ${this.widgetAverageUsersCompleted()}
        ${this.widgetNumberOfUsersPassed()}
        ${this.widgetUserScore()}
      </div>
    `;
  }

  /**
   * Create the number of users widget
   *
   * @returns The html for the number of users widget
   */
  widgetNumberOfUsers() {
    return Overview.makeColumnDiv(XAPI_DASHBOARD_NUMBER_OF_STUDENTS, this.#state.users.length);
  }

  /**
   * Create the number of users completed widget
   *
   * @returns The html for the number of users completed widget
   */
  widgetNumberOfUsersCompleted() {
    const numberCompleted = this.#state.users.reduce(
      (acc, user) => acc + (user.attempts[0].completedStatus === 'completed'
        ? 1
        : 0),
      0
    );

    return Overview.makeColumnDiv(XAPI_DASHBOARD_COMPLETED_USERS, numberCompleted);
  }

  /**
   * Create the average completed user widget
   *
   * @returns The html for the average completed user widget
   */
  widgetAverageUsersCompleted() {
    // If there are no users, return 0, otherwise the average the completion of
    // the attempts of the users
    const averageCompletion = this.#state.users.length <= 0
      ? 0
      : this.#state.users.reduce(
        (acc, user) => acc + user.attempts[0].completedPercentage, 0
      ) / this.#state.users.length;

    return Overview.makeColumnDiv(XAPI_DASHBOARD_AVERAGE_USER_COMPLETION, `${averageCompletion.toFixed(1)}%`);
  }

  /**
   * Create the number of users passed widget
   *
   * @returns The html for the number of users passed widget
   */
  widgetNumberOfUsersPassed() {
    const numberPassed = this.#state.users.reduce(
      (acc, user) => acc + (user.attempts[0].successStatus === 'passed'
        ? 1
        : 0),
      0
    );

    return Overview.makeColumnDiv(XAPI_DASHBOARD_NUMBER_USERS_PASSED, numberPassed);
  }

  /**
   * Create the user score widget
   *
   * @returns The html for the user score widget
   */
  widgetUserScore() {
    // If there are no users, return 0, otherwise the average the score of
    // the of the users
    const averageScore = this.#state.users.length <= 0
      ? 0
      : this.#state.users.reduce(
        (acc, user) => acc + user.attempts[0].score, 0
      ) / this.#state.users.length;

    return Overview.makeColumnDiv(XAPI_DASHBOARD_AVERAGE_USER_SCORE, (averageScore / 10).toFixed(1));
  }

  /**
   * Create the session statistics
   *
   * @returns The html for the session statistics
   */
  createSessionStats() {
    const sessionStatsTitle = `
      <div class="col text-lg-left text-sm-center">
        <h3>${XAPI_DASHBOARD_SESSIONSTATS}</h3>
      </div>`;

    return `
      <div class="row">
        ${sessionStatsTitle}
      </div>
      <div class="row">
        ${this.widgetNumberOfSessions()}
        ${this.widgetNumberOfCompletedSessions()}
        ${this.widgetAverageSessionsCompleted()}
        ${this.widgetNumberOfSessionsPassed()}
        ${this.widgetSessionScore()}
      </div>`;
  }

  /**
   * Create the number of sessions widget
   *
   * @returns The html for the number of sessions widget
   */
  widgetNumberOfSessions() {
    const numberOfSessions = this.#state.users.reduce(
      (acc, user) => acc + user.attempts.length,
      0
    )

    return Overview.makeColumnDiv(XAPI_DASHBOARD_NUMBER_OF_SESSIONS, numberOfSessions);
  }

  /**
   * Create the number of sessions completed widget
   *
   * @returns The html for the number of sessions completed widget
   */
  widgetNumberOfCompletedSessions() {
    const numberCompleted = this.#state.users.reduce(
      (acc, user) => acc + user.attempts.reduce(
        (acc2, attempt) => acc2 + (attempt.completedStatus === 'completed'
          ? 1
          : 0),
        0
      ),
      0
    );

    return Overview.makeColumnDiv(XAPI_DASHBOARD_COMPLETED_SESSIONS, numberCompleted);
  }

  /**
   * Create the average completed sessions widget
   *
   * @returns The html for the average completed sessions widget
   */
  widgetAverageSessionsCompleted() {
    // If there are no sessions, return 0, otherwise the average the completion of
    // the attempts of the sessions
    const averageCompletion = this.#state.users.length <= 0
      ? 0
      : this.#state.users.reduce(
        (acc, user) => acc + user.attempts.reduce(
          (acc2, attempt) => acc2 + attempt.completedPercentage, 0
        ) / user.attempts.length,
        0
      ) / this.#state.users.length;

    return Overview.makeColumnDiv(XAPI_DASHBOARD_AVERAGE_SESSION_COMPLETION, `${averageCompletion.toFixed(1)}%`);
  }

  /**
   * Create the number of sessions passed widget
   *
   * @returns The html for the number of sessions passed widget
   */
  widgetNumberOfSessionsPassed() {
    const numberPassed = this.#state.users.reduce(
      (acc, user) => acc + user.attempts.reduce(
        (acc2, attempt) => acc2 + (attempt.successStatus === 'passed'
          ? 1
          : 0),
        0
      ),
      0
    );

    return Overview.makeColumnDiv(XAPI_DASHBOARD_NUMBER_SESSIONS_PASSED, numberPassed);
  }

  /**
   * Create the session score widget
   *
   * @returns The html for the session score widget
   */
  widgetSessionScore() {
    // If there are no sessions, return 0, otherwise the average the score of
    // the of the sessions
    const averageScore = this.#state.users.length <= 0
      ? 0
      : this.#state.users.reduce(
        (acc, user) => acc + user.attempts.reduce(
          (acc2, attempt) => acc2 + attempt.score, 0
        ) / user.attempts.length,
        0
      ) / this.#state.users.length;

    return Overview.makeColumnDiv(XAPI_DASHBOARD_AVERAGE_SESSION_SCORE, (averageScore / 10).toFixed(1));
  }
}
