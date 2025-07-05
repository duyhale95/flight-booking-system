import { useState, useEffect } from 'react'
import Card from '../ui/Card'

const SeatSelector = ({ seats, selectedSeat, onSelect, seatClass = 'economy', occupiedSeats = [] }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [seatMap, setSeatMap] = useState({})

  // Process seats into a map for easy lookup and mark seats occupied by other passengers
  useEffect(() => {
    const map = {}
    seats.forEach(seat => {
      // Create a copy to avoid mutating original seat object
      const seatCopy = {...seat}
      
      // Check if the seat is occupied by another passenger
      const isOccupiedByOtherPassenger = occupiedSeats.some(
        occupiedSeat => occupiedSeat && occupiedSeat.number === seat.number
      )
      
      // Mark seat as occupied if it's already occupied by another passenger
      if (isOccupiedByOtherPassenger) {
        seatCopy.status = 'occupied'
        seatCopy.occupiedBy = 'other-passenger'
      }
      
      map[seat.number] = seatCopy
    })
    setSeatMap(map)
  }, [seats, occupiedSeats])

  // Create a complete seat layout
  const createSeatLayout = () => {
    // Extract unique row numbers and columns from the seats
    const rows = new Set()
    const columnsByRow = {}

    seats.forEach(seat => {
      const match = seat.number.match(/^(\d+)([A-Z])$/)
      if (match) {
        const row = parseInt(match[1], 10)
        const column = match[2]
        
        rows.add(row)
        
        if (!columnsByRow[row]) {
          columnsByRow[row] = new Set()
        }
        columnsByRow[row].add(column)
      }
    })

    // Convert to sorted arrays
    const sortedRows = Array.from(rows).sort((a, b) => a - b)
    
    const layout = []
    
    sortedRows.forEach(row => {
      // Get columns for this row and sort them
      const rowColumns = Array.from(columnsByRow[row] || []).sort()
      
      // Find the midpoint to split into left and right
      const midPoint = Math.ceil(rowColumns.length / 2)
      
      const rowSeats = {
        left: [],
        right: []
      }
      
      // Add left seats
      for (let i = 0; i < midPoint; i++) {
        if (i < rowColumns.length) {
          const column = rowColumns[i]
          const seatNumber = `${row}${column}`
          if (seatMap[seatNumber]) {
            rowSeats.left.push(seatMap[seatNumber])
          }
        }
      }
      
      // Add right seats
      for (let i = midPoint; i < rowColumns.length; i++) {
        const column = rowColumns[i]
        const seatNumber = `${row}${column}`
        if (seatMap[seatNumber]) {
          rowSeats.right.push(seatMap[seatNumber])
        }
      }
      
      // Only add row if it has seats
      if (rowSeats.left.length > 0 || rowSeats.right.length > 0) {
        layout.push({ row, seats: rowSeats })
      }
    })
    
    return layout
  }

  const getSeatStatus = (seat) => {
    if (seat.status === 'occupied') return seat.occupiedBy === 'other-passenger' ? 'other-passenger' : 'occupied'
    if (selectedSeat && seat.number === selectedSeat.number) return 'selected'
    if (hoveredSeat === seat.number) return 'hovered'
    return 'available'
  }

  const getSeatClass = (status, isBusinessClass = false) => {
    const baseSize = isBusinessClass ? 'w-14 h-14' : 'w-12 h-12'
    const baseClass = `${baseSize} rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-300 transform relative`
    
    switch (status) {
      case 'occupied':
        return `${baseClass} bg-gray-400 text-gray-600 cursor-not-allowed opacity-50`
      case 'other-passenger':
        return `${baseClass} bg-orange-300 text-orange-800 cursor-not-allowed opacity-70 border-2 border-orange-400`
      case 'selected':
        return `${baseClass} bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer shadow-lg scale-105 ring-2 ring-blue-300`
      case 'hovered':
        return `${baseClass} bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 cursor-pointer shadow-md scale-102 border-2 border-blue-300`
      case 'available':
        return `${baseClass} bg-white text-gray-700 cursor-pointer shadow-sm border-2 border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102`
      default:
        return `${baseClass} invisible`
    }
  }

  const handleSeatClick = (seat) => {
    if (seat && seat.status !== 'occupied') {
      onSelect(seat)
    }
  }

  const seatLayout = createSeatLayout()

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        <Card.Header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="text-center">
            <h3 className="text-xl font-bold">Chọn ghế ngồi</h3>
            <p className="text-blue-100 mt-1">
              {seatClass === 'business' ? 'Hạng Thương Gia' : 'Hạng Phổ Thông'}
            </p>
          </div>
        </Card.Header>

        <Card.Body className="bg-gradient-to-b from-blue-50 to-white p-8">
          {/* Cockpit */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-full flex items-center justify-center shadow-lg">
              <span className="text-xs font-semibold text-gray-600">✈️ Cabin</span>
            </div>
          </div>

          {/* Seat Map */}
          <div className="space-y-3">
            {seatLayout.map(({ row, seats: rowSeats }) => (
              <div key={row} className="flex items-center justify-center gap-6">
                {/* Row number */}
                <div className="w-8 text-center">
                  <span className="text-sm font-medium text-gray-500">{row}</span>
                </div>

                {/* Left side seats */}
                <div className={`flex gap-2 ${seatClass === 'business' ? 'gap-3' : 'gap-1'}`}>
                  {rowSeats.left.map((seat) => {
                    const status = getSeatStatus(seat)
                    return (
                      <button
                        key={seat.number}
                        className={getSeatClass(status, seatClass === 'business')}
                        disabled={status === 'occupied' || status === 'other-passenger'}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => seat && status === 'available' && setHoveredSeat(seat.number)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        title={
                          status === 'occupied' ? `Ghế ${seat.number} - Đã được đặt` :
                          status === 'other-passenger' ? `Ghế ${seat.number} - Đã được chọn bởi hành khách khác` :
                          `Ghế ${seat.number} - Có sẵn`
                        }
                      >
                        {seat.number}
                        {status === 'selected' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Aisle */}
                <div className="w-8 border-l-2 border-r-2 border-dashed border-gray-300 h-8 flex items-center justify-center">
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>

                {/* Right side seats */}
                <div className={`flex gap-2 ${seatClass === 'business' ? 'gap-3' : 'gap-1'}`}>
                  {rowSeats.right.map((seat) => {
                    const status = getSeatStatus(seat)
                    return (
                      <button
                        key={seat.number}
                        className={getSeatClass(status, seatClass === 'business')}
                        disabled={status === 'occupied' || status === 'other-passenger'}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => seat && status === 'available' && setHoveredSeat(seat.number)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        title={
                          status === 'occupied' ? `Ghế ${seat.number} - Đã được đặt` :
                          status === 'other-passenger' ? `Ghế ${seat.number} - Đã được chọn bởi hành khách khác` :
                          `Ghế ${seat.number} - Có sẵn`
                        }
                      >
                        {seat.number}
                        {status === 'selected' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Row number */}
                <div className="w-8 text-center">
                  <span className="text-sm font-medium text-gray-500">{row}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Ghế trống</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Đã chọn</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-400 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Đã đặt</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-300 border-2 border-orange-400 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Đã chọn bởi hành khách khác</span>
            </div>
          </div>

          {/* Selected seat info */}
          {selectedSeat && (
            <div className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
              <div className="text-center">
                <h4 className="text-lg font-bold mb-2">Ghế đã chọn</h4>
                <div className="text-3xl font-bold mb-1">{selectedSeat.number}</div>
                <p className="text-blue-100">
                  {seatClass === 'business' ? 'Hạng Thương Gia' : 'Hạng Phổ Thông'}
                </p>
                {selectedSeat.price > 0 && (
                  <p className="text-yellow-300 font-semibold mt-2">
                    Phí chọn ghế: {selectedSeat.price.toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default SeatSelector 