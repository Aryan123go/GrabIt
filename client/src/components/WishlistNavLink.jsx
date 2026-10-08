import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchWishlistCount } from '../axiosCalls/wishlistApi.js'

function WishlistNavLink({ isActive = false }) {
  const [count, setCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    let active = true

    const loadCount = async () => {
      try {
        const nextCount = await fetchWishlistCount()
        if (active) setCount(nextCount)
      } catch {
        if (active) setCount(0)
      }
    }

    loadCount()
    window.addEventListener('wishlist-updated', loadCount)
    return () => {
      active = false
      window.removeEventListener('wishlist-updated', loadCount)
    }
  }, [location.pathname])

  return (
    <Link
      className={`nav-link${isActive ? ' nav-link-active' : ''}`}
      to="/wishlist"
      aria-current={isActive ? 'page' : undefined}
    >
      Wishlist ({count})
    </Link>
  )
}

export default WishlistNavLink