import * as React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

import LoginForm from './components/LoginForm'
import HistorialOrden from './components/HistorialOrden'
import FiltroOrdenes from './components/FiltroOrdenes'
import ResumenPanel from './components/ResumenPanel'
import OrdenList from './components/OrdenList'
import OrdenForm from './components/OrdenForm'
import OrdenDetail from './components/OrdenDetail'
import TablaOrdenes from './components/TablaOrdenes'
import AccionesPorRol from './components/AccionesPorRol'

const loginProps = {
  title: 'Iniciar sesión',
  helperText: 'Accede para gestionar órdenes de mantenimiento.',
  emailLabel: 'Email',
  passwordLabel: 'Contraseña',
  emailPlaceholder: 'tu@empresa.com',
  passwordPlaceholder: '••••••••',
  buttonLabel: 'Entrar',
  enableRegister: true,
  onSubmit: () => console.log('Login submit'),
  style: { width: '100%', maxWidth: '480px' },
}

const historialProps = {
  registros: [],
  mostrarEncabezados: true,
  encabezados: {},
  separadorColor: '#E5E7EB',
  fondoColor: '#FFFFFF',
  textoColor: '#111827',
  encabezadoFondo: '#F3F4F6',
  encabezadoTexto: '#111827',
  bordeRedondeado: '12px',
  padding: '12px',
  gap: 8,
  maxAltura: 240,
  scroll: true,
}

const ordenListProps = {
  data: [],
  showFilters: true,
  showPagination: true,
  defaultPageSize: 5,
  backgroundColor: '#FFFFFF',
  headerBackgroundColor: '#F3F4F6',
  borderColor: '#E5E7EB',
  textColor: '#111827',
  mutedTextColor: '#9CA3AF',
  rowHoverColor: '#F9FAFB',
  headerFont: { fontSize: '13px', fontWeight: 600 },
  cellFont: { fontSize: '14px' },
}

const rootEl = document.getElementById('root') as HTMLElement

createRoot(rootEl).render(
  <StrictMode>
    <App
      initialView="login"
      loginView={React.createElement(LoginForm as any, loginProps) as any}
      ordenListView={React.createElement(OrdenList as any, ordenListProps) as any}
      ordenDetailView={React.createElement(OrdenDetail as any, { titulo: "Detalle", orden: { activo: 'A', solicitante: 'User', tecnico: 'T', prioridad: 'Media', estado: 'Abierta', fechaCreacion: new Date().toISOString(), fechaActualizacion: new Date().toISOString(), fechaVencimiento: '' }, historial: [], tecnicosDisponibles: ['Ana','Luis'], asignarModalTitulo: 'Asignar', asignarModalPlaceholder: 'Selecciona', asignarModalConfirmarLabel: 'Asignar', asignarModalCancelarLabel: 'Cerrar', backgroundColor: '#FFFFFF', surfaceColor: '#F9FAFB', borderColor: '#E5E7EB', textColor: '#111827', mutedTextColor: '#9CA3AF', accentColor: '#0066FF', dangerColor: '#DC2626', titleFont: { fontSize: '18px' }, labelFont: { fontSize: '13px' }, valueFont: { fontSize: '14px' }, buttonFont: { fontSize: '14px' }, radius: 10, padding: 12, gap: 12, maxHistoryHeight: 240, showHistory: true, asignarLabel: 'Asignar', cancelarLabel: 'Cancelar', resolverLabel: 'Resolver', onAsignar: () => {}, onCancelar: () => {}, onResolver: () => {} }) as any}
      ordenFormView={React.createElement(OrdenForm as any, { activoLabel: 'Activo', activoPlaceholder: 'Activo', tituloLabel: 'Título', tituloPlaceholder: 'Titulo', descripcionLabel: 'Descripción', descripcionPlaceholder: 'Descripción', prioridadLabel: 'Prioridad', prioridades: ['Alta','Media','Baja'], prioridadInicial: 'Media', tecnicoLabel: 'Técnico', tecnicos: ['Ana','Luis'], tecnicoInicial: 'Ana', confirmarLabel: 'Crear', resetOnConfirm: true, showDebug: false, backgroundColor: '#FFFFFF', textColor: '#111827', subtleBackgroundColor: '#F9FAFB', borderColor: '#E5E7EB', buttonColor: '#111827', buttonTextColor: '#FFFFFF', labelFont: { fontSize: '13px' }, inputFont: { fontSize: '14px' }, buttonFont: { fontSize: '14px' }, radius: 10, padding: '12px', gap: 12, onConfirm: () => {} }) as any}
      resumenView={React.createElement(ResumenPanel as any, { titulo: 'Resumen', showTitle: true, estados: [{ estado: 'Abiertas', cantidad: 12, color: '#0066FF' }], urgentes: 3, sinTecnico: 1, activos: [{ activo: 'Compresor', fallas: 4 }], backgroundColor: '#FFFFFF', cardBackgroundColor: '#F9FAFB', borderColor: '#E5E7EB', textColor: '#111827', mutedTextColor: '#9CA3AF', titleFont: { fontSize: '20px' }, labelFont: { fontSize: '13px' }, numberFont: { fontSize: '24px' }, radius: '12px', padding: '16px', gap: 12 }) as any}
      historialView={React.createElement(HistorialOrden as any, historialProps) as any}
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
    />
  </StrictMode>,
)
