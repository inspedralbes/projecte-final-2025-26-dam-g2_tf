import { createRouter, createWebHistory } from 'vue-router'

// Importem els teus fitxers de la carpeta 'pages'
import Index from '../pages/index.vue'
import Social from '../pages/social.vue'
import Cercador from '../pages/cercador.vue'
import Mapa from '../pages/mapa.vue'
import Perfil from '../pages/perfil.vue'
import PerfilVisita from '../pages/perfilVisita.vue'
import Peticions from '../pages/peticions.vue'
import DetallLloc from '../pages/detallLloc.vue'
import IniciJoc from '../pages/iniciJoc.vue'
import SalaEspera from '../pages/SalaEspera.vue'

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
  },
  {
<<<<<<< HEAD
    path: '/perfil-visita/:id',
    name: 'perfil-visita',
    component: PerfilVisita
  },
  {
    path: '/joc/:id',
    name: 'inici-joc',
    component: IniciJoc
  },
  {
=======
    path: '/joc/:id',
    name: 'inici-joc',
    component: IniciJoc
  },
  {
>>>>>>> c2cf94603d09de2198622343740ba47b7d13f363
    path: '/lloc/:id',
    name: 'detall-lloc',
    component: DetallLloc,
    props: true // Això permet passar l'id directament com a prop
  },
  {
    path: '/sala-espera/:id',
    name: 'sala-espera',
    component: SalaEspera
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router