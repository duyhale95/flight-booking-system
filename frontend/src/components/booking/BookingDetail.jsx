import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import TicketPrint from './TicketPrint'

export default function BookingDetail({ booking, onClose, isLoading = false, error = null }) {
  const navigate = useNavigate()
  const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(0)
  const [processedSeats, setProcessedSeats] = useState([])
  const [initialized, setInitialized] = useState(false)
  const [passengerSeatMap, setPassengerSeatMap] = useState({})

  // Process booking data on component mount or when booking changes
  useEffect(() => {
    if (!booking) return
    
    // Log booking structure to help debug
    console.log('Processing booking data for seat display:', booking)
    
    // Examine the actual seat data in the booking
    console.log('DEBUG: Tickets in the booking:', JSON.stringify(booking.selectedSeats || [], null, 2))
    
    // Extract passengers first
    const passengers = booking.passengers || 
                      (booking.passenger ? [booking.passenger] : []) || 
                      []
    
    console.log('DEBUG: All passengers:', JSON.stringify(passengers, null, 2))
    
    // Extract tickets from each passenger
    passengers.forEach((passenger, idx) => {
      if (passenger.tickets && passenger.tickets.length > 0) {
        console.log(`DEBUG: Passenger ${idx} has tickets:`, JSON.stringify(passenger.tickets, null, 2))
      }
    })
    
    // Extract seats from various possible locations in the booking object
    let extractedSeats = []
    
    // Check for multi-passenger booking structures
    if (booking.passengers && booking.passengers.length > 0) {
      // First, try to extract seats from tickets within passengers
      let seatsFromTickets = []
      booking.passengers.forEach((passenger, idx) => {
        if (passenger.tickets && passenger.tickets.length > 0) {
          const ticket = passenger.tickets[0]
          if (ticket.seat_number) {
            seatsFromTickets[idx] = {
              number: ticket.seat_number,
              id: ticket.seat_id || null,
              class: ticket.seat_class || 'economy'
            }
            console.log(`DEBUG: Found seat ${ticket.seat_number} for passenger ${idx} from ticket`)
          }
        }
      })
      
      // If we found seats in tickets, use them
      if (seatsFromTickets.length > 0 && seatsFromTickets.some(s => s !== undefined)) {
        console.log('DEBUG: Using seats from tickets')
        // Fill gaps
        extractedSeats = booking.passengers.map((_, idx) => {
          return seatsFromTickets[idx] || { number: '---' }
        })
      } 
      // If booking has selectedSeats array that matches passengers count
      else if (Array.isArray(booking.selectedSeats) && booking.selectedSeats.length === booking.passengers.length) {
        console.log('Found matching selectedSeats array:', booking.selectedSeats)
        // Check if they have actual seat numbers
        const validSeatsCount = booking.selectedSeats.filter(seat => 
          seat && (seat.number || seat.seatNumber || seat.seat_number)).length
        console.log(`DEBUG: Valid seats count in selectedSeats: ${validSeatsCount}`)
        
        // Only use if we have valid seats
        if (validSeatsCount > 0) {
          extractedSeats = [...booking.selectedSeats]
        }
      } 
      // If booking has seats array that matches passengers count
      else if (Array.isArray(booking.seats) && booking.seats.length === booking.passengers.length) {
        console.log('Found matching seats array:', booking.seats)
        extractedSeats = [...booking.seats]
      }
      // If we have seat info in each passenger
      else {
        console.log('Extracting seats from passengers')
        extractedSeats = booking.passengers.map((passenger, idx) => {
          if (passenger.seat) {
            console.log(`Found seat in passenger: ${passenger.firstName || passenger.first_name}`, passenger.seat)
            return passenger.seat
          } else if (passenger.tickets && passenger.tickets.length > 0 && passenger.tickets[0].seat_number) {
            console.log(`Found seat ${passenger.tickets[0].seat_number} in passenger tickets`)
            return { number: passenger.tickets[0].seat_number }
          }
          return { number: '---' }
        })
      }
    } 
    // Single passenger booking structures
    else {
      if (booking.seat) {
        // Handle single seat object
        console.log('Found single seat object:', booking.seat)
        extractedSeats = Array.isArray(booking.seat) ? [...booking.seat] : [booking.seat]
      } else if (booking.selectedSeat) {
        // Handle selectedSeat
        console.log('Found selectedSeat object:', booking.selectedSeat)
        extractedSeats = [booking.selectedSeat]
      }
    }
    
    // If we still don't have seat info, create placeholders
    if (extractedSeats.length === 0 && passengers.length > 0) {
      console.log('Creating placeholder seats for', passengers.length, 'passengers')
      extractedSeats = passengers.map((_, i) => ({ number: `---` }))
    }
    
    // Create a map of passenger index to seat number for quick lookup
    const seatMap = {}
    extractedSeats.forEach((seat, index) => {
      const seatNumber = seat?.number || 
                         seat?.seatNumber || 
                         seat?.seat_number || 
                         (passengers[index]?.seat?.number) ||
                         (passengers[index]?.seatNumber) ||
                         (passengers[index]?.tickets && 
                          passengers[index]?.tickets[0]?.seat_number) ||
                         '---'
      seatMap[index] = seatNumber
    })
    
    console.log('Created seat map for passengers:', seatMap)
    setPassengerSeatMap(seatMap)
    
    console.log('Final processed seats:', extractedSeats)
    setProcessedSeats(extractedSeats)
    setInitialized(true)
  }, [booking])

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <Card.Body className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải chi tiết đặt vé...</p>
          </Card.Body>
        </Card>
      </div>
    )
  }

  // Handle potential null booking (should never happen but just in case)
  if (!booking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <Card.Body className="py-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết đặt vé</h2>
              <Button
                variant="ghost"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <div className="text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg text-gray-700 mt-4">
                {error || 'Không thể hiển thị chi tiết đặt vé này'}
              </p>
              <Button
                variant="primary"
                onClick={onClose}
                className="mt-6"
              >
                Đóng
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    )
  }

  // Access data using multi-format field names
  const flight = booking.flight || {}
  
  // Handle multiple passengers
  const passengers = booking.passengers || 
                    (booking.passenger ? [booking.passenger] : []) || 
                    []
  
  // Check if we have multiple passengers
  const hasMultiplePassengers = passengers.length > 1
  
  // Get current passenger and seat based on selected index
  const currentPassenger = passengers[selectedPassengerIndex] || {}
  
  // Get the current seat for the selected passenger using processedSeats
  const currentSeat = processedSeats[selectedPassengerIndex] || {}
  
  // Get seat number with fallbacks - use direct ticket information with highest priority
  const seatNumber = 
    // First check direct ticket information
    (currentPassenger.tickets && 
     currentPassenger.tickets.length > 0 && 
     currentPassenger.tickets[0].seat_number) ||
    // Then try the seat map we created
    passengerSeatMap[selectedPassengerIndex] ||
    // Then try passenger's seat object
    currentPassenger.seat?.number || 
    // Then try currentSeat
    currentSeat?.number || 
    currentSeat?.seatNumber || 
    currentSeat?.seat_number ||
    // Default
    '---'
  
  const departureDate = flight.from?.date || flight.departureTime || ''
  const bookingNumber = booking.bookingNumber || booking.booking_number || booking.id
  const totalAmount = booking.totalAmount || booking.total_price || 0
  const bookingDate = booking.createdAt || booking.booking_date || new Date().toISOString()
  const paymentMethod = booking.paymentMethod || 'Thẻ tín dụng/ghi nợ'
  const bookingStatus = booking.status || 'confirmed'
  
  // Format passenger data for ticket printing
  const formatPassengerForTicket = (passenger) => ({
    firstName: passenger.first_name || passenger.firstName,
    lastName: passenger.last_name || passenger.lastName,
    email: passenger.email,
    phone: passenger.phone,
    nationality: passenger.nationality,
    passport_number: passenger.passport_number || passenger.passportNumber
  })
  
  // Create ticket data
  const ticketData = {
    bookingCode: bookingNumber,
    flight: flight,
    passenger: formatPassengerForTicket(currentPassenger),
    seat: currentSeat,
    paymentMethod: paymentMethod,
    totalAmount: totalAmount,
    passengerNumber: selectedPassengerIndex + 1,
    totalPassengers: passengers.length,
    // Add all passengers and seats for printing all tickets at once
    allPassengers: passengers.map(p => formatPassengerForTicket(p)),
    allSeats: processedSeats
  }

  // Debug output to verify we have the correct data
  console.log('Rendering BookingDetail with:', {
    passengers: passengers.length,
    seats: processedSeats.length,
    selectedIndex: selectedPassengerIndex,
    currentSeat,
    seatNumber,
    seatMap: passengerSeatMap
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <Card.Body>
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết đặt vé
                </h2>
                <p className="text-gray-600">Mã đặt vé: {bookingNumber}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Thông tin chuyến bay
              </h3>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Điểm đi</p>
                  <p className="text-2xl font-bold text-gray-900">{flight.from?.code || '---'}</p>
                  <p className="text-sm text-gray-600 font-medium">{flight.from?.city || '---'}</p>
                  <p className="text-sm text-primary-600 font-semibold mt-1">
                    {flight.from?.time || '---'}
                  </p>
                </div>
                <div className="flex-1 px-6">
                  <div className="flex items-center">
                    <div className="flex-1 border-t-2 border-dashed border-primary-300"></div>
                    <div className="mx-3 p-3 bg-primary-200 rounded-full">
                      <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-primary-300"></div>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-600 font-medium">{flight.duration || '---'}</p>
                    <p className="text-xs text-gray-500">{flight.airline || '---'} - {flight.flightNumber || '---'}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Điểm đến</p>
                  <p className="text-2xl font-bold text-gray-900">{flight.to?.code || '---'}</p>
                  <p className="text-sm text-gray-600 font-medium">{flight.to?.city || '---'}</p>
                  <p className="text-sm text-primary-600 font-semibold mt-1">
                    {flight.to?.time || '---'}
                  </p>
                </div>
              </div>
              
              {hasMultiplePassengers && (
                <div className="mt-4 bg-blue-100 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
                  <span className="text-blue-600 text-xl">👥</span>
                  <span className="font-medium">{passengers.length} hành khách</span>
                </div>
              )}
            </div>

            {/* Passenger Tabs */}
            {hasMultiplePassengers && (
              <div className="flex overflow-x-auto pb-2 space-x-2">
                {passengers.map((passenger, index) => {
                  // Get seat number directly from multiple possible sources
                  // This is critical for correctly displaying seat numbers
                  const displaySeatNumber = 
                    // First try the seat map we generated
                    passengerSeatMap[index] || 
                    // Then try directly from passenger tickets
                    (passenger.tickets && 
                     passenger.tickets.length > 0 && 
                     passenger.tickets[0].seat_number) ||
                    // Then try from the passenger's seat object
                    passenger.seat?.number ||
                    // Then try from seat at same index in our seat arrays
                    processedSeats[index]?.number || 
                    // Default value
                    '---';
                    
                  return (
                    <button 
                      key={index}
                      className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1
                        ${index === selectedPassengerIndex 
                          ? 'bg-blue-600 text-white font-semibold' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => setSelectedPassengerIndex(index)}
                    >
                      <span>👤</span>
                      <span>
                        {passenger.first_name || passenger.firstName || `Hành khách ${index + 1}`}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">
                        {displaySeatNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {hasMultiplePassengers ? `Hành khách ${selectedPassengerIndex + 1}` : 'Thông tin hành khách'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Họ và tên:</span>
                    <span className="font-semibold text-gray-900">
                      {currentPassenger.firstName || currentPassenger.first_name || ''} {currentPassenger.lastName || currentPassenger.last_name || '---'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số hộ chiếu:</span>
                    <span className="font-medium text-gray-900">{currentPassenger.passport_number || currentPassenger.passportNumber || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quốc tịch:</span>
                    <span className="font-medium text-gray-900">{currentPassenger.nationality || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số ghế:</span>
                    <span className="font-bold text-primary-600 text-lg">{seatNumber}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Thông tin thanh toán
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đặt chỗ:</span>
                    <span className="font-mono font-semibold text-gray-900">{bookingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-medium text-gray-900">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày đặt:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(bookingDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {hasMultiplePassengers && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số hành khách:</span>
                      <span className="font-medium text-gray-900">{passengers.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="text-gray-600 font-medium">Tổng tiền:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {totalAmount?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      bookingStatus?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      bookingStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {bookingStatus?.toLowerCase() === 'confirmed' ? '✓ Đã thanh toán' : 
                       bookingStatus?.toLowerCase() === 'pending' ? '⏳ Chờ xác nhận' : 
                       '🔄 Đang xử lý'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <TicketPrint 
              booking={ticketData} 
              onClose={onClose}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  )
} 