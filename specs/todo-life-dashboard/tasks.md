# Implementation Plan: To-Do Life Dashboard

## Overview

Implement a self-contained, browser-based productivity homepage using plain HTML, CSS, and Vanilla JavaScript. All logic lives in a single `js/app.js` file and all styles in `css/style.css`. Data is persisted client-side via `localStorage`. The build is incremental: shared infrastructure first, then each widget, then integration wiring.

---

## Tasks

- [x] 1. Set up project structure and HTML skeleton
  - Create `index.html` with semantic section elements for each widget (greeting, timer, todo list, quick links)
  - Create `css/style.css` (empty placeholder, linked from `index.html`)
  - Create `js/app.js` (empty placeholder, linked from `index.html` with `defer`)
  - No external network requests or CDN links — fully self-contained
  - _Requirements: 6.2, 6.6_

- [ ] 2. Implement StorageManager module
  - [-] 2.1 Implement `StorageManager` with `saveTasks`, `loadTasks`, `saveLinks`, `loadLinks`
    - Use distinct keys `tdl_tasks` and `tdl_links`
    - Serialize with `JSON.stringify` on save; deserialize with `JSON.parse` inside `try/catch` on load
    - Return `[]` for any missing, unparseable, or non-array value
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [~] 2.2 Write property test for corrupt storage fallback (Property 13)
    - **Property 13: Corrupt storage always falls back to empty array**
    - Feed malformed values (null, non-JSON, JSON non-array) into the storage mock and assert `loadTasks()` and `loadLinks()` each return `[]` without throwing
    - **Validates: Requirements 4.10, 5.3, 5.4, 5.5, 5.6**

  - [~] 2.3 Write property test for task persistence round-trip (Property 9)
    - **Property 9: Task persistence round-trip**
    - Generate arbitrary arrays of valid `Task` objects via `fc.array(taskArbitrary)`, call `saveTasks` then `loadTasks`, assert deep equality
    - **Validates: Requirements 3.10, 5.1, 5.2**

  - [~] 2.4 Write property test for link persistence round-trip (Property 12)
    - **Property 12: Link persistence round-trip**
    - Generate arbitrary arrays of valid `Link` objects via `fc.array(linkArbitrary)`, call `saveLinks` then `loadLinks`, assert deep equality
    - **Validates: Requirements 4.9, 5.1, 5.2**

- [ ] 3. Implement GreetingWidget
  - [~] 3.1 Implement `GreetingWidget.formatTime(date)` and `GreetingWidget.formatDate(date)`
    - `formatTime` returns `"HH:MM:SS"` with zero-padded hours, minutes, seconds
    - `formatDate` returns full date string (e.g., `"Monday, July 14, 2025"`)
    - If `new Date()` produces an invalid date, display `"--:--:--"` and `"Welcome"`
    - _Requirements: 1.1, 1.7_

  - [~] 3.2 Write property test for time format (Property 1)
    - **Property 1: Time formatting is always valid HH:MM:SS**
    - Generate `fc.date()` inputs, call `formatTime`, assert output matches `/^\d{2}:\d{2}:\d{2}$/` with components in valid ranges
    - **Validates: Requirements 1.1**

  - [~] 3.3 Implement `GreetingWidget.getGreeting(hour)` and `GreetingWidget.init()`
    - Map hour to one of `"Good Morning"` (05-11), `"Good Afternoon"` (12-17), `"Good Evening"` (18-20), `"Good Night"` (21-04)
    - `init()` starts a 1-second `setInterval` calling `_tick()` to update the DOM
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [~] 3.4 Write property test for greeting coverage (Property 2)
    - **Property 2: Greeting mapping covers all hours**
    - Generate `fc.integer({min:0, max:23})`, call `getGreeting`, assert result is one of the four valid strings — never empty or unexpected
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

