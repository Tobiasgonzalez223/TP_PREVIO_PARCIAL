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
  activo: "", solicitante: "", tecnico: "", prioridad: "",
  estado: "", fechaCreacion: "", fechaActualizacion: "", fechaVencimiento: "",
}

const initialSummary = { estados: [], urgentes: 0, sinTecnico: 0, activos: [] }

// Convierte objetos del historial a string para que React pueda renderizarlos
const mapHistorial = (data: any[]) =>
  data.map(h => ({
    ...h,
    valorAnterior: h.valorAnterior
      ? (typeof h.valorAnterior === "object" ? JSON.stringify(h.valorAnterior) : h.valorAnterior)
      : "-",
    valorNuevo: h.valorNuevo
      ? (typeof h.valorNuevo === "object" ? JSON.stringify(h.valorNuevo) : h.valorNuevo)
      : "-",
  }))

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
    fecha: rawOrder.fechaCreacion || "",
    fechaActualizacion: rawOrder.fechaCreacion || "",
    fechaVencimiento: "",
  }
}

// Convierte el shape del backend al shape que espera ResumenPanel
const mapResumen = (raw: any) => {
  if (!raw) return initialSummary
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

  React.useEffect(() => {
    if (!currentUser) return
    const loadData = async () => {
      try {
        setLoadingMessage("Cargando datos...")
        const [activosData, usuariosData] = await Promise.all([
          activosService.listar(),
          usuariosService.listar(),
        ])
        setActivos(Array.isArray(activosData) ? activosData : [])
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : [])

        const ordersData = await ordenesService.listar()
        const enrichedOrders = Array.isArray(ordersData)
          ? ordersData.map(o => enrichOrder(o, activosData, usuariosData))
          : []
        setOrders(enrichedOrders)

        if (enrichedOrders.length > 0) {
          setSelectedOrder(enrichedOrders[0])
          const historialData = await ordenesService.obtenerHistorial(enrichedOrders[0].id)
          setHistorial(Array.isArray(historialData) ? mapHistorial(historialData) : [])
        }

        const summaryData = await ordenesService.obtenerResumen()
        setSummary(mapResumen(summaryData))
        setBackendError(null)
      } catch (error) {
        setBackendError(error)
      } finally {
        setLoadingMessage("")
      }
    }
    loadData()
  }, [currentUser])

  const handleAssign = async (event: any) => {
    if (!selectedOrder.id) return
    const tecnico = usuarios.find(u => u.nombre === event.tecnico)
    if (!tecnico) return
    setLoadingMessage("Asignando técnico...")
    try {
      const orden = await ordenesService.asignar(selectedOrder.id, tecnico.id)
      const enriched = enrichOrder(orden, activos, usuarios)
      setSelectedOrder(enriched)
      setOrders(prev => prev.map(o => o.id === enriched.id ? enriched : o))
      const historialData = await ordenesService.obtenerHistorial(orden.id)
      setHistorial(Array.isArray(historialData) ? mapHistorial(historialData) : [])
      setBackendError(null)
    } catch (error: any) {
      setBackendError(error?.response?.data || error)
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
      setOrders(prev => prev.map(o => o.id === enriched.id ? enriched : o))
      const historialData = await ordenesService.obtenerHistorial(orden.id)
      setHistorial(Array.isArray(historialData) ? mapHistorial(historialData) : [])
      setBackendError(null)
    } catch (error: any) {
      setBackendError(error?.response?.data || error)
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
      setOrders(prev => prev.map(o => o.id === enriched.id ? enriched : o))
      const historialData = await ordenesService.obtenerHistorial(orden.id)
      setHistorial(Array.isArray(historialData) ? mapHistorial(historialData) : [])
      setBackendError(null)
    } catch (error: any) {
      setBackendError(error?.response?.data || error)
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
      setHistorial(Array.isArray(historialData) ? mapHistorial(historialData) : [])
      setBackendError(null)
    } catch (error: any) {
      setBackendError(error?.response?.data || error)
    } finally {
      setLoadingMessage("")
    }
  }

  const handleCrearOrden = async (formData: any) => {
    if (!formData) return
    setLoadingMessage("Creando orden...")
    try {
      const activo = activos.find(a => a.nombre === formData.activo || a.id === formData.activo)
      const payload = {
        activoId: activo?.id || formData.activo,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad: (formData.prioridad || "").toLowerCase(),
      }
      const nuevaOrden = await ordenesService.crear(payload)
      const enriched = enrichOrder(nuevaOrden, activos, usuarios)
      setOrders(prev => [enriched, ...prev])
      setSelectedOrder(enriched)
      setBackendError(null)
    } catch (error: any) {
      setBackendError(error?.response?.data || error)
    } finally {
      setLoadingMessage("")
    }
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
    setOrders([])
    setSelectedOrder(emptyOrder)
    setHistorial([])
    setSummary(initialSummary)
    setBackendError(null)
  }

  const loginView = (
    <LoginForm
      title="Iniciar sesión"
      helperText="Accede para gestionar órdenes de mantenimiento."
      emailLabel="Email"
      passwordLabel="Contraseña"
      emailPlaceholder="admin@dds.com"
      passwordPlaceholder="••••••••"
      buttonLabel="Entrar"
      enableRegister={true}
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
      onSuccess={async (payload: any) => {
        setBackendError(null)
        setLoadingMessage(payload.mode === "login" ? "Iniciando sesión..." : "Registrando...")
        try {
          if (payload.mode === "register") {
            await authService.register({
              nombre: payload.name,
              email: payload.email,
              password: payload.password,
            })
          }
          const result = await authService.login({
            email: payload.email,
            password: payload.password,
          })
          setCurrentUser(result.usuario)
        } catch (error: any) {
          setBackendError(error?.response?.data?.error || error?.message || "Error al autenticar")
        } finally {
          setLoadingMessage("")
        }
      }}
      onError={(msg: string) => setBackendError(msg)}
      externalError={
        typeof backendError === "string"
          ? backendError
          : backendError?.error || backendError?.message || ""
      }
    />
  )

  const ordenListView = (
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
      historial={historial.map(h => ({
  accion: h.accion || "",
  usuario: usuarios.find(u => u.id === h.usuarioId)?.nombre || h.usuarioId || "",
  fechaHora: h.fechaHora || "",
  valorAnterior: h.valorAnterior
    ? (typeof h.valorAnterior === "object" ? JSON.stringify(h.valorAnterior) : String(h.valorAnterior))
    : "-",
  valorNuevo: h.valorNuevo
    ? (typeof h.valorNuevo === "object" ? JSON.stringify(h.valorNuevo) : String(h.valorNuevo))
    : "-",
}))}
      tecnicosDisponibles={usuarios.filter(u => u.rol === "tecnico").map(u => u.nombre)}
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
      activoPlaceholder="Nombre del activo"
      tituloLabel="Título"
      tituloPlaceholder="Resumen del problema"
      descripcionLabel="Descripción"
      descripcionPlaceholder="Detallá el incidente"
      prioridadLabel="Prioridad"
      prioridades={["urgente", "alta", "media", "baja"]}
      prioridadInicial="media"
      tecnicoLabel="Técnico"
      tecnicos={usuarios.filter(u => u.rol === "tecnico").map(u => u.nombre)}
      tecnicoInicial=""
      confirmarLabel="Crear orden"
      resetOnConfirm={true}
      showDebug={false}
      backgroundColor="#FFFFFF"
      textColor="#111827"
      subtleBackgroundColor="#F9FAFB"
      borderColor="#E5E7EB"
      buttonColor="#2563EB"
      buttonTextColor="#FFFFFF"
      labelFont={{ fontSize: "13px" }}
      inputFont={{ fontSize: "14px" }}
      buttonFont={{ fontSize: "14px" }}
      radius={10}
      padding="12px"
      gap={12}
      onConfirm={handleCrearOrden}
      backendError={backendError}
      style={{ width: "100%" }}
    />
  )

  const resumenView = (
    <ResumenPanel
      titulo="Resumen administrativo"
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
      numberFont={{ fontSize: "28px" }}
      radius="8px"
      padding="16px"
      gap={12}
      style={{ width: "100%" }}
    />
  )

 const historialView = (
  <HistorialOrden
    registros={historial.map(h => ({
      accion: h.accion || "",
      usuario: usuarios.find(u => u.id === h.usuarioId)?.nombre || h.usuarioId || "",
      fechaHora: h.fechaHora || "",
      valorAnterior: h.valorAnterior
        ? (typeof h.valorAnterior === "object" ? JSON.stringify(h.valorAnterior) : String(h.valorAnterior))
        : "-",
      valorNuevo: h.valorNuevo
        ? (typeof h.valorNuevo === "object" ? JSON.stringify(h.valorNuevo) : String(h.valorNuevo))
        : "-",
    }))}
    mostrarEncabezados={true}
    separadorColor="#E5E7EB"
    fondoColor="#FFFFFF"
    textoColor="#111827"
    encabezadoFondo="#F3F4F6"
    encabezadoTexto="#111827"
    bordeRedondeado="8px"
    padding="12px"
    gap={8}
    maxAltura={500}
    scroll={true}
    fuenteEncabezado={{ fontSize: "13px", fontWeight: 600 }}
    fuenteFila={{ fontSize: "14px" }}
    style={{ width: "100%" }}
  />
)


  return (
    <App
      initialView={currentUser ? "listado" : "login"}
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
      navFont={{ fontSize: "14px" }}
      showViewTitle={true}
      titleFont={{ fontSize: "22px" }}
      notFoundTitle="Página no encontrada"
      notFoundBody="La vista que buscás no existe."
      onLogout={handleLogout}
    />
  )
}