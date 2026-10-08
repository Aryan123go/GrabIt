import { Link, Outlet, useLocation } from 'react-router-dom'
import CartNavLink from './CartNavLink.jsx'
import WishlistNavLink from './WishlistNavLink.jsx'

function AuthenticatedLayout() {
  const { pathname } = useLocation()
  const activeSection = pathname.startsWith('/products')
    ? 'products'
    : pathname.startsWith('/orders')
      ? 'orders'
      : pathname === '/checkout' || pathname === '/cart'
        ? 'cart'
        : pathname.slice(1)

  const getNavLinkProps = (section) => ({
    className: `nav-link${activeSection === section ? ' nav-link-active' : ''}`,
    'aria-current': activeSection === section ? 'page' : undefined,
  })

  return (
    <div className="shop-home authenticated-layout">
      <nav className="site-nav home-nav" aria-label="Main navigation">
        <Link className="brand" to="/home" aria-label="GrabIt home">
          <span className="brand-mark">G</span>
          <span>GrabIt</span>
        </Link>
        <div className="nav-actions">
          <Link to="/products" {...getNavLinkProps('products')}>Products</Link>
          <WishlistNavLink isActive={activeSection === 'wishlist'} />
          <CartNavLink isActive={activeSection === 'cart'} />
          <Link to="/orders" {...getNavLinkProps('orders')}>Orders</Link>
          <Link to="/profile" {...getNavLinkProps('profile')}>Account</Link>
          <Link to="/logout" className="nav-link">Log out</Link>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

export default AuthenticatedLayout
