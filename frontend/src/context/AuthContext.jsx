import { createContext, useContext, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

const getInitialUser = () => {
  const token = localStorage.getItem('authToken')
  if (!token || !isTokenValid(token)) {
    authService.logout()
    return null
  }
  return authService.getCurrentUser()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getInitialUser())

  const login = async (email, password) => {
    const result = await authService.login({ email, password })
    setUser(result.usuario)
    return result
  }

  const register = async (data) => authService.register(data)

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthContext
