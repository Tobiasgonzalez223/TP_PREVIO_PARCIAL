import * as React from "react"
import App from "./App"
import LoginForm from "./components/LoginForm"
import OrdenList from "./components/OrdenList"
import OrdenDetail from "./components/OrdenDetail"
import OrdenForm from "./components/OrdenForm"
import ResumenPanel from "./components/ResumenPanel"
import HistorialOrden from "./components/HistorialOrden"
import authService from "./services/authService"
import ordenesService from "./services/ordenesService"
import activosService from "./services/activosService"
import usuariosService from "./services/usuariosService"

const emptyOrder = {
  activo: "",
  solicitante: "",
  tecnico: "",
  prioridad: "",
  estado: "",
  fechaCreacion: "",
  fechaActualizacion: "",
  fechaVencimiento: "",
}

const initialSummary = {
  estados: [],
  urgentes: 0,
  sinTecnico: 0,
  activos: [],
}

const enrichOrder = (rawOrder: any, activos: any[], usuarios: any[]): any => {
  if (!rawOrder) return emptyOrder
  
  const activo = activos.find(a => a.id === rawOrder.activoId)
  const solicitante = usuarios.find(u => u.id === rawOrder.solicitanteId)
  const tecnico = usuarios.find(u => u.id === rawOrder.tecnicoId)
  
  return {
    ...rawOrder,
    activo: activo?.nombre || rawOrder.activoId || "",
    solicitante: solicitante?.nombre || rawOrder.solicitanteId || "",
    tecnico: tecnico?.nombre || "",
    fechaActualizacion: rawOrder.fechaCreacion || "",
    fechaVencimiento: "",
  }
}

