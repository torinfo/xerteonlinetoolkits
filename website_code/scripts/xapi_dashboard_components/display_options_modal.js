import { escapeHtml, escapeHtmlAttr } from './utils/escape.js';

export class DisplayOptionsModal {
  /** The modal element id */
  #id = 'display-options-modal';

  /** The xAPIDashboard instance */
  #dashboard;

  /** The interactions array */
  #interactions;

  /** i18n label strings */
  #labels;

  /**
   * @param {Object} dashboard - The xAPIDashboard instance
   * @param {Array} interactions - The interactions array from getInteractions()
   * @param {Object} labels - i18n label strings
   * @param {string} labels.title - Modal title
   * @param {string} labels.columns - "Show/hide columns" heading
   * @param {string} labels.overview - "Display overview" label
   * @param {string} labels.interactionOverview - "Display overview in interaction overview" label
   * @param {string} labels.pageSize - "Page size" label
   * @param {string} labels.pageSizeAll - "All" label for page size
   */
  constructor(dashboard, interactions, labels) {
    this.#dashboard = dashboard;
    this.#interactions = interactions;
    this.#labels = labels;
  }

  /** Initialize the display options modal */
  init() {
    this.#createModal();
    this.#registerEventHandlers();
  }

  /** Create the modal HTML and append to body */
  #createModal() {
    // Remove any existing modal from a previous dashboard instance
    $(`#${this.#id}`).remove();

    let ioChecked = 'checked';
    try {
      const displayOptions = JSON.parse(
        this.#dashboard.data.info.dashboard.display_options || '{}',
      );
      if (displayOptions.interactionOverview === false) {
        ioChecked = '';
      }
    } catch (e) {
      // Use default (checked)
    }

    const columnCheckboxes = this.#buildColumnCheckboxes();
    const pageSizeSelect = this.#buildPageSizeSelect();

    const modal = `
      <div
        id="${this.#id}"
        class="modal fade"
        role="dialog"
        tabindex="-1"
        aria-labelledby="${this.#id}-title"
      >
        <div class="modal-dialog display-options-dialog">
          <div class="modal-content">
            <div class="modal-header display-options-header">
              <h5 class="modal-title" id="${this.#id}-title">
                ${escapeHtml(this.#labels.title)}
              </h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body display-options-body">
              <div class="p-3 my-2 rounded display-options-section">
                <h6 class="display-options-section-heading">
                  ${escapeHtml(this.#labels.columns)}
                </h6>
                <div class="display-options-columns-list">
                  ${columnCheckboxes}
                </div>
              </div>
              <div class="p-3 my-2 rounded display-options-section">
                <h6 class="display-options-section-heading">
                  ${escapeHtml(this.#labels.overview)}
                </h6>
                <div class="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    class="custom-control-input hide-show-overview"
                    id="${this.#id}-overview"
                    checked
                  >
                  <label class="custom-control-label" for="${this.#id}-overview">
                    ${escapeHtml(this.#labels.overview)}
                  </label>
                </div>
              </div>
              <div class="p-3 my-2 rounded display-options-section">
                <h6 class="display-options-section-heading">
                  ${escapeHtml(this.#labels.interactionOverview)}
                </h6>
                <div class="custom-control custom-checkbox">
                  <input
                    type="checkbox"
                    class="custom-control-input hide-show-overview-interaction-overview"
                    id="${this.#id}-interaction-overview"
                    ${ioChecked}
                  >
                  <label class="custom-control-label" for="${this.#id}-interaction-overview">
                    ${escapeHtml(this.#labels.interactionOverview)}
                  </label>
                </div>
              </div>
              <div class="p-3 my-2 rounded display-options-section">
                <h6 class="display-options-section-heading">
                  ${escapeHtml(this.#labels.pageSize)}
                </h6>
                <div class="form-group mb-0">
                  ${pageSizeSelect}
                </div>
              </div>
              ${this.#buildShowNamesSection()}
            </div>
          </div>
        </div>
      </div>`;

    $('body').append(modal);

