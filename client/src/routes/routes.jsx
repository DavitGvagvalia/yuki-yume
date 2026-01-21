import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home.jsx'
import MenuPage from '../pages/Menu/MenuPage.jsx'
function routes() {
  return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
        </Routes>
  )
}

export default routes