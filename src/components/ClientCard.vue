<template>
  <div class="client-card p-4 rounded-xl bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
    <h3 class="client-name text-lg font-bold mb-1">{{ client.name }}</h3>
    <p>Código: {{ client.clientCode }}</p>
    <p>Saldo: <span class="font-semibold text-yellow-400">{{ client.balanceUsd }} USD</span></p>

    <p>
      Licencia:
      <span class="font-semibold text-blue-400">
        {{ client.license?.name || 'Sin licencia' }}
      </span>
    </p>

    <p class="text-sm mt-1">
      Estado:
      <span
        :class="{
          'text-green-400 font-semibold': getLicenseStatus(client) === 'Activa',
          'text-yellow-400 font-semibold': getLicenseStatus(client) === 'En espera',
          'text-red-400 font-semibold': getLicenseStatus(client) === 'Inactiva',
          'text-gray-400': !getLicenseStatus(client)
        }"
      >
        {{ getLicenseStatus(client) }}
      </span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  client: { type: Object, required: true }
})

// Función para determinar el estado de licencia
const getLicenseStatus = (client) => {
  return client.licenseStatus || (client.activeLicense ? 'Activa' : 'Inactiva')
}
</script>
