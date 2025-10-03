<template>
  <div class="projects-wrapper">
    <h1 class="projects-title">Proyectos</h1>
    <p class="projects-subtitle">Listado de proyectos en curso.</p>

    <div v-if="loading" class="loading">Cargando proyectos...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else-if="projects.length === 0" class="no-projects">No hay proyectos para mostrar</div>

    <div class="projects-grid">
      <div v-for="project in projects" :key="project.Id" class="project-card">
        <img v-if="project.ImageUrl" :src="project.ImageUrl" alt="Imagen del proyecto" class="project-image"/>
        <h2 class="project-card-title">{{ project.Title }}</h2>
        <p><strong>Descripción:</strong> {{ project.Description || 'Sin descripción' }}</p>
        <p><strong>Características:</strong> {{ project.Features || 'N/A' }}</p>
        <p><strong>Instrucciones:</strong> {{ project.Instructions || 'N/A' }}</p>
        <div v-if="project.VideoUrl" class="project-video">
          <iframe :src="project.VideoUrl" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
const projects = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    let response, data
    const url = 'http://localhost:5147/api/projects'

    if (auth.isAuthenticated) {
      response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
    } else {
      response = await auth.fetchPublic(url)
    }

    if (!response.ok) throw new Error(`Error cargando proyectos: ${response.statusText}`)

    data = await response.json()
    projects.value = data.map(p => ({
      Id: p.id,
      Title: p.title,
      Description: p.description,
      Features: p.features,
      Instructions: p.instructions,
      ImageUrl: p.imageUrl,
      VideoUrl: p.videoUrl
    }))
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped src="../assets/ProjectsView.css"></style>
