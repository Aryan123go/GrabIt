import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWishlist, notifyWishlistUpdated, removeWishlistProduct } from '../axiosCalls/wishlistApi.js'
import ProductImage from '../components/ProductImage.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function Wishlist() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [removingId, setRemovingId] = useState('')

  const loadWishlist = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchWishlist()
      setProducts(response.wishlist || [])
    } catch {
      setError("We couldn't load your wishlist. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [])

  const handleRemove = async (productId) => {
    setRemovingId(productId)
    setActionError('')

    try {
      await removeWishlistProduct(productId)
      setProducts((currentProducts) => currentProducts.filter((product) => product._id !== productId))
      notifyWishlistUpdated()
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to remove this product. Please try again.')
    } finally {
      setRemovingId('')
    }
  }

  return (
    <main className="wishlist-page shop-home">
      <section className="wishlist-content">
        <div className="home-heading"><p className="eyebrow">SAVED FOR LATER</p><h1>Your wishlist<span>.</span></h1><p>{products.length} {products.length === 1 ? 'product' : 'products'} saved for when you’re ready.</p></div>

        {loading && <output className="wishlist-state">Loading your wishlist...</output>}
        {!loading && error && <div className="wishlist-state wishlist-state-error" role="alert"><p>{error}</p><button className="button button-dark" type="button" onClick={loadWishlist}>Try again</button></div>}
        {!loading && !error && products.length === 0 && <div className="wishlist-empty"><span className="wishlist-empty-icon" aria-hidden="true">♡</span><h2>Your wishlist is empty</h2><p>Save products you love and find them here later.</p><Link className="button button-accent" to="/products">Browse products <span aria-hidden="true">→</span></Link></div>}
        {!loading && !error && actionError && <p className="wishlist-feedback wishlist-feedback-error" role="alert">{actionError}</p>}
        {!loading && !error && products.length > 0 && <div className="wishlist-grid">{products.map((product) => (
          <article className="wishlist-card" key={product._id}>
            <Link className="wishlist-image-wrap" to={`/products/${product._id}`}><ProductImage src={product.image} alt={product.name} /></Link>
            <div className="wishlist-card-content">
              <p className="catalog-product-category">{product.category}</p>
              <h2>{product.name}</h2>
              <div className="catalog-product-footer"><strong>{formatPrice(product.price)}</strong><span>{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</span></div>
              <Link className="button button-dark catalog-details-button" to={`/products/${product._id}`}>View details <span aria-hidden="true">→</span></Link>
              <button className="wishlist-action wishlist-action-saved" type="button" onClick={() => handleRemove(product._id)} disabled={removingId === product._id}>
                {removingId === product._id ? 'Removing...' : '♥ Remove from Wishlist'}
              </button>
            </div>
          </article>
        ))}</div>}
      </section>
    </main>
  )
}

export default Wishlist