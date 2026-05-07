<template>
  <div class="bg-gradient-to-b from-[#1a0a1f] to-black min-h-screen flex flex-col text-white overflow-hidden">

    <div class="absolute top-5 right-5 z-[500]">
      <BotonPerfil />
    </div>

    <header class="p-6">
      <h1 class="text-3xl font-black italic uppercase tracking-tighter text-white">Descobreix rutes</h1>
    </header>

    <div 
      ref="scrollContainer"
      @scroll="handleScroll"
      class="flex-1 flex items-center overflow-x-auto gap-4 md:gap-8 snap-x snap-mandatory scrollbar-hide px-[15vw]"
    >
      <div 
        v-for="(lloc, index) in llistaLlocs" 
        :key="lloc._id"
        @click="scrollToCard(index)"
        class="card-item relative flex-shrink-0 snap-center transition-all duration-500 ease-out cursor-pointer
               w-[70vw] h-[50vh] 
               md:w-[400px] md:h-[600px] lg:w-[500px]"
        :class="activeIndex === index ? 'scale-110 z-20 opacity-100' : 'scale-90 z-10 opacity-40'"
      >
         <img 
           :src="netejarUrl(lloc.imatge_referencia)" 
           class="absolute inset-0 w-full h-full object-cover rounded-3xl transition-transform duration-700"
           :class="activeIndex === index ? 'scale-100' : 'scale-110'"
         />
         <!-- Overlay PROPERAMENT Premium -->
         <div v-if="lloc.estat === 'properament'" 
              class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#402749]/60 backdrop-blur-[2px] rounded-3xl">
           <span class="text-[#d9a6c2] font-bold tracking-[0.2em] text-sm uppercase">Properament</span>
         </div>
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end rounded-3xl">
          <h2 class="text-xl md:text-3xl font-bold mb-2">{{ lloc.nom }}</h2>
          <p class="text-sm md:text-base text-gray-200 line-clamp-2">{{ lloc.descripcio }}</p>
          
           <!-- Avís de ruta bloquejada -->
           <div v-if="esBloqueig(lloc)" class="mt-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-xl">
             <span class="text-lg">🔒</span>
             <span class="text-xs font-bold text-orange-300">
               No disponible fins les {{ lloc.control_horari?.hora_fi ?? '07:00' }}
             </span>
           </div>

            <!-- Overlay PROPERAMENT -->
            <div v-if="lloc.estat === 'properament'" class="absolute inset-0 bg-gradient-to-t from-[#402749]/90 to-transparent backdrop-blur-[2px] flex flex-col items-center justify-center z-20 rounded-3xl gap-2">
              <span class="text-xl font-black uppercase text-[#d9a6c2] tracking-widest">PROPERAMENT</span>
            </div>

            <button 
              v-if="activeIndex === index"
              class="mt-4 bg-white text-purple-900 py-2 px-6 rounded-full font-bold self-start transform transition-all active:scale-95"
              @click.stop="$router.push(`/lloc/${lloc._id}`)"
              :disabled="lloc.estat === 'properament'"
              :class="lloc.estat === 'properament' ? 'opacity-30 cursor-not-allowed' : ''"
            >
              {{ lloc.estat === 'properament' ? 'Properament' : 'Explorar' }}
            </button>
        </div>
      </div> 
    <div class="flex-shrink-0 w-[40vw] h-10 pointer-events-none"></div>

    </div> <div class="flex justify-center gap-2 py-8">
      <div 
        v-for="(_, index) in llistaLlocs" 
        :key="index"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="activeIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/30'"
      ></div>
    </div>

  </div> </template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import BotonPerfil from '../components/BotonPerfil.vue';
import { netejarUrl } from '../utils/url';

const { usuari } = useAuth();
const router = useRouter();
const llistaLlocs = ref([]);
const activeIndex = ref(0);
const scrollContainer = ref(null);

// Vigilem si l'usuari canvia (per exemple en fer login/registre)
watch(usuari, (nouUsuari) => {
  if (nouUsuari && nouUsuari.lore_inicial_vist === false) {
    router.push('/sobre-lore/inicial');
  }
}, { immediate: true });

// Comprova si una ruta està bloquejada en aquest moment
const esBloqueig = (lloc) => {
  const horari = lloc?.control_horari;
  if (!horari?.actiu) return false;
  
  const ara = new Date();
  const minutsActuals = ara.getHours() * 60 + ara.getMinutes();
  
  const [hInici, mInici] = (horari.hora_inici ?? "22:00").split(':').map(Number);
  const [hFi, mFi] = (horari.hora_fi ?? "07:00").split(':').map(Number);
  const minutsInici = hInici * 60 + mInici;
  const minutsFi = hFi * 60 + mFi;
  
  if (minutsInici > minutsFi) return minutsActuals >= minutsInici || minutsActuals < minutsFi;
  return minutsActuals >= minutsInici && minutsActuals < minutsFi;
};

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8088' : 'https://north.dam.inspedralbes.cat');

onMounted(async () => {
  try {
    const resposta = await fetch(`${API_URL}/api/mapa/punts`);
    
    // Si la respuesta no es un JSON (es el error 404 de Nginx), lanzamos error
    const contentType = resposta.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("El servidor no ha enviat JSON (comprova Nginx)");
    }

    const dades = await resposta.json();
    // mapa/punts ja ve ordenat per 'ordre' del backend
    llistaLlocs.value = dades.filter(lloc => lloc.estat !== 'desactivat');
  } catch (err) {
    console.error("Error cargando rutas:", err);
    // Inicializamos como array vacío para que el v-for no explote
    llistaLlocs.value = []; 
  }
});


const handleScroll = () => {
  const container = scrollContainer.value;
  if (!container) return;

  const center = container.scrollLeft + (container.offsetWidth / 2);
  
  const cards = container.querySelectorAll('.card-item');
  cards.forEach((card, index) => {
    const cardMid = card.offsetLeft + (card.offsetWidth / 2);
    if (Math.abs(center - cardMid) < card.offsetWidth / 2) {
      activeIndex.value = index;
    }
  });
};

const scrollToCard = (index) => {
  const container = scrollContainer.value;
  const card = container.querySelectorAll('.card-item')[index];
  container.scrollTo({
    left: card.offsetLeft - (container.offsetWidth / 2) + (card.offsetWidth / 2),
    behavior: 'smooth'
  });
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>