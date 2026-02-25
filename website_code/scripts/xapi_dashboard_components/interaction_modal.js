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
      <h4 class="modal-title">${this.#modalTitle}</h4>
      ${this.#options.showPrintButton ? `
        <button
          id="interaction-overview-print"
          type="button"
          class="xerte_button_c_no_width"
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
   * Add modal body
   */
  async addModalBody() {
    let canvas = $(`#${this.#id} .modal-body`);

    // If this is the overview modal, add the overview component and
    // list all the interactions.
    if (this.#options.overviewModal) {
      await this.addModalOverview(canvas);
      await this.addModalInteractions(canvas);
    } else if (this.#options.singleInteraction) {
      await this.drawInteractionBlock(canvas, this.#options.singleInteraction);
    } else if (this.#options.singleSubInteraction) {
      const subInteraction = this.#options.singleSubInteraction;
      const wrapperId = `modal-container-${$.escapeSelector(subInteraction.url)}`;
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

    const body = `
      `;

    $(`#${this.#id} .modal-body`).append(body);
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
        async (interaction) => await this.drawInteractionBlock(canvas, interaction),
      )
    );
  }

  /**
   * Deaw interaction block
   *
   * @param {jQuery} $parent - The parent element to append the interaction block to.
   * @param {Object} interaction - The interaction object to add.
   */
  async drawInteractionBlock($parent, interaction) {
    const selector = `modal-container-${$.escapeSelector(interaction.url)}`;
    const body = `
      <div
        id="${selector}"
        class="interaction-block p-4 my-2 rounded"
        style="background-color: #fff;"
      >
        <h5>${interaction.name}</h5>
        <div class="container-fluid">
          <div id="detail-${selector}" class="row">
          </div>
        </div>
      </div>
    `;

    $parent.append(body);

    const scoredStatements = interaction.getScoredStatements(this.#state.statements);

    this.#marksChartLib.drawMarksGraph($(`#detail-${selector}`), selector, scoredStatements, 6);

    await Promise.all(
      interaction.subInteractions.map(
        async (subInteraction) => await this.drawSubInteractionBlock($(`#${selector}`), subInteraction),
      )
    );
  }

  /**
   * Draw sub interaction block
   *
   * @param {jQuery} $parent - The parent element to append the sub interaction block to.
   * @param {Object} subInteraction - The sub interaction object to add.
   */
  async drawSubInteractionBlock($parent, subInteraction) {
    const selector = `modal-container-sub-${$.escapeSelector(subInteraction.url)}`;
    const body = `
      <div id="${selector}" class="sub-interaction-block">
        <h5>
          <i class="fa-solid fa-angle-right pr-2" />
          ${subInteraction.name}
          <div class="container-fluid">
            <div id="detail-${selector}" class="row">
            </div>
          </div>
        </h5>
      </div>
    `;

    $parent.append(body);

    const interactionAnswerOptions = subInteraction.getInteractionAnswerOptions(this.#state.statements);
    const answeredStatements = subInteraction.getAnsweredStatements(this.#state.statements);

    switch (interactionAnswerOptions.type) {
      case 'choices':
        const libChoicesInteraction = await import('./interactions/choices.js');
        const choicesInteraction = new libChoicesInteraction.ChoicesInteraction(
          selector,
          this.#state,
          subInteraction,
        );
        await choicesInteraction.init();

        // this.drawMarksGraph($(`#detail-${selector}`), selector, answeredStatements, 6);
        // this.drawChoiceAnswers(
        //   $(`#detail-${selector}`),
        //   selector,
        //   interactionAnswerOptions,
        //   answeredStatements,
        //   6,
        // );
        break;
    }
  }

  /**
   * Draw the marks graph
   *
   * @param {jQuery} $parent - The parent element to append the answer block to.
   * @param {string} selector - The selector of the parent element.
   * @param {Array} statements - The statements to be used in the graph.
   * @param {number} size - The size of the answer block (the number of columns).
   */
  drawMarksGraph($parent, selector, statements, size) {
    const body = `
      <div class="col-${size}" style="min-height: 400px;">
        <canvas id="choices-chart-${selector}" width="400" height="400"></canvas>
      </div>
    `

    $parent.append(body);

    const graph = new DashboardGraphs.BarGraphReceivedMarks({
      statements: statements,
      options: {
        ctx: document.getElementById(`choices-chart-${selector}`).getContext('2d'),
      }
    });
    graph.draw();
  }

  /**
   * Draw a the answers given graph
   *
   * @param {jQuery} $parent - The parent element to append the answer block to.
   * @param {string} selector - The selector of the parent element.
   * @param {Array} statements - The statements to be used in the graph.
   * @param {Array<{key: string, color: string}>} colors - Array of ColorDefinition objects (colorDefinitions) mapping answer choices to hex colors.
   * @param {number} size - The size of the answer block (the number of columns).
   */
  drawAnswersGivenGraph($parent, selector, statements, colors, size) {
    const body = `
      <div class="col-${size}" style="min-height: 400px;">
        <canvas id="answers-chart-${selector}" width="400" height="400"></canvas>
      </div>
    `

    $parent.append(body);

    const graph = new DashboardGraphs.BarGraphGivenAnswers({
      statements: statements,
      options: {
        ctx: document.getElementById(`answers-chart-${selector}`).getContext('2d'),
        colorDefinitions: colors,
      }
    });
    graph.draw();
  }
}
