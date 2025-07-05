import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      return await authService.register(userData);
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure the update payload is properly structured for the backend
      const updatePayload = {
        ...(userData.name !== undefined && { name: userData.name }),
        ...(userData.email !== undefined && { email: userData.email }),
        ...(userData.phone !== undefined && { phone: userData.phone }),
      };
      
      console.log('Sending profile update:', updatePayload);
      
      const updatedUser = await userService.updateUserProfile(updatePayload);
      
      // Update the user in state
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser,
      }));
      
      return updatedUser;
    } catch (error) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.is_superuser || false,
    login,
    logout,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
