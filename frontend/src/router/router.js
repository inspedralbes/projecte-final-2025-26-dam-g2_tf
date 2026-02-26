import { createRouter, createWebHistory } from 'vue-router'
import { useLoginModal } from '../composables/useLoginModal';

// Importem els teus fitxers de la carpeta 'pages'
import Index from '../pages/index.vue'
import Social from '../pages/social.vue'
import Cercador from '../pages/cercador.vue'
import Mapa from '../pages/mapa.vue'
import mapajoc from '../pages/mapajoc.vue';
import Perfil from '../pages/perfil.vue'
import PerfilVisita from '../pages/perfilVisita.vue'
import Peticions from '../pages/peticions.vue'
import DetallLloc from '../pages/detallLloc.vue'
import IniciJoc from '../pages/iniciJoc.vue'
import SalaEspera from '../pages/SalaEspera.vue'
import elmeulogin from '../components/elmeulogin.vue'; // Revisa que la ruta sigui correcta
import LeaderboardFinal from '../pages/LeaderboardFinal.vue'
import camara from '../pages/camara.vue'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard.vue'
import AdminLlocs from '../pages/admin/AdminLlocs.vue'
import AdminPeticions from '../pages/admin/AdminPeticions.vue'
import MapEditor from '../pages/admin/MapEditor.vue'

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
    meta: { requiereAdmin: true }
  },
  {
    path: '/admin/mapa-editor/:id',
    name: 'admin-mapa-editor',
    component: MapEditor,
    meta: { requiereAdmin: true }
  },
  // -------------------------
  {
    path: '/joc/camera/:id', // Ha de tenir els dos punts (:) per a la ID
    name: 'camara',
    component: camara
  },

  {
    path: '/social',
    name: 'social',
    component: Social,
    meta: { requiereAuth: true } // Protegit: cal iniciar sessió
  },
  {
    path: '/cercador',
    name: 'cercador',
    component: Cercador
  },
  {
    path: '/mapa',
    name: 'mapa-general',
    component: Mapa
  },
  {
    path: '/mapa/:id',
    name: 'mapa-joc',
    component: mapajoc
  },

  {
    path: '/perfil',
    name: 'perfil',
    component: Perfil
  },
  {
    path: '/peticions',
    name: 'peticions',
    component: Peticions,
    meta: { requiereAuth: true } // Protegit: cal iniciar sessió
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
    props: true, // Això permet passar l'id directament com a prop
    meta: { requiereAuth: true } // Protegit: cal iniciar sessió
  },

  {
    path: '/sala-espera/:id',
    name: 'sala-espera',
    component: SalaEspera
  },

  {
    path: '/leaderboard-final/:id', // L'ID de la sessió de joc
    name: 'leaderboard-final',
    component: LeaderboardFinal,
    props: true // Permet que el component rebi 'id' com a prop
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// GUÀRDIA DE NAVEGACIÓ
router.beforeEach((to, from, next) => {
  // 1. Llegim la sessió d'admin
  const sessioRaw = localStorage.getItem('admin_session');
  let sessio = null;

  try {
    if (sessioRaw && sessioRaw.startsWith('{')) {
      sessio = JSON.parse(sessioRaw);
    }
  } catch (e) {
    console.warn("Sessió no vàlida, continuant com a convidat");
  }

  // 2. Definim si la ruta requereix admin o auth normal
  const requereixAdmin = to.matched.some(record => record.meta.requiereAdmin);
  const requereixAuth = to.matched.some(record => record.meta.requiereAuth);

  // 3. LÒGICA DE NAVEGACIÓ
  if (requereixAdmin) {
    // Ruta d'admin: comprovem sessió d'admin
    if (sessio && sessio.rol === 'admin') {
      next();
    } else {
      next({ name: 'home' });
    }

  } else if (requereixAuth) {
    // Ruta protegida per a usuaris normals: comprovem sessió d'usuari
    const usuariRaw = localStorage.getItem('usuari');
    let usuariSessio = null;
    try {
      if (usuariRaw) usuariSessio = JSON.parse(usuariRaw);
    } catch (e) { /* ignore */ }

    if (usuariSessio) {
      // Usuari autenticat: deixem passar
      next();
    } else {
      // Usuari NO autenticat: bloquejem la navegació i obrim el modal
      const missatgesPerRuta = {
        'social': 'Uneix-te a la comunitat! Inicia sessió per veure el muro, el rànquing i interactuar amb altres exploradors.',
        'detall-lloc': 'Per veure el detall d\'aquest lloc i començar la ruta, has d\'iniciar sessió primer.',
        'peticions': 'Vols proposar un nou lloc? Genial! Només cal que iniciis sessió primer.',
      };
      const missatge = missatgesPerRuta[to.name] || 'Has d\'iniciar sessió per accedir a aquesta secció.';

      // Guardem la ruta a la qual l'usuari volia anar
      const rutaDesitjada = { name: to.name, params: to.params, query: to.query };

      // Ens quedem a la pàgina actual (no canviem de ruta)
      next(false);

      // Obrim el modal en el proper tick per assegurar que el router ha acabat
      setTimeout(() => {
        const { obrirModal } = useLoginModal();
        obrirModal(missatge, rutaDesitjada);
      }, 0);
    }

  } else {
    // Ruta normal sense protecció: passa sempre
    next();
  }
});

export default router