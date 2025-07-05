import apiService from './apiService';
import authService from './authService';

/**
 * User service for handling user-related operations
 */
const userService = {
  /**
   * Get user profile
   */
  getUserProfile: async () => {
    const token = authService.getToken();
    return apiService.get('/me', { token });
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userData) => {
    const token = authService.getToken();
    return apiService.patch('/me', userData, { token });
  },

  /**
   * Update user password
   * Using PATCH as the backend expects PATCH for this endpoint
   */
  updatePassword: async (passwordData) => {
    const token = authService.getToken();
    return apiService.patch('/me/password', passwordData, { token });
  },

  /**
   * Admin: Get all users
   */
  getAllUsers: async (skip = 0, limit = 100) => {
    const token = authService.getToken();
    return apiService.get(`/users?skip=${skip}&limit=${limit}`, { token });
  },

  /**
   * Admin: Get a specific user by ID
   */
  getUserById: async (userId) => {
    const token = authService.getToken();
    return apiService.get(`/users/${userId}`, { token });
  },

  /**
   * Admin: Create a new user
   */
  createUser: async (userData) => {
    const token = authService.getToken();
    return apiService.post('/users', userData, { token });
  },

  /**
   * Admin: Update a user
   */
  updateUser: async (userId, userData) => {
    const token = authService.getToken();
    return apiService.patch(`/users/${userId}`, userData, { token });
  },

  /**
   * Admin: Delete a user
   */
  deleteUser: async (userId) => {
    const token = authService.getToken();
    return apiService.delete(`/users/${userId}`, { token });
  }
};

export default userService; 