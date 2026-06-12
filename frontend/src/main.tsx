import * as React from 'react'
import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

import LoginForm from './components/LoginForm'
import HistorialOrden from './components/HistorialOrden'
import ResumenPanel from './components/ResumenPanel'
import OrdenList from './components/OrdenList'
import OrdenForm from './components/OrdenForm'
import OrdenDetail from './components/OrdenDetail'

import authService from './services/authService'
import ordenesService from './services/ordenesService'
import activosService from './services/activosService'

const rootEl = document.getElementById('root') as HTMLElement

function getErrorMessage(error: unknown) {
    if (!error) return 'Error desconocido'
    if (typeof error === 'string') return error
    if (typeof error === 'object' && error !== null) {
        const err = error as any
        if (err.response?.data?.error) return String(err.response.data.error)
        if (err.message) return String(err.message)
    }
    return String(error)
}

function normalizeOrder(orden: any) {
    return {
        id: orden.id,
        titulo: orden.titulo || 'Orden',
        activo: orden.activoId || '—',
        solicitante: orden.solicitanteId || '—',
        tecnico: orden.tecnicoId || 'Sin asignar',
        prioridad: orden.prioridad || 'Media',
        estado: orden.estado || 'Abierta',
        fecha: orden.fechaCreacion || orden.fechaResolucion || '',
    }
}

function mapResumenEstados(ordenesPorEstado: Record<string, number>) {
    return Object.entries(ordenesPorEstado || {}).map(([estado, cantidad]) => ({
        estado,
        cantidad,
        color:
            estado === 'cancelada'
                ? '#D73A49'
                : estado === 'resuelta'
                ? '#10B981'
                : estado === 'asignada'
                ? '#2563EB'
                : estado === 'abierta'
                ? '#F59E0B'
                : '#6B7280',
    }))
}

