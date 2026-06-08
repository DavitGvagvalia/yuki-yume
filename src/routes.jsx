import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import MenuPage from './pages/Menu/MenuPage.jsx'
import AdminPage from './pages/admin_dashboard/admin_dashboard.jsx'
function routes() {
  return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/admin" element={<AdminPage />} />
        </Routes>
  )
}

export default routes