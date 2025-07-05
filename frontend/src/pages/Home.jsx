import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSearch from '../components/home/HeroSearch'
import PopularDestinations from '../components/home/PopularDestinations'



export default function Home() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState('one-way')
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [seatClass, setSeatClass] = useState('economy')
  const [showFromCities, setShowFromCities] = useState(false)
  const [showToCities, setShowToCities] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/search', {
      state: {
        tripType,
        fromCity,
        toCity,
        departDate,
        returnDate,
        seatClass
      }
    })
  }

  return (
    <main>
      <HeroSearch />
      <PopularDestinations />
    </main>
  )
} 