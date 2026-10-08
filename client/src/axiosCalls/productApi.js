import { axiosInstance } from './axios.js'

export async function fetchProducts(filters = {}) {
  const response = await axiosInstance.get('/products', { params: filters })
  return response.data
}

export async function fetchProduct(productId) {
  const response = await axiosInstance.get(`/products/${productId}`)
  return response.data.product
}
