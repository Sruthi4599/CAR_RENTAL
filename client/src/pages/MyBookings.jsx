import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import ExtendBookingModal from '../components/ExtendBookingModal'

const MyBookings = () => {
  const { axios, user, currency } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [downloadingId, setDownloadingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [modalBooking, setModalBooking] = useState(null)

  // Fetch bookings
  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.post('/api/bookings/user', {})
      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message || 'Failed to load bookings')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (user) fetchMyBookings()
  }, [user])

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    try {
      const confirmCancel = window.confirm('Are you sure you want to cancel this booking?')
      if (!confirmCancel) return

      setCancellingId(bookingId)
      const { data } = await axios.post(`/api/bookings/cancel/${bookingId}`)

      if (data.success) {
        toast.success(data.message)
        fetchMyBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed')
    } finally {
      setCancellingId(null)
    }
  }

  // Download receipt
  const downloadReceipt = async (bookingId, bookingIndex) => {
    try {
      setDownloadingId(bookingId)
      const res = await axios.get(`/api/bookings/${bookingId}/receipt`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `booking_${bookingIndex + 1}_receipt.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Receipt downloaded')
    } catch {
      toast.error('Failed to download receipt')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>
      <Title title='My Bookings' subTitle='View and manage your all car bookings' align='left' />

      <div>
        {bookings.map((booking, index) => (
          <div
            key={booking._id}
            className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'
          >
            {/* Car info */}
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img src={booking.car.image} alt='' className='w-full h-auto aspect-video object-cover' />
              </div>
              <p className='text-lg font-medium mt-2'>{booking.car.brand} {booking.car.model}</p>
              <p className='text-gray-500'>{booking.car.year} • {booking.car.category} • {booking.car.location}</p>
            </div>

            {/* Booking details */}
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p>
                <p className={`px-3 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-400/15 text-green-600' : 'bg-red-400/15 text-red-600'}`}>
                  {booking.status}
                </p>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.calendar_icon_colored} alt='' className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Rental period</p>
                  <p>{booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon_colored} alt='' className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Pick-up Location</p>
                  <p>{booking.car.location}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className='mt-6 flex flex-wrap gap-3 items-center'>
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => downloadReceipt(booking._id, index)}
                    disabled={downloadingId === booking._id}
                    className='px-4 py-2 bg-primary text-white rounded-md'
                  >
                    {downloadingId === booking._id ? 'Downloading...' : 'Download Receipt'}
                  </button>
                )}

                {booking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                      className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
                    >
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>

                    <button
                      onClick={() => setModalBooking(booking)}
                      className='px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500'
                    >
                      Extend Booking
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className='md:col-span-1 flex flex-col justify-between gap-6'>
              <div className='text-sm text-gray-500 text-right'>
                <p>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                <p>Booked on {booking.createdAt.split('T')[0]}</p>
              </div>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <p className='mt-8 text-center text-gray-500'>You have no bookings yet.</p>
        )}
      </div>

      {/* Extend Booking Modal */}
      {modalBooking && (
        <ExtendBookingModal
          booking={modalBooking}
          onClose={() => setModalBooking(null)}
          onExtended={(newDate) => {
            setBookings((prev) =>
              prev.map((b) =>
                b._id === modalBooking._id ? { ...b, returnDate: newDate } : b
              )
            )
            setModalBooking(null)
          }}
        />
      )}
    </div>
  )
}

export default MyBookings
