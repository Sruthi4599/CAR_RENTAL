import React, { useState, useEffect } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'

const Hero = () => {

  const [pickupLocation, setPickupLocation] = useState('')
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } = useAppContext()

  const today = new Date().toISOString().split('T')[0]

  // 🔥 If pickup date changes and return date is before pickup → reset return date
  useEffect(() => {
    if (pickupDate && returnDate && returnDate <= pickupDate) {
      setReturnDate('')
    }
  }, [pickupDate])

  const handleSearch = (e) => {
    e.preventDefault()

    if (!pickupDate || !returnDate) {
      toast.error("Please select both dates")
      return
    }

    if (returnDate <= pickupDate) {
      toast.error("Return date must be after pickup date")
      return
    }

    navigate(
      `/cars?pickupLocation=${pickupLocation}&pickupDate=${pickupDate}&returnDate=${returnDate}`
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='h-screen flex flex-col items-center justify-center gap-14 bg-light text-center'
    >

      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className='text-4xl md:text-5xl font-semibold'
      >
        Cars on Rent
      </motion.h1>

      <motion.form
        onSubmit={handleSearch}
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]'
      >

        <div className='flex flex-col md:flex-row items-start md:items-center gap-10 min-md:ml-8'>

          {/* Location */}
          <div className='flex flex-col items-start gap-2'>
            <select
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            >
              <option value="">Pickup Location</option>
              {cityList.map((city) =>
                <option key={city} value={city}>{city}</option>
              )}
            </select>
            <p className='px-1 text-sm text-gray-500'>
              {pickupLocation ? pickupLocation : 'Please select location'}
            </p>
          </div>
             {/* Pickup Date */}
<div className='flex flex-col items-start gap-2'>
  <label>Pick-up Date</label>
  <input
    type="date"
    required
    value={pickupDate}
    onChange={(e) => {
      const selectedDate = e.target.value
      setPickupDate(selectedDate)

      // If return date exists and is before pickup → reset it
      if (returnDate && returnDate < selectedDate) {
        setReturnDate(selectedDate)
      }
    }}
    min={new Date().toISOString().split('T')[0]}
    className='text-sm text-gray-500'
  />
</div>

{/* Return Date */}
<div className='flex flex-col items-start gap-2'>
  <label>Return Date</label>
  <input
    type="date"
    required
    disabled={!pickupDate}
    value={returnDate}
    onChange={(e) => {
      const selectedReturn = e.target.value

      // Block only if strictly before pickup
      if (selectedReturn <= pickupDate) return

      setReturnDate(selectedReturn)
    }}
    min={pickupDate || ''}
    className='text-sm text-gray-500'
  />
</div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-primary text-white rounded-full'
        >
          <img src={assets.search_icon} alt="search" className='brightness-300' />
          Search
        </motion.button>

      </motion.form>

      <motion.img
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        src={assets.main_car}
        alt="car"
        className='max-h-74'
      />

    </motion.div>
  )
}

export default Hero