import Bugsnag from '@bugsnag/expo';

// Bugsnag utility functions for replacing console logs
export const bugsnagLog = {
  // Replace console.log with Bugsnag breadcrumb
  log: (message, data = {}) => {
    Bugsnag.leaveBreadcrumb(message, {
      ...data,
      type: 'log'
    });
  },

  // Replace console.error with Bugsnag error notification
  error: (error, context = {}) => {
    if (error instanceof Error) {
      Bugsnag.notify(error, (event) => {
        event.addMetadata('context', context);
      });
    } else {
      Bugsnag.notify(new Error(error), (event) => {
        event.addMetadata('context', context);
      });
    }
  },

  // Replace console.warn with Bugsnag breadcrumb
  warn: (message, data = {}) => {
    Bugsnag.leaveBreadcrumb(message, {
      ...data,
      type: 'warning'
    });
  },

  // Replace console.info with Bugsnag breadcrumb
  info: (message, data = {}) => {
    Bugsnag.leaveBreadcrumb(message, {
      ...data,
      type: 'info'
    });
  },

  // For API errors
  apiError: (endpoint, error, response = null) => {
    Bugsnag.notify(new Error(`API Error: ${endpoint}`), (event) => {
      event.addMetadata('api', {
        endpoint,
        error: error.message || error,
        response: response?.data || response,
        status: response?.status
      });
    });
  },

  // For authentication errors
  authError: (action, error) => {
    Bugsnag.notify(new Error(`Auth Error: ${action}`), (event) => {
      event.addMetadata('auth', {
        action,
        error: error.message || error
      });
    });
  },

  // For navigation errors
  navigationError: (route, error) => {
    Bugsnag.notify(new Error(`Navigation Error: ${route}`), (event) => {
      event.addMetadata('navigation', {
        route,
        error: error.message || error
      });
    });
  },

  // For file/image errors
  fileError: (operation, error, fileInfo = {}) => {
    Bugsnag.notify(new Error(`File Error: ${operation}`), (event) => {
      event.addMetadata('file', {
        operation,
        error: error.message || error,
        ...fileInfo
      });
    });
  },

  // For location errors
  locationError: (operation, error) => {
    Bugsnag.notify(new Error(`Location Error: ${operation}`), (event) => {
      event.addMetadata('location', {
        operation,
        error: error.message || error
      });
    });
  },

  // For payment errors
  paymentError: (operation, error, paymentInfo = {}) => {
    Bugsnag.notify(new Error(`Payment Error: ${operation}`), (event) => {
      event.addMetadata('payment', {
        operation,
        error: error.message || error,
        ...paymentInfo
      });
    });
  }
};

// Test function to verify Bugsnag is working
export const testBugsnag = () => {
  bugsnagLog.log('Bugsnag test started');
  bugsnagLog.error(new Error('Test error from KidMate app'));
  bugsnagLog.info('Bugsnag test completed');
};

export default bugsnagLog; 