const AppContainer = () => {
    const [user, setUser] = useState<any>(null)
    const [authError, setAuthError] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [orderDetail, setOrderDetail] = useState<any>(null)
    const [historial, setHistorial] = useState<any[]>([])
    const [summary, setSummary] = useState({ ordenesPorEstado: {}, urgentes: 0, sinTecnico: 0 })
    const [activos, setActivos] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
            setUser(currentUser)
        }
    }, [])

    const fetchSummary = useCallback(async () => {
        try {
            const data = await ordenesService.obtenerResumen()
            setSummary(data)
        } catch (error) {
            console.error(error)
        }
    }, [])

    const fetchOrders = useCallback(async () => {
        try {
            const data = await ordenesService.listar()
            const normalized = Array.isArray(data) ? data.map(normalizeOrder) : []
            setOrders(normalized)
            if (!selectedOrderId && normalized.length > 0) {
                setSelectedOrderId(normalized[0].id)
            }
        } catch (error) {
            console.error(error)
        }
    }, [selectedOrderId])

    const fetchActivos = useCallback(async () => {
        try {
            const data = await activosService.listar()
            setActivos(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error(error)
        }
    }, [])

    const fetchOrderDetail = useCallback(
        async (id: string) => {
            try {
                const detail = await ordenesService.obtenerPorId(id)
                setOrderDetail(detail)
                const historialData = await ordenesService.obtenerHistorial(id)
                setHistorial(Array.isArray(historialData) ? historialData : [])
            } catch (error) {
                console.error(error)
            }
        },
        []
    )

    useEffect(() => {
        if (!user) return
        void Promise.all([fetchSummary(), fetchOrders(), fetchActivos()])
    }, [user, fetchSummary, fetchOrders, fetchActivos])

    useEffect(() => {
        if (selectedOrderId) {
            void fetchOrderDetail(selectedOrderId)
        }
    }, [selectedOrderId, fetchOrderDetail])

    const handleLoginSuccess = useCallback(
        async (payload: any) => {
            setAuthError('')
            setLoading(true)
            try {
                if (payload.mode === 'register') {
                    await authService.register({
                        nombre: payload.name || 'Usuario',
                        email: payload.email,
                        password: payload.password,
                    })
                    return
                }
                const result = await authService.login({
                    email: payload.email,
                    password: payload.password,
                })
                setUser(result.usuario)
            } catch (error) {
                const message = getErrorMessage(error)
                setAuthError(message)
                throw message
            } finally {
                setLoading(false)
            }
        },
        []
    )

    const handleCreateOrder = useCallback(
        async (payload: any) => {
            setAuthError('')
            setLoading(true)
            try {
                await ordenesService.crear({
                    activoId: payload.activo?.trim() || '',
                    titulo: payload.titulo,
                    descripcion: payload.descripcion,
                    prioridad: payload.prioridad,
                    tecnicoId: payload.tecnico?.trim() || undefined,
                })
                await Promise.all([fetchSummary(), fetchOrders()])
            } catch (error) {
                setAuthError(getErrorMessage(error))
            } finally {
                setLoading(false)
            }
        },
        [fetchOrders]
    )

    const handleAssign = useCallback(
        async (event: any) => {
            if (!selectedOrderId || !event?.tecnico) return
            setAuthError('')
            setLoading(true)
            try {
                await ordenesService.asignar(selectedOrderId, String(event.tecnico))
                await Promise.all([fetchOrders(), fetchOrderDetail(selectedOrderId)])
            } catch (error) {
                setAuthError(getErrorMessage(error))
            } finally {
                setLoading(false)
            }
        },
        [selectedOrderId, fetchOrders, fetchOrderDetail]
    )

    const handleCancel = useCallback(async () => {
        if (!selectedOrderId) return
        setAuthError('')
        setLoading(true)
        try {
            await ordenesService.cancelar(selectedOrderId)
            await Promise.all([fetchOrders(), fetchOrderDetail(selectedOrderId)])
        } catch (error) {
            setAuthError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [selectedOrderId, fetchOrders, fetchOrderDetail])

    const handleResolve = useCallback(async () => {
        if (!selectedOrderId) return
        setAuthError('')
        setLoading(true)
        try {
            await ordenesService.resolver(selectedOrderId)
            await Promise.all([fetchOrders(), fetchOrderDetail(selectedOrderId)])
        } catch (error) {
            setAuthError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [selectedOrderId, fetchOrders, fetchOrderDetail])

    const orderedTecnicos = useMemo(() => {
        const unique = Array.from(
            new Set([...(activos || []).map((item) => item.nombre || '')].filter(Boolean))
        )
        return unique.length ? unique : ['tec1@dds.com', 'tec2@dds.com']
    }, [activos])

    const currentOrder = useMemo(() => {
        if (selectedOrderId && orderDetail && orderDetail.id === selectedOrderId) {
            return orderDetail
        }
        if (orders.length > 0) {
            return orders[0]
        }
        return null
    }, [selectedOrderId, orderDetail, orders])

    const resumenView = (
        <ResumenPanel
            titulo="Resumen"
            showTitle={true}
            estados={mapResumenEstados(summary.ordenesPorEstado)}
            urgentes={summary.urgentes}
            sinTecnico={summary.sinTecnico}
            activos={activos
                .filter((activo) => activo.estado === 'con_falla')
                .slice(0, 4)
                .map((activo) => ({ activo: activo.nombre || activo.codigo || 'Activo', fallas: 1 }))}
            backgroundColor="#FFFFFF"
            cardBackgroundColor="#F9FAFB"
            borderColor="#E5E7EB"
            textColor="#111827"
            mutedTextColor="#9CA3AF"
            titleFont={{ fontSize: '20px', fontWeight: 700 }}
            labelFont={{ fontSize: '13px' }}
            numberFont={{ fontSize: '24px', fontWeight: 700 }}
            radius="12px"
            padding="16px"
            gap={16}
        />
    )

    const ordenListView = (
        <OrdenList
            data={orders}
            showFilters={true}
            showPagination={true}
            defaultPageSize={5}
            backgroundColor="#FFFFFF"
            headerBackgroundColor="#F3F4F6"
            borderColor="#E5E7EB"
            textColor="#111827"
            mutedTextColor="#9CA3AF"
            rowHoverColor="#F9FAFB"
            headerFont={{ fontSize: '13px', fontWeight: 600 }}
            cellFont={{ fontSize: '14px' }}
            style={{ minHeight: 0 }}
        />
    )

    const ordenDetailView = (
        <OrdenDetail
            titulo={currentOrder?.titulo || 'Detalle de orden'}
            orden={{
                activo: currentOrder?.activo || '—',
                solicitante: currentOrder?.solicitante || '—',
                tecnico: currentOrder?.tecnico || 'Sin asignar',
                prioridad: currentOrder?.prioridad || 'Media',
                estado: currentOrder?.estado || 'Abierta',
                fechaCreacion: currentOrder?.fecha || '',
                fechaActualizacion: currentOrder?.fecha || '',
                fechaVencimiento: currentOrder?.fechaCierre || '',
            }}
            historial={historial}
            tecnicosDisponibles={orderedTecnicos}
            asignarModalTitulo="Asignar técnico"
            asignarModalPlaceholder="Selecciona un técnico"
            asignarModalConfirmarLabel="Asignar"
            asignarModalCancelarLabel="Cerrar"
            backgroundColor="#FFFFFF"
            surfaceColor="#F9FAFB"
            borderColor="#E5E7EB"
            textColor="#111827"
            mutedTextColor="#6B7280"
            accentColor="#0066FF"
            dangerColor="#DC2626"
            titleFont={{ fontSize: '18px', fontWeight: 700 }}
            labelFont={{ fontSize: '13px' }}
            valueFont={{ fontSize: '14px' }}
            buttonFont={{ fontSize: '14px' }}
            radius={10}
            padding={12}
            gap={12}
            maxHistoryHeight={240}
            showHistory={true}
            asignarLabel="Asignar"
            cancelarLabel="Cancelar"
            resolverLabel="Resolver"
            onAsignar={handleAssign}
            onCancelar={handleCancel}
            onResolver={handleResolve}
            style={{ width: '100%', minHeight: 0 }}
        />
    )

    const ordenFormView = (
        <OrdenForm
            activoLabel="Activo"
            activoPlaceholder="act-1"
            tituloLabel="Título"
            tituloPlaceholder="Título"
            descripcionLabel="Descripción"
            descripcionPlaceholder="Descripción"
            prioridadLabel="Prioridad"
            prioridades={[ 'Alta', 'Media', 'Baja' ]}
            prioridadInicial="Media"
            tecnicoLabel="Técnico"
            tecnicos={orderedTecnicos}
            tecnicoInicial={orderedTecnicos[0] || 'Sin asignar'}
            confirmarLabel="Crear"
            resetOnConfirm={true}
            showDebug={false}
            backgroundColor="#FFFFFF"
            textColor="#111827"
            subtleBackgroundColor="#F9FAFB"
            borderColor="#E5E7EB"
            buttonColor="#111827"
            buttonTextColor="#FFFFFF"
            labelFont={{ fontSize: '13px' }}
            inputFont={{ fontSize: '14px' }}
            buttonFont={{ fontSize: '14px' }}
            radius={10}
            padding="12px"
            gap={12}
            onConfirm={handleCreateOrder}
            style={{ width: '100%', minHeight: 0 }}
        />
    )

    const historialView = (
        <HistorialOrden
            registros={historial}
            mostrarEncabezados={true}
            encabezados={{
                accion: 'Acción',
                usuario: 'Usuario',
                fechaHora: 'Fecha/Hora',
                valorAnterior: 'Valor anterior',
                valorNuevo: 'Valor nuevo',
            }}
            separadorColor="#E5E7EB"
            fondoColor="#FFFFFF"
            textoColor="#111827"
            encabezadoFondo="#F3F4F6"
            encabezadoTexto="#111827"
            bordeRedondeado="12px"
            padding="12px"
            gap={8}
            maxAltura={320}
            scroll={true}
            style={{ width: '100%', minHeight: 0 }}
        />
    )

    const loginView = (
        <LoginForm
            title="Iniciar sesión"
            helperText="Accede para gestionar órdenes de mantenimiento."
            emailLabel="Email"
            passwordLabel="Contraseña"
            emailPlaceholder="tu@empresa.com"
            passwordPlaceholder="••••••••"
            buttonLabel="Entrar"
            enableRegister={true}
            externalError={authError}
            onSuccess={handleLoginSuccess}
            onError={(message) => setAuthError(message)}
            style={{ width: '100%', maxWidth: '480px' }}
        />
    )

    return (
        <App
            initialView={user ? 'resumen' : 'login'}
            loginView={loginView}
            ordenListView={ordenListView}
            ordenDetailView={ordenDetailView}
            ordenFormView={ordenFormView}
            resumenView={resumenView}
            historialView={historialView}
            backgroundColor="#F3F4F6"
            navBackgroundColor="#FFFFFF"
            borderColor="#E5E7EB"
            textColor="#111827"
            activeTextColor="#0066FF"
            buttonBackgroundColor="#F5F5F5"
            buttonHoverBackgroundColor="#E5E7EB"
            navHeight={56}
            navPadding="8px 12px"
            contentPadding="16px"
            navFont={{ fontSize: '14px' }}
            showViewTitle={true}
            titleFont={{ fontSize: '22px' }}
            notFoundTitle="Sin vista"
            notFoundBody="Selecciona una vista disponible"
            style={{ minHeight: '100vh' }}
        />
    )
}

createRoot(rootEl).render(
    <StrictMode>
        <AppContainer />
    </StrictMode>
)
