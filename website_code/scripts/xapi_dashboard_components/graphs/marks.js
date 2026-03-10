/**
 * Draw the marks graph
 *
 * @param {jQuery} $parent - The parent element to append the answer block to.
 * @param {string} selector - The selector of the parent element.
 * @param {Array} statements - The statements to be used in the graph.
 * @param {number} size - The size of the answer block (the number of columns).
 */
export function drawMarksGraph($parent, selector, statements, size) {
  const body = `
    <div class="col-${size}" style="min-height: 400px; max-height: 400px;">
      <canvas id="marks-chart-${selector}" width="400" height="400"></canvas>
    </div>
  `;

  $parent.append(body);

  const graph = new DashboardGraphs.BarGraphReceivedMarks({
    statements,
    options: {
      ctx: document.getElementById(`marks-chart-${selector}`).getContext('2d'),
      barColors: ['#f86718'],
    },
  });
  graph.draw();
}
