import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const CarDetails = () => {
  const { id } = useParams()
  const {
    cars,
    axios,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate
  } = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const currency = import.meta.env.VITE_CURRENCY

  // -------- HANDLE BOOKING ----------
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const { data } = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate,
        returnDate
      })

      if (data.success) {
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Load car details
  useEffect(() => {
    const selectedCar = cars.find((c) => c._id === id)
    setCar(selectedCar || null)
  }, [cars, id])

  // -------- CALCULATE ESTIMATED PRICE ----------
  const calculateEstimatedTotal = () => {
    if (!pickupDate || !returnDate || !car) return null

    const start = new Date(pickupDate)
    const end = new Date(returnDate)

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    if (days <= 0) return null

    return days * car.pricePerDay
  }

  const estimatedTotal = calculateEstimatedTotal()

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'
      >
        <img src={assets.arrow_icon} alt='' className='rotate-180 opacity-65' />
        Back to all Cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* LEFT SECTION */}
        <div className='lg:col-span-2'>
          <img
            src={car.image}
            alt=''
            className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md'
          />

          <div className='space-y-6'>
            <div>
              <h1 className='text-3xl font-bold'>
                {car.brand} {car.model}
              </h1>
              <p className='text-gray-500 text-lg'>
                {car.category} • {car.year}
              </p>
            </div>

            <hr className='border-borderColor my-6' />

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icons: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icons: assets.fuel_icon, text: car.fuel_type },
                { icons: assets.car_icon, text: car.transmission },
                { icons: assets.location_icon, text: car.location }
              ].map(({ icons, text }) => (
                <div
                  key={text}
                  className='flex flex-col items-center bg-light p-4 rounded-lg'
                >
                  <img src={icons} alt='' className='h-5 mb-2' />
                  {text}
                </div>
              ))}
            </div>

            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {[
                  '360 Camera',
                  'Bluetooth',
                  'GPS',
                  'Heated Seats',
                  'Rear View Mirror'
                ].map((item) => (
                  <li key={item} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} className='h-4 mr-2' alt='' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* BOOKING FORM */}
        <form
          onSubmit={handleSubmit}
          className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'
        >
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
            {currency}
            {car.pricePerDay}
            <span className='text-base text-gray-400 font-normal'>
              {' '}
              per day
            </span>
          </p>

          {/* Dynamic pricing note */}
          <p className='text-xs text-gray-500'>
            *Final price may vary based on demand, weekend & duration
          </p>

          <hr className='border-borderColor my-6' />

          {/* PICKUP DATE */}
          <div className='flex flex-col gap-2'>
            <label htmlFor='pickup-date'>Pick Date</label>
            <input
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              type='date'
              id='pickup-date'
              required
              min={new Date().toISOString().split('T')[0]}
              className='border border-borderColor px-3 py-2 rounded-lg'
            />
          </div>

          {/* RETURN DATE */}
          <div className='flex flex-col gap-2'>
            <label htmlFor='return-date'>Return Date</label>
            <input
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              type='date'
              id='return-date'
              required
              className='border border-borderColor px-3 py-2 rounded-lg'
            />
          </div>

          {/* Estimated total */}
          {estimatedTotal && (
            <div className='text-sm text-gray-700'>
              Estimated total:{' '}
              <span className='font-semibold'>
                {currency}
                {estimatedTotal}
              </span>
            </div>
          )}

          <button
            type='submit'
            className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'
          >
            Book Now
          </button>

          <p className='text-center text-sm'>
            No credit card required to reserve
          </p>
        </form>
      </div>
    </div>
  ) : (
    <Loader />
  )
}

export default CarDetails