- [ ] 4. Implement FocusTimer
  - [~] 4.1 Implement `FocusTimer.formatTime(seconds)` and core state fields
    - `formatTime` converts an integer in `[0..1500]` to `"MM:SS"` with zero padding
    - Initialize `INITIAL_SECONDS = 1500`, `remaining`, `intervalId`
    - _Requirements: 2.1, 2.3_

  - [~] 4.2 Write property test for timer MM:SS format (Property 3)
    - **Property 3: Timer MM:SS format is always valid**
    - Generate `fc.integer({min:0, max:1500})`, call `formatTime`, assert output matches `/^\d{2}:\d{2}$/` with MM in [00..25] and SS in [00..59]
    - **Validates: Requirements 2.3**

  - [~] 4.3 Implement `FocusTimer.init()`, `start()`, `stop()`, `reset()`, `_tick()`, and `_updateUI()`
    - `init()` sets remaining to 1500 and renders `"25:00"`
    - `start()` creates the countdown interval; disabled when RUNNING or COMPLETE
    - `stop()` clears the interval; disabled when RESET or PAUSED
    - `reset()` clears the interval and restores state to RESET / `"25:00"`
    - `_tick()` decrements remaining; at 0 transitions to COMPLETE, shows completion message, disables start and stop
    - `_updateUI()` syncs button enabled/disabled states and time display to current state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [~] 4.4 Write property test for reset restoring initial state (Property 4)
    - **Property 4: Timer reset always restores initial state**
    - Generate arbitrary remaining value in `[0..1500]` and random state (running/paused/completed), call `reset()`, assert `remaining === 1500` and display shows `"25:00"`
    - **Validates: Requirements 2.6**

- [~] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement TodoList
  - [~] 6.1 Implement `TodoList` data operations: `addTask`, `toggleTask`, `editTask`, `deleteTask`, `_save`
    - Each `Task` has `{ id, label, completed }` — generate ID via `crypto.randomUUID()` or `Date.now().toString()`
    - `addTask`: trim label; reject with validation message if empty, otherwise push and call `_save()`
    - `toggleTask`: flip `completed` on matching ID and call `_save()`
    - `editTask`: trim new label; reject with validation message if empty, otherwise update label and call `_save()`
    - `deleteTask`: remove matching ID and call `_save()`
    - `_save`: delegates to `StorageManager.saveTasks(this.tasks)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8, 3.9_

  - [~] 6.2 Write property test for valid task addition (Property 5)
    - **Property 5: Adding any valid task grows the list by exactly one**
    - Generate `fc.string({minLength:1}).filter(s => s.trim().length > 0)` as label, call `addTask`, assert list length increased by exactly 1 and new task is present
    - **Validates: Requirements 3.2**

  - [~] 6.3 Write property test for whitespace-only label rejection (Property 6)
    - **Property 6: Whitespace-only labels are always rejected**
    - Generate `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))`, call `addTask` and `editTask`, assert task list remains unchanged
    - **Validates: Requirements 3.3, 3.7**

  - [~] 6.4 Write property test for toggle as own inverse (Property 7)
    - **Property 7: Task completion toggle is its own inverse**
    - Generate a task with `fc.boolean()` as initial `completed` state, toggle twice, assert state returns to original; toggle once, assert state is flipped
    - **Validates: Requirements 3.4**

  - [~] 6.5 Write property test for task deletion (Property 8)
    - **Property 8: Deleting a task removes it completely**
    - Generate `fc.array(taskArbitrary, {minLength:1})`, pick a task to delete, call `deleteTask(id)`, assert the ID is absent and list length decreased by exactly 1
    - **Validates: Requirements 3.8**

  - [~] 6.6 Implement `TodoList.init()` and `_render()`
    - `init()` calls `StorageManager.loadTasks()` and assigns to `this.tasks`, then calls `_render()`
    - `_render()` clears and rebuilds the task list DOM: each task shows label, complete toggle, edit button, delete button
    - Edit mode replaces label display with a pre-filled `<input>` and save/cancel controls
    - Apply strikethrough + reduced opacity to completed tasks
    - _Requirements: 3.5, 3.10_

- [ ] 7. Implement QuickLinks
  - [~] 7.1 Implement `QuickLinks` data operations: `addLink`, `deleteLink`, `_save`
    - Each `Link` has `{ id, label, url }`
    - `addLink`: validate non-empty label (max 50 chars) and URL starting with `http://` or `https://` (case-insensitive); reject with field-specific message if invalid; otherwise push and call `_save()`
    - `deleteLink`: remove matching ID and call `_save()`
    - `_save`: delegates to `StorageManager.saveLinks(this.links)`
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [~] 7.2 Write property test for valid link addition (Property 10)
    - **Property 10: Adding any valid link grows the panel by exactly one**
    - Generate valid label + URL with `http://` or `https://` prefix, call `addLink`, assert list length increased by exactly 1 and new link is present
    - **Validates: Requirements 4.4**

  - [~] 7.3 Write property test for invalid URL rejection (Property 11)
    - **Property 11: Invalid URLs are always rejected**
    - Generate strings that do NOT begin with `http://` or `https://` (empty strings, plain domains, `ftp://` URLs), call `addLink`, assert links list is unchanged
    - **Validates: Requirements 4.5**

  - [~] 7.4 Implement `QuickLinks.init()` and `_render()`
    - `init()` calls `StorageManager.loadLinks()` and assigns to `this.links`, then calls `_render()`
    - `_render()` clears and rebuilds the links DOM: each link is a clickable button opening the URL in a new tab, plus a delete control
    - Render empty panel (no error) when `this.links` is an empty array
    - _Requirements: 4.1, 4.2, 4.9, 4.10_

