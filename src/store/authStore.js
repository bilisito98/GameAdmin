import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null, // { id, email, fullName, roles }
        token: localStorage.getItem('studio_token') || null,
        isAuthenticated: !!localStorage.getItem('studio_token'),
        loading: true
    }),
    getters: {
        isAdmin: (state) => state.user?.roles?.includes('Admin') || false,
        isUser: (state) => state.user?.roles?.includes('User') || false
    },
    actions: {
        async login(apiBase, email, password) {
            try {
                const res = await axios.post(`${apiBase}/api/auth/login`, { email, password })
                const { token, email: userEmail, userId, roles, fullName } = res.data

                // Guardar datos del usuario
                this.token = token
                this.user = { id: userId, email: userEmail, fullName, roles }
                this.isAuthenticated = true

                // Guardar token localmente y configurar Axios
                localStorage.setItem('studio_token', token)
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

                return true
            } catch (err) {
                console.error('Error en login:', err)
                return false
            }
        },

        logout() {
            this.user = null
            this.token = null
            this.isAuthenticated = false

            localStorage.removeItem('studio_token')
            delete axios.defaults.headers.common['Authorization']
        },

        async restoreSession() {
            const token = localStorage.getItem('studio_token')
            if (token) {
                this.token = token
                this.isAuthenticated = true
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                // Opcional: aquí podrías hacer un GET para traer datos actualizados del usuario
                // Ejemplo: const res = await axios.get(`${apiBase}/api/auth/me`);
            } else {
                this.isAuthenticated = false
            }
            this.loading = false
        },

        // Método para GET públicos sin token
        async fetchPublic(url) {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`Error cargando ${url}`)
            return await res.json()
        }
    }
})
