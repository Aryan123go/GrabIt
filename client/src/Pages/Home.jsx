import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Home() {
  const { user } = useAuth()

  return (
    <main className="home-page shop-home">
      <section className="home-content">
        <div className="home-heading">
          <p className="eyebrow">YOUR SHOPPING SPACE</p>
          <h1>Welcome back, <span>{user?.fullName?.split(' ')[0] || 'shopper'}.</span></h1>
          <p>Pick up where you left off or find something new for your home.</p>
        </div>

        <div className="shop-discovery-banner"><div><p className="eyebrow">REAL PRODUCTS, READY TO DISCOVER</p><h2>Browse the full catalogue.</h2><p>Search, filter, and find the right thing for your everyday.</p></div><Link className="button button-accent" to="/products">Explore products <span aria-hidden="true">→</span></Link></div>

        <div className="shop-toolbar"><strong>Recommended for you</strong><button type="button">Sort by: Featured <span aria-hidden="true">⌄</span></button></div>
        <div className="product-grid">
          <article className="product-card"><div className="product-art product-art-sage"><span>HOME</span><strong>01</strong></div><div className="product-meta"><p>Everyday ceramic set</p><strong>$32.00</strong><span>★★★★★ <small>(24)</small></span></div></article>
          <article className="product-card"><div className="product-art product-art-peach"><span>TECH</span><strong>02</strong></div><div className="product-meta"><p>Desk speaker, warm sound</p><strong>$58.00</strong><span>★★★★★ <small>(18)</small></span></div></article>
          <article className="product-card"><div className="product-art product-art-yellow"><span>STYLE</span><strong>03</strong></div><div className="product-meta"><p>Canvas daily carry</p><strong>$46.00</strong><span>★★★★☆ <small>(31)</small></span></div></article>
          <article className="product-card"><div className="product-art product-art-blue"><span>HOME</span><strong>04</strong></div><div className="product-meta"><p>Soft linen throw</p><strong>$39.00</strong><span>★★★★★ <small>(12)</small></span></div></article>
        </div>

        <div className="account-grid shop-account-grid">
          <article className="account-card account-card-primary">
            <div className="card-label"><span className="card-number">01</span> ACCOUNT</div>
            <div className="profile-row"><span className="profile-avatar">{user?.fullName?.charAt(0)?.toUpperCase() || 'G'}</span><div><h2>{user?.fullName || 'GrabIt customer'}</h2><p>{user?.email || 'No email available'}</p></div></div>
            <div className="card-detail"><span>Phone</span><strong>{user?.phone || 'Not provided'}</strong></div>
          </article>
          <article className="account-card account-card-secondary">
            <div className="card-label"><span className="card-number">02</span> ORDER SUPPORT</div>
            <div className="status-icon" aria-hidden="true">↗</div>
            <h2>Need help with an order?</h2>
            <p>Our support team is ready to help with delivery, returns, or anything else.</p>
            <Link className="text-link" to="/orders">View your orders <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Home
