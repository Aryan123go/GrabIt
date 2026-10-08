import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { fetchProducts } from '../axiosCalls/productApi.js'
import { fetchWishlist } from '../axiosCalls/wishlistApi.js'

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [sort, setSort] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wishlistedIds, setWishlistedIds] = useState([])

  useEffect(() => {
    let active = true
    fetchWishlist()
      .then((response) => {
        if (active) setWishlistedIds((response.wishlist || []).map((product) => product._id))
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchProducts({ search: debouncedSearch, category, sort })
      setProducts(response.products || [])
    } catch {
      setError('Something went wrong while loading products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [debouncedSearch, category, sort])

  const resetFilters = () => {
    setSearch('')
    setCategory('All Categories')
    setSort('')
  }

  return (
    <main className="catalog-page shop-home">
      <section className="catalog-content">
        <div className="home-heading"><p className="eyebrow">THE GRABIT CATALOGUE</p><h1>Find your next <span>favourite.</span></h1><p>Browse real products from the catalogue, then open any item for the full story.</p></div>
        <SearchBar search={search} setSearch={setSearch} category={category} setCategory={setCategory} sort={sort} setSort={setSort} onReset={resetFilters} />
        {loading && <div className="catalog-state">Loading products...</div>}
        {!loading && error && <div className="catalog-state catalog-error"><span>{error}</span><button type="button" className="catalog-retry" onClick={loadProducts}>Retry request</button></div>}
        {!loading && !error && products.length === 0 && <div className="catalog-state"><span>No products found.</span><button type="button" className="catalog-reset" onClick={resetFilters}>Clear all filters</button></div>}
        {!loading && !error && products.length > 0 && <div className="catalog-grid">{products.map((product) => <ProductCard key={product._id} product={product} isWishlisted={wishlistedIds.includes(product._id)} onWishlistChange={(productId, saved) => setWishlistedIds((current) => saved ? [...new Set([...current, productId])] : current.filter((id) => id !== productId))} />)}</div>}
      </section>
    </main>
  )
}

export default Products
