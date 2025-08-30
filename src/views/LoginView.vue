<template>
  <section class="login">
    <div class="card">
      <header class="header">
        <h2 class="title">Connexion Candidat</h2>
        <p class="subtitle">Accédez à votre espace pour suivre votre candidature.</p>
      </header>

      <form @submit.prevent="onSubmit" class="form" novalidate>
        <div class="row">
          <label for="email" class="required">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" :aria-invalid="!!error" placeholder="nom@exemple.com" />
        </div>
        <div class="row">
          <label for="password" class="required">Mot de passe</label>
          <input id="password" v-model="password" type="password" required autocomplete="current-password" :aria-invalid="!!error" placeholder="••••••••" />
        </div>

        <div class="actions">
          <button type="submit" class="submit" :disabled="loading">{{ loading ? 'Connexion…' : 'Se connecter' }}</button>
          <p class="helper"><RouterLink to="/forgot-password" class="link">Mot de passe oublié ?</RouterLink></p>
          <p class="helper">Pas encore de compte ? <RouterLink to="/" class="link">Créer un compte</RouterLink></p>
          <p v-if="error" class="alert danger">⚠️ {{ error }}</p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const ok = await auth.login({ email: email.value, password: password.value })
    if (ok) {
      const redirect = (route.query.redirect as string) || '/portal'
      router.push(redirect)
    } else {
      error.value = auth.error || 'Impossible de se connecter.'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Impossible de se connecter.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login { display: grid; place-items: center;  min-height: calc(100vh - 64px); }
.card { width: min(520px, 100%); background: var(--card); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 10px 30px rgba(17,24,39,0.06); overflow: hidden; }
.header { padding: 1.25rem 1.25rem 0; }
.title { margin: 0; color: var(--color-primary); display: flex; align-items: center; gap: 0.5rem; }
.title::before { content: ""; width: 10px; height: 10px; background: var(--color-secondary); border-radius: 2px; box-shadow: 0 0 0 3px rgba(255, 211, 0, 0.25); }
.subtitle { margin: 0.5rem 0 0; color: var(--text-muted); font-size: 0.95rem; }
.form { display: grid; gap: 1rem; padding: 1.25rem; }
.row { display: grid; gap: 0.45rem; }
label { font-weight: 600; color: #111827; }
label.required::after { content: ' *'; color: #ef4444; }
input { padding: 0.65rem 0.8rem; border: 1px solid #d1d5db; border-radius: 10px; background: #fff; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
input::placeholder { color: #9ca3af; }
input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(49, 63, 150, 0.16); }
input[aria-invalid="true"] { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12); }
.actions { display: grid; gap: 0.75rem; margin-top: 0.25rem; }
.submit { padding: 0.8rem 1rem; border-radius: 10px; background: var(--color-primary); color: #fff; border: none; cursor: pointer; font-weight: 700; letter-spacing: 0.2px; box-shadow: 0 8px 20px rgba(49,63,150,0.22); }
.submit:hover { background: #293584; }
.submit[disabled] { opacity: 0.7; cursor: not-allowed; }
.helper { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
.link { color: var(--color-primary); font-weight: 600; text-decoration: none; }
.link:hover { text-decoration: underline; }
.alert { margin: 0; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid; }
.alert.danger { color: #7f1d1d; background: #fef2f2; border-color: #fecaca; }

@media (max-width: 420px) {
  .form { padding: 1rem; }
  .submit { width: 100%; }
}
</style>
