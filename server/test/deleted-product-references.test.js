import assert from 'node:assert/strict'
import test from 'node:test'
import { removeMissingProductReferences } from '../utils/cleanDeletedProductReferences.js'

test('removes deleted products from wishlist and cart without changing valid entries', () => {
    const customer = {
        wishlist: ['live-wishlist', 'deleted-wishlist'],
        cart: [
            { product: 'live-cart', quantity: 2 },
            { product: 'deleted-cart', quantity: 4 }
        ]
    }

    const removed = removeMissingProductReferences(customer, ['live-wishlist', 'live-cart'])

    assert.deepEqual(removed, { removedWishlistCount: 1, removedCartCount: 1 })
    assert.deepEqual(customer.wishlist, ['live-wishlist'])
    assert.deepEqual(customer.cart, [{ product: 'live-cart', quantity: 2 }])
})

test('retains valid references when products are populated documents', () => {
    const customer = {
        wishlist: [{ _id: 'live-wishlist' }, { _id: 'deleted-wishlist' }],
        cart: [{ product: { _id: 'live-cart' }, quantity: 1 }]
    }

    const removed = removeMissingProductReferences(customer, ['live-wishlist', 'live-cart'])

    assert.deepEqual(removed, { removedWishlistCount: 1, removedCartCount: 0 })
    assert.deepEqual(customer.wishlist, [{ _id: 'live-wishlist' }])
    assert.deepEqual(customer.cart, [{ product: { _id: 'live-cart' }, quantity: 1 }])
})

test('leaves customer references unchanged when all products still exist', () => {
    const customer = {
        wishlist: ['wishlist-product'],
        cart: [{ product: 'cart-product', quantity: 3 }]
    }
    const originalWishlist = customer.wishlist
    const originalCart = customer.cart

    const removed = removeMissingProductReferences(customer, ['wishlist-product', 'cart-product'])

    assert.deepEqual(removed, { removedWishlistCount: 0, removedCartCount: 0 })
    assert.equal(customer.wishlist, originalWishlist)
    assert.equal(customer.cart, originalCart)
})
