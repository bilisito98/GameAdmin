<template>
  <div class="ml-64 p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">Administrar Clientes</h1>
      <div class="flex items-center gap-3" v-if="auth.isAdmin">
        <button @click="openAddModal" class="btn-primary">+ Agregar Cliente</button>
        <button @click="loadClients" class="btn-ghost" title="Refrescar">⟳</button>
      </div>
    </div>

    <div v-if="loading" class="panel panel--info">Cargando clientes...</div>
    <div v-if="error" class="panel panel--error">{{ error }}</div>

    <div class="table-wrap" v-if="!loading && !error">
      <table class="styled-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Código</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Saldo (USD)</th>
          <th>Grupo</th>
          <th>Licencia</th>
          <th>Estado Licencia</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="c in clients" :key="c.id" class="row-hover">
          <td>{{ c.id }}</td>
          <td>{{ c.clientCode || '-' }}</td>
          <td>{{ c.name }}</td>
          <td>{{ c.email || '-' }}</td>
          <td>{{ c.phone || '-' }}</td>
          <td>{{ formatMoney(c.balanceUsd) }}</td>
          <td>{{ c.group || '-' }}</td>
          <td>{{ c.license?.name || 'Sin licencia' }}</td>
          <td>{{ c.licenseStatus || (c.activeLicense ? 'Activa' : 'Inactiva') }}</td>
          <td class="actions-col" v-if="auth.isAdmin">
            <button @click="openEditModal(c)" class="link-btn">Editar</button>
            <button @click="openDeleteConfirm(c)" class="link-btn link-btn--danger">Eliminar</button>
          </td>
        </tr>
        <tr v-if="clients.length === 0">
          <td colspan="9" class="text-center">No hay clientes para mostrar.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-card">
        <h3 class="modal-title">{{ editingClient ? 'Editar Cliente' : 'Agregar Cliente' }}</h3>
        <form @submit.prevent="saveClient">
          <label class="label">Código</label>
          <input v-model="form.clientCode" class="input" required />
          <label class="label">Nombre</label>
          <input v-model="form.name" class="input" required />
          <label class="label">Correo</label>
          <input v-model="form.email" type="email" class="input" />
          <label class="label">Teléfono</label>
          <input v-model="form.phone" class="input" />
          <label class="label">Saldo USD</label>
          <input v-model.number="form.balanceUsd" type="number" class="input" />
          <label class="label">Grupo</label>
          <select v-model="form.group" class="input">
            <option value="Grupo 1">Grupo 1</option>
            <option value="Grupo 2">Grupo 2</option>
            <option value="Grupo 3">Grupo 3</option>
          </select>
          <label class="label">Licencia</label>
          <select v-model="form.licenseId" class="input">
            <option value="">Sin licencia</option>
            <option v-for="l in licenses" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
          <label class="label">Estado Licencia</label>
          <select v-model="form.licenseStatus" class="input">
            <option>Activa</option>
            <option>En espera</option>
            <option>Inactiva</option>
          </select>

          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary">{{ editingClient ? 'Guardar' : 'Agregar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" :class="['toast', toastType === 'error' ? 'toast--error' : '']">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'

const auth = useAuthStore()
const clients = ref([])
const licenses = ref([])
const loading = ref(false)
const error = ref(null)
const apiBase = import.meta.env.VITE_API_URL || 'https://gameadmin-backend-1.onrender.com';

// Modal
const showModal = ref(false)
const editingClient = ref(false)
const form = ref({ id: null, clientCode: '', name: '', email: '', phone: '', balanceUsd: 0, group: 'Grupo 1',  licenseId: null, licenseStatus: 'En espera' })

// Toast
const toast = ref(null)
const toastType = ref('success')
let _toastTimer = null
function showToast(msg, type = 'success') {
  toast.value = msg
  toastType.value = type
  clearTimeout(_toastTimer)
  _toastTimer = setTimeout(() => (toast.value = null), 3500)
}

