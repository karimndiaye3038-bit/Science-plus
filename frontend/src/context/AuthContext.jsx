import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { send } from '../services/api'

const AuthContext = createContext(null)

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('coursplus_user')) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)

  const saveSession = data => {
    localStorage.setItem('coursplus_token', data.token)
    localStorage.setItem('coursplus_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const login = async (email, password) => saveSession(await send('/auth/login', { email, password }))
  const register = async (name, email, password) =>
    saveSession(await send('/auth/register', { name, email, password }))

  const logout = useCallback(() => {
    localStorage.removeItem('coursplus_token')
    localStorage.removeItem('coursplus_user')
    setUser(null)
  }, [])

  const updateUser = next => {
    localStorage.setItem('coursplus_user', JSON.stringify(next))
    setUser(next)
  }

  // Déconnexion automatique quand l'API répond 401 (session expirée)
  useEffect(() => {
    window.addEventListener('coursplus:logout', logout)
    return () => window.removeEventListener('coursplus:logout', logout)
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

