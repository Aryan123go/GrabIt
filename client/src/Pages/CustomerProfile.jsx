import { useEffect, useState } from 'react'
import { axiosInstance } from '../axiosCalls/axios.js'
import StatusMessage from '../components/StatusMessage.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const emptyAddress = { street: '', city: '', postalCode: '', country: '' }

function CustomerProfile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', ...emptyAddress })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      try {
        const response = await axiosInstance.get('/customer/me')
        if (!mounted) return
        const customer = response.data.authenticatedCustomer
        const shippingAddress = customer.shippingAddress
          ? { ...emptyAddress, ...customer.shippingAddress }
          : emptyAddress
        setUser(customer)
        setForm({ fullName: customer.fullName || '', email: customer.email || '', phone: customer.phone || '', ...shippingAddress })
      } catch (requestError) {
        if (mounted) setError(requestError.response?.data?.message || 'Unable to load your profile.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadProfile()
    return () => { mounted = false }
  }, [setUser])

  const handleChange = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))
    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await axiosInstance.put('/customer/profile', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        shippingAddress: { street: form.street, city: form.city, postalCode: form.postalCode, country: form.country }
      })
      setUser(response.data.customer)
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="profile-page route-state">Loading your profile...</main>

  return (
    <main className="profile-page shop-home">
      <section className="profile-content">
        <div className="home-heading"><p className="eyebrow">ACCOUNT SETTINGS</p><h1>Your profile<span>.</span></h1><p>Keep your contact and delivery details ready for your next order.</p></div>
        <StatusMessage message={error} />
        {message && <output className="profile-success">✓ {message}</output>}
        <form className="profile-layout" onSubmit={handleSubmit}>
          <section className="profile-card profile-identity">
            <div className="card-label"><span className="card-number">01</span> CUSTOMER PROFILE</div>
            <div className="profile-avatar-large">{user?.fullName?.charAt(0)?.toUpperCase() || 'N'}</div>
            <p className="profile-email">{user?.email}</p>
          </section>
          <section className="profile-card profile-form-card">
            <div className="card-label"><span className="card-number">02</span> PERSONAL DETAILS</div>
            <div className="profile-fields"><label>Full name<input name="fullName" value={form.fullName} onChange={handleChange} required /></label><label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label><label>Phone<input name="phone" type="tel" value={form.phone} onChange={handleChange} required /></label></div>
            <div className="card-label address-label"><span className="card-number">03</span> DEFAULT DELIVERY ADDRESS</div>
            <div className="profile-fields address-fields"><label className="field-wide">Street address<input name="street" value={form.street} onChange={handleChange} placeholder="Apartment, building and street" /></label><label>City<input name="city" value={form.city} onChange={handleChange} /></label><label>Postal code<input name="postalCode" value={form.postalCode} onChange={handleChange} /></label><label>Country<input name="country" value={form.country} onChange={handleChange} /></label></div>
            <button className="button button-accent profile-save" type="submit" disabled={saving}>{saving ? 'Saving changes...' : 'Save profile'}</button>
          </section>
        </form>
      </section>
    </main>
  )
}

export default CustomerProfile
