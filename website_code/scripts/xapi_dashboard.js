/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Polyfill $.escapeSelector for jQuery <3.0 — module-load once.
if (!$.escapeSelector) {
  $.escapeSelector = (selector) => selector.replaceAll(':', '-').replaceAll('/', '-');
}

// Module-level singleton imports — fetched once, reused on every await.
const loggerPromise = import('./xapi_dashboard_components/utils/logger.js')
  .catch((err) => {
    console.error('[xAPIDashboard] failed to load logger', err);
    return { dashboardStateLogger: undefined };
  });

const escapePromise = import('./xapi_dashboard_components/utils/escape.js')
  .catch((err) => {
    console.error('[xAPIDashboard] failed to load escape utils', err);
    // Strict fallback — never return raw strings, otherwise the XSS guard at
    // #renderTitle silently degrades to direct injection.
    return {
      escapeHtml: (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
      }[c])),
    };
  });

class xAPIDashboard {
  #groupSwitchInFlight = false;

  constructor(info) {
    this.data = new DashboardState(info);
  }

  getStatements(q, one, callback, forceXapi = true) {
    this.data.getStatements(q, one, callback, forceXapi);
  }

  getGroupFromStatements(statementIdxs) {
    return this.data.rawData[statementIdxs[0]]?.context?.team?.account?.name ?? '';
  }

  async drawDashboard(canvas) {
    const [libOverview, libJourneyTable, libInteractionModal] = await Promise.all([
      import('./xapi_dashboard_components/overview.js'),
      import('./xapi_dashboard_components/journey_table.js'),
      import('./xapi_dashboard_components/interaction_modal.js'),
    ]);

    const overview = new libOverview.Overview(canvas, this.data.state, '');
    await overview.init();

    const journeyTable = new libJourneyTable.JourneyTable(canvas, this, this.data.state);
    await journeyTable.init();

    const interactionModal = new libInteractionModal.InteractionModal(
      this,
      this.data.state,
      'interaction-overview-modal',
      'interaction-overview-button',
      'Interaction Overview',
      {
        showPrintButton: true,
        overviewModal: true,
      },
    );
    await interactionModal.init();
  }

  setActionButtonsEnabled(enabled) {
    const disabled = !enabled;
    $('.show-question-overview-button button, .show-display-options-button button, .dashboard-print-button button')
      .prop('disabled', disabled)
      .toggleClass('disabled', disabled);
  }

  async createJourneyTableSession(div) {
    this.data.rawData = this.data.combineUrls();

    let $titleDiv = $('#dashboard-title');
    if ($titleDiv.length === 0) {
      $titleDiv = div;
    }

    if (this.data.rawData.length === 0) {
      this.#renderEmptyState($titleDiv);
      return;
    }
    this.setActionButtonsEnabled(true);

    $('#journeyData').append('<div id="journeyDataNew"></div>');
    const $containerCanvas = $('#journeyDataNew');

    await this.#buildGroupedData(this.data.rawData);

    await this.drawDashboard($containerCanvas);

    $('[data-toggle="popover"]').popover();

    this.#populateGroupSelect();
    await this.#renderTitle($titleDiv);

    this.#bindPrintButton();
    await this.#initDisplayOptionsModal();
  }

