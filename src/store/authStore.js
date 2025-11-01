// src/store/authStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

/* ========= Configuración base de la API ========= */
let API_BASE = import.meta.env.VITE_API_URL?.trim()

// Si la variable no existe o apunta a localhost, usar la API local
if (!API_BASE || API_BASE === '' || API_BASE.includes('localhost')) {
  API_BASE = 'http://localhost:5147'
}

// Detectar si el front está corriendo en Render y forzar dominio del backend
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname
  if (hostname.includes('render.com') || hostname.endsWith('.onrender.com')) {
    API_BASE = 'https://gameadmin-backend-1.onrender.com'
  }
}

axios.defaults.baseURL = API_BASE

if (import.meta.env.DEV) console.log('🌍 API base URL:', API_BASE)

/* ========= Funciones auxiliares ========= */
function safeParseJSON(str) {
  try { return JSON.parse(str) } catch { return null }
}

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1]
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/* ========= Store de autenticación ========= */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: safeParseJSON(localStorage.getItem('studio_user')) || null,
    token: localStorage.getItem('studio_token') || null,
    isAuthenticated: !!localStorage.getItem('studio_token'),
    loading: false,
    lastError: null,
    inactivityTimer: null
  }),

  getters: {
    isAdmin: (state) => {
      const roles = state.user?.roles ?? state.user?.role ?? []
      const lower = Array.isArray(roles)
        ? roles.map(r => String(r).toLowerCase())
        : [String(roles).toLowerCase()]
      return lower.includes('admin')
    },
    isUser: (state) => {
      const roles = state.user?.roles ?? state.user?.role ?? []
      const lower = Array.isArray(roles)
        ? roles.map(r => String(r).toLowerCase())
        : [String(roles).toLowerCase()]
      return lower.includes('user')
    }
  },

  actions: {
    /* ========= Login ========= */
    async login(email, password) {
      this.loading = true
      this.lastError = null
      try {
        const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password })
        const { token, email: userEmail, userId, roles, fullName } = res.data

        const normalizedRoles = Array.isArray(roles)
          ? roles
          : (roles ? [roles] : [])

        this.token = token
        this.user = { id: userId, email: userEmail, fullName, roles: normalizedRoles }
        this.isAuthenticated = true

        localStorage.setItem('studio_token', token)
        localStorage.setItem('studio_user', JSON.stringify(this.user))

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // Iniciar temporizador de inactividad
        this.startInactivityTimer()

        return true
      } catch (err) {
        console.error('❌ Error en login:', err)
        this.lastError = err?.response?.data ?? err.message ?? 'Error desconocido'
        return false
      } finally {
        this.loading = false
      }
    },

    /* ========= Logout ========= */
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.lastError = null
      localStorage.removeItem('studio_token')
      localStorage.removeItem('studio_user')
      delete axios.defaults.headers.common['Authorization']
      this.clearInactivityTimer()
    },

    /* ========= Restaurar sesión ========= */
    async restoreSession() {
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
          this.startInactivityTimer()
          return true
        }

        try {
          const res = await axios.get(`${API_BASE}/api/auth/me`)
          this.user = res.data
          localStorage.setItem('studio_user', JSON.stringify(this.user))
          this.isAuthenticated = true
          this.startInactivityTimer()
          return true
        } catch (err) {
          console.warn('⚠️ No se pudo obtener /me, intentando decodificar token...')
        }

        const payload = decodeJwtPayload(token)
        if (payload) {
          const rolesClaim = payload['roles'] ?? payload['role'] ??
            payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          const rolesArr = Array.isArray(rolesClaim)
            ? rolesClaim
            : (rolesClaim ? [rolesClaim] : [])
          this.user = {
            id: payload['jti'] ?? payload['sub'] ?? null,
            email: payload['sub'] ?? payload['email'] ?? null,
            fullName: payload['name'] ?? payload['fullName'] ?? null,
            roles: rolesArr
          }
          localStorage.setItem('studio_user', JSON.stringify(this.user))
          this.isAuthenticated = true
          this.startInactivityTimer()
          return true
        }

        this.isAuthenticated = !!token
        return !!token
      } finally {
        this.loading = false
      }
    },

    /* ========= Cierre automático por inactividad ========= */
    startInactivityTimer() {
      this.clearInactivityTimer()
      const timeout = 5 * 60 * 1000 // 5 minutos
      this.inactivityTimer = setTimeout(() => {
        console.warn('⏳ Sesión cerrada por inactividad')
        this.logout()
      }, timeout)

      // Reiniciar temporizador al detectar movimiento o clic
      const resetTimer = () => this.startInactivityTimer()
      window.addEventListener('mousemove', resetTimer)
      window.addEventListener('keydown', resetTimer)
      window.addEventListener('click', resetTimer)
    },

    clearInactivityTimer() {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer)
        this.inactivityTimer = null
      }
    },

    /* ========= Fetch público ========= */
    async fetchPublic(url) {
      const res = await fetch(`${API_BASE}${url}`)
      if (!res.ok) throw new Error(`Error cargando ${url}`)
      return await res.json()
    }
  }
})

