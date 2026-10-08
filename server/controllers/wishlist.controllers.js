import mongoose from 'mongoose'
import Customer from '../model/customer.model.js'
import Product from '../model/product.model.js'
import { cleanDeletedProductReferences } from '../utils/cleanDeletedProductReferences.js'

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }

        if (!await Product.exists({ _id: productId })) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const customer = await Customer.findOneAndUpdate(
            { _id: req.customer._id, wishlist: { $ne: productId } },
            { $addToSet: { wishlist: productId } },
            { new: true }
        )

        if (!customer) {
            return res.status(409).json({ message: 'Product is already in your wishlist' })
        }

        return res.status(200).json({ success: true, message: 'Product added to wishlist' })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to add product to wishlist', error: error.message })
    }
}

export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id)

        if (!customer) {
            return res.status(401).json({ message: 'Customer not found' })
        }

        await cleanDeletedProductReferences(customer)
        await customer.populate({
            path: 'wishlist',
            select: 'name price category image stock'
        })

        const wishlist = customer.wishlist.filter(Boolean)
        return res.status(200).json({ success: true, count: wishlist.length, wishlist })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to fetch wishlist', error: error.message })
    }
}

export const getWishlistCount = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id).select('wishlist')

        if (!customer) {
            return res.status(401).json({ message: 'Customer not found' })
        }

        await cleanDeletedProductReferences(customer)
        return res.status(200).json({ success: true, count: customer.wishlist.length })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to fetch wishlist count', error: error.message })
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' })
        }

        const customer = await Customer.findOneAndUpdate(
            { _id: req.customer._id, wishlist: productId },
            { $pull: { wishlist: productId } },
            { new: true }
        )

        if (!customer) {
            return res.status(404).json({ message: 'Product is not in your wishlist' })
        }

        return res.status(200).json({ success: true, message: 'Product removed from wishlist' })
    } catch (error) {
        return res.status(500).json({ message: 'Unable to remove product from wishlist', error: error.message })
    }
}