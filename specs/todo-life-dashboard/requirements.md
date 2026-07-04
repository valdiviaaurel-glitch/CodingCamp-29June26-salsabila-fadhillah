# Requirements Document

## Introduction

The To-Do Life Dashboard is a browser-based personal productivity homepage built with HTML, CSS, and Vanilla JavaScript. It runs entirely client-side with no backend, using the browser's Local Storage API to persist data. The dashboard provides four core widgets: a real-time greeting with clock, a Pomodoro-style focus timer, a task management list, and a configurable quick-links panel. The goal is a clean, minimal interface that helps users organize their day at a glance.

## Glossary

- **Dashboard**: The single-page web application serving as the user's productivity homepage.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The countdown timer component implementing a 25-minute work session.
- **Todo_List**: The UI component for managing tasks (add, edit, complete, delete).
- **Task**: A single to-do item with a text label and a completion status.
- **Quick_Links**: The UI component displaying user-defined shortcut buttons to external websites.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Local_Storage**: The browser's localStorage Web API used to persist all user data client-side.
- **Storage_Manager**: The JavaScript module responsible for reading and writing data to Local_Storage.

---

## Requirements

### Requirement 1: Real-Time Greeting and Clock

**User Story:** As a user, I want to see the current time, date, and a personalized greeting when I open the dashboard, so that I am immediately oriented to the current moment without switching tabs.

#### Acceptance Criteria

1. WHILE the Greeting_Widget is displayed, THE Greeting_Widget SHALL update the current time in HH:MM:SS format every second.
2. THE Greeting_Widget SHALL display the current full date (e.g., "Monday, July 14, 2025").
3. IF the local time is between 05:00 and 11:59, THEN THE Greeting_Widget SHALL display "Good Morning".
4. IF the local time is between 12:00 and 17:59, THEN THE Greeting_Widget SHALL display "Good Afternoon".
5. IF the local time is between 18:00 and 20:59, THEN THE Greeting_Widget SHALL display "Good Evening".
6. IF the local time is between 21:00 and 04:59, THEN THE Greeting_Widget SHALL display "Good Night".
7. IF the system clock or date is unavailable, THEN THE Greeting_Widget SHALL display a fallback message (e.g., "Welcome") in place of the time-based greeting and show "--:--:--" for the time display.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with start, stop, and reset controls, so that I can track focused work sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialize to a countdown of 25 minutes and display "25:00" in MM:SS format on page load.
2. WHEN the user activates the start control, THE Focus_Timer SHALL begin counting down one second at a time.
3. WHILE the Focus_Timer is running, THE Focus_Timer SHALL update the displayed time in MM:SS format every second.
4. WHEN the user activates the stop control, THE Focus_Timer SHALL pause the countdown at the current remaining time.
5. WHEN the user activates the start control after a pause, THE Focus_Timer SHALL resume counting down from the current remaining time.
6. WHEN the user activates the reset control, THE Focus_Timer SHALL stop any active countdown and return the displayed time to "25:00".
7. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically, display a visible completion message (e.g., "Session Complete!"), and disable both the start and stop controls until reset.
8. WHILE the Focus_Timer is running, THE Focus_Timer SHALL disable the start control to prevent duplicate timers.
9. WHILE the Focus_Timer is paused or reset, THE Focus_Timer SHALL disable the stop control.

---

### Requirement 3: Task Management (To-Do List)

**User Story:** As a user, I want to add, edit, complete, and delete tasks that persist across browser sessions, so that I can track my daily to-dos without losing them on page refresh.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a text input field and a submit control for adding new tasks.
2. WHEN the user submits a non-empty task label (after trimming whitespace), THE Todo_List SHALL add the Task to the list, display it immediately, and clear the input field.
3. IF the user submits an empty or whitespace-only task label, THEN THE Todo_List SHALL reject the submission, display a validation message, and retain focus on the input field.
4. WHEN the user activates the complete control on a Task, THE Todo_List SHALL toggle the Task's completion status and apply a visible "done" style (e.g., strikethrough text and reduced opacity).
5. WHEN the user activates the edit control on a Task, THE Todo_List SHALL replace the Task's label display with an editable input field pre-filled with the current label.
6. WHEN the user saves an edited Task with a non-empty label (after trimming whitespace), THE Todo_List SHALL update the Task's label in the list and restore the normal display.
7. IF the user saves an edited Task with an empty or whitespace-only label, THEN THE Todo_List SHALL reject the edit, display a validation message, and retain the original label.
8. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove the Task from the list permanently without requiring additional confirmation.
9. WHEN any task is added, edited, completed, or deleted, THE Storage_Manager SHALL synchronously write the updated task list to Local_Storage.
10. WHEN the Dashboard loads, THE Storage_Manager SHALL read the task list from Local_Storage and THE Todo_List SHALL render all previously saved tasks in their persisted order and completion state.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and display shortcut buttons to my favorite websites, so that I can navigate to frequently visited pages directly from the dashboard.

