import apiService from './apiService';
import authService from './authService';

/**
 * Flight service for handling flight-related operations
 */
const flightService = {
  /**
   * Search flights with various filters
   */
  searchFlights: async (searchParams) => {
    // Convert search parameters to backend format
    const backendParams = {
      skip: 0,
      limit: searchParams.limit || 50,
      flight_date: searchParams.departureDate,
      departure_code: searchParams.from,
      arrival_code: searchParams.to
    };
    
    // Convert search parameters to query string
    const queryParams = new URLSearchParams();
    
    Object.entries(backendParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/flights${queryString ? '?' + queryString : ''}`;
    
    try {
      const response = await apiService.get(endpoint);
      
      // Transform backend flight data to frontend format
      if (response && response.data && Array.isArray(response.data)) {
        const transformedFlights = response.data.map(flight => {
          // Calculate duration
          const departureTime = new Date(flight.departure_time);
          const arrivalTime = new Date(flight.arrival_time);
          const durationMinutes = Math.floor((arrivalTime - departureTime) / (1000 * 60));
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          const durationString = `${hours}h ${minutes}m`;
          
          // Create transformed flight object
          return {
            id: flight.id,
            flight: { iataNumber: flight.flight_number },
            airline: { 
              iataCode: flight.airline_code, 
              name: flight.airline_name 
            },
            departure: { 
              iataCode: flight.departure_code, 
              scheduledTime: flight.departure_time,
              terminal: flight.departure_terminal || 'T1'
            },
            arrival: { 
              iataCode: flight.arrival_code, 
              scheduledTime: flight.arrival_time,
              terminal: flight.arrival_terminal || 'T2'
            },
            duration: durationString,
            // Calculate business class price (1.5x economy)
            price: { 
              economy: flight.price, 
              business: Math.round(flight.price * 1.5) 
            },
            available_seats: flight.available_seats || 30,
          };
        });
        
        return {
          data: transformedFlights,
          count: response.count || transformedFlights.length
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching flights:', error);
      throw error;
    }
  },

  /**
   * Get a specific flight by ID
   */
  getFlightById: async (flightId) => {
    return apiService.get(`/flights/${flightId}`);
  },

  /**
   * Get available seats for a flight
   */
  getFlightSeats: async (flightId) => {
    return apiService.get(`/flights/${flightId}/seats`);
  },
  
  /**
   * Admin: Create a new flight
   */
  createFlight: async (flightData) => {
    const token = authService.getToken();
    return apiService.post('/flights', flightData, { token });
  },
  
  /**
   * Admin: Update a flight
   */
  updateFlight: async (flightId, flightData) => {
    const token = authService.getToken();
    return apiService.patch(`/flights/${flightId}`, flightData, { token });
  },
  
  /**
   * Admin: Delete a flight
   */
  deleteFlight: async (flightId) => {
    const token = authService.getToken();
    return apiService.delete(`/flights/${flightId}`, { token });
  }
};

export default flightService; 