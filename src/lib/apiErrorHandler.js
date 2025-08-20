/**
 * Enhanced API Error Handler
 * Provides consistent error handling across the application
 */

export class APIError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const handleAPIError = (error, toast = null) => {
  let errorMessage = 'An unexpected error occurred';
  let errorTitle = 'Error';
  let errorStatus = 'error';

  // Handle different types of errors
  if (error instanceof APIError) {
    errorMessage = error.message;
    errorTitle = `Error ${error.status}`;
    
    // Customize based on status code
    switch (error.status) {
      case 401:
        errorTitle = 'Authentication Required';
        errorMessage = 'Please log in again to continue';
        errorStatus = 'warning';
        break;
      case 403:
        errorTitle = 'Access Denied';
        errorMessage = 'You don\'t have permission to perform this action';
        errorStatus = 'warning';
        break;
      case 404:
        errorTitle = 'Not Found';
        errorMessage = 'The requested resource was not found';
        errorStatus = 'info';
        break;
      case 429:
        errorTitle = 'Too Many Requests';
        errorMessage = 'Please wait a moment before trying again';
        errorStatus = 'warning';
        break;
      case 500:
        errorTitle = 'Server Error';
        errorMessage = 'Something went wrong on our end. Please try again later';
        errorStatus = 'error';
        break;
      default:
        if (error.status >= 400 && error.status < 500) {
          errorStatus = 'warning';
        }
    }
  } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
    errorTitle = 'Network Error';
    errorMessage = 'Please check your internet connection and try again';
    errorStatus = 'warning';
  } else if (error.name === 'AbortError') {
    errorTitle = 'Request Cancelled';
    errorMessage = 'The request was cancelled';
    errorStatus = 'info';
  } else {
    // Generic error handling
    console.error('Unhandled error:', error);
  }

  // Show toast notification if available
  if (toast) {
    toast({
      title: errorTitle,
      description: errorMessage,
      status: errorStatus,
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  }

  // Log error for debugging
  console.error('API Error:', {
    message: errorMessage,
    status: error.status,
    code: error.code,
    details: error.details,
    timestamp: error.timestamp,
    originalError: error,
  });

  return {
    title: errorTitle,
    message: errorMessage,
    status: errorStatus,
    shouldRetry: errorStatus === 'warning' || error.status === 500,
  };
};

export const createAPIError = (response, data = null) => {
  const status = response.status;
  const message = data?.message || data?.error || `HTTP ${status} error`;
  const code = data?.code || `HTTP_${status}`;
  
  return new APIError(message, status, code, data);
};

export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const isRetryableError = (error) => {
  // Retry on network errors, 5xx server errors, and rate limiting
  return (
    error.name === 'TypeError' ||
    (error.status >= 500 && error.status < 600) ||
    error.status === 429
  );
};
