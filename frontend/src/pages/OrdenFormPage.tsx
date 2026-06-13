import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import OrdenForm from '../components/OrdenForm'
import ordenesService from '../services/ordenesService'
import activosService from '../services/activosService'
import usuariosService from '../services/usuariosService'

export default function OrdenFormPage() {
  const navigate = useNavigate()
  const [activos, setActivos] = React.useState<any[]>([])
  const [usuarios, setUsuarios] = React.useState<any[]>([])
  const [error, setError] = React.useState<any>(null)

  React.useEffect(() => {
    Promise.all([activosService.listar(), usuariosService.listar()])
      .then(([a, u]) => { setActivos(a); setUsuarios(u) })
      .catch((e: any) => setError(e?.response?.data || e))
  }, [])

  const handleConfirm = async (formData: any) => {
    try {
      setError(null)
      const activo = activos.find((a: any) => a.nombre === formData.activo || a.id === formData.activo)
      const tecnico = usuarios.find((u: any) => u.nombre === formData.tecnico)
      const payload: Record<string, unknown> = {
        activoId: activo?.id || formData.activo,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad: (formData.prioridad || '').toLowerCase(),
        ...(tecnico ? { tecnicoId: tecnico.id } : {}),
      }
      const nueva = await ordenesService.crear(payload)
      navigate(`/ordenes/${nueva.id}`)
    } catch (e: any) {
      setError(e?.response?.data || e)
    }
  }

  const activoNombres = activos.filter((a: any) => a.estado !== 'baja').map((a: any) => a.nombre)
  const tecnicoNombres = usuarios.filter((u: any) => u.rol === 'tecnico').map((u: any) => u.nombre)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Nueva Orden</h1>
      <OrdenForm
        activoLabel="Activo"
        activoPlaceholder="Nombre del activo"
        activos={activoNombres}
        tituloLabel="Título"
        tituloPlaceholder="Resumen del problema"
        descripcionLabel="Descripción"
        descripcionPlaceholder="Detallá el incidente"
        prioridadLabel="Prioridad"
        prioridades={['urgente', 'alta', 'media', 'baja']}
        prioridadInicial="media"
        tecnicoLabel="Técnico (opcional)"
        tecnicos={tecnicoNombres}
        tecnicoInicial=""
        confirmarLabel="Crear orden"
        resetOnConfirm={false}
        showDebug={false}
        backgroundColor="#FFFFFF"
        textColor="#111827"
        subtleBackgroundColor="#F9FAFB"
        borderColor="#E5E7EB"
        buttonColor="#2563EB"
        buttonTextColor="#FFFFFF"
        labelFont={{ fontSize: '13px' }}
        inputFont={{ fontSize: '14px' }}
        buttonFont={{ fontSize: '14px' }}
        radius={10}
        padding="16px"
        gap={12}
        onConfirm={handleConfirm}
        backendError={error}
        style={{ width: '100%' }}
      />
    </div>
  )
}
