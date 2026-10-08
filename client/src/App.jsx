import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import Landing from './Pages/Landing.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import Logout from './Pages/Logout.jsx'
import CustomerProfile from './Pages/CustomerProfile.jsx'
import Products from './Pages/Products.jsx'
import ProductDetails from './Pages/ProductDetails.jsx'
import Wishlist from './Pages/Wishlist.jsx'
import Cart from './Pages/Cart.jsx'
import Checkout from './Pages/Checkout.jsx'
import Orders from './Pages/Orders.jsx'
import OrderDetails from './Pages/OrderDetails.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx'
import PublicRoute from './components/PublicRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<CustomerProfile />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
            </Route>
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
