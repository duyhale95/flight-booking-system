import apiService from './apiService';
import authService from './authService';

/**
 * Booking service for handling booking-related operations
 */
const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (bookingData) => {
    const token = authService.getToken();
    return apiService.post('/bookings', bookingData, { token });
  },

  /**
   * Create a complete booking with passenger and seat during payment
   * This is used during the payment process when clicking "Tiến hành thanh toán"
   */
  createCompleteBooking: async (bookingData) => {
    const token = authService.getToken();

    // Format the date to YYYY-MM-DD format if it's not already
    const formatDate = (dateString) => {
      try {
        if (!dateString) return null;
        // If already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) {
        console.error('Date formatting error:', e);
        return dateString; // Return original if can't format
      }
    };

    // Format the data for the standard booking endpoint
    const formattedData = {
      user_id: authService.getCurrentUserId(),
      total_price: parseFloat(bookingData.total_amount),
      status: 'pending', // Use lowercase to match the enum values in BookingStatus
      passengers: bookingData.passengers.map(passenger => ({
        first_name: passenger.first_name,
        last_name: passenger.last_name,
        nationality: passenger.nationality || 'Unknown',
        date_of_birth: formatDate(passenger.date_of_birth),
        passport_number: passenger.passport_number || '',
      })),
      flight_info: {
        flight_id: bookingData.flight_id,
        seat_ids: bookingData.passengers.map(passenger => passenger.seat_id || null),
      },
    };

    console.log(
      'Sending booking data:',
      JSON.stringify(formattedData, null, 2)
    );

    try {
      // Use the standard endpoint
      const response = await apiService.post('/me/bookings', formattedData, {
        token,
      });
      console.log('Booking created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.data) {
        console.error('Error details:', error.data);
      }
      throw error;
    }
  },

  /**
   * Get all bookings for the current user
   */
  getUserBookings: async () => {
    try {
      // Try to get bookings from API if user is authenticated
      if (authService.isAuthenticated()) {
        const token = authService.getToken();
        try {
          const apiResponse = await apiService.get('/me/bookings', { token });
          console.log('API bookings fetched:', apiResponse);
          
          if (
            !Array.isArray(apiResponse.data) ||
            apiResponse.data.length === 0
          ) {
            return [];
          }
          
          // Fetch detailed information for each booking
          const bookingsWithDetails = await Promise.all(
            apiResponse.data.map(async (booking) => {
              try {
                const bookingId = booking.id || booking.booking_number;
                if (!bookingId) return processBookingData(booking);
                
                // Get detailed booking information with passengers and tickets
                try {
                  const bookingDetailsResponse = await apiService.get(
                    `/me/bookings/${bookingId}/details`,
                    { token }
                  );
                  console.log(
                    'Detailed booking fetched:',
                    bookingDetailsResponse
                  );
                  
                  if (
                    bookingDetailsResponse &&
                    bookingDetailsResponse.passengers &&
                    bookingDetailsResponse.passengers.length > 0 &&
                    bookingDetailsResponse.passengers[0].tickets &&
                    bookingDetailsResponse.passengers[0].tickets.length > 0
                  ) {
                    // Get flight_id from the first ticket
                    const flightId =
                      bookingDetailsResponse.passengers[0].tickets[0].flight_id;
                    
                    if (flightId) {
                      try {
                        // Fetch flight details directly
                        const flightResponse = await apiService.get(
                          `/flights/${flightId}`,
                          { token }
                        );
                        console.log(
                          `Flight ${flightId} details:`,
                          flightResponse
                        );
                        
                        // Create a properly combined data structure with all information needed
                        const combinedData = {
                          ...bookingDetailsResponse,
                          flight: flightResponse,
                          // Add additional flight data for easier access
                          flight_details: {
                            id: flightId,
                            flight_number: flightResponse.flight_number || `VN${flightId.slice(-4)}`,
                            airline_name: flightResponse.airline_name || 'Vietnam Airlines',
                            departure_code: flightResponse.departure_code,
                            arrival_code: flightResponse.arrival_code,
                            departure_airport: flightResponse.departure_airport,
                            arrival_airport: flightResponse.arrival_airport,
                            departure_time: flightResponse.departure_time,
                            arrival_time: flightResponse.arrival_time,
                            flight_date: flightResponse.flight_date,
                            duration: calculateDuration(flightResponse.departure_time, flightResponse.arrival_time)
                          }
                        };
                        
                        return processBookingData(combinedData);
                      } catch (flightError) {
                        console.error(
                          `Error fetching flight ${flightId}:`,
                          flightError
                        );
                        // Continue with just the booking details
                      }
                    }
                  }
                  
                  // If we couldn't get flight details, just return the booking data we have
                  return processBookingData(bookingDetailsResponse);
                } catch (detailsError) {
                  console.error(
                    `Error fetching booking details:`,
                    detailsError
                  );
                  return processBookingData(booking);
                }
              } catch (error) {
                console.error(`Error processing booking:`, error);
                return processBookingData(booking);
              }
            })
          );
          
          console.log('Bookings with details:', bookingsWithDetails);
          return bookingsWithDetails;
        } catch (apiError) {
          console.error('Error fetching bookings from API:', apiError);
          // Fall back to localStorage if API fails
          console.log('Falling back to localStorage bookings');
        }
      }

      // Get from localStorage as fallback or if not authenticated
      const localBookings = bookingService.getBookingsFromLocalStorage();
      console.log('Local bookings fetched:', localBookings);
      return localBookings;
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      return [];
    }
  },

  /**
   * Get detailed information for a specific booking
   * This method fetches the complete booking data including flight details and passengers
   */
  getBookingDetails: async (bookingId) => {
    try {
      console.log(`Fetching details for booking ID: ${bookingId}`);
      
      // Try to get detailed booking from API if user is authenticated
      if (authService.isAuthenticated()) {
        const token = authService.getToken();
        try {
          // First try to get detailed booking info with full details
          const bookingResponse = await apiService.get(
            `/me/bookings/${bookingId}/details`,
            { token }
          );
          console.log('Detailed booking fetched:', bookingResponse);
          
          if (bookingResponse) {
            // Check if the booking has ticket information
            if (
              bookingResponse.passengers &&
              bookingResponse.passengers.length > 0 &&
              bookingResponse.passengers[0].tickets &&
              bookingResponse.passengers[0].tickets.length > 0
            ) {
              // Get flight_id from the first ticket
              const flightId = bookingResponse.passengers[0].tickets[0].flight_id;
              
              if (flightId) {
                try {
                  // Fetch flight details
                  const flightResponse = await apiService.get(`/flights/${flightId}`, { token });
                  console.log(`Flight details for booking ${bookingId}:`, flightResponse);
                  
                  // Combine booking and flight data
                  const enrichedBooking = {
                    ...bookingResponse,
                    flight: flightResponse,
                    flight_details: {
                      id: flightId,
                      flight_number: flightResponse.flight_number || `VN${flightId.slice(-4)}`,
                      airline_name: flightResponse.airline_name || 'Vietnam Airlines',
                      departure_code: flightResponse.departure_code,
                      arrival_code: flightResponse.arrival_code,
                      departure_airport: flightResponse.departure_airport,
                      arrival_airport: flightResponse.arrival_airport,
                      departure_time: flightResponse.departure_time,
                      arrival_time: flightResponse.arrival_time,
                      flight_date: flightResponse.flight_date,
                      duration: calculateDuration(flightResponse.departure_time, flightResponse.arrival_time)
                    }
                  };
                  
                  return processBookingData(enrichedBooking);
                } catch (flightError) {
                  console.error(`Error fetching flight details: ${flightError}`);
                  // Continue with just the booking response
                }
              }
            }
            
            // If we got here, just return the booking data without flight details
            return processBookingData(bookingResponse);
          }
        } catch (apiDetailError) {
          console.error(
            `Error fetching detailed booking for ID ${bookingId}:`,
            apiDetailError
          );
          // Fall back to basic booking endpoint
          try {
            const basicBookingResponse = await apiService.get(
              `/me/bookings/${bookingId}`,
              { token }
            );
            console.log('Basic booking fetched:', basicBookingResponse);

            if (basicBookingResponse) {
              // Now we need to get the ticket and flight information separately
              try {
                // Get tickets for this booking
                const ticketsResponse = await apiService.get(
                  `/me/bookings/${bookingId}/tickets`,
                  { token }
                );
                console.log('Tickets fetched:', ticketsResponse);

                let flightDetails = null;
                if (
                  ticketsResponse?.data?.length > 0 &&
                  ticketsResponse.data[0].flight_id
                ) {
                  // Get flight details using the first ticket's flight_id
                  const flightId = ticketsResponse.data[0].flight_id;
                  const flightResponse = await apiService.get(
                    `/flights/${flightId}`,
                    { token }
                  );
                  console.log('Flight details fetched:', flightResponse);
                  flightDetails = flightResponse;
                }
                
                // Process and structure the booking data with additional flight info
                return processBookingData({
                  ...basicBookingResponse,
                  tickets: ticketsResponse?.data,
                  flight: flightDetails,
                  flight_details: flightDetails ? {
                    id: flightDetails.id,
                    flight_number: flightDetails.flight_number,
                    airline_name: flightDetails.airline_name,
                    departure_code: flightDetails.departure_code,
                    arrival_code: flightDetails.arrival_code,
                    departure_airport: flightDetails.departure_airport,
                    arrival_airport: flightDetails.arrival_airport,
                    departure_time: flightDetails.departure_time,
                    arrival_time: flightDetails.arrival_time,
                    flight_date: flightDetails.flight_date,
                    duration: calculateDuration(flightDetails.departure_time, flightDetails.arrival_time)
                  } : null
                });
              } catch (dataFetchError) {
                console.error(
                  'Error fetching additional booking data:',
                  dataFetchError
                );
                return processBookingData(basicBookingResponse);
              }
            }
          } catch (basicApiError) {
            console.error(
              `Error fetching basic booking for ID ${bookingId}:`,
              basicApiError
            );
          }
        }
      }

      // Fall back to localStorage if API fails or user is not authenticated
      const localBooking = bookingService.getBookingFromLocalStorage(bookingId);
      return localBooking;
    } catch (error) {
      console.error(`Error in getBookingDetails for ID ${bookingId}:`, error);
      return null;
    }
  },

  /**
   * Get a specific booking by ID
   */
  getBookingById: async (bookingId) => {
    const token = authService.getToken();
    return apiService.get(`/bookings/${bookingId}`, { token });
  },

  /**
   * Update a booking's status
   */
  updateBookingStatus: async (bookingId, status) => {
    const token = authService.getToken();
    return apiService.patch(
      `/bookings/${bookingId}/status`,
      { status },
      { token }
    );
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId) => {
    const token = authService.getToken();
    return apiService.patch(`/bookings/${bookingId}/cancel`, {}, { token });
  },

  /**
   * Save booking to local storage (for offline/demo functionality)
   */
  saveBookingToLocalStorage: (booking) => {
    try {
      const bookingHistory = JSON.parse(
        localStorage.getItem('bookingHistory') || '[]'
      );

      // Check if booking already exists
      const existingBookingIndex = bookingHistory.findIndex(
        (b) => b.id === booking.id
      );

      if (existingBookingIndex >= 0) {
        // Update existing booking
        bookingHistory[existingBookingIndex] = {
          ...bookingHistory[existingBookingIndex],
          ...booking,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Add new booking
        bookingHistory.push({
          ...booking,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));
      return true;
    } catch (error) {
      console.error('Failed to save booking to local storage:', error);
      return false;
    }
  },

  /**
   * Get all bookings from local storage (for offline/demo functionality)
   */
  getBookingsFromLocalStorage: () => {
    try {
      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      // Process each booking to ensure consistent structure
      return bookings.map((booking) => processBookingData(booking));
    } catch (error) {
      console.error('Error getting bookings from localStorage:', error);
      return [];
    }
  },

  /**
   * Get a specific booking from localStorage by ID
   */
  getBookingFromLocalStorage: (bookingId) => {
    try {
      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      const booking = bookings.find(
        (b) =>
          b.id === bookingId ||
          b.booking_number === bookingId ||
          b.bookingNumber === bookingId
      );
      return booking ? processBookingData(booking) : null;
    } catch (error) {
      console.error(
        `Error getting booking ${bookingId} from localStorage:`,
        error
      );
      return null;
    }
  },

  /**
   * Add a passenger to a booking
   */
  addPassenger: async (bookingId, passengerData) => {
    const token = authService.getToken();
    return apiService.post(`/bookings/${bookingId}/passengers`, passengerData, {
      token,
    });
  },

  /**
   * Update a passenger in a booking
   */
  updatePassenger: async (bookingId, passengerId, passengerData) => {
    const token = authService.getToken();
    return apiService.patch(`/passengers/${passengerId}`, passengerData, {
      token,
    });
  },

  /**
   * Remove a passenger from a booking
   */
  removePassenger: async (passengerId) => {
    const token = authService.getToken();
    return apiService.delete(`/passengers/${passengerId}`, { token });
  },

  /**
   * Get tickets for a booking
   */
  getBookingTickets: async (bookingId) => {
    const token = authService.getToken();
    return apiService.get(`/bookings/${bookingId}/tickets`, { token });
  },
};

// Helper function to process and structure booking data consistently
const processBookingData = (bookingData) => {
  if (!bookingData) return null;
  
  // Log the original booking data structure to help diagnose issues
  console.log('Raw booking data structure:', JSON.stringify(bookingData, null, 2));
  
  // Extract flight data from different possible sources - prioritize flight_details since it has our processed data
  const flightDetails = bookingData.flight_details || {};
  const flightRaw = bookingData.flight || {};
  
  // Get ticket information if available
  let ticketData = { seat_number: '---', flight_id: null, seat_id: null };
  let seatData = { number: '---' };
  
  // Try to get ticket and seat information from passengers
  if (bookingData.passengers && bookingData.passengers.length > 0) {
    const firstPassenger = bookingData.passengers[0];
    
    if (firstPassenger.tickets && firstPassenger.tickets.length > 0) {
      ticketData = firstPassenger.tickets[0];
      seatData = { number: ticketData.seat_number };
    }
  }
  
  // Process passenger data
  const passengers = bookingData.passengers || [];
  const passenger =
    passengers.length > 0 ? passengers[0] : bookingData.passenger || {};
  
  // Use seat info from ticket if available, otherwise use what's in the booking
  const seat = {
    number:
      ticketData.seat_number ||
      bookingData.seat?.number ||
      seatData.number ||
      '---',
    id: ticketData.seat_id || bookingData.seat?.id || seatData.id,
  };
  
  // Extract flight information from the raw data
  // For the API response from /flights/{id}, the data we need is inside flightRaw
  // For combined data (where flight data is nested), we need to access flightRaw.data
  const actualFlightData = flightRaw.data || flightRaw;
  
  // Get flight number - prioritize the flight_details object
  let flightNumber = flightDetails.flight_number;
  if (!flightNumber) {
    if (actualFlightData.flight_number) {
      flightNumber = actualFlightData.flight_number;
    } else if (actualFlightData.airline_code && actualFlightData.id) {
      flightNumber = `${actualFlightData.airline_code}${actualFlightData.id.slice(-3)}`;
    } else if (ticketData.flight_id) {
      flightNumber = `VN${ticketData.flight_id.slice(-4)}`;
    }
  }
  
  // Get airline name
  let airlineName = flightDetails.airline_name;
  if (!airlineName) {
    if (actualFlightData.airline_name) {
      airlineName = actualFlightData.airline_name;
    } else if (actualFlightData.airline?.name) {
      airlineName = actualFlightData.airline.name;
    }
  }
  
  // Calculate a proper duration if possible
  let duration = flightDetails.duration;
  if (!duration) {
    if (actualFlightData.duration) {
      duration = actualFlightData.duration;
    } else if (actualFlightData.departure_time && actualFlightData.arrival_time) {
      duration = calculateDuration(
        actualFlightData.departure_time,
        actualFlightData.arrival_time
      );
    }
  }
  
  // Get departure code
  const departureCode = 
    flightDetails.departure_code ||
    actualFlightData.departure_code || 
    actualFlightData.departure?.iataCode;
  
  // Get departure city
  const departureCity = 
    flightDetails.departure_airport ||
    actualFlightData.departure_airport ||
    actualFlightData.departure?.city;
  
  // Get arrival code
  const arrivalCode = 
    flightDetails.arrival_code ||
    actualFlightData.arrival_code || 
    actualFlightData.arrival?.iataCode;
  
  // Get arrival city
  const arrivalCity = 
    flightDetails.arrival_airport ||
    actualFlightData.arrival_airport || 
    actualFlightData.arrival?.city;
  
  // Get departure time
  const departureTime = 
    flightDetails.departure_time ||
    actualFlightData.departure_time;
  
  // Get arrival time
  const arrivalTime = 
    flightDetails.arrival_time ||
    actualFlightData.arrival_time;
  
  // Get flight date
  const flightDate = 
    flightDetails.flight_date ||
    actualFlightData.flight_date;
  
  // Create a properly structured booking object
  const structuredBooking = {
    id: bookingData.id || bookingData.booking_number,
    bookingNumber: bookingData.booking_number || bookingData.id,
    status: bookingData.status,
    totalAmount: bookingData.total_price || bookingData.totalAmount,
    createdAt:
      bookingData.created_at ||
      bookingData.booking_date ||
      bookingData.createdAt,
  
    // Add passenger information
    passenger,
    passengers:
      passengers.length > 0
        ? passengers
        : [passenger].filter((p) => p && Object.keys(p).length > 0),
  
    // Add seat information
    seat,
    selectedSeat: seat,
  
    // Add flight information in the expected format
    flight: {
      id: flightDetails.id || actualFlightData.id || ticketData.flight_id,
      flightNumber,
      airline: airlineName,
      duration,
  
      // From/departure information
      from: {
        code: departureCode,
        city: departureCity,
        date: formatDate(flightDate || departureTime),
        time: formatTime(departureTime),
      },
  
      // To/arrival information
      to: {
        code: arrivalCode,
        city: arrivalCity,
        date: formatDate(flightDate || arrivalTime),
        time: formatTime(arrivalTime),
      },
    },
  };
  
  console.log('Structured booking data:', JSON.stringify(structuredBooking, null, 2));
  return structuredBooking;
};

// Helper to calculate flight duration
const calculateDuration = (departureTime, arrivalTime) => {
  try {
    if (!departureTime || !arrivalTime) return '---';
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);
    const durationMinutes = Math.floor(
      (arrivalDate - departureDate) / (1000 * 60)
    );
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '---';
  }
};

// Helper to format date
const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Helper to format time
const formatTime = (dateTimeString) => {
  try {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

export default bookingService;
