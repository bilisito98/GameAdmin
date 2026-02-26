<template>
  <div class="request-wrapper">
    <h1 class="request-title">Solicitudes</h1>
    <p class="request-subtitle">Gestiona las solicitudes de servicio de los clientes por proyecto.</p>

    <div v-if="loading" class="loading-text">Cargando clientes...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>

    <div v-else>
      <div v-for="(grupo, proyecto) in clientesAgrupados" :key="proyecto" class="grupo-clientes">
        <h2 class="project-title">{{ proyecto }}</h2>
        <div class="clients-list">
          <div v-for="c in grupo" :key="c.Id" class="client-card">
            <h3 class="client-name">{{ c.Name }}</h3>
            <p><strong>ID:</strong> {{ c.Id }}</p>
            <p><strong>Saldo:</strong> {{ c.BalanceUsd }}</p>
            <p><strong>Licencia:</strong> {{ c.ActiveLicense ? 'Activa' : 'Inactiva' }}</p>
            <button class="request-btn" @click="abrirBanner(c)">Hacer Solicitud</button>
          </div>
        </div>
      </div>
    </div>

    <div class="overlay" :class="{ show: bannerOpen }" @click="cerrarBanner"></div>

    <div class="request-banner" :class="{ show: bannerOpen }">
      <h3 class="client-name">Solicitud De: {{ clienteSeleccionado?.Name }}</h3>
      <input v-model="nuevoCliente" type="text" placeholder="Nombre del cliente" />
      <input v-model="monto" type="number" placeholder="Monto en USD" min="1"  />
      <textarea v-model="descripcion" rows="3" placeholder="Detalle de la solicitud"></textarea>
      <button class="request-btn" @click="enviarSolicitud">Enviar Solicitud</button>
      <button style="margin-top:0.5rem; background:#f87171;" @click="cerrarBanner">Cancelar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
const clients = ref([])
const loading = ref(true)
const error = ref(null)

const bannerOpen = ref(false)
const clienteSeleccionado = ref(null)
const nuevoCliente = ref("")
const monto = ref(0)
const descripcion = ref("")

const abrirBanner = (cliente) => {
  clienteSeleccionado.value = cliente
  nuevoCliente.value = cliente.Name
  descripcion.value = ""
  monto.value = 0
  bannerOpen.value = true
}

const cerrarBanner = () => { bannerOpen.value = false }

const enviarSolicitud = async () => {
  if (!clienteSeleccionado.value || !descripcion.value || monto.value <= 0) {
    alert("Completa todos los campos correctamente.")
    return
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({
        ClientId: clienteSeleccionado.value.Id,
        AmountUsd: Number(monto.value),
        Message: descripcion.value
      })
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || "Error enviando solicitud")
    }

    alert("Solicitud enviada")
    bannerOpen.value = false
  } catch (err) {
    alert(err.message)
  }
}

const clientesAgrupados = computed(() => {
  const grupos = {}
  clients.value.forEach(c => {
    const proyecto = c.ProjectName || "General"
    if (!grupos[proyecto]) grupos[proyecto] = []
    grupos[proyecto].push(c)
  })
  return grupos
})

onMounted(async () => {
  try {
    let data
    if (auth.isAuthenticated) {
      const res = await fetch('http://localhost:5147/api/clients', {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      if (!res.ok) throw new Error("Error cargando clientes autenticados")
      data = await res.json()
    } else {
      data = await auth.fetchPublic('http://localhost:5147/api/clients')
    }

    clients.value = data.map(c => ({
      Id: c.id,
      ClientCode: c.clientCode,
      Name: c.name,
      BalanceUsd: c.balanceUsd,
      ActiveLicense: c.activeLicense,
      ProjectName: c.projectName
    }))
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped src="../assets/RequestView.css"></style>
