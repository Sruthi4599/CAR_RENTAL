import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddCar = () => {
  const { axios, currency } = useAppContext();

  const [image, setImage] = useState(null);

  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: 0,
    pricePerDay: 0,
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: '',
    location: '',
    description: '',
  });

  // 🔹 LOCATION STATES (NEW)
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      // ✅ FINAL LOCATION LOGIC
      const finalLocation =
        location === 'Other'
          ? customLocation.trim()
          : location;

      if (!finalLocation) {
        toast.error('Please select or enter a location');
        setIsLoading(false);
        return;
      }

      // ✅ UPDATE CAR OBJECT WITH FINAL LOCATION
      const updatedCar = {
        ...car,
        location: finalLocation,
      };

      const formData = new FormData();
      formData.append('image', image);
      formData.append('carData', JSON.stringify(updatedCar));

      const { data } = await axios.post('/api/owner/add-car', formData);

      if (data.success) {
        toast.success(data.message);
        setImage(null);
        setCar({
          brand: '',
          model: '',
          year: 0,
          pricePerDay: 0,
          category: '',
          transmission: '',
          fuel_type: '',
          seating_capacity: '',
          location: '',
          description: '',
        });
        setLocation('');
        setCustomLocation('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-10 flex-1">
      <Title
        title="Add New Car"
        subTitle="Fill in details to list a new car for booking, including prices"
      />

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl"
      >
        {/* IMAGE UPLOAD */}
        <div className="flex items-center gap-2 w-full">
          <label htmlFor="car-image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              alt="car upload"
              className="h-14 rounded cursor-pointer"
            />
            <input
              type="file"
              id="car-image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </label>
          <p className="text-sm text-gray-500">
            Upload a picture of your car
          </p>
        </div>

        {/* BRAND & MODEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col w-full">
            <label>Brand</label>
            <input
              type="text"
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.brand}
              onChange={(e) =>
                setCar({ ...car, brand: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col w-full">
            <label>Model</label>
            <input
              type="text"
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.model}
              onChange={(e) =>
                setCar({ ...car, model: e.target.value })
              }
            />
          </div>
        </div>

        {/* YEAR / PRICE / CATEGORY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label>Year</label>
            <input
              type="number"
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.year}
              onChange={(e) =>
                setCar({ ...car, year: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <label>Daily Price ({currency})</label>
            <input
              type="number"
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.pricePerDay}
              onChange={(e) =>
                setCar({ ...car, pricePerDay: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col">
            <label>Category</label>
            <select
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.category}
              onChange={(e) =>
                setCar({ ...car, category: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
            </select>
          </div>
        </div>

        {/* TRANSMISSION / FUEL / SEATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label>Transmission</label>
            <select
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.transmission}
              onChange={(e) =>
                setCar({ ...car, transmission: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label>Fuel Type</label>
            <select
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.fuel_type}
              onChange={(e) =>
                setCar({ ...car, fuel_type: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label>Seating Capacity</label>
            <input
              type="number"
              required
              className="px-3 py-2 mt-1 border rounded-md"
              value={car.seating_capacity}
              onChange={(e) =>
                setCar({ ...car, seating_capacity: e.target.value })
              }
            />
          </div>
        </div>

        {/* LOCATION (HYBRID) */}
        <div className="flex flex-col">
          <label>Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-3 py-2 mt-1 border rounded-md"
            required
          >
            <option value="">Select location</option>
            <option value="New York">New York</option>
            <option value="Los Angeles">Los Angeles</option>
            <option value="Houston">Houston</option>
            <option value="Chicago">Chicago</option>
            
            <option value="Other">Other</option>
          </select>

          {location === 'Other' && (
            <input
              type="text"
              placeholder="Enter city / area"
              className="px-3 py-2 mt-2 border rounded-md"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              required
            />
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col">
          <label>Description</label>
          <textarea
            rows={4}
            required
            className="px-3 py-2 mt-1 border rounded-md"
            value={car.description}
            onChange={(e) =>
              setCar({ ...car, description: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 mt-4 bg-primary text-white rounded-md"
        >
          <img src={assets.tick_icon} alt="" />
          {isLoading ? 'Listing...' : 'List Your Car'}
        </button>
      </form>
    </div>
  );
};

export default AddCar;
