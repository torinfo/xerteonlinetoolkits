import { escapeHtml } from '../utils/escape.js';

const MAX_RESPONSE_LENGTH = 200;

export class TextInteraction {
  /** The canvas to draw on */
  #canvas;

  /** The interaction object for this interaction */
  #interaction;

  /** The dashboard state */
  #state;

  /**
   * @param canvas - The html element to draw on
   * @param state - The dashboard state
   * @param interaction - The interaction object containing the interaction details and answers
   */
  constructor(canvas, state, interaction) {
    this.#canvas = canvas;
    this.#state = state;
    this.#interaction = interaction;
  }

  /** Initialize the interaction modal */
  async init() {
    await this.createTextInteraction();
  }

  /**
   * Create the text interaction
   */
  async createTextInteraction() {
    const interactionAnswerOptions = this.#interaction
      .getInteractionAnswerOptions(this.#state.statements);

    this.drawTextAnswers(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      interactionAnswerOptions,
      12,
    );
  }

  /**
   * Draw the text answers
   *
   * @param {jQuery} $parent - The parent element to append the answer block to.
   * @param {string} selector - The selector of the parent element.
   * @param {InteractionAnswer} interactionAnswerOptions - The interaction answers.
   * @param {number} size - The size of the answer block (the number of columns).
   */
  drawTextAnswers($parent, selector, interactionAnswerOptions, size) {
    const { responses, nrOfAttempts } = interactionAnswerOptions.answer;

    const truncate = (text) => {
      if (text.length <= MAX_RESPONSE_LENGTH) return escapeHtml(text);
      return `${escapeHtml(text.slice(0, MAX_RESPONSE_LENGTH))}&hellip;`;
    };

    const rows = (responses ?? []).map(({ response, timestamp }) => {
      const date = timestamp ? new Date(timestamp).toLocaleString() : '';
      return `
      <div class="py-2 w-100">
        <div class="col-auto rounded py-2 px-4 w-100" style="background-color: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.08)">
          <div class="row">
            <div class="col-9" style="overflow-wrap: break-word;">
              ${truncate(response)}
            </div>
            <div class="col-3 text-right text-muted" style="font-size: 0.85em;">
              ${escapeHtml(date)}
            </div>
          </div>
        </div>
      </div>`;
    }).join('');

    const emptyState = responses && responses.length === 0
      ? `<div class="col-12 p-2 text-muted"><em>No responses recorded.</em></div>`
      : '';

    const body = `
      <div class="col-${size}" id="text-answers-${selector}">
        <div class="py-2 w-100">
          <strong>${nrOfAttempts} response${nrOfAttempts !== 1 ? 's' : ''}</strong>
        </div>
        ${rows}
        ${emptyState}
      </div>
    `;

    $parent.append(body);
  }
}
