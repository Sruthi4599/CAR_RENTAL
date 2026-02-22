import React, { useState ,  useEffect} from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Navbar = () => {
  const {
  setShowLogin,
  logout,
  isOwner,
  axios,
  setIsOwner,
  token,
  user
} = useAppContext()

  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
  const closeProfile = () => setShowProfile(false)

  window.addEventListener("click", closeProfile)

  return () =>
    window.removeEventListener("click", closeProfile)
}, [])
  const changeRole = async () => {
    try {
      if (!token) {
        toast.error("You must be logged in to list cars")
        return
      }

      const { data } = await axios.post(
        '/api/owner/change-role',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        setIsOwner(true)
        toast.success(data.message)
        navigate('/owner')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24
      xl-px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all
      ${location.pathname === "/" && "bg-light"}`}
    >
      <Link to='/'>
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={assets.logo}
          alt="logo"
          className='h-8'
        />
      </Link>

      <div
        className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16
        max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row
        items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all 
        duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} 
        ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}
      >
        {menuLinks.map((link, index) => (
          <Link key={index} to={link.path}>
            {link.name}
          </Link>
        ))}

        

        <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
          <button
            onClick={() => isOwner ? navigate('/owner') : changeRole()}
            className='cursor-pointer'
          >
            {isOwner ? 'Dashboard' : 'Listcars'}
          </button>

          {/* 🔥 FIXED LOGIN / LOGOUT LOGIC */}
          {token ? (
  <div className="relative">

    {/* PROFILE IMAGE */}
    <img
      src={user?.image || assets.default_profile}
      alt="profile"
      onClick={(e) => {
        e.stopPropagation()
        setShowProfile(!showProfile)
      }}
      className="w-10 h-10 rounded-full object-cover cursor-pointer"
    />

    {/* DROPDOWN */}
    {showProfile && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 mt-3 w-56 bg-white shadow-lg
        rounded-lg p-4 text-sm z-50"
      >
        <p className="font-semibold">{user?.name}</p>
        <p className="text-gray-500 text-xs">
          {user?.email}
        </p>

        <hr className="my-2" />
        <button
  onClick={() => navigate('/profile')}
  className="block w-full text-left hover:text-primary"
>
  Profile
</button>
      
        <button
          onClick={() => navigate('/my-bookings')}
          className="block w-full text-left hover:text-primary"
        >
          My Bookings
        </button>

        <button
          onClick={() => isOwner
            ? navigate('/owner')
            : changeRole()
          }
          className="block w-full text-left mt-2 hover:text-primary"
        >
          {isOwner ? "Owner Dashboard" : "Become Owner"}
        </button>

        <button
          onClick={logout}
          className="block w-full text-left text-red-500 mt-2"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <button
    onClick={() => setShowLogin(true)}
    className="cursor-pointer px-8 py-2 bg-primary
    hover:bg-primary-dull text-white rounded-lg"
  >
    Login
  </button>
)}
        </div>
      </div>

      <button
        className='sm:hidden cursor-pointer'
        aria-label='Menu'
        onClick={() => setOpen(!open)}
      >
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
      
    </motion.div>
  )
}

export default Navbar