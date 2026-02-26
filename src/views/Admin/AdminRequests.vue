<template>
  <div class="admin-container">

    <!-- 📊 DASHBOARD -->
    <div class="dashboard">
      <div class="card total">
        <h3>Total</h3>
        <p>{{ requests.length }}</p>
      </div>

      <div class="card pending">
        <h3>Pendientes</h3>
        <p>{{ countByStatus('PENDING') }}</p>
      </div>

      <div class="card approved">
        <h3>Aprobadas</h3>
        <p>{{ countByStatus('APPROVED') }}</p>
      </div>

      <div class="card confirmed">
        <h3>Confirmadas</h3>
        <p>{{ countByStatus('CONFIRMED') }}</p>
      </div>

      <div class="card rejected">
        <h3>Rechazadas</h3>
        <p>{{ countByStatus('REJECTED') }}</p>
      </div>
    </div>

    <!-- 🔍 FILTRO -->
    <div class="filter-section">
      <select v-model="selectedFilter">
        <option value="">Todos</option>
        <option>PENDING</option>
        <option>APPROVED</option>
        <option>CONFIRMED</option>
        <option>REJECTED</option>
      </select>
    </div>

    <!-- 📋 TABLA -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Cambiar</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="req in filteredRequests" :key="req.id">
            <td>{{ req.client?.name }}</td>
            <td>${{ req.amountUsd }}</td>
            <td>{{ formatDate(req.createdAt) }}</td>

            <td>
              <span :class="badgeClass(req.status)">
                {{ req.status }}
              </span>
            </td>

            <td>
              <select v-model="req.newStatus">
                <option disabled value="">Seleccionar</option>
                <option>PENDING</option>
                <option>APPROVED</option>
                <option>CONFIRMED</option>
                <option>REJECTED</option>
              </select>
            </td>

            <td>
              <button @click="updateStatus(req)">
                Guardar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"

const requests = ref([])
const selectedFilter = ref("")

const loadRequests = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`)
  const data = await res.json()

  requests.value = data.map(r => ({
    ...r,
    newStatus: ""
  }))
}

const updateStatus = async (req) => {
  if (!req.newStatus) return alert("Selecciona un estado")

  await fetch(`${import.meta.env.VITE_API_URL}/api/requests/${req.id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.newStatus)
  })

  alert("Estado actualizado")
  loadRequests()
}

const filteredRequests = computed(() => {
  if (!selectedFilter.value) return requests.value
  return requests.value.filter(r => r.status === selectedFilter.value)
})

const countByStatus = (status) => {
  return requests.value.filter(r => r.status === status).length
}

const badgeClass = (status) => {
  return {
    badge: true,
    pending: status === "PENDING",
    approved: status === "APPROVED",
    confirmed: status === "CONFIRMED",
    rejected: status === "REJECTED"
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(loadRequests)
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  color: white;
}

/* DASHBOARD */
.dashboard {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  flex: 1;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
}

.total { background: #374151; }
.pending { background: #facc15; color: black; }
.approved { background: #3b82f6; }
.confirmed { background: #22c55e; }
.rejected { background: #ef4444; }

/* FILTRO */
.filter-section {
  margin-bottom: 1rem;
}

select {
  padding: 0.4rem;
  border-radius: 5px;
}

/* TABLA */
.table-wrapper {
  background: #1f2937;
  padding: 1rem;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.8rem;
  text-align: center;
}

th {
  background: #111827;
}

tr:nth-child(even) {
  background: #2d3748;
}

button {
  background: #3b82f6;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

button:hover {
  background: #2563eb;
}

/* BADGES */
.badge {
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.8rem;
}

.badge.pending { background: #facc15; color: black; }
.badge.approved { background: #3b82f6; }
.badge.confirmed { background: #22c55e; }
.badge.rejected { background: #ef4444; }
</style>