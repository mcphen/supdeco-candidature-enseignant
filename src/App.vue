<template>
  <div class="app">
    <header v-if="showTopbar" class="topbar" role="banner">
      <div class="container">
        <RouterLink to="/" class="brand" aria-label="Accueil SUPDECO">
          <img class="logo" src="/logo_white.webp" alt="Logo SUPDECO" width="48" height="48" />
          <span class="brand-text">
            <strong>SUPDECO</strong>
            <small>Candidature Enseignant</small>
          </span>
        </RouterLink>
        <button class="menu-toggle" aria-label="Ouvrir le menu" aria-controls="primary-menu" :aria-expanded="mobileOpen ? 'true' : 'false'" @click="mobileOpen = !mobileOpen">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <nav id="primary-menu" class="menu" :class="{ open: mobileOpen }" aria-label="Navigation principale">
          <RouterLink to="/" class="link" @click="mobileOpen = false">Inscription</RouterLink>
          <RouterLink to="/login" class="link" @click="mobileOpen = false">Connexion</RouterLink>
          <RouterLink to="/portal" class="link" @click="mobileOpen = false">Portail</RouterLink>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { isAuthenticated } from './services/auth'
const mobileOpen = ref(false)
const route = useRoute()

// Hide topbar if user is authenticated or when navigating inside protected portal
const showTopbar = computed(() => {
  // Hide when authenticated or when route requires auth (ex: /portal)
  const requiresAuth = route.matched.some(r => r.meta && (r.meta as any).requiresAuth)
  return !isAuthenticated() && !requiresAuth
})

// Close mobile menu on route change
watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<style>
:root {
  --color-primary: #313f96;
  --color-secondary: #ffd300;
  --text-main: #0f172a;
  --text-muted: #475569;
  --bg-page: #f5f7fb;
  --card: #ffffff;
  --border: #e5e7eb;
}

/* Use border-box to prevent padding from causing overflow */
html { box-sizing: border-box; height: 100%; }
*, *::before, *::after { box-sizing: inherit; }

html, body, #app { height: 100%; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background: var(--bg-page); color: var(--text-main); }

/* Router active state */
.router-link-active.link { color: var(--color-secondary); }
</style>

<style scoped>
.app { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }

.topbar { position: sticky; top: 0; z-index: 50; background: var(--color-primary); color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.container { width: min(1200px, 100%); margin: 0 auto; padding: 0 1rem; }
.topbar .container { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

.brand { display: inline-flex; align-items: center; gap: 0.75rem; color: inherit; text-decoration: none; }
.logo { display: inline-flex; align-items: center; justify-content: center; background: #fff2; border: 1px solid #ffffff22; border-radius: 10px; padding: 2px; }
.brand-text { display: grid; line-height: 1; }
.brand-text strong { font-size: 1.05rem; letter-spacing: 0.3px; }
.brand-text small { font-size: 0.75rem; color: #e6e8ff; }

.menu { display: flex; gap: 0.75rem; }
.link { position: relative; color: #fff; text-decoration: none; font-weight: 600; padding: 0.4rem 0.6rem; border-radius: 8px; }
.link:hover { background: rgba(255,255,255,0.12); }
.link::after { content: ""; position: absolute; left: 0.6rem; right: 0.6rem; bottom: 0.1rem; height: 2px; background: transparent; transition: background 0.2s ease; }
.link:hover::after, .router-link-active.link::after { background: var(--color-secondary); }

.main { padding: 1.25rem 0 2rem; }

/* Responsive adjustments */
@media (max-width: 1024px) {
  .brand-text small { display: none; }
  .menu { gap: 0.5rem; }
  .link { padding: 0.35rem 0.5rem; }
}
@media (max-width: 900px) {
  .menu { flex-wrap: wrap; row-gap: 0.25rem; }
  .link { padding: 0.35rem 0.5rem; }
}
.menu-toggle { display: none; background: transparent; border: 0; padding: 0.4rem; margin-left: auto; cursor: pointer; border-radius: 8px; }
.menu-toggle:hover { background: rgba(255,255,255,0.12); }
.menu-toggle .bar { display: block; width: 22px; height: 2px; background: #fff; margin: 4px 0; border-radius: 2px; }

@media (max-width: 768px) {
  .brand-text small { display: none; }
  .topbar .container { flex-wrap: wrap; }
  .menu-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .menu { display: none; width: 100%; padding: 0.4rem 0; }
  .menu.open { display: grid; grid-template-columns: 1fr; gap: 0.25rem; }
  .link { padding: 0.6rem 0.75rem; }
  .main .container { padding: 0 0.75rem; }
}

/* Optional card helper for child views */
:deep(.card) { background: var(--card); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
</style>
