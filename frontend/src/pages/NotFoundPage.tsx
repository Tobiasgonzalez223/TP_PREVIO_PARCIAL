import * as React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: '#F3F4F6', color: '#111827', textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: '#E5E7EB' }}>404</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Página no encontrada</div>
      <div style={{ fontSize: 14, color: '#6B7280' }}>La ruta que buscás no existe.</div>
      <button
        onClick={() => navigate('/ordenes')}
        style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
      >
        Ir al listado
      </button>
    </div>
  )
}
