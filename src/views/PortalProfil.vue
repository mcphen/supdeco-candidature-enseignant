<template>
  <div class="card">
    <h3>Mon profil</h3>
    <p class="muted" v-if="isSubmitted">Votre dossier a été soumis le {{ submittedAt }}. Les modifications ne sont plus autorisées.</p>
    <form class="form" @submit.prevent="onSave">
      <!-- Copy of CandidatureForm fields -->
      <div class="section">
        <h4>Informations personnelles</h4>
        <div class="grid">
          <div class="row"><label>Nom</label><input v-model="form.nom" :disabled="isSubmitted" /></div>
          <div class="row"><label>Prénom</label><input v-model="form.prenom" :disabled="isSubmitted" /></div>
          <div class="row"><label>Email</label><input type="email" v-model="form.email" :disabled="isSubmitted" /></div>
          <div class="row"><label>Date de naissance</label><input type="date" v-model="form.date_naissance" :disabled="isSubmitted" /></div>
          <div class="row"><label>Lieu de naissance</label><input v-model="form.lieu_naissance" :disabled="isSubmitted" /></div>
          <div class="row">
            <label>Genre</label>
            <select v-model="form.genre" :disabled="isSubmitted">
              <option value="H">Homme</option>
              <option value="F">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div class="row">
            <label>Nationalité</label>
            <select v-model="form.nationalite" :disabled="isSubmitted">
              <option value="" disabled>Sélectionnez un pays</option>
              <option v-for="p in countries" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="section">
        <h4>Parcours & expérience</h4>
        <div class="grid">
          <div class="row"><label>Fonction actuelle</label><input v-model="form.fonction_actuelle" :disabled="isSubmitted" /></div>
          <div class="row"><label>Entreprise / Université</label><input v-model="form.entreprise_universite" :disabled="isSubmitted" /></div>
          <div class="row">
            <label>Catégorie du diplôme</label>
            <select v-model="form.diplome_categorie" :disabled="isSubmitted">
              <option value="" disabled>Choisir une catégorie</option>
              <option value="licence">Licence</option>
              <option value="master">Master</option>
              <option value="doctorat">Doctorat</option>
              <option value="certificat">Certificat</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div class="row"><label>Dernier diplôme</label><input v-model="form.dernier_diplome" :disabled="isSubmitted" /></div>
          <div class="row"><label>Exp. pédagogie (années)</label><input type="number" min="0" v-model.number="form.nb_experience_pedagogie" :disabled="isSubmitted" /></div>
          <div class="row"><label>Exp. professionnelle (années)</label><input type="number" min="0" v-model.number="form.nb_annee_experience_pro" :disabled="isSubmitted" /></div>
        </div>
      </div>

      <div class="section">
        <h4>Expertise</h4>
        <div class="row">
          <label>Domaines d'expertise</label>
          <div class="checkboxes">
            <label v-for="d in domaines" :key="d" class="checkbox">
              <input type="checkbox" :value="d" v-model="form.domaines_expertise" :disabled="isSubmitted" />
              <span>{{ d }}</span>
            </label>
          </div>
        </div>
        <div class="row"><label>Autres</label><input v-model="form.autres" :disabled="isSubmitted" /></div>
      </div>

      <div class="actions">
        <button class="btn-primary" type="submit" :disabled="saving || isSubmitted">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
        <p v-if="message" class="alert success">✅ {{ message }}</p>
        <p v-if="error" class="alert danger">⚠️ {{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import type { Candidate } from '../interfaces/Candidate'
import { getCandidature, updateCandidature } from '../api/candidate'
import { getUser } from '../services/auth'
import { countries } from '../utils/countries'

const domaines = [ 'Informatique','Gestion','Marketing','Finance','Droit','Mathématiques','Communication' ]

const form = reactive<Candidate>({
  nom: '', prenom: '', email: '', date_naissance: '', lieu_naissance: '',
  fonction_actuelle: '', entreprise_universite: '', dernier_diplome: '',
  diplome_categorie: '',
  nb_experience_pedagogie: 0, nb_annee_experience_pro: 0, genre: 'H', nationalite: '',
  domaines_expertise: [], autres: '',
  accepts_policies: true,
})

const saving = ref(false)
const message = ref('')
const error = ref('')
const candidatureId = ref<number | null>(null)
const remote = ref<any>(null)

const isSubmitted = computed(() => !!remote.value?.is_submitted)
const submittedAt = computed(() => remote.value?.submitted_at ? new Date(remote.value.submitted_at).toLocaleString() : '')

onMounted(async () => {
  const u = getUser()
  candidatureId.value = u?.id ?? null
  if (!candidatureId.value) {
    error.value = "Impossible de charger le profil (ID manquant)."
    return
  }
  try {
    const data = await getCandidature(candidatureId.value)
    remote.value = data
    Object.assign(form, {
      nom: data.nom, prenom: data.prenom, email: data.email,
      date_naissance: data.date_naissance?.substring(0,10) || '',
      lieu_naissance: data.lieu_naissance, fonction_actuelle: data.fonction_actuelle,
      entreprise_universite: data.entreprise_universite, dernier_diplome: data.dernier_diplome,
      diplome_categorie: data.diplome_categorie || '',
      nb_experience_pedagogie: data.nb_experience_pedagogie, nb_annee_experience_pro: data.nb_annee_experience_pro,
      genre: data.genre, nationalite: data.nationalite, domaines_expertise: data.domaines_expertise || [],
      autres: data.autres || ''
    })
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erreur lors du chargement du profil.'
  }
})

async function onSave() {
  if (!candidatureId.value) return
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    const res = await updateCandidature(candidatureId.value, form)
    message.value = res.message || 'Profil mis à jour.'
  } catch (e:any) {
    error.value = e?.response?.data?.message || 'Enregistrement impossible.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; }
.muted { color: #64748b; }
.form { display: grid; gap: 1rem; }
.section { display: grid; gap: 0.75rem; }
.grid { display: grid; gap: 0.75rem; }
@media (min-width: 720px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.row { display: grid; gap: 0.35rem; }
input, select { padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 10px; }
.btn-primary { background: #313f96; color: #fff; border: 1px solid #23307c; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; }
.alert { margin: 0; padding: 0.6rem 0.75rem; border-radius: 8px; border: 1px solid; }
.alert.success { color: #065f46; background: #ecfdf5; border-color: #a7f3d0; }
.alert.danger { color: #7f1d1d; background: #fef2f2; border-color: #fecaca; }
</style>
