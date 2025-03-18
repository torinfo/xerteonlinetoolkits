export class InteractionModal {
  /** The id of the button that opens the modal */
  #buttonId;

  /** The dashboard */
  #dashboard;

  /** The id of the modal */
  #id;

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

    // Add the modal to the body
    $('body').append(modal);

    // Register the click event for the button that opens the modal
    $(`#${this.#buttonId}`).on('click', async () => {
      // Open the modal
      $(`#${this.#id}`).modal();

      // Add the header to the modal
      this.addModalHeader();

      // Add the body to the modal
      await this.addModalBody();
    });

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

    const interactionBlocks = interactions
      .map((interaction) => this.getInteractionBlock(interaction)).join('');

    canvas.append(interactionBlocks);
  }

  /**
   * Get interaction block
   *
   * @param {Object} interaction - The interaction object to add.
   */
  getInteractionBlock(interaction) {
    const subInteractionBlocks = interaction.subInteractions
      .map((subInteraction) => this.getSubInteractionBlock(subInteraction)).join('');

    console.log('modal interaction', this.#state.statements, interaction);

    const body = `
      <div class="interaction-block p-4 my-2 rounded" style="background-color: #fff;">
        <h5>${interaction.name}</h5>
        ${subInteractionBlocks}
      </div>
    `;

    return body;
  }

  /**
   * Get sub interaction block
   *
   * @param {Object} subInteraction - The sub interaction object to add.
   */
  getSubInteractionBlock(subInteraction) {
    const interactionAnswerOptions = subInteraction.getInteractionAnswerOptions(this.#state.statements);

    let interactionAnswerOptionsHtml;
    switch (interactionAnswerOptions.type) {
      case 'choices':
        interactionAnswerOptionsHtml = this.getChoiceAnswers(interactionAnswerOptions);
        break;
      default:
        interactionAnswerOptionsHtml = '';
    }

    const body = `
      <div class="sub-interaction-block">
        <h5>
          <i class="fa-solid fa-angle-right pr-2" />
          ${subInteraction.name}
        </h5>
        ${interactionAnswerOptionsHtml}
      </div>
    `;

    return body;
  }

  /**
   * Get sub interaction block
   *
   * @param {InteractionAnswer} interactionAnswerOptions - The interaction answers.
   */
  getChoiceAnswers(interactionAnswerOptions) {
    return interactionAnswerOptions.choices.map((choice) => {
      let icon = interactionAnswerOptions.correctResponsesPattern.includes(choice)
        ? '<i class="fa-solid fa-check" />' : '<i class="fa-solid fa-xmark" />';

      return `
      <div>
        ${icon}
        ${choice}
      </div>`;
    }).join('');
  }
}
