import { Link } from 'react-router-dom'

function Landing() {
  return (
    <main className="landing-page shop-landing">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="GrabIt home">
          <span className="brand-mark">G</span>
          <span>GrabIt</span>
        </Link>
        <div className="market-search" role="search">
          <span aria-hidden="true">⌕</span>
          <span>Search products, brands and more</span>
        </div>
        <div className="nav-actions">
          <Link className="nav-link cart-link" to="/login"><span aria-hidden="true">▱</span> Cart</Link>
          <Link className="nav-link" to="/orders">Orders</Link>
          <Link className="nav-link" to="/login">Log in</Link>
          <Link className="button button-accent" to="/signup">Sign up</Link>
        </div>
      </nav>

      <div className="category-bar" aria-label="Shop categories">
        <span>All categories</span><span>Electronics</span><span>Home & kitchen</span><span>Fashion</span><span>Beauty</span><span>Grocery</span><span>Today's deals</span>
      </div>

      <section className="landing-hero shop-hero">
        <div className="hero-copy">
          <p className="eyebrow">THE EVERYDAY MARKETPLACE</p>
          <h1>Good things, delivered to your door.</h1>
          <p className="hero-description">
            Discover products you will love, compare what matters, and shop with confidence from one simple place.
          </p>
          <div className="hero-actions">
            <Link className="button button-accent" to="/signup">Start shopping <span aria-hidden="true">→</span></Link>
            <Link className="text-link" to="/login">Track an order</Link>
          </div>
        </div>

        <div className="hero-panel product-hero-panel" aria-label="Featured shopping deal">
          <div className="panel-topline"><span>WEEKEND EDIT</span><span className="live-dot">● IN STOCK</span></div>
          <div className="product-art product-art-large"><span>HOME</span><strong>01</strong></div>
          <div className="product-hero-info"><div><p>Soft forms for slow mornings</p><strong>From $24.00</strong></div><span className="round-arrow" aria-hidden="true">↗</span></div>
          <div className="panel-stat-row">
            <div><strong>24h</strong><span>Dispatch</span></div>
            <div><strong>4.9</strong><span>Rating</span></div>
            <div><strong>Free</strong><span>Returns</span></div>
          </div>
        </div>
      </section>

      <section className="landing-footnote shop-feature-row">
        <div><span>01</span><p>Fast, reliable delivery</p></div>
        <div><span>02</span><p>Secure payments, always</p></div>
        <div><span>03</span><p>Easy returns within 30 days</p></div>
      </section>
    </main>
  )
}

export default Landing
