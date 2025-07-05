import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import BookingDetail from '../components/booking/BookingDetail'
import bookingService from '../services/bookingService'

export default function Bookings() {
  const navigate = useNavigate()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [detailedBooking, setDetailedBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, upcoming, past
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [error, setError] = useState(null)
  const [detailsError, setDetailsError] = useState(null)

  // Fetch bookings from the backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get bookings from API or localStorage
        const userBookings = await bookingService.getUserBookings()
        console.log('Fetched bookings:', userBookings)
        
        // If we got bookings, use them
        if (Array.isArray(userBookings) && userBookings.length > 0) {
          setBookings(userBookings)
        } else {
          // If no bookings, check localStorage directly as a fallback
          const localBookings = bookingService.getBookingsFromLocalStorage()
          console.log('Fetched local bookings:', localBookings)
          setBookings(localBookings || [])
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError('Không thể tải danh sách đặt vé. Vui lòng thử lại sau.')
        
        // Try to get from localStorage as a last resort
        try {
          const localBookings = bookingService.getBookingsFromLocalStorage()
          if (localBookings && localBookings.length > 0) {
            setBookings(localBookings)
            setError(null) // Clear error if we got local bookings
          }
        } catch (localErr) {
          console.error('Failed to get local bookings:', localErr)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Fetch detailed booking information when a booking is selected
  const handleViewBookingDetails = async (booking) => {
    try {
      setIsLoadingDetails(true)
      setDetailsError(null)
      setSelectedBooking(booking) // Set the selected booking immediately for UI feedback
      
      // Get the ID for the booking (handle both formats)
      const bookingId = booking.id || booking.booking_number || booking.bookingNumber
      
      if (!bookingId) {
        throw new Error('Invalid booking ID')
      }
      
      console.log(`Fetching details for booking ID: ${bookingId}`)
      
      // Fetch detailed booking information
      const detailedBookingData = await bookingService.getBookingDetails(bookingId)
      
      if (detailedBookingData) {
        console.log('Detailed booking data:', detailedBookingData)
        
        // Deep clone the booking data to avoid reference issues
        let processedBooking = JSON.parse(JSON.stringify(detailedBookingData))
        
        // Make sure we have passenger data
        if (!processedBooking.passengers || processedBooking.passengers.length === 0) {
          if (processedBooking.passenger) {
            processedBooking.passengers = [processedBooking.passenger]
          } else {
            processedBooking.passengers = [{}]
          }
        }
        
        console.log(`Processing ${processedBooking.passengers.length} passengers for booking ${bookingId}`)
        
        // Extract seats from passenger tickets
        const passengerSeats = []
        
        // First pass: Extract seat data from tickets
        processedBooking.passengers.forEach((passenger, index) => {
          console.log(`Processing passenger ${index}:`, passenger?.first_name, passenger?.last_name)
          
          let seatFound = false
          
          // Try to extract from tickets first (most reliable)
          if (passenger.tickets && passenger.tickets.length > 0) {
            const ticket = passenger.tickets[0]
            console.log(`Passenger ${index} ticket:`, ticket)
            
            if (ticket.seat_number) {
              console.log(`Found seat ${ticket.seat_number} for passenger ${index} in ticket`)
              passengerSeats[index] = {
                number: ticket.seat_number,
                id: ticket.seat_id || null,
                class: ticket.seat_class || 'economy'
              }
              seatFound = true
            }
          }
          
          // If no seat in tickets, try other sources
          if (!seatFound) {
            // Try passenger.seat
            if (passenger.seat && passenger.seat.number) {
              console.log(`Found seat ${passenger.seat.number} in passenger.seat`)
              passengerSeats[index] = passenger.seat
              seatFound = true
            }
            // Try passenger.seatNumber
            else if (passenger.seatNumber) {
              console.log(`Found seat ${passenger.seatNumber} in passenger.seatNumber`)
              passengerSeats[index] = { number: passenger.seatNumber }
              seatFound = true
            }
          }
          
          // If still no seat found, use placeholder
          if (!seatFound) {
            console.log(`No seat found for passenger ${index}, using placeholder`)
            passengerSeats[index] = { number: '---' }
          }
        })
        
        console.log('Extracted passenger seats:', passengerSeats)
        
        // Use extracted seats if we found any
        if (passengerSeats.length > 0) {
          processedBooking.selectedSeats = passengerSeats
          console.log('Using extracted passenger seats for selectedSeats')
        }
        // Otherwise try booking.selectedSeats
        else if (Array.isArray(processedBooking.selectedSeats)) {
          console.log('Using booking.selectedSeats:', processedBooking.selectedSeats)
          
          // Ensure we have enough seats for all passengers
          while (processedBooking.selectedSeats.length < processedBooking.passengers.length) {
            processedBooking.selectedSeats.push({ number: '---' })
          }
        }
        // Try booking.seats
        else if (Array.isArray(processedBooking.seats)) {
          console.log('Using booking.seats:', processedBooking.seats)
          processedBooking.selectedSeats = processedBooking.seats
          
          // Ensure we have enough seats for all passengers
          while (processedBooking.selectedSeats.length < processedBooking.passengers.length) {
            processedBooking.selectedSeats.push({ number: '---' })
          }
        } 
        // If no seat arrays found, create from scratch
        else {
          console.log('Creating new seats array')
          processedBooking.selectedSeats = processedBooking.passengers.map((_, idx) => {
            if (passengerSeats[idx]) return passengerSeats[idx]
            return { number: '---' }
          })
        }
        
        // Make a direct mapping of passenger to seat
        for (let i = 0; i < processedBooking.passengers.length; i++) {
          const passenger = processedBooking.passengers[i]
          const seat = processedBooking.selectedSeats[i] || { number: '---' }
          
          // Associate this seat directly with the passenger
          passenger.seat = seat
        }
        
        // Duplicate the seats array to all supported properties
        processedBooking.seats = [...processedBooking.selectedSeats]
        
        console.log('Final processed booking:', {
          bookingId: processedBooking.id || processedBooking.bookingNumber,
          passengerCount: processedBooking.passengers.length,
          seatsCount: processedBooking.selectedSeats.length,
          seats: processedBooking.selectedSeats.map(s => s.number)
        })
        
        // Update the state with detailed booking
        setDetailedBooking(processedBooking)
      } else {
        // If no detailed data available, use the basic booking data
        setDetailedBooking(booking)
      }
    } catch (err) {
      console.error('Error fetching booking details:', err)
      setDetailsError('Không thể tải chi tiết đặt vé. Vui lòng thử lại sau.')
      // Keep the basic booking data available
      setDetailedBooking(booking)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Reset booking details when modal is closed
  const handleCloseDetails = () => {
    setSelectedBooking(null)
    setDetailedBooking(null)
    setDetailsError(null)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'pending_payment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'Đã xác nhận'
      case 'cancelled': return 'Đã hủy'
      case 'pending': return 'Chờ xác nhận'
      case 'pending_payment': return 'Chờ thanh toán'
      default: return 'Không xác định'
    }
  }

  // Helper to safely parse dates from various formats
  const parseDate = (booking) => {
    // Try multiple date sources
    try {
      // Try flight.from.date + flight.from.time if available
      if (booking.flight?.from?.date) {
        const dateStr = booking.flight.from.date
        const timeStr = booking.flight.from.time || '00:00'
        // Format could be "2024-03-20" or "20/03/2024" or other
        // Try to normalize it
        let dateObj
        
        if (dateStr.includes('-')) {
          // Assume YYYY-MM-DD format
          const [year, month, day] = dateStr.split('-')
          dateObj = new Date(`${year}-${month}-${day}T${timeStr}`)
        } else if (dateStr.includes('/')) {
          // Assume DD/MM/YYYY format
          const [day, month, year] = dateStr.split('/')
          dateObj = new Date(`${year}-${month}-${day}T${timeStr}`)
        } else {
          // Try direct parsing
          dateObj = new Date(`${dateStr} ${timeStr}`)
        }
        
        if (!isNaN(dateObj.getTime())) {
          return dateObj
        }
      }
      
      // Try departureTime if available
      if (booking.flight?.departureTime) {
        const dateObj = new Date(booking.flight.departureTime)
        if (!isNaN(dateObj.getTime())) {
          return dateObj
        }
      }
      
      // Fall back to created date
      if (booking.createdAt || booking.booking_date) {
        const dateObj = new Date(booking.createdAt || booking.booking_date)
        if (!isNaN(dateObj.getTime())) {
          return dateObj
        }
      }
      
      // Last resort - current date
      return new Date()
    } catch (err) {
      console.error('Date parsing error:', err)
      return new Date()
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const departureDate = parseDate(booking)
    const now = new Date()
    
    if (filter === 'upcoming') {
      return departureDate > now
    }
    if (filter === 'past') {
      return departureDate < now
    }
    return true
  })

  // Count booking stats
  const upcomingCount = bookings.filter(booking => {
    return parseDate(booking) > new Date()
  }).length
  
  const pastCount = bookings.filter(booking => {
    return parseDate(booking) < new Date()
  }).length

  // Debug output for development
  console.log('Bookings state:', {
    total: bookings.length,
    filtered: filteredBookings.length,
    upcoming: upcomingCount,
    past: pastCount
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Lịch sử đặt vé
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi các chuyến bay đã đặt
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')}
              variant="primary"
            >
              Đặt vé mới
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Thử lại
              </Button>
            </div>
          )}
          
          {/* Filter */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Lọc theo trạng thái</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                📋 Tất cả ({bookings.length})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'upcoming'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                ✈️ Sắp tới ({upcomingCount})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'past'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                ✅ Đã bay ({pastCount})
              </button>
            </div>
          </div>

          {/* Booking list */}
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <Card key={booking.id || index} className="hover:shadow-lg transition-shadow">
                <Card.Body>
                  <div className="flex justify-between items-start">
                    {/* Flight info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center w-20">
                          <p className="text-sm text-gray-600">Điểm đi</p>
                          <p className="text-xl font-semibold">{booking.flight?.from?.code || '---'}</p>
                          <p className="text-sm text-gray-600">{booking.flight?.from?.city || '---'}</p>
                        </div>
                        
                        <div className="flex-1 px-4">
                          <div className="flex items-center justify-center">
                            <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                            <div className="mx-2 p-2 bg-primary-100 rounded-full">
                              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                            <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                          </div>
                          <p className="text-center text-sm text-gray-600 mt-1 font-medium">
                            {booking.flight?.duration || '---'}
                          </p>
                        </div>
                        
                        <div className="text-center w-20">
                          <p className="text-sm text-gray-600">Điểm đến</p>
                          <p className="text-xl font-semibold">{booking.flight?.to?.code || '---'}</p>
                          <p className="text-sm text-gray-600">{booking.flight?.to?.city || '---'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Chuyến bay</p>
                          <p className="font-semibold">{booking.flight?.flightNumber || '---'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ngày bay</p>
                          <p className="font-semibold">
                            {booking.flight?.from?.date || '---'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ghế</p>
                          <p className="font-semibold">
                            {booking.selectedSeat?.number || booking.seat?.number || '---'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tổng tiền</p>
                          <p className="font-semibold text-primary-600">
                            {(booking.totalAmount || booking.total_price)?.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-6 text-right space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Mã đặt vé</p>
                        <p className="font-mono font-semibold">{booking.bookingNumber || booking.booking_number || booking.id}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewBookingDetails(booking)}
                          className="w-full"
                        >
                          Xem chi tiết
                        </Button>

                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}

            {filteredBookings.length === 0 && (
              <Card>
                <Card.Body className="text-center py-8">
                  <p className="text-gray-600">
                    {error ? 'Đã xảy ra lỗi khi tải dữ liệu' : 'Không tìm thấy đặt vé nào'}
                  </p>
                  <Button 
                    onClick={() => navigate('/')}
                    className="mt-4"
                  >
                    Đặt vé ngay
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết đặt vé */}
      {selectedBooking && (
        <BookingDetail
          booking={detailedBooking || selectedBooking}
          onClose={handleCloseDetails}
          isLoading={isLoadingDetails}
          error={detailsError}
        />
      )}
    </div>
  )
} 