// ---------------------------
// Funciones CRUD
// ---------------------------
async function loadClients() {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('studio_token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const res = await axios.get(`${apiBase}/api/clients`, config)
    clients.value = res.data || []
  } catch (err) {
    error.value = 'Error al cargar clientes'
    showToast(error.value, 'error')
  } finally {
    loading.value = false
  }
}

async function loadLicenses() {
  try {
    const res = await axios.get(`${apiBase}/api/admin/licenses`)
    licenses.value = res.data || []
  } catch (err) {
    console.error('Error cargando licencias', err)
  }
}

function openAddModal() {
  editingClient.value = false
  form.value = { id: null, clientCode: '', name: '', email: '', phone: '', balanceUsd: 0, group: 'Grupo 1', licenseId: licenses.value[0]?.id || null, licenseStatus: 'En espera' }
  showModal.value = true
}

async function openEditModal(client) {
  editingClient.value = true
  if (licenses.value.length === 0) await loadLicenses()
  form.value = {
    ...client,
    licenseId: client.License?.id || null
  }
  showModal.value = true
}


function closeModal() {
  showModal.value = false
}

async function saveClient() {
  try {
    const token = localStorage.getItem('studio_token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    const payload = { ...form.value }
    if (!editingClient.value) {
      delete payload.id
    }

    console.log('Enviando cliente:', payload)

    if (editingClient.value) {
      await axios.put(`${apiBase}/api/admin/clients/${form.value.id}`, payload, config)
      showToast('Cliente actualizado')
    } else {
      await axios.post(`${apiBase}/api/admin/clients`, payload, config)
      showToast('Cliente agregado')
    }

    closeModal()
    loadClients()
  } catch (err) {
    console.error(err)
    showToast('Error guardando cliente', 'error')
  }
}

function openDeleteConfirm(client) {
  if (!confirm(`¿Eliminar cliente ${client.name}?`)) return
  deleteClient(client.id)
}
async function deleteClient(id) {
  try {
    const token = localStorage.getItem('studio_token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    await axios.delete(`${apiBase}/api/admin/clients/${id}`, config)
    showToast('Cliente eliminado')
    loadClients()
  } catch (err) {
    console.error(err)
    showToast('Error eliminando cliente', 'error')
  }
}

function formatMoney(v) {
  if (v === null || v === undefined) return '-'
  return Number(v).toFixed(2)
}

onMounted(() => {
  if (!auth.isAdmin) {
    error.value = 'No autorizado. Solo admins pueden acceder.'
    return
  }
  loadLicenses()
  loadClients()
})
</script>

<style scoped>
.table-wrap { overflow-x: auto; }
.styled-table { width: 100%; border-collapse: collapse; background: #1e1e2f; color: #fff; border-radius: 8px; overflow: hidden; }
.styled-table th, .styled-table td { padding: 12px; border-bottom: 1px solid #333; }
.styled-table th { background: #2d2d44; text-align: left; }
.row-hover:hover { background: #2a2a3d; }
.btn-primary { background: #4f46e5; color: #fff; padding: 8px 14px; border-radius: 6px; cursor: pointer; }
.btn-primary:hover { background: #4338ca; }
.btn-ghost { background: transparent; color: #bbb; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.btn-ghost:hover { background: #2d2d44; }
.link-btn { color: #3b82f6; cursor: pointer; margin-right: 8px; }
.link-btn--danger { color: #ef4444; }
.modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal-card { background: #fff; color: #000; padding: 20px; border-radius: 10px; width: 400px; }
.modal-title { font-size: 20px; margin-bottom: 10px; }
.modal-form .label { display: block; margin: 8px 0 4px; font-weight: bold; }
.input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
.toast { position: fixed; bottom: 20px; right: 20px; background: #4ade80; color: #000; padding: 12px 18px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 100; }
.toast--error { background: #f87171; }
</style>