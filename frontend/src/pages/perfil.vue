<template>
  <div class="min-h-screen bg-black text-white font-sans pb-24">
    
    <header class="p-4 flex items-center justify-between border-b border-white/10 bg-[#1a0a1f]">
      <button @click="router.push('/')" class="text-[#f5cbdd] font-bold text-sm">← TORNAR</button>
      <h1 class="text-lg font-bold tracking-widest">PERFIL</h1>
      <div class="w-8"></div> 
    </header>

    <main class="p-4 max-w-md mx-auto space-y-6">
      
      <section class="bg-[#2d1b33] rounded-3xl p-6 border border-white/5 shadow-xl text-center relative overflow-hidden">
        
        <div class="text-4xl mb-2">{{ emojiRol }}</div>

        <div class="w-24 h-24 rounded-full bg-[#bc85ab] mx-auto mb-4 flex items-center justify-center text-3xl font-black text-[#1a0a1f] overflow-hidden">
          <img v-if="user?.avatar" :src="netejarUrl(user.avatar)" class="w-full h-full object-cover" />
          <span v-else>{{ user?.nom_usuari?.charAt(0).toUpperCase() || '?' }}</span>
        </div>
        
        <h2 class="text-2xl font-bold mb-1">{{ user?.nom_usuari || 'Explorador' }}</h2>
        
        <p class="text-[#bc85ab] text-xs font-bold tracking-widest uppercase mb-4">{{ user?.nivell || 'Explorador Novell' }}</p>

        <div class="max-w-[200px] mx-auto mb-6">
          <div class="w-full bg-[#f5cbdd] h-3 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <div 
              class="bg-gradient-to-r from-[#804f7f] to-[#bc85ab] h-full transition-all duration-1000 ease-out" 
              :style="{ width: percentatgeProgres + '%' }"
            ></div>
          </div>
          
          <p v-if="cromosPerSeguentNivell > 0" class="text-[9px] text-white/60 mt-2 font-medium">
            Et falten <span class="font-bold text-[#f5cbdd]">{{ cromosPerSeguentNivell }}</span> cromos per al següent nivell
          </p>
          <p v-else class="text-[9px] text-[#f5cbdd] mt-2 font-bold uppercase tracking-wider">
            Ets un Mestre Urbà!
          </p>
          
          <p class="text-[8px] text-gray-400 mt-1 uppercase">{{ user?.inventari_cromos?.length || 0 }} cromos col·leccionats</p>
        </div>

        <div class="mt-4">
          <div v-if="!editantBio">
            <p class="text-sm text-gray-400 italic mb-2">"{{ user?.biografia || 'Sense biografia...' }}"</p>
            <button @click="editantBio = true" class="text-[10px] text-[#bc85ab] border border-[#bc85ab] px-2 py-1 rounded">EDITAR BIO</button>
          </div>
          
          <div v-else class="space-y-2">
            <textarea 
              v-model="tempBio" 
              class="w-full bg-black/40 text-white text-sm p-2 rounded-xl border border-[#bc85ab] outline-none"
              rows="2"
            ></textarea>
            <div class="flex gap-2 justify-center">
              <button @click="guardarBio" class="bg-[#bc85ab] text-black text-xs px-3 py-1 rounded font-bold">GUARDAR</button>
              <button @click="editantBio = false" class="bg-gray-700 text-white text-xs px-3 py-1 rounded">CANCEL·LAR</button>
            </div>
          </div>
        </div>
      </section>

      <nav class="flex bg-[#1a0a1f] rounded-xl p-1 border border-white/5">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
          :class="activeTab === tab.id ? 'bg-[#bc85ab] text-black' : 'text-gray-500'"
        >
          {{ tab.label }}
        </button>
      </nav>

    <div class="mt-4">
        <div v-if="activeTab === 'posts'" class="space-y-3">
          <div v-for="post in misPosts" :key="post._id" class="bg-[#2d1b33] p-4 rounded-xl border border-white/5 relative group">
            <p class="text-sm">{{ post.text }}</p>
            <button @click="eliminarPost(post._id)" class="absolute top-2 right-2 text-red-400 text-xs opacity-0 group-hover:opacity-100">✕</button>
          </div>
          <p v-if="misPosts.length === 0" class="text-center text-gray-600 text-sm italic">No has publicat res encara.</p>
        </div>

        <div v-if="activeTab === 'cromos'" class="space-y-8 animate-fade-in">
          <DiariExploracio :cromos="user?.inventari_cromos || []" />
        </div>

        <div v-if="activeTab === 'amics'" class="space-y-6">
          <div v-if="user?.sollicituds_pendents?.length > 0" class="space-y-3">
            <h3 class="text-[#bc85ab] text-[10px] font-black tracking-widest uppercase">Sol·licituds noves</h3>
            <div v-for="sol in user.sollicituds_pendents" :key="sol.id_usuari" class="bg-[#f5cbdd]/10 p-4 rounded-2xl border border-[#f5cbdd]/20 flex items-center justify-between">
              <span class="text-sm font-bold text-[#f5cbdd]">{{ sol.nom_usuari }}</span>
              <div class="flex gap-2">
                <button @click="acceptarAmic(sol)" class="bg-[#bc85ab] text-black text-[10px] font-bold px-3 py-1 rounded-lg">ACCEPTAR</button>
                <button @click="rebutjarAmic(sol)" class="bg-red-500/20 text-red-400 text-[10px] font-bold px-3 py-1 rounded-lg">REBUTJAR</button>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="text-gray-500 text-[10px] font-black tracking-widest uppercase">Els teus amics</h3>
            
            <div 
              v-for="amic in user?.amics" 
              :key="amic._id" 
              @click="router.push(`/perfil-visita/${amic._id}`)"
              class="bg-[#2d1b33] p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#3d2b43] transition-colors group"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#bc85ab] flex items-center justify-center text-[10px] font-bold text-black">
                  {{ amic.nom_usuari?.charAt(0).toUpperCase() || '?' }}
                </div>
                <span class="text-sm font-bold group-hover:text-[#bc85ab]">{{ amic.nom_usuari }}</span>
              </div>
              <span class="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span>
            </div>
            
            <p v-if="!user?.amics?.length" class="text-center text-gray-600 text-sm italic">Encara no tens amics afegits.</p>
          </div>
        </div>

        <div v-if="activeTab === 'propostes'" class="space-y-4 animate-fade-in">
          <h3 class="text-[#bc85ab] text-[10px] font-black tracking-widest uppercase">Les meves propostes</h3>
          <div v-for="p in mevesPeticions" :key="p._id" class="bg-[#2d1b33] p-4 rounded-2xl border border-white/5">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-sm text-white">{{ p.nomLloc }}</span>
              <span 
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="p.estat === 'pendent' ? 'bg-yellow-100 text-yellow-800' : 
                        p.estat === 'aprovada' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'"
              >
                {{ p.estat === 'pendent' ? 'Pendent' : 
                   p.estat === 'aprovada' ? 'Acceptada' : 
                   'Rebutjada' }}
              </span>
            </div>
            <p class="text-[10px] text-gray-400 mb-1">{{ p.dataCreacio ? new Date(p.dataCreacio).toLocaleDateString() : 'Data no disponible' }}</p>
            <p v-if="p.estat === 'rebutjada' && p.motiuRebuig" class="text-[10px] text-red-400 italic">
              Motiu: {{ p.motiuRebuig }}
            </p>
          </div>
          <p v-if="mevesPeticions.length === 0" class="text-center text-gray-600 text-sm italic">No has fet cap proposta.</p>
        </div>
      </div>

      <div class="mt-12 space-y-4">
        <button 
          @click="tancarSessio" 
          class="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          TANCAR SESSIÓ
        </button> 
        
        <div class="pt-4 border-t border-white/5 flex justify-center">
          <button 
            @click="eliminarCompte" 
            class="text-[10px] text-red-500/50 font-black uppercase tracking-widest hover:text-red-500 transition-colors py-2 px-4"
          >
            Eliminar el meu compte definitivament
          </button>
        </div>
      </div> 

      </main>

      <ModalPersonalitzat 
        :show="modalVisible"
        v-bind="modalProps"
        @confirm="handleModalConfirm"
        @cancel="handleModalCancel"
      />
   </div>
 </template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { netejarUrl } from '../utils/url';
