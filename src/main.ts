import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// vue-tel-input plugin and styles
import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/dist/vue-tel-input.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Register vue-tel-input globally with sensible defaults
app.use(VueTelInput, {
  mode: 'international',
  autoFormat: true,
  autoHideDialCode: false,
  dropdownOptions: {
    showFlags: true,
    showDialCodeInList: true,
    showSearchBox: true,
    preferredCountries: ['SN','CI','CM','TG','BJ','GA','FR','MA']
  },
})

// Charger la session au démarrage
const auth = useAuthStore(pinia)
auth.loadSession()

app.use(router).mount('#app')
