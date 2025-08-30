import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CandidateInfo } from '../services/auth'
import { getToken, getUser, setSession, clearSession } from '../services/auth'
import { login as apiLogin } from '../services/login.service'

export type LoginCredentials = { email: string; password: string }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<CandidateInfo | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadSession = () => {
    try {
      const savedToken = getToken()
      const savedUser = getUser()
      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = savedUser
        isAuthenticated.value = true
      } else {
        // clean in case of partial data
        clearSession()
        token.value = null
        user.value = null
        isAuthenticated.value = false
      }
    } catch (e) {
      console.error('Failed to load session', e)
      clearSession()
      token.value = null
      user.value = null
      isAuthenticated.value = false
    }
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null
    try {
      const res = await apiLogin(credentials.email, credentials.password)
      setSession(res.token, res.candidat)
      token.value = res.token
      user.value = res.candidat
      isAuthenticated.value = true
      return true
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err?.response?.data?.message || 'Identifiants incorrects'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    try {
      clearSession()
    } finally {
      user.value = null
      token.value = null
      isAuthenticated.value = false
    }
  }

  const candidateId = computed(() => user.value?.id)
  const fullName = computed(() => user.value ? `${user.value.prenom} ${user.value.nom}` : '')

  return {
    // state
    user,
    token,
    isAuthenticated,
    loading,
    error,
    // actions
    loadSession,
    login,
    logout,
    // getters
    candidateId,
    fullName,
  }
})
