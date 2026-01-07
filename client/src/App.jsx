import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from "./pages/Home"
import CarDetails from "./pages/CarDetails"
import Cars from "./pages/Cars"
import MyBookings from "./pages/MyBookings"
import Footer from "./components/Footer"
import Layout from './pages/owner/Layout'
import Dashboard from './pages/owner/Dashboard'
import Analysis from './pages/owner/Analysis'   // ✅ NEW
import AddCar from './pages/owner/AddCar'
import MangeCars from './pages/owner/ManageCars'
import ManageBookings from './pages/owner/ManageBookings'
import Login from './components/Login'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import Chatbot from "./components/Chatbot"

const App = () => {
  const { showLogin } = useAppContext()
  const isOwnerPath = useLocation().pathname.startsWith('/owner')

  return (
    <>
      <Toaster />

      {showLogin && <Login />}

      {!isOwnerPath && <Navbar />}

      <Routes>
        {/* USER ROUTES */}
        <Route path='/' element={<Home />} />
        <Route path='/car-details/:id' element={<CarDetails />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/my-bookings' element={<MyBookings />} />

        {/* OWNER ROUTES */}
        <Route path='/owner' element={<Layout />}>
          <Route index element={<Dashboard />} />           {/* /owner */}
          <Route path='dashboard' element={<Dashboard />} />{/* /owner/dashboard */}
          <Route path='analysis' element={<Analysis />} />  {/* ✅ /owner/analysis */}
          <Route path='add-car' element={<AddCar />} />
          <Route path='manage-cars' element={<MangeCars />} />
          <Route path='manage-bookings' element={<ManageBookings />} />
        </Route>
      </Routes>
       {!isOwnerPath && <Chatbot />}
      {!isOwnerPath && <Footer />}
    </>
  )
}

export default App
