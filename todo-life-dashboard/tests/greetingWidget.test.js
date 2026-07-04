/**
 * tests/greetingWidget.test.js
 *
 * Unit and property-based tests for GreetingWidget.formatTime and
 * GreetingWidget.formatDate.
 *
 * Feature: todo-life-dashboard
 * Validates: Requirements 1.1, 1.7
 */

'use strict';

const fc = require('fast-check');
const { makeGreetingWidget } = require('./helpers/greetingWidget');

const widget = makeGreetingWidget();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a Date from explicit h/m/s values. */
function makeDate(h, m, s) {
  const d = new Date(2025, 6, 14, h, m, s, 0); // month is 0-indexed
  return d;
}

// ─── formatTime ───────────────────────────────────────────────────────────────

describe('GreetingWidget.formatTime', () => {
  // --- example-based unit tests ---

  test('formats midnight as "00:00:00"', () => {
    expect(widget.formatTime(makeDate(0, 0, 0))).toBe('00:00:00');
  });

  test('formats noon as "12:00:00"', () => {
    expect(widget.formatTime(makeDate(12, 0, 0))).toBe('12:00:00');
  });

  test('zero-pads single-digit hours, minutes, seconds', () => {
    expect(widget.formatTime(makeDate(1, 2, 3))).toBe('01:02:03');
  });

  test('formats last second of day as "23:59:59"', () => {
    expect(widget.formatTime(makeDate(23, 59, 59))).toBe('23:59:59');
  });

  test('returns "--:--:--" for null', () => {
    expect(widget.formatTime(null)).toBe('--:--:--');
  });

  test('returns "--:--:--" for undefined', () => {
    expect(widget.formatTime(undefined)).toBe('--:--:--');
  });

  test('returns "--:--:--" for an invalid Date', () => {
    expect(widget.formatTime(new Date('not a date'))).toBe('--:--:--');
  });

  // --- property-based tests ---

  /**
   * Property 1: formatTime always returns a valid HH:MM:SS string.
   * Validates: Requirements 1.1
   *
   * Feature: todo-life-dashboard, Property 1: Time HH:MM:SS format
   */
  test('property — always returns HH:MM:SS matching pattern for any valid Date', () => {
    // Use dates spanning the full Unix timestamp range for robust coverage
    fc.assert(
      fc.property(fc.date(), (d) => {
        const result = widget.formatTime(d);
        expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        const [hh, mm, ss] = result.split(':').map(Number);
        expect(hh).toBeGreaterThanOrEqual(0);
        expect(hh).toBeLessThanOrEqual(23);
        expect(mm).toBeGreaterThanOrEqual(0);
        expect(mm).toBeLessThanOrEqual(59);
        expect(ss).toBeGreaterThanOrEqual(0);
        expect(ss).toBeLessThanOrEqual(59);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: formatTime returns "--:--:--" for every invalid date.
   * Validates: Requirements 1.7
   *
   * Feature: todo-life-dashboard, Property 1 (fallback): invalid date → "--:--:--"
   */
  test('property — returns "--:--:--" for invalid Date objects', () => {
    // NaN timestamp → invalid Date
    const invalidDate = new Date(NaN);
    expect(widget.formatTime(invalidDate)).toBe('--:--:--');
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('GreetingWidget.formatDate', () => {
  // --- example-based unit tests ---

  test('formats a known date correctly', () => {
    // July 14 2025 is a Monday
    const d = new Date(2025, 6, 14, 10, 0, 0);
    expect(widget.formatDate(d)).toBe('Monday, July 14, 2025');
  });

  test('returns "Welcome" for null', () => {
    expect(widget.formatDate(null)).toBe('Welcome');
  });

  test('returns "Welcome" for undefined', () => {
    expect(widget.formatDate(undefined)).toBe('Welcome');
  });

  test('returns "Welcome" for an invalid Date', () => {
    expect(widget.formatDate(new Date('bad date'))).toBe('Welcome');
  });

  test('returns "Welcome" for a NaN Date', () => {
    expect(widget.formatDate(new Date(NaN))).toBe('Welcome');
  });

  // --- property-based tests ---

  /**
   * Property: formatDate always returns a non-empty string for any valid Date.
   * The string must contain a 4-digit year matching the date's full year.
   * Validates: Requirements 1.1 (date display)
   *
   * Feature: todo-life-dashboard, Property 1: Date format for valid dates
   */
  test('property — always returns a non-empty string containing the full year', () => {
    // Constrain to dates with years in a locale-safe range for toLocaleDateString
    const minDate = new Date(1970, 0, 1);
    const maxDate = new Date(2099, 11, 31);
    const msMin = minDate.getTime();
    const msMax = maxDate.getTime();

    fc.assert(
      fc.property(fc.integer({ min: msMin, max: msMax }), (ms) => {
        const d = new Date(ms);
        const result = widget.formatDate(d);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
        // The formatted string should contain the 4-digit year
        const year = String(d.getFullYear());
        expect(result).toContain(year);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: formatDate never returns "Welcome" for valid dates.
   * Validates: Requirements 1.7 (fallback only fires for invalid dates)
   *
   * Feature: todo-life-dashboard, Property 1 (fallback): valid date → not "Welcome"
   */
  test('property — never returns "Welcome" for a valid Date', () => {
    const msMin = new Date(1970, 0, 1).getTime();
    const msMax = new Date(2099, 11, 31).getTime();

    fc.assert(
      fc.property(fc.integer({ min: msMin, max: msMax }), (ms) => {
        const d = new Date(ms);
        expect(widget.formatDate(d)).not.toBe('Welcome');
      }),
      { numRuns: 100 }
    );
  });
});