export default function AppContainer() {
  const [backendError, setBackendError] = React.useState<any>(null)
  const [orders, setOrders] = React.useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = React.useState<any>(emptyOrder)
  const [historial, setHistorial] = React.useState<any[]>([])
  const [summary, setSummary] = React.useState<any>(initialSummary)
  const [currentUser, setCurrentUser] = React.useState<any>(authService.getCurrentUser())
  const [loadingMessage, setLoadingMessage] = React.useState<string>("")
  const [activos, setActivos] = React.useState<any[]>([])
  const [usuarios, setUsuarios] = React.useState<any[]>([])

  // Efecto para cargar datos iniciales cuando el usuario se autentica
  React.useEffect(() => {
    if (!currentUser) return

    const loadInitialData = async () => {
      try {
        setLoadingMessage("Cargando datos...")
        
        // Cargar activos y usuarios en paralelo
        const [activosData, usuariosData] = await Promise.all([
          activosService.listar(),
          usuariosService.listar()
        ])
        
        setActivos(Array.isArray(activosData) ? activosData : [])
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : [])
        
        // Ahora cargar órdenes con los datos ya disponibles
        const ordersData = await ordenesService.listar()
        const enrichedOrders = Array.isArray(ordersData)
          ? ordersData.map(o => enrichOrder(o, activosData, usuariosData))
          : []
        
        setOrders(enrichedOrders)
        if (enrichedOrders.length > 0) {
          setSelectedOrder(enrichedOrders[0])
          const historialData = await ordenesService.obtenerHistorial(enrichedOrders[0].id)
          setHistorial(Array.isArray(historialData) ? historialData : [])
        }
        
        // Cargar resumen
        const summaryData = await ordenesService.obtenerResumen()
        setSummary(summaryData || initialSummary)
        
        setBackendError(null)
      } catch (error) {
        setBackendError(error)
      } finally {
        setLoadingMessage("")
      }
    }

    loadInitialData()
  }, [currentUser])

  const handleAssign = async (event: any) => {
    if (!selectedOrder.id) return
    setLoadingMessage("Asignando técnico...")
    try {
      const orden = await ordenesService.asignar(selectedOrder.id, event.tecnico)
      const enriched = enrichOrder(orden, activos, usuarios)
      setSelectedOrder(enriched)
      const historialData = await ordenesService.obtenerHistorial(orden.id)
      setHistorial(Array.isArray(historialData) ? historialData : [])
      setBackendError(null)
    } catch (error) {
      setBackendError(error)
    } finally {
      setLoadingMessage("")
    }
  }

  const handleCancel = async () => {
    if (!selectedOrder.id) return
    setLoadingMessage("Cancelando orden...")
    try {
      const orden = await ordenesService.cancelar(selectedOrder.id)
      const enriched = enrichOrder(orden, activos, usuarios)
      setSelectedOrder(enriched)
      const historialData = await ordenesService.obtenerHistorial(orden.id)
      setHistorial(Array.isArray(historialData) ? historialData : [])
      setBackendError(null)
    } catch (error) {
      setBackendError(error)
    } finally {
      setLoadingMessage("")
    }
  }

  const handleResolve = async () => {
    if (!selectedOrder.id) return
    setLoadingMessage("Resolviendo orden...")
    try {
      const orden = await ordenesService.resolver(selectedOrder.id)
      const enriched = enrichOrder(orden, activos, usuarios)
      setSelectedOrder(enriched)
      const historialData = await ordenesService.obtenerHistorial(orden.id)
      setHistorial(Array.isArray(historialData) ? historialData : [])
      setBackendError(null)
    } catch (error) {
      setBackendError(error)
    } finally {
      setLoadingMessage("")
    }
  }

  const handleSelectOrder = async (orden: any) => {
    if (!orden.id) return
    setLoadingMessage("Cargando detalle...")
    try {
      const data = await ordenesService.obtenerPorId(orden.id)
      const enriched = enrichOrder(data, activos, usuarios)
      setSelectedOrder(enriched)
      const historialData = await ordenesService.obtenerHistorial(orden.id)
      setHistorial(Array.isArray(historialData) ? historialData : [])
      setBackendError(null)
    } catch (error) {
      setBackendError(error)
    } finally {
      setLoadingMessage("")
    }
  }

  const loginView = (
    <LoginForm
      title="Iniciar sesión"
      helperText="Usa el backend para autenticar y mostrar errores reales."
      emailLabel="Email"
      passwordLabel="Contraseña"
      emailPlaceholder="admin@dds.com"
      passwordPlaceholder="••••••••"
      buttonLabel="Entrar"
      enableRegister={false}
      registerLinkLabel="Registrarse"
      backToLoginLabel="Volver"
      registerTitle="Crear cuenta"
      registerHelperText="Completa los datos para registrarte."
      nameLabel="Nombre"
      namePlaceholder="Nombre"
      confirmPasswordLabel="Repetir contraseña"
      confirmPasswordPlaceholder="••••••••"
      registerButtonLabel="Registrar"
      initialError=""
      backgroundColor="#F8FAFC"
      cardColor="#FFFFFF"
      borderColor="#E5E7EB"
      textColor="#111827"
      placeholderColor="#6B7280"
      errorColor="#DC2626"
      buttonColor="#2563EB"
      buttonTextColor="#FFFFFF"
      radius={8}
      gap={16}
      padding="20px"
      titleFont={{ fontSize: "24px", fontWeight: 700 }}
      labelFont={{ fontSize: "14px" }}
      inputFont={{ fontSize: "14px" }}
      helperFont={{ fontSize: "13px" }}
      errorFont={{ fontSize: "14px" }}
      buttonFont={{ fontSize: "15px" }}
      onSubmit={() => {}}
      onSuccess={async (payload) => {
        setBackendError(null)
        setLoadingMessage("Iniciando sesión...")
        try {
          const result = await authService.login({ email: payload.email, password: payload.password })
          setCurrentUser(result.usuario)
        } catch (error: any) {
          setBackendError(error?.response?.data || error)
        } finally {
          setLoadingMessage("")
        }
      }}
      onError={(msg) => {
        setBackendError({ message: msg })
      }}
      backendError={backendError}
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
      headerFont={{ fontSize: "13px", fontWeight: 600 }}
      cellFont={{ fontSize: "14px" }}
      backendError={backendError}
      style={{ width: "100%" }}
    />
  )

  const ordenDetailView = (
    <OrdenDetail
      titulo="Detalle"
      orden={selectedOrder}
      historial={historial}
      tecnicosDisponibles={usuarios.filter(u => u.rol === 'tecnico').map(u => u.nombre)}
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
      titleFont={{ fontSize: "18px" }}
      labelFont={{ fontSize: "13px" }}
      valueFont={{ fontSize: "14px" }}
      buttonFont={{ fontSize: "14px" }}
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
      backendError={backendError}
      style={{ width: "100%" }}
    />
  )

  const ordenFormView = (
    <OrdenForm
      activoLabel="Activo"
      activoPlaceholder="Activo"
      tituloLabel="Título"
      tituloPlaceholder="Título"
      descripcionLabel="Descripción"
      descripcionPlaceholder="Descripción"
      prioridadLabel="Prioridad"
      prioridades={["Alta", "Media", "Baja"]}
      prioridadInicial="Media"
      tecnicoLabel="Técnico"
      tecnicos={usuarios.filter(u => u.rol === 'tecnico').map(u => u.nombre)}
      tecnicoInicial=""
      confirmarLabel="Crear"
      resetOnConfirm={true}
      showDebug={false}
      backgroundColor="#FFFFFF"
      textColor="#111827"
      subtleBackgroundColor="#F9FAFB"
      borderColor="#E5E7EB"
      buttonColor="#111827"
      buttonTextColor="#FFFFFF"
      labelFont={{ fontSize: "13px" }}
      inputFont={{ fontSize: "14px" }}
      buttonFont={{ fontSize: "14px" }}
      radius={10}
      padding="12px"
      gap={12}
      onConfirm={() => null}
      backendError={backendError}
      style={{ width: "100%" }}
    />
  )

  const resumenView = (
    <ResumenPanel
      titulo="Resumen"
      showTitle={true}
      estados={summary.estados}
      urgentes={summary.urgentes}
      sinTecnico={summary.sinTecnico}
      activos={summary.activos}
      backgroundColor="#FFFFFF"
      cardBackgroundColor="#F9FAFB"
      borderColor="#E5E7EB"
      textColor="#111827"
      mutedTextColor="#9CA3AF"
      titleFont={{ fontSize: "20px" }}
      labelFont={{ fontSize: "13px" }}
      valueFont={{ fontSize: "28px" }}
      padding={16}
      gap={12}
      radius={8}
      style={{ width: "100%" }}
    />
  )

  const historialView = (
    <HistorialOrden
      titulo="Historial"
      items={historial}
      columnHeaders={["Acción", "Usuario", "Cambio", "Fecha"]}
      backgroundColor="#FFFFFF"
      rowBackgroundColor="#F9FAFB"
      alternateRowColor="#FFFFFF"
      borderColor="#E5E7EB"
      textColor="#111827"
      mutedTextColor="#9CA3AF"
      titleFont={{ fontSize: "20px" }}
      headerFont={{ fontSize: "13px" }}
      cellFont={{ fontSize: "14px" }}
      padding={12}
      gap={8}
      radius={8}
      maxHeight={500}
      style={{ width: "100%" }}
    />
  )

  return (
    <App
      loginView={loginView}
      ordenListView={ordenListView}
      ordenDetailView={ordenDetailView}
      ordenFormView={ordenFormView}
      resumenView={resumenView}
      historialView={historialView}
      currentUser={currentUser}
      loadingMessage={loadingMessage}
      onLogout={() => {
        authService.logout()
        setCurrentUser(null)
        setOrders([])
        setSelectedOrder(emptyOrder)
        setHistorial([])
        setBackendError(null)
      }}
    />
  )
}
