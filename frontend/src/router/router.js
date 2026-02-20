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
import elmeulogin from '../components/elmeulogin.vue'; // Revisa que la ruta sigui correcta

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin.vue'
import AdminDashboard from '../pages/admin/AdminDashboard.vue'
import AdminLlocs from '../pages/admin/AdminLlocs.vue'
import AdminPeticions from '../pages/admin/AdminPeticions.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Index  // Aquest carregarà el teu menú principal
  },
  {
    path: '/login',
    name: 'Login',
    component: elmeulogin
  },
   // --- AQUESTA ÉS LA RUTA QUE FALTAVA ---
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin
  },
  
  // --- RUTES PROTEGIDES ---
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiereAdmin: true } // Protegit
  },
  {
    path: '/admin/llocs',
    name: 'admin-llocs',
    component: AdminLlocs,
    meta: { requiereAdmin: true } // Protegit
  },
  {
    path: '/admin/peticions',
    name: 'admin-peticions',
    component: AdminPeticions,
    meta: { requiereAdmin: true } // Protegit
  },
  // -------------------------
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

// GUÀRDIA DE NAVEGACIÓ CORREGIDA
router.beforeEach((to, from, next) => {
  const sessioRaw = localStorage.getItem('usuari');
  let sessio = null;
  let usuari = null;
  
  try {
    if (usuariRaw) {
      usuari = JSON.parse(usuariRaw);
    }
  } catch (e) {
    usuari = null;
  }

  const requereixAdmin = to.matched.some(record => record.meta.requiereAdmin);

  // 3. LÓGICA DE NAVEGACIÓN
  if (requereixAdmin) {
    if (sessio && sessio.rol === 'admin') {
      next(); 
    } else {
      next({ name: 'home' }); 
    }
  } else {
    next();
  }
});

export default router