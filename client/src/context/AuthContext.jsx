import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../axiosCalls/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/customer/logout')
    } catch {
    } finally {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/customer/me')
        setUser(response.data.authenticatedCustomer)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
