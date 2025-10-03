<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2 class="modal-title">Iniciar Sesión</h2>

      <form @submit.prevent="doLogin" class="modal-form">
        <label for="email" class="label">Correo</label>
        <input
            id="email"
            v-model="email"
            type="email"
            class="input"
            placeholder="correo@dominio.com"
            required
        />

        <label for="password" class="label">Contraseña</label>
        <input
            id="password"
            v-model="password"
            type="password"
            class="input"
            placeholder="********"
            required
        />

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" @click="close">Cancelar</button>
          <button type="submit" class="btn-primary">Ingresar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref(null)

// Para emitir al padre que cierre el modal
const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const doLogin = async () => {
  error.value = null
  const apiBase = 'http://localhost:5147'

  try {
    const ok = await auth.login(apiBase, email.value.trim(), password.value.trim())
    if (!ok) {
      error.value = 'Credenciales inválidas o error en el servidor'
    } else {
      emit('close') // Cerrar modal
      // Redirigir según rol
      if (auth.isAdmin) router.push('/admin/clients')
      else router.push('/clients')
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Error conectando con el servidor'
  }
}
</script>

<style src="../assets/modal.css"></style>
