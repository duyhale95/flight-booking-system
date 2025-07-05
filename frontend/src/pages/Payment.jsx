import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import bookingService from '../services/bookingService'
import authService from '../services/authService'

// Payment methods definition
const paymentMethods = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: '💳',
    description: 'Thanh toán với ví điện tử VNPay',
    fee: 0
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: '🟣',
    description: 'Thanh toán với ví điện tử MoMo',
    fee: 0
  },
  {
    id: 'credit-card',
    name: 'Thẻ tín dụng',
    icon: '💰',
    description: 'Thanh toán bằng thẻ tín dụng',
    fee: 10000
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: '🔵',
    description: 'Thanh toán với ví điện tử ZaloPay',
    fee: 0
  },
  {
    id: 'bank-transfer',
    name: 'Chuyển khoản',
    icon: '🏦',
    description: 'Chuyển khoản ngân hàng trực tiếp',
    fee: 0
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🌐',
    description: 'Thanh toán qua PayPal',
    fee: 15000
  }
]

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Ensure we have data from location state
  const { 
    flightDetails, 
    passengers,  // Changed from passengerInfo to passengers array
    selectedSeats, // Changed from selectedSeat to selectedSeats array 
    searchParams,
    departureAirport,
    arrivalAirport 
  } = location.state || {}
  
  // Calculate total passenger count
  const passengerCount = passengers?.length || 0

  // Redirect to home if missing essential data
  useEffect(() => {
    if (!flightDetails || !passengers || !Array.isArray(passengers) || !passengerCount) {
      navigate('/', { replace: true })
    }
  }, [flightDetails, passengers, passengerCount, navigate])

  // Debug logging để kiểm tra
  console.log('Payment component loaded with data:', {
    flightDetails,
    passengers,
    selectedSeats,
    passengerCount
  })

  const [selectedMethod, setSelectedMethod] = useState('vnpay')
  const [cardInfo, setCardInfo] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Countdown timer states - 40 phút = 2400 giây
  const [timeLeft, setTimeLeft] = useState(40 * 60) // 2400 seconds
  const [isExpired, setIsExpired] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  // Countdown timer effect
  useEffect(() => {
    if (!flightDetails || !passengers || !Array.isArray(passengers) || !passengerCount) return;
    
    // Lưu thời gian bắt đầu vào localStorage
    const startTime = localStorage.getItem('paymentStartTime')
    const bookingData = {
      flightId: flightDetails.id,
      flightDetails,
      passengers,
      selectedSeats,
      searchParams,
      departureAirport,
      arrivalAirport,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 40 * 60 * 1000).toISOString()
    }

    if (!startTime) {
      const now = Date.now()
      localStorage.setItem('paymentStartTime', now.toString())
      // Lưu booking data vào localStorage với trạng thái chờ thanh toán
      const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]')
      const bookingId = `BK${Date.now().toString().slice(-8)}`
      bookingHistory.push({
        ...bookingData,
        id: bookingId,
        status: 'pending_payment'
      })
      localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory))
      localStorage.setItem('currentBookingId', bookingId)
    }

    const timer = setInterval(() => {
      const startTimeStamp = parseInt(localStorage.getItem('paymentStartTime') || Date.now().toString())
      const elapsed = Math.floor((Date.now() - startTimeStamp) / 1000)
      const remaining = Math.max(0, 2400 - elapsed) // 40 minutes = 2400 seconds

      setTimeLeft(remaining)

      // Hiển thị cảnh báo khi còn 5 phút
      if (remaining <= 300 && remaining > 0) {
        setShowWarning(true)
      }

      // Khi hết thời gian
      if (remaining === 0) {
        setIsExpired(true)
        setShowWarning(false)
        
        // Cập nhật trạng thái thành đã hủy trong localStorage
        const bookingHistory = JSON.parse(localStorage.getItem('bookingHistory') || '[]')
        const currentBookingId = localStorage.getItem('currentBookingId')
        const updatedHistory = bookingHistory.map(booking => 
          booking.id === currentBookingId 
            ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : booking
        )
        localStorage.setItem('bookingHistory', JSON.stringify(updatedHistory))
        
        // Clear payment session
        localStorage.removeItem('paymentStartTime')
        localStorage.removeItem('currentBookingId')
        
        clearInterval(timer)
      }
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [flightDetails, passengers, selectedSeats, searchParams, departureAirport, arrivalAirport, passengerCount]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Tính toán giá
  const ticketPrice = (flightDetails?.price || 0) * passengerCount
  const seatFees = selectedSeats?.reduce((total, seat) => total + (seat?.price || 0), 0) || 0
  const paymentFee = paymentMethods.find(m => m.id === selectedMethod)?.fee || 0
  const totalPrice = ticketPrice + seatFees + paymentFee

  const validateCardInfo = () => {
    const newErrors = {}
    if (selectedMethod === 'credit-card') {
      if (!cardInfo.number) {
        newErrors.number = 'Vui lòng nhập số thẻ'
      } else if (!/^\d{16}$/.test(cardInfo.number.replace(/\s/g, ''))) {
        newErrors.number = 'Số thẻ không hợp lệ'
      }
      if (!cardInfo.name) {
        newErrors.name = 'Vui lòng nhập tên trên thẻ'
      }
      if (!cardInfo.expiry) {
        newErrors.expiry = 'Vui lòng nhập ngày hết hạn'
      } else if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) {
        newErrors.expiry = 'Định dạng ngày hết hạn không hợp lệ (MM/YY)'
      }
      if (!cardInfo.cvv) {
        newErrors.cvv = 'Vui lòng nhập mã CVV'
      } else if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
        newErrors.cvv = 'Mã CVV không hợp lệ'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createBooking = async () => {
    try {
      // Prepare data for backend API with multiple passengers
      const passengersData = passengers.map((passenger, index) => ({
        first_name: passenger.first_name,
        last_name: passenger.last_name,
        nationality: passenger.nationality,
        date_of_birth: passenger.date_of_birth,
        passport_number: passenger.passport_number,
        seat_id: selectedSeats[index]?.id
      }));
      
      const bookingData = {
        flight_id: flightDetails.id,
        passengers: passengersData,
        payment_method: selectedMethod,
        total_amount: totalPrice
      };
      
      // In a real application, we would call the backend API
      if (authService.isAuthenticated()) {
        try {
          // Call the real API if authenticated
          const response = await bookingService.createCompleteBooking(bookingData);
          
          // If the API call is successful, return the response
          return {
            success: true,
            booking_id: response.id || response.booking_id,
            booking_number: response.booking_number
          };
        } catch (error) {
          console.error('Error creating booking via API:', error);
          throw error;
        }
      } else {
        // Save to local storage for offline/demo functionality
        const bookingId = localStorage.getItem('currentBookingId') || `BK${Date.now().toString().slice(-8)}`;
        const bookingNumber = `VJ${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        
        // Save booking to local storage
        bookingService.saveBookingToLocalStorage({
          id: bookingId,
          bookingNumber: bookingNumber,
          flightId: flightDetails.id,
          flight: flightDetails,
          passengers: passengers,
          selectedSeats: selectedSeats,
          paymentMethod: selectedMethod,
          totalAmount: totalPrice,
          status: 'confirmed'
        });
        
        // For demo purposes, return a successful response
        return {
          success: true,
          booking_id: bookingId,
          booking_number: bookingNumber
        };
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      return { success: false, error };
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isExpired) {
      alert('Phiên thanh toán đã hết hạn. Vui lòng đặt vé lại.')
      navigate('/')
      return
    }

    if (validateCardInfo()) {
      setIsSubmitting(true)
      
      try {
        // Add loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Create booking in backend
        const bookingResult = await createBooking()
        
        if (!bookingResult.success) {
          throw new Error('Failed to create booking')
        }
        
        const bookingId = bookingResult.booking_id
        const bookingNumber = bookingResult.booking_number
        
        // Clear payment session
        localStorage.removeItem('paymentStartTime')
        localStorage.removeItem('currentBookingId')
        
        // Redirect directly to payment-success page with necessary data
        navigate('/payment-success', {
          state: {
            bookingId: bookingId,
            bookingNumber: bookingNumber,
            flight: flightDetails,
            passengers,
            paymentMethod: selectedMethod,
            selectedSeats,
            departureAirport,
            arrivalAirport,
            totalAmount: totalPrice,
            bookingDate: new Date().toISOString()
          },
        })
      } catch (error) {
        console.error('Payment processing error:', error)
        // In a real app, show error message to user
        setIsSubmitting(false)
      }
    }
  }

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 16) value = value.slice(0, 16)
    const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim()
    setCardInfo({ ...cardInfo, number: formattedValue })
  }

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) value = value.slice(0, 4)
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2)
    }
    setCardInfo({ ...cardInfo, expiry: value })
  }

  // Show loading when no data is available
  if (!flightDetails || !passengers || !Array.isArray(passengers) || !passengerCount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý thông tin...</p>
        </div>
      </div>
    );
  }

  // Handle expired session
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <Card.Body className="text-center p-8">
                <div className="text-6xl mb-6">⏰</div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  Phiên thanh toán đã hết hạn
                </h2>
                <p className="text-gray-600 mb-6">
                  Thời gian giữ vé đã hết. Vé của bạn đã được hủy và ghế đã được giải phóng.
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Đặt vé mới
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/booking-history')}
                    className="w-full"
                  >
                    Xem lịch sử đặt vé
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Countdown Timer Header */}
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán</h1>
              
              {/* Countdown Display */}
              <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 ${
                showWarning 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse' 
                  : timeLeft <= 600 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                    : 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">
                    {showWarning ? '⚠️' : timeLeft <= 600 ? '⏳' : '⏱️'}
                  </div>
                  <div>
                    <div className="text-sm opacity-90">
                      {showWarning ? 'SẮP HẾT HạN!' : 'Thời gian còn lại'}
                    </div>
                    <div className="text-3xl font-bold font-mono">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
                <div className="text-sm opacity-90 text-center">
                  <div>Vui lòng hoàn tất thanh toán</div>
                  <div>trước khi hết thời gian</div>
                </div>
              </div>

              {/* Warning message */}
              {showWarning && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg animate-bounce">
                  <p className="text-red-700 font-semibold">
                    🚨 Chỉ còn dưới 5 phút! Vé sẽ tự động hủy nếu không thanh toán kịp thời.
                  </p>
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    showWarning 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                      : timeLeft <= 600
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                        : 'bg-gradient-to-r from-green-500 to-teal-500'
                  }`}
                  style={{ width: `${(timeLeft / 2400) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Thông tin đơn hàng */}
              <div className="lg:col-span-2 space-y-6">
                {/* Thông tin chuyến bay */}
                <Card className="animate-slideUp shadow-lg">
                  <Card.Header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      ✈️ Thông tin chuyến bay
                    </h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hãng hàng không</span>
                        <span className="font-medium">{flightDetails.airline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số hiệu chuyến bay</span>
                        <span className="font-medium">{flightDetails.flightNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tuyến bay</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {departureAirport?.airport_name || flightDetails.from.city} → {arrivalAirport?.airport_name || flightDetails.to.city}
                          </div>
                          <div className="text-sm text-gray-500">
                            {flightDetails.from.code} → {flightDetails.to.code}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày bay</span>
                        <span className="font-medium">{flightDetails.from.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian</span>
                        <span className="font-medium">
                          {flightDetails.from.time} → {flightDetails.to.time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian bay</span>
                        <span className="font-medium">{flightDetails.duration}</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2 mt-2">
                        <span className="text-blue-600 text-xl">👥</span>
                        <span className="font-medium">{passengers.length} hành khách</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Thông tin hành khách */}
                {passengers.map((passenger, index) => (
                  <Card key={index} className="animate-slideUp shadow-lg" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                    <Card.Header className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        👤 Hành khách {index + 1}
                      </h2>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Họ tên</span>
                          <span className="font-medium">
                            {passenger.last_name} {passenger.first_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quốc tịch</span>
                          <span className="font-medium">{passenger.nationality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày sinh</span>
                          <span className="font-medium">{passenger.date_of_birth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số giấy tờ</span>
                          <span className="font-medium">{passenger.passport_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ghế ngồi</span>
                          <span className="font-medium">
                            {selectedSeats[index]?.number} ({flightDetails.seatClass === 'business' ? 'Thương gia' : 'Phổ thông'})
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}

                {/* Phương thức thanh toán */}
                <Card className="animate-slideUp shadow-lg" style={{ animationDelay: '0.3s' }}>
                  <Card.Header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      💳 Phương thức thanh toán
                    </h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {paymentMethods.map((method, index) => (
                        <div
                          key={method.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md ${
                            selectedMethod === method.id
                              ? 'border-primary-500 bg-primary-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedMethod(method.id)}
                          style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                        >
                          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl">
                            {method.icon}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{method.name}</h3>
                              {method.fee > 0 && (
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  +{method.fee.toLocaleString('vi-VN')}đ
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {method.description}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedMethod === method.id
                                  ? 'border-primary-500 bg-primary-500 scale-110'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedMethod === method.id && (
                                <div className="w-2 h-2 rounded-full bg-white animate-scaleIn" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Thông tin thẻ tín dụng */}
                    {selectedMethod === 'credit-card' && (
                      <div className="mt-6 pt-6 border-t animate-fadeIn">
                        <h3 className="text-md font-medium mb-4">
                          Thông tin thẻ tín dụng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Input
                              label="Số thẻ"
                              value={cardInfo.number}
                              onChange={handleCardNumberChange}
                              placeholder="1234 5678 9012 3456"
                              error={errors.number}
                              maxLength={19}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Tên trên thẻ"
                              value={cardInfo.name}
                              onChange={(e) =>
                                setCardInfo({ ...cardInfo, name: e.target.value.toUpperCase() })
                              }
                              placeholder="NGUYEN VAN A"
                              error={errors.name}
                            />
                          </div>
                          <div>
                            <Input
                              label="Ngày hết hạn"
                              value={cardInfo.expiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              error={errors.expiry}
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <Input
                              label="Mã CVV"
                              value={cardInfo.cvv}
                              onChange={(e) =>
                                setCardInfo({ 
                                  ...cardInfo, 
                                  cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                                })
                              }
                              placeholder="123"
                              error={errors.cvv}
                              maxLength={4}
                              type="password"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>

              {/* Tóm tắt giá */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8 animate-slideUp shadow-lg" style={{ animationDelay: '0.3s' }}>
                  <Card.Header className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      💰 Tóm tắt đơn hàng
                    </h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá vé cơ bản</span>
                        <span className="font-medium">
                          {flightDetails.price.toLocaleString('vi-VN')}đ × {passengers.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng giá vé</span>
                        <span className="font-medium">
                          {ticketPrice.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      {seatFees > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phí chọn ghế</span>
                          <span className="font-medium">
                            {seatFees.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      )}
                      {paymentFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phí thanh toán</span>
                          <span className="font-medium">
                            {paymentFee.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Tổng cộng</span>
                          <span className="text-primary-600 animate-heartbeat">
                            {totalPrice.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <Button 
                      type="submit" 
                      className={`w-full transition-all duration-300 ${
                        isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : showWarning
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 animate-pulse'
                            : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:scale-105 hover:shadow-lg'
                      }`}
                      disabled={isSubmitting || isExpired}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Đang xử lý...
                        </div>
                      ) : showWarning ? (
                        <div className="flex items-center justify-center gap-2">
                          <span>⚡</span>
                          Thanh toán ngay!
                        </div>
                      ) : (
                        'Tiến hành thanh toán'
                      )}
                    </Button>
                  </Card.Footer>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 