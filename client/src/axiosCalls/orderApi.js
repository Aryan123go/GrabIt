import { axiosInstance } from './axios.js'

export async function createPaymentOrder(shippingAddress) {
  const response = await axiosInstance.post('/orders/create-payment-order', { shippingAddress })
  return response.data
}

export async function verifyPayment(payload) {
  const response = await axiosInstance.post('/orders/verify-payment', payload)
  return response.data
}

export async function fetchOrders() {
  const response = await axiosInstance.get('/orders')
  return response.data
}

export async function fetchOrderById(orderId) {
  const response = await axiosInstance.get(`/orders/${orderId}`)
  return response.data
}
