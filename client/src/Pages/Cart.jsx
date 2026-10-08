import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import ProductImage from '../components/ProductImage.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function Cart() {
  const { cartItems, cartLoading, cartError, cartCount, subtotal, updateQuantity, removeFromCart, refreshCart } = useCart()
  const [updatingId, setUpdatingId] = useState('')
  const [actionError, setActionError] = useState('')

  const handleQuantityChange = async (productId, quantity) => {
    if (!productId || quantity < 1 || updatingId) return
    setUpdatingId(productId)
    setActionError('')
    try {
      await updateQuantity(productId, quantity)
    } catch (error) {
      setActionError(error.response?.data?.message || 'Unable to update your cart. Please try again.')
    } finally {
      setUpdatingId('')
    }
  }

  const handleRemove = async (productId) => {
    if (updatingId) return
    setUpdatingId(productId)
    setActionError('')
    try {
      await removeFromCart(productId)
    } catch (error) {
      setActionError(error.response?.data?.message || 'Unable to remove this product. Please try again.')
    } finally {
      setUpdatingId('')
    }
  }

  if (cartLoading) return <main className="catalog-page route-state">Loading your cart...</main>

  if (cartError) {
    return (
      <main className="catalog-page cart-route-state">
        <p role="alert">{cartError}</p>
        <button className="button button-dark" type="button" onClick={refreshCart}>Try again</button>
      </main>
    )
  }

  return (
    <main className="catalog-page shop-home">
      <section className="wishlist-content cart-content">
        <div className="home-heading"><p className="eyebrow">YOUR CART</p><h1>Ready to checkout<span>.</span></h1><p>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your bag.</p></div>
        {actionError && <p className="wishlist-feedback wishlist-feedback-error" role="alert">{actionError}</p>}

        {cartItems.length === 0 ? (
          <div className="wishlist-empty cart-empty">
            <span className="wishlist-empty-icon" aria-hidden="true">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link className="button button-accent" to="/products">Browse products <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-panel" aria-label="Cart items">
              {cartItems.map((item) => {
                const product = item.product
                if (!product) return null
                const isUpdating = updatingId === product._id
                const lineTotal = Number(product.price || 0) * Number(item.quantity || 0)

                return (
                  <article className="cart-item-card" key={product._id}>
                    <Link className="cart-image-wrap" to={`/products/${product._id}`}><ProductImage src={product.image} alt={product.name} /></Link>
                    <div className="cart-item-details">
                      <div><p className="catalog-product-category">{product.category}</p><h2>{product.name}</h2><p className="cart-unit-price">{formatPrice(product.price)} each</p></div>
                      <div className="cart-item-controls">
                        <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                          <button type="button" onClick={() => handleQuantityChange(product._id, Number(item.quantity) - 1)} disabled={Boolean(updatingId) || item.quantity <= 1} aria-label={`Decrease quantity of ${product.name}`}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => handleQuantityChange(product._id, Number(item.quantity) + 1)} disabled={Boolean(updatingId) || item.quantity >= product.stock} aria-label={`Increase quantity of ${product.name}`}>+</button>
                        </div>
                        <button type="button" className="wishlist-action cart-remove" onClick={() => handleRemove(product._id)} disabled={Boolean(updatingId)}>{isUpdating ? 'Updating...' : 'Remove'}</button>
                      </div>
                      <div className="cart-price-row"><strong>{formatPrice(product.price)}</strong><span>{formatPrice(lineTotal)}</span></div>
                    </div>
                  </article>
                )
              })}
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row"><span>Items</span><strong>{cartCount}</strong></div>
              <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <p className="cart-summary-note">Shipping and taxes are calculated at checkout.</p>
              <Link className="button button-accent cart-checkout-button" to="/checkout">Proceed to Checkout</Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}

export default Cart