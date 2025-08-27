import axios from 'axios'

// Définir l'URL de base selon l'environnement
let baseURL = ''

if (import.meta.env.MODE === 'production') {
    // En prod → utiliser l'API prod
    baseURL = import.meta.env.VITE_API_BASE_URL_PROD || 'https://admissions.supdeco.sn/api'
} else {
    // En dev → utiliser localhost
    baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
}
export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false
})

export default http
