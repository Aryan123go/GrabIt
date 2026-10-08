import express from 'express'
import {registerCustomer, loginCustomer, getMe, updateCustomerProfile, logoutCustomer} from '../controllers/customer.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'


const customerRoutes = express.Router()

customerRoutes.post('/register', registerCustomer)
customerRoutes.post('/login', loginCustomer)
customerRoutes.get('/me', isAuthenticated, getMe)
customerRoutes.put('/profile', isAuthenticated, updateCustomerProfile)
customerRoutes.post('/logout', logoutCustomer)

export default customerRoutes