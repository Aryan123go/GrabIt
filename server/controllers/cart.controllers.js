import mongoose from 'mongoose'
import Customer from '../model/customer.model.js'
import Product from '../model/product.model.js'

const populatedCart = (customerId) => Customer.findById(customerId).populate({
    path: 'cart.product',
    select: 'name description price category image stock'
})

const normalizeCart = (customer) => (customer?.cart || [])
    .filter((item) => item?.product)
    .map((item) => ({
        product: item.product.toObject ? item.product.toObject() : item.product,
        quantity: item.quantity
    }))

const sendUpdatedCart = async (customerId, res, message) => {
    const customer = await populatedCart(customerId)
    return res.status(200).json({ success: true, message, cart: normalizeCart(customer) })
}

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const customer = await Customer.findById(req.customer._id)
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        const existingItem = customer.cart.find((item) => item.product.toString() === productId)
        const nextQuantity = (existingItem?.quantity || 0) + 1
        if (nextQuantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available in stock.` })
        }

        if (existingItem) {
            existingItem.quantity = nextQuantity
        } else {
            customer.cart.push({ product: productId, quantity: 1 })
        }

        await customer.save()
        return await sendUpdatedCart(customer._id, res, 'Cart updated')
    } catch (error) {
        return res.status(500).json({ message: 'Unable to add product to cart', error: error.message })
    }
}

export const getCart = async (req, res) => {
    try {
        const customer = await populatedCart(req.customer._id)
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        return res.status(200).json({ success: true, cart: normalizeCart(customer) })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to fetch cart', error: error.message })
    }
}

export const updateCartItemQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a whole number greater than 0' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const customer = await Customer.findById(req.customer._id)
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        const existingItem = customer.cart.find((item) => item.product.toString() === productId)
        if (!existingItem) {
            return res.status(404).json({ message: 'Product is not in your cart' })
        }
        if (quantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available in stock.` })
        }

        existingItem.quantity = quantity
        await customer.save()
        return await sendUpdatedCart(customer._id, res, 'Cart updated')
    } catch (error) {
        return res.status(500).json({ message: 'Unable to update cart quantity', error: error.message })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }

        const customer = await Customer.findById(req.customer._id)
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        customer.cart = customer.cart.filter((item) => item.product.toString() !== productId)
        await customer.save()
        return await sendUpdatedCart(customer._id, res, 'Product removed from cart')
    } catch (error) {
        return res.status(500).json({ message: 'Unable to remove product from cart', error: error.message })
    }
}