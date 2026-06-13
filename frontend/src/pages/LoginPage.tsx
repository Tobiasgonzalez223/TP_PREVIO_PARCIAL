import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = React.useState('')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
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
        namePlaceholder="Nombre completo"
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
        titleFont={{ fontSize: '24px', fontWeight: 700 }}
        labelFont={{ fontSize: '14px' }}
        inputFont={{ fontSize: '14px' }}
        helperFont={{ fontSize: '13px' }}
        errorFont={{ fontSize: '14px' }}
        buttonFont={{ fontSize: '15px' }}
        onSubmit={() => {}}
        onSuccess={async (payload: any) => {
          setError('')
          try {
            if (payload.mode === 'register') {
              await register({ nombre: payload.name, email: payload.email, password: payload.password })
            }
            await login(payload.email, payload.password)
            navigate('/ordenes')
          } catch (e: any) {
            setError(e?.response?.data?.error || e?.message || 'Error al autenticar')
          }
        }}
        onError={(msg: string) => setError(msg)}
        externalError={error}
      />
    </div>
  )
}
