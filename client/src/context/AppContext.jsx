import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

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

  // FUNCTION TO CHECK IF USER LOGGED IN
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/users/data");
      if (data?.success) {
        setUser(data.user);
        setIsOwner(data.user?.role === "owner");
      } else {
        // if user not authorized/invalid token, navigate to home/login
        setUser(null);
        setIsOwner(false);
        navigate("/");
      }
    } catch (error) {
      console.error("fetchUser error:", error, error?.response?.data);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch user data"
      );
    }
  };

  // Function to fetch all cars from the server
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/users/cars");
      if (data?.success) {
        setCars(Array.isArray(data.cars) ? data.cars : []);
      } else {
        toast.error(data?.message || "Failed to fetch cars");
      }
    } catch (error) {
      console.error("fetchCars error:", error, error?.response?.data);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to fetch cars"
      );
    }
  };

  // function to log out
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    // remove default header cleanly
    delete axios.defaults.headers.common["Authorization"];
    toast.success("You have logged out");
    navigate("/"); // optional: send user to homepage or login
  };

  // useEffect to retrieve the token on mount
  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
      // FIX: use template literal (backticks) so token is interpolated
      axios.defaults.headers.common["Authorization"] = `Bearer ${tokenFromStorage}`;

      // Now we can safely fetch user & cars
      fetchUser();
      fetchCars();
    } else {
      // ensure header is not set if there's no token
      delete axios.defaults.headers.common["Authorization"];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
