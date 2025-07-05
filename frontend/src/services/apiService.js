/**
 * Base API service for handling API requests
 */

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

/**
 * Common headers for API requests
 */
const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Extract detailed error information
    const errorDetail = errorData.detail || {};
    const errorMessage = 
      (typeof errorDetail === 'object' && errorDetail.message) || 
      (typeof errorData.detail === 'string' ? errorData.detail : '') || 
      (typeof errorData.message === 'string' ? errorData.message : '') || 
      `Request failed with status ${response.status}`;
    
    // Extract error code if available
    const errorCode = (typeof errorDetail === 'object' && errorDetail.error_code) || '';
    
    // Log the full error information for debugging
    console.error(`API Error (${response.status}):`, {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    error.errorCode = errorCode;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

/**
 * Base API request method
 */
const apiRequest = async (endpoint, options = {}) => {
  const { token, ...fetchOptions } = options;

  const config = {
    headers: getHeaders(token),
    ...fetchOptions,
  };

  // Log the request data for debugging
  if (config.method !== 'GET') {
    console.log(`API ${config.method} Request to ${endpoint}:`, {
      url: `${API_URL}${endpoint}`,
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : undefined
    });
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    // Better error logging with structured output
    console.error('API request error:', error.message || error);
    throw error;
  }
};

/**
 * HTTP methods
 */
export const apiService = {
  get: (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      method: 'GET',
      ...options,
    });
  },

  post: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },

  put: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  patch: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  },

  delete: (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      method: 'DELETE',
      ...options,
    });
  },
};

export default apiService;
