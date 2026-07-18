import ReactGA from 'react-ga4';

/**
 * Custom event tracking for Google Analytics 4
 * @param {Object} params
 * @param {string} params.category - The category of the event (e.g. 'Simulation', 'Quiz')
 * @param {string} params.action - The specific action taken (e.g. 'Simulation Started', 'Parameter Changed')
 * @param {string} [params.label] - Additional context (e.g. the name of the experiment)
 * @param {number} [params.value] - A numeric value associated with the event (e.g. score, time in seconds)
 */
export const trackEvent = ({ category, action, label, value, ...customParams }) => {
  if (ReactGA.isInitialized) {
    ReactGA.event({
      category: category || 'General',
      action: action,
      label: label,
      value: value,
      ...customParams
    });
    console.log(`[GA Event] ${category} - ${action}`, label ? `(${label})` : '', value !== undefined ? `Value: ${value}` : '', customParams);
  }
};
