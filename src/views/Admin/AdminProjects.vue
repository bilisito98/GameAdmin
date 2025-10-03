<template>
  <div class="ml-64 p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">Administrar Proyectos</h1>
      <button @click="openAddModal" class="btn-primary">+ Agregar Proyecto</button>
    </div>

    <div v-if="loading" class="panel panel--info">Cargando proyectos...</div>
    <div v-if="error" class="panel panel--error">{{ error }}</div>

    <div class="table-wrap" v-if="!loading && !error">
      <table class="styled-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Foto</th>
          <th>Video</th>
          <th>Título</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="p in projects" :key="p.id" class="row-hover">
          <td>{{ p.id }}</td>
          <td>
            <img v-if="p.imageUrl" :src="p.imageUrl" alt="Foto" class="thumb" />
            <span v-else>-</span>
          </td>
          <td>
            <video v-if="p.videoUrl" :src="p.videoUrl" class="thumb" controls></video>
            <span v-else>-</span>
          </td>
          <td>{{ p.title }}</td>
          <td class="truncate">{{ p.description }}</td>
          <td class="actions-col">
            <button @click="openEditModal(p)" class="link-btn">Editar</button>
            <button @click="openDeleteConfirm(p)" class="link-btn link-btn--danger">Eliminar</button>
          </td>
        </tr>
        <tr v-if="projects.length === 0">
          <td colspan="6" class="text-center">No hay proyectos para mostrar.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Add/Edit -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-card">
        <h3 class="modal-title">{{ editingProject ? 'Editar Proyecto' : 'Agregar Proyecto' }}</h3>

        <form @submit.prevent="saveProject" class="modal-form">
          <label class="label">Título</label>
          <input v-model="form.title" class="input" placeholder="Ej: CRM Corporativo" required />

          <label class="label">Descripción</label>
          <textarea v-model="form.description" class="input" rows="3" placeholder="Breve descripción..."></textarea>

          <label class="label">Foto (URL)</label>
          <input v-model="form.imageUrl" type="url" class="input" placeholder="https://ejemplo.com/imagen.jpg" />

          <label class="label">Video (URL)</label>
          <input v-model="form.videoUrl" type="url" class="input" placeholder="https://ejemplo.com/video.mp4" />

          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary">{{ editingProject ? 'Actualizar' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Delete -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-card">
        <h3 class="modal-title">Eliminar proyecto</h3>
        <p>¿Eliminar el proyecto <strong>{{ selectedProject?.title }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn-ghost" @click="closeDelete">Cancelar</button>
          <button class="btn-danger" @click="confirmDelete">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="toast" :class="['toast', toastType === 'error' ? 'toast--error' : '']">
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      projects: [],
      loading: false,
      error: null,
      showModal: false,
      showDeleteModal: false,
      editingProject: false,
      selectedProject: null,
      form: this.emptyForm(),
      toast: null,
      toastType: "success",
      apiBase: null,
    };
  },
  methods: {
    emptyForm() {
      return {
        id: null,
        title: "",
        description: "",
        imageUrl: "",
        videoUrl: "",
      };
    },
    async determineApiBase() {
      const candidates = [
        { url: "https://localhost:5001" },
        { url: "http://localhost:5000" },
      ];
      for (const c of candidates) {
        try {
          const test = await axios.get(`${c.url}/api/projects`, { timeout: 3000 });
          if (test && test.status >= 200 && test.status < 400) {
            this.apiBase = c.url;
            return;
          }
        } catch {}
      }
      this.apiBase = "http://localhost:5147";
    },
    async loadProjects() {
      this.loading = true;
      this.error = null;
      if (!this.apiBase) await this.determineApiBase();
      try {
        const res = await axios.get(`${this.apiBase}/api/projects`);
        this.projects = res.data || [];
      } catch {
        this.error = "Error al cargar proyectos";
        this.showToast("No se pudieron cargar proyectos", "error");
      } finally {
        this.loading = false;
      }
    },
    openAddModal() {
      this.form = this.emptyForm();
      this.editingProject = false;
      this.showModal = true;
    },
    openEditModal(p) {
      this.form = { ...p };
      this.editingProject = true;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.form = this.emptyForm();
    },
    openDeleteConfirm(p) {
      this.selectedProject = p;
      this.showDeleteModal = true;
    },
    closeDelete() {
      this.showDeleteModal = false;
      this.selectedProject = null;
    },
    async saveProject() {
      try {
        if (!this.apiBase) await this.determineApiBase();
        const payload = { ...this.form };
        if (this.editingProject && this.form.id) {
          await axios.put(`${this.apiBase}/api/projects/${this.form.id}`, payload);
          this.showToast("Proyecto actualizado ✅");
        } else {
          await axios.post(`${this.apiBase}/api/projects`, payload);
          this.showToast("Proyecto agregado ✅");
        }
        this.closeModal();
        await this.loadProjects();
      } catch {
        this.showToast("Error al guardar proyecto ❌", "error");
      }
    },
    async confirmDelete() {
      if (!this.selectedProject) return;
      try {
        if (!this.apiBase) await this.determineApiBase();
        await axios.delete(`${this.apiBase}/api/projects/${this.selectedProject.id}`);
        this.showToast("Proyecto eliminado ✅");
        this.closeDelete();
        await this.loadProjects();
      } catch {
        this.showToast("Error al eliminar proyecto ❌", "error");
      }
    },
    showToast(msg, type = "success") {
      this.toast = msg;
      this.toastType = type;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => (this.toast = null), 3500);
    },
  },
  async mounted() {
    await this.loadProjects();
  },
};
</script>

<style>
/* reutilizamos los mismos estilos que ya hiciste para AdminClients */
.table-wrap { overflow-x: auto; }
.styled-table {
  width: 100%;
  border-collapse: collapse;
  background: #1e1e2f;
  color: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.styled-table th, .styled-table td {
  padding: 12px;
  border-bottom: 1px solid #333;
}
.styled-table th {
  background: #2d2d44;
  text-align: left;
}
.row-hover:hover { background: #2a2a3d; }
.thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
/* Botones */
.btn-primary {
  background: #4f46e5;
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-primary:hover { background: #4338ca; }
.btn-ghost {
  background: transparent;
  color: #bbb;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-ghost:hover { background: #2d2d44; }
.link-btn {
  color: #3b82f6;
  cursor: pointer;
  margin-right: 8px;
}
.link-btn--danger { color: #ef4444; }
/* Modal */
.modal-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
.modal-card {
  background: #fff;
  color: #000;
  padding: 20px;
  border-radius: 10px;
  width: 450px;
}
.modal-title { font-size: 20px; margin-bottom: 10px; }
.modal-form .label { display: block; margin: 8px 0 4px; font-weight: bold; }
.input, textarea {
  width: 100%; padding: 8px;
  border: 1px solid #ccc; border-radius: 6px;
  margin-bottom: 8px;
}
.modal-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 12px;
}
.btn-danger {
  background: #dc2626; color: white;
  padding: 6px 12px; border-radius: 6px;
}
.btn-danger:hover { background: #b91c1c; }
/* Toast */
.toast {
  position: fixed; bottom: 20px; right: 20px;
  background: #4ade80; color: #000;
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  z-index: 100;
}
.toast--error { background: #f87171; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity .3s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; }
</style>
