import { escapeHtml } from '../utils/escape.js';

export class ChoicesInteraction {
  /** The answers given chart lib */
  #answersGivenChartLib;

  /** The canvas to draw on */
  #canvas;

  /** The interaction object for this interaction */
  #interaction;

  /** The marks chart lib */
  #marksChartLib;

  /** The dashboard state */
  #state;

  /**
  *
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
    this.#answersGivenChartLib = await import('../graphs/answers-given.js');
    this.#marksChartLib = await import('../graphs/marks.js');

    await this.createChoicesInteraction();
  }

  /**
   * Create the choices interaction
   */
  async createChoicesInteraction() {
    const interactionAnswerOptions = this.#interaction
      .getInteractionAnswerOptions(this.#state.statements);
    const answeredStatements = this.#interaction
      .getAnsweredStatements(this.#state.statements);

    this.#marksChartLib.drawMarksGraph(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      answeredStatements,
      6
    );

    this.drawChoiceAnswers(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      interactionAnswerOptions,
      answeredStatements,
      6,
    );
  }

  /**
   * Draw a the choice answers
   *
   * @param {jQuery} $parent - The parent element to append the answer block to.
   * @param {string} selector - The selector of the parent element.
   * @param {InteractionAnswer} interactionAnswerOptions - The interaction answers.
   * @param {Array} statements - The statements to be used in the graph.
   * @param {number} size - The size of the answer block (the number of columns).
   */
  drawChoiceAnswers($parent, selector, interactionAnswerOptions, answeredStatements, size) {
    const { nrOfAttempts } = interactionAnswerOptions.answer;
    const toPercent = (count) => (nrOfAttempts > 0 ? Math.round(count / nrOfAttempts * 100) : 0);
    const colors = [];

    const rows = interactionAnswerOptions.answer.choices.map((choice) => {
      const correct = interactionAnswerOptions.answer.correctResponsesPattern.includes(choice);

      // Map each answer choice to its color: green for correct, red for incorrect
      colors.push({ key: choice, color: correct ? '#62c562' : '#ff0000' });

      const icon = correct
        ? '<i class="fa fa-x-tick" style="width: 1rem; height: 1rem;"/>'
        : '<i class="fa fa-x-cross" style="width: 1rem; height: 1rem;"/>';

      const answerResponse = interactionAnswerOptions.answer.choicesResponse.get(choice) ?? 0;
      return `
      <div class="py-2 w-100">
        <div class="col-auto rounded py-2 px-4 w-100" style="${correct ? 'background-color: rgba(40, 167, 69, 0.2)' : ''}">
          <div class="row">
            <div class="col-9">
              ${icon} ${escapeHtml(choice)}
            </div>
            <div class="col-1">
              ${answerResponse}
            </div>
            <div class="col-2">
              (${toPercent(answerResponse)}%)
            </div>
          </div>
        </div>
      </div>`;
    }).join('');

    const unansweredCount = interactionAnswerOptions.answer.choicesResponse.get('') ?? 0;
    let unansweredRow = '';
    if (unansweredCount > 0) {
      colors.push({ key: '', color: '#aaaaaa' });
      unansweredRow = `
      <div class="py-2 w-100">
        <div class="col-auto rounded py-2 px-4 w-100" style="background-color: rgba(170, 170, 170, 0.2)">
          <div class="row">
            <div class="col-9">${XAPI_DASHBOARD_UNANSWERED}</div>
            <div class="col-1">${unansweredCount}</div>
            <div class="col-2">(${toPercent(unansweredCount)}%)</div>
          </div>
        </div>
      </div>`;
    }

    const body = `
      <div class="col-12 col-md-${size}" id="choices-answers-${selector}">
        ${rows}
        ${unansweredRow}
      </div>
    `;

    $parent.append(body);

    this.#answersGivenChartLib.drawAnswersGivenGraph(
      $(`#choices-answers-${selector}`),
      selector,
      answeredStatements,
      colors,
      12
    );
  }
}
