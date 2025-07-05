import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import TicketPrint from '../components/booking/TicketPrint'
import bookingService from '../services/bookingService'

export default function PaymentSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showPrintSection, setShowPrintSection] = useState(false)
  const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(0)
  
  // Use real data from location state
  const {
    bookingId,
    bookingNumber,
    flight,
    passengers,
    selectedSeats,
    paymentMethod,
    departureAirport,
    arrivalAirport,
    totalAmount,
    bookingDate = new Date().toISOString()
  } = location.state || {}

  // If no booking data is available, redirect to home
  useEffect(() => {
    if (!bookingId || !flight || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      navigate('/', { replace: true })
    }
  }, [bookingId, flight, passengers, navigate])

  useEffect(() => {
    // Get existing booking if available
    const existingBooking = bookingService.getBookingFromLocalStorage(bookingId);
    
    // Update booking status if it exists
    if (existingBooking) {
      bookingService.saveBookingToLocalStorage({
        ...existingBooking,
        bookingNumber: bookingNumber || existingBooking.bookingNumber, // Ensure bookingNumber is preserved
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      });
    } else {
      // Create a new booking record if it doesn't exist yet
      const newBooking = {
        id: bookingId,
        bookingNumber: bookingNumber, // Generate one if not provided
        flightId: flight.id,
        flight,
        passengers,
        selectedSeats,
        paymentMethod,
        totalAmount,
        status: 'confirmed',
        createdAt: bookingDate,
        confirmedAt: new Date().toISOString()
      };
      bookingService.saveBookingToLocalStorage(newBooking);
    }
  }, [bookingId, bookingNumber, flight, passengers, selectedSeats, paymentMethod, totalAmount, bookingDate]);

  const getPaymentMethodName = (method) => {
    const methods = {
      'vnpay': 'VNPay',
      'credit-card': 'Thẻ tín dụng',
      'momo': 'MoMo',
      'zalopay': 'ZaloPay',
      'bank-transfer': 'Chuyển khoản ngân hàng',
      'paypal': 'PayPal'
    }
    return methods[method] || method
  }

  // Format current passenger data for ticket printing
  const formatPassengerForTicket = (passenger) => ({
    firstName: passenger.first_name || passenger.firstName,
    lastName: passenger.last_name || passenger.lastName,
    email: passenger.email,
    phone: passenger.phone,
    nationality: passenger.nationality,
    passport_number: passenger.passport_number || passenger.passportNumber
  })

  const handlePrintToggle = () => {
    setShowPrintSection(!showPrintSection)
    // Scroll to print section if showing
    if (!showPrintSection) {
      setTimeout(() => {
        const printSection = document.getElementById('print-section')
        if (printSection) {
          printSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  // If no booking data is available, show loading or redirect will happen
  if (!bookingId || !flight || !passengers || passengers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý thông tin...</p>
        </div>
      </div>
    );
  }

  // Use bookingNumber as the primary display, fallback to bookingId
  const displayBookingNumber = bookingNumber || bookingId;

  // Create ticket for current passenger
  const currentPassenger = passengers[selectedPassengerIndex];
  const currentSeat = selectedSeats[selectedPassengerIndex];
  
  // Tạo đối tượng booking để truyền vào TicketPrint
  const booking = {
    bookingCode: displayBookingNumber,
    flight: flight,
    passenger: formatPassengerForTicket(currentPassenger),
    seat: currentSeat,
    paymentMethod: getPaymentMethodName(paymentMethod),
    totalAmount: totalAmount,
    passengerNumber: selectedPassengerIndex + 1,
    totalPassengers: passengers.length,
    // Add all passengers and seats for printing all tickets at once
    allPassengers: passengers.map(p => formatPassengerForTicket(p)),
    allSeats: selectedSeats
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 animate-slideUp">
              🎉 Đặt vé thành công!
            </h1>
            <p className="text-xl text-gray-600 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              Chúc mừng! {passengers.length > 1 ? `${passengers.length} vé` : 'Vé'} máy bay của bạn đã được xác nhận
            </p>
          </div>

          {/* Booking Info Card */}
          <Card className="mb-8 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <Card.Body className="p-8">
              {/* Booking Code - Most Important */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-primary-600 text-white p-6 rounded-xl">
                  <p className="text-sm font-medium mb-2">MÃ ĐẶT VÉ CỦA BẠN</p>
                  <p className="text-3xl font-bold font-mono tracking-wider">{displayBookingNumber}</p>
                  <p className="text-sm mt-2 opacity-90">Vui lòng lưu mã này để check-in</p>
                </div>
              </div>

              {/* Flight Route */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  ✈️ Thông tin chuyến bay
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-3xl font-bold text-gray-900">{flight.from.code}</p>
                      <p className="text-sm text-gray-600 mt-1">{flight.from.city}</p>
                      <p className="text-lg font-semibold text-primary-600 mt-2">{flight.from.time}</p>
                    </div>
                    
                    <div className="flex-1 px-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <div className="bg-primary-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                        {flight.duration}
                      </p>
                    </div>
                    
                    <div className="text-center flex-1">
                      <p className="text-3xl font-bold text-gray-900">{flight.to.code}</p>
                      <p className="text-sm text-gray-600 mt-1">{flight.to.city}</p>
                      <p className="text-lg font-semibold text-primary-600 mt-2">{flight.to.time}</p>
                    </div>
                  </div>
                  
                  {/* Flight Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Hãng bay</p>
                      <p className="font-semibold">{flight.airline}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Số hiệu</p>
                      <p className="font-semibold">{flight.flightNumber}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Hạng ghế</p>
                      <p className="font-semibold">
                        {flight.seatClass === 'business' ? 'Thương gia' : 'Phổ thông'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2 mt-4">
                    <span className="text-blue-600 text-xl">👥</span>
                    <span className="font-medium">{passengers.length} hành khách</span>
                  </div>
                </div>
              </div>

              {/* Passenger Selection Tabs */}
              {passengers.length > 1 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Hành khách</h4>
                  <div className="flex flex-wrap gap-2">
                    {passengers.map((passenger, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedPassengerIndex === index
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedPassengerIndex(index)}
                      >
                        {passenger.first_name || `Hành khách ${index + 1}`}
                        {selectedSeats[index] && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {selectedSeats[index].number}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Passenger & Payment Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {passengers.length > 1 ? `Hành khách ${selectedPassengerIndex + 1}` : 'Hành khách'}
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {currentPassenger.last_name} {currentPassenger.first_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{currentPassenger.passport_number}</p>
                    </div>
                    <div className="mt-3 bg-green-50 p-2 rounded flex items-center justify-between">
                      <span className="text-gray-700">Ghế</span>
                      <span className="font-bold text-green-600 text-lg">{currentSeat.number}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Thanh toán
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-medium">{getPaymentMethodName(paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số hành khách:</span>
                      <span className="font-medium">{passengers.length}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <span className="font-medium">Tổng tiền:</span>
                      <span className="text-xl font-bold text-green-600">
                        {totalAmount?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-3 gap-4">
                <Button 
                  onClick={handlePrintToggle}
                  variant={showPrintSection ? "warning" : "primary"}
                  size="lg"
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {showPrintSection ? 'Ẩn phần in vé' : 'In tất cả vé'}
                </Button>
                
                <Button
                  onClick={() => navigate('/bookings')}
                  variant="success"
                  size="lg"
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Quản lý đặt vé
                </Button>
                
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Về trang chủ
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Print Section - Hiển thị khi showPrintSection = true */}
          {showPrintSection && (
            <Card id="print-section" className="mb-8 animate-slideUp">
              <Card.Header>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    🖨️ In tất cả vé
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPrintSection(false)}
                    className="p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-6">
                <TicketPrint 
                  booking={booking} 
                  onClose={() => setShowPrintSection(false)}
                />
              </Card.Body>
            </Card>
          )}

          {/* Quick Tips */}
          <Card className="animate-slideUp" style={{ animationDelay: '0.6s' }}>
            <Card.Body className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lưu ý quan trọng
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Có mặt tại sân bay trước giờ bay ít nhất 2 tiếng</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Mang theo CMND/hộ chiếu và mã đặt vé</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Check-in online từ 24h trước giờ bay</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Hành lý ký gửi tối đa 20kg (phổ thông)</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
} 