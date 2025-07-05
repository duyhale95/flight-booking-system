import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

const FlightCard = ({ flight, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={flight.airline.logo}
              alt={flight.airline.name}
              className="h-12 w-12 object-contain"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {flight.airline.name}
              </h3>
              <p className="text-sm text-gray-500">Chuyến bay {flight.flightNumber}</p>
            </div>
          </div>
          <Badge variant={flight.status === 'on-time' ? 'success' : 'warning'}>
            {flight.status === 'on-time' ? 'Đúng giờ' : 'Chậm trễ'}
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {formatTime(flight.departureTime)}
            </p>
            <p className="text-sm text-gray-500">{flight.departureCity}</p>
          </div>
          <div className="text-center">
            <div className="relative">
              <div className="h-0.5 w-full bg-gray-300">
                <div className="absolute top-1/2 left-0 w-2 h-2 -mt-1 bg-primary-500 rounded-full" />
                <div className="absolute top-1/2 right-0 w-2 h-2 -mt-1 bg-primary-500 rounded-full" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {flight.duration} phút
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {formatTime(flight.arrivalTime)}
            </p>
            <p className="text-sm text-gray-500">{flight.arrivalCity}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Thông tin chuyến bay</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-500">
                  <li>Máy bay: {flight.aircraft}</li>
                  <li>Loại vé: {flight.seatClass}</li>
                  <li>Hành lý: {flight.baggageAllowance}kg</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Giá vé</h4>
                <p className="mt-2 text-2xl font-semibold text-primary-600">
                  {formatPrice(flight.price)}
                </p>
                <p className="text-sm text-gray-500">Giá đã bao gồm thuế và phí</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
          </Button>
          <Button
            onClick={() => onSelect(flight)}
          >
            Chọn chuyến bay
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default FlightCard 