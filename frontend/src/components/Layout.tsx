import * as React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/ordenes', label: 'Listado de Órdenes', end: true },
    { path: '/ordenes/nueva', label: 'Nueva Orden', end: false },
    ...(['admin', 'mantenimiento'].includes(user?.rol)
      ? [{ path: '/resumen', label: 'Resumen Administrativo', end: false }]
      : []),
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6', color: '#111827' }}>
      <nav
        aria-label="Navegación principal"
        style={{
          width: 260,
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: '8px 12px',
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #E5E7EB', marginBottom: 8 }}>
          Mantenimiento
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', padding: '0 16px 8px' }}>
          {user?.nombre} · <span style={{ textTransform: 'capitalize' }}>{user?.rol}</span>
        </div>

        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            style={({ isActive }) => ({
              textDecoration: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 14,
              color: isActive ? '#2563EB' : '#111827',
              background: isActive ? '#EFF6FF' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'background 0.1s',
            })}
          >
            {item.label}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            textAlign: 'left',
            border: 'none',
            background: 'transparent',
            color: '#DC2626',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Cerrar sesión
        </button>
      </nav>

      <main style={{ flex: '1 1 auto', padding: 24, boxSizing: 'border-box', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
