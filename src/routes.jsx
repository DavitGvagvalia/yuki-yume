import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import MenuPage from './pages/Menu/MenuPage.jsx'
import AdminPage from './pages/admin_dashboard/admin_dashboard.jsx'
import AdminLogin from './pages/admin_dashboard/AdminLogin.jsx'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute.jsx'
function routes() {
  return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
                path="/admin"
                element={(
                    <ProtectedAdminRoute>
                        <AdminPage />
                    </ProtectedAdminRoute>
                )}
            />
        </Routes>
  )
}

export default routes
