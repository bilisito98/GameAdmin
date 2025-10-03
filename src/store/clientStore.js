import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './authStore'

export const useClientStore = defineStore('clients', {
    state: () => ({
        clients: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchClients() {
            this.loading = true
            this.error = null

            try {
                const authStore = useAuthStore()

                // Si hay token, se asegura que axios lo use
                if (authStore.token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`
                }

                const res = await axios.get("http://localhost:5147/api/clients")
                console.log("Clientes recibidos:", res.data)

                // Mapeamos la respuesta a la estructura usada por ClientCard.vue
                this.clients = res.data.map(c => ({
                    id: c.id,
                    clientCode: c.clientCode,
                    name: c.name,
                    balanceUsd: c.balanceUsd,
                    license: c.license || { name: "Sin licencia" },
                    acquiredAt: c.acquiredAt,
                    activeLicense: c.activeLicense,
                    projectName: c.projectName // agregado para RequestView
                }))
            } catch (err) {
                this.error = "Error cargando clientes"
                console.error(err)
            } finally {
                this.loading = false
            }
        }
    }
})
