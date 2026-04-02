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

  /** Cached DOM references for pagination (set in init) */
  #$pageInfo;

  #$pageLeft;

  #$pageRight;

  #$rows;

  /** Zero-based current page index */
  #pageIndex = 0;

  /** Number of users per page (-1 means all) */
  #pageSize = 5;

  /** Cached reference to the cloned table element inside .jt-sticky-header */
  #clonedTable = null;

  /** Pending requestAnimationFrame ID for sticky header check */
  #stickyRaf = null;

  /** Cached reference to the original thead element */
  #thead = null;

  /** Cached reference to the vertical scroll root (#journeyData) */
  #scrollRoot = null;

  /** Bound scroll handler for vertical sticky header toggle */
  #verticalScrollHandler = null;

  /** Pending requestAnimationFrame ID for scroll sync */
  #scrollRaf = null;

  /** Cached reference to the .jt-scroll-wrapper element */
  #scrollWrapper = null;

  /** jQuery reference to the .jt-sticky-header container */
  #$stickyHeader = null;

  /** Bound resize handler for sticky clone refresh */
  #resizeHandler = null;

  /** Bound scroll handler for horizontal sync */
  #scrollHandler = null;

  /** Left scroll arrow button */
  #btnScrollLeft = null;

  /** Right scroll arrow button */
  #btnScrollRight = null;

  /** Cached visibility state for left scroll button */
  #scrollLeftVisible = false;

  /** Cached visibility state for right scroll button */
  #scrollRightVisible = false;

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

    const displayOptions = JSON.parse(
      dashboard.data.info.dashboard.display_options || '{}',
    );
    if (displayOptions.pageSize !== undefined) {
      this.#pageSize = displayOptions.pageSize;
    }
  }

  async init() {
    this.createJourneyTableContainer();
    this.#$pageInfo = $('#jt-page-info');
    this.#$pageLeft = $('#jt-page-left');
    this.#$pageRight = $('#jt-page-right');
    this.#$rows = $('#jt-body .session-row.summary');
    this.setupModalHandlers();
    this.#setupPaginationHandlers();
    this.#setupAttemptToggleHandlers();
    this.#applyInitialColumnVisibility();
    this.#updatePagination();
    this.#setupStickyHeader();
    this.#setupScrollButtons();
    $(document).off('dashboard:pageSizeChanged.journeyTable')
      .on('dashboard:pageSizeChanged.journeyTable', (e, newPageSize) => {
        this.updatePageSize(newPageSize);
      });
  }

  /**
   * Update the page size and reset to the first page.
   *
   * @param {number} newPageSize - The new page size (-1 means all)
   */
  updatePageSize(newPageSize) {
    this.#pageSize = newPageSize;
    this.#pageIndex = 0;
    this.#updatePagination();
  }

  /**
   * Apply initial column visibility from saved display options.
   * Hides columns whose URL is recorded as visible=false in display_options.columns.
   */
  #applyInitialColumnVisibility() {
    let displayOptions;
    try {
      displayOptions = JSON.parse(
        this.#dashboard.data.info.dashboard.display_options || '{}',
      );
    } catch (e) {
      return;
    }
    if (!displayOptions.columns || typeof displayOptions.columns !== 'object') return;

    const hiddenSelectors = [];
    Object.entries(displayOptions.columns).forEach(([url, visible]) => {
      if (visible !== false) return;
      const header = $(`.jt-table th[data-interaction-url="${CSS.escape(url)}"]`);
      if (!header.length) return;
      const colIndex = header.index() + 1;
      hiddenSelectors.push(
        `.jt-table td:nth-child(${colIndex})`,
        `.jt-table th:nth-child(${colIndex})`,
      );
    });
    if (hiddenSelectors.length > 0) {
      $(hiddenSelectors.join(',')).hide();
    }
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
          <div class="bg-white rounded p-2 jt-table-container">
            <div class="row mb-2">
              ${this.createPagingHeader()}
            </div>
            <div class="jt-sticky-header"></div>
            <div class="jt-scroll-wrapper">
              ${this.createJourneyTable()}
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
      <div class="col-3">
        ${this.createPagingPrevButton()}
      </div>
      <div class="col-6 text-center align-content-center">
        <span id="jt-page-info"></span>
      </div>
      <div class="col-3 text-right">
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
      <button class='xerte_button_c_no_width mx-0 border-0' id='jt-page-left'>
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
      <button class='xerte_button_c_no_width mx-0 border-0' id='jt-page-right'>
        ${XAPI_DASHBOARD_PAGE_NEXT}
      </button>`;
  }

  /**
   * Returns the list of users that have at least one attempt.
   *
   * @returns {Array} Filtered user array
   */
  #getFilteredUsers() {
    return this.#state.users.filter((user) => user.attempts.length > 0);
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
    const filteredUsers = this.#getFilteredUsers();
    const rows = filteredUsers.map(
      (user, rowIndex) => this.createJourneyTableRow(user, isNonAnonymous, rowIndex),
    );

    return `
      <table class="table table-sm table-hover table-bordered jt-table border-0">
        ${header}
        <tbody id="jt-body">
          ${rows.join('')}
        </tbody>
      </table>`;
  }

  /**
   * Create a header row for the journey table
   *
   * @returns The html for the header row
   */
  createJourneyTableHeader(isNonAnonymous) {
    const caret = '<th class="jt-caret-col"></th>';
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
        );
        $(document).off(`click.journey-${selector}`);
        $(document).on(`click.journey-${selector}`, `#journey-${selector}-icon`, () => {
          $(`.journey-sub-${selector}`).toggle();
          $(`#journey-${selector}-icon`).toggleClass('fa-angles-left').toggleClass('fa-angles-right');
          this.#refreshStickyClone();
        });
        return `
          <th id="journey-${selector}" data-interaction-url="${escapeHtmlAttr(interaction.url)}" class="text-center align-middle font-weight-normal small">
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
          ${caret}
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
   * @param {boolean} isNonAnonymous - Whether to show user names
   * @param {number} rowIndex - The zero-based row index
   * @returns The html for the row
   */
  createJourneyTableRow(user, isNonAnonymous, rowIndex) {
    const attempt = user.bestAttempt || user.attempts[0];
    if (!attempt) return '';

    const caretCell = user.attempts.length > 1
      ? `<td class="text-center align-middle small">
          <button class="btn btn-link p-0 jt-caret" aria-expanded="false">
            <i class="jt-caret-icon fa-solid fa-caret-right"></i>
          </button>
        </td>`
      : '<td></td>';

    const nameParts = [user.displayName, user.ifi.identifier || user.attemptKeys[0]]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);
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
      <tr class="session-row summary" data-index="${rowIndex}">
        ${caretCell}
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
   * Create attempt rows for all attempts of a user, used for expand/collapse.
   *
   * @param {Object} user - The user object
   * @param {boolean} isNonAnonymous - Whether to show user names
   * @param {number} rowIndex - The zero-based row index matching the summary row
   * @returns {string} HTML string of all attempt <tr> elements
   */
  #createAttemptRows(user, isNonAnonymous, rowIndex) {
    return user.attempts.map((attempt, i) => {
      const isBest = attempt.key === user.bestAttempt.key;
      const rowClass = `attempt-row${isBest ? ' used-attempt' : ''}`;
      const nameCell = isNonAnonymous ? '<td></td>' : '';
      const completed = `<td class="text-center align-middle small">${this.createJourneyTableCompletedTick(attempt)}</td>`;
      const completion = `<td class="text-center align-middle small">${attempt.completedPercentage !== undefined ? `${Math.round(attempt.completedPercentage)}%` : this.#faMinus}</td>`;
      const score = `<td class="text-center align-middle small">${attempt.score !== undefined ? `${Math.round(attempt.score)}%` : this.#faMinus}</td>`;
      const passed = `<td class="text-center align-middle small">${this.createJourneyTablePassedTick(attempt)}</td>`;
      const start = `<td class="text-center align-middle small">${this.#dashboard.formatStart(attempt.start)}</td>`;
      const duration = `<td class="text-center align-middle small">${this.#dashboard.formatDuration(attempt.duration)}</td>`;
      const interactionCols = this.#createAttemptInteractionColumns(user, attempt);

      return `
        <tr
          class="${rowClass}"
          data-index="${rowIndex}"
          data-attempt-key="${escapeHtmlAttr(attempt.key)}"
        >
          <td></td>
          ${nameCell}
          ${completed}
          ${completion}
          ${score}
          ${passed}
          ${start}
          ${duration}
          ${interactionCols.join('')}
        </tr>`;
    }).join('');
  }

  /**
   * Deep-copy user interactions, filter to only statements from the given attempt,
   * and return the rendered interaction column cells.
   *
   * @param {Object} user - The user object
   * @param {Object} attempt - The attempt object
   * @returns {string[]} Array of HTML strings for each interaction column cell
   */
  #createAttemptInteractionColumns(user, attempt) {
    const filtered = user.interactions.map((interaction) => {
      const clone = interaction.deepCopy();
      clone.updateInteraction(attempt.statementIdxs, this.#state.statements);
      clone.subInteractions.forEach((sub) => {
        sub.updateInteraction(attempt.statementIdxs, this.#state.statements);
      });
      return clone;
    });
    return this.createJourneyTableInteractionColumns(filtered);
  }

  /**
   * Set up event delegation on #jt-body for caret button clicks,
   * enabling lazy-loaded expand/collapse of attempt rows.
   */
  #setupAttemptToggleHandlers() {
    $('#jt-body').on('click', '.jt-caret', (e) => {
      const $btn = $(e.currentTarget);
      const $summary = $btn.closest('.session-row.summary');
      const index = Number($summary.data('index'));
      if (!Number.isFinite(index)) return;
      const $caret = $btn.find('.jt-caret-icon');

      // Lazy-create attempt rows on first expand
      let $attemptRows = $(`#jt-body .attempt-row[data-index="${index}"]`);
      if ($attemptRows.length === 0) {
        const isNonAnonymous = this.#dashboard.data.info.dashboard.enable_nonanonymous
          && $('#dp-unanonymous-view').prop('checked');
        const user = this.#getFilteredUsers()[index];
        const html = this.#createAttemptRows(user, isNonAnonymous, index);
        $summary.after(html);
        $attemptRows = $(`#jt-body .attempt-row[data-index="${index}"]`);
        // Initialize popovers on new rows
        $attemptRows.find('[data-toggle="popover"]').popover();
      }

      // Toggle expanded state
      const expanding = !$attemptRows.first().hasClass('expanded');
      $attemptRows.toggleClass('expanded');
      $caret.toggleClass('fa-caret-right fa-caret-down');
      $btn.attr('aria-expanded', expanding ? 'true' : 'false');

      // Refresh sticky header clone (column widths may change)
      this.#refreshStickyClone();
    });
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

  /**
   * @returns The count of users that have at least one attempt
   */
  #getFilteredUserCount() {
    return this.#$rows.length;
  }

  /**
   * @param {number} filteredCount - The number of filtered users
   * @returns The effective page size (user count when "All" is selected)
   */
  #getEffectivePageSize(filteredCount) {
    if (this.#pageSize === -1) {
      return filteredCount || 1;
    }
    return this.#pageSize;
  }

  /**
   * @param {number} filteredCount - The number of filtered users
   * @returns The maximum number of pages
   */
  #getMaxPage(filteredCount) {
    const effectiveSize = this.#getEffectivePageSize(filteredCount);
    return Math.max(1, Math.ceil(filteredCount / effectiveSize));
  }

  /**
   * Update pagination: show/hide rows, update page info, enable/disable buttons
   */
  #updatePagination() {
    const filteredCount = this.#getFilteredUserCount();
    const effectiveSize = this.#getEffectivePageSize(filteredCount);
    const maxPage = this.#getMaxPage(filteredCount);

    if (this.#pageIndex >= maxPage) {
      this.#pageIndex = Math.max(0, maxPage - 1);
    }

    const from = this.#pageIndex * effectiveSize;
    const to = from + effectiveSize;

    this.#$rows.each((idx, row) => {
      if (idx >= from && idx < to) {
        row.classList.remove('hide');
      } else {
        row.classList.add('hide');
      }
    });

    let pageInfo = XAPI_DASHBOARD_PAGE_OF_PAGE;
    pageInfo = pageInfo.replace('{i}', this.#pageIndex + 1);
    pageInfo = pageInfo.replace('{n}', maxPage);
    this.#$pageInfo.text(pageInfo);

    if (this.#pageIndex <= 0) {
      this.#$pageLeft.prop('disabled', true).addClass('disabled');
    } else {
      this.#$pageLeft.prop('disabled', false).removeClass('disabled');
    }
    if (this.#pageIndex >= maxPage - 1) {
      this.#$pageRight.prop('disabled', true).addClass('disabled');
    } else {
      this.#$pageRight.prop('disabled', false).removeClass('disabled');
    }

    // Collapse all expanded attempt rows and reset carets
    $('#jt-body .attempt-row.expanded').removeClass('expanded');
    $('#jt-body .jt-caret-icon').removeClass('fa-caret-down').addClass('fa-caret-right');
    $('#jt-body .jt-caret').attr('aria-expanded', 'false');

    // Sync attempt row visibility with their parent summary row
    this.#$rows.each((_, row) => {
      const rowIndex = $(row).data('index');
      const hidden = row.classList.contains('hide');
      $(`#jt-body .attempt-row[data-index="${rowIndex}"]`).toggleClass('hide', hidden);
    });

    this.#updateScrollButtons();
  }

  /**
   * Set up click handlers for pagination buttons and page size select
   */
  #setupPaginationHandlers() {
    this.#$pageLeft.on('click', () => {
      this.#pageIndex -= 1;
      this.#updatePagination();
    });

    this.#$pageRight.on('click', () => {
      this.#pageIndex += 1;
      this.#updatePagination();
    });

  }

  /**
   * Set up the sticky header clone that appears when the original
   * thead scrolls out of view in #journeyData.
   */
  #setupStickyHeader() {
    this.#$stickyHeader = this.#canvas.find('.jt-sticky-header');
    this.#scrollWrapper = this.#canvas[0].querySelector('.jt-scroll-wrapper');
    const thead = this.#canvas[0].querySelector('.jt-table thead');
    const scrollRoot = document.querySelector('#journeyData');

    if (!this.#scrollWrapper || !thead || !scrollRoot) return;

    this.#thead = thead;
    this.#scrollRoot = scrollRoot;

    this.#verticalScrollHandler = () => {
      if (!this.#stickyRaf) {
        this.#stickyRaf = requestAnimationFrame(() => {
          this.#checkStickyVisibility();
          this.#stickyRaf = null;
        });
      }
    };
    scrollRoot.addEventListener('scroll', this.#verticalScrollHandler, { passive: true });

    this.#scrollHandler = () => {
      if (!this.#scrollRaf) {
        this.#scrollRaf = requestAnimationFrame(() => {
          this.#syncStickyScroll();
          this.#updateScrollButtons();
          this.#scrollRaf = null;
        });
      }
    };
    this.#scrollWrapper.addEventListener('scroll', this.#scrollHandler, { passive: true });

    let resizeTimer = null;
    this.#resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.#refreshStickyClone();
        this.#updateScrollButtons();
      }, 150);
    };
    window.addEventListener('resize', this.#resizeHandler, { passive: true });
  }

  /**
   * Check whether the original thead has started scrolling out of the scroll
   * root and toggle the sticky clone accordingly.
   */
  #checkStickyVisibility() {
    if (!this.#thead || !this.#scrollRoot) return;
    const theadRect = this.#thead.getBoundingClientRect();
    const rootRect = this.#scrollRoot.getBoundingClientRect();
    if (theadRect.top < rootRect.top) {
      if (!this.#$stickyHeader.is(':visible')) {
        this.#createStickyClone();
      }
    } else if (this.#$stickyHeader.is(':visible')) {
      this.#destroyStickyClone();
    }
  }

  /**
   * Create a cloned thead table inside .jt-sticky-header with matched column widths.
   */
  #createStickyClone() {
    if (!this.#$stickyHeader) return;

    this.#$stickyHeader.empty();
    this.#clonedTable = null;

    const originalTable = this.#canvas[0].querySelector('.jt-table');
    const originalThead = originalTable?.querySelector('thead');
    if (!originalTable || !originalThead) return;

    const clonedTable = originalTable.cloneNode(false);
    const clonedThead = originalThead.cloneNode(true);
    clonedThead.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clonedTable.appendChild(clonedThead);

    // Batch reads: collect all widths first
    const originalThs = originalThead.querySelectorAll('th');
    const widths = Array.from(originalThs).map((th) => th.getBoundingClientRect().width);
    const tableWidth = originalTable.getBoundingClientRect().width;

    // Batch writes: apply widths to cloned elements
    const clonedThs = clonedThead.querySelectorAll('th');
    clonedThs.forEach((clonedTh, index) => {
      const w = `${widths[index]}px`;
      clonedTh.style.width = w;
      clonedTh.style.minWidth = w;
      clonedTh.style.maxWidth = w;
    });

    clonedTable.style.width = `${tableWidth}px`;
    clonedTable.style.minWidth = `${tableWidth}px`;
    clonedTable.style.tableLayout = 'fixed';

    this.#$stickyHeader[0].appendChild(clonedTable);
    this.#clonedTable = clonedTable;

    this.#syncStickyScroll();
    this.#updateScrollButtons();
    this.#$stickyHeader.show();
  }

  /**
   * Remove the sticky clone and hide the container.
   */
  #destroyStickyClone() {
    if (!this.#$stickyHeader) return;
    this.#clonedTable = null;
    this.#$stickyHeader.hide().empty();
  }

  /**
   * Sync the cloned header's horizontal position with the scroll wrapper.
   */
  #syncStickyScroll() {
    if (!this.#clonedTable || !this.#scrollWrapper) return;
    this.#clonedTable.style.transform = `translateX(-${this.#scrollWrapper.scrollLeft}px)`;
  }

  /**
   * Re-create the sticky clone if it is currently visible (e.g. after column toggle or resize).
   */
  #refreshStickyClone() {
    if (this.#$stickyHeader && this.#$stickyHeader.is(':visible')) {
      this.#createStickyClone();
    }
  }

  /**
   * Create and attach floating scroll-arrow buttons to the table container.
   */
  #setupScrollButtons() {
    const wrapper = this.#scrollWrapper;
    if (!wrapper) return;

    const container = wrapper.parentElement;

    const btnLeft = document.createElement('button');
    btnLeft.className = 'jt-scroll-btn jt-scroll-btn-left';
    btnLeft.setAttribute('aria-label', 'Scroll table left');
    btnLeft.hidden = true;
    btnLeft.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';

    const btnRight = document.createElement('button');
    btnRight.className = 'jt-scroll-btn jt-scroll-btn-right';
    btnRight.setAttribute('aria-label', 'Scroll table right');
    btnRight.hidden = true;
    btnRight.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';

    container.appendChild(btnLeft);
    container.appendChild(btnRight);

    this.#btnScrollLeft = btnLeft;
    this.#btnScrollRight = btnRight;

    const scrollAmount = () => Math.round(wrapper.clientWidth * 0.8);

    btnLeft.addEventListener('click', () => {
      wrapper.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    btnRight.addEventListener('click', () => {
      wrapper.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    requestAnimationFrame(() => this.#updateScrollButtons());
  }

  /**
   * Update visibility of scroll-arrow buttons based on scroll position and overflow.
   */
  #updateScrollButtons() {
    const wrapper = this.#scrollWrapper;
    if (!wrapper || !this.#btnScrollLeft || !this.#btnScrollRight) return;

    const overflows = wrapper.scrollWidth > wrapper.clientWidth + 4;

    if (!overflows) {
      if (this.#scrollLeftVisible) {
        this.#btnScrollLeft.hidden = true;
        this.#scrollLeftVisible = false;
      }
      if (this.#scrollRightVisible) {
        this.#btnScrollRight.hidden = true;
        this.#scrollRightVisible = false;
      }
      return;
    }

    const showLeft = wrapper.scrollLeft > 4;
    const showRight = wrapper.scrollLeft + wrapper.clientWidth < wrapper.scrollWidth - 4;

    if (showLeft !== this.#scrollLeftVisible) {
      this.#btnScrollLeft.hidden = !showLeft;
      this.#scrollLeftVisible = showLeft;
    }

    if (showRight !== this.#scrollRightVisible) {
      this.#btnScrollRight.hidden = !showRight;
      this.#scrollRightVisible = showRight;
    }
  }
}
