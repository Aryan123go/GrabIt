import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Logout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    let active = true

    logout().finally(() => {
      if (active) navigate('/login', { replace: true })
    })

    return () => {
      active = false
    }
  }, [logout, navigate])

  return <main className="route-state">Signing you out...</main>
}

export default Logout