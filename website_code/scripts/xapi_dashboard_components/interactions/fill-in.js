import { escapeHtml } from '../utils/escape.js';

export class FillInInteraction {
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

    await this.createFillInInteraction();
  }

  /**
   * Create the fill-in interaction
   */
  async createFillInInteraction() {
    const interactionAnswerOptions = this.#interaction
      .getInteractionAnswerOptions(this.#state.statements);
    const answeredStatements = this.#interaction
      .getAnsweredStatements(this.#state.statements);

    this.#marksChartLib.drawMarksGraph(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      answeredStatements,
      6,
    );

    this.drawFillInAnswers(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      interactionAnswerOptions,
      answeredStatements,
      6,
    );
  }

  /**
   * Draw the fill-in answers
   *
   * @param {jQuery} $parent - The parent element to append the answer block to.
   * @param {string} selector - The selector of the parent element.
   * @param {InteractionAnswer} interactionAnswerOptions - The interaction answers.
   * @param {Array} answeredStatements - The answered statements.
   * @param {number} size - The size of the answer block (the number of columns).
   */
  drawFillInAnswers($parent, selector, interactionAnswerOptions, answeredStatements, size) {
    const { correctResponsesPattern, responses, responsesMap, nrOfAttempts } = interactionAnswerOptions.answer;
    const toPercent = (count) => (nrOfAttempts > 0 ? Math.round((count / nrOfAttempts) * 100) : 0);

    const normalise = (str) => str.trim().toLowerCase();
    const correctPatterns = (correctResponsesPattern ?? []).map(normalise);
    const isCorrectResponse = (response) => correctPatterns.includes(normalise(response));

    const correctPatternsHtml = correctResponsesPattern && correctResponsesPattern.length > 0
      ? `
        <div class="py-2 w-100">
          <div
            class="rounded py-2 px-3 w-100 d-flex align-items-baseline flex-wrap"
            style="background-color: #f8f9fa; border-left: 3px solid #28a745; gap: 0.25rem;"
          >
            <strong class="mr-2 text-nowrap">${XAPI_DASHBOARD_CORRECTANSWERS}:</strong>
            ${correctResponsesPattern.map((p) => `<span class="d-inline-flex align-items-center mr-1"><span class="sr-only">Correct answer:</span><span class="badge" style="background-color: transparent; border: 1px solid #28a745; color: #212529; font-weight: 600; font-size: 0.85em; padding: 0.3em 0.6em;">${escapeHtml(p)}</span></span>`).join('')}
          </div>
        </div>`
      : '';

    const colors = [];

    const rows = (responses ?? []).map((response) => {
      const correct = isCorrectResponse(response);
      const count = responsesMap.get(response) ?? 0;

      colors.push({ key: response, color: correct ? '#62c562' : '#ff0000' });

      const icon = correct
        ? '<i class="fa fa-x-tick" style="width: 1rem; height: 1rem;"/>'
        : '<i class="fa fa-x-cross" style="width: 1rem; height: 1rem;"/>';

      return `
      <div class="py-2 w-100">
        <div class="col-auto rounded py-2 px-4 w-100" style="${correct ? 'background-color: rgba(40, 167, 69, 0.2)' : ''}">
          <div class="row">
            <div class="col-9">
              ${icon} ${escapeHtml(response)}
            </div>
            <div class="col-1">
              ${count}
            </div>
            <div class="col-2">
              (${toPercent(count)}%)
            </div>
          </div>
        </div>
      </div>`;
    }).join('');

    const unansweredCount = responsesMap.get('') ?? 0;
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
      <div class="col-${size}" id="fill-in-answers-${selector}">
        ${correctPatternsHtml}
        ${rows}
        ${unansweredRow}
      </div>
    `;

    $parent.append(body);

    this.#answersGivenChartLib.drawAnswersGivenGraph(
      $(`#fill-in-answers-${selector}`),
      selector,
      answeredStatements,
      colors,
      12,
    );
  }
}
