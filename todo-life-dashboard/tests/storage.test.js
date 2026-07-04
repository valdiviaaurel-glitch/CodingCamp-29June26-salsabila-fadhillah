/**
 * tests/storage.test.js
 *
 * Property-based tests for StorageManager persistence round-trips.
 * Uses fast-check (fc) with Jest.
 */

// Feature: todo-life-dashboard, Property 12: Link persistence round-trip
// Feature: todo-life-dashboard, Property 13: Corrupt storage always falls back to empty array

'use strict';

const fc = require('fast-check');
const { makeStorageManager } = require('./helpers/storageManager');

/**
 * In-memory storage mock that replicates the localStorage interface.
 * A fresh instance is created per property run so tests are isolated.
 */
function makeMemoryStorage() {
  const store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = value; }
  };
}

/**
 * Arbitrary that generates valid Link objects:
 *   { id: string (non-empty), label: string (non-empty), url: http(s):// string }
 */
const linkArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  label: fc.string({ minLength: 1 }),
  url: fc.oneof(
    fc.string().map(s => 'http://' + s),
    fc.string().map(s => 'https://' + s)
  )
});

// ---------------------------------------------------------------------------
// Property 12: Link persistence round-trip
// Validates: Requirements 4.9, 5.1, 5.2
// ---------------------------------------------------------------------------
describe('StorageManager — link persistence', () => {
  test(
    'Property 12: saveLinks then loadLinks returns deep-equal array (100+ runs)',
    () => {
      // Feature: todo-life-dashboard, Property 12: Link persistence round-trip
      fc.assert(
        fc.property(fc.array(linkArbitrary), (links) => {
          const storage = makeMemoryStorage();
          const sm = makeStorageManager(storage);

          sm.saveLinks(links);
          const loaded = sm.loadLinks();

          // Deep structural equality — same IDs, labels, URLs, same order
          expect(loaded).toEqual(links);
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 13: Corrupt storage always falls back to empty array
// Validates: Requirements 4.10, 5.3, 5.4, 5.5, 5.6
// ---------------------------------------------------------------------------

/**
 * Arbitrary that generates corrupt/malformed storage values:
 *   - null
 *   - non-JSON strings (strings that fail JSON.parse)
 *   - JSON non-array scalars: integers, doubles, booleans
 *   - JSON objects (plain dictionaries — not arrays)
 *
 * Each value is serialised back to a string via JSON.stringify so that
 * getItem can return it exactly as localStorage would (a string or null).
 */
const corruptValueArbitrary = fc.oneof(
  // null — getItem returns null when the key is absent
  fc.constant(null),
  // non-JSON strings — strings that JSON.parse will throw on
  fc.string().filter(s => {
    try { JSON.parse(s); return false; } catch (e) { return true; }
  }),
  // JSON integer scalar
  fc.integer().map(n => JSON.stringify(n)),
  // JSON floating-point scalar
  fc.double({ noNaN: true, noDefaultInfinity: true }).map(n => JSON.stringify(n)),
  // JSON boolean scalar
  fc.boolean().map(b => JSON.stringify(b)),
  // JSON plain object (dictionary, not an array)
  fc.dictionary(fc.string({ minLength: 1 }), fc.string()).map(obj => JSON.stringify(obj))
);

describe('StorageManager — corrupt storage fallback', () => {
  test(
    'Property 13: loadTasks() returns [] and does not throw for any corrupt storage value (100+ runs)',
    () => {
      // Feature: todo-life-dashboard, Property 13: Corrupt storage always falls back to empty array
      fc.assert(
        fc.property(corruptValueArbitrary, (corruptValue) => {
          // Build a mock that returns the corrupt value for any key
          const mockStorage = {
            getItem: (_key) => corruptValue,
            setItem: (_key, _value) => {}
          };

          const sm = makeStorageManager(mockStorage);

          let result;
          expect(() => { result = sm.loadTasks(); }).not.toThrow();
          expect(result).toEqual([]);
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    'Property 13: loadLinks() returns [] and does not throw for any corrupt storage value (100+ runs)',
    () => {
      // Feature: todo-life-dashboard, Property 13: Corrupt storage always falls back to empty array
      fc.assert(
        fc.property(corruptValueArbitrary, (corruptValue) => {
          const mockStorage = {
            getItem: (_key) => corruptValue,
            setItem: (_key, _value) => {}
          };

          const sm = makeStorageManager(mockStorage);

          let result;
          expect(() => { result = sm.loadLinks(); }).not.toThrow();
          expect(result).toEqual([]);
        }),
        { numRuns: 100 }
      );
    }
  );
});
