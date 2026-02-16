import { createRouter, createWebHistory } from 'vue-router'

// Importem els teus fitxers de la carpeta 'pages'
import Index from '../pages/index.vue'
import Social from '../pages/social.vue'
import Cercador from '../pages/cercador.vue'
import Mapa from '../pages/mapa.vue'
import Perfil from '../pages/perfil.vue'
import Peticions from '../pages/peticions.vue'

const routes = [
  { 
    path: '/', 
    name: 'home',
    component: Index  // Aquest carregarà el teu menú principal
  },
  { 
    path: '/social', 
    name: 'social',
    component: Social 
  },
  { 
    path: '/cercador', 
    name: 'cercador',
    component: Cercador 
  },
  { 
    path: '/mapa', 
    name: 'mapa',
    component: Mapa 
  },
  { 
    path: '/perfil', 
    name: 'perfil',
    component: Perfil 
  },
  { 
    path: '/peticions', 
    name: 'peticions',
    component: Peticions 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router