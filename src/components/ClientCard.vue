<template>
  <div class="client-card">
    <h3 class="client-name">{{ client.name }}</h3>
    <p>Código: {{ client.clientCode }}</p>
    <p>Saldo: <span class="font-semibold">{{ client.balanceUsd }} USD</span></p>
    <p>
      Licencia:
      <span :class="client.activeLicense ? 'text-green-600 font-semibold' : 'text-gray-400'">
        {{ client.license?.name || 'Sin licencia' }}
      </span>
    </p>
    <p class="text-xs text-gray-500">
      Adquirida: {{ client.acquiredAt ? new Date(client.acquiredAt).toLocaleDateString() : '-' }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  client: { type: Object, required: true }
})
</script>
