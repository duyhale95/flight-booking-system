import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling API data fetching and state
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies that should trigger a refetch when changed
 * @param {boolean} immediate - Whether to fetch immediately on mount
 * @param {Array} initialArgs - Initial arguments to pass to the API function
 */
const useApi = (
  apiFunction,
  dependencies = [],
  immediate = true,
  initialArgs = []
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Execute the API call
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (error) {
      setError(error?.message || 'An unknown error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  // Fetch data on mount or dependencies change if immediate is true
  useEffect(() => {
    if (immediate) {
      execute(...initialArgs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
};

export default useApi; 