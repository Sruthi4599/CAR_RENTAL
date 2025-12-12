import React, { useState, useEffect } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageBookings = () => {
  const { currency, axios } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('No auth token found. Please login.')
        setBookings([])
        setLoading(false)
        return
      }

      // <-- FIX: use template literal for Authorization header
      const { data } = await axios.post(
        '/api/bookings/owner',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log('OWNER BOOKINGS RESPONSE:', data)

      if (data && data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings)
      } else {
        console.error('Unexpected bookings format:', data)
        toast.error(data.message || 'Failed to fetch bookings (unexpected format)')
        setBookings([])
      }
    } catch (error) {
      console.error('fetchOwnerBookings error:', error, error?.response?.data)
      toast.error(error?.response?.data?.message || error.message || 'Failed to fetch bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('No auth token found. Please login.')
        return
      }

      const { data } = await axios.post(
        '/api/bookings/change-status',
        { bookingId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data?.success) {
        toast.success(data.message || 'Status updated')
        // refresh local list
        fetchOwnerBookings()
      } else {
        toast.error(data?.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('changeBookingStatus error:', error, error?.response?.data)
      toast.error(error?.response?.data?.message || error.message || 'Failed to update status')
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatDate = (isoString) => {
    if (!isoString) return '—'
    try {
      // handle both Date strings and possible ISO variants
      const d = new Date(isoString)
      if (isNaN(d)) return isoString.split?.('T')?.[0] ?? isoString
      return d.toISOString().split('T')[0]
    } catch {
      return isoString.split?.('T')?.[0] ?? isoString
    }
  }

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <Title
        title='Manage Bookings'
        subTitle='Track all customer bookings, approve or cancel requests, and manage booking statuses.'
      />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Date Range</th>
              <th className='p-3 font-medium'>Total</th>
              <th className='p-3 font-medium max-md:hidden'>Payment</th>
              <th className='p-3 font-medium'>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className='p-6 text-center text-gray-500'>
                  Loading...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className='p-6 text-center text-gray-500'>
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const car = booking?.car ?? {}
                const imgSrc = car.image || '/placeholder-car.png' // provide a local fallback if you have one
                return (
                  <tr key={booking._id} className='border-t border-borderColor text-gray-500'>
                    <td className='p-3 flex items-center gap-3'>
                      <img
                        src={imgSrc}
                        alt={car.model || 'car'}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-car.png'
                        }}
                        className='h-12 w-12 aspect-square rounded-md object-cover'
                      />
                      <p className='font-medium max-md:hidden'>
                        {car.brand ?? 'Unknown'} {car.model ?? ''}
                      </p>
                    </td>

                    <td className='p-3 max-md:hidden'>
                      {formatDate(booking.pickupDate)} to {formatDate(booking.returnDate)}
                    </td>

                    <td className='p-3'>
                      {currency}
                      {booking.price ?? '0'}
                    </td>

                    <td className='p-3 max-md:hidden'>
                      <span className='bg-gray-100 px-3 py-1 rounded-full text-xs'>Offline</span>
                    </td>

                    <td className='p-3'>
                      {booking.status === 'pending' ? (
                        <select
                          onChange={(e) => changeBookingStatus(booking._id, e.target.value)}
                          value={booking.status}
                          className='px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none'
                        >
                          <option value='pending'>Pending</option>
                          <option value='cancelled'>Cancelled</option>
                          <option value='confirmed'>Confirmed</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-500'
                              : 'bg-red-100 text-red-500'
                          }`}
                        >
                          {booking.status}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageBookings