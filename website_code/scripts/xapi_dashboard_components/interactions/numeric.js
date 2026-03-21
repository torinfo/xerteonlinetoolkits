import { escapeHtml } from '../utils/escape.js';

export class NumericInteraction {
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
    this.#marksChartLib = await import('../graphs/marks.js');

    await this.createNumericInteraction();
  }

  /**
   * Create the numeric interaction
   */
  async createNumericInteraction() {
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

    this.drawNumericAnswers(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      interactionAnswerOptions,
      6,
    );
  }

  /**
   * Parse the correct responses pattern into a human-readable range or value string.
   *
   * @param {string[]} correctResponsesPattern - The correct responses pattern array.
   * @returns {{ label: string, min: number|null, max: number|null }}
   */
  // eslint-disable-next-line class-methods-use-this
  #parseCorrectPattern(correctResponsesPattern) {
    if (!correctResponsesPattern || correctResponsesPattern.length === 0) {
      return { label: 'N/A', min: null, max: null };
    }

    const pattern = correctResponsesPattern[0];

    if (pattern.includes(':')) {
      const [rawMin, rawMax] = pattern.split(':');
      const minVal = rawMin !== '' ? Number(rawMin) : null;
      const maxVal = rawMax !== '' ? Number(rawMax) : null;

      if (minVal !== null && maxVal !== null) {
        return { label: `${minVal} \u2013 ${maxVal}`, min: minVal, max: maxVal };
      }
      if (minVal !== null) {
        return { label: `\u2265 ${minVal}`, min: minVal, max: null };
      }
      if (maxVal !== null) {
        return { label: `\u2264 ${maxVal}`, min: null, max: maxVal };
      }
    }

    return { label: escapeHtml(pattern), min: Number(pattern), max: Number(pattern) };
  }

  /**
   * Format a numeric value for display, falling back to a dash when undefined.
   *
   * @param {number|undefined} value - The value to format.
   * @param {number} [decimals=2] - Decimal places to show.
   * @returns {string}
   */
  // eslint-disable-next-line class-methods-use-this
  #formatNumber(value, decimals = 2) {
    if (value === undefined || value === null) return '&mdash;';
    return Number.isInteger(value) ? String(value) : value.toFixed(decimals);
  }

  /**
   * Draw the numeric answers summary
   *
   * @param {jQuery} $parent - The parent element to append the answer block to.
   * @param {string} selector - The selector of the parent element.
   * @param {InteractionAnswer} interactionAnswerOptions - The interaction answers.
   * @param {number} size - The size of the answer block (the number of columns).
   */
  drawNumericAnswers($parent, selector, interactionAnswerOptions, size) {
    const {
      correctResponsesPattern,
      responses,
      min,
      max,
      mean,
      median,
      correctCount,
      nrOfAttempts,
    } = interactionAnswerOptions.answer;

    const { label: correctLabel } = this.#parseCorrectPattern(correctResponsesPattern);
    const toPercent = (count) => (nrOfAttempts > 0 ? Math.round((count / nrOfAttempts) * 100) : 0);

    const correctIsRange = correctResponsesPattern
      && correctResponsesPattern.length > 0
      && correctResponsesPattern[0].includes(':');

    const correctRangeLabel = correctIsRange ? 'Correct range:' : 'Correct value:';

    const hasResponses = responses && responses.length > 0;

    const body = `
      <div class="col-12 col-md-${size}" id="numeric-answers-${selector}">
        <div class="py-2 w-100">
          <div class="col-auto rounded py-2 px-4 w-100" style="background-color: rgba(40, 167, 69, 0.1); border: 1px solid rgba(40, 167, 69, 0.3)">
            <div class="row">
              <div class="col-12">
                <strong>${correctRangeLabel}</strong>
                <span class="ml-2">${correctLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="py-2 w-100">
          <div class="col-auto rounded py-2 px-4 w-100" style="background-color: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.08)">
            <div class="row mb-1">
              <div class="col-6 text-muted">Mean</div>
              <div class="col-6 text-right">${this.#formatNumber(mean)}</div>
            </div>
            <div class="row mb-1">
              <div class="col-6 text-muted">Median</div>
              <div class="col-6 text-right">${this.#formatNumber(median)}</div>
            </div>
            <div class="row mb-1">
              <div class="col-6 text-muted">Min given</div>
              <div class="col-6 text-right">${hasResponses ? this.#formatNumber(min) : '&mdash;'}</div>
            </div>
            <div class="row">
              <div class="col-6 text-muted">Max given</div>
              <div class="col-6 text-right">${hasResponses ? this.#formatNumber(max) : '&mdash;'}</div>
            </div>
          </div>
        </div>

        <div class="py-2 w-100">
          <div class="col-auto rounded py-2 px-4 w-100" style="background-color: rgba(40, 167, 69, 0.2)">
            <div class="row">
              <div class="col-12">
                <strong>${correctCount ?? 0}</strong> of <strong>${nrOfAttempts}</strong>
                response${nrOfAttempts !== 1 ? 's' : ''} correct
                (${toPercent(correctCount ?? 0)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    $parent.append(body);
  }
}
