export class VideoInteraction {
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
    await this.createVideoInteraction();
  }

  /**
   * Create the video interaction
   */
  async createVideoInteraction() {
    const interactionAnswerOptions = this.#interaction
      .getVideoAnswerOptions(this.#state.statements);

    const { answer } = interactionAnswerOptions;
    // pauseEvents is intentionally not used — the DashboardGraphs video charts
    // do not visualize individual pause markers.
    const { durationBlocks, videoDuration, nrOfLearners } = answer;

    const $parent = $(`#detail-${this.#canvas}`);

    if (!durationBlocks || durationBlocks.length === 0) {
      $parent.append('<p class="text-muted p-3"><em>No video data available.</em></p>');
      return;
    }

    const sessions = durationBlocks.map((b) => [b]);

    const resolvedDuration = videoDuration
      ?? durationBlocks.reduce((max, b) => (b.end > max ? b.end : max), 0);

    if (resolvedDuration <= 0) {
      $parent.append('<p class="text-muted p-3"><em>No video data available.</em></p>');
      return;
    }

    const learnerCount = nrOfLearners ?? 0;

    this.drawRetentionGraph($parent, this.#canvas, sessions, resolvedDuration, learnerCount);
    this.drawHeatmapGraph($parent, this.#canvas, sessions, resolvedDuration, learnerCount);
  }

  /**
   * Draw the video retention area chart using DashboardGraphs
   *
   * @param {jQuery} $parent - The parent element to append the chart to.
   * @param {string} selector - The selector of the parent element.
   * @param {Array<Array<{start: number, end: number}>>} sessions - The session segments.
   * @param {number} videoDuration - The total video duration in seconds.
   * @param {number} nrOfLearners - The number of unique learners.
   */
  drawRetentionGraph($parent, selector, sessions, videoDuration, nrOfLearners) {
    const canvasId = `video-retention-${selector}`;
    const title = `Video retention \u2014 ${nrOfLearners} learner${nrOfLearners !== 1 ? 's' : ''}`;

    const body = `
      <div class="col-12 col-md-6" style="min-height: 400px;">
        <canvas id="${canvasId}" width="400" height="400"></canvas>
      </div>
    `;

    $parent.append(body);

    const graph = new DashboardGraphs.AreaChartVideoRetention({
      options: {
        ctx: document.getElementById(canvasId).getContext('2d'),
        sessions,
        videoDuration,
        title,
      },
    });
    graph.draw();
  }

  /**
   * Draw the video viewing heatmap using DashboardGraphs
   *
   * @param {jQuery} $parent - The parent element to append the chart to.
   * @param {string} selector - The selector of the parent element.
   * @param {Array<Array<{start: number, end: number}>>} sessions - The session segments.
   * @param {number} videoDuration - The total video duration in seconds.
   * @param {number} nrOfLearners - The number of unique learners.
   */
  drawHeatmapGraph($parent, selector, sessions, videoDuration, nrOfLearners) {
    const canvasId = `video-heatmap-${selector}`;
    const title = `Video viewing heatmap \u2014 ${nrOfLearners} learner${nrOfLearners !== 1 ? 's' : ''}`;

    const body = `
      <div class="col-12 col-md-6" style="min-height: 400px;">
        <canvas id="${canvasId}" width="400" height="400"></canvas>
      </div>
    `;

    $parent.append(body);

    const graph = new DashboardGraphs.HeatmapVideoViewing({
      options: {
        ctx: document.getElementById(canvasId).getContext('2d'),
        sessions,
        videoDuration,
        title,
      },
    });
    graph.draw();
  }
}
