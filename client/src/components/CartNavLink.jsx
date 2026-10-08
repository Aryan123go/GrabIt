import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function CartNavLink({ isActive = false }) {
  const { cartCount } = useCart()
  return (
    <Link
      className={`nav-link cart-link${isActive ? ' nav-link-active' : ''}`}
      to="/cart"
      aria-current={isActive ? 'page' : undefined}
    >
      Cart ({cartCount})
    </Link>
  )
}

export default CartNavLink