import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import LoginPage from '../pages/LoginPage'
import OrdenesPage from '../pages/OrdenesPage'
import OrdenDetailPage from '../pages/OrdenDetailPage'
import OrdenFormPage from '../pages/OrdenFormPage'
import ResumenPage from '../pages/ResumenPage'
import NotFoundPage from '../pages/NotFoundPage'

function ProtectedRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function AdminRoute() {
  const { user } = useAuth()
  if (!['admin', 'mantenimiento'].includes(user?.rol)) return <Navigate to="/ordenes" replace />
  return <Outlet />
}

export default function AppRouter() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/ordenes" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={user ? '/ordenes' : '/login'} replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/ordenes/nueva" element={<OrdenFormPage />} />
          <Route path="/ordenes/:id" element={<OrdenDetailPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/resumen" element={<ResumenPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
