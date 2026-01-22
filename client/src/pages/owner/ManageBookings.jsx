import React, { useState, useEffect } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageBookings = () => {
  const { currency, axios } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  /* ================= FETCH OWNER BOOKINGS ================= */
  const fetchOwnerBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (!token) {
        toast.error('No auth token found. Please login.')
        setBookings([])
        return
      }

      const { data } = await axios.post(
        '/api/bookings/owner',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data?.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings)
      } else {
        toast.error(data?.message || 'Failed to fetch bookings')
        setBookings([])
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ================= OWNER CANCEL (WITH REFUND) ================= */
  const cancelBookingAsOwner = async (bookingId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('No auth token found. Please login.')
        return
      }

      const confirmCancel = window.confirm(
        'Are you sure you want to cancel this booking?\nThis will refund the full amount to the user.'
      )
      if (!confirmCancel) return

      const { data } = await axios.post(
        `/api/bookings/cancel/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data?.success) {
        toast.success('Booking cancelled. Full refund processed.')
        fetchOwnerBookings()
      } else {
        toast.error(data?.message || 'Failed to cancel booking')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  /* ================= CHANGE STATUS (NON-CANCEL ONLY) ================= */
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
        fetchOwnerBookings()
      } else {
        toast.error(data?.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toISOString().split('T')[0]
  }

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <Title
        title='Manage Bookings'
        subTitle='Track all customer bookings, approve or cancel requests, and manage booking statuses.'
      />

      <div className='max-w-4xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Customer</th>
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
                <td colSpan={6} className='p-6 text-center'>
                  Loading...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className='p-6 text-center'>
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const car = booking.car || {}

                return (
                  <tr key={booking._id} className='border-t border-borderColor'>
                    {/* CUSTOMER NAME */}
                    <td className='p-3 font-medium'>
                      {booking.customerDetails?.fullName || '—'}

                    </td>

                    {/* CAR DETAILS */}
                    <td className='p-3 flex items-center gap-3'>
                      <img
                        src={car.image || '/placeholder-car.png'}
                        alt='car'
                        className='h-12 w-12 rounded-md object-cover'
                      />
                      <p className='font-medium max-md:hidden'>
                        {car.brand} {car.model}
                      </p>
                    </td>

                    {/* DATE RANGE */}
                    <td className='p-3 max-md:hidden'>
                      {formatDate(booking.pickupDate)} to{' '}
                      {formatDate(booking.returnDate)}
                    </td>

                    {/* TOTAL PRICE */}
                    <td className='p-3'>
                      {currency}
                      {booking.price}
                    </td>

                    {/* PAYMENT STATUS */}
                    <td className='p-3 max-md:hidden'>
                      <span className='bg-gray-100 px-3 py-1 rounded-full text-xs'>
                        {booking.paymentStatus}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className='p-3'>
                      {booking.status === 'pending' ? (
                        <select
                          value={booking.status}
                          onChange={(e) => {
                            const newStatus = e.target.value
                            if (newStatus === 'cancelled') {
                              cancelBookingAsOwner(booking._id)
                            } else {
                              changeBookingStatus(booking._id, newStatus)
                            }
                          }}
                          className='px-2 py-1.5 text-gray-500 border rounded-md'
                        >
                          <option value='pending'>Pending</option>
                          <option value='confirmed'>Confirmed</option>
                          <option value='cancelled'>Cancelled</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
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
