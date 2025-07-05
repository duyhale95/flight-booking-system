import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUserFriends, FaExchangeAlt, FaMapMarkerAlt, FaSpinner, FaClock, FaFire, FaExclamationTriangle, FaInfoCircle, FaChevronDown } from 'react-icons/fa'
import Button from '../ui/Button'
import aviationStackService from '../../services/aviationStackService'
import { toast } from 'react-hot-toast'

export default function HeroSearch() {
  const navigate = useNavigate()
  const fromInputRef = useRef(null)
  const toInputRef = useRef(null)
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    fromDisplay: '',
    toDisplay: '',
    departureDate: '',
    passengers: 1,
    class: 'economy'
  })
  const [airports, setAirports] = useState([])
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [loadingFrom, setLoadingFrom] = useState(false)
  const [loadingTo, setLoadingTo] = useState(false)
  const [error, setError] = useState('')
  const [recentSearches] = useState([
    { iata_code: 'HAN', airport_name: 'Sân bay Nội Bài', city_name: 'Hà Nội' },
    { iata_code: 'SGN', airport_name: 'Sân bay Tân Sơn Nhất', city_name: 'TP. Hồ Chí Minh' },
    { iata_code: 'DAD', airport_name: 'Sân bay Đà Nẵng', city_name: 'Đà Nẵng' },
    { iata_code: 'CXR', airport_name: 'Sân bay Cam Ranh', city_name: 'Nha Trang' },
    { iata_code: 'PQC', airport_name: 'Sân bay Phú Quốc', city_name: 'Phú Quốc' },
    { iata_code: 'VCA', airport_name: 'Sân bay Cần Thơ', city_name: 'Cần Thơ' },
    { iata_code: 'VII', airport_name: 'Sân bay Vinh', city_name: 'Vinh' },
    { iata_code: 'HUI', airport_name: 'Sân bay Huế', city_name: 'Huế' },
    { iata_code: 'VCL', airport_name: 'Sân bay Chu Lai', city_name: 'Chu Lai' },
    { iata_code: 'BMV', airport_name: 'Sân bay Buôn Ma Thuột', city_name: 'Buôn Ma Thuột' },
    { iata_code: 'DLI', airport_name: 'Sân bay Liên Khương', city_name: 'Đà Lạt' },
    { iata_code: 'VKG', airport_name: 'Sân bay Rạch Giá', city_name: 'Rạch Giá' },
    { iata_code: 'TBB', airport_name: 'Sân bay Tuy Hòa', city_name: 'Tuy Hòa' },
    { iata_code: 'VDH', airport_name: 'Sân bay Đồng Hới', city_name: 'Đồng Hới' },
    { iata_code: 'PXU', airport_name: 'Sân bay Pleiku', city_name: 'Pleiku' },
    { iata_code: 'CAH', airport_name: 'Sân bay Cà Mau', city_name: 'Cà Mau' },
    { iata_code: 'DIN', airport_name: 'Sân bay Điện Biên', city_name: 'Điện Biên' },
    { iata_code: 'NHA', airport_name: 'Sân bay Nha Trang', city_name: 'Nha Trang' },
    { iata_code: 'THD', airport_name: 'Sân bay Thọ Xuân', city_name: 'Thanh Hóa' },
    { iata_code: 'XCL', airport_name: 'Sân bay Kiên Lương', city_name: 'Kiên Lương' }
  ])
  const [popularDestinations] = useState([
    { iata_code: 'HAN', airport_name: 'Sân bay Nội Bài', city_name: 'Hà Nội', country_name: 'Việt Nam', isHot: true },
    { iata_code: 'SGN', airport_name: 'Sân bay Tân Sơn Nhất', city_name: 'TP. Hồ Chí Minh', country_name: 'Việt Nam', isHot: true },
    { iata_code: 'DAD', airport_name: 'Sân bay Đà Nẵng', city_name: 'Đà Nẵng', country_name: 'Việt Nam', isHot: true },
    { iata_code: 'PQC', airport_name: 'Sân bay Phú Quốc', city_name: 'Phú Quốc', country_name: 'Việt Nam', isHot: true },
    { iata_code: 'CXR', airport_name: 'Sân bay Cam Ranh', city_name: 'Nha Trang', country_name: 'Việt Nam', isHot: true },
    { iata_code: 'VCA', airport_name: 'Sân bay Cần Thơ', city_name: 'Cần Thơ', country_name: 'Việt Nam' },
    { iata_code: 'VII', airport_name: 'Sân bay Vinh', city_name: 'Vinh', country_name: 'Việt Nam' },
    { iata_code: 'HUI', airport_name: 'Sân bay Huế', city_name: 'Huế', country_name: 'Việt Nam' },
    { iata_code: 'VCL', airport_name: 'Sân bay Chu Lai', city_name: 'Chu Lai', country_name: 'Việt Nam' },
    { iata_code: 'BMV', airport_name: 'Sân bay Buôn Ma Thuột', city_name: 'Buôn Ma Thuột', country_name: 'Việt Nam' },
    { iata_code: 'DLI', airport_name: 'Sân bay Liên Khương', city_name: 'Đà Lạt', country_name: 'Việt Nam' },
    { iata_code: 'VKG', airport_name: 'Sân bay Rạch Giá', city_name: 'Rạch Giá', country_name: 'Việt Nam' },
    { iata_code: 'TBB', airport_name: 'Sân bay Tuy Hòa', city_name: 'Tuy Hòa', country_name: 'Việt Nam' },
    { iata_code: 'VDH', airport_name: 'Sân bay Đồng Hới', city_name: 'Đồng Hới', country_name: 'Việt Nam' },
    { iata_code: 'PXU', airport_name: 'Sân bay Pleiku', city_name: 'Pleiku', country_name: 'Việt Nam' },
    { iata_code: 'CAH', airport_name: 'Sân bay Cà Mau', city_name: 'Cà Mau', country_name: 'Việt Nam' },
    { iata_code: 'DIN', airport_name: 'Sân bay Điện Biên', city_name: 'Điện Biên', country_name: 'Việt Nam' },
    { iata_code: 'NHA', airport_name: 'Sân bay Nha Trang', city_name: 'Nha Trang', country_name: 'Việt Nam' },
    { iata_code: 'THD', airport_name: 'Sân bay Thọ Xuân', city_name: 'Thanh Hóa', country_name: 'Việt Nam' },
    { iata_code: 'XCL', airport_name: 'Sân bay Kiên Lương', city_name: 'Kiên Lương', country_name: 'Việt Nam' }
  ])

  // New state for controlling passenger dropdown visibility
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false)
  const passengerDropdownRef = useRef(null)
  
  // Handle clicking outside passenger dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(event.target)) {
        setShowPassengerDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    // Tải danh sách sân bay ban đầu
    aviationStackService.searchAirports('').then(response => {
      setAirports(response.data || [])
    })
  }, [])

  // Check if departure and arrival are the same
  useEffect(() => {
    if (formData.from && formData.to && formData.from === formData.to) {
      setError('Điểm khởi hành và điểm đến không thể là cùng một nơi')
    } else {
      setError('')
    }
  }, [formData.from, formData.to])

  const handleFromChange = async (e) => {
    const value = e.target.value
    setFormData({ ...formData, fromDisplay: value })
    
    if (value.length > 1) {
      setLoadingFrom(true)
      try {
        const response = await aviationStackService.searchAirports(value)
        setFromSuggestions(response.data || [])
        setShowFromSuggestions(true)
      } catch (error) {
        console.error('Lỗi tìm kiếm sân bay:', error)
      } finally {
        setLoadingFrom(false)
      }
    } else {
      setShowFromSuggestions(true) // Hiện gợi ý mặc định
      setFromSuggestions([])
    }
  }

  const handleToChange = async (e) => {
    const value = e.target.value
    setFormData({ ...formData, toDisplay: value })
    
    if (value.length > 1) {
      setLoadingTo(true)
      try {
        const response = await aviationStackService.searchAirports(value)
        setToSuggestions(response.data || [])
        setShowToSuggestions(true)
      } catch (error) {
        console.error('Lỗi tìm kiếm sân bay:', error)
      } finally {
        setLoadingTo(false)
      }
    } else {
      setShowToSuggestions(true) // Hiện gợi ý mặc định
      setToSuggestions([])
    }
  }

  const selectFromAirport = (airport) => {
    const displayText = `${airport.city_name || airport.airport_name} - ${airport.iata_code}`
    
    // Check if this would make departure and arrival the same
    if (formData.to === airport.iata_code) {
      toast.error('Điểm khởi hành và điểm đến không thể là cùng một nơi')
    }
    
    setFormData({ 
      ...formData, 
      from: airport.iata_code,
      fromDisplay: displayText
    })
    setShowFromSuggestions(false)
    if (fromInputRef.current) {
      fromInputRef.current.blur()
    }
  }

  const selectToAirport = (airport) => {
    const displayText = `${airport.city_name || airport.airport_name} - ${airport.iata_code}`
    
    // Check if this would make departure and arrival the same
    if (formData.from === airport.iata_code) {
      toast.error('Điểm khởi hành và điểm đến không thể là cùng một nơi')
    }
    
    setFormData({ 
      ...formData, 
      to: airport.iata_code,
      toDisplay: displayText
    })
    setShowToSuggestions(false)
    if (toInputRef.current) {
      toInputRef.current.blur()
    }
  }

  const swapLocations = () => {
    setFormData({
      ...formData,
      from: formData.to,
      to: formData.from,
      fromDisplay: formData.toDisplay,
      toDisplay: formData.fromDisplay
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.from || !formData.to) {
      toast.error('Vui lòng chọn điểm đi và điểm đến')
      return
    }
    
    if (formData.from === formData.to) {
      toast.error('Điểm khởi hành và điểm đến không thể là cùng một nơi')
      return
    }
    
    navigate('/search-results', {
      state: {
        searchParams: {
          ...formData,
          type: 'one-way'
        }
      }
    })
  }

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const renderSuggestionDropdown = (suggestions, isLoading, onSelect, show, type) => {
    if (!show) return null

    const defaultSuggestions = suggestions.length === 0 ? 
      (type === 'from' ? recentSearches : popularDestinations) : 
      suggestions
      
    // Filter out airports that match the other selected airport
    const filteredSuggestions = defaultSuggestions.filter(airport => {
      if (type === 'from' && formData.to === airport.iata_code) {
        return false;
      }
      if (type === 'to' && formData.from === airport.iata_code) {
        return false;
      }
      return true;
    });

    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden mt-2">
        {isLoading && (
          <div className="px-4 py-3 flex items-center gap-2 text-gray-500">
            <FaSpinner className="animate-spin" />
            <span>Đang tìm kiếm...</span>
          </div>
        )}
        
        {!isLoading && suggestions.length === 0 && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
              {type === 'from' ? (
                <>
                  <FaClock className="text-gray-400" />
                  <span>Tìm kiếm gần đây</span>
                </>
              ) : (
                <>
                  <FaFire className="text-orange-500" />
                  <span>Điểm đến phổ biến</span>
                </>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredSuggestions.map((airport) => (
                <div
                  key={airport.iata_code}
                  className="px-3 py-3 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors duration-150 mb-1"
                  onMouseDown={() => onSelect(airport)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {airport.city_name || airport.airport_name}
                        </span>
                        {airport.isHot && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                            HOT
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{airport.airport_name}</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      {airport.iata_code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
            {suggestions
              .filter(airport => {
                if (type === 'from' && formData.to === airport.iata_code) return false;
                if (type === 'to' && formData.from === airport.iata_code) return false;
                return true;
              })
              .map((airport) => (
                <div
                  key={airport.iata_code}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors duration-150 mb-1"
                  onMouseDown={() => onSelect(airport)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {airport.city_name || airport.airport_name}
                      </div>
                      <div className="text-sm text-gray-600">{airport.airport_name}</div>
                    </div>
                    <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      {airport.iata_code}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-500 via-primary-600 to-purple-600 py-20 px-4">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow mb-6">
          Đặt vé máy bay <span className="bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">giá tốt nhất</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-medium">
          So sánh, săn vé rẻ từ hàng trăm hãng hàng không chỉ với 1 lần tìm kiếm
        </p>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-6"
        >
          {/* Main Search Header */}
          <div className="mb-6">
            <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
              <FaPlaneDeparture className="text-blue-600" />
              Tìm chuyến bay một chiều
            </h2>
          </div>

          {/* Main Search Form */}
          <div className="flex gap-4 items-end">
            {/* From Airport */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaPlaneDeparture className="w-4 h-4 mr-2 text-green-500" />
                Điểm khởi hành
              </label>
              <div className="relative group">
                <input
                  ref={fromInputRef}
                  type="text"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg font-medium hover:border-blue-400 group-hover:shadow-md"
                  placeholder="Điểm khởi hành"
                  value={formData.fromDisplay}
                  onChange={handleFromChange}
                  onFocus={() => setShowFromSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaMapMarkerAlt className="w-5 h-5 text-green-500 group-hover:text-green-600 transition-colors" />
                </div>
              </div>
              {renderSuggestionDropdown(fromSuggestions, loadingFrom, selectFromAirport, showFromSuggestions, 'from')}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={swapLocations}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-4 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 hover:rotate-180"
                title="Hoán đổi điểm đi - điểm đến"
              >
                <FaExchangeAlt className="text-lg" />
              </button>
            </div>

            {/* To Airport */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaPlaneArrival className="w-4 h-4 mr-2 text-red-500" />
                Điểm đến
              </label>
              <div className="relative group">
                <input
                  ref={toInputRef}
                  type="text"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg font-medium hover:border-blue-400 group-hover:shadow-md"
                  placeholder="Điểm đến"
                  value={formData.toDisplay}
                  onChange={handleToChange}
                  onFocus={() => setShowToSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaMapMarkerAlt className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                </div>
              </div>
              {renderSuggestionDropdown(toSuggestions, loadingTo, selectToAirport, showToSuggestions, 'to')}
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mt-2 text-red-500 flex items-center gap-2">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          {/* Date Selection Row */}
          <div className="flex gap-4 mt-6">
            {/* Date Fields */}
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-500" />
                Ngày đi
              </label>
              <div className="relative group">
                <input
                  type="date"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 text-lg font-medium hover:border-blue-400 group-hover:shadow-md cursor-pointer
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer 
                  [&::-webkit-calendar-picker-indicator]:absolute 
                  [&::-webkit-calendar-picker-indicator]:right-4 
                  [&::-webkit-calendar-picker-indicator]:top-1/2 
                  [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 
                  [&::-webkit-calendar-picker-indicator]:w-6 
                  [&::-webkit-calendar-picker-indicator]:h-6 
                  [&::-webkit-calendar-picker-indicator]:opacity-0 
                  [&::-webkit-calendar-picker-indicator]:z-10"
                  value={formData.departureDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFormData({ ...formData, departureDate: e.target.value })}
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaCalendarAlt className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
              {formData.departureDate && (
                <div className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 px-2 py-1 rounded-md inline-block">
                  {formatDateDisplay(formData.departureDate)}
                </div>
              )}
            </div>

            {/* Passengers - Enhanced Version */}
            <div className="flex-1 relative" ref={passengerDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaUserFriends className="w-4 h-4 mr-2 text-purple-500" />
                Hành khách
              </label>
              <div className="relative group">
                <div 
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl transition-all duration-200 bg-white hover:border-blue-400 group-hover:shadow-md flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                >
                  <span className="text-lg font-medium text-gray-900 flex items-center">
                    <span className="flex items-center gap-2 mr-2">
                      <FaUserFriends className="text-purple-600" />
                      <span>{formData.passengers}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      {formData.passengers > 1 ? 'người lớn' : 'người lớn'}
                    </span>
                  </span>
                  <div className={`transform transition-transform duration-300 ${showPassengerDropdown ? 'rotate-180' : ''}`}>
                    <FaChevronDown className="text-gray-500" />
                  </div>
                </div>
                
                {/* Dropdown for passenger selection */}
                {showPassengerDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-lg mt-2 z-20 border border-gray-200 p-4 animate-fadeIn">
                    <div className="mb-4">
                      <p className="font-medium text-gray-900 mb-1">Người lớn</p>
                      <p className="text-sm text-gray-600 mb-3">Từ 12 tuổi trở lên</p>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.passengers > 1) {
                              setFormData({ ...formData, passengers: formData.passengers - 1 })
                            }
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            formData.passengers <= 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          disabled={formData.passengers <= 1}
                        >
                          <span className="text-xl font-bold">−</span>
                        </button>
                        <span className="text-xl font-medium w-10 text-center">{formData.passengers}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.passengers < 9) {
                              setFormData({ ...formData, passengers: formData.passengers + 1 })
                            }
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            formData.passengers >= 9 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          disabled={formData.passengers >= 9}
                        >
                          <span className="text-xl font-bold">+</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
                      <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Lưu ý:</p>
                        <p>Tối đa 9 người lớn trong một lần đặt vé.</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
                      onClick={() => setShowPassengerDropdown(false)}
                    >
                      Xác nhận
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-transparent mb-2">.</label>
              <Button
                type="submit"
                className="w-full px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                disabled={!!error}
              >
                🔍 Tìm chuyến bay
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </section>
  )
} 