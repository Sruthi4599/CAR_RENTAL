import React, { useEffect, useState } from 'react'
import CarCard from '../components/CarCard'
import { useAppContext } from '../context/AppContext'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const Cars = () => {

  const { axios } = useAppContext()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')

  const fetchCars = async () => {
    try {
      setLoading(true)

      const { data } = await axios.get(
        `/api/users/cars?location=${pickupLocation || ''}`
      )

      if (data.success) {
        setCars(data.cars)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
  }, [pickupLocation])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-16'>

      <h1 className='text-3xl font-semibold text-center mb-12'>
        {pickupLocation
          ? `Available Cars in ${pickupLocation}`
          : 'Available Cars'}
      </h1>

      {loading ? (
        <p className='text-center text-gray-500'>Loading cars...</p>
      ) : cars.length === 0 ? (
        <p className='text-center text-gray-500'>
          No cars available for this location
        </p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      )}

    </div>
  )
}

export default Cars