- [~] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Apply CSS layout and visual design
  - [~] 9.1 Implement responsive grid layout in `css/style.css`
    - Default (mobile-first): single-column stacked layout
    - At `768px` and above: multi-column grid (minimum 2 columns, scaling up to 4 at `1920px`)
    - Use a single typeface and consistent padding/margin variables throughout
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

  - [~] 9.2 Implement widget-specific styles
    - Greeting section: prominent time display, subdued date, greeting text
    - Timer section: large countdown display, clearly visible control buttons with disabled states styled differently
    - Todo list: strikethrough + opacity for completed tasks, inline edit mode, validation message styling
    - Quick links: button grid, delete affordance on each link button, validation message styling
    - _Requirements: 3.4, 2.7, 6.3_

- [ ] 10. Wire everything together in `app.js`
  - [~] 10.1 Implement the `DOMContentLoaded` bootstrap in `app.js`
    - Call `GreetingWidget.init()`
    - Call `FocusTimer.init()`
    - Call `TodoList.init()`
    - Call `QuickLinks.init()`
    - Confirm no external network requests are made at load time
    - _Requirements: 6.2, 6.6_

  - [~] 10.2 Write integration tests for widget init and localStorage interaction
    - Mock `localStorage` with an in-memory store
    - Test: `TodoList.init()` with pre-seeded tasks renders the correct number of task elements
    - Test: `QuickLinks.init()` with pre-seeded links renders the correct link buttons
    - Test: timer reaches 00:00, shows completion message, start and stop disabled
    - Test: adding a task calls `StorageManager.saveTasks` with the updated array
    - Test: adding a link calls `StorageManager.saveLinks` with the updated array
    - _Requirements: 2.7, 3.10, 4.9_

- [~] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- All property-based tests use **fast-check** (`fc`) — minimum 100 iterations each; tag each test with `// Feature: todo-life-dashboard, Property N: <summary>`
- Checkpoints ensure incremental validation before moving to the next phase
- Property tests validate universal correctness properties; unit/integration tests validate specific behaviors and edge cases
- Since all logic lives in a single `js/app.js`, pure functions should be written as extractable units and accept injectable dependencies (e.g., a `storage` parameter) to enable clean mocking in tests without altering production structure

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4", "3.1", "4.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "4.2", "4.3", "6.1"] },
    { "id": 3, "tasks": ["3.4", "4.4", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 4, "tasks": ["6.6", "7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4"] },
    { "id": 6, "tasks": ["9.1", "9.2", "10.1"] },
    { "id": 7, "tasks": ["10.2"] }
  ]
}
```