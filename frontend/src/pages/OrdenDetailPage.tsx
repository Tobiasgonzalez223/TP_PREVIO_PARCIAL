import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OrdenDetail from '../components/OrdenDetail'
import ordenesService from '../services/ordenesService'
import activosService from '../services/activosService'
import usuariosService from '../services/usuariosService'

export default function OrdenDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = React.useState<any>(null)
  const [historial, setHistorial] = React.useState<any[]>([])
  const [usuarios, setUsuarios] = React.useState<any[]>([])
  const [error, setError] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    try {
      setError(null)
      const [rawOrder, histData, activosData, usuariosData] = await Promise.all([
        ordenesService.obtenerPorId(id!),
        ordenesService.obtenerHistorial(id!),
        activosService.listar(),
        usuariosService.listar(),
      ])
      setUsuarios(usuariosData)

      const activo = activosData.find((a: any) => a.id === rawOrder.activoId)
      const solicitante = usuariosData.find((u: any) => u.id === rawOrder.solicitanteId)
      const tecnico = usuariosData.find((u: any) => u.id === rawOrder.tecnicoId)

      setOrder({
        ...rawOrder,
        activo: activo?.nombre || rawOrder.activoId || '',
        solicitante: solicitante?.nombre || rawOrder.solicitanteId || '',
        tecnico: tecnico?.nombre || '',
        fecha: rawOrder.fechaCreacion || '',
        fechaActualizacion: rawOrder.fechaCreacion || '',
        fechaVencimiento: '',
      })

      setHistorial(histData.map((h: any) => ({
        accion: h.accion || '',
        usuario: usuariosData.find((u: any) => u.id === h.usuarioId)?.nombre || h.usuarioId || '',
        fechaHora: h.fechaHora || '',
        valorAnterior: h.valorAnterior
          ? (typeof h.valorAnterior === 'object' ? JSON.stringify(h.valorAnterior) : h.valorAnterior)
          : '-',
        valorNuevo: h.valorNuevo
          ? (typeof h.valorNuevo === 'object' ? JSON.stringify(h.valorNuevo) : h.valorNuevo)
          : '-',
      })))
    } catch (e: any) {
      setError(e?.response?.data || e)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => { load() }, [load])

  const handleAssign = async (event: any) => {
    const tecnico = usuarios.find((u: any) => u.nombre === event.tecnico)
    if (!tecnico) return
    try {
      await ordenesService.asignar(id!, tecnico.id)
      await load()
    } catch (e: any) {
      setError(e?.response?.data || e)
    }
  }

  const handleCancel = async () => {
    try {
      await ordenesService.cancelar(id!)
      await load()
    } catch (e: any) {
      setError(e?.response?.data || e)
    }
  }

  const handleResolve = async () => {
    try {
      await ordenesService.resolver(id!)
      await load()
    } catch (e: any) {
      setError(e?.response?.data || e)
    }
  }

  const handleEnProceso = async () => {
    try {
      await ordenesService.enProceso(id!)
      await load()
    } catch (e: any) {
      setError(e?.response?.data || e)
    }
  }

  if (loading) return <div style={{ padding: 24, color: '#6B7280' }}>Cargando orden...</div>

  if (!order) return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate('/ordenes')} style={{ marginBottom: 16, background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
        ← Volver
      </button>
      <p>Orden no encontrada.</p>
    </div>
  )

  const tecnicos = usuarios.filter((u: any) => u.rol === 'tecnico').map((u: any) => u.nombre)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/ordenes')}
          style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#374151' }}
        >
          ← Volver
        </button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Detalle de Orden</h1>
      </div>

      {order.estado === 'asignada' && (
        <button
          onClick={handleEnProceso}
          style={{ alignSelf: 'flex-start', background: '#F59E0B', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          Iniciar trabajo (→ En proceso)
        </button>
      )}

      <OrdenDetail
        titulo={order.titulo || 'Detalle'}
        orden={order}
        historial={historial}
        tecnicosDisponibles={tecnicos}
        asignarModalTitulo="Asignar técnico"
        asignarModalPlaceholder="Selecciona un técnico"
        asignarModalConfirmarLabel="Asignar"
        asignarModalCancelarLabel="Cerrar"
        backgroundColor="#FFFFFF"
        surfaceColor="#F9FAFB"
        borderColor="#E5E7EB"
        textColor="#111827"
        mutedTextColor="#9CA3AF"
        accentColor="#0066FF"
        dangerColor="#DC2626"
        titleFont={{ fontSize: '18px' }}
        labelFont={{ fontSize: '13px' }}
        valueFont={{ fontSize: '14px' }}
        buttonFont={{ fontSize: '14px' }}
        radius={10}
        padding={12}
        gap={12}
        maxHistoryHeight={240}
        showHistory={true}
        asignarLabel="Asignar técnico"
        cancelarLabel="Cancelar"
        resolverLabel="Resolver"
        onAsignar={handleAssign}
        onCancelar={handleCancel}
        onResolver={handleResolve}
        backendError={error}
        style={{ width: '100%' }}
      />
    </div>
  )
}
