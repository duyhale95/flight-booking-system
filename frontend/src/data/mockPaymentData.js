// Mock data chung cho luồng thanh toán
export const mockBookingData = {
  // Flight details
  flightDetails: {
    id: 'FL001',
    flightNumber: 'VN123',
    airline: 'Vietnam Airlines',
    from: {
      code: 'SGN',
      city: 'TP. Hồ Chí Minh',
      time: '08:30',
      date: '2024-01-15'
    },
    to: {
      code: 'HAN',
      city: 'Hà Nội',
      time: '10:45',
      date: '2024-01-15'
    },
    duration: '2h 15m',
    price: 2500000,
    seatClass: 'economy',
    aircraft: 'Airbus A321',
    departureTime: new Date('2024-01-15T08:30:00').toISOString()
  },

  // Passenger information
  passengerInfo: {
    firstName: 'Văn A',
    lastName: 'Nguyễn',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    dateOfBirth: '1990-01-01',
    nationality: 'Việt Nam',
    passportNumber: 'AB1234567'
  },

  // Selected seat
  selectedSeat: {
    number: '12A',
    type: 'window',
    price: 100000
  },

  // Search parameters
  searchParams: {
    from: 'SGN',
    to: 'HAN',
    departDate: '2024-01-15',
    passengers: 1,
    seatClass: 'economy'
  },

  // Airport information
  departureAirport: {
    airport_name: 'Sân bay Tân Sơn Nhất',
    city: 'TP. Hồ Chí Minh'
  },

  arrivalAirport: {
    airport_name: 'Sân bay Nội Bài',
    city: 'Hà Nội'
  },

  // Payment information
  paymentMethod: 'vnpay',
  bookingId: 'BK12345678',
  totalAmount: 2600000,
  bookingDate: new Date().toISOString()
}

// Payment methods data
export const paymentMethods = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: '💳',
    description: 'Thanh toán qua VNPay QR Code',
    fee: 0
  },
  {
    id: 'credit-card',
    name: 'Thẻ tín dụng/ghi nợ',
    icon: '💳',
    description: 'Thanh toán bằng thẻ Visa, Mastercard, JCB',
    fee: 25000
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: '📱',
    description: 'Thanh toán qua ứng dụng MoMo',
    fee: 0
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: '💸',
    description: 'Thanh toán qua ứng dụng ZaloPay',
    fee: 0
  },
  {
    id: 'bank-transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: '🏦',
    description: 'Chuyển khoản trực tiếp đến tài khoản ngân hàng',
    fee: 0
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🌐',
    description: 'Thanh toán qua tài khoản PayPal',
    fee: 50000
  }
] 