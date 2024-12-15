export function drawActivityChart (
  state,
  canvasId,
  startDate,
  endDate,
) {
  const interval = Array.from(
    getDaysFromInterval(luxon.Interval.fromDateTimes(startDate, endDate))
  );

  const data = interval.map((date) => ({ x: date.toFormat('yyyy-MM-dd'), y: 0 }));

  const launchedStatements = DS.StatementVerbHelper.getStatementsByLaunchedVerb(state.statements);
  launchedStatements.forEach((statement) => {
    const statementDate = luxon.DateTime.fromISO(statement.timestamp);
    data.find((day) => day.x === statementDate.toFormat('yyyy-MM-dd')).y += 1;
  });

  // Get the context of the canvas element we want to select
  const ctx = document.getElementById(canvasId).getContext('2d');

  // Create a new Chart instance
  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          data: data,
          borderColor: '#f86718',
          borderWidth: 1.5,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
          pointRadius: 0,
        },
      ]
    },
    options: {
      hover: {
        mode: 'nearest',
        intersect: false
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 20,
          bottom: 10,
        }
      },
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
      },
      responsive: true,
      scales: {
        y: {
          ticks: {
            stepSize: 1,
            maxTicksLimit: 5,
          },
          title: {
            display: true,
            text: XAPI_ACTIVITY_CHART_YAXIS
          }
        },
        x: {
          ticks: {
            maxTicksLimit: 8,
          },
          type: 'time',
          time: {
            unit: 'day'
          },
          min: startDate.toFormat('yyyy-MM-dd'),
          max: endDate.toFormat('yyyy-MM-dd')
        }
      }
    }
  });
}

function* getDaysFromInterval(interval) {
  let cursor = interval.start.startOf('day');
  while (cursor <= interval.end) {
    yield cursor;
    cursor = cursor.plus({ days: 1 });
  }
}
