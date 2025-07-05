export const mockFlights = [
  {
    id: 'VN123',
    airline: 'Vietnam Airlines',
    airlineLogo: '/images/airlines/vietnam-airlines.png',
    flightNumber: 'VN123',
    from: {
      city: 'Hà Nội',
      code: 'HAN',
      time: '08:00',
      date: '2024-03-20',
    },
    to: {
      city: 'TP. Hồ Chí Minh',
      code: 'SGN',
      time: '10:00',
      date: '2024-03-20',
    },
    duration: '2h 00m',
    price: 1200000,
    availableSeats: 45,
    seatClass: 'economy',
  },
  {
    id: 'VN456',
    airline: 'Vietnam Airlines',
    airlineLogo: '/images/airlines/vietnam-airlines.png',
    flightNumber: 'VN456',
    from: {
      city: 'TP. Hồ Chí Minh',
      code: 'SGN',
      time: '14:30',
      date: '2024-03-20',
    },
    to: {
      city: 'Đà Nẵng',
      code: 'DAD',
      time: '15:45',
      date: '2024-03-20',
    },
    duration: '1h 15m',
    price: 850000,
    availableSeats: 32,
    seatClass: 'economy',
  },
  {
    id: 'VN789',
    airline: 'Vietnam Airlines',
    airlineLogo: '/images/airlines/vietnam-airlines.png',
    flightNumber: 'VN789',
    from: {
      city: 'Đà Nẵng',
      code: 'DAD',
      time: '09:15',
      date: '2024-03-21',
    },
    to: {
      city: 'Nha Trang',
      code: 'CXR',
      time: '10:15',
      date: '2024-03-21',
    },
    duration: '1h 00m',
    price: 750000,
    availableSeats: 28,
    seatClass: 'economy',
  },
]

export const mockPassengers = [
  {
    id: 1,
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
    dateOfBirth: '1990-01-01',
    nationality: 'Việt Nam',
    passportNumber: 'P12345678',
  },
  {
    id: 2,
    firstName: 'Trần',
    lastName: 'Thị B',
    email: 'tranthib@example.com',
    phone: '0987654322',
    dateOfBirth: '1992-05-15',
    nationality: 'Việt Nam',
    passportNumber: 'P87654321',
  },
]

export const mockSeats = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  number: `${String.fromCharCode(65 + Math.floor(i / 6))}${(i % 6) + 1}`,
  status: Math.random() > 0.7 ? 'occupied' : 'available',
  price: 0,
}))

export const mockPaymentMethods = [
  {
    id: 'credit-card',
    name: 'Thẻ tín dụng/ghi nợ',
    icon: '💳',
    description: 'Thanh toán bằng thẻ Visa, Mastercard, JCB',
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: '📱',
    description: 'Thanh toán qua ứng dụng MoMo',
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: '💸',
    description: 'Thanh toán qua ứng dụng ZaloPay',
  },
  {
    id: 'bank-transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: '🏦',
    description: 'Chuyển khoản trực tiếp đến tài khoản ngân hàng',
  },
]

export const mockBookings = [
  {
    id: 'BK001',
    flight: mockFlights[0],
    passenger: mockPassengers[0],
    seat: mockSeats[5],
    status: 'confirmed',
    bookingDate: '2024-03-15',
    paymentMethod: 'credit-card',
    totalAmount: 1200000,
  },
  {
    id: 'BK002',
    flight: mockFlights[1],
    passenger: mockPassengers[1],
    seat: mockSeats[12],
    status: 'pending',
    bookingDate: '2024-03-16',
    paymentMethod: 'momo',
    totalAmount: 850000,
  },
]

// Hàm helper để tạo mock data
export const createMockBooking = (flight, passenger, seat) => ({
  id: `BK${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  flight,
  passenger,
  seat,
  status: 'confirmed',
  bookingDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'credit-card',
  totalAmount: flight.price,
})

// Hàm helper để tạo mock flight
export const createMockFlight = (from, to, date) => ({
  id: `VN${Math.floor(Math.random() * 1000)}`,
  airline: 'Vietnam Airlines',
  airlineLogo: '/images/airlines/vietnam-airlines.png',
  flightNumber: `VN${Math.floor(Math.random() * 1000)}`,
  from: {
    city: from.city,
    code: from.code,
    time: '08:00',
    date,
  },
  to: {
    city: to.city,
    code: to.code,
    time: '10:00',
    date,
  },
  duration: '2h 00m',
  price: Math.floor(Math.random() * 1000000) + 500000,
  availableSeats: Math.floor(Math.random() * 50) + 20,
  seatClass: 'economy',
}) 