<template>
  <section class="reset">
    <div class="card">
      <header class="header">
        <h2 class="title">Réinitialiser le mot de passe</h2>
        <p class="subtitle">Définissez un nouveau mot de passe pour votre compte.</p>
      </header>

      <form @submit.prevent="onSubmit" class="form" novalidate>
        <div class="row">
          <label for="email" class="required">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" :readonly="true" />
        </div>

        <div class="row">
          <label for="password" class="required">Nouveau mot de passe</label>
          <input id="password" v-model="password" type="password" required autocomplete="new-password" placeholder="*******" />
        </div>

        <div class="row">
          <label for="password_confirmation" class="required">Confirmer le mot de passe</label>
          <input id="password_confirmation" v-model="passwordConfirmation" type="password" required autocomplete="new-password" placeholder="*******" />
        </div>

        <div class="actions">
          <button type="submit" class="submit" :disabled="loading">{{ loading ? 'Réinitialisation…' : 'Réinitialiser' }}</button>
          <p v-if="message" class="alert success">✅ {{ message }}</p>
          <p v-if="error" class="alert danger">⚠️ {{ error }}</p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../api/http'

const route = useRoute()
const router = useRouter()

const email = ref('')
const token = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

onMounted(() => {
  email.value = String(route.query.email || '')
  token.value = String(route.query.token || '')
})

async function onSubmit() {
  message.value = ''
  error.value = ''
  loading.value = true
  try {
    if (!/.+@.+\..+/.test(email.value)) {
      throw new Error('Lien invalide: email manquant ou incorrect.')
    }
    if (!token.value) {
      throw new Error('Lien invalide: token manquant.')
    }
    if (password.value.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères.')
    }
    if (password.value !== passwordConfirmation.value) {
      throw new Error('Les mots de passe ne correspondent pas.')
    }

    const { data } = await http.post('/enseignants/reset-password', {
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    message.value = data?.message || 'Mot de passe réinitialisé avec succès.'

    // Redirection après un court délai
    setTimeout(() => {
      router.replace({ name: 'login' })
    }, 800)
  } catch (e: any) {
    if (e?.response?.data?.errors) {
      const errs = e.response.data.errors
      const first = Object.values(errs)[0] as any
      error.value = Array.isArray(first) ? first[0] : String(first)
    } else if (e?.response?.data?.message) {
      error.value = e.response.data.message
    } else if (e?.message) {
      error.value = e.message
    } else {
      error.value = 'Une erreur est survenue. Réessayez.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset { display: grid; place-items: center; padding: 2rem 1rem; min-height: calc(100vh - 64px); }
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
.actions { display: grid; gap: 0.75rem; margin-top: 0.25rem; }
.submit { padding: 0.8rem 1rem; border-radius: 10px; background: var(--color-primary); color: #fff; border: none; cursor: pointer; font-weight: 700; letter-spacing: 0.2px; box-shadow: 0 8px 20px rgba(49,63,150,0.22); }
.submit:hover { background: #293584; }
.submit[disabled] { opacity: 0.7; cursor: not-allowed; }
.alert { margin: 0; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid; }
.alert.success { color: #065f46; background: #ecfdf5; border-color: #a7f3d0; }
.alert.danger { color: #7f1d1d; background: #fef2f2; border-color: #fecaca; }

@media (max-width: 420px) {
  .form { padding: 1rem; }
  .submit { width: 100%; }
}
</style>
