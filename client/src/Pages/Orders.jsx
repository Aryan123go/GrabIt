import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios.js'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axiosInstance.get('/orders')
      setOrders(response.data.orders || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  return (
    <main className="shop-home">
      <section className="orders-content">
        <div className="home-heading">
          <p className="eyebrow">YOUR PURCHASES</p>
          <h1>My orders<span>.</span></h1>
          <p>Order history and delivery details, all in one place.</p>
        </div>

        {loading && <div className="orders-state" role="status">Loading your orders...</div>}

        {!loading && error && (
          <div className="orders-state orders-state-error" role="alert">
            <p>{error}</p>
            <button type="button" className="button button-dark" onClick={loadOrders}>Try again</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="wishlist-empty orders-empty">
            <span className="wishlist-empty-icon" aria-hidden="true">↗</span>
            <h2>You have not placed any orders yet.</h2>
            <p>Find something you love and your orders will show up here.</p>
            <Link className="button button-accent" to="/products">Start shopping <span aria-hidden="true">→</span></Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-heading">
                  <div>
                    <p className="eyebrow">ORDER PLACED {formatDate(order.createdAt)}</p>
                    <h2>Order #{order._id}</h2>
                  </div>
                  <span className={`order-status order-status-${order.status.toLowerCase()}`}>
                    {order.status.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="order-card-items">
                  {order.items.map((item, index) => (
                    <p key={`${item.product}-${index}`}>
                      {item.name} <span>× {item.quantity}</span>
                    </p>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span>Total <strong>{formatPrice(order.totalAmount)}</strong></span>
                  <span>Payment <strong>{order.paymentStatus}</strong></span>
                  <Link className="button button-dark" to={`/orders/${order._id}`}>
                    View details <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Orders
