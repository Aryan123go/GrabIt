import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Customer from '../model/customer.model.js'
import Order from '../model/order.model.js'
import Product from '../model/product.model.js'
import createRazorpayClient from '../config/razorpay.js'
import { cleanDeletedProductReferences } from '../utils/cleanDeletedProductReferences.js'

const normalizeShippingAddress = (shippingAddress) => {
    if (!shippingAddress || typeof shippingAddress !== 'object') {
        return null
    }

    const address = {
        fullName: String(shippingAddress.fullName || '').trim(),
        phone: String(shippingAddress.phone || '').trim(),
        addressLine1: String(shippingAddress.addressLine1 || '').trim(),
        city: String(shippingAddress.city || '').trim(),
        state: String(shippingAddress.state || '').trim(),
        pincode: String(shippingAddress.pincode || '').trim()
    }

    if (Object.values(address).some((value) => !value)) {
        return null
    }

    const phoneDigits = address.phone.replace(/\D/g, '')
    if (!/^\+?[0-9\s()-]{10,16}$/.test(address.phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
        return null
    }

    if (!/^\d{6}$/.test(address.pincode)) {
        return null
    }

    return address
}

const getRazorpayClient = () => createRazorpayClient()

const removePurchasedItemsFromCart = (customer, items) => {
    const purchasedQuantities = new Map()
    for (const item of items) {
        const productId = item.product.toString()
        purchasedQuantities.set(productId, (purchasedQuantities.get(productId) || 0) + item.quantity)
    }

    customer.cart = customer.cart.reduce((remainingItems, cartItem) => {
        const productId = cartItem.product.toString()
        const pendingRemoval = purchasedQuantities.get(productId) || 0
        const removedQuantity = Math.min(cartItem.quantity, pendingRemoval)
        const remainingQuantity = cartItem.quantity - removedQuantity
        purchasedQuantities.set(productId, pendingRemoval - removedQuantity)
        if (remainingQuantity > 0) {
            cartItem.quantity = remainingQuantity
            remainingItems.push(cartItem)
        }
        return remainingItems
    }, [])
}

const completePaidOrder = async (orderId, customerId, razorpayOrderId, razorpayPaymentId) => {
    const session = await mongoose.startSession()
    let verifiedOrder

    try {
        await session.withTransaction(async () => {
            const currentOrder = await Order.findOne({ _id: orderId, customer: customerId }).session(session)
            if (!currentOrder) {
                throw new Error('ORDER_NOT_FOUND')
            }
            if (currentOrder.razorpayOrderId !== razorpayOrderId) {
                throw new Error('ORDER_PAYMENT_MISMATCH')
            }
            if (currentOrder.paymentStatus === 'PAID' && currentOrder.razorpayPaymentId !== razorpayPaymentId) {
                throw new Error('PAYMENT_CONFLICT')
            }

            if (currentOrder.paymentStatus !== 'PAID') {
                const inventoryUpdate = await Product.bulkWrite(
                    currentOrder.items.map((item) => ({
                        updateOne: {
                            filter: { _id: item.product, stock: { $gte: item.quantity } },
                            update: { $inc: { stock: -item.quantity } }
                        }
                    })),
                    { session, ordered: true }
                )
                if (inventoryUpdate.modifiedCount !== currentOrder.items.length) {
                    throw new Error('ORDER_STOCK_UNAVAILABLE')
                }

                currentOrder.paymentStatus = 'PAID'
                currentOrder.status = 'PLACED'
                currentOrder.razorpayPaymentId = razorpayPaymentId
                await currentOrder.save({ session })
            }

            const customer = await Customer.findById(customerId).session(session)
            if (!customer) {
                throw new Error('CUSTOMER_NOT_FOUND')
            }
            removePurchasedItemsFromCart(customer, currentOrder.items)
            await customer.save({ session })
            verifiedOrder = currentOrder
        })

        return verifiedOrder
    } finally {
        await session.endSession()
    }
}

const paymentErrorResponses = {
    ORDER_NOT_FOUND: [404, 'Order not found.'],
    CUSTOMER_NOT_FOUND: [404, 'Customer not found'],
    ORDER_PAYMENT_MISMATCH: [400, 'Payment does not match this order.'],
    PAYMENT_CONFLICT: [409, 'This order has already been paid with a different payment.'],
    ORDER_STOCK_UNAVAILABLE: [409, 'Payment was received, but inventory changed before confirmation. Contact support with your order ID before retrying.']
}

const sendPaymentError = (error, res) => {
    const [status, message] = paymentErrorResponses[error.message] || [500, 'Unable to verify payment. Please contact support before retrying.']
    if (status === 500) {
        console.error('Unable to verify payment:', error.message)
    }
    return res.status(status).json({ message })
}

export const createPaymentOrder = async (req, res) => {
    const razorpayClient = getRazorpayClient()
    if (!razorpayClient) {
        return res.status(503).json({
            message: 'Razorpay is not configured. Add valid test API keys to server/.env.'
        })
    }

    const shippingAddress = normalizeShippingAddress(req.body?.shippingAddress)
    if (!shippingAddress) {
        return res.status(400).json({
            message: 'Enter a valid shipping address, phone number, and 6-digit pincode.'
        })
    }

    let pendingOrder = null

    try {
        const customer = await Customer.findById(req.customer._id)
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        await cleanDeletedProductReferences(customer)

        if (!customer.cart.length) {
            return res.status(400).json({ message: 'Your cart is empty.' })
        }

        const productIds = customer.cart.map((item) => item.product)
        const products = await Product.find({ _id: { $in: productIds } })
        const productsById = new Map(products.map((product) => [product._id.toString(), product]))

        const orderItems = []
        let totalAmount = 0

        for (const cartItem of customer.cart) {
            const product = productsById.get(cartItem.product.toString())
            if (!product) {
                return res.status(400).json({ message: 'One or more products in your cart are no longer available.' })
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}.` })
            }

            const lineTotal = product.price * cartItem.quantity
            totalAmount += lineTotal

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image || ''
            })
        }

        const totalAmountPaise = Math.round(totalAmount * 100)
        if (!Number.isSafeInteger(totalAmountPaise) || totalAmountPaise < 1) {
            return res.status(400).json({ message: 'The cart total is invalid. Please review your cart.' })
        }

        pendingOrder = await Order.create({
            customer: customer._id,
            items: orderItems,
            shippingAddress,
            totalAmount
        })

        const razorpayOrder = await razorpayClient.client.orders.create({
            amount: totalAmountPaise,
            currency: 'INR',
            receipt: pendingOrder._id.toString()
        })

        pendingOrder.razorpayOrderId = razorpayOrder.id
        await pendingOrder.save()

        return res.status(201).json({
            success: true,
            orderId: pendingOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: razorpayClient.keyId
        })
    } catch (error) {
        if (pendingOrder?._id) {
            await Order.deleteOne({ _id: pendingOrder._id })
        }
        console.error('Unable to create payment order:', error.message)
        return res.status(500).json({ message: 'Unable to create your order. Please try again.' })
    }
}

export const verifyPayment = async (req, res) => {
    const { orderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body || {}
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
        return res.status(503).json({ message: 'Razorpay is not configured. Add the test API keys to server/.env.' })
    }

    if (!mongoose.Types.ObjectId.isValid(orderId) || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification details are incomplete.' })
    }

    try {
        const order = await Order.findOne({ _id: orderId, customer: req.customer._id })
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' })
        }

        if (order.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({ message: 'Payment does not match this order.' })
        }

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex')

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ message: 'Invalid payment signature. Your cart has not been cleared.' })
        }

        const verifiedOrder = await completePaidOrder(orderId, req.customer._id, razorpayOrderId, razorpayPaymentId)
        return res.status(200).json({ success: true, order: verifiedOrder })
    } catch (error) {
        return sendPaymentError(error, res)
    }
}

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 })
        return res.status(200).json({ success: true, orders })
    } catch (error) {
        console.error('Unable to fetch orders:', error.message)
        return res.status(500).json({ message: 'Unable to load your orders. Please try again.' })
    }
}

export const getOrder = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Order not found.' })
    }

    try {
        const order = await Order.findOne({ _id: id, customer: req.customer._id })
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' })
        }

        return res.status(200).json({ success: true, order })
    } catch (error) {
        console.error('Unable to fetch order:', error.message)
        return res.status(500).json({ message: 'Unable to load this order. Please try again.' })
    }
}
