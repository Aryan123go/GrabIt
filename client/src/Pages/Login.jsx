import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'
import StatusMessage from '../components/StatusMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setUser } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loader, setLoader] = useState(false)
    const [err, setErr] = useState(location.state?.message || '')

    const handleChange = (event) => {
      setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
      setErr('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErr('')
        setLoader(true)
        try {
          const response = await axiosInstance.post('/customer/login', form)
          setUser(response.data.customer)
            setLoader(false)
            navigate('/home', { replace: true })
        }
        catch (error) {
            setLoader(false)
          if (error.response?.status === 404) {
            navigate('/signup', {
              state: { message: 'You are not registered yet. Please sign up first.' },
            })
            return
          }
            setErr(error.response?.data?.message || 'Unable to login. Please try again.')
        }
    }

  return (
    <div className="auth-page min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="auth-header sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="auth-brand-mark brand-mark" aria-hidden="true">G</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Log in to Your account</h2>
        <p className="mt-2 text-sm text-slate-500">Join the community and start sharing today.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="auth-card bg-white py-8 px-6 shadow-sm ring-1 ring-slate-900/5 sm:rounded-2xl sm:px-10">
          <form className="auth-form space-y-4" onSubmit={handleSubmit}>
            <StatusMessage message={err} />
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</label>
              <input id="email" name="email" type="email" placeholder="alex@example.com" value={form.email} onChange={handleChange} className="auth-input w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 text-sm transition-all duration-150 outline-none" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Password</label>
              <input id="password" name="password" type="password" placeholder="********" value={form.password} onChange={handleChange} className="auth-input w-full rounded-xl border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 text-sm transition-all duration-150 outline-none" required />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loader} className="auth-submit w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all duration-150 shadow-sm cursor-pointer">
                {loader ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>

          <p className="auth-terms mt-4 text-center text-xs text-slate-400">By signing up, you agree to our <a href="#terms" className="underline hover:text-slate-600">Terms</a> and <a href="#privacy" className="underline hover:text-slate-600">Privacy Policy</a>.</p>
        </div>

        <p className="auth-switch mt-6 text-center text-sm text-slate-500">Don't have an account? <Link to="/signup" className="font-semibold text-slate-900 hover:underline">Sign Up</Link></p>
      </div>
    </div>
  )
}

export default Login
