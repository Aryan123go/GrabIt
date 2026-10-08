import express from 'express'
import { addToCart, getCart, removeFromCart, updateCartItemQuantity } from '../controllers/cart.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'

const cartRoutes = express.Router()

cartRoutes.use(isAuthenticated)
cartRoutes.get('/', getCart)
cartRoutes.post('/:productId', addToCart)
cartRoutes.patch('/:productId', updateCartItemQuantity)
cartRoutes.delete('/:productId', removeFromCart)

export default cartRoutes