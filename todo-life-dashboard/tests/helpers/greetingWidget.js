/**
 * tests/helpers/greetingWidget.js
 *
 * Standalone implementation of GreetingWidget pure functions extracted for
 * testing. Mirrors the production code in js/app.js exactly so tests remain
 * decoupled from the global scope of app.js.
 */
function makeGreetingWidget() {
  return {
    /**
     * Format a Date as "HH:MM:SS" with zero-padded components.
     * Returns "--:--:--" if date is null/undefined or has an invalid time value.
     * @param {Date} date
     * @returns {string}
     */
    formatTime(date) {
      if (!date || isNaN(date.getTime())) return '--:--:--';
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    },

    /**
     * Format a Date as a full locale date string, e.g. "Monday, July 14, 2025".
     * Returns "Welcome" if date is null/undefined or has an invalid time value.
     * @param {Date} date
     * @returns {string}
     */
    formatDate(date) {
      if (!date || isNaN(date.getTime())) return 'Welcome';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
  };
}

module.exports = { makeGreetingWidget };
