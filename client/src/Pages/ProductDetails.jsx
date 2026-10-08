import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct } from '../axiosCalls/productApi.js'
import { useCart } from '../context/CartContext.jsx'
import ProductImage from '../components/ProductImage.jsx'

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`
}

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [actionError, setActionError] = useState('')
  const { addToCart, cartItems } = useCart()

  useEffect(() => {
    let mounted = true
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError('')
        const result = await fetchProduct(id)
        if (mounted) setProduct(result)
      } catch (requestError) {
        if (mounted) setError(requestError.response?.status === 404 ? 'Product not found.' : 'Something went wrong while loading this product.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProduct()
    return () => { mounted = false }
  }, [id])

  const cartQuantity = cartItems.find((item) => item.product?._id === product?._id)?.quantity || 0

  const handleAddToCart = async () => {
    if (!product || adding) return
    setAdding(true)
    setActionError('')
    try {
      await addToCart(product._id)
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to add this product to your cart.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <main className="catalog-page route-state">Loading product...</main>
  if (error) return <main className="catalog-page catalog-state catalog-error"><span>{error}</span><Link className="text-link" to="/products">Back to products</Link></main>

  return (
    <main className="catalog-page shop-home">
      <section className="product-detail-content">
        <Link className="text-link" to="/products">← All products</Link>
        <div className="product-detail-layout">
          <div className="product-detail-image"><ProductImage src={product.image} alt={product.name} /></div>
          <div className="product-detail-copy"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="product-detail-price">{formatPrice(product.price)}</p><p className="product-detail-description">{product.description}</p><p className="product-stock">{product.stock > 0 ? `${product.stock} units available` : 'Currently out of stock'}</p><button className="button button-accent" type="button" disabled={product.stock === 0 || adding || cartQuantity >= product.stock} onClick={handleAddToCart}>{adding ? 'Adding...' : cartQuantity >= product.stock ? 'Stock limit reached' : cartQuantity ? `Add another (${cartQuantity})` : 'Add to cart'} <span aria-hidden="true">→</span></button>{actionError && <p className="wishlist-feedback wishlist-feedback-error" role="alert">{actionError}</p>}</div>
        </div>
      </section>
    </main>
  )
}

export default ProductDetails