    // Wire the button to open the modal
    $('.show-display-options-button').off('click').on('click', () => {
      $(`#${this.#id}`).modal('show');
    });
  }

  /**
   * Build the column checkbox HTML for page-type interactions
   *
   * @returns {string} HTML string of checkbox items
   */
  #buildColumnCheckboxes() {
    return this.#interactions
      .filter((i) => i.type === 'page')
      .map((i, index) => {
        const header = $(`th[data-interaction-url="${CSS.escape(i.url)}"]`);
        const isVisible = header.is(':visible');
        const checked = isVisible ? 'checked' : '';

        return `
          <div class="display-options-column-item custom-control custom-checkbox">
            <input
              type="checkbox"
              class="custom-control-input hide-show-column-checkbox"
              id="col-check-${index}"
              data-target="${escapeHtmlAttr(i.url)}"
              ${checked}
            >
            <label class="custom-control-label" for="col-check-${index}">
              ${escapeHtml(i.name)}
            </label>
          </div>`;
      })
      .join('');
  }

  /**
   * Build the "Show names and/or email addresses" section HTML.
   * Returns an empty string when the feature is disabled by config.
   *
   * @returns {string} HTML string for the section, or '' if hidden
   */
  #buildShowNamesSection() {
    const info = this.#dashboard.data.info;
    if (info.dashboard.enable_nonanonymous !== 'true') {
      return '';
    }
    const forced = info.unanonymous === 'true';
    const checked = forced || info.dashboard.anonymous === false ? 'checked' : '';
    const disabled = forced ? 'disabled' : '';

    return `
      <div class="p-3 my-2 rounded display-options-section">
        <h6 class="display-options-section-heading">
          ${escapeHtml(this.#labels.showNames)}
        </h6>
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="dp-unanonymous-view"
            ${checked}
            ${disabled}
          >
          <label class="custom-control-label" for="dp-unanonymous-view">
            ${escapeHtml(this.#labels.showNames)}
          </label>
        </div>
      </div>`;
  }

  /**
   * Build the page size select HTML
   *
   * @returns {string} HTML string of the select element
   */
  #buildPageSizeSelect() {
    const defaultSize = this.#dashboard.data.pageSize;
    const pageSizes = [5, 10, 20, 50, 100];
    const allLabel = this.#labels.pageSizeAll;

    const options = pageSizes.map((size) => {
      const selected = defaultSize === size ? 'selected' : '';
      return `<option ${selected} value="${size}">${size}</option>`;
    });

    const allSelected = defaultSize === -1 ? 'selected' : '';
    options.push(
      `<option ${allSelected} value="-1">${escapeHtml(allLabel)}</option>`,
    );

    return `
      <select
        class="custom-select custom-select-sm"
        id="${this.#id}-page-size"
      >
        ${options.join('')}
      </select>`;
  }

  /** Register event delegation handlers on the modal (called once) */
  #registerEventHandlers() {
    const $modal = $(`#${this.#id}`);
    const dashboard = this.#dashboard;

    // Sync checkbox states each time the modal is shown
    $modal.on('show.bs.modal', () => {
      this.syncCheckboxStates();
    });

    // Column checkbox toggle
    $modal.on('change', '.hide-show-column-checkbox', function handleColumnChange() {
      const $checkbox = $(this);
      const target = $checkbox.data('target');
      const checked = $checkbox.is(':checked');
      const targetHeader = $(`th[data-interaction-url="${CSS.escape(target)}"]`);
      const targetIndex = targetHeader.index() + 1;
      const column = $(
        `.jt-table td:nth-child(${targetIndex}),.jt-table th:nth-child(${targetIndex})`,
      );
      const subQuestionToggle = targetHeader.find('div');

      if (checked) {
        column.show();
      } else {
        column.hide();
      }

      if (subQuestionToggle.hasClass('icon-show')) {
        subQuestionToggle.click();
      }

      const escapedTarget = $.escapeSelector(target);
      const subCols = $(`.journey-sub-${escapedTarget}`);
      if (!checked) {
        subCols.hide();
      }

      const displayOptions = JSON.parse(
        dashboard.data.info.dashboard.display_options || '{}',
      );

      if (typeof displayOptions.columns === 'undefined') {
        displayOptions.columns = {};
      }

      displayOptions.columns[target] = checked;
      dashboard.data.info.dashboard.display_options = JSON.stringify(displayOptions);

      $.post(
        'website_code/php/xAPI/update_dashboard_display_properties.php',
        {
          id: dashboard.data.info.template_id,
          properties: dashboard.data.info.dashboard.display_options,
        },
      );
    });

    // Overview toggle
    $modal.on('change', '.hide-show-overview', () => {
      $('.journeyOverview').toggle();
    });

    // Interaction overview toggle
    $modal.on('change', '.hide-show-overview-interaction-overview', function handleInteractionOverviewChange() {
      const checked = $(this).is(':checked');
      const displayOptions = JSON.parse(
        dashboard.data.info.dashboard.display_options || '{}',
      );
      displayOptions.interactionOverview = checked;
      dashboard.data.info.dashboard.display_options = JSON.stringify(displayOptions);

      $.post(
        'website_code/php/xAPI/update_dashboard_display_properties.php',
        {
          id: dashboard.data.info.template_id,
          properties: dashboard.data.info.dashboard.display_options,
        },
      );
    });

    // Show names / email addresses toggle (only if rendered + user-toggleable)
    $modal.on('change', '#dp-unanonymous-view', function handleUnanonymousChange() {
      if ($(this).prop('disabled')) return;
      dashboard.data.info.dashboard.anonymous = !$(this).is(':checked');
      $('#dp-start').prop('disabled', true);
      $('#dp-end').prop('disabled', true);
      $('#dp-unanonymous-view').prop('disabled', true);
      $modal.one('hidden.bs.modal', () => {
        dashboard.regenerate_dashboard();
      });
      $modal.modal('hide');
    });

    // Page size change
    $modal.on('change', `#${this.#id}-page-size`, function handlePageSizeChange() {
      dashboard.data.pageSize = Number($(this).val());

      if (Number.isNaN(dashboard.data.pageSize)) {
        dashboard.data.pageSize = -1;
      }

      $(document).trigger('dashboard:pageSizeChanged', [dashboard.data.pageSize]);

      const displayOptions = JSON.parse(
        dashboard.data.info.dashboard.display_options || '{}',
      );

      displayOptions.pageSize = dashboard.data.pageSize;
      dashboard.data.info.dashboard.display_options = JSON.stringify(displayOptions);

      $.post(
        'website_code/php/xAPI/update_dashboard_display_properties.php',
        {
          id: dashboard.data.info.template_id,
          properties: dashboard.data.info.dashboard.display_options,
        },
      );
    });
  }

  /** Sync column checkbox checked states with current column visibility */
  syncCheckboxStates() {
    $(`#${this.#id} .hide-show-column-checkbox`).each(function syncCheckbox() {
      const target = $(this).data('target');
      const header = $(`th[data-interaction-url="${CSS.escape(target)}"]`);
      $(this).prop('checked', header.is(':visible'));
    });
  }
}
