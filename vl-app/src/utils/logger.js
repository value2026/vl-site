import { api } from './api';

export const logFrontendError = async (errorDetails) => {
  try {
    const errorData = {
      message: errorDetails.message || String(errorDetails),
      stack: errorDetails.stack || 'No stack trace available',
      url: window.location.href,
      userAgent: navigator.userAgent,
      time: new Date().toISOString()
    };
    
    // Fire and forget
    api.post('/logs/frontend', errorData).catch(() => {
      // Ignore network errors when logging fails
    });
  } catch (err) {
    console.error('Failed to report error to backend:', err);
  }
};

export const setupErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    logFrontendError({
      message: event.message,
      stack: event.error?.stack
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logFrontendError({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack || String(event.reason)
    });
  });
};
