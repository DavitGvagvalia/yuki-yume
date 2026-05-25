import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import MenuPage from './pages/Menu/MenuPage.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
function routes() {
  return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
  )
}

export default routes