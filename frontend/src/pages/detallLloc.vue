<template>
  <div v-if="lloc" class="min-h-screen bg-white flex flex-col overflow-x-hidden">
    
    <div class="relative h-72 w-full flex-shrink-0">
      <button 
        @click="$router.back()" 
        class="absolute top-6 left-6 z-50 bg-white/90 p-3 rounded-full shadow-lg active:scale-90"
      >
        <span class="text-xl text-gray-800">←</span>
      </button>
      <img :src="lloc.imatge_referencia" class="w-full h-full object-cover">
    </div>

    <div class="relative bg-white -mt-8 rounded-t-[40px] p-8 flex-1 pb-32 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      
      <div class="flex justify-between items-start mb-6">
        <div class="flex-1">
          <h1 class="text-3xl font-black text-gray-800 leading-tight">{{ lloc.nom }}</h1>
          <div class="inline-block bg-purple-100 px-3 py-1 rounded-lg mt-2">
            <p class="text-purple-700 font-bold text-xs uppercase tracking-widest">
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

      <button 
        @click="comencarJoc"
        class="relative z-30 w-full bg-purple-600 text-white font-black py-5 rounded-[20px] mt-10 shadow-xl shadow-purple-200 active:scale-95 transition-all uppercase tracking-widest text-sm"
      >
        COMENÇAR RUTA
      </button>
      <button 
        @click="anarACamara"
        class="relative z-30 w-full bg-purple-600 text-white font-black py-5 rounded-[20px] mt-10 shadow-xl shadow-purple-200 active:scale-95 transition-all uppercase tracking-widest text-sm"
      >
        OBRIR CÀMERA
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' 
import { useAuth } from '../composables/useAuth';
import { useLoginModal } from '../composables/useLoginModal';

const route = useRoute()
const router = useRouter() 
const lloc = ref(null)

const { usuari } = useAuth();
const { obrirModal } = useLoginModal();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

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
    path: '/sala-espera/crear', 
    query: { idLloc: route.params.id } 
  });
}



onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/api/mapa/punts`);
    const dades = await response.json();
    lloc.value = dades.find(item => item._id === route.params.id);
  } catch (err) {
    console.error("Error carregant el detall:", err);
  }
});
</script>
