<template>
  <div class="card">
    <h3>Paramètres du compte</h3>

    <div class="tabs" role="tablist" aria-label="Paramètres">
      <button :class="['tab', activeTab==='prefs' && 'active']" role="tab" aria-selected="true" @click="activeTab='prefs'">Préférences</button>
      <button :class="['tab', activeTab==='password' && 'active']" role="tab" aria-selected="false" @click="activeTab='password'">Mot de passe</button>
    </div>

    <section v-if="activeTab==='prefs'" class="panel" role="tabpanel">
      <h4>Préférences de communication</h4>
      <form @submit.prevent="savePrefs" class="form">
        <label class="checkbox">
          <input type="checkbox" v-model="newsletter" />
          <span>Recevoir la newsletter et d'autres informations du groupe</span>
        </label>
        <div class="actions">
          <button class="btn-primary" type="submit" :disabled="savingPrefs">{{ savingPrefs ? 'Enregistrement…' : 'Enregistrer' }}</button>
          <p v-if="msgPrefs" class="alert success">✅ {{ msgPrefs }}</p>
          <p v-if="errPrefs" class="alert danger">⚠️ {{ errPrefs }}</p>
        </div>
      </form>
    </section>

    <section v-else class="panel" role="tabpanel">
      <h4>Changer le mot de passe</h4>
      <form @submit.prevent="savePassword" class="form">
        <div class="row">
          <label for="current">Mot de passe actuel</label>
          <input id="current" type="password" v-model="current" required />
        </div>
        <div class="row">
          <label for="new">Nouveau mot de passe</label>
          <input id="new" type="password" v-model="next" required minlength="6" />
        </div>
        <div class="row">
          <label for="confirm">Confirmer le nouveau mot de passe</label>
          <input id="confirm" type="password" v-model="confirm" required minlength="6" />
        </div>
        <div class="actions">
          <button class="btn-primary" type="submit" :disabled="savingPwd">{{ savingPwd ? 'Mise à jour…' : 'Mettre à jour' }}</button>
          <p v-if="msgPwd" class="alert success">✅ {{ msgPwd }}</p>
          <p v-if="errPwd" class="alert danger">⚠️ {{ errPwd }}</p>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCandidature, updatePreferences, changePassword } from '../api/candidate'
import { getUser } from '../services/auth'

const activeTab = ref<'prefs'|'password'>('prefs')
const candidatureId = ref<number | null>(null)

// Preferences state
const newsletter = ref(false)
const savingPrefs = ref(false)
const msgPrefs = ref('')
const errPrefs = ref('')

// Password state
const current = ref('')
const next = ref('')
const confirm = ref('')
const savingPwd = ref(false)
const msgPwd = ref('')
const errPwd = ref('')

onMounted(async () => {
  const u = getUser()
  candidatureId.value = u?.id ?? null
  if (!candidatureId.value) {
    errPrefs.value = 'Impossible de charger les paramètres (ID manquant).'
    return
  }
  try {
    const data = await getCandidature(candidatureId.value)
    newsletter.value = !!data.newsletter_opt_in
  } catch (e: any) {
    errPrefs.value = e?.response?.data?.message || 'Erreur lors du chargement des préférences.'
  }
})

async function savePrefs() {
  if (!candidatureId.value) return
  savingPrefs.value = true
  msgPrefs.value = ''
  errPrefs.value = ''
  try {
    const res = await updatePreferences(candidatureId.value, { newsletter_opt_in: newsletter.value })
    msgPrefs.value = res.message || 'Préférences enregistrées.'
  } catch (e: any) {
    errPrefs.value = e?.response?.data?.message || 'Enregistrement impossible.'
  } finally {
    savingPrefs.value = false
  }
}

async function savePassword() {
  if (!candidatureId.value) return
  if (next.value !== confirm.value) {
    errPwd.value = 'La confirmation ne correspond pas au nouveau mot de passe.'
    return
  }
  savingPwd.value = true
  msgPwd.value = ''
  errPwd.value = ''
  try {
    const res = await changePassword(candidatureId.value, { current_password: current.value, new_password: next.value, new_password_confirmation: confirm.value })
    msgPwd.value = res.message || 'Mot de passe mis à jour.'
    current.value = ''
    next.value = ''
    confirm.value = ''
  } catch (e: any) {
    errPwd.value = e?.response?.data?.message || 'Mise à jour impossible.'
  } finally {
    savingPwd.value = false
  }
}
</script>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; }
.tabs { display: inline-flex; gap: 0.4rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1rem; }
.tab { background: transparent; border: 0; padding: 0.5rem 0.75rem; cursor: pointer; border-bottom: 2px solid transparent; }
.tab.active { border-bottom-color: #313f96; color: #313f96; font-weight: 600; }
.panel { display: grid; gap: 0.75rem; }
.form { display: grid; gap: 0.75rem; max-width: 560px; }
.row { display: grid; gap: 0.35rem; }
.checkbox { display: inline-flex; align-items: center; gap: 0.5rem; background: #f8fafc; padding: 0.5rem 0.75rem; border-radius: 10px; border: 1px solid #e5e7eb; }
.btn-primary { background: #313f96; color: #fff; border: 1px solid #23307c; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; }
.alert { margin: 0; padding: 0.6rem 0.75rem; border-radius: 8px; border: 1px solid; }
.alert.success { color: #065f46; background: #ecfdf5; border-color: #a7f3d0; }
.alert.danger { color: #7f1d1d; background: #fef2f2; border-color: #fecaca; }
</style>
