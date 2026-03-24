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

        <!-- Error -->
        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="modal-actions">
          <button
            type="button"
            class="btn-ghost"
            @click="close"
            :disabled="loading"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
          >
            <span v-if="loading">Ingresando...</span>
            <span v-else>Ingresar</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/authStore'
import { useRouter } from 'vue-router'
import '@/assets/modal.css'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

const emit = defineEmits(['close'])
const close = () => emit('close')

const doLogin = async () => {
  error.value = null
  loading.value = true

  try {
    const ok = await auth.login(email.value.trim(), password.value.trim())

    if (!ok) {
      error.value = 'Credenciales inválidas'
      return
    }

    emit('close')

    // 🔥 Redirección correcta por rol
    if (auth.isAdmin) {
      router.push('/admin/clients')
    } else {
      router.push('/clients')
    }

  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Error conectando con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
