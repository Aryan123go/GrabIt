import Product from '../model/product.model.js'

const getProductId = (product) => product?._id?.toString() || product?.toString()

export const removeMissingProductReferences = (customer, existingProductIds) => {
    const existingIds = new Set(existingProductIds.map((id) => id.toString()))
    const wishlist = customer.wishlist || []
    const cart = customer.cart || []
    const validWishlist = wishlist.filter((productId) => existingIds.has(getProductId(productId)))
    const validCart = cart.filter((item) => existingIds.has(getProductId(item.product)))
    const removedWishlistCount = wishlist.length - validWishlist.length
    const removedCartCount = cart.length - validCart.length

    if (removedWishlistCount) {
        customer.wishlist = validWishlist
    }
    if (removedCartCount) {
        customer.cart = validCart
    }

    return { removedWishlistCount, removedCartCount }
}

export const cleanDeletedProductReferences = async (customer) => {
    const referencedIds = [
        ...(customer.wishlist || []).map(getProductId),
        ...(customer.cart || []).map((item) => getProductId(item.product))
    ].filter(Boolean)
    const uniqueReferencedIds = [...new Set(referencedIds)]

    if (uniqueReferencedIds.length === 0) {
        return { removedWishlistCount: 0, removedCartCount: 0 }
    }

    const products = await Product.find({ _id: { $in: uniqueReferencedIds } }).select('_id').lean()
    const removed = removeMissingProductReferences(customer, products.map((product) => product._id))

    if (removed.removedWishlistCount || removed.removedCartCount) {
        await customer.save()
    }

    return removed
}
