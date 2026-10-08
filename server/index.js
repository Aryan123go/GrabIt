import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createCorsOptions } from './config/cors.js'

import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'

import dns from 'dns'
dns.setServers([
  '8.8.8.8',
  '[2001:4860:4860::8888]',
  '8.8.8.8:1053',
  '[2001:4860:4860::8888]:1053',
]);


dotenv.config()

const app = express()
const port = process.env.PORT || 8084

if (!process.env.dbURL) {
    throw new Error('Missing dbURL in server/.env')
}

app.use(cors(createCorsOptions()))
app.use(cookieParser())
app.use(express.json())

app.use('/customer', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

app.get('/', (req, res) => {
    res.send('Server is running')
})

const connectToDatabase = async () => {
    try {
        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
            return
        }

        await mongoose.connect(process.env.dbURL, {
            serverSelectionTimeoutMS: 5000,
        })
        console.log('DB Connected')
    } catch (err) {
        console.error(`Database connection failed: ${err.message}`)
        if (mongoose.connection.readyState !== 1) {
            console.log('Retrying database connection in 5 seconds...')
            setTimeout(connectToDatabase, 5000)
        }
    }
}

app.listen(port, () => {
    console.log(`Server Started at ${port}`)
    connectToDatabase()
})