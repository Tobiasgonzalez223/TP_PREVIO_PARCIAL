import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import OrdenList from '../components/OrdenList'
import ordenesService from '../services/ordenesService'
import activosService from '../services/activosService'
import usuariosService from '../services/usuariosService'

const enrichOrder = (raw: any, activos: any[], usuarios: any[]) => ({
  ...raw,
  activo: activos.find((a: any) => a.id === raw.activoId)?.nombre || raw.activoId || '',
  solicitante: usuarios.find((u: any) => u.id === raw.solicitanteId)?.nombre || raw.solicitanteId || '',
  tecnico: usuarios.find((u: any) => u.id === raw.tecnicoId)?.nombre || '',
  fecha: raw.fechaCreacion || '',
})

export default function OrdenesPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = React.useState<any[]>([])
  const [error, setError] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try {
        const [activosData, usuariosData, ordersData] = await Promise.all([
          activosService.listar(),
          usuariosService.listar(),
          ordenesService.listar(),
        ])
        const enriched = Array.isArray(ordersData)
          ? ordersData.map((o: any) => enrichOrder(o, activosData, usuariosData))
          : []
        setOrders(enriched)
      } catch (e: any) {
        setError(e?.response?.data || e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: 24, color: '#6B7280' }}>Cargando órdenes...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 48px)' }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Listado de Órdenes</h1>
      <OrdenList
        data={orders}
        showFilters={true}
        showPagination={true}
        defaultPageSize={10}
        backgroundColor="#FFFFFF"
        headerBackgroundColor="#F3F4F6"
        borderColor="#E5E7EB"
        textColor="#111827"
        mutedTextColor="#9CA3AF"
        rowHoverColor="#F9FAFB"
        headerFont={{ fontSize: '13px', fontWeight: 600 }}
        cellFont={{ fontSize: '14px' }}
        backendError={error}
        onSelect={(orden: any) => navigate(`/ordenes/${orden.id}`)}
        style={{ flex: 1, minHeight: 0 }}
      />
    </div>
  )
}
