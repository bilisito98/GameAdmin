// src/store/authStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

function safeParseJSON(str) {
  try { return JSON.parse(str) } catch { return null }
}

function normalizeRoles(r) {
  if (!r) return []
  if (Array.isArray(r)) return r.map(x => String(x).toLowerCase())
  return [String(r).toLowerCase()]
}

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1]
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: safeParseJSON(localStorage.getItem('studio_user')) || null,
    token: localStorage.getItem('studio_token') || null,
    isAuthenticated: !!localStorage.getItem('studio_token'),
    loading: false,
    lastError: null,

    // 🔥 NUEVO: control de inactividad
    lastActivity: Date.now(),
    inactivityTimer: null
  }),

  getters: {
    isAdmin: (state) => {
      const roles = state.user?.roles ?? state.user?.role ?? []
      const lower = Array.isArray(roles) ? roles.map(r => String(r).toLowerCase()) : [String(roles).toLowerCase()]
      return lower.includes('admin')
    },
    isUser: (state) => {
      const roles = state.user?.roles ?? state.user?.role ?? []
      const lower = Array.isArray(roles) ? roles.map(r => String(r).toLowerCase()) : [String(roles).toLowerCase()]
      return lower.includes('user')
    }
  },

  actions: {
    async login(apiBase, email, password) {
      this.loading = true
      this.lastError = null
      try {
        const res = await axios.post(`${apiBase}/api/auth/login`, { email, password })
        const { token, email: userEmail, userId, roles, fullName } = res.data

        const normalizedRoles = Array.isArray(roles) ? roles : (roles ? [roles] : [])

        this.token = token
        this.user = { id: userId, email: userEmail, fullName, roles: normalizedRoles }
        this.isAuthenticated = true

        localStorage.setItem('studio_token', token)
        localStorage.setItem('studio_user', JSON.stringify(this.user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // 🔥 Inicia el control de inactividad al iniciar sesión
        this.startActivityTracking()
        this.startInactivityTimer()

        return true
      } catch (err) {
        console.error('Error en login:', err)
        this.lastError = err?.response?.data ?? err.message
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      console.log('Cerrando sesión...')

      // 🔥 Limpia el temporizador y los listeners
      clearTimeout(this.inactivityTimer)
      window.removeEventListener('mousemove', this.resetTimer)
      window.removeEventListener('keydown', this.resetTimer)
      window.removeEventListener('click', this.resetTimer)
      window.removeEventListener('beforeunload', this.handleBeforeUnload)

      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.lastError = null
      localStorage.removeItem('studio_token')
      localStorage.removeItem('studio_user')
      delete axios.defaults.headers.common['Authorization']
    },

    async restoreSession(apiBase = import.meta.env.VITE_API_URL) {
      this.loading = true
      try {
        const token = localStorage.getItem('studio_token')
        if (!token) {
          this.isAuthenticated = false
          this.user = null
          return false
        }

        this.token = token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        const stored = safeParseJSON(localStorage.getItem('studio_user'))
        if (stored) {
          this.user = stored
          this.isAuthenticated = true

          // 🔥 Restaurar monitoreo de actividad si la sesión sigue válida
          this.startActivityTracking()
          this.startInactivityTimer()
        }

        return true
      } catch (err) {
        console.error('Error restaurando sesión:', err)
        this.logout()
        return false
      } finally {
        this.loading = false
      }
    },

    // ---------------------------------------------------------
    // 🔥 NUEVAS FUNCIONES: Control de inactividad y cierre
    // ---------------------------------------------------------

    startInactivityTimer() {
      clearTimeout(this.inactivityTimer)
      this.inactivityTimer = setTimeout(() => {
        this.logout()
        alert('Tu sesión se ha cerrado automáticamente por inactividad.')
      }, 5 * 60 * 1000) // 5 minutos
    },

    resetTimer() {
      const store = useAuthStore()
      store.lastActivity = Date.now()
      store.startInactivityTimer()
    },

    startActivityTracking() {
      window.addEventListener('mousemove', this.resetTimer)
      window.addEventListener('keydown', this.resetTimer)
      window.addEventListener('click', this.resetTimer)
      window.addEventListener('beforeunload', this.handleBeforeUnload)
    },

    handleBeforeUnload() {
      const store = useAuthStore()
      store.logout()
    }
  }
})

