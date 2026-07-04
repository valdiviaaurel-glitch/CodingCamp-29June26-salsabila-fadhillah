/**
 * tests/helpers/storageManager.js
 *
 * Factory that returns a StorageManager bound to the provided `storage`
 * dependency instead of the global `localStorage`. Used in tests to inject
 * an in-memory storage mock for clean, deterministic assertions.
 */
function makeStorageManager(storage) {
  const KEYS = {
    TASKS: 'tdl_tasks',
    LINKS: 'tdl_links'
  };

  function saveTasks(tasks) {
    storage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  }

  function loadTasks() {
    try {
      const raw = storage.getItem(KEYS.TASKS);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveLinks(links) {
    storage.setItem(KEYS.LINKS, JSON.stringify(links));
  }

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
}

module.exports = { makeStorageManager };
