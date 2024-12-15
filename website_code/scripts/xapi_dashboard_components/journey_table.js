export class JourneyTable {
  /** A tick icon */
  #faCross = '<i class="status fa fa-x-cross" />';

  /** A in progress clock icon */
  #faInProgress = '<i class="status fa fa-x-inprogress" />';

  /** A minus icon */
  #faMinus = '<i class="status fa fa-minus" />';

  /** A cross icon */
  #faTick = '<i class="status fa fa-x-tick" />';

  /** The canvas to draw on */
  #canvas;

  /** The dashboard */
  #dashboard;

  /** The dashboard state */
  #state;

  /**
  *
  * @param canvas - The html element to draw on
  * @param dashboard - The dashboard
  * @param state - The dashboard state
  */
  constructor(canvas, dashboard, state) {
    this.#canvas = canvas;
    this.#dashboard = dashboard;
    this.#state = state;
  }

  async init() {
    this.createJourneyTableContainer();
  }

  /**
   * Create the journey table container
   */
  createJourneyTableContainer() {
    const row = `
      <div class="row">
        <div class="col-12">
          <div class="bg-white rounded p-2">
            <div class="row mb-2">
              ${this.createPagingHeader()}
            </div>
            <div class="row">
              <div class="col-12">
                ${this.createJourneyTable()}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    this.#canvas.append(row);
  }

  /**
   * Create the paging header
   *
   * @returns The html for the paging header
   */
   createPagingHeader() {
     return `
      <div class="col-4">
        ${this.createPagingPrevButton()}
      </div>
      <div class="col-4 text-center align-content-center">
        page 1 of 1
      </div>
      <div class="col-4 text-right">
        ${this.createPagingNextButton()}
      </div>`;
   }

  /**
   * Create the paging prev button
   *
   * @returns The html for the prev button
   */
  createPagingPrevButton() {
    return `
      <button class='xerte_button_c_no_width mx-0 border-0' id='pageButtonLeft'>
        ${XAPI_DASHBOARD_PAGE_PREV}
      </button>`;
  }

  /**
   * Create the paging next button
   *
   * @returns The html for the next button
   */
  createPagingNextButton() {
    return `
      <button class='xerte_button_c_no_width mx-0 border-0' id='pageButtonRight'>
        ${XAPI_DASHBOARD_PAGE_NEXT}
      </button>`;
  }

  /**
   * Create the journey table
   *
   * @returns The html for the table
   */
  createJourneyTable() {
    const header = this.createJourneyTableHeader();
    const rows = this.#state.users.map(
      (user) => this.createJourneyTableRow(user),
    );

    return `
      <table class="table table-hover table-bordered table-responsive border-0">
        ${header}
        ${rows.join('')}
      </table>`;
  }

  /**
   * Create a header row for the journey table
   *
   * @returns The html for the header row
   */
  createJourneyTableHeader() {
    const completed = `<th>${XAPI_DASHBOARD_COMPLETED}</th>`;
    const completion = `<th>${XAPI_DASHBOARD_COMPLETION}</th>`;
    const score = `<th>${XAPI_DASHBOARD_SCORE}</th>`;
    const passed = `<th>${XAPI_DASHBOARD_PASSED}</th>`;
    const start = `<th>${XAPI_DASHBOARD_STARTCOL}</th>`;
    const duration = `<th>${XAPI_DASHBOARD_DURATIONCOL}</th>`;

    const interactions = this.#state.interactions.map(
      (interaction) => {
        const selector = $.escapeSelector(interaction.url);
        const subInteractionHeaders = interaction.subInteractions.map(
          (subInteraction) => `
            <th
              class="journey-sub-${selector}"
              style="display: none;"
            >
              ${subInteraction.name}
            </th>`
        )
        $(document).on('click', `#journey-${selector}`, () => {
          $(`.journey-sub-${selector}`).toggle();
          $(`#joruney-${selector}-icon`).hasClass('fa-angles-right')
            ? $(`#journey-${selector}-icon`).toggleClass('fa-angles-down')
            : $(`#journey-${selector}-icon`).toggleClass('fa-angles-left');
        });
        return `
          <th id="journey-${selector}">
            ${interaction.name}
            <i
              id="journey-${selector}-icon"
              class="fa-solid fa-angles-right"
              style="cursor: pointer;"
            ></i>
          </th>
          ${subInteractionHeaders.join('')}`;
      }
    );

    return `
      <thead>
        <tr>
          ${completed}
          ${completion}
          ${score}
          ${passed}
          ${start}
          ${duration}
          ${interactions.join('')}
        </tr>
      </thead>`;
  }

  /**
   * Create a row for the journey table
   *
   * @param user - The user to create a row for
   * @returns The html for the row
   */
  createJourneyTableRow(user) {
    const attempt = user.attempts[0];

    const completed = `<td>${this.createJourneyTableCompletedTick(attempt)}</td>`;
    const completion = `<td>${Math.round(attempt.completedPercentage)}%</td>`;
    const score = `<td>${Math.round(attempt.score)}%</td>`;
    const passed = `<td>${this.createJourneyTablePassedTick(attempt)}</td>`;
    const start = `<td>${this.#dashboard.formatStart(attempt.start)}</td>`;
    const duration = `<td>${this.#dashboard.formatDuration(attempt.duration)}</td>`;
    const interactions = this.createJourneyTableInteractionColumns(user.interactions);

    return `
      <tr class="session-row">
        ${completed}
        ${completion}
        ${score}
        ${passed}
        ${start}
        ${duration}
        ${interactions.join('')}
      </tr>`;
  }

  /**
   * Create a completed tick for the journey table based on an attempt
   *
   * @param attempt - The attempt to create a completion tick for
   * @returns The html for the completion status icon
   */
  createJourneyTableCompletedTick(attempt) {
    if (attempt.completedStatus === 'completed') {
      return this.#faTick;
    }

    if (attempt.completedStatus === 'incomplete') {
      return this.#faInProgress;
    }

    return this.#faMinus;
  }

  /**
   * Create a passed tick for the journey table based on an attempt
   *
   * @param attempt - The attempt to create a completion tick for
   * @returns The html for the passed status icon
   */
  createJourneyTablePassedTick(attempt) {
    if (attempt.successStatus === 'passed') {
      return this.#faTick;
    }

    if (attempt.successStatus === 'failed') {
      return this.#faCross;
    }

    return this.#faMinus;
  }

  /**
   * Create interaction completion block for the journey table
   *
   * @param interaction - The interaction to create a block for
   * @returns The html for the completion block (red/green/orange/grey)
   */
  createJourneyTableInteractionCompletionBlock(interaction) {
    const popoverContent = `
      title="${interaction.name}"
      data-content="${this.createDataPopoverDiv(interaction)}"
      data-toggle="popover"
      data-trigger="hover"
      data-html="true"
      `;
    const redDiv = `<i class="status-indicator status-red fa fa-square" ${popoverContent}></i>`;
    const greenDiv = `<i class="status-indicator status-green fa fa-square" ${popoverContent}></i>`;
    const orangeDiv = `<i class="status-indicator status-orange fa fa-square" ${popoverContent}></i>`;
    const greyDiv = `<i class="status-indicator status-gray fa fa-square" ${popoverContent}></i>`;

    if (interaction.successStatus === 'passed') {
      // Successfully completed
      return greenDiv;
    } else if (interaction.successStatus === 'failed') {
      // Unsuccessfully completed
      return redDiv;
    } else if (interaction.successStatus === 'incomplete') {
      // Started, but not completed
      return orangeDiv;
    }
    // Not started
    return greyDiv;
  }

  /**
   * Create interaction columns for the journey table
   *
   * @param interactions - The interactions to create columns for
   * @returns The html for the columns
   */
  createJourneyTableInteractionColumns(interactions) {
    return interactions.map((interaction) => {
      const selector = $.escapeSelector(interaction.url);
      const block = this.createJourneyTableInteractionCompletionBlock(interaction);
      const subBlocks = interaction.subInteractions.flatMap((subInteraction) => {
        return this.createJourneyTableInteractionCompletionBlock(subInteraction);
      });

      return `
        <td>
          ${block}
        </td>
        ${subBlocks.map((subBlock) => {
          return `
            <td
              class="journey-sub-${selector}"
              style="display: none; background: #f4f4f4"
            >
              ${subBlock}
            </td>
          `;
        }).join('')}
        `;
    });
  }

  /**
   * Create the data popover div
   *
   * @param interaction - The interaction to create a popover for
   * @returns The html for the data popover div
   */
  createDataPopoverDiv(interaction) {
    let popoverStatus = '';

    switch(interaction.successStatus) {
      case 'passed':
        popoverStatus = XAPI_DASHBOARD_STATUS_COMPLETED_PASSED;
        break;
      case 'failed':
        popoverStatus = XAPI_DASHBOARD_STATUS_COMPLETED_NOTPASSED;
        break;
      case 'incomplete':
        popoverStatus = XAPI_DASHBOARD_STATUS_STARTED_NOTCOMPLETED;
        break;
      default:
        popoverStatus = XAPI_DASHBOARD_STATUS_NOTSTARTED;
    }

    return `
      <div>
        ${XAPI_JOURNEY_POPOVER_STATUS} ${popoverStatus}<br />
        ${XAPI_JOURNEY_POPOVER_NRTRIES} ${interaction.getInitializations(this.#state.statements)}<br />
        ${XAPI_JOURNEY_POPOVER_GRADE} ${(interaction.getScore(this.#state.statements) * 100).toFixed(2)}%<br />
        ${XAPI_JOURNEY_POPOVER_DURATION} ${interaction.getDuration(this.#state.statements)}<br />
        ${XAPI_JOURNEY_POPOVER_AVGGRADE}
      </div>`;
  }
}
