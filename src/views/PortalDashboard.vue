<template>
  <div class="grid">
    <!-- Bandeau résumé -->
    <div class="card banner">
      <div class="banner-row">
        <div class="hello">
          <h3>Bonjour, {{ displayName }}</h3>
          <p class="muted">Bienvenue dans votre espace candidat. Suivez l'avancement de votre dossier et mettez à jour votre profil.</p>
        </div>
        <RouterLink to="/portal/profil" class="btn">Modifier mon profil</RouterLink>
        <RouterLink to="/portal/soumettre" class="btn-primary">Soumettre mon dossier</RouterLink>
      </div>
    </div>

    <!-- Suivi de la candidature -->
    <div class="card">
      <h4>Suivi de votre candidature</h4>
      <ol class="steps">
        <li :class="{ done: steps.compteCree }">
          <span class="dot" aria-hidden="true"></span>
          <div>
            <div class="step-title">Compte créé</div>
            <small class="muted">Vous êtes connecté.</small>
          </div>
        </li>
        <li :class="{ done: steps.profilComplet }">
          <span class="dot" aria-hidden="true"></span>
          <div>
            <div class="step-title">Profil complété</div>
            <small class="muted">Renseignez vos informations et domaines d'expertise.</small>
          </div>
        </li>
        <li :class="{ done: steps.docsTeleverses }">
          <span class="dot" aria-hidden="true"></span>
          <div>
            <div class="step-title">Documents téléversés</div>
            <small class="muted">Ajoutez les pièces requises dans « Soumettre son dossier ».</small>
          </div>
        </li>
        <li :class="{ done: steps.dossierSoumis }">
          <span class="dot" aria-hidden="true"></span>
          <div>
            <div class="step-title">  Dossier soumis</div>
            <small class="muted">Vous recevrez une notification après l'examen.</small>
          </div>
        </li>
        <li :class="{ done: steps.entretienPlanifie }">
          <span class="dot" aria-hidden="true"></span>
          <div>
            <div class="step-title">Entretien</div>
            <small class="muted">Vous recevrez une convocation du comité si un entretien est planifié.</small>
          </div>
        </li>
        <li :class="{ done: steps.decisionRendue }">
          <span class="dot" aria-hidden="true"></span>
          <div>
            <div class="step-title">Décision</div>
            <small class="muted">La commission communiquera la décision finale.</small>
          </div>
        </li>
      </ol>
      <div class="progress">
        <div class="bar" :style="{ width: progress + '%' }" />
      </div>
      <p class="muted">Avancement: {{ progress.toFixed(0) }}%</p>
    </div>


    <!-- Notifications -->
    <div class="card">
      <h4>Notifications</h4>
      <ul class="notif-list" v-if="notifications.length">
        <li v-for="n in notifications" :key="n.id" class="notif-item">
          <span class="dot sm" :class="n.type"></span>
          <div class="notif-body">
            <div class="notif-title">{{ n.title }}</div>
            <small class="muted">{{ n.date }}</small>
          </div>
        </li>
      </ul>
      <p v-else class="muted">Aucune notification pour le moment.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { getUser, getToken } from '../services/auth'
import { getCandidatureDocumentsStatus } from '../api/document'
import { getCandidatureStatus } from '../api/candidate'
import { getNotifications, type RawNotification } from '../api/notifications'

type DashboardNotification = { id: string; title: string; type: 'info'|'success'|'warning'; date: string }

const user = ref(getUser())

const displayName = computed(() => {
  const u = user.value
  return u ? `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Candidat' : 'Candidat'
})

// Etat dynamique pour les documents et statut global
const docsLoaded = ref(false)
const docsStarted = ref(false)
const statusLoaded = ref(false)
const status = ref<{ is_submitted: boolean; has_interview: boolean; decision_status: string|null } | null>(null)

// Suivi: mix local + backend
const steps = reactive({
  compteCree: computed(() => !!getToken()),
  profilComplet: computed(() => {
    const u = user.value
    return !!(u && u.prenom && u.nom && u.email && (u.domaines_expertise?.length || 0) > 0)
  }),

  docsTeleverses: computed(() => docsStarted.value || localStorage.getItem('enseignant_docs_ok') === '1'),
  dossierSoumis: computed(() => (status.value?.is_submitted === true) || localStorage.getItem('enseignant_dossier_submis') === '1'),
  entretienPlanifie: computed(() => (status.value?.has_interview === true) || localStorage.getItem('enseignant_entretien') === '1'),
  decisionRendue: computed(() => (!!status.value?.decision_status) || localStorage.getItem('enseignant_decision') === '1'),
}) as any
console.log('status',localStorage.getItem('enseignant_dossier_submis'))
const progress = computed(() => {
  const vals = [steps.compteCree, steps.profilComplet, steps.docsTeleverses, steps.dossierSoumis, steps.entretienPlanifie, steps.decisionRendue]
  const done = vals.filter(Boolean).length
  return (done / vals.length) * 100
})

// Notifications (dynamiques via API avec repli local)
const notifications = ref<DashboardNotification[]>([])

async function loadNotifications() {
  const userIdRaw = localStorage.getItem('enseignant_candidat_id')
  const id = userIdRaw ? parseInt(userIdRaw, 10) : (user.value as any)?.id
  if (id) {
    try {
      const items = await getNotifications(id)
      const mapped = (items || []).map((n: RawNotification) => ({
        id: String(n.id ?? Math.random().toString(36).slice(2)),
        title: n.title || n.message || n.contenu || 'Notification',
        type: (['info','success','warning'].includes(String(n.type)) ? (n.type as any) : 'info'),
        date: new Date(n.created_at || n.date || Date.now()).toLocaleString(),
      }))
      if (mapped.length === 0) {
        // S'il n'y a rien côté backend, conserver un message d'accueil la première fois
        const welcome: DashboardNotification = { id: 'hello', title: 'Bienvenue sur le portail candidat !', type: 'info', date: new Date().toLocaleString() }
        notifications.value = [welcome]
      } else {
        notifications.value = mapped
      }
      // Mémoriser localement pour un affichage hors ligne éventuel
      localStorage.setItem('enseignant_notifications', JSON.stringify(notifications.value))
      return
    } catch (e) {
      // Tomber en repli local si l’API échoue
    }
  }
  // Repli local (aucun id ou échec API)
  const raw = localStorage.getItem('enseignant_notifications')
  if (raw) {
    try { notifications.value = JSON.parse(raw) } catch { notifications.value = [] }
  }
  if (!notifications.value.length) {
    notifications.value = [{ id: 'hello', title: 'Bienvenue sur le portail candidat !', type: 'info', date: new Date().toLocaleString() }]
    localStorage.setItem('enseignant_notifications', JSON.stringify(notifications.value))
  }
}


async function refreshDocsStatus() {
  try {
    const userIdRaw = localStorage.getItem('enseignant_candidat_id')
    const id = userIdRaw ? parseInt(userIdRaw, 10) : (user.value as any)?.id
    if (id) {
      const status = await getCandidatureDocumentsStatus(id)
      docsStarted.value = !!status?.has_started_upload
    }
  } catch (e) {
    // keep fallback from localStorage
  } finally {
    docsLoaded.value = true
  }
}

async function refreshCandidatureStatus() {
  try {
    const userIdRaw = localStorage.getItem('enseignant_candidat_id')
    const id = userIdRaw ? parseInt(userIdRaw, 10) : (user.value as any)?.id
    if (id) {
      const s = await getCandidatureStatus(id)
      status.value = {
        is_submitted: !!s.is_submitted,
        has_interview: !!s.has_interview,
        decision_status: s.decision_status || null,
      }
    }
  } catch (e) {
    // fallback to localStorage only
  } finally {
    statusLoaded.value = true
  }
}

onMounted(async () => {
  user.value = getUser()
  loadNotifications()
  await Promise.all([
    refreshDocsStatus(),
    refreshCandidatureStatus()
  ])
})

</script>

<style scoped>
.grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
@media (min-width: 980px) {
  .grid { grid-template-columns: 1.2fr 1fr; }
  .grid > .card:nth-child(1) { grid-column: 1 / -1; }
}
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.banner-row { display: flex; align-items: center; gap: 1rem; }
.hello { flex: 1; }
.muted { color: #64748b; }

.steps { list-style: none; padding: 0; margin: 0.5rem 0 0; display: grid; gap: 0.5rem; }
.steps li { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.5rem; border-radius: 8px; border: 1px dashed #e5e7eb; background: #f8fafc; }
.steps li.done { border-style: solid; border-color: #86efac; background: #ecfdf5; }
.step-title { font-weight: 600; color: #0f172a; }
.dot { width: 12px; height: 12px; border-radius: 999px; background: #94a3b8; display: inline-block; }
.steps li.done .dot { background: #16a34a; }
.dot.sm { width: 8px; height: 8px; }
.dot.success { background: #16a34a; }
.dot.info { background: #3b82f6; }
.dot.warning { background: #f59e0b; }

.progress { margin-top: 0.75rem; width: 100%; height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.bar { height: 100%; background: linear-gradient(90deg, #16a34a, #22c55e); }

.profile { display: grid; gap: 0.6rem; }
.row { display: grid; gap: 0.35rem; }
label { font-weight: 600; color: #111827; }
input { padding: 0.55rem 0.75rem; border: 1px solid #d1d5db; border-radius: 10px; }
input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.16); }
.chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.chip { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.6rem; border: 1px solid #e5e7eb; border-radius: 999px; background: #f8fafc; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
.btn { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; border-radius: 8px; cursor: pointer; }
.btn-primary { background: #313f96; color: #fff; border: 1px solid #23307c; padding: 0.55rem 0.9rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; }
.btn:disabled, .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.msg { margin: 0.25rem 0 0; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid; font-size: 0.9rem; }
.msg.ok { color: #065f46; background: #ecfdf5; border-color: #a7f3d0; }
.msg.err { color: #7f1d1d; background: #fef2f2; border-color: #fecaca; }

.notif-list { list-style: none; padding: 0; margin: 0.5rem 0 0; display: grid; gap: 0.5rem; }
.notif-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
.notif-body { display: grid; line-height: 1.1; }
.notif-title { font-weight: 600; }
</style>
