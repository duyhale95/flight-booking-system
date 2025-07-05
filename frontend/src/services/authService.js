import { apiService, API_URL } from './apiService';

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Authentication service for managing user authentication
 */
const authService = {
  /**
   * Login with username/email and password
   */
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/signin/access-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();

    // Store token
    localStorage.setItem(TOKEN_KEY, data.access_token);

    // Get user data
    const userData = await authService.getCurrentUser();
    return userData;
  },

  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get the current access token
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get current user data from local storage
   */
  getUserData: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Get current user from API
   */
  getCurrentUser: async () => {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error('No authentication token');
      }

      const userData = await apiService.get('/me', { token });

      // Cache user data
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Failed to get user data:', error);
      authService.logout();
      throw error;
    }
  },

  /**
   * Check if user has admin privileges
   */
  isAdmin: () => {
    const userData = authService.getUserData();
    return userData && userData.is_superuser === true;
  },

  /**
   * Get current user ID
   */
  getCurrentUserId: () => {
    const userData = authService.getUserData();
    return userData ? userData.id : null;
  },

  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await apiService.post('/signup', userData);
    return response;
  },
};

export default authService;
