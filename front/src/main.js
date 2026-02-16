import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Assegura't que el fitxer es digui router.js
import './style.css'

const app = createApp(App)
app.use(router) // AQUESTA LÍNIA ÉS CLAU
app.mount('#app')