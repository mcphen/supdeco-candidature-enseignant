<template>
  <div class="card">
    <h3>Soumettre son dossier</h3>
    <p>Merci de déposer les documents requis. Formats acceptés: PDF uniquement. Taille max: 2 Mo par fichier.</p>

    <div v-if="loading" class="placeholder">Chargement des documents requis...</div>
    <div v-else>
      <div v-if="configs.length === 0" class="placeholder">Aucun document requis n'a été configuré.</div>

      <ul class="doc-list">
        <li v-for="cfg in configs" :key="cfg.id" class="doc-item">
          <div class="doc-row">
            <span class="doc-title">{{ cfg.intitule }}</span>
            <input
              type="file"
              accept="application/pdf"
              :disabled="(isUploaded(cfg.id) && !editingIds.has(cfg.id)) || uploadingIds.has(cfg.id) || isSubmitted"
              @change="onFileSelected($event, cfg.id)"
            />
            <template v-if="isUploaded(cfg.id)">
              <a :href="uploads[cfg.id]?.file_url" class="file-link" target="_blank" rel="noopener">Voir le fichier</a>
              <button
                v-if="!isSubmitted"
                :class="['btn', editingIds.has(cfg.id) ? 'btn-outline' : 'btn-warning']"
                :disabled="uploadingIds.has(cfg.id)"
                @click="toggleEdit(cfg.id)"
              >
                {{ editingIds.has(cfg.id) ? 'Annuler' : 'Modifier' }}
              </button>
            </template>
            <button
              :class="['btn',
                uploadingIds.has(cfg.id) ? 'btn-loading' : (
                  isUploaded(cfg.id)
                    ? (editingIds.has(cfg.id) ? 'btn-warning' : 'btn-success')
                    : 'btn-primary-outline'
                )
              ]"
              :disabled="!selectedFiles[cfg.id] || uploadingIds.has(cfg.id) || isSubmitted"
              @click="uploadFile(cfg.id)"
            >
              {{ uploadingIds.has(cfg.id) ? 'Téléversement...' : (isUploaded(cfg.id) ? (editingIds.has(cfg.id) ? 'Mettre à jour' : 'Téléversé') : 'Téléverser') }}
            </button>
            <span v-if="errors[cfg.id]" class="error">{{ errors[cfg.id] }}</span>
            <span v-if="uploads[cfg.id] && !editingIds.has(cfg.id)" class="ok badge">OK</span>
          </div>
        </li>
      </ul>

      <div class="actions">
        <button class="btn-primary" :disabled="isSubmitted || !allUploaded || submitting" @click="submitAll">
          {{ submitting ? 'Soumission...' : (isSubmitted ? 'Déjà soumis' : 'Soumettre') }}
        </button>
        <span v-if="submitMessage" class="submit-message">{{ submitMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { DocumentConfiguration, UploadRecord } from '../interfaces/Document'
import { listRequiredDocuments, uploadDocumentForCandidature, submitCandidatureDossier } from '../services/document.service'
import { getCandidatureDocumentsStatus } from '../api/document'
import { getCandidatureStatus } from '../api/candidate'

const route = useRoute()
const loading = ref(true)
const configs = ref<DocumentConfiguration[]>([])
const uploads = reactive<Record<number, UploadRecord | undefined>>({})
const selectedFiles = reactive<Record<number, File | undefined>>({})
const errors = reactive<Record<number, string | undefined>>({})
const uploadingIds = ref<Set<number>>(new Set())
const editingIds = ref<Set<number>>(new Set())
const submitting = ref(false)
const submitMessage = ref('')
const isSubmitted = ref(false)

function getCandidatureId(): number | null {
  const q = route.query.candidatureId
  if (typeof q === 'string') return parseInt(q)
  const ls = localStorage.getItem('enseignant_candidat_id')
  if (ls) return parseInt(ls)
  return null
}

const candidatureId = ref<number | null>(null)

onMounted(async () => {
  candidatureId.value = getCandidatureId()
  await Promise.all([
    fetchConfigs(),
    initStatus()
  ])
})

async function fetchConfigs() {
  loading.value = true
  try {
    configs.value = await listRequiredDocuments()
  } catch (e:any) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function initStatus() {
  try {
    if (!candidatureId.value) return
    const [docsStatus, candStatus] = await Promise.all([
      getCandidatureDocumentsStatus(candidatureId.value),
      getCandidatureStatus(candidatureId.value)
    ])
    // Seed uploads map with existing docs
    if (docsStatus?.docs) {
      for (const key of Object.keys(docsStatus.docs)) {
        const cfgId = parseInt(key, 10)
        uploads[cfgId] = docsStatus.docs[cfgId] as any
      }
    }
    isSubmitted.value = !!candStatus?.is_submitted
  } catch (e) {
    // ignore, UI will allow upload
  }
}

function isUploaded(configId: number) {
  return !!uploads[configId]
}

function onFileSelected(ev: Event, configId: number) {
  errors[configId] = undefined
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    selectedFiles[configId] = undefined
    return
  }
  // Client-side validation: PDF and <= 2MB
  if (file.type !== 'application/pdf') {
    errors[configId] = 'Seuls les fichiers PDF sont acceptés.'
    selectedFiles[configId] = undefined
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    errors[configId] = 'La taille maximale est de 2 Mo.'
    selectedFiles[configId] = undefined
    return
  }
  selectedFiles[configId] = file
}

async function uploadFile(configId: number) {
  if (!candidatureId.value) {
    errors[configId] = "Identifiant de candidature manquant."
    return
  }
  const file = selectedFiles[configId]
  if (!file) return
  uploadingIds.value.add(configId)
  errors[configId] = undefined
  submitMessage.value = ''
  try {
    const fd = new FormData()
    fd.append('document_configuration_id', String(configId))
    fd.append('file', file)
    const data = await uploadDocumentForCandidature(candidatureId.value, fd)
    uploads[configId] = data.doc
    selectedFiles[configId] = undefined
    // Exit edit mode if we were editing
    editingIds.value.delete(configId)
  } catch (e:any) {
    errors[configId] = e?.response?.data?.message || e?.message || 'Erreur lors du téléversement'
  } finally {
    uploadingIds.value.delete(configId)
  }
}

function toggleEdit(configId: number) {
  if (editingIds.value.has(configId)) {
    editingIds.value.delete(configId)
    selectedFiles[configId] = undefined
  } else {
    editingIds.value.add(configId)
  }
}

const allUploaded = computed(() => {
  if (configs.value.length === 0) return false
  return configs.value.every(c => !!uploads[c.id])
})

async function submitAll() {
  if (!candidatureId.value) {
    submitMessage.value = 'Identifiant de candidature manquant.'
    return
  }
  submitting.value = true
  submitMessage.value = ''
  try {
    const data = await submitCandidatureDossier(candidatureId.value)
    if (data?.ok === false) {
      submitMessage.value = data.message || 'Veuillez compléter votre dossier.'
      return
    }
    // mark local flags for UI coherence
    localStorage.setItem('enseignant_dossier_submis', '1')
    isSubmitted.value = true
    submitMessage.value = data?.message || 'Dossier soumis avec succès.'
  } catch (e:any) {
    submitMessage.value = e?.response?.data?.message || 'Erreur lors de la soumission.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; }
.placeholder { margin-top: 1rem; padding: 1rem; border: 1px dashed #94a3b8; border-radius: 8px; color: #334155; background: #f8fafc; }
.doc-list { list-style: none; padding: 0; margin: 1rem 0; }
.doc-item { padding: 0.5rem 0; border-bottom: 1px dashed #e5e7eb; }
.doc-row { display: flex; align-items: center; gap: 0.5rem; }
.doc-title { flex: 1; font-weight: 600; }
.btn { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; transition: all .15s ease; }
.btn:hover:not(:disabled) { background: #e2e8f0; }
.btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Variants */
.btn-primary { background: var(--color-primary, #2563eb); color: #fff; border: 1px solid #1d4ed8; padding: 0.5rem 1rem; border-radius: 6px; }
.btn-primary:hover:not(:disabled) { filter: brightness(0.95); }
.btn-primary:disabled { opacity: .7; }

.btn-primary-outline { background: #ffffff; color: var(--color-primary, #2563eb); border-color: var(--color-primary, #2563eb); }
.btn-primary-outline:hover:not(:disabled) { background: rgba(37,99,235,0.06); }

.btn-success { background: #ecfdf5; color: #065f46; border-color: #34d399; }
.btn-success:hover:not(:disabled) { background: #d1fae5; }

.btn-warning { background: #fff7ed; color: #9a3412; border-color: #fb923c; }
.btn-warning:hover:not(:disabled) { background: #ffedd5; }

.btn-outline { background: #fff; color: #334155; border-color: #cbd5e1; }
.btn-outline:hover:not(:disabled) { background: #f8fafc; }

.btn-loading { position: relative; }
.btn-loading::after { content: '⏳'; margin-left: .4rem; }

/* Links and badges */
.file-link { color: var(--color-primary, #2563eb); text-decoration: none; font-weight: 500; }
.file-link:hover { text-decoration: underline; }

.error { color: #b91c1c; font-size: 0.85rem; }
.ok { color: #16a34a; }
.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; background: #ecfdf5; border: 1px solid #a7f3d0; font-size: 0.78rem; font-weight: 600; }

.actions { margin-top: 1rem; display: flex; align-items: center; gap: 1rem; }
.submit-message { color: #334155; }

/* Responsive adjustments */
@media (max-width: 700px) {
  .doc-row { flex-wrap: wrap; }
  .doc-title { flex: 1 1 100%; }
  input[type="file"] { flex: 1 1 100%; }
  .btn { width: 100%; }
  .actions { flex-direction: column; align-items: stretch; }
  .btn-primary { width: 100%; }
}
</style>
