/**
 * Escapes a string for safe insertion into HTML content.
 * Must be applied to ALL xAPI-derived values before template literal interpolation.
 *
 * @param {*} str - The value to escape
 * @returns {string} HTML-safe string
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str ?? '')));
  return div.innerHTML;
}

/**
 * Escapes a string for safe insertion into an HTML attribute value delimited by double quotes.
 * Extends escapeHtml by also replacing double-quote characters with &quot; to prevent
 * attribute breakout in template-literal HTML construction.
 *
 * @param {*} str - The value to escape
 * @returns {string} HTML attribute-safe string
 */
export function escapeHtmlAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

/**
 * Creates a safe, HTML-attribute-safe element ID from a prefix and an arbitrary URL.
 * Replaces all non-alphanumeric characters with underscores.
 *
 * Use instead of $.escapeSelector() when constructing HTML id attributes.
 * Note: use the same ID when calling document.getElementById() — do NOT
 * use a CSS-escaped selector variant for getElementById().
 *
 * @param {string} prefix - A safe prefix string (e.g. 'modal-container')
 * @param {string} url - The interaction URL (may contain special characters)
 * @returns {string} A safe ID string for use in HTML attributes
 */
export function toSafeId(prefix, url) {
  return `${prefix}-${url.replace(/[^A-Za-z0-9]/g, '_')}`;
}
