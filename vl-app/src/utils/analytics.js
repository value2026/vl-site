import ReactGA from 'react-ga4';
import packageJson from '../../package.json';

// Generate or retrieve a persistent session ID for the current browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('vl_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    sessionStorage.setItem('vl_session_id', sessionId);
  }
  return sessionId;
};

// Define event constants to prevent typos
export const EVENTS = {
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_EXITED: 'simulation_exited',
  QUIZ_STARTED: 'quiz_started',
  QUIZ_COMPLETED: 'quiz_completed',
  QUIZ_EXITED: 'quiz_exited',
  EXPERIMENT_COMPLETED: 'experiment_completed',
  NAVIGATION_CHANGED: 'navigation_changed',
  PERFORMANCE_METRIC: 'performance_metric',
  ERROR: 'error_occurred'
};

/**
 * Custom event tracking for Google Analytics 4
 * @param {Object} params
 * @param {string} params.category - The category of the event (e.g. 'experiment', 'simulation')
 * @param {string} params.action - The specific action taken (e.g. EVENTS.SIMULATION_STARTED)
 * @param {string} [params.label] - Additional context (e.g. the name of the experiment)
 * @param {number} [params.value] - A numeric value associated with the event (e.g. score, time in seconds)
 */
export const trackEvent = ({ category, action, label, value, ...customParams }) => {
  try {
    // Validate required fields
    if (!action) {
      console.error('[GA Event Error] Missing required parameter: action');
      return;
    }
    if (customParams.experiment_id === undefined && customParams.user_id === undefined) {
      console.warn(`[GA Event Warning] Missing recommended context (experiment_id or user_id) for action: ${action}`);
    }

    // Ensure consistent event and category names (snake_case)
    const formattedAction = action.toLowerCase().replace(/\s+/g, '_');
    const formattedCategory = (category || 'general').toLowerCase().replace(/\s+/g, '_');

    const payload = {
      category: formattedCategory,
      action: formattedAction,
      label: label,
      value: value,
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      app_version: packageJson.version,
      ...customParams
    };

    if (ReactGA.isInitialized) {
      ReactGA.event(payload);
      if (import.meta.env.DEV) {
        console.log(`[GA Event] ${formattedCategory} -> ${formattedAction}`, payload);
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('[GA Warning] ReactGA is not initialized. Event ignored:', payload);
      }
    }
  } catch (error) {
    console.error('[GA Event Error] Failed to process analytics event:', error);
  }
};

/**
 * Track an error in the application
 * @param {string} errorType - Type of error (e.g., 'simulation_error', 'api_error')
 * @param {string} message - Error message
 * @param {Object} customParams - Additional context (e.g., experiment_id)
 */
export const trackError = (errorType, message, customParams = {}) => {
  trackEvent({
    category: 'error',
    action: EVENTS.ERROR,
    label: errorType,
    error_type: errorType,
    message: message,
    ...customParams
  });
};
