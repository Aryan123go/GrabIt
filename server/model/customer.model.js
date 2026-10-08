import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    shippingAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: '' }
    },

    wishlist: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        default: []
    },

    cart: {
        type: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1,
                validate: Number.isInteger
            }
        }],
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Customer = mongoose.model('Customer', customerSchema)

export default Customer