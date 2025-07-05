import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import SeatSelector from '../components/flight/SeatSelector'
import aviationStackService from '../services/aviationStackService'
import seatService from '../services/seatService'

const steps = [
  { id: 'passenger', name: 'Thông tin hành khách', icon: '👤' },
  { id: 'seat', name: 'Chọn ghế', icon: '✈️' },
  { id: 'confirm', name: 'Xác nhận', icon: '✅' },
]

// Sample empty passenger object
const emptyPassenger = {
  first_name: '',
  last_name: '',
  nationality: 'Việt Nam',
  passport_number: '',
  date_of_birth: '',
}

export default function Book() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Steps: passenger info → seat selection → confirmation
  const [currentStep, setCurrentStep] = useState('passenger')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [currentSeatIndex, setCurrentSeatIndex] = useState(0)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Changed from single passenger to array of passengers
  const [passengers, setPassengers] = useState([{...emptyPassenger}])
  
  const [departureAirport, setDepartureAirport] = useState(null)
  const [arrivalAirport, setArrivalAirport] = useState(null)
  const [errors, setErrors] = useState({})
  
  // Add state for seat data
  const [seatsLoading, setSeatsLoading] = useState(false)
  const [seatsError, setSeatsError] = useState(null)

  // Get flight information from location state
  const flightDetails = location.state?.flight
  const searchParams = location.state?.searchParams || {}
  
  // Get passenger count from search params or default to 1
  const passengerCount = searchParams.passengers || 1

  // Set initial passengers based on passenger count
  useEffect(() => {
    if (passengerCount > 1) {
      setPassengers(Array(passengerCount).fill(0).map(() => ({...emptyPassenger})))
      setSelectedSeats(Array(passengerCount).fill(null))
    }
  }, [passengerCount])
  
  // Function to update a specific passenger's information
  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    }
    setPassengers(updatedPassengers)
  }
  
  // Function to update a specific seat selection
  const updateSeatSelection = (index, seat) => {
    const updatedSeats = [...selectedSeats]
    updatedSeats[index] = seat
    setSelectedSeats(updatedSeats)
  }

  // Load flight seats from backend
  useEffect(() => {
    const loadSeats = async () => {
      if (flightDetails && flightDetails.id) {
        try {
          setSeatsLoading(true)
          setSeatsError(null)
          
          // Fetch all seats with pagination (limit = 250)
          const response = await seatService.getFlightSeats(flightDetails.id, false, 250, 0)
          
          if (response && response.data && Array.isArray(response.data)) {
            // Transform backend seat data to frontend format
            const transformedSeats = response.data.map(seat => ({
              id: seat.id,
              number: seat.seat_number,
              status: seat.is_available ? 'available' : 'occupied',
              price: seat.price || (seat.class === 'business' ? 500000 : 0),
              class: seat.class || flightDetails.seatClass
            }))
            
            // Analyze seat numbers to determine the seat layout
            const seatInfo = analyzeSeatLayout(transformedSeats, flightDetails.seatClass)
            
            // Create a complete seat map with all positions (occupied by default if not available)
            const completeSeats = createCompleteSeatMap(seatInfo, transformedSeats)
            
            // Store all seats
            setSeats(completeSeats)
            console.log(`Loaded ${completeSeats.length} seats for flight ${flightDetails.id}`)
          } else {
            console.warn('No seats data in response')
            setSeatsError('No seats available for this flight.')
            setSeats([])
          }
        } catch (error) {
          console.error('Error loading seats:', error)
          setSeatsError('Unable to load seats. Please try again later.')
          setSeats([])
        } finally {
          setSeatsLoading(false)
        }
      }
    }
    
    if (currentStep === 'seat') {
      loadSeats()
    }
  }, [flightDetails, currentStep])

  // Analyze seat numbers to determine layout structure
  const analyzeSeatLayout = (seats, defaultClass) => {
    // Extract row and column information
    let maxRow = 0
    const columns = new Set()
    
    seats.forEach(seat => {
      // Seat numbers are typically in format like "1A", "12B", etc.
      const match = seat.number.match(/^(\d+)([A-Z])$/)
      if (match) {
        const row = parseInt(match[1], 10)
        const column = match[2]
        
        if (row > maxRow) maxRow = row
        columns.add(column)
      }
    })
    
    // Sort columns alphabetically
    const sortedColumns = Array.from(columns).sort()
    
    // Determine seat class based on column pattern
    let seatClass = defaultClass
    if (sortedColumns.length === 4) {
      // A-B-C-D pattern suggests business class
      seatClass = 'business'
    } else if (sortedColumns.length === 6) {
      // A-B-C-D-E-F pattern suggests economy class
      seatClass = 'economy'
    } else if (sortedColumns.length > 6) {
      // More than 6 columns definitely means economy
      seatClass = 'economy'
    }
    
    return {
      maxRow: maxRow || 30, // Default to 30 rows if couldn't determine
      columns: sortedColumns.length > 0 ? sortedColumns : 
              (seatClass === 'business' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E', 'F']),
      seatClass
    }
  }
  
  // Create a complete seat map with all positions filled
  const createCompleteSeatMap = (seatInfo, availableSeats) => {
    const { maxRow, columns, seatClass } = seatInfo
    const result = []
    const seatMap = {}
    
    // Create a map of existing seats for easy lookup
    availableSeats.forEach(seat => {
      seatMap[seat.number] = seat
    })
    
    // Generate all possible seat positions
    for (let row = 1; row <= maxRow; row++) {
      columns.forEach(column => {
        const seatNumber = `${row}${column}`
        
        if (seatMap[seatNumber]) {
          // If the seat exists in the data, use it
          result.push(seatMap[seatNumber])
        } else {
          // Otherwise, create an occupied seat in this position
          result.push({
            id: seatNumber,
            number: seatNumber,
            status: 'occupied',
            price: seatClass === 'business' ? 500000 : 0,
            class: seatClass
          })
        }
      })
    }
    
    return result
  }

  useEffect(() => {
    // Tải thông tin chi tiết sân bay
    const loadAirportInfo = async () => {
      if (flightDetails) {
        try {
          setLoading(true)
          const [depResponse, arrResponse] = await Promise.all([
            aviationStackService.getAirportByIata(flightDetails.from.code),
            aviationStackService.getAirportByIata(flightDetails.to.code)
          ])
          
          setDepartureAirport(depResponse.data?.[0])
          setArrivalAirport(arrResponse.data?.[0])
        } catch (error) {
          console.error('Error loading airport info:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadAirportInfo()
  }, [flightDetails])

  // Redirect nếu không có thông tin chuyến bay
  useEffect(() => {
    if (!flightDetails) {
      navigate('/')
    }
  }, [flightDetails, navigate])

  if (!flightDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy thông tin chuyến bay
            </h2>
            <p className="text-gray-600 mb-6">
              Vui lòng quay lại trang chủ để tìm kiếm chuyến bay mới
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Quay lại trang chủ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true
    
    // Validate each passenger
    passengers.forEach((passenger, index) => {
      const passengerErrors = {}
      
      if (!passenger.first_name.trim()) {
        passengerErrors.first_name = 'Vui lòng nhập tên'
        isValid = false
      }
      
      if (!passenger.last_name.trim()) {
        passengerErrors.last_name = 'Vui lòng nhập họ'
        isValid = false
      }
      
      if (!passenger.nationality.trim()) {
        passengerErrors.nationality = 'Vui lòng nhập quốc tịch'
        isValid = false
      }
      
      if (!passenger.date_of_birth) {
        passengerErrors.date_of_birth = 'Vui lòng nhập ngày sinh'
        isValid = false
      }
      
      if (!passenger.passport_number.trim()) {
        passengerErrors.passport_number = 'Vui lòng nhập số hộ chiếu/CMND'
        isValid = false
      }
      
      // Add passenger errors if any
      if (Object.keys(passengerErrors).length > 0) {
        newErrors[`passenger_${index}`] = passengerErrors
      }
    })
    
    setErrors(newErrors)
    return isValid
  }

  // Validate only the current passenger
  const validateCurrentPassenger = () => {
    const passenger = passengers[currentSeatIndex]
    const passengerErrors = {}
    let isValid = true
    
    if (!passenger.first_name.trim()) {
      passengerErrors.first_name = 'Vui lòng nhập tên'
      isValid = false
    }
    
    if (!passenger.last_name.trim()) {
      passengerErrors.last_name = 'Vui lòng nhập họ'
      isValid = false
    }
    
    if (!passenger.nationality.trim()) {
      passengerErrors.nationality = 'Vui lòng nhập quốc tịch'
      isValid = false
    }
    
    if (!passenger.date_of_birth) {
      passengerErrors.date_of_birth = 'Vui lòng nhập ngày sinh'
      isValid = false
    }
    
    if (!passenger.passport_number.trim()) {
      passengerErrors.passport_number = 'Vui lòng nhập số hộ chiếu/CMND'
      isValid = false
    }
    
    // Update errors for current passenger only
    const newErrors = { ...errors }
    if (Object.keys(passengerErrors).length > 0) {
      newErrors[`passenger_${currentSeatIndex}`] = passengerErrors
    } else {
      delete newErrors[`passenger_${currentSeatIndex}`]
    }
    
    setErrors(newErrors)
    return isValid
  }

  const handlePassengerSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      setCurrentStep('seat')
    }
  }

  const handleSeatSelect = async (seat) => {
    try {
      if (seat.status === 'occupied') {
        return; // Don't select already occupied seats
      }
      
      // Mark currently selected seat as occupied for other passengers
      const updatedSeats = [...selectedSeats]
      updatedSeats[currentSeatIndex] = seat
      
      // Update selected seats
      setSelectedSeats(updatedSeats)
      
      // Move to next passenger if not the last one
      if (currentSeatIndex < passengerCount - 1) {
        setCurrentSeatIndex(currentSeatIndex + 1)
      }
    } catch (error) {
      console.error('Error selecting seat:', error)
    }
  }

  // Check if all seats are selected
  const areAllSeatsSelected = () => {
    return selectedSeats.length === passengers.length && !selectedSeats.some(seat => !seat)
  }

  const handleConfirm = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // Navigate to payment without reserving the seat
      // The seat will be reserved during the actual payment process
      navigate('/payment', {
        state: {
          flightDetails,
          passengers,
          selectedSeats,
          searchParams,
          departureAirport,
          arrivalAirport
        },
      });
    } catch (error) {
      console.error('Error during booking process:', error);
      setErrors(prev => ({
        ...prev,
        seat: `Error during booking process: ${error.message || 'Please try again later.'}`
      }));
    } finally {
      setLoading(false);
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'passenger':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thông tin hành khách</h3>
              <p className="text-gray-600">Vui lòng điền đầy đủ thông tin để tiếp tục</p>
            </div>
            
            {/* Tabs for multiple passengers */}
            {passengers.length > 1 && (
              <div className="flex overflow-x-auto pb-2 mb-4 space-x-2">
                {passengers.map((_, index) => (
                  <button 
                    key={index}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1
                      ${index === currentSeatIndex 
                        ? 'bg-blue-600 text-white font-semibold' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setCurrentSeatIndex(index)}
                  >
                    <span>👤</span>
                    <span>Hành khách {index + 1}</span>
                  </button>
                ))}
              </div>
            )}
            
            <form onSubmit={handlePassengerSubmit} className="space-y-6">
              {/* Current passenger form */}
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <h4 className="font-semibold text-lg mb-4 text-blue-700 flex items-center gap-2">
                  <span className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-700">
                    {currentSeatIndex + 1}
                  </span>
                  <span>Thông tin hành khách {passengers.length > 1 ? `${currentSeatIndex + 1}` : ''}</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Họ"
                      value={passengers[currentSeatIndex].last_name}
                      onChange={(e) => updatePassenger(currentSeatIndex, 'last_name', e.target.value)}
                      placeholder="Ví dụ: Nguyễn"
                      className={errors[`passenger_${currentSeatIndex}`]?.last_name ? 'border-red-500' : ''}
                      required
                    />
                    {errors[`passenger_${currentSeatIndex}`]?.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${currentSeatIndex}`].last_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      label="Tên"
                      value={passengers[currentSeatIndex].first_name}
                      onChange={(e) => updatePassenger(currentSeatIndex, 'first_name', e.target.value)}
                      placeholder="Ví dụ: Văn A"
                      className={errors[`passenger_${currentSeatIndex}`]?.first_name ? 'border-red-500' : ''}
                      required
                    />
                    {errors[`passenger_${currentSeatIndex}`]?.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${currentSeatIndex}`].first_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <Input
                      label="Ngày sinh"
                      type="date"
                      value={passengers[currentSeatIndex].date_of_birth}
                      onChange={(e) => updatePassenger(currentSeatIndex, 'date_of_birth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={errors[`passenger_${currentSeatIndex}`]?.date_of_birth ? 'border-red-500' : ''}
                      required
                    />
                    {errors[`passenger_${currentSeatIndex}`]?.date_of_birth && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${currentSeatIndex}`].date_of_birth}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quốc tịch
                    </label>
                    <select
                      value={passengers[currentSeatIndex].nationality}
                      onChange={(e) => updatePassenger(currentSeatIndex, 'nationality', e.target.value)}
                      className={`w-full bg-white px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`passenger_${currentSeatIndex}`]?.nationality ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="Việt Nam">Việt Nam</option>
                      <option value="Hoa Kỳ">Hoa Kỳ</option>
                      <option value="Anh">Anh</option>
                      <option value="Pháp">Pháp</option>
                      <option value="Đức">Đức</option>
                      <option value="Nhật Bản">Nhật Bản</option>
                      <option value="Hàn Quốc">Hàn Quốc</option>
                      <option value="Trung Quốc">Trung Quốc</option>
                      <option value="Thái Lan">Thái Lan</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Khác">Khác</option>
                    </select>
                    {errors[`passenger_${currentSeatIndex}`]?.nationality && (
                      <p className="mt-1 text-sm text-red-600">{errors[`passenger_${currentSeatIndex}`].nationality}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Input
                    label="Số hộ chiếu/CMND"
                    value={passengers[currentSeatIndex].passport_number}
                    onChange={(e) => updatePassenger(currentSeatIndex, 'passport_number', e.target.value)}
                    placeholder="Nhập số hộ chiếu hoặc CMND"
                    className={errors[`passenger_${currentSeatIndex}`]?.passport_number ? 'border-red-500' : ''}
                    required
                  />
                  {errors[`passenger_${currentSeatIndex}`]?.passport_number && (
                    <p className="mt-1 text-sm text-red-600">{errors[`passenger_${currentSeatIndex}`].passport_number}</p>
                  )}
                </div>
              </div>
              
              {/* Navigation between passengers */}
              {passengers.length > 1 && (
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentSeatIndex === 0}
                    onClick={() => setCurrentSeatIndex(currentSeatIndex - 1)}
                    className="px-4"
                  >
                    ← Hành khách trước
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentSeatIndex === passengers.length - 1}
                    onClick={() => {
                      if (validateCurrentPassenger()) {
                        setCurrentSeatIndex(currentSeatIndex + 1)
                      }
                    }}
                    className="px-4"
                  >
                    Hành khách tiếp theo →
                  </Button>
                </div>
              )}
              
              <div className="pt-6">
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105">
                  Tiếp tục chọn ghế
                </Button>
              </div>
            </form>
          </div>
        );

      case 'seat':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Chọn ghế ngồi</h3>
              <p className="text-gray-600">
                Chọn ghế yêu thích cho từng hành khách
              </p>
            </div>
            
            {/* Passenger tabs */}
            {passengers.length > 1 && (
              <div className="flex overflow-x-auto pb-2 mb-4 space-x-2">
                {passengers.map((passenger, index) => (
                  <button 
                    key={index}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1
                      ${index === currentSeatIndex 
                        ? 'bg-blue-600 text-white font-semibold' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setCurrentSeatIndex(index)}
                  >
                    <span>👤</span>
                    <span>{passenger.first_name || `Hành khách ${index + 1}`}</span>
                    {selectedSeats[index] && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">
                        {selectedSeats[index].number}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Current passenger info */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold flex items-center gap-2 mb-1">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  {currentSeatIndex + 1}
                </span>
                Đang chọn ghế cho: {passengers[currentSeatIndex].first_name || `Hành khách ${currentSeatIndex + 1}`}
              </h4>
              {selectedSeats[currentSeatIndex] ? (
                <p className="text-sm text-blue-800">
                  Đã chọn ghế: <strong>{selectedSeats[currentSeatIndex].number}</strong>
                </p>
              ) : (
                <p className="text-sm text-blue-800">Vui lòng chọn ghế cho hành khách này</p>
              )}
            </div>
            
            {seatsLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Đang tải thông tin ghế...</p>
              </div>
            ) : seatsError ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                <p className="text-red-600">{seatsError}</p>
              </div>
            ) : seats.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                <p className="text-yellow-600">Không có thông tin ghế cho chuyến bay này</p>
              </div>
            ) : (
              <SeatSelector
                seats={seats}
                selectedSeat={selectedSeats[currentSeatIndex]}
                onSelect={handleSeatSelect}
                seatClass={flightDetails.seatClass}
                // Mark other passengers' selected seats as occupied
                occupiedSeats={selectedSeats.filter((seat, idx) => idx !== currentSeatIndex && seat !== null)}
              />
            )}
            
            {/* Navigation between passengers */}
            {passengers.length > 1 && (
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  disabled={currentSeatIndex === 0}
                  onClick={() => setCurrentSeatIndex(currentSeatIndex - 1)}
                  className="px-4"
                >
                  ← Hành khách trước
                </Button>
                
                <Button
                  variant="outline"
                  disabled={currentSeatIndex === passengers.length - 1}
                  onClick={() => {
                    if (selectedSeats[currentSeatIndex]) {
                      setCurrentSeatIndex(currentSeatIndex + 1)
                    } else {
                      alert('Vui lòng chọn ghế cho hành khách hiện tại trước')
                    }
                  }}
                  className="px-4"
                >
                  Hành khách tiếp theo →
                </Button>
              </div>
            )}
            
            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('passenger')}
                className="flex-1 py-3"
              >
                ← Quay lại
              </Button>
              <Button
                onClick={() => setCurrentStep('confirm')}
                disabled={!areAllSeatsSelected()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Xác nhận →
              </Button>
            </div>
          </div>
        );

      case 'confirm':
        // Calculate total price for all passengers
        const seatFees = selectedSeats.reduce((total, seat) => total + (seat?.price || 0), 0)
        const ticketPrices = flightDetails.price * passengers.length
        const totalPrice = ticketPrices + seatFees

        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận thông tin</h3>
              <p className="text-gray-600">Kiểm tra lại thông tin trước khi thanh toán</p>
            </div>

            {/* Flight Information */}
            <Card className="overflow-hidden shadow-lg">
              <Card.Header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  ✈️ Thông tin chuyến bay
                </h3>
              </Card.Header>
              <Card.Body className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hãng hàng không:</span>
                    <span className="font-semibold">{flightDetails.airline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số hiệu:</span>
                    <span className="font-semibold">{flightDetails.flightNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Từ:</span>
                    <span className="font-semibold">
                      {departureAirport?.airport_name || flightDetails.from.city} ({flightDetails.from.code})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đến:</span>
                    <span className="font-semibold">
                      {arrivalAirport?.airport_name || flightDetails.to.city} ({flightDetails.to.code})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày bay:</span>
                    <span className="font-semibold">{flightDetails.from.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian bay:</span>
                    <span className="font-semibold">{flightDetails.duration}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-center items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{flightDetails.from.time}</div>
                      <div className="text-sm text-gray-600">{flightDetails.from.code}</div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="h-0.5 w-full bg-blue-300 relative">
                        <div className="absolute left-0 top-1/2 w-2 h-2 -mt-1 bg-blue-600 rounded-full"></div>
                        <div className="absolute right-0 top-1/2 w-2 h-2 -mt-1 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{flightDetails.to.time}</div>
                      <div className="text-sm text-gray-600">{flightDetails.to.code}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-center gap-2">
                  <span className="text-yellow-600 text-xl">👥</span>
                  <span className="font-medium">{passengers.length} hành khách</span>
                </div>
              </Card.Body>
            </Card>

            {/* Passenger Information */}
            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <Card key={index} className="overflow-hidden shadow-lg">
                  <Card.Header className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      👤 Hành khách {index + 1}
                    </h3>
                  </Card.Header>
                  <Card.Body className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Họ tên:</span>
                        <span className="font-semibold">
                          {passenger.last_name} {passenger.first_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quốc tịch:</span>
                        <span className="font-semibold">{passenger.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày sinh:</span>
                        <span className="font-semibold">{passenger.date_of_birth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số giấy tờ:</span>
                        <span className="font-semibold">{passenger.passport_number}</span>
                      </div>
                    </div>
                    {selectedSeats[index] && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-600">Ghế đã chọn:</span>
                            <span className="font-bold text-green-600 ml-2 text-lg">{selectedSeats[index].number}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {flightDetails.seatClass === 'business' ? 'Hạng Thương Gia' : 'Hạng Phổ Thông'}
                            </div>
                            {selectedSeats[index].price > 0 && (
                              <div className="text-sm font-semibold text-green-600">
                                +{selectedSeats[index].price.toLocaleString('vi-VN')}đ
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>

            {/* Price Summary */}
            <Card className="overflow-hidden shadow-lg">
              <Card.Header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  💰 Chi tiết giá
                </h3>
              </Card.Header>
              <Card.Body className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá vé cơ bản:</span>
                  <span className="font-semibold">{flightDetails.price.toLocaleString('vi-VN')}đ x {passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng giá vé:</span>
                  <span className="font-semibold">{ticketPrices.toLocaleString('vi-VN')}đ</span>
                </div>
                {seatFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí chọn ghế:</span>
                    <span className="font-semibold">{seatFees.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold">Tổng cộng:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('seat')}
                className="flex-1 py-3"
              >
                ← Quay lại
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                Tiến hành thanh toán →
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-lg font-medium">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                        step.id === currentStep ||
                        (currentStep === 'seat' && step.id === 'passenger') ||
                        (currentStep === 'confirm' && 
                          (step.id === 'passenger' || step.id === 'seat'))
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                          : 'bg-white text-gray-400 shadow-md border-2 border-gray-200'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`mt-3 text-sm font-semibold transition-colors duration-300 ${
                        step.id === currentStep
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-1 mx-4 rounded-full transition-colors duration-300 ${
                      (currentStep === 'seat' && step.id === 'passenger') ||
                      (currentStep === 'confirm' && (step.id === 'passenger' || step.id === 'seat'))
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-2xl border-0 overflow-hidden">
            <Card.Body className="p-8 lg:p-12">
              {renderStep()}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
} 