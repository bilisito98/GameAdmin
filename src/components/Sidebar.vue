<template>
  <aside :class="['sidebar', { open: isOpen }]">
    <div class="sidebar-header">
      <div class="sidebar-logo">Studio API</div>
      <!-- Close btn visible en móviles -->
      <button class="sidebar-close" @click="$emit('toggle')" aria-label="Cerrar menú">✕</button>
    </div>

    <nav class="sidebar-nav">
      <!-- Enlaces normales -->
      <router-link
        v-for="link in publicLinks"
        :key="link.name"
        :to="link.path"
        class="sidebar-link"
        active-class="sidebar-link-active"
        @click.native="$emit('toggle')"
      >
        {{ link.name }}
      </router-link>

      <!-- Enlaces de administración visibles solo para admin -->
      <router-link
        v-if="auth.isAdmin"
        to="/admin/clients"
        class="sidebar-link"
        active-class="sidebar-link-active"
        @click.native="$emit('toggle')"
      >
        Admin Clientes
      </router-link>

      <router-link
        v-if="auth.isAdmin"
        to="/admin/projects"
        class="sidebar-link"
        active-class="sidebar-link-active"
        @click.native="$emit('toggle')"
      >
        Admin Proyectos
      </router-link>
    </nav>

    <div class="sidebar-footer">© 2025 Studio</div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../store/authStore'

defineProps({ isOpen: Boolean })
defineEmits(['toggle'])

const auth = useAuthStore()

// Enlaces visibles para todos los usuarios autenticados
const publicLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Clientes', path: '/clients' },
  { name: 'Licencias', path: '/licenses' },
  { name: 'Proyectos', path: '/projects' },
  { name: 'Solicitud', path: '/request' },
  { name: 'Quiénes Somos', path: '/about' }
]
</script>

<style src="../assets/Sidebar.css"></style>

