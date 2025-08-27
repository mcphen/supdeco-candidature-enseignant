<template>
  <section class="forgot">
    <div class="card">
      <header class="header">
        <h2 class="title">Mot de passe oublié</h2>
        <p class="subtitle">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
      </header>

      <form @submit.prevent="onSubmit" class="form" novalidate>
        <div class="row">
          <label for="email" class="required">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" :aria-invalid="!!error" placeholder="nom@exemple.com" />
        </div>

        <div class="actions">
          <button type="submit" class="submit" :disabled="loading">{{ loading ? 'Envoi…' : 'Envoyer le lien' }}</button>
          <p class="helper">Vous vous souvenez de votre mot de passe ? <RouterLink to="/login" class="link">Se connecter</RouterLink></p>
          <p v-if="message" class="alert success">✅ {{ message }}</p>
          <p v-if="error" class="alert danger">⚠️ {{ error }}</p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

async function onSubmit() {
  message.value = ''
  error.value = ''
  loading.value = true
  try {
    // Simulation de l'envoi du lien de réinitialisation.
    await new Promise(resolve => setTimeout(resolve, 900))
    if (!/.+@.+\..+/.test(email.value)) {
      throw new Error('Veuillez entrer une adresse email valide.')
    }
    message.value = 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.'
  } catch (e: any) {
    error.value = e?.message || 'Une erreur est survenue. Réessayez.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot { display: grid; place-items: center; padding: 2rem 1rem; min-height: calc(100vh - 64px); }
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
.alert.success { color: #065f46; background: #ecfdf5; border-color: #a7f3d0; }
.alert.danger { color: #7f1d1d; background: #fef2f2; border-color: #fecaca; }

@media (max-width: 420px) {
  .form { padding: 1rem; }
  .submit { width: 100%; }
}
</style>
