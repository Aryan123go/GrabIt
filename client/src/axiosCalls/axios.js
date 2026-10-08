
import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:8084',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})