<template>
  <form @submit.prevent="onSubmit" class="form" novalidate>
    <h2 class="title">Inscription Enseignant</h2>

    <div class="section">
      <h3 class="section-title">Informations personnelles</h3>
      <div class="grid">
        <div class="row">
          <label for="nom" class="required">Nom</label>
          <input id="nom" v-model="form.nom" required autocomplete="family-name" :aria-invalid="!form.nom && tried" placeholder="Ex: DIOP" />
          <small class="hint">Votre nom de famille tel qu'indiqué sur vos documents officiels.</small>
        </div>
        <div class="row">
          <label for="prenom" class="required">Prénom</label>
          <input id="prenom" v-model="form.prenom" required autocomplete="given-name" :aria-invalid="!form.prenom && tried" placeholder="Ex: Awa" />
        </div>
        <div class="row">
          <label for="email" class="required">Email</label>
          <input id="email" v-model="form.email" required type="email" autocomplete="email" :aria-invalid="!isValidEmail && tried" placeholder="nom@exemple.com" />
          <small class="hint">Nous vous enverrons un email de confirmation.</small>
        </div>
        <div class="row">
          <label for="date_naissance" class="required">Date de naissance</label>
          <input id="date_naissance" v-model="form.date_naissance" required type="date" :aria-invalid="!form.date_naissance && tried" />
        </div>
        <div class="row">
          <label for="lieu_naissance" class="required">Lieu de naissance</label>
          <input id="lieu_naissance" v-model="form.lieu_naissance" required placeholder="Ville, Pays" :aria-invalid="!form.lieu_naissance && tried" />
        </div>
        <div class="row">
          <label for="genre" class="required">Genre</label>
          <select id="genre" v-model="form.genre" required :aria-invalid="!form.genre && tried">
            <option value="H">Homme</option>
            <option value="F">Femme</option>
            
          </select>
        </div>
        <div class="row">
          <label for="nationalite" class="required">Nationalité</label>
          <select id="nationalite" v-model="form.nationalite" required :aria-invalid="!form.nationalite && tried">
            <option value="" disabled>Sélectionnez un pays</option>
            <option v-for="p in countries" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Parcours & expérience</h3>
      <div class="grid">
        <div class="row">
          <label for="fonction_actuelle" class="required">Fonction actuelle</label>
          <input id="fonction_actuelle" v-model="form.fonction_actuelle" required placeholder="Ex: Maître de conférences" :aria-invalid="!form.fonction_actuelle && tried" />
        </div>
        <div class="row">
          <label for="entreprise_universite" class="required">Entreprise / Université</label>
          <input id="entreprise_universite" v-model="form.entreprise_universite" required placeholder="Ex: Université Cheikh Anta Diop" :aria-invalid="!form.entreprise_universite && tried" />
        </div>
        <div class="row">
          <label for="dernier_diplome" class="required">Dernier diplôme</label>
          <input id="dernier_diplome" v-model="form.dernier_diplome" required placeholder="Ex: Doctorat en Informatique" :aria-invalid="!form.dernier_diplome && tried" />
        </div>
        <div class="row">
          <label for="exp_peda" class="required">Expérience en pédagogie (années)</label>
          <input id="exp_peda" v-model.number="form.nb_experience_pedagogie" required type="number" min="0" inputmode="numeric" placeholder="0" :aria-invalid="form.nb_experience_pedagogie < 0 && tried" />
        </div>
        <div class="row">
          <label for="exp_pro" class="required">Expérience professionnelle (années)</label>
          <input id="exp_pro" v-model.number="form.nb_annee_experience_pro" required type="number" min="0" inputmode="numeric" placeholder="0" :aria-invalid="form.nb_annee_experience_pro < 0 && tried" />
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Expertise</h3>
      <div class="row">
        <label class="required">Domaines d'expertise</label>
        <div class="checkboxes" role="group" aria-label="Domaines d'expertise">
          <label v-for="d in domaines" :key="d" class="checkbox">
            <input type="checkbox" :value="d" v-model="form.domaines_expertise" />
            <span>{{ d }}</span>
          </label>
        </div>
        <small class="hint">Sélectionnez un ou plusieurs domaines.</small>
      </div>
      <div class="row">
        <label for="autres">Autres (précisez)</label>
        <input id="autres" v-model="form.autres" placeholder="Autres domaines, précisions..." />
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Confidentialité & communications</h3>
      <div class="row">
        <label class="required">Consentements</label>
        <label class="checkbox">
          <input type="checkbox" v-model="form.accepts_policies" :aria-invalid="tried && !form.accepts_policies" />
          <span>J'ai lu et j'accepte la <a href="#" target="_blank" rel="noopener">Politique de confidentialité</a> et les <a href="#" target="_blank" rel="noopener">Conditions d'utilisation</a>.</span>
        </label>
        <small v-if="tried && !form.accepts_policies" class="hint" style="color:#b91c1c">Cette acceptation est obligatoire pour continuer.</small>
        <label class="checkbox">
          <input type="checkbox" v-model="form.newsletter_opt_in" />
          <span>Je souhaite recevoir la newsletter et d'autres informations du groupe.</span>
        </label>
      </div>
    </div>

    <div class="actions">
      <button type="submit" class="submit" :disabled="loading" @click="tried = true">
        {{ loading ? 'Envoi…' : 'S\'inscrire' }}
      </button>
      <p v-if="message" class="alert success">✅ {{ message }}</p>
      <p v-if="error" class="alert danger">⚠️ {{ error }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { Candidate } from '../interfaces/Candidate'
import { submitCandidate } from '../services/candidate.service'
import { countries } from '../utils/countries'

const domaines = [
  'Informatique',
  'Gestion',
  'Marketing',
  'Finance',
  'Droit',
  'Mathématiques',
  'Communication'
]

const form = reactive<Candidate>({
  nom: '',
  prenom: '',
  email: '',
  date_naissance: '',
  lieu_naissance: '',
  fonction_actuelle: '',
  entreprise_universite: '',
  dernier_diplome: '',
  nb_experience_pedagogie: 0,
  nb_annee_experience_pro: 0,
  genre: 'H',
  nationalite: '',
  domaines_expertise: [],
  autres: '',
  accepts_policies: false,
  newsletter_opt_in: false,
})

const loading = ref(false)
const message = ref('')
const error = ref('')
const tried = ref(false)

const isValidEmail = computed(() => /.+@.+\..+/.test(form.email))

async function onSubmit() {
  tried.value = true
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    if (!form.accepts_policies) {
      error.value = 'Vous devez accepter la politique de confidentialité et les conditions d\'utilisation.'
      loading.value = false
      return
    }
    const res = await submitCandidate(form)
    message.value = res.message || 'Votre inscription a été enregistrée. Vérifiez votre email.'
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form { max-width: 880px; margin: 2rem auto; display: grid; gap: 1.25rem; padding: 1.5rem; border: 1px solid var(--border); border-radius: 12px; background: var(--card); box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.title { margin: 0; color: var(--color-primary); display: flex; align-items: center; gap: 0.5rem; }
.title::before { content: ""; width: 10px; height: 10px; background: var(--color-secondary); border-radius: 2px; box-shadow: 0 0 0 3px rgba(255, 211, 0, 0.25); }
.section { display: grid; gap: 0.75rem; padding-top: 0.25rem; }
.section + .section { border-top: 1px dashed var(--border); padding-top: 1rem; }
.section-title { margin: 0; font-size: 1rem; color: #374151; }
.grid { display: grid; gap: 0.75rem; }
@media (min-width: 720px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.row { display: grid; gap: 0.4rem; }
label { font-weight: 600; color: #111827; }
label.required::after { content: ' *'; color: #ef4444; }
input, select { padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
input::placeholder, select::placeholder { color: #9ca3af; }
input:focus, select:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(49, 63, 150, 0.16); }
input[aria-invalid="true"], select[aria-invalid="true"] { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12); }
.hint { color: #6b7280; font-size: 0.8rem; }
.checkboxes { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.checkbox { display: inline-flex; align-items: center; gap: 0.5rem; background: #f8fafc; padding: 0.4rem 0.6rem; border-radius: 999px; border: 1px solid #e5e7eb; cursor: pointer; user-select: none; }
.checkbox input { accent-color: var(--color-primary); }
.actions { display: grid; gap: 0.75rem; margin-top: 0.5rem; }
.submit { padding: 0.75rem 1rem; border-radius: 10px; background: var(--color-primary); color: #fff; border: none; cursor: pointer; font-weight: 600; box-shadow: 0 6px 16px rgba(49,63,150,0.22); }
.submit:hover { background: #293584; }
.submit[disabled] { opacity: 0.7; cursor: not-allowed; }
.alert { margin: 0; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid; }
.alert.success { color: #065f46; background: #ecfdf5; border-color: #a7f3d0; }
.alert.danger { color: #7f1d1d; background: #fef2f2; border-color: #fecaca; }

/* Responsive tweaks */
@media (max-width: 420px) {
  .form { padding: 1rem; margin: 1rem auto; }
  .submit { width: 100%; }
}
@media (max-width: 640px) {
  .form { 
    max-width: 100%; 
    margin: 0; 
    border: none; 
    border-radius: 0; 
    box-shadow: none; 
    padding: 1rem 1rem; 
    padding-left: max(1rem, env(safe-area-inset-left)); 
    padding-right: max(1rem, env(safe-area-inset-right)); 
    background: var(--card);
  }
  .title { 
    justify-content: center; 
    font-size: 1.25rem; 
    text-align: center; 
  }
  .section { gap: 1rem; }
  .grid { gap: 1rem; }
  .row { gap: 0.35rem; }
  label { font-size: 0.95rem; }
  input, select { 
    padding: 0.9rem 1rem; 
    font-size: 16px; /* prevent mobile zoom on focus */
    border-radius: 10px;
  }
  .checkboxes { 
    display: flex; 
    flex-direction: column; 
    gap: 0.6rem; 
  }
  .checkbox { 
    padding: 0.75rem 0.9rem; 
    border-radius: 12px; 
  }
  .hint { font-size: 0.82rem; }
  .actions { 
    position: sticky; 
    bottom: 0; 
    background: linear-gradient(to top, var(--card), rgba(255,255,255,0.7)); 
    padding-top: 0.5rem; 
    margin-top: 0.5rem; 
    backdrop-filter: saturate(120%) blur(2px);
  }
  .submit { 
    width: 100%; 
    font-size: 1rem; 
    padding: 1rem; 
    border-radius: 12px;
  }
}

</style>
