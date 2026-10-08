import { axiosInstance } from './axios.js'

export async function fetchWishlist() {
  const response = await axiosInstance.get('/wishlist')
  return response.data
}

export async function fetchWishlistCount() {
  const response = await axiosInstance.get('/wishlist/count')
  return response.data.count
}

export async function addWishlistProduct(productId) {
  const response = await axiosInstance.post(`/wishlist/${productId}`)
  return response.data
}

export async function removeWishlistProduct(productId) {
  const response = await axiosInstance.delete(`/wishlist/${productId}`)
  return response.data
}

export function notifyWishlistUpdated() {
  window.dispatchEvent(new Event('wishlist-updated'))
}