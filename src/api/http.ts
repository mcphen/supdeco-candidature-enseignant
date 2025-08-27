import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false
})

export default http
