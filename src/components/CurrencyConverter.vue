<template>
  <div class="bg-white shadow p-4 rounded w-72">
    <h2 class="text-lg font-semibold mb-2">Conversor USD</h2>
    <input type="number" v-model.number="usd" class="border px-2 py-1 w-full mb-2" placeholder="Monto en USD"/>
    <select v-model="to" class="border px-2 py-1 w-full mb-2">
      <option value="COP">COP</option>
      <option value="EUR">EUR</option>
      <option value="PEN">PEN</option>
    </select>
    <div class="text-gray-700">Resultado: {{ result }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const usd = ref(1)
const to = ref('COP')
const RATES = { COP: 3500, EUR: 0.92, PEN: 3.8 }
const result = computed(()=> (usd.value * (RATES[to.value] || 1)).toFixed(2))
</script>
