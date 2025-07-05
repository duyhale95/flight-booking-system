import { useState } from 'react'
import { FaSearch, FaTicketAlt, FaCalendarAlt, FaUser, FaPlane } from 'react-icons/fa'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function TicketLookup() {
  const [searchData, setSearchData] = useState({
    bookingReference: '',
    lastName: ''
  })
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchData.bookingReference) {
      setError('Vui lòng nhập mã đặt chỗ')
      return
    }

    if (!searchData.lastName) {
      setError('Vui lòng nhập họ tên hành khách')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data for demonstration
      setSearchResults({
        ticketNumber: searchData.ticketNumber || 'VN1234567890',
        bookingReference: searchData.bookingReference || 'ABCD12',
        passenger: {
          firstName: 'Nguyễn',
          lastName: searchData.lastName
        },
        flight: {
          flightNumber: 'VN207',
          airline: 'Vietnam Airlines',
          departure: {
            airport: 'Nội Bài (HAN)',
            city: 'Hà Nội',
            time: '2024-02-15T08:30:00',
            terminal: 'T1',
            gate: 'A12'
          },
          arrival: {
            airport: 'Tân Sơn Nhất (SGN)',
            city: 'TP. Hồ Chí Minh',
            time: '2024-02-15T10:45:00',
            terminal: 'T1',
            gate: 'B05'
          }
        },
        seat: '12A',
        status: 'confirmed',
        bookingDate: '2024-01-15T14:30:00',
        price: 2500000
      })
    } catch (err) {
      setError('Không tìm thấy thông tin vé. Vui lòng kiểm tra lại.')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'confirmed': { text: 'Đã xác nhận', color: 'text-green-600 bg-green-100' },
      'pending': { text: 'Chờ xác nhận', color: 'text-yellow-600 bg-yellow-100' },
      'cancelled': { text: 'Đã hủy', color: 'text-red-600 bg-red-100' },
      'completed': { text: 'Đã hoàn thành', color: 'text-blue-600 bg-blue-100' }
    }
    return statusMap[status] || statusMap['pending']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4">
            <FaSearch className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tra cứu vé máy bay</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nhập thông tin vé hoặc mã đặt chỗ để kiểm tra chi tiết chuyến bay của bạn
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 p-6 ">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Booking Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                Mã đặt chỗ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bookingReference"
                value={searchData.bookingReference}
                onChange={handleInputChange}
                placeholder="VD: ABCD12"
                required
                className="w-full px-4 py-3 bg-white shadow-md rounded-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Họ tên hành khách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={searchData.lastName}
                onChange={handleInputChange}
                placeholder="VD: Nguyễn Văn A"
                required
                className="w-full px-4 py-3 bg-white shadow-md rounded-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Search Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang tìm kiếm...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaSearch className="mr-2" />
                  Tra cứu vé
                </div>
              )}
            </Button>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Thông tin vé máy bay</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusText(searchResults.status).color}`}>
                {getStatusText(searchResults.status).text}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Flight Info */}
              <div className="space-y-6">
                {/* Flight Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FaPlane className="mr-2 text-blue-600" />
                    Chi tiết chuyến bay
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số hiệu:</span>
                      <span className="font-medium">{searchResults.flight.flightNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hãng bay:</span>
                      <span className="font-medium">{searchResults.flight.airline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ghế ngồi:</span>
                      <span className="font-medium">{searchResults.seat}</span>
                    </div>
                  </div>
                </div>

                {/* Departure */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Khởi hành</h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-lg">{searchResults.flight.departure.city}</div>
                    <div className="text-gray-600">{searchResults.flight.departure.airport}</div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-blue-600">
                        {formatDateTime(searchResults.flight.departure.time).time}
                      </span>
                      <span className="text-gray-600">
                        {formatDateTime(searchResults.flight.departure.time).date}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Terminal: {searchResults.flight.departure.terminal} | 
                      Cửa: {searchResults.flight.departure.gate}
                    </div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Đến nơi</h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium text-lg">{searchResults.flight.arrival.city}</div>
                    <div className="text-gray-600">{searchResults.flight.arrival.airport}</div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-green-600">
                        {formatDateTime(searchResults.flight.arrival.time).time}
                      </span>
                      <span className="text-gray-600">
                        {formatDateTime(searchResults.flight.arrival.time).date}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Terminal: {searchResults.flight.arrival.terminal} | 
                      Cửa: {searchResults.flight.arrival.gate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Info */}
              <div className="space-y-6">
                {/* Passenger Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FaUser className="mr-2 text-gray-600" />
                    Thông tin hành khách
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-medium">
                        {searchResults.passenger.firstName} {searchResults.passenger.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FaTicketAlt className="mr-2 text-gray-600" />
                    Thông tin đặt vé
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã vé:</span>
                      <span className="font-medium">{searchResults.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đặt chỗ:</span>
                      <span className="font-medium">{searchResults.bookingReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đặt:</span>
                      <span className="font-medium">
                        {formatDateTime(searchResults.bookingDate).date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá vé:</span>
                      <span className="font-medium text-blue-600">
                        {searchResults.price.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    In vé điện tử
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full py-3 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Check-in trực tuyến
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 