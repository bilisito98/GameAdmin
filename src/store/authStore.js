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
    // base64url -> base64
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
    user: safeParseJSON(localStorage.getItem('studio_user')) || null, // { id, email, fullName, roles }
    token: localStorage.getItem('studio_token') || null,
    isAuthenticated: !!localStorage.getItem('studio_token'),
    loading: false,
    lastError: null
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

        // Normalizar roles (backend puede devolver string o array)
        const normalizedRoles = Array.isArray(roles) ? roles : (roles ? [roles] : [])

        // Guardar en state + localStorage
        this.token = token
        this.user = { id: userId, email: userEmail, fullName, roles: normalizedRoles }
        this.isAuthenticated = true

        localStorage.setItem('studio_token', token)
        localStorage.setItem('studio_user', JSON.stringify(this.user))

        // Configurar axios globalmente
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

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

        // 1) recuperar user desde localStorage si existe
        const stored = safeParseJSON(localStorage.getItem('studio_user'))
        if (stored) {
          this.user = stored
          this.isAuthenticated = true
          return true
        }

        // 2) intentar pedir al endpoint /api/auth/me (si lo tienes)
        try {
          const res = await axios.get(`${apiBase}/api/auth/me`)
          this.user = res.data
          localStorage.setItem('studio_user', JSON.stringify(this.user))
          this.isAuthenticated = true
          return true
        } catch (err) {
          // puede que la API no tenga /me, seguimos a decodificar token
        }

        // 3) decodificar token (intento razonable para extraer roles/email)
        const payload = decodeJwtPayload(token)
        if (payload) {
          const rolesClaim = payload['roles'] ?? payload['role'] ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          const rolesArr = Array.isArray(rolesClaim) ? rolesClaim : (rolesClaim ? [rolesClaim] : [])
          this.user = {
            id: payload['jti'] ?? payload['sub'] ?? null,
            email: payload['sub'] ?? payload['email'] ?? null,
            fullName: payload['name'] ?? payload['fullName'] ?? null,
            roles: rolesArr
          }
          localStorage.setItem('studio_user', JSON.stringify(this.user))
          this.isAuthenticated = true
          return true
        }

        // sitodo falla, marcamos autenticado por token (pero sin user)
        this.isAuthenticated = !!token
        return !!token
      } finally {
        this.loading = false
      }
    },

    // Metodo utilitario para usar fetch público sin token
    async fetchPublic(url) {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error cargando ${url}`)
      return await res.json()
    }
  }
})
