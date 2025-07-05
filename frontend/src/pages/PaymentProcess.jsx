import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import seatService from '../services/seatService'
import bookingService from '../services/bookingService'

export default function PaymentProcess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [animationStep, setAnimationStep] = useState(0) // 0: processing, 1: validating, 2: confirming, 3: success
  const [error, setError] = useState(null)

  // Use only real data from location.state
  const {
    bookingDetails,
    flight,
    passengers,
    selectedSeats,
    paymentMethod,
    departureAirport,
    arrivalAirport,
    totalAmount,
    needsSeatReservation
  } = location.state || {}

  // Redirect if no booking data
  if (!bookingDetails || !flight) {
    useEffect(() => {
      navigate('/flights')
    }, [navigate])
    return null
  }

  useEffect(() => {
    // Animation sequence for processing steps
    const processSteps = [
      { step: 0, duration: 2000, text: 'Đang xử lý thanh toán...' },
      { step: 1, duration: 1500, text: 'Đang xác thực giao dịch...' },
      { step: 2, duration: 1000, text: 'Đang xác nhận đặt vé...' },
      { step: 3, duration: 500, text: 'Hoàn thành!' }
    ]

    let currentStepIndex = 0

    const runNextStep = async () => {
      if (currentStepIndex < processSteps.length) {
        const currentStep = processSteps[currentStepIndex]
        setAnimationStep(currentStep.step)
        
        // When confirming booking (step 2), reserve seats if needed
        if (currentStep.step === 2 && needsSeatReservation === true && selectedSeats && selectedSeats.length > 0) {
          try {
            // Reserve seats for all passengers
            const seatReservationPromises = selectedSeats
              .filter(seat => seat && typeof seat.id === 'string') // Ensure seat has valid ID
              .map(seat => seatService.reserveSeat(seat.id));
            
            await Promise.all(seatReservationPromises);
            console.log(`Reserved ${seatReservationPromises.length} seats`);
          } catch (error) {
            console.error('Error reserving seats:', error)
            // Continue with the process despite the error - the booking process should have already reserved seats
          }
        }

        // Schedule the next step
        setTimeout(() => {
          currentStepIndex++
          runNextStep()
        }, currentStep.duration)
      } else {
        // All steps completed, navigate to confirmation page
        if (bookingDetails && bookingDetails.id) {
          navigate(`/payment-success`, {
            state: { 
              bookingId: bookingDetails.id,
              bookingNumber: bookingDetails.bookingNumber,
              flight,
              passengers,
              selectedSeats,
              paymentMethod,
              departureAirport,
              arrivalAirport,
              totalAmount,
              bookingDate: new Date().toISOString()
            }
          })
        } else {
          setError('Booking information is missing. Please try again.')
        }
      }
    }

    runNextStep()
  }, [bookingDetails, flight, navigate, passengers, paymentMethod, selectedSeats, totalAmount, needsSeatReservation, departureAirport, arrivalAirport])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div 
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-fadeIn"
      >
        {error ? (
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đã xảy ra lỗi
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/flights')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Quay lại tìm chuyến bay
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6 relative h-8">
              <div
                className="absolute inset-0 flex items-center justify-center animate-fadeIn"
              >
                <span className="text-lg text-gray-700 font-medium">
                  {animationStep === 0 && 'Đang xử lý thanh toán...'}
                  {animationStep === 1 && 'Đang xác thực giao dịch...'}
                  {animationStep === 2 && 'Đang xác nhận đặt vé...'}
                  {animationStep === 3 && 'Hoàn thành!'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            </div>
            
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${(animationStep + 1) * 25}%` }}
              />
            </div>
            
            {passengers && passengers.length > 1 && (
              <div className="mt-4 text-sm text-gray-600">
                Đang đặt vé cho {passengers.length} hành khách...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 