import DiariExploracio from '../components/DiariExploracio.vue';
import ModalPersonalitzat from '../components/ModalPersonalitzat.vue';

const router = useRouter();
const { usuari: authUsuari, logout } = useAuth();

const user = ref(null);
const editantBio = ref(false);
const tempBio = ref('');

const modalVisible = ref(false);
const modalProps = ref({
  isAlert: false,
  icon: 'warning',
  title: '',
  message: '',
  confirmText: 'D\'ACORD',
  cancelText: 'CANCEL·LAR'
});
let modalResolve = null;

const mostrarModal = (options) => {
  return new Promise((resolve) => {
    modalProps.value = { ...modalProps.value, ...options };
    modalVisible.value = true;
    modalResolve = resolve;
  });
};

const handleModalConfirm = () => {
  modalVisible.value = false;
  if (modalResolve) modalResolve(true);
};

const handleModalCancel = () => {
  modalVisible.value = false;
  if (modalResolve) modalResolve(false);
};

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8088' : 'https://north.dam.inspedralbes.cat');

const percentatgeProgres = computed(() => {
  const count = user.value?.inventari_cromos?.length || 0;
  if (count <= 5) return (count / 5) * 100;
  if (count <= 15) return (count / 15) * 100;
  if (count <= 30) return (count / 30) * 100;
  return 100;
});

const cromosPerSeguentNivell = computed(() => {
  const count = user.value?.inventari_cromos?.length || 0;
  if (count <= 5) return 6 - count;
  if (count <= 15) return 16 - count;
  if (count <= 30) return 31 - count;
  return 0;
});

const emojiRol = computed(() => {
  const rol = user.value?.nivell;
  if (rol === 'Llegenda de la Ciutat') return '';
  if (rol === 'Expert en Rutes') return '';
  if (rol === 'Fotògraf de Carrer') return '';
  if (rol === 'Rastrejador Urbà') return '';
  return '';
});


const activeTab = ref('posts');
const tabs = [
  { id: 'posts', label: 'ELS MEUS POSTS' },
  { id: 'cromos', label: 'CROMOS' },
  { id: 'amics', label: 'AMICS' },
  { id: 'propostes', label: 'PROPOSTES' }
];

// 4. LES MEVES PROPOSTES
const mevesPeticions = ref([]);

async function fetchMevesPeticions() {
  try {
    const usuari = JSON.parse(localStorage.getItem('usuari'));
    if (!usuari?._id) return;
    const res = await fetch(`${API_URL}/api/peticions/meves`, {
      headers: { 'X-User-Id': usuari._id }
    });
    if (res.ok) {
      const data = await res.json();
      // Mapegem 'estat_validacio' a 'estat' per compatibilitat amb el template
      mevesPeticions.value = data.map(p => ({
        ...p,
        estat: p.estat_validacio || p.estat || 'pendent'
      }));
    }
  } catch (err) {
    console.error("Error carregant propostes:", err);
  }
}

// 1. CARREGAR MIS POSTS
const misPosts = ref([]);
async function carregarMisPosts() {
  try {
    const res = await fetch(`${API_URL}/api/social/posts`);
    const dades = await res.json();
    const allPosts = Array.isArray(dades) ? dades : [];
    const userId = user.value?._id;
    misPosts.value = allPosts.filter(p => p.usuari_id === userId || p.id_usuari === userId);
  } catch (err) {
    console.error("Error posts:", err);
  }
}

