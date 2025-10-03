<template>
  <transition-group name="toast" tag="div" class="toast-container">
    <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="`toast-${t.type}`"
    >
      <span>{{ t.message }}</span>
      <button class="toast-close" @click="removeToast(t.id)">✕</button>
    </div>
  </transition-group>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])

const addToast = (message, type = 'success', duration = 3000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })

  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// Exponemos método global para llamar desde cualquier vista
defineExpose({ addToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 9999;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 250px;
  padding: 0.8rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
  animation: fadeIn 0.3s ease;
}

.toast-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
.toast-error   { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.toast-info    { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.toast-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }

.toast-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