  #renderEmptyState($titleDiv) {
    $titleDiv.html(`<h3 class="my-1">${XAPI_DASHBOARD_NO_STATEMENTS_FOUND}</h3>`);
    $('#journeyData').html('<div id="loader"><p id="loader_text"></p></div>');
    $('#loader_text').html(XAPI_DASHBOARD_NO_STATEMENTS_FOUND);
    this.setActionButtonsEnabled(false);
  }

  // GroupedData is mutated during rendering (prepareStatistics), so a fresh
  // instance is constructed every time the data set or filter changes.
  async #buildGroupedData(statements) {
    const { dashboardStateLogger } = await loggerPromise;
    this.data.state = new DS.GroupedData(
      statements,
      undefined,
      undefined,
      undefined,
      { logger: dashboardStateLogger },
    );
  }

  #populateGroupSelect() {
    DS.extractGroups(this.data.rawData).forEach((group) => {
      $('#group-select').append($('<option>').val(group).text(group));
    });
  }

  // firstName originates from xAPI statement data (LRS-controllable) — escape
  // before injecting into HTML.
  async #renderTitle($titleDiv) {
    const { escapeHtml } = await escapePromise;
    const { learningObjects } = this.data.state;
    const firstName = learningObjects[0]
      ? learningObjects[0].names.values().next().value
      : XAPI_DASHBOARD_NO_STATEMENTS_FOUND;
    $titleDiv.html(`<h3 class="my-1">${escapeHtml(firstName)}</h3>`);
  }

  #bindPrintButton() {
    $('.dashboard-print-button')
      .off('click.dashboard')
      .on('click.dashboard', (e) => {
        e.preventDefault();
        const printClass = 'printing-dashboard';
        document.documentElement.classList.add(printClass);

        let fallbackTimer;
        const cleanup = () => {
          document.documentElement.classList.remove(printClass);
          clearTimeout(fallbackTimer);
        };

        // Register listener BEFORE print() — some browsers fire afterprint
        // synchronously when the dialog closes, so the listener must exist first.
        window.addEventListener('afterprint', cleanup, { once: true });
        fallbackTimer = setTimeout(cleanup, 30000);
        window.print();
      });
  }

  async #initDisplayOptionsModal() {
    const { interactions } = this.data.state;
    const libDisplayOptionsModal = await import('./xapi_dashboard_components/display_options_modal.js');
    const displayOptionsModal = new libDisplayOptionsModal.DisplayOptionsModal(
      this,
      interactions,
      {
        title: XAPI_DASHBOARD_DISPLAY_OPTIONS,
        columns: XAPI_DASHBOARD_DISPLAY_COLUMNS,
        overview: XAPI_DASHBOARD_DISPLAY_OVERVIEW,
        interactionOverview: XAPI_DASHBOARD_DISPLAY_INTERACTION_OVERVIEW,
        pageSize: XAPI_DASHBOARD_PAGE_SIZE,
        pageSizeAll: XAPI_DASHBOARD_PAGE_SIZE_ALL,
        showNames: XAPI_DASHBOARD_SHOW_NAMES,
      },
    );
    await displayOptionsModal.init();
  }

  formatDuration(duration) {
    const dm = moment.duration(duration, 'seconds');
    if (dm.days() > 0) {
      return `> 1${XAPI_DASHBOARD_DAYCODE}`;
    }

    const hours = `${dm.hours()}`;
    let minutes = `${dm.minutes()}`;
    if (minutes.length < 2) minutes = `0${minutes}`;
    let seconds = `${dm.seconds()}`;
    if (seconds.length < 2) seconds = `0${seconds}`;

    if (dm.hours() > 0) return `${hours}:${minutes}:${seconds}`;
    return `${minutes}:${seconds}`;
  }

  formatStart(start) {
    return moment(start).format('YYYY-MM-DD HH:mm:ss');
  }

  show_dashboard(begin, end) {
    const since = new Date(begin);
    const until = new Date(end);

    this.data.pageSize = JSON.parse(this.data.info.dashboard.display_options).pageSize;
    if (this.data.pageSize === undefined) {
      this.data.pageSize = 5;
    }

    this.#setupDatepickers(since, until);
    this.#bindDateChangeHandlers();
    this.#bindGroupChangeHandler();
    this.#applyAnonymousFlags();

    this.regenerate_dashboard();
    $('#dashboard-wrapper').show();
  }

  #setupDatepickers(since, until) {
    let jqueryLanguage;
    if ($.datepicker.regional[language_code] !== undefined) {
      jqueryLanguage = language_code;
    } else {
      jqueryLanguage = language_code.substr(0, 2);
      if ($.datepicker.regional[jqueryLanguage] === undefined) {
        jqueryLanguage = '';
      }
    }
    $.datepicker.setDefaults($.extend({}, $.datepicker.regional[jqueryLanguage]));

    $('#dp-start').val(since.toDateString());
    $('#dp-end').val(until.toDateString());

    const initPicker = (selector, oppositeSelector, mode) => {
      $(selector).datepicker({
        onShow() {
          const oppositeVal = $(oppositeSelector).val() || false;
          this.setOptions(
            mode === 'max'
              ? { maxDate: oppositeVal, maxTime: oppositeVal }
              : { minDate: oppositeVal, minTime: oppositeVal },
          );
        },
        timepicker: true,
      });
    };

    initPicker('#dp-start', '#dp-end', 'max');
    initPicker('#dp-end', '#dp-start', 'min');

    $('#dp-start').datepicker('setDate', since);
    $('#dp-end').datepicker('setDate', until);
  }

  #bindDateChangeHandlers() {
    const onChange = () => {
      $('#dp-start').prop('disabled', true);
      $('#dp-end').prop('disabled', true);
      $('#dp-unanonymous-view').prop('disabled', true);
      this.regenerate_dashboard();
    };
    $('#dp-start').off('change.dashboard').on('change.dashboard', onChange);
    $('#dp-end').off('change.dashboard').on('change.dashboard', onChange);
  }

  #bindGroupChangeHandler() {
    $('#group-select')
      .off('change.dashboard')
      .on('change.dashboard', async (event) => {
        if (this.#groupSwitchInFlight) return;
        this.#groupSwitchInFlight = true;

        try {
          const group = String($(event.currentTarget).val());
          this.data.currentGroup.group_id = group;
          this.data.pageIndex = 0;

          const filteredStatements = group === 'all-groups'
            ? this.data.rawData
            : DS.filterByGroup(this.data.rawData, group);

          await this.#buildGroupedData(filteredStatements);

          // Clean up orphaned journey event handlers, then re-draw
          $(document).off('click.journey');
          $('#journeyDataNew').empty();
          await this.drawDashboard($('#journeyDataNew'));
        } catch (err) {
          console.error('Group filter failed:', err);
        } finally {
          this.#groupSwitchInFlight = false;
        }
      });
  }

  #applyAnonymousFlags() {
    if (this.data.info.dashboard.enable_nonanonymous !== 'true') return;
    if (this.data.info.unanonymous === 'true') {
      this.data.info.dashboard.anonymous = false;
    } else if (this.data.info.dashboard.anonymous === undefined) {
      this.data.info.dashboard.anonymous = true;
    }
  }

  helperGetDate(datetimepicker) {
    const mTime = $(datetimepicker).datepicker('getDate');
    // jQuery UI returns Date | null; defensively also handle undefined / Invalid Date.
    if (!mTime || Number.isNaN(mTime.getTime())) {
      if (datetimepicker === '#dp-end') return new Date();
      if (datetimepicker === '#dp-start') return new Date('1970-01-01');
    }
    return mTime;
  }

  regenerate_dashboard() {
    $('#journeyData').html(
      `<div id="loader"><img id="loader_image" class="loading_gif" src="${site_url}/editor/img/loading16.gif" /><p id="loader_text"></p></div>`,
    );
    $('#group-select option:not(:first-child)').remove();
    this.data.currentGroup.group_id = 'all-groups';

    const url = `${site_url}${this.data.info.template_id}`;
    const start = this.helperGetDate('#dp-start');
    const rawEnd = this.helperGetDate('#dp-end');
    const end = new Date(moment(rawEnd).add(1, 'days').toISOString());

    const q = {};
    q.activities = [url];

    if (
      this.data.info.role !== undefined
      && this.data.info.role === 'Student'
      && this.data.info.actor !== undefined
    ) {
      q.actor = this.data.info.actor;
    }

    if (
      this.data.info.lrs.lrsurls !== null
      && this.data.info.lrs.lrsurls !== undefined
      && this.data.info.lrs.lrsurls !== ''
    ) {
      q.activities = q.activities.concat(this.data.info.lrs.lrsurls.split(','));
    }

    if (
      this.data.info.lrs.site_allowed_urls !== null
      && this.data.info.lrs.site_allowed_urls !== undefined
      && this.data.info.lrs.site_allowed_urls !== ''
    ) {
      const { template_id: templateId } = this.data.info;
      q.activities = q.activities
        .concat(
          this.data.info.lrs.site_allowed_urls
            .split(',')
            .map((u) => `${u}${templateId}`),
        )
        .filter((u) => u !== '');
    }

    q.activity = url;
    q.related_activities = true;
    q.since = start.toISOString();
    q.until = end.toISOString();

    this.data.getStatements(q, false, () => {
      $('#dp-start').prop('disabled', false);
      $('#dp-end').prop('disabled', false);
      $('#dp-unanonymous-view').prop('disabled', false);
      $('#journeyData').html('');
      this.createJourneyTableSession($('#journeyData'));
    });
  }

  close() {
    this.data.clear();
    this.data.rawData = undefined;

    // Tear down everything bound under the .dashboard namespace in one shot.
    $('#dp-start, #dp-end, #dp-unanonymous-view, #group-select, .dashboard-print-button')
      .off('.dashboard');

    // Component-owned namespaces tracked in this file (journey table delegates
    // its click handlers on document).
    $(document).off('click.journey');
    $(document).off('show.bs.modal');

    // Modal teardown
    $('#interaction-overview-button').off('click');
    $('#interaction-overview-modal').off('hidden.bs.modal').remove();

    // DOM cleanup
    $('#journeyData').empty();
    $('#dashboard-title').empty();
    $('.journeyData > div').remove();
    $('.dashboard-modal').remove();
    $('.journeyOverviewActivity').html('');
    $('#dashboard-wrapper').hide();
  }
}

// Global wrapper — invoked from `index.php` via `onclick="close_dashboard()"`.
function close_dashboard() {
  if (typeof x_Dashboard !== 'undefined' && x_Dashboard) {
    x_Dashboard.close();
  }
}
