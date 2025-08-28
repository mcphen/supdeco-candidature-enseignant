<template>
  <div class="layout" :class="{ 'sidebar-open': sidebarOpen }">
    <aside class="sidebar" role="complementary" aria-label="Navigation latérale">
      <RouterLink to="/portal/dashboard" class="brand" @click="closeSidebar" aria-label="Accueil portail">
        <img class="logo" src="/logo_white.webp" alt="Logo SUPDECO" width="100" height="100" />
      </RouterLink>

      <div class="user">
        <div class="avatar" aria-hidden="true">{{ initials }}</div>
        <div class="user-info">
          <span class="name">{{ user?.prenom }} {{ user?.nom }}</span>
          <span class="email" v-if="user?.email">{{ user?.email }}</span>
        </div>
      </div>

      <nav class="menu" role="navigation" aria-label="Menu du portail">
        <RouterLink class="menu-link" :class="{active: isActive('/portal/dashboard')}" to="/portal/dashboard" @click="closeSidebar">Dashboard</RouterLink>
        <RouterLink class="menu-link" :class="{active: isActive('/portal/profil')}" to="/portal/profil" @click="closeSidebar">Mon profil</RouterLink>
        <RouterLink class="menu-link" :class="{active: isActive('/portal/parametres')}" to="/portal/parametres" @click="closeSidebar">Paramètres</RouterLink>
        <RouterLink class="menu-link" :class="{active: isActive('/portal/soumettre')}" to="/portal/soumettre" @click="closeSidebar">Soumettre son dossier</RouterLink>
      </nav>
      <button class="logout" @click="logout">Se déconnecter</button>
    </aside>

    <section class="content" role="main">
      <header class="topbar">
        <button class="sidebar-toggle" aria-label="Ouvrir le menu" @click="toggleSidebar">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <h2 class="page-title">{{ pageTitle }}</h2>
        <div class="spacer"></div>
        <div class="top-user" title="Compte utilisateur">
          <div class="avatar sm" aria-hidden="true">{{ initials }}</div>
        </div>
      </header>
      <div class="page">
        <router-view />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { clearSession, getUser } from '../services/auth'
import { ref, onMounted, computed, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const user = ref(getUser())
const sidebarOpen = ref(false)

onMounted(() => {
  user.value = getUser()
})

watch(() => route.fullPath, () => { sidebarOpen.value = false })

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
function closeSidebar() { sidebarOpen.value = false }

function logout() {
  clearSession()
  router.push('/login')
}

function isActive(path: string) {
  return route.path === path
}

const pageTitle = computed(() => {
  if (route.path.includes('/portal/soumettre')) return 'Soumettre son dossier'
  if (route.path.includes('/portal/profil')) return 'Mon profil'
  if (route.path.includes('/portal/parametres')) return 'Paramètres du compte'
  return 'Dashboard'
})

const initials = computed(() => {
  const n = user.value
  if (!n) return 'U'
  const p1 = (n.prenom || '').trim().charAt(0)
  const p2 = (n.nom || '').trim().charAt(0)
  return (p1 + p2 || 'U').toUpperCase()
})
</script>

<style scoped>
/* Fixed full-screen admin layout */
.layout { position: fixed; inset: 0; display: grid; grid-template-columns: 260px 1fr; overflow: hidden; background: #f3f4f6; }

/* Sidebar */
.sidebar { background: #0f172a; color: #e2e8f0; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.brand { display: flex; align-items: center; justify-content: center; color: #e2e8f0; text-decoration: none; }
.logo { display: inline-flex; align-items: center; justify-content: center; background: #ffffff12; border: 1px solid #ffffff22; border-radius: 10px; padding: 2px; }
.brand-text { display: grid; line-height: 1; }
.brand-text strong { font-size: 0.98rem; letter-spacing: .2px; }
.brand-text small { font-size: 0.72rem; color: #cbd5e1; }

.user { display: flex; align-items: center; gap: 0.6rem; background: #0b1222; border: 1px solid #1f2937; padding: 0.5rem; border-radius: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 999px; background: #1e293b; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; color: #93c5fd; }
.avatar.sm { width: 28px; height: 28px; font-size: 0.8rem; }
.user-info { display: grid; line-height: 1.1; }
.name { font-size: 0.9rem; color: #e2e8f0; }
.email { font-size: 0.75rem; color: #94a3b8; }

.menu { display: grid; gap: 0.25rem; margin-top: 0.25rem; margin-bottom: auto; }
.menu-link { color: #e2e8f0; text-decoration: none; padding: 0.5rem 0.75rem; border-radius: 6px; }
.menu-link.active, .menu-link:hover { background: #1e293b; }
.logout { margin-top: 0.75rem; padding: 0.5rem 0.75rem; background: #ef4444; color: #fff; border: none; border-radius: 6px; cursor: pointer; }

/* Content area */
.content { display: grid; grid-template-rows: auto 1fr; background: #f3f4f6; min-width: 0; min-height: 0; }
.topbar { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.75rem; }
.page-title { margin: 0; color: #111827; font-size: 1.05rem; }
.spacer { flex: 1 1 auto; }
.page { min-width: 0; min-height: 0; overflow: auto; padding: 1rem; }

/* Toggle button */
.sidebar-toggle { display: none; background: transparent; border: 0; padding: 0.4rem; border-radius: 8px; cursor: pointer; }
.sidebar-toggle:hover { background: #f3f4f6; }
.sidebar-toggle .bar { display: block; width: 22px; height: 2px; background: #111827; margin: 4px 0; border-radius: 2px; }

/* Mobile: off-canvas sidebar and fixed content */
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 260px; padding: 1rem; transform: translateX(-100%); transition: transform 0.2s ease; z-index: 60; }
  .layout.sidebar-open .sidebar { transform: translateX(0); }
  .content { height: 100vh; }
  .topbar { position: sticky; top: 0; z-index: 50; }
  .sidebar-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .menu { gap: 0.25rem; }
  .page { padding: 0.75rem; }
}
</style>
