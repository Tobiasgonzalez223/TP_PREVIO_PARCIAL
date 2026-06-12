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

export default function AppContainer() {
  const [backendError, setBackendError] = React.useState<any>(null)
  const [orders, setOrders] = React.useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = React.useState<any>(emptyOrder)
  const [historial, setHistorial] = React.useState<any[]>([])
  const [summary, setSummary] = React.useState<any>(initialSummary)
  const [currentUser, setCurrentUser] = React.useState<any>(authService.getCurrentUser())
  const [loadingMessage, setLoadingMessage] = React.useState<string>("")

  const fetchOrders = React.useCallback(async () => {
    setBackendError(null)
    setLoadingMessage("Cargando órdenes...")
    try {
      const data = await ordenesService.listar()
      setOrders(Array.isArray(data) ? data : [])
      if (Array.isArray(data) && data.length > 0) {
        setSelectedOrder(data[0])
        await fetchHistorial(data[0].id)
      }
    } catch (error) {
      setBackendError(error)
    } finally {
      setLoadingMessage("")
    }
  }, [])

  const fetchSummary = React.useCallback(async () => {
    setBackendError(null)
    setLoadingMessage("Cargando resumen...")
    try {
      const data = await ordenesService.obtenerResumen()
      setSummary(data || initialSummary)
    } catch (error) {
      setBackendError(error)
    } finally {
      setLoadingMessage("")
    }
  }, [])

  const fetchHistorial = React.useCallback(async (id: string) => {
    setBackendError(null)
    setLoadingMessage("Cargando historial...")
    try {
      const data = await ordenesService.obtenerHistorial(id)
      setHistorial(Array.isArray(data) ? data : [])
    } catch (error) {
      setBackendError(error)
    } finally {
      setLoadingMessage("")
    }
  }, [])

  const fetchOrderDetail = React.useCallback(
    async (id: string) => {
      setBackendError(null)
      setLoadingMessage("Cargando detalle de orden...")
      try {
        const data = await ordenesService.obtenerPorId(id)
        setSelectedOrder(data || emptyOrder)
        await fetchHistorial(id)
      } catch (error) {
        setBackendError(error)
      } finally {
        setLoadingMessage("")
      }
    },
    [fetchHistorial]
  )

  const handleAssign = React.useCallback(
    async (event: any) => {
      setBackendError(null)
      setLoadingMessage("Asignando técnico...")
      try {
        const orden = await ordenesService.asignar(selectedOrder.id, event.tecnico)
        setSelectedOrder(orden)
        await fetchHistorial(orden.id)
      } catch (error) {
        setBackendError(error)
      } finally {
        setLoadingMessage("")
      }
    },
    [fetchHistorial, selectedOrder]
  )

  const handleCancel = React.useCallback(
    async () => {
      setBackendError(null)
      setLoadingMessage("Cancelando orden...")
      try {
        const orden = await ordenesService.cancelar(selectedOrder.id)
        setSelectedOrder(orden)
        await fetchHistorial(orden.id)
      } catch (error) {
        setBackendError(error)
      } finally {
        setLoadingMessage("")
      }
    },
    [selectedOrder]
  )

  const handleResolve = React.useCallback(
    async () => {
      setBackendError(null)
      setLoadingMessage("Resolviendo orden...")
      try {
        const orden = await ordenesService.resolver(selectedOrder.id)
        setSelectedOrder(orden)
        await fetchHistorial(orden.id)
      } catch (error) {
        setBackendError(error)
      } finally {
        setLoadingMessage("")
      }
    },
    [selectedOrder]
  )

  React.useEffect(() => {
    void fetchOrders()
    void fetchSummary()
  }, [fetchOrders, fetchSummary])

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
      onSubmit={() => {
        setBackendError({ message: "Login funcional no implementado en este demo." })
      }}
      onSuccess={() => null}
      onError={() => null}
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
      tecnicosDisponibles={[]}
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
      tecnicos={["Ana", "Luis", "Carlos"]}
      tecnicoInicial="Ana"
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
      numberFont={{ fontSize: "24px" }}
      radius="12px"
      padding="16px"
      gap={12}
      backendError={backendError}
      style={{ width: "100%" }}
    />
  )

  const historialView = (
    <HistorialOrden
      registros={historial}
      mostrarEncabezados={true}
      encabezados={{
        accion: "Acción",
        usuario: "Usuario",
        fechaHora: "Fecha/Hora",
        valorAnterior: "Valor anterior",
        valorNuevo: "Valor nuevo",
      }}
      separadorColor="#EEEEEE"
      fondoColor="#FFFFFF"
      textoColor="#111827"
      encabezadoFondo="#F5F5F5"
      encabezadoTexto="#111827"
      bordeRedondeado="12px"
      padding="12px"
      gap={8}
      maxAltura={240}
      scroll={true}
      fuenteEncabezado={{ fontSize: "13px" }}
      fuenteFila={{ fontSize: "13px" }}
      backendError={backendError}
      style={{ width: "100%" }}
    />
  )

  return (
    <App
      initialView="listado"
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
      notFoundTitle="Sin vista"
      notFoundBody="Selecciona una vista disponible"
    />
  )
}
