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

    this.drawHeatmap(
      $(`#detail-${this.#canvas}`),
      this.#canvas,
      interactionAnswerOptions,
    );
  }

  /**
   * Draw the video heatmap using Plotly
   *
   * @param {jQuery} $parent - The parent element to append the chart to.
   * @param {string} selector - The selector of the parent element.
   * @param {InteractionAnswer} interactionAnswerOptions - The interaction answers.
   */
  drawHeatmap($parent, selector, interactionAnswerOptions) {
    const { answer } = interactionAnswerOptions;
    const { durationBlocks, pauseEvents, videoDuration, nrOfLearners } = answer;

    const containerId = `video-heatmap-${selector}`;

    const body = `
      <div class="col-12" id="${containerId}" style="min-height: 400px;">
      </div>
    `;

    $parent.append(body);

    const container = document.getElementById(containerId);

    if (!durationBlocks || durationBlocks.length === 0) {
      container.innerHTML = '<p class="text-muted p-3"><em>No video data available.</em></p>';
      return;
    }

    const maxDuration = videoDuration ?? Math.max(
      ...durationBlocks.map((b) => b.end),
      ...pauseEvents.map((e) => e.position),
      0,
    );

    const traces = [{
      type: 'bar',
      orientation: 'h',
      name: 'Sessions',
      y: durationBlocks.map((_, i) => `Session ${i + 1}`),
      x: durationBlocks.map((b) => b.end - b.start),
      base: durationBlocks.map((b) => b.start),
      customdata: durationBlocks.map((b) => b.end),
      marker: {
        color: 'rgba(54, 162, 235, 0.7)',
        line: {
          color: 'rgba(54, 162, 235, 1)',
          width: 1,
        },
      },
      showlegend: false,
      hovertemplate: '%{y}<br>Start: %{base}s<br>End: %{customdata}s<extra></extra>',
    }];

    const pauseTrace = pauseEvents && pauseEvents.length > 0
      ? [{
        type: 'scatter',
        mode: 'markers',
        name: 'Pause events',
        x: pauseEvents.map((e) => e.position),
        y: pauseEvents.map((_, i) => `Session ${i % durationBlocks.length + 1}`),
        marker: {
          color: 'rgba(255, 99, 132, 0.9)',
          symbol: 'line-ns',
          size: 12,
          line: {
            color: 'rgba(255, 99, 132, 1)',
            width: 2,
          },
        },
        hovertemplate: 'Pause at %{x}s<extra></extra>',
        showlegend: true,
      }]
      : [];

    const layout = {
      title: {
        text: `Video engagement \u2014 ${nrOfLearners} learner${nrOfLearners !== 1 ? 's' : ''}`,
        font: { size: 14 },
      },
      xaxis: {
        title: 'Time (seconds)',
        range: [0, maxDuration > 0 ? maxDuration : 1],
        zeroline: true,
      },
      yaxis: {
        title: 'Session',
        automargin: true,
      },
      barmode: 'overlay',
      margin: { t: 50, l: 100, r: 20, b: 60 },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.newPlot(container, [...traces, ...pauseTrace], layout, config);
  }
}
