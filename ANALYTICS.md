# Analytics Event Schema

This document outlines the standard Google Analytics 4 tracking events used throughout the Virtual Lab platform. By standardizing these, we ensure data consistency, prevent typos, and enable reliable GA4 Explorations.

All analytics interactions pass through the centralized `trackEvent` function in `src/utils/analytics.js`, which automatically validates the payload, formats event names to `snake_case`, and securely attaches the current user's `session_id` and UTC `timestamp`.

## Core Variables
To bypass Google Analytics 4's strict payload validation engine—which automatically drops custom events containing reserved system keywords like `user_id`, `session_id`, or `experiment_id`—all contextual metadata is heavily namespaced.

These parameters are universally attached to every event (where available in context):
- `custom_session_id`: Auto-generated unique string per browser session (e.g. `sess_1x2y3z_1721000000`)
- `custom_app_version`: Version of the UI application (e.g., `0.0.0`)
- `vl_exp_id`: UUID of the current experiment (if inside an experiment context)
- `vl_exp_name`: Human-readable title of the experiment
- `vl_user_id`: UUID of the authenticated student
- `vl_course`: Student's enrolled course
- `vl_dept`: Student's department
- `vl_nodal_center`: The institution/nodal center of the user

---

## Standard Events 

### 1. simulation_started
Fires exactly once per session when the student navigates to the "Simulation" tab.
* **Category**: `experiment`
* **Action**: `simulation_started`
* **Parameters**: `vl_exp_id`, `vl_exp_name`, `vl_user_id`, `custom_session_id`

### 2. simulation_exited
Fires when the student navigates away from the "Simulation" tab, or unmounts the component. Used to calculate how much time they spent explicitly viewing the interactive element.
* **Category**: `experiment`
* **Action**: `simulation_exited`
* **Parameters**: `vl_duration` (integer, seconds spent on tab)

### 3. quiz_started
Fires exactly once per session when a student navigates to a Pretest or Posttest tab.
* **Category**: `experiment`
* **Action**: `quiz_started`
* **Parameters**: `vl_quiz_type` ('pretest' or 'posttest')

### 4. quiz_completed
Fires when a student hits "Submit Answers" and scores are graded.
* **Category**: `experiment`
* **Action**: `quiz_completed`
* **Parameters**: `vl_score_pct` (Final percentage score 0-100), `vl_score` (raw number correct), `vl_quiz_type` ('pretest' or 'posttest')

### 5. quiz_exited
Fires when a student leaves a quiz tab. Helps identify quiz abandonment or how long they pondered the questions before giving up or submitting.
* **Category**: `experiment`
* **Action**: `quiz_exited`
* **Parameters**: `vl_duration` (seconds on tab), `vl_completed` (boolean), `vl_quiz_type`

### 6. experiment_completed
Fires when the student submits the final Feedback form.
* **Category**: `experiment`
* **Action**: `experiment_completed`
* **Value**: Star rating provided (1-5)

### 7. navigation_changed
Fires every time the student clicks a new section in the left sidebar.
* **Category**: `experiment`
* **Action**: `navigation_changed`
* **Parameters**: `from_tab` (e.g. 'aim'), `to_tab` (e.g. 'simulation')

### 8. performance_metric
Fires automatically to track system responsiveness.
* **Category**: `performance`
* **Action**: `performance_metric`
* **Value**: The numerical metric measured
* **Parameters**: `metric_name` (e.g. 'api_load_time_ms')

### 9. error_occurred
Fires when an internal exception is caught, enabling you to detect failing API endpoints or breaking simulations in production without needing server logs.
* **Category**: `error`
* **Action**: `error_occurred`
* **Parameters**: `error_type` (e.g., 'api_error', 'simulation_error'), `message` (details of the failure)

---

## Implementing Custom Simulation Events

If a simulation developer wants to track a granular interaction (like "temperature_changed" or "molecule_mixed"), they can send a message out of their iframe wrapper.

The parent React shell (`ExperimentPage.jsx`) automatically catches this, injects the `session_id` and student details, and forwards it to Google Analytics.

**Simulation-Side Code Example:**
```javascript
window.parent.postMessage({
  type: 'GA_EVENT',
  action: 'temperature_changed',
  params: {
    old_temp: 100,
    new_temp: 200
  }
}, '*');
```
