import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import HomeView from '../views/HomeView.vue'
import ClientsView from '../views/ClientsView.vue'
import LicensesView from '../views/LicensesView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import RequestView from '../views/RequestView.vue'
import AboutView from '../views/AboutView.vue'
import AdminClients from '../views/Admin/AdminClients.vue'
import AdminProjects from '../views/Admin/AdminProjects.vue'

const routes = [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/clients', name: 'clients', component: ClientsView, meta: { requiresAuth: true } },
    { path: '/licenses', name: 'licenses', component: LicensesView, meta: { requiresAuth: true } },
    { path: '/projects', name: 'projects', component: ProjectsView, meta: { requiresAuth: true } },
    { path: '/request', name: 'request', component: RequestView, meta: { requiresAuth: true } },
    { path: '/about', name: 'about', component: AboutView, meta: { requiresAuth: true } },
    { path: '/admin/clients', name: 'admin-clients', component: AdminClients, meta: { requiresAuth: true, role: 'Admin' } },
    { path: '/admin/projects', name: 'admin-projects', component: AdminProjects, meta: { requiresAuth: true, role: 'Admin' } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()
    if (auth.loading) await auth.restoreSession() // asegura sesión restaurada

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next('/') // redirige a login modal
    } else if (to.meta.role && !auth.isAdmin) {
        next('/') // usuario no admin intenta entrar a ruta admin
    } else {
        next()
    }
})

export default router
