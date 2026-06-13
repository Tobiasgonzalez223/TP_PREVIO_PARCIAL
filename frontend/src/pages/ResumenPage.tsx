import * as React from 'react'
import ResumenPanel from '../components/ResumenPanel'
import ordenesService from '../services/ordenesService'

const mapResumen = (raw: any) => {
  if (!raw) return { estados: [], urgentes: 0, sinTecnico: 0, activos: [] }
  const estados = Object.entries(raw.ordenesPorEstado || {}).map(
    ([estado, cantidad]) => ({ estado, cantidad })
  )
  return {
    estados,
    urgentes: raw.urgentes ?? 0,
    sinTecnico: raw.sinTecnico ?? 0,
    activos: raw.activosConMasFallas ?? [],
  }
}

export default function ResumenPage() {
  const [summary, setSummary] = React.useState<any>({ estados: [], urgentes: 0, sinTecnico: 0, activos: [] })
  const [error, setError] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    ordenesService.obtenerResumen()
      .then(data => setSummary(mapResumen(data)))
      .catch((e: any) => setError(e?.response?.data || e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 24, color: '#6B7280' }}>Cargando resumen...</div>
  if (error) return <div style={{ padding: 24, color: '#DC2626' }}>Error al cargar el resumen.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Resumen Administrativo</h1>
      <ResumenPanel
        titulo="Resumen administrativo"
        showTitle={false}
        estados={summary.estados}
        urgentes={summary.urgentes}
        sinTecnico={summary.sinTecnico}
        activos={summary.activos}
        backgroundColor="#FFFFFF"
        cardBackgroundColor="#F9FAFB"
        borderColor="#E5E7EB"
        textColor="#111827"
        mutedTextColor="#9CA3AF"
        titleFont={{ fontSize: '20px' }}
        labelFont={{ fontSize: '13px' }}
        numberFont={{ fontSize: '28px' }}
        radius="8px"
        padding="16px"
        gap={12}
        style={{ width: '100%' }}
      />
    </div>
  )
}
