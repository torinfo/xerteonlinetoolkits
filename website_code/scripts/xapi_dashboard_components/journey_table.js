import { escapeHtml, escapeHtmlAttr } from './utils/escape.js';

export class JourneyTable {
  /** A cross icon */
  #faCross = '<i class="status fa fa-x-cross" />';

  /** A in progress clock icon */
  #faInProgress = '<i class="status fa fa-x-inprogress" />';

  /** A minus icon */
  #faMinus = '<i class="status fa fa-minus" />';

  /** A tick icon */
  #faTick = '<i class="status fa fa-x-tick" />';

  /** The canvas to draw on */
  #canvas;

  /** The dashboard */
  #dashboard;

  /** Cache of InteractionModal instances, keyed by interaction URL */
  #modalCache = new Map();

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
    this.setupModalHandlers();
  }

  /**
   * Register click handlers on each interaction / sub-interaction name span.
   * No modals are created here — only lightweight click handlers.
   */
  setupModalHandlers() {
    this.#state.interactions.forEach((interaction) => {
      const selector = $.escapeSelector(interaction.url);

      $(`#journey-name-${selector}`).on('click', async () => {
        await this.openInteractionModal(interaction, false);
      });

      interaction.subInteractions.forEach((subInteraction) => {
        const subSelector = $.escapeSelector(subInteraction.url);

        $(`#journey-name-sub-${subSelector}`).on('click', async () => {
          await this.openInteractionModal(subInteraction, true);
        });
      });
    });
  }

  /**
   * Lazy-create (and cache) an InteractionModal for the given item, then show it.
   *
   * @param {Object} item - The interaction or sub-interaction object.
   * @param {boolean} isSub - Whether this is a sub-interaction.
   */
  async openInteractionModal(item, isSub) {
    if (!this.#modalCache.has(item.url)) {
      const { InteractionModal } = await import('./interaction_modal.js');
      const selector = $.escapeSelector(item.url);
      const modalId = isSub
        ? `journey-modal-sub-${selector}`
        : `journey-modal-${selector}`;

      const modal = new InteractionModal(
        this.#dashboard,
        this.#state,
        modalId,
        null,
        item.name,
        isSub ? { singleSubInteraction: item } : { singleInteraction: item },
      );
      await modal.init();
      this.#modalCache.set(item.url, { modal, modalId });
    }

    const { modal, modalId } = this.#modalCache.get(item.url);

    // Explicitly clear before repopulating to avoid a race condition where
    // rapid open/close causes the hidden.bs.modal handler to fire after we
    // have already added new content, leaving the modal blank.
    $(`#${modalId} .modal-header`).empty();
    $(`#${modalId} .modal-body`).empty();

    modal.addModalHeader();
    await modal.addModalBody();

    $(`#${modalId}`).modal('show');
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
    const isNonAnonymous = this.#dashboard.data.info.dashboard.enable_nonanonymous
      && $('#dp-unanonymous-view').prop('checked');

    const header = this.createJourneyTableHeader(isNonAnonymous);
    const rows = this.#state.users.map(
      (user) => this.createJourneyTableRow(user, isNonAnonymous),
    );

    return `
      <table class="table table-sm table-hover table-bordered table-responsive border-0">
        ${header}
        ${rows.join('')}
      </table>`;
  }

  /**
   * Create a header row for the journey table
   *
   * @returns The html for the header row
   */
  createJourneyTableHeader(isNonAnonymous) {
    const name = isNonAnonymous
      ? `<th class="text-center align-middle font-weight-normal small">${XAPI_DASHBOARD_USERS}</th>`
      : '';
    const completed = `<th class="text-center align-middle font-weight-normal small">${XAPI_DASHBOARD_COMPLETED}</th>`;
    const completion = `<th class="text-center align-middle font-weight-normal small">${XAPI_DASHBOARD_COMPLETION}</th>`;
    const score = `<th class="text-center align-middle font-weight-normal small">${XAPI_DASHBOARD_SCORE}</th>`;
    const passed = `<th class="text-center align-middle font-weight-normal small">${XAPI_DASHBOARD_PASSED}</th>`;
    const start = `<th class="text-center align-middle font-weight-normal small">${XAPI_DASHBOARD_STARTCOL}</th>`;
    const duration = `<th class="text-center align-middle font-weight-normal small">${XAPI_DASHBOARD_DURATIONCOL}</th>`;

    const interactions = this.#state.interactions.map(
      (interaction) => {
        const selector = $.escapeSelector(interaction.url);
        const subInteractionHeaders = interaction.subInteractions.map(
          (subInteraction) => {
            const subSelector = $.escapeSelector(subInteraction.url);
            return `
              <th
                class="journey-sub-${selector} text-center align-middle font-weight-normal small"
                style="display: none;"
              >
                <span
                  id="journey-name-sub-${subSelector}"
                  style="cursor: pointer; text-decoration: underline;"
                >
                  ${escapeHtml(subInteraction.name)}
                </span>
              </th>`;
          }
        )
        $(document).off(`click.journey-${selector}`);
        $(document).on(`click.journey-${selector}`, `#journey-${selector}-icon`, () => {
          $(`.journey-sub-${selector}`).toggle();
          $(`#journey-${selector}-icon`).toggleClass('fa-angles-left').toggleClass('fa-angles-right');
        });
        return `
          <th id="journey-${selector}" class="text-center align-middle font-weight-normal small">
            <span
              id="journey-name-${selector}"
              style="cursor: pointer; text-decoration: underline;"
            >
              ${escapeHtml(interaction.name)}
            </span>
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
          ${name}
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
  createJourneyTableRow(user, isNonAnonymous) {
    if (!user.attempts.length) {
      return '';
    }

    const attempt = user.attempts[0];

    const nameParts = [user.displayName, user.attemptKeys[0]].filter(Boolean);
    const name = isNonAnonymous
      ? `<td class="text-left align-middle small">${escapeHtml(nameParts.join(' '))}</td>`
      : '';
    const completed = `<td class="text-center align-middle small">${this.createJourneyTableCompletedTick(attempt)}</td>`;
    const completion = `<td class="text-center align-middle small">${attempt.completedPercentage !== undefined ? `${Math.round(attempt.completedPercentage)}%` : this.#faMinus
      }</td>`;
    const score = `<td class="text-center align-middle small">${attempt.score !== undefined ? `${Math.round(attempt.score)}%` : this.#faMinus
      }</td>`;
    const passed = `<td class="text-center align-middle small">${this.createJourneyTablePassedTick(attempt)}</td>`;
    const start = `<td class="text-center align-middle small">${this.#dashboard.formatStart(attempt.start)}</td>`;
    const duration = `<td class="text-center align-middle small">${this.#dashboard.formatDuration(attempt.duration)}</td>`;
    const interactions = this.createJourneyTableInteractionColumns(user.interactions);

    return `
      <tr class="session-row">
        ${name}
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
      title="${escapeHtmlAttr(interaction.name)}"
      data-content="${escapeHtmlAttr(this.createDataPopoverDiv(interaction))}"
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
    } else if (interaction.completedStatus === 'incomplete') {
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
        <td class="text-center align-middle small">
          ${block}
        </td>
        ${subBlocks.map((subBlock) => {
        return `
          <td
            class="journey-sub-${selector} text-center align-middle small"
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
    let popoverStatus;

    if (interaction.successStatus === 'passed') {
      popoverStatus = XAPI_DASHBOARD_STATUS_COMPLETED_PASSED;
    } else if (interaction.successStatus === 'failed') {
      popoverStatus = XAPI_DASHBOARD_STATUS_COMPLETED_NOTPASSED;
    } else if (interaction.completedStatus === 'incomplete') {
      popoverStatus = XAPI_DASHBOARD_STATUS_STARTED_NOTCOMPLETED;
    } else {
      popoverStatus = XAPI_DASHBOARD_STATUS_NOTSTARTED;
    }

    const interactionScore = interaction.getScore(this.#state.statements);
    return `
      <div>
        ${XAPI_JOURNEY_POPOVER_STATUS} ${popoverStatus}<br />
        ${XAPI_JOURNEY_POPOVER_NRTRIES} ${interaction.getInitializations(this.#state.statements)}<br />
        ${XAPI_JOURNEY_POPOVER_GRADE} ${interactionScore !== undefined
        ? `${(interactionScore * 100).toFixed(2)}%`
        : this.#faMinus
      }<br />
        ${XAPI_JOURNEY_POPOVER_DURATION} ${interaction.getDuration(this.#state.statements)}<br />
        ${XAPI_JOURNEY_POPOVER_AVGGRADE}
      </div>`;
  }
}