#### Acceptance Criteria

1. THE Quick_Links panel SHALL display all saved Links as clickable buttons.
2. WHEN the user activates a Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
3. THE Quick_Links panel SHALL provide a label input (max 50 characters) and a URL input (max 2048 characters) with a submit control for adding a new Link.
4. WHEN the user submits a new Link with a non-empty label and a URL beginning with "http://" or "https://", THE Quick_Links panel SHALL add the Link button to the panel immediately.
5. IF the user submits a new Link with an empty label, an empty URL, or a URL not beginning with "http://" or "https://", THEN THE Quick_Links panel SHALL reject the submission, display a validation message identifying which field is invalid, and retain the entered values in the input fields.
6. THE Quick_Links panel SHALL provide a delete control on each Link button to remove it.
7. WHEN the user activates the delete control on a Link, THE Quick_Links panel SHALL remove the Link permanently.
8. WHEN any Link is added or deleted, THE Storage_Manager SHALL write the updated links list to Local_Storage.
9. WHEN the Dashboard loads, THE Storage_Manager SHALL read the links list from Local_Storage and THE Quick_Links panel SHALL render all previously saved Links.
10. IF the links data in Local_Storage is missing or cannot be parsed, THEN THE Quick_Links panel SHALL render an empty panel without displaying an error to the user.

---

### Requirement 5: Data Persistence and Storage

**User Story:** As a user, I want all my tasks and quick links to be saved automatically, so that my data is not lost when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN the Storage_Manager writes task or link data, THE Storage_Manager SHALL serialize the data as a JSON string before writing to Local_Storage.
2. WHEN the Storage_Manager reads task or link data, THE Storage_Manager SHALL deserialize the JSON string from Local_Storage before passing it to UI components.
3. IF the task data in Local_Storage is missing or cannot be parsed as JSON, THEN THE Storage_Manager SHALL initialize the task list as an empty array.
4. IF the parsed task data is not an array, THEN THE Storage_Manager SHALL initialize the task list as an empty array and THE Todo_List SHALL render an empty list.
5. IF the link data in Local_Storage is missing or cannot be parsed as JSON, THEN THE Storage_Manager SHALL initialize the links list as an empty array.
6. IF the parsed link data is not an array, THEN THE Storage_Manager SHALL initialize the links list as an empty array and THE Quick_Links panel SHALL render an empty panel.
7. THE Storage_Manager SHALL use separate, distinct Local_Storage keys for task data and link data.

---

### Requirement 6: Layout and Visual Design

**User Story:** As a user, I want a clean and readable dashboard layout, so that I can quickly find and use each widget without confusion.

#### Acceptance Criteria

1. THE Dashboard SHALL organize all widgets in a responsive layout that displays 1 column on screens narrower than 768px, and 2 to 4 columns on screens 768px wide and above, scaling up to 1920px.
2. THE Dashboard SHALL use a single CSS file (css/style.css) for all styles and a single JavaScript file (js/app.js) for all logic.
3. THE Dashboard SHALL apply uniform spacing (consistent padding and margin values) and a single typeface across all widgets to maintain visual hierarchy.
4. WHEN rendered on a screen narrower than 768px, THE Dashboard SHALL stack all widgets in a single column.
5. WHEN rendered on a screen 768px wide or wider, THE Dashboard SHALL arrange widgets in a multi-column grid layout (minimum 2 columns).
6. THE Dashboard SHALL load and render all widgets with no external network requests during load, ensuring the page is fully functional when served from a local file or static host.
