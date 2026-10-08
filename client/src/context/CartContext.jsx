import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { addCartProduct, fetchCart, removeCartProduct, updateCartProductQuantity } from '../axiosCalls/cartApi.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([])
      setCartLoading(false)
      setCartError('')
      return
    }

    try {
      setCartLoading(true)
      setCartError('')
      const response = await fetchCart()
      setCartItems(response.cart || [])
    } catch {
      setCartItems([])
      setCartError('Unable to load your cart. Please try again.')
    } finally {
      setCartLoading(false)
    }
  }, [user])

  const addToCart = useCallback(async (productId) => {
    const response = await addCartProduct(productId)
    setCartItems(response.cart || [])
    setCartError('')
    return response
  }, [])

  const updateQuantity = useCallback(async (productId, quantity) => {
    const response = await updateCartProductQuantity(productId, quantity)
    setCartItems(response.cart || [])
    setCartError('')
    return response
  }, [])

  const removeFromCart = useCallback(async (productId) => {
    const response = await removeCartProduct(productId)
    setCartItems(response.cart || [])
    setCartError('')
    return response
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setCartItems([])
      setCartLoading(false)
      setCartError('')
      return
    }
    refreshCart()
  }, [authLoading, refreshCart, user])

  const cartCount = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0)
  const subtotal = cartItems.reduce((total, item) => total + Number(item.product?.price || 0) * Number(item.quantity || 0), 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      cartLoading,
      cartError,
      cartCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}