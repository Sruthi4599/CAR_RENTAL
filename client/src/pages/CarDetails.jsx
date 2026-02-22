import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import FakePayment from '../components/FakePayment'

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
  const navigate = useNavigate()

  const {
    axios,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    user
  } = useAppContext()

  const [car, setCar] = useState(null)
  const [disabledDates, setDisabledDates] = useState([])
  const [showPickup, setShowPickup] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  // 🔹 NEW USER DETAILS STATE
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [bookingLocation, setBookingLocation] = useState('');
  const [license, setLicense] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
const isAgeInvalid = age !== '' && Number(age) < 18;
  // ✅ NEW STATE for dynamic price
  const [estimatedTotal, setEstimatedTotal] = useState(null)
const [showPayment, setShowPayment] = useState(false);
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
    const fetchDisabledDates = async () => {
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
        console.log('Failed to load unavailable dates')
      }
    }
    fetchDisabledDates()
  }, [id])

  /* -------- ✅ DYNAMIC PRICE CALCULATION (FIXED) -------- */
  useEffect(() => {
    const fetchPrice = async () => {
      if (!pickupDate || !returnDate || !car) {
        setEstimatedTotal(null);
        return;
      }

      try {
        const { data } = await axios.post("/api/bookings/preview-price", {
          carId: car._id,
          pickupDate,
          returnDate
        });

        if (data.success) {
          setEstimatedTotal(data.pricing.totalPrice);
        }
      } catch (err) {
        console.error("Price fetch failed");
      }
    };

    fetchPrice();
  }, [pickupDate, returnDate, car]);

  const handlePaymentClick = () => {
  if (!fullName || !age || !gender || !bookingLocation) {
    toast.error("Please fill all details");
    return false;
  }
  if (!license) {
    toast.error("Upload driving license");
    return false;
  }
  if (!isConfirmed) {
    toast.error("Please confirm declaration");
    return false;
  }
  if (Number(age) < 18) {
    toast.error("You must be at least 18 years old to book a car.");
    return false;
  }

  if (!pickupDate || !returnDate) {
    toast.error("Please select pickup and return dates");
    return false;
  }

  return true;
};
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
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location }
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className='flex flex-col items-center bg-light p-4 rounded-lg'
                >
                  <img src={icon} className='h-5 mb-2' />
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

        {/* RIGHT – BOOKING FORM */}
        <form className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6'>
          <p className='text-2xl font-semibold'>
            {currency}{car.pricePerDay}
            <span className='text-sm text-gray-400'> / day</span>
          </p>

          <hr />
          {/* USER DETAILS */}
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="border px-3 py-2 rounded-lg w-full"
              required
            />
          </div>

          <div>
  <label>Age</label>
  <input
    type="number"
    value={age}
    onChange={(e) => setAge(e.target.value)}
    placeholder="Enter age"
    className={`border px-3 py-2 rounded-lg w-full ${
      isAgeInvalid ? "border-red-500" : ""
    }`}
    required
  />

  {isAgeInvalid && (
    <p className="text-red-500 text-sm mt-1">
      Age must be 18 or above to book a car.
    </p>
  )}
</div>

          <div>
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label>Booking Location (City / Area)</label>
            <input
              type="text"
              value={bookingLocation}
              onChange={(e) => setBookingLocation(e.target.value)}
              placeholder="Enter your city or area"
              className="border px-3 py-2 rounded-lg w-full"
              required
            />
          </div>

          {/* PICKUP DATE */}
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

          {/* RETURN DATE */}
          <div className='relative'>
            <label>Return Date</label>
            <input
              readOnly
              value={returnDate}
              onClick={() => {
                if (!pickupDate)
                  return toast.error('Select pickup date first')
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
            
            {/* ✅ LICENSE UPLOAD */}
<div>
  <label>Upload Driving License</label>

  <label className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary">

    <p className="text-gray-500 text-sm">
      {license
        ? license.name
        : "Upload License (PDF/Image)"}
    </p>

    <input
      type="file"
      accept=".pdf,image/*"
      className="hidden"
      onChange={(e)=>setLicense(e.target.files[0])}
    />
  </label>
</div>
{/* USER DECLARATION */}
<div className="flex items-start gap-2 text-sm">

  <input
    type="checkbox"
    checked={isConfirmed}
    onChange={(e) => setIsConfirmed(e.target.checked)}
    className="mt-1 cursor-pointer"
  />

  <p className="text-gray-600">
    I confirm that the above provided details are correct and belong to me.
  </p>

</div>

<p className="text-xs text-red-500">
   Note: Please carry your original Driving License while collecting
  the car from the owner for verification.
</p>
          {/* PRICE */}
          {estimatedTotal && (
            <div className='text-sm'>
              Estimated total:{' '}
              <span className='font-semibold'>
                {currency}{estimatedTotal}
              </span>
            </div>
          )}

          {/* PAYMENT */}
          {/* PAYMENT BUTTON */}
{estimatedTotal && !showPayment && (
  <button
    type="button"
    disabled={isAgeInvalid}
    onClick={() => {
      const valid = handlePaymentClick();
      if (!valid) return;

      setShowPayment(true);
    }}
    className={`w-full py-2 rounded-lg text-white ${
      isAgeInvalid
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-primary"
    }`}
  >
    Proceed to Payment
  </button>
)}
{/* SHOW PAYMENT COMPONENT AFTER VALIDATION */}
{estimatedTotal && showPayment && (
  <FakePayment
    amount={estimatedTotal}
    userId={user?._id}
    carId={car._id}
    onSuccess={async (paymentData) => {
      if (Number(age) < 18) {
    toast.error("You must be at least 18 years old to book a car.");
    setShowPayment(false);
    return;
  }
      try {
        const formData = new FormData();

formData.append("carId", car._id);
formData.append("pickupDate", pickupDate);
formData.append("returnDate", returnDate);

formData.append(
  "customerDetails",
  JSON.stringify({
    fullName,
    age,
    gender,
    location: bookingLocation
  })
);

formData.append("license", license);

const { data } = await axios.post(
  "/api/bookings/create",
  formData
);

        if (data.success) {
          toast.success('Payment successful & booking confirmed');
          navigate('/my-bookings');
        } else {
          toast.error(data.message || 'Booking failed');
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Booking failed'
        );
      }
    }}
  />
)}
        </form>
      </div>
    </div>
  ) : (
    <Loader />
  )
}

export default CarDetails
