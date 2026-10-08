import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'
import ProductImage from '../components/ProductImage.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadOrder = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${id}`)
        if (mounted) setOrder(response.data.order)
      } catch (requestError) {
        if (mounted) setError(requestError.response?.data?.message || 'Unable to load this order.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadOrder()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return <main className="catalog-page route-state">Loading your order...</main>
  }

  return (
    <main className="shop-home">
      <section className="order-details-content">
        {error ? (
          <div className="orders-state orders-state-error" role="alert">
            <p>{error}</p>
            <Link className="button button-dark" to="/orders">Back to my orders</Link>
          </div>
        ) : order && (
          <>
            <div className="home-heading">
              <p className="eyebrow">{order.paymentStatus === 'PAID' ? 'PAYMENT CONFIRMED' : 'ORDER STATUS'}</p>
              <h1>{order.paymentStatus === 'PAID' ? 'Thank you for your order' : 'Order details'}<span>.</span></h1>
              <p>{order.paymentStatus === 'PAID' ? 'Your order has been saved successfully.' : 'This order is not marked as paid yet.'}</p>
            </div>

            <article className="order-details-card">
              <div className="order-card-heading">
                <div>
                  <p className="eyebrow">ORDER ID</p>
                  <h2>#{order._id}</h2>
                </div>
                <span className={`order-status order-status-${order.status.toLowerCase()}`}>
                  {order.status.replaceAll('_', ' ')}
                </span>
              </div>

              <div className="order-detail-items">
                {order.items.map((item, index) => (
                  <div className="order-detail-item" key={`${item.product}-${index}`}>
                    {item.image && <ProductImage src={item.image} alt={item.name} />}
                    <div>
                      <strong>{item.name}</strong>
                      <span>Qty {item.quantity} × {formatPrice(item.price)}</span>
                    </div>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div className="order-detail-total">
                <span>{order.paymentStatus === 'PAID' ? 'Total paid' : 'Order total'}</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>

              <div className="order-shipping">
                <p className="eyebrow">DELIVERING TO</p>
                <strong>{order.shippingAddress.fullName}</strong>
                <span>{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</span>
                <span>{order.shippingAddress.phone}</span>
              </div>

              <p className="order-payment-line">
                Payment status: <strong>{order.paymentStatus}</strong> · Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </article>

            <div className="order-detail-actions">
              <Link className="button button-dark" to="/orders">View my orders</Link>
              <Link className="button button-accent" to="/products">Continue shopping</Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default OrderDetails
