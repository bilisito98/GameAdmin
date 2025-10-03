<template>
  <aside :class="['sidebar', { open: isOpen }]">
    <div class="sidebar-header">
      <div class="sidebar-logo">Studio API</div>
      <!-- Close btn visible en móviles -->
      <button class="sidebar-close" @click="$emit('toggle')" aria-label="Cerrar menú">✕</button>
    </div>

    <nav class="sidebar-nav">
      <router-link
          v-for="link in links"
          :key="link.name"
          :to="link.path"
          class="sidebar-link"
          active-class="sidebar-link-active"
          @click.native="$emit('toggle')"
      >
        {{ link.name }}
      </router-link>
    </nav>

    <div class="sidebar-footer">© 2025 Studio</div>
  </aside>
</template>

<script setup>
defineProps({ isOpen: Boolean })
defineEmits(['toggle'])

const links = [
  { name: 'Inicio', path: '/' },
  { name: 'Clientes', path: '/clients' },
  { name: 'Licencias', path: '/licenses' },
  { name: 'Proyectos', path: '/projects' },
  { name: 'Solicitud', path: '/request' },
  { name: 'Quiénes Somos', path: '/about' },
  { name: 'Admin Clientes', path: '/admin/clients' },
  { name: 'Admin Proyectos', path: '/admin/projects' }
]
</script>

<style src="../assets/sidebar.css"></style>
