import { axiosInstance } from './axios.js'

export async function fetchCart() {
  const response = await axiosInstance.get('/cart')
  return response.data
}

export async function addCartProduct(productId) {
  const response = await axiosInstance.post(`/cart/${productId}`)
  return response.data
}

export async function updateCartProductQuantity(productId, quantity) {
  const response = await axiosInstance.patch(`/cart/${productId}`, { quantity })
  return response.data
}

export async function removeCartProduct(productId) {
  const response = await axiosInstance.delete(`/cart/${productId}`)
  return response.data
}