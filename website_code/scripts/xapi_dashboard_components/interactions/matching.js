import { escapeHtml } from '../utils/escape.js';

export class MatchingInteraction {
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
    [this.#answersGivenChartLib, this.#marksChartLib] = await Promise.all([
      import('../graphs/answers-given.js'),
      import('../graphs/marks.js'),
    ]);

    await this.createMatchingInteraction();
  }

  /**
   * Create the matching interaction
   */
  async createMatchingInteraction() {
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

    this.drawMatchingAnswers(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      interactionAnswerOptions,
      answeredStatements,
      6,
    );
  }

  /**
   * Draw the matching answers grouped by target with accent indicators, followed by
   * a bar chart of all pair responses given by learners.
   *
   * @param {jQuery} $parent - The parent element to append the answer block to.
   * @param {string} selector - The selector of the parent element.
   * @param {InteractionAnswer} interactionAnswerOptions - The interaction answers.
   * @param {Array} answeredStatements - The answered statements.
   * @param {number} size - The size of the answer block (the number of columns).
   */
  drawMatchingAnswers($parent, selector, interactionAnswerOptions, answeredStatements, size) {
    const { answer } = interactionAnswerOptions;
    const sources = answer.sources ?? [];
    const correctPairs = answer.correctPairs ?? new Map();
    const pairsResponse = answer.pairsResponse ?? new Map();

    const groupedByTarget = new Map();
    const colors = [];

    sources.forEach((source) => {
      const target = correctPairs.get(source);
      if (target === undefined) return;
      const existing = groupedByTarget.get(target);
      if (existing) {
        existing.push(source);
      } else {
        groupedByTarget.set(target, [source]);
      }
      colors.push({ key: `${source}[.]${target}`, color: '#28a745' });
    });

    pairsResponse.forEach((count, pairKey) => {
      if (count === 0) return;
      const separatorIndex = pairKey.indexOf('[.]');
      if (separatorIndex === -1) return;
      const source = pairKey.substring(0, separatorIndex);
      const target = pairKey.substring(separatorIndex + 3);
      const expectedTarget = correctPairs.get(source);
      if (expectedTarget !== target) {
        colors.push({ key: pairKey, color: '#dc3545' });
      }
    });

    let content;
    if (groupedByTarget.size === 0) {
      content = '<p class="text-muted">No matching pairs recorded.</p>';
    } else {
      const pairs = [];
      groupedByTarget.forEach((sourcesForTarget, target) => {
        const sourceBadges = sourcesForTarget.map((source) => `
          <span class="d-inline-flex align-items-center mr-1 mb-1" style="gap: 0.25rem;">
            <span class="sr-only">Correct match:</span>
            <span class="badge" style="background-color: transparent; border: 1px solid #28a745; color: #212529; font-weight: 600; font-size: 0.85em; padding: 0.3em 0.6em;">${escapeHtml(source)}</span>
          </span>`).join('');

        pairs.push(`
          <div class="mb-2">
            <div class="font-weight-bold small mb-1" style="color: #212529;">${escapeHtml(target)}</div>
            <div class="d-flex flex-wrap align-items-center" style="gap: 0.25rem;">
              ${sourceBadges}
            </div>
          </div>`);
      });

      content = `
        <div class="py-2 w-100">
          <div
            class="rounded py-2 px-3 w-100"
            style="background-color: #f8f9fa; border-left: 3px solid #28a745;"
          >
            <strong class="d-block mb-2">${XAPI_DASHBOARD_CORRECTANSWERS}:</strong>
            ${pairs.join('')}
          </div>
        </div>`;
    }

    const body = `
      <div class="col-${size}" id="matching-answers-${selector}">
        ${content}
      </div>
    `;

    $parent.append(body);

    console.log('kaas answered_statements', answeredStatements, colors);

    this.#answersGivenChartLib.drawAnswersGivenGraph(
      $(`#matching-answers-${selector}`),
      selector,
      answeredStatements,
      colors,
      12,
      {
        showAbsoluteValues: true,
        yAxisLabel: XAPI_DASHBOARD_GRAPH_CHOICE_YAXIS,
        groupAnswersByGroup: true,
      },
    );
  }
}
