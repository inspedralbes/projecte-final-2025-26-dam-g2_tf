<template>
  <div v-if="lloc" class="min-h-screen bg-white flex flex-col overflow-x-hidden">
    
    <div class="relative h-72 w-full flex-shrink-0">
      <button 
        @click="$router.back()" 
        class="absolute top-6 left-6 z-50 bg-white/90 p-3 rounded-full shadow-lg active:scale-90"
      >
        <span class="text-xl text-gray-800">←</span>
      </button>
      <img :src="netejarUrl(lloc.imatge_referencia)" class="w-full h-full object-cover">
    </div>

    <div class="relative bg-white -mt-8 rounded-t-[40px] p-8 flex-1 pb-32 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      
      <div class="flex justify-between items-start mb-6">
        <div class="flex-1">
          <h1 class="text-3xl font-black text-gray-800 leading-tight">{{ lloc.nom }}</h1>
          <div class="inline-block bg-purple-50 px-3 py-1 rounded-lg mt-2">
            <p class="text-purple-900 font-bold text-xs uppercase tracking-widest">
              {{ lloc.dificultat }}
            </p>
          </div>
        </div>

        <button 
          @click="obrirGoogleMaps"
          class="animate-pulse-subtle bg-blue-50 text-blue-600 p-4 rounded-2xl shadow-sm border border-blue-100 active:scale-90 transition-all flex flex-col items-center justify-center gap-1 min-w-[80px]"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
          </svg>
          <span class="text-[10px] font-bold uppercase tracking-tighter">Maps</span>
        </button>
      </div>
      
      <div class="space-y-8">
        <section>
          <h3 class="font-bold text-gray-300 uppercase text-[10px] tracking-[0.2em] mb-3">Història</h3>
          <p class="text-gray-700 leading-relaxed text-base">
            {{ lloc.explicacio_historica }}
          </p>
        </section>
      </div>

      <!-- Avís de bloqueig horari -->
      <div v-if="esBloqueig" class="mt-8 p-5 bg-orange-50 border-2 border-orange-200 rounded-3xl flex flex-col items-center gap-3 text-center">
        <span class="text-4xl">🔒</span>
        <p class="font-black text-orange-700 text-base">Aquesta ruta no està disponible ara mateix.</p>
        <p class="text-orange-600 text-sm">
          Tornarà a estar activa a les 
          <strong>{{ lloc.control_horari.hora_fi }}</strong>.
        </p>
      </div>

      <button 
        v-if="!esBloqueig"
        @click="comencarJoc"
        class="relative z-30 w-full bg-[rgba(64,39,73)] text-white font-black py-5 rounded-[20px] mt-10 shadow-xl shadow-purple-200 active:scale-95 transition-all uppercase tracking-widest text-sm"
      >
        COMENÇAR RUTA
      </button>

      <button 
        v-else
        disabled
        class="relative z-30 w-full bg-gray-200 text-gray-400 font-black py-5 rounded-[20px] mt-4 uppercase tracking-widest text-sm cursor-not-allowed"
      >
        RUTA NO DISPONIBLE
      </button>

      <!-- Valoraciones -->
      <div class="mt-10">
        <h3 class="font-bold text-gray-300 uppercase text-[10px] tracking-[0.2em] mb-4">Valoracions dels usuaris</h3>
        
        <div v-if="ressenyes.length > 0" class="space-y-4">
          <div v-for="ressenya in ressenyes" :key="ressenya._id" class="bg-gray-50 p-4 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-full bg-purple-200 overflow-hidden">
                <img v-if="ressenya.id_usuari?.avatar" :src="netejarUrl(ressenya.id_usuari.avatar)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-purple-600 font-bold text-xs">
                  {{ ressenya.id_usuari?.nom_usuari ? ressenya.id_usuari.nom_usuari.charAt(0).toUpperCase() : 'U' }}
                </div>
              </div>
              <div class="flex-1">
                <p class="font-bold text-sm text-gray-800">{{ ressenya.id_usuari?.nom_usuari || 'Usuari' }}</p>
                <div class="flex text-[#f59e0b] text-xs">
                  <svg v-for="star in 5" :key="star"
                       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       :class="star <= ressenya.estrelles ? 'fill-current' : 'fill-transparent stroke-current'"
                       class="w-3 h-3" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
              </div>
            </div>
            <p class="text-gray-600 text-sm italic">"{{ ressenya.comentari }}"</p>
          </div>
        </div>

        <div v-else class="text-center py-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p class="text-gray-400 text-sm italic">Encara no hi ha valoracions per aquest lloc.</p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' 
import { useAuth } from '../composables/useAuth';
import { useLoginModal } from '../composables/useLoginModal';
import { netejarUrl } from '../utils/url';

const route = useRoute()
const router = useRouter() 
const lloc = ref(null)
const ressenyes = ref([])

const { usuari } = useAuth();
const { obrirModal } = useLoginModal();

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8088' : 'https://north.dam.inspedralbes.cat');

// Comprova si la ruta està bloquejada en funció de l'hora actual
const esBloqueig = computed(() => {
  if (!lloc.value) return false;
  const horari = lloc.value.control_horari;
  if (!horari?.actiu) return false;

  const ara = new Date();
  const minutsActuals = ara.getHours() * 60 + ara.getMinutes();
  
  const [hInici, mInici] = (horari.hora_inici ?? "22:00").split(':').map(Number);
  const [hFi, mFi] = (horari.hora_fi ?? "07:00").split(':').map(Number);
  const minutsInici = hInici * 60 + mInici;
  const minutsFi = hFi * 60 + mFi;

  // Cas nocturn: el bloqueig travessa la mitjanit (ex: 22:30 → 07:30)
  if (minutsInici > minutsFi) {
    return minutsActuals >= minutsInici || minutsActuals < minutsFi;
  }
  // Cas diürn: bloqueig dins del mateix dia (ex: 13:00 → 17:00)
  return minutsActuals >= minutsInici && minutsActuals < minutsFi;
});

function obrirGoogleMaps() {
  if (!lloc.value || !lloc.value.ubicacio || !lloc.value.ubicacio.coordinates) {    
  console.error("No hay coordenadas disponibles");
    return;
  }
  
  const [lng, lat] = lloc.value.ubicacio.coordinates;
  
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  
  window.open(url, '_blank');
}

function anarACamara() {
  if (!usuari.value) {
    obrirModal('Has d\'iniciar sessió per poder usar la càmera i desbloquejar col·leccionables!');
    return;
  }
  router.push({ name: 'camara', params: { id: route.params.id } });
}

function comencarJoc() {
  if (!usuari.value) {
    obrirModal('Per començar la ruta i guardar el teu progress, has d\'iniciar sessió primer. és ràpid i gratuit!');
    return;
  }

  router.push({ 
    name: 'inici-joc', 
    params: { id: route.params.id } 
  });
}

onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/api/mapa/punts`);
    const dades = await response.json();
    lloc.value = dades.find(item => item._id === route.params.id);
    
    // Carregar ressenyes
    const resRessenyes = await fetch(`${API_URL}/api/mapa/punts/${route.params.id}/ressenyes`);
    if (resRessenyes.ok) {
      ressenyes.value = await resRessenyes.json();
    }
  } catch (err) {
    console.error("Error carregant el detall:", err);
  }
});
</script>
