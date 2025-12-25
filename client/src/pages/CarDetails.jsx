import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

/* -------- timezone safe helpers -------- */
const toYMD = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const fromYMD = (str) => {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const CarDetails = () => {
  const { id } = useParams()
  const {
    axios,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate
  } = useAppContext()

  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [disabledDates, setDisabledDates] = useState([])
  const [showPickup, setShowPickup] = useState(false)
  const [showReturn, setShowReturn] = useState(false)

  const currency = import.meta.env.VITE_CURRENCY

  /* -------- LOAD CAR -------- */
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data } = await axios.get(`/api/users/cars/${id}`)
        if (data.success) setCar(data.car)
        else toast.error('Car not found')
      } catch {
        toast.error('Car not found')
      }
    }
    fetchCar()
  }, [id])

  /* -------- LOAD DISABLED DATES -------- */
  useEffect(() => {
    const fetchDisabled = async () => {
      try {
        const { data } = await axios.get(
          `/api/bookings/unavailable-dates/${id}`
        )
        if (data.success) {
          const dates = data.disabledDates.map((d) => {
            const dt = new Date(d)
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
          })
          setDisabledDates(dates)
        }
      } catch {
        console.log('Failed to load booked dates')
      }
    }
    fetchDisabled()
  }, [id])

  /* -------- BOOKING -------- */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!pickupDate || !returnDate) {
      toast.error('Select pickup and return dates')
      return
    }

    try {
      const { data } = await axios.post('/api/bookings/create', {
        carId: id,
        pickupDate,
        returnDate
      })

      if (data.success) {
        toast.success('Booking successful')
        navigate('/my-bookings')
      } else {
        toast.error(data.message || 'Booking failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  /* -------- PRICE -------- */
  const calculateEstimatedTotal = () => {
    if (!pickupDate || !returnDate || !car) return null
    const start = fromYMD(pickupDate)
    const end = fromYMD(returnDate)
    const days = Math.ceil((end - start) / 86400000)
    if (days <= 0) return null
    return days * car.pricePerDay
  }

  const estimatedTotal = calculateEstimatedTotal()

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500'
      >
        <img src={assets.arrow_icon} className='rotate-180 opacity-65' />
        Back to all Cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* LEFT */}
        <div className='lg:col-span-2'>
          <img
            src={car.image}
            className='w-full rounded-xl mb-6 shadow-md'
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
                  <img src={icons} className='h-5 mb-2' />
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
                    <img src={assets.check_icon} className='h-4 mr-2' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* BOOKING FORM */}
        <form className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6'>
          <p className='text-2xl font-semibold'>
            {currency}{car.pricePerDay}
            <span className='text-sm text-gray-400'> / day</span>
          </p>

          <hr />

          {/* PICKUP */}
          <div className='relative'>
            <label>Pick Date</label>
            <input
              readOnly
              value={pickupDate}
              onClick={() => {
                setShowPickup(!showPickup)
                setShowReturn(false)
              }}
              className='border px-3 py-2 rounded-lg w-full cursor-pointer'
            />
            {showPickup && (
              <div className='absolute z-30 bg-white border rounded-lg mt-1'>
                <DayPicker
                  mode='single'
                  disabled={[{ before: new Date() }, ...disabledDates]}
                  onSelect={(date) => {
                    if (!date) return
                    setPickupDate(toYMD(date))
                    setReturnDate('')
                    setShowPickup(false)
                  }}
                />
              </div>
            )}
          </div>

          {/* RETURN */}
          <div className='relative'>
            <label>Return Date</label>
            <input
              readOnly
              value={returnDate}
              onClick={() => {
                if (!pickupDate) return toast.error('Select pickup date first')
                setShowReturn(!showReturn)
                setShowPickup(false)
              }}
              className='border px-3 py-2 rounded-lg w-full cursor-pointer'
            />
            {showReturn && (
              <div className='absolute z-30 bg-white border rounded-lg mt-1'>
                <DayPicker
                  mode='single'
                  disabled={[
                    { before: fromYMD(pickupDate) },
                    ...disabledDates
                  ]}
                  onSelect={(date) => {
                    if (!date) return
                    setReturnDate(toYMD(date))
                    setShowReturn(false)
                  }}
                />
              </div>
            )}
          </div>

          {estimatedTotal && (
            <div className='text-sm'>
              Estimated total:{' '}
              <span className='font-semibold'>
                {currency}{estimatedTotal}
              </span>
            </div>
          )}

          <button
            type='button'
            onClick={handleSubmit}
            className='w-full bg-primary py-3 text-white rounded-xl'
          >
            Book Now
          </button>
        </form>
      </div>
    </div>
  ) : (
    <Loader />
  )
}

export default CarDetails
