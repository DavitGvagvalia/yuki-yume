import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import MenuPage from './pages/Menu/MenuPage.jsx'
import CheckoutPage from './pages/Checkout/CheckoutPage.js'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
function routes() {
  return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
  )
}

export default routes