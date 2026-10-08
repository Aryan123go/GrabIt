import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: ''
}

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true)
    return
  }

  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload = () => resolve(true)
  script.onerror = () => resolve(false)
  document.body.appendChild(script)
})

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function validateAddress(address) {
  const errors = {}
  Object.entries(address).forEach(([field, value]) => {
    if (!String(value).trim()) {
      errors[field] = 'This field is required.'
    }
  })

  const phoneDigits = address.phone.replace(/\D/g, '')
  if (address.phone && (!/^\+?[0-9\s()-]{10,16}$/.test(address.phone) || phoneDigits.length < 10 || phoneDigits.length > 15)) {
    errors.phone = 'Enter a valid phone number.'
  }

  if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
    errors.pincode = 'Pincode must contain 6 digits.'
  }

  return errors
}

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, cartLoading, cartError, subtotal, refreshCart } = useCart()
  const [address, setAddress] = useState(emptyAddress)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    const savedAddress = user.shippingAddress || {}
    setAddress({
      fullName: user.fullName || '',
      phone: user.phone || '',
      addressLine1: savedAddress.addressLine1 || savedAddress.street || '',
      city: savedAddress.city || '',
      state: savedAddress.state || '',
      pincode: savedAddress.pincode || savedAddress.postalCode || ''
    })
  }, [user])

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [cartItems.length, cartLoading, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setAddress((currentAddress) => ({ ...currentAddress, [name]: value }))
    setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateAddress(address)
    setFieldErrors(validationErrors)
    setError('')

    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the highlighted fields before continuing.')
      return
    }

    setSubmitting(true)

    try {
      const ready = await loadRazorpay()
      if (!ready) {
        setError('Razorpay Checkout could not be loaded. Please check your connection and try again.')
        setSubmitting(false)
        return
      }

      const response = await axiosInstance.post('/orders/create-payment-order', {
        shippingAddress: Object.fromEntries(
          Object.entries(address).map(([field, value]) => [field, String(value).trim()])
        )
      })

      const paymentOrder = response.data

      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'GrabIt',
        description: 'Order payment',
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: user?.email || '',
          contact: address.phone
        },
        notes: { orderId: paymentOrder.orderId },
        theme: { color: '#827148' },
        handler: async (payment) => {
          try {
            await axiosInstance.post('/orders/verify-payment', {
              orderId: paymentOrder.orderId,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature
            })
            await refreshCart()
            navigate(`/orders/${paymentOrder.orderId}`, { replace: true })
          } catch (verificationError) {
            setError(verificationError.response?.data?.message || 'Payment verification failed. Your cart has not been cleared.')
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false)
        }
      })

      checkout.on('payment.failed', (payment) => {
        setError(payment.error?.description || 'Payment was not completed. Your cart is unchanged.')
        setSubmitting(false)
      })

      checkout.open()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to start checkout. Please try again.')
      setSubmitting(false)
    }
  }

  if (cartLoading) {
    return <main className="catalog-page route-state">Loading checkout...</main>
  }

  if (cartError) {
    return (
      <main className="catalog-page route-state">
        <div role="alert">{cartError} <button type="button" className="catalog-retry" onClick={refreshCart}>Try again</button></div>
      </main>
    )
  }

  if (!cartItems.length) {
    return <main className="catalog-page route-state">Returning to your cart...</main>
  }

  return (
    <main className="shop-home">
      <section className="checkout-content">
        <div className="home-heading">
          <p className="eyebrow">SECURE CHECKOUT</p>
          <h1>Delivery details<span>.</span></h1>
          <p>Confirm where your GrabIt order should be delivered.</p>
        </div>

        {error && <div className="checkout-error" role="alert">{error}</div>}

        <div className="checkout-layout">
          <form className="checkout-card" onSubmit={handleSubmit} noValidate>
            <div className="card-label"><span className="card-number">01</span> SHIPPING DETAILS</div>
            <div className="checkout-fields">
              <label className="checkout-field-wide">
                Full Name
                <input name="fullName" value={address.fullName} onChange={handleChange} aria-invalid={Boolean(fieldErrors.fullName)} />
                {fieldErrors.fullName && <small>{fieldErrors.fullName}</small>}
              </label>

              <label>
                Phone
                <input name="phone" value={address.phone} onChange={handleChange} aria-invalid={Boolean(fieldErrors.phone)} />
                {fieldErrors.phone && <small>{fieldErrors.phone}</small>}
              </label>

              <label className="checkout-field-wide">
                Address
                <input name="addressLine1" value={address.addressLine1} onChange={handleChange} aria-invalid={Boolean(fieldErrors.addressLine1)} />
                {fieldErrors.addressLine1 && <small>{fieldErrors.addressLine1}</small>}
              </label>

              <label>
                City
                <input name="city" value={address.city} onChange={handleChange} aria-invalid={Boolean(fieldErrors.city)} />
                {fieldErrors.city && <small>{fieldErrors.city}</small>}
              </label>

              <label>
                State
                <input name="state" value={address.state} onChange={handleChange} aria-invalid={Boolean(fieldErrors.state)} />
                {fieldErrors.state && <small>{fieldErrors.state}</small>}
              </label>

              <label>
                Pincode
                <input name="pincode" inputMode="numeric" maxLength="6" value={address.pincode} onChange={handleChange} aria-invalid={Boolean(fieldErrors.pincode)} />
                {fieldErrors.pincode && <small>{fieldErrors.pincode}</small>}
              </label>
            </div>

            <button className="button button-accent checkout-submit" type="submit" disabled={submitting}>
              {submitting ? 'Waiting for payment...' : `Pay ${formatPrice(subtotal)}`}
            </button>
            <p className="checkout-note">You will complete payment securely in Razorpay Test Mode. Your cart is cleared only after payment verification.</p>
          </form>

          <aside className="checkout-card checkout-summary">
            <div className="card-label"><span className="card-number">02</span> ORDER SUMMARY</div>
            <div className="checkout-summary-items">
              {cartItems.map((item) => item.product && (
                <div className="checkout-summary-item" key={item.product._id}>
                  <span>{item.product.name} <small>× {item.quantity}</small></span>
                  <strong>{formatPrice(Number(item.product.price) * Number(item.quantity))}</strong>
                </div>
              ))}
            </div>
            <div className="checkout-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default Checkout
