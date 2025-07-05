import apiService from './apiService';
import authService from './authService';

/**
 * Ticket service for handling ticket-related operations
 */
const ticketService = {
  /**
   * Get all tickets for the current user
   */
  getUserTickets: async () => {
    const token = authService.getToken();
    return apiService.get('/me/tickets', { token });
  },

  /**
   * Get tickets for a specific booking
   */
  getBookingTickets: async (bookingId) => {
    const token = authService.getToken();
    return apiService.get(`/bookings/${bookingId}/tickets`, { token });
  },

  /**
   * Get a specific ticket by ID
   */
  getTicketById: async (ticketId) => {
    const token = authService.getToken();
    return apiService.get(`/tickets/${ticketId}`, { token });
  },

  /**
   * Generate tickets for a booking (after payment)
   */
  generateTickets: async (bookingId) => {
    const token = authService.getToken();
    return apiService.post(`/bookings/${bookingId}/generate-tickets`, {}, { token });
  },

  /**
   * Cancel a ticket
   */
  cancelTicket: async (ticketId) => {
    const token = authService.getToken();
    return apiService.patch(`/tickets/${ticketId}/cancel`, {}, { token });
  },

  /**
   * Check in for a ticket
   */
  checkInTicket: async (ticketId, checkInData) => {
    const token = authService.getToken();
    return apiService.post(`/tickets/${ticketId}/check-in`, checkInData, { token });
  },

  /**
   * Get boarding pass for a ticket
   */
  getBoardingPass: async (ticketId) => {
    const token = authService.getToken();
    return apiService.get(`/tickets/${ticketId}/boarding-pass`, { token });
  }
};

export default ticketService; 