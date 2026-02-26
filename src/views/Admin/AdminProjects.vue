<template>
  <div class="ml-64 p-6 text-white">
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold tracking-wide">Administrar Proyectos</h1>
      <button @click="openAddModal" class="admin-btn-primary flex items-center gap-2">
        <span class="text-lg">＋</span> Agregar Proyecto
      </button>
    </div>

    <!-- Estado de carga o error -->
    <div v-if="loading" class="admin-panel info">Cargando proyectos...</div>
    <div v-if="error" class="admin-panel error">{{ error }}</div>

    <!-- Tabla de proyectos -->
    <div v-if="!loading && !error" class="table-wrap">
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
              <img v-if="p.imageUrl" :src="getDriveImage(p.imageUrl)" alt="Foto" class="thumb" />
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
              <button @click="openDeleteConfirm(p)" class="link-btn link-btn--danger">
                Eliminar
              </button>
            </td>
          </tr>
          <tr v-if="projects.length === 0">
            <td colspan="6" class="text-center py-4 text-gray-400">
              No hay proyectos registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Add/Edit -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-backdrop">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h2 class="text-xl font-semibold text-white">
              {{ editingProject ? "Editar Proyecto" : "Agregar Proyecto" }}
            </h2>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

          <form @submit.prevent="saveProject" class="admin-form">
            <label class="form-label">Título</label>
            <input v-model="form.title" class="form-input" placeholder="Ej: CRM Corporativo" required />

            <label class="form-label">Descripción</label>
            <textarea
              v-model="form.description"
              class="form-input"
              rows="3"
              placeholder="Breve descripción del proyecto..."
            ></textarea>

            <label class="form-label">Características</label>
            <textarea
              v-model="form.features"
              class="form-input"
              rows="2"
              placeholder="Ej: Integración con API, dashboard moderno"
            ></textarea>

            <label class="form-label">Instrucciones</label>
            <textarea
              v-model="form.instructions"
              class="form-input"
              rows="2"
              placeholder="Instrucciones de instalación o uso"
            ></textarea>

            <label class="form-label">Foto (URL)</label>
            <input
              v-model="form.imageUrl"
              type="url"
              class="form-input"
              placeholder="https://ejemplo.com/imagen.jpg"
            />

            <label class="form-label">Video (URL)</label>
            <input
              v-model="form.videoUrl"
              type="url"
              class="form-input"
              placeholder="https://ejemplo.com/video.mp4"
            />

            <div class="modal-actions">
              <button type="button" class="admin-btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="admin-btn-primary">
                {{ editingProject ? "Actualizar" : "Guardar" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal Delete -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-backdrop">
        <div class="admin-modal small">
          <h2 class="text-lg font-semibold mb-2 text-white">Eliminar Proyecto</h2>
          <p class="text-gray-300 mb-6">
            ¿Seguro que deseas eliminar el proyecto <strong>{{ selectedProject?.title }}</strong>?
          </p>
          <div class="modal-actions">
            <button class="admin-btn-secondary" @click="closeDelete">Cancelar</button>
            <button class="admin-btn-danger" @click="confirmDelete">Eliminar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="toast" :class="['toast', toastType === 'error' ? 'toast--error' : '']">
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script>
import api from "@/axios";

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
      form: {
        id: null,
        title: "",
        description: "",
        imageUrl: "",
        videoUrl: "",
        features: "",
        instructions: "",
      },
      toast: null,
      toastType: "success",
    };
  },
  methods: {
    async loadProjects() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get("/api/projects");
        this.projects = res.data || [];
      } catch (err) {
        console.error("❌ Error al cargar proyectos:", err);
        this.error = "Error al cargar proyectos";
        this.showToast("No se pudieron cargar los proyectos ❌", "error");
      } finally {
        this.loading = false;
      }
    },
    getEmbedUrl(url) {
       if (!url) return "";
       const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
       if (match) {
         const id = match[1];
         if (url.includes("/view")) {
           // Si es imagen
           return `https://drive.google.com/uc?export=view&id=${id}`;
         } else {
           // Si es video
           return `https://drive.google.com/file/d/${id}/preview`;
         }
       }
       return url; // si no es de Drive
    },
    getDriveImage(url) {
      if (!url) return "";
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const id = match[1];
        // URL correcta para <img> desde Google Drive
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
      return url; // si no es Drive
    },
    openAddModal() {
      this.form = { id: null, title: "", description: "", imageUrl: "", videoUrl: "", features: "", instructions: "" };
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
        const payload = {
          id: this.form.id || 0,
          title: this.form.title,
          description: this.form.description,
          imageUrl: this.form.imageUrl,
          videoUrl: this.form.videoUrl,
          features: this.form.features || "",
          instructions: this.form.instructions || "",
          createdById: "admin",
          createdAt: new Date().toISOString(),
        };

        console.log("📤 Enviando payload al backend:", payload);

        if (this.editingProject && this.form.id) {
          await api.put(`/api/projects/${this.form.id}`, payload);
          this.showToast("Proyecto actualizado ✅");
        } else {
          await api.post("/api/projects", payload);
          this.showToast("Proyecto agregado ✅");
        }

        this.closeModal();
        await this.loadProjects();
      } catch (err) {
        console.error("❌ Error al guardar proyecto:", err);
        this.showToast("Error al guardar proyecto ❌", "error");
      }
    },
    async confirmDelete() {
      if (!this.selectedProject) return;
      try {
        await api.delete(`/api/projects/${this.selectedProject.id}`);
        this.showToast("Proyecto eliminado ✅");
        this.closeDelete();
        await this.loadProjects();
      } catch (err) {
        console.error("❌ Error al eliminar proyecto:", err);
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


<style scoped>
.table-wrap {
  overflow-x: auto;
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
  background: #1b1b2d;
  color: #fff;
  border-radius: 10px;
  overflow: hidden;
}
.styled-table th,
.styled-table td {
  padding: 12px;
  border-bottom: 1px solid #333;
}
.styled-table th {
  background: #2d2d44;
  text-align: left;
}
.row-hover:hover {
  background: #2a2a3d;
  transition: background 0.2s ease;
}
.thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.link-btn {
  color: #60a5fa;
  cursor: pointer;
  margin-right: 8px;
}
.link-btn--danger {
  color: #ef4444;
}
.admin-btn-primary {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.admin-btn-primary:hover {
  background: linear-gradient(135deg, #4338ca, #4f46e5);
}
.admin-btn-secondary {
  background: #2d2d44;
  color: #bbb;
  padding: 8px 14px;
  border-radius: 8px;
  transition: 0.3s;
}
.admin-btn-secondary:hover {
  background: #3a3a55;
}
.admin-btn-danger {
  background: #dc2626;
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
}
.admin-btn-danger:hover {
  background: #b91c1c;
}

/* MODAL */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 20, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(6px);
}
.admin-modal {
  background: #2a2a3d;
  color: #fff;
  border-radius: 14px;
  padding: 24px;
  width: 480px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
  animation: modalIn 0.25s ease;
}
.admin-modal.small {
  width: 380px;
}
.admin-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 20px;
  cursor: pointer;
}
.close-btn:hover {
  color: #fff;
}
.form-label {
  display: block;
  margin-top: 10px;
  margin-bottom: 4px;
  color: #cbd5e1;
  font-weight: 600;
}
.form-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #1e1e2f;
  border: 1px solid #3b3b55;
  color: #fff;
  outline: none;
  transition: border 0.2s ease;
}
.form-input:focus {
  border-color: #6366f1;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

/* ANIMACIONES */
@keyframes modalIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* TOAST */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4ade80;
  color: #000;
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 100;
}
.toast--error {
  background: #f87171;
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
</style>