// 2. GUARDAR BIOGRAFIA A LA BD
async function guardarBio() {
  try {
    const res = await fetch(`${API_URL}/api/usuari/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        perfilId: user.value._id,
        novaBio: tempBio.value
      })
    });

    if (res.ok) {
      const data = await res.json();
      user.value = data.user; 
      localStorage.setItem('usuari', JSON.stringify(user.value));
      editantBio.value = false;
    }
  } catch (err) {
    await mostrarModal({
      isAlert: true,
      icon: 'warning',
      title: 'Error',
      message: "No s'ha pogut guardar la biografia"
    });
  }
}

// 3. ELIMINAR POST
async function eliminarPost(postId) {
  const isConfirmed = await mostrarModal({
    isAlert: false,
    icon: 'trash',
    title: 'Eliminar Post?',
    message: 'Estàs segur que vols eliminar aquesta publicació? Aquesta acció no es pot desfer.',
    confirmText: 'ELIMINAR'
  });
  if (!isConfirmed) return;
  try {
    await fetch(`${API_URL}/api/social/posts/${postId}`, { method: 'DELETE' });
    carregarMisPosts();
  } catch (err) {
    console.error("Error eliminant:", err);
  }
}

async function acceptarAmic(solicitud) {
  try {
    const res = await fetch(`${API_URL}/api/usuari/acceptar-amistat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        el_meu_perfil_id: user.value._id,
        id_nou_amic_perfil: solicitud.id_perfil 
      })
    });

    if (res.ok) {
      const actualitzat = await res.json();
      user.value = actualitzat.user;
      localStorage.setItem('usuari', JSON.stringify(user.value));
      await mostrarModal({
        isAlert: true,
        icon: 'success',
        title: 'Fantàstic!',
        message: "Ara sou amics!"
      });
    } else {
      const errorData = await res.json();
      console.error("Error del servidor:", errorData.message);
    }
  } catch (err) { 
    console.error("Error en la petició:", err); 
  }
}

// 4. TANCAR SESSIÓ — Usa el composable per netejar l'estat global
function tancarSessio() {
  logout(); 
  window.location.href = '/'; 
}

async function eliminarCompte() {
  const isConfirmed = await mostrarModal({
    isAlert: false,
    icon: 'warning',
    title: 'Eliminar Compte?',
    message: 'Estàs segur que vols eliminar el teu compte i totes les teves dades? Aquesta acció és irreversible i perdràs tot el teu progrés.',
    confirmText: 'ELIMINAR',
    cancelText: 'CANCEL·LAR'
  });

  if (!isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/api/usuari/${user.value._id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      await mostrarModal({
        isAlert: true,
        icon: 'success',
        title: 'Compte Eliminat',
        message: 'El teu compte ha estat eliminat correctament. Fins aviat!'
      });
      tancarSessio();
    } else {
      const errorData = await res.json();
      throw new Error(errorData.message || "No s'ha pogut eliminar el compte");
    }
  } catch (err) {
    console.error("Error al eliminar compte:", err);
    await mostrarModal({
      isAlert: true,
      icon: 'warning',
      title: 'Error',
      message: "Hi ha hagut un problema en eliminar el compte."
    });
  }
}
// Retorna la URL completa de la imatge del cromo
function imatgeCromo(src) {
  return netejarUrl(src);
}

// INICI
onMounted(async () => {
  const saved = localStorage.getItem('usuari');
  if (saved) {
    const localUser = JSON.parse(saved);
    
    try {
        // Fem servir el GET per ID per tenir les dades més recents (amics, sol·licituds...)
        const res = await fetch(`${API_URL}/api/usuari/${localUser._id}`);
        if (res.ok) {
            const freshData = await res.json();
            user.value = freshData;
            localStorage.setItem('usuari', JSON.stringify(freshData));
        } else {
            user.value = localUser;
        }
    } catch {
        user.value = localUser;
    }
    
    tempBio.value = user.value?.biografia || '';
    carregarMisPosts();
    fetchMevesPeticions();
  } else {
    router.push('/login');
  }
});
</script>


<style scoped>

.aspect-square { aspect-ratio: 1 / 1; }

.animate-fade-in {

animation: fadeIn 0.8s ease-out;

}


@keyframes fadeIn {

from { opacity: 0; transform: translateY(10px); }

to { opacity: 1; transform: translateY(0); }

}


.album-slot {

perspective: 1000px;

}


.album-slot img {

filter: contrast(1.1) brightness(0.9) sepia(0.2);


box-shadow: inset 0 0 20px rgba(0,0,0,0.5);

}


main {

background-image:

radial-gradient(circle at 50% 50%, rgba(64, 39, 73, 0.05) 0%, transparent 100%),

linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px);

background-size: 100% 100%, 20px 20px;

}

</style> 