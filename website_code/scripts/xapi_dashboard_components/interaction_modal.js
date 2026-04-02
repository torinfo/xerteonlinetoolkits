import { escapeHtml, toSafeId } from './utils/escape.js';

export class InteractionModal {
  /** The id of the button that opens the modal */
  #buttonId;

  /** The dashboard */
  #dashboard;

  /** The id of the modal */
  #id;

  /** The marks chart lib */
  #marksChartLib;

  /** The title of the modal */
  #modalTitle;

  /** An object with options for the modal */
  #options;

  /** The dashboard state */
  #state;

  /**
  *
  * @param dashboard - The dashboard
  * @param state - The dashboard state
  * @param id - The id of the modal
  * @param buttonId - The id of the button that opens the modal
  * @param modalTitle - The title of the modal
  * @param options - An object with options for the modal
  */
  constructor(dashboard, state, id, buttonId, modalTitle, options = {}) {
    this.#dashboard = dashboard;
    this.#state = state;
    this.#id = id;
    this.#buttonId = buttonId;
    this.#modalTitle = modalTitle;
    this.#options = options;
  }

  /** Initialize the interaction modal */
  async init() {
    this.#marksChartLib = await import('./graphs/marks.js');

    await this.createInteractionModal();
  }

  /**
   * Create a interaction modal
   */
  async createInteractionModal() {
    const modal = `
      <div id="${this.#id}" class="modal fade" role="dialog" >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
            </div>
          <div class="modal-body col-md-12" style="overflow-x: hidden; background-color: #eee;">
          </div>
        </div>
      </div>`;

    // Add the modal to the body, guarding against duplicate IDs on re-initialisation
    if ($(`#${this.#id}`).length === 0) {
      $('body').append(modal);

      if (this.#options.showPrintButton) {
        $(`#${this.#id}`).on('click', `#${this.#id}-print-btn`, () => {
          const printClass = `printing-${this.#id}`;
          document.documentElement.classList.add(printClass);
          window.print();
          const cleanupPrintClass = () => document.documentElement.classList.remove(printClass);
          window.addEventListener('afterprint', cleanupPrintClass, { once: true });
          // Safety fallback: remove class after 30s if afterprint never fires
          // (e.g. popup blocked or mobile browser quirks)
          setTimeout(cleanupPrintClass, 30000);
        });
      }
    }

    // Register the click event for the button that opens the modal
    if (this.#buttonId) {
      $(`#${this.#buttonId}`).on('click', async () => {
        // Open the modal
        $(`#${this.#id}`).modal();

        // Add the header to the modal
        this.addModalHeader();

        // Add the body to the modal
        await this.addModalBody();
      });
    }

    // Clean the modal header and body when it is closed
    $(`#${this.#id}`).on('hidden.bs.modal', () => {
      $(`#${this.#id} .modal-header`).empty();
      $(`#${this.#id} .modal-body`).empty();
    });
  }

  /**
   * Add modal header
   */
  addModalHeader() {
    const header = `
      <h4 class="modal-title">${escapeHtml(this.#modalTitle)}</h4>
      ${this.#options.showPrintButton ? `
        <button
          id="${this.#id}-print-btn"
          type="button"
          class="xerte_button_c_no_width mx-auto"
        >
          Print
        </button>
      ` : ''}
      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
        &times;
      </button>`;

    $(`#${this.#id} .modal-header`).append(header);
  }

  /**
   * Returns true if the interaction overview section should be shown,
   * based on the persisted display_options setting.
   *
   * @returns {boolean}
   */
  #shouldShowInteractionOverview() {
    try {
      const displayOptions = JSON.parse(
        this.#dashboard.data.info.dashboard.display_options || '{}',
      );
      return displayOptions.interactionOverview !== false;
    } catch (e) {
      return true;
    }
  }

  /**
   * Add modal body
   */
  async addModalBody() {
    const canvas = $(`#${this.#id} .modal-body`);

    // If this is the overview modal, add the overview component and
    // list all the interactions.
    if (this.#options.overviewModal) {
      if (this.#shouldShowInteractionOverview()) {
        await this.addModalOverview(canvas);
      }
      await this.addModalInteractions(canvas);
    } else if (this.#options.singleInteraction) {
      await this.drawInteractionBlock(canvas, this.#options.singleInteraction);
    } else if (this.#options.singleSubInteraction) {
      const subInteraction = this.#options.singleSubInteraction;
      const wrapperId = toSafeId('modal-container', subInteraction.url);
      canvas.append(`
        <div
          id="${wrapperId}"
          class="interaction-block p-4 my-2 rounded"
          style="background-color: #fff;"
        >
        </div>
      `);
      await this.drawSubInteractionBlock($(`#${wrapperId}`), subInteraction);
    }

  }

  /**
   * Add modal overview
   *
   * @param {jQuery} canvas - The canvas element to append the overview component to.
   */
  async addModalOverview(canvas) {
    const libOverview = await import('./overview.js');
    const overview = new libOverview.Overview(canvas, this.#state, 'interaction-overview');
    await overview.init();
  }

  /**
   * Add modal interactions
   *
   * @param {jQuery} canvas - The canvas element to append the interactions component to.
   */
  async addModalInteractions(canvas) {
    const interactions = this.#state.interactions;

    await Promise.all(
      interactions.map(
        (interaction) => this.drawInteractionBlock(canvas, interaction),
      ),
    );
  }

  /**
   * Draw interaction block
   *
   * @param {jQuery} $parent - The parent element to append the interaction block to.
   * @param {Object} interaction - The interaction object to add.
   */
  async drawInteractionBlock($parent, interaction) {
    // For matching interactions, skip the outer wrapper (marks graph + title)
    // and render sub-interactions directly — same presentation as clicking
    // the sub-interaction header. Matching sub-interactions render their own
    // marks graph, so the parent-level wrapper is redundant and unwanted.
    if (interaction.subInteractions.length > 0) {
      try {
        // Checking the first sub-interaction is sufficient: within a single
        // Xerte interaction, all sub-interactions are always the same type.
        const firstSubType = interaction.subInteractions[0]
          .getInteractionAnswerOptions(this.#state.statements).type;
        if (
          firstSubType === 'matching'
          || firstSubType === 'text'
        ) {
          await Promise.all(
            interaction.subInteractions.map(async (subInteraction) => {
              const wrapperId = toSafeId('modal-container', subInteraction.url);
              $parent.append(`
                <div
                  id="${wrapperId}"
                  class="interaction-block p-4 my-2 rounded"
                  style="background-color: #fff;"
                >
                </div>
              `);
              await this.drawSubInteractionBlock($(`#${wrapperId}`), subInteraction);
            }),
          );
          return;
        }
      } catch (typeDetectionError) {
        // If type detection fails (e.g. no statements yet), fall through to
        // normal rendering. Log a warning for debuggability — consistent with
        // the error handling pattern in drawSubInteractionBlock().
        console.warn('Failed to detect sub-interaction type; using default rendering:', typeDetectionError);
      }
    }

    const selector = toSafeId('modal-container', interaction.url);
    const body = `
      <div
        id="${selector}"
        class="interaction-block p-4 my-2 rounded"
        style="background-color: #fff;"
      >
        <h6 style="font-weight: 600; margin-bottom: 12px;">${escapeHtml(interaction.name)}</h6>
        <div class="container-fluid">
          <div id="detail-${selector}" class="row">
          </div>
        </div>
      </div>
    `;

    $parent.append(body);

    const scoredStatements = interaction.getScoredStatements(this.#state.statements);

    this.#marksChartLib.drawMarksGraph($(`#detail-${selector}`), selector, scoredStatements, 12);

    await Promise.all(
      interaction.subInteractions.map(
        (subInteraction) => this.drawSubInteractionBlock($(`#${selector}`), subInteraction),
      ),
    );
  }

  /**
   * Draw sub interaction block
   *
   * @param {jQuery} $parent - The parent element to append the sub interaction block to.
   * @param {Object} subInteraction - The sub interaction object to add.
   */
  async drawSubInteractionBlock($parent, subInteraction) {
    const selector = toSafeId('modal-container-sub', subInteraction.url);
    const body = `
      <div
        id="${selector}"
        class="sub-interaction-block"
        style="border-left: 3px solid #ccc; padding-left: 12px; margin-top: 12px;"
      >
        <p style="font-weight: 500; margin-bottom: 8px; color: #555;">
          <i class="fa-solid fa-angle-right" style="margin-right: 6px;"></i>${escapeHtml(subInteraction.name)}
        </p>
        <div class="container-fluid">
          <div id="detail-${selector}" class="row">
          </div>
        </div>
      </div>
    `;

    $parent.append(body);

    try {
      const interactionAnswerOptions = subInteraction.getInteractionAnswerOptions(this.#state.statements);
      switch (interactionAnswerOptions.type) {
        case 'choices': {
          const libChoicesInteraction = await import('./interactions/choices.js');
          const choicesInteraction = new libChoicesInteraction.ChoicesInteraction(
            selector,
            this.#state,
            subInteraction,
          );
          await choicesInteraction.init();
          break;
        }
        case 'matching': {
          const libMatchingInteraction = await import('./interactions/matching.js');
          const matchingInteraction = new libMatchingInteraction.MatchingInteraction(
            selector,
            this.#state,
            subInteraction,
          );
          await matchingInteraction.init();
          break;
        }
        case 'fill-in': {
          const libFillInInteraction = await import('./interactions/fill-in.js');
          const fillInInteraction = new libFillInInteraction.FillInInteraction(
            selector,
            this.#state,
            subInteraction,
          );
          await fillInInteraction.init();
          break;
        }
        case 'text': {
          const libTextInteraction = await import('./interactions/text.js');
          const textInteraction = new libTextInteraction.TextInteraction(
            selector,
            this.#state,
            subInteraction,
          );
          await textInteraction.init();
          break;
        }
        case 'numeric': {
          const libNumericInteraction = await import('./interactions/numeric.js');
          const numericInteraction = new libNumericInteraction.NumericInteraction(
            selector,
            this.#state,
            subInteraction,
          );
          await numericInteraction.init();
          break;
        }
        case 'video': {
          const libVideoInteraction = await import('./interactions/video.js');
          const videoInteraction = new libVideoInteraction.VideoInteraction(
            selector,
            this.#state,
            subInteraction,
          );
          await videoInteraction.init();
          break;
        }
        default: {
          $(`#detail-${selector}`).append(`
            <div class="col-12 p-2 text-muted">
              <em>Unsupported interaction type: ${escapeHtml(interactionAnswerOptions.type)}</em>
            </div>
          `);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to render sub-interaction:', err);
      $(`#detail-${selector}`).append(`
        <div class="col-12 p-2 text-danger">
          <em>Failed to load interaction</em>
        </div>
      `);
    }
  }

}
