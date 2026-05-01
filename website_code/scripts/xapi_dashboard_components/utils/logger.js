/**
 * Dev logger wired into DashboardState / GroupedData so library-emitted
 * messages surface in the browser devtools console. Prefixed so they're
 * easy to grep for. Flip `ENABLED` to `false` to silence.
 */

const ENABLED = true;
const PREFIX = '[DashboardState]';

const call = (method, level) => (message, meta) => {
  if (!ENABLED) return;
  if (meta !== undefined) {
    console[method](PREFIX, `[${level}]`, message, meta);
  } else {
    console[method](PREFIX, `[${level}]`, message);
  }
};

export const dashboardStateLogger = {
  debug: call('debug', 'DEBUG'),
  info: call('info', 'INFO'),
  warn: call('warn', 'WARN'),
  error: call('error', 'ERROR'),
};
