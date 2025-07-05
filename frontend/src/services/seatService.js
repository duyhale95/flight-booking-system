import apiService from './apiService';
import authService from './authService';

/**
 * Seat service for handling seat-related operations
 */
const seatService = {
  /**
   * Get all seats for a specific flight
   */
  getSeatsForFlight: async (flightId, availableOnly = false) => {
    const queryParams = new URLSearchParams();
    queryParams.append('flight_id', flightId);
    queryParams.append('available_only', availableOnly);
    
    const endpoint = `/seats?${queryParams.toString()}`;
    return apiService.get(endpoint);
  },

  /**
   * Get a specific seat by ID
   */
  getSeatById: async (seatId) => {
    return apiService.get(`/seats/${seatId}`);
  },
  
  /**
   * Reserve a seat (mark it as unavailable)
   * This would typically be done during the booking process
   */
  reserveSeat: async (seatId) => {
    try {
      const token = authService.getToken();
      return await apiService.post(`/seats/${seatId}/reserve`, {}, { token });
    } catch (error) {
      console.error('Error reserving seat:', error);
      // Check for specific error codes
      if (error.data && error.data.error_code === 'seat_not_available') {
        throw new Error('This seat is no longer available. Please select another seat.');
      }
      // Re-throw with a more user-friendly message
      throw new Error(`Unable to reserve seat. ${error.message || 'Please try again later.'}`);
    }
  },
  
  /**
   * Admin: Create new seat
   */
  createSeat: async (seatData) => {
    const token = authService.getToken();
    return apiService.post('/seats', seatData, { token });
  },
  
  /**
   * Admin: Update seat
   */
  updateSeat: async (seatId, seatData) => {
    const token = authService.getToken();
    return apiService.patch(`/seats/${seatId}`, seatData, { token });
  },

  /**
   * Get seats for a specific flight using the dedicated endpoint
   * Now with pagination support to fetch all seats
   */
  getFlightSeats: async (flightId, availableOnly = false, limit = 250, skip = 0) => {
    const queryParams = new URLSearchParams();
    if (availableOnly) {
      queryParams.append('available_only', 'true');
    }
    queryParams.append('limit', limit.toString());
    queryParams.append('skip', skip.toString());
    
    const endpoint = `/seats/flight/${flightId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiService.get(endpoint);
  }
};

export default seatService; 