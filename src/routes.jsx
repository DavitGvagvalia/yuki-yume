import { Routes, Route } from 'react-router-dom'
import MenuPage from './pages/Menu/MenuPage.jsx'
import AdminPage from './pages/admin_dashboard/admin_dashboard.jsx'
import AdminMenuPage from './pages/admin_dashboard/AdminMenuPage.jsx'
import AdminLogin from './pages/admin_dashboard/AdminLogin.jsx'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute.jsx'
import OrderSuccess from './pages/Order/OrderSuccess.jsx'
function routes() {
  return (
        <Routes>
            <Route path="/*" element={<MenuPage />} />
            <Route path="/order/success" element={<OrderSuccess />} />


            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
                path="/admin"
                element={(
                    <ProtectedAdminRoute>
                        <AdminPage />
                    </ProtectedAdminRoute>
                )}
            />
            <Route
                path="/admin/menu"
                element={(
                    <ProtectedAdminRoute>
                        <AdminMenuPage />
                    </ProtectedAdminRoute>
                )}
            />
            
        </Routes>
  )
}

export default routes
