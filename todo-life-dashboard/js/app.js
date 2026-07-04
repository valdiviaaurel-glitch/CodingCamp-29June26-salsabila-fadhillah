/* js/app.js — To-Do Life Dashboard logic */

// ─── StorageManager ───────────────────────────────────────────────────────────
// Central read/write abstraction for localStorage.
// Accepts an injectable `storage` dependency (defaults to localStorage) to allow
// clean mocking in tests without altering production behaviour.

const StorageManager = (function (storage) {
  const KEYS = {
    TASKS: 'tdl_tasks',
    LINKS: 'tdl_links'
  };

  /**
   * Serialize `tasks` to JSON and persist under KEYS.TASKS.
   * @param {Array} tasks
   */
  function saveTasks(tasks) {
    storage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  }

  /**
   * Read and deserialize the task list from storage.
   * Returns [] for any missing, unparseable, or non-array value.
   * @returns {Array}
   */
  function loadTasks() {
    try {
      const raw = storage.getItem(KEYS.TASKS);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Serialize `links` to JSON and persist under KEYS.LINKS.
   * @param {Array} links
   */
  function saveLinks(links) {
    storage.setItem(KEYS.LINKS, JSON.stringify(links));
  }

  /**
   * Read and deserialize the links list from storage.
   * Returns [] for any missing, unparseable, or non-array value.
   * @returns {Array}
   */
  function loadLinks() {
    try {
      const raw = storage.getItem(KEYS.LINKS);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  return { KEYS, saveTasks, loadTasks, saveLinks, loadLinks };
})(typeof localStorage !== 'undefined' ? localStorage : {});

// ─── FocusTimer ───────────────────────────────────────────────────────────────
// Owns the 25-minute Pomodoro countdown timer section.
// State machine: RESET → RUNNING → PAUSED → RUNNING → COMPLETE → RESET
// Manages a single setInterval reference for the countdown tick.

const FocusTimer = {
  /** Total seconds for one Pomodoro session (25 × 60). */
  INITIAL_SECONDS: 1500,

  /** Seconds remaining in the current session. */
  remaining: 1500,

  /** Handle returned by setInterval, or null when the timer is not running. */
  intervalId: null,

  /**
   * Current timer state.
   * @type {'RESET' | 'RUNNING' | 'PAUSED' | 'COMPLETE'}
   */
  state: 'RESET',

  /**
   * Convert a whole-second count to a zero-padded "MM:SS" string.
   * Valid input range: [0..1500] (0:00 through 25:00).
   *
   * @param {number} seconds - Integer number of seconds in [0..1500].
   * @returns {string} Time formatted as "MM:SS" (e.g. 1500 → "25:00", 65 → "01:05").
   */
  formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  },

  // init(), start(), stop(), reset(), _tick(), _updateUI() — added in task 4.3
};

// ─── GreetingWidget ───────────────────────────────────────────────────────────
// Owns the greeting/clock section of the DOM.
// Uses setInterval to update every second.

const GreetingWidget = {
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

  // getGreeting(hour) and init() will be added in task 3.3
};
