import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = "https://car-rental-iybv.onrender.com";
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY ?? "₹";

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);

  // 🔐 Fetch logged-in user
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/users/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.roles?.includes("owner"));
      } else {
        setUser(null);
        setIsOwner(false);
        navigate("/");
      }
    } catch (error) {
      setUser(null);
      setIsOwner(false);
    }
  };

  // 🚗 Fetch cars (for homepage / featured)
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/users/cars");
      if (data.success) {
        setCars(Array.isArray(data.cars) ? data.cars : []);
      }
    } catch (error) {
      toast.error("Failed to fetch cars");
    }
  };

  // 🔓 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out");
    navigate("/");
  };

  // 🔁 Read token from localStorage on first load
  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
    }
  }, []);

  // 🔥 MOST IMPORTANT FIX: Sync axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
      fetchCars();
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    returnDate,
    setPickupDate,
    setReturnDate,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
console.log("GLOBAL AXIOS BASE:", axios.defaults.baseURL);
export const useAppContext = () => useContext(AppContext);