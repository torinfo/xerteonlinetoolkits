/**
 * Draw a the answers given graph
 *
 * @param {jQuery} $parent - The parent element to append the answer block to.
 * @param {string} selector - The selector of the parent element.
 * @param {Array} statements - The statements to be used in the graph.
 * @param {Array<{key: string, color: string}>} colors - Array of ColorDefinition objects (colorDefinitions) mapping answer choices to hex colors.
 * @param {number} size - The size of the answer block (the number of columns).
 * @param {object} options - The options provided to the graph.
 */
export function drawAnswersGivenGraph(
  $parent,
  selector,
  statements,
  colors,
  size,
  options = {},
) {
  const body = `
    <div class="col-12 col-md-${size}" style="min-height: 400px;">
      <canvas id="answers-chart-${selector}" width="400" height="400"></canvas>
    </div>
  `;

  $parent.append(body);

  const graph = new DashboardGraphs.BarGraphGivenAnswers({
    statements,
    options: {
      ctx: document.getElementById(`answers-chart-${selector}`).getContext('2d'),
      colorDefinitions: colors,
      emptyLabel: XAPI_DASHBOARD_UNANSWERED,
      ...options
    },
  });
  graph.draw();
}
