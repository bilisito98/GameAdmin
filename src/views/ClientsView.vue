<template>
  <div class="clients-wrapper">
    <!-- 🔥 Barra de grupos -->
    <div class="group-bar">
      <button
        v-for="g in groups"
        :key="g"
        :class="{ active: g === selectedGroup }"
        @click="selectedGroup = g"
      >
        {{ g }}
      </button>
    </div>

    <!-- 🔥 Título con el grupo actual -->
    <h1 class="clients-title">Clientes: {{ selectedGroup }}</h1>

    <div v-if="loading" class="loading-text">Cargando clientes...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else-if="clients.length === 0" class="no-clients">No hay clientes para mostrar</div>

    <!-- 🔥 Grid de clientes filtrados -->
    <div v-else class="clients-grid">
      <ClientCard
        v-for="c in filteredClients"
        :key="c.id"
        :client="c"
      />
    </div>

    <div class="mt-6">
      <CurrencyConverter />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ClientCard from '../components/ClientCard.vue'
import CurrencyConverter from '../components/CurrencyConverter.vue'
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
const clients = ref([])
const loading = ref(true)
const error = ref(null)

// 🔥 Grupos disponibles
const groups = ["Grupo 1", "Grupo 2", "Grupo 3"]
const selectedGroup = ref("Grupo 1")

// 🔥 Filtrar clientes según el grupo seleccionado
const filteredClients = computed(() => {
  return clients.value.filter(c => c.group === selectedGroup.value)
})

onMounted(async () => {
  try {
    let response, data
    const url = 'http://localhost:5147/api/clients'

    if (auth.isAuthenticated) {
      response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
    } else {
      response = await auth.fetchPublic(url)
    }

    if (!response.ok) throw new Error(`Error cargando clientes: ${response.statusText}`)

    data = await response.json()
    clients.value = data.map(c => ({
      id: c.id,
      clientCode: c.clientCode,
      name: c.name,
      balanceUsd: c.balanceUsd,
      activeLicense: c.activeLicense,
      licenseStatus: c.licenseStatus,
      license: c.license,
      acquiredAt: c.acquiredAt,
      group: c.group || "Grupo 1"
    }))
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.group-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.group-bar button {
  background: #222;
  color: white;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

.group-bar button.active {
  background: #ff6600;
}
</style>

<style scoped src="../assets/ClientsView.css"></style>

