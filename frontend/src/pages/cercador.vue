<template>
  <div class="min-h-screen bg-[#402749] p-6 pb-24">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black italic uppercase tracking-tighter text-white">Cercador</h1>
        <button @click="seleccionarDestiSorpresa" 
                :disabled="animantSorpresa"
                class="mt-2 flex items-center gap-2 bg-[#bc85ab]/20 border border-[#bc85ab]/50 text-[#f5cbdd] font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-full hover:bg-[#bc85ab]/40 transition-all active:scale-95 shadow-md backdrop-blur-sm disabled:opacity-50"
                :class="{ 'animate-pulse scale-105 shadow-[0_0_15px_rgba(188,133,171,0.5)]': !animantSorpresa }">
          <span class="text-sm leading-none">✨</span>
          <span>{{ animantSorpresa ? 'Triant el teu proper destí...' : 'Destí Sorpresa' }}</span>
        </button>
      </div>
      <BotonPerfil @login="actualitzarUsuari" />
    </div>

    <div v-if="animantSorpresa" 
         class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#402749]/80 backdrop-blur-md transition-opacity duration-500">
      
      <div class="relative w-full max-w-sm flex flex-col items-center">
        <p class="text-center font-black text-white mb-8 text-xl uppercase tracking-[0.2em] drop-shadow-lg">
          Cercant aventura...
        </p>

        <div class="w-full bg-[#f5cbdd] p-4 rounded-[2rem] border-[6px] border-[#bc85ab] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
          <div class="relative h-64 w-full bg-black rounded-2xl overflow-hidden">
            
            <div :style="estilScroll" 
                 class="absolute top-0 left-0 w-full transition-transform duration-[3000ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]">
              <div v-for="(img, idx) in fotosAnimacio" :key="idx" class="h-64 w-full flex-shrink-0">
                <img :src="img" class="h-full w-full object-cover brightness-90" @error="handleImgError" />
              </div>
            </div>

            <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div class="w-full h-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1),0_0_30px_rgba(188,133,171,0.8)] z-10 opacity-80"></div>
              
              <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
            </div>
          </div>
        </div>

        <p class="mt-8 text-[#d9a6c2] font-medium text-center animate-pulse">
          Triant el teu proper destí...
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-6">

      <button @click="mostrarFiltros = !mostrarFiltros"
        class="bg-gray-200 p-3 rounded-full text-gray-700 hover:bg-gray-300 transition-colors"
        :class="{ 'bg-gray-300': mostrarFiltros }">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      </button>

      <div class="relative flex-1">
        <input
          v-model="textBusqueda"
          type="text"
          placeholder="Cercar llocs..."
          class="w-full bg-white border-2 border-[#bc85ab]/20 rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#bc85ab] focus:ring-4 focus:ring-[#bc85ab]/10 transition-all text-lg font-medium shadow-inner"
        /><button class="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="mostrarFiltros" class="mb-6 p-4 bg-gray-100 rounded-2xl shadow-inner animate-fade-in-down">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Dificultat</label>
          <select v-model="filtreDificultat"
            class="w-full p-2 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#402749]">
            <option value="">Totes</option>
            <option value="Baixa">Baixa</option>
            <option value="Mitjana">Mitjana</option>
            <option value="Alta">Alta</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Barri</label>
          <select v-model="filtreBarri"
            class="w-full p-2 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#402749]">
            <option value="">Tots</option>
            <option v-for="barri in llistaBarris" :key="barri" :value="barri">
              {{ barri }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="lloc in llocsFiltrats" :key="lloc.id" class="bg-gray-200 rounded-3xl p-4 shadow-sm relative" :class="lloc.estat === 'properament' ? 'opacity-50' : ''">
        <div v-if="lloc.estat === 'properament'" class="absolute inset-0 bg-gradient-to-t from-[#402749]/90 to-transparent backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-3xl gap-2">
          <span class="text-xl font-black uppercase text-[#d9a6c2] tracking-widest">PROPERAMENT</span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-3">{{ lloc.nom }}</h2>
        <div v-if="lloc.estat === 'properament'" class="text-[#402749] font-black text-sm mb-2">Properament...</div>

        <div class="w-full h-48 bg-gray-400 rounded-xl mb-3 overflow-hidden">
          <img v-if="lloc.imatge" :src="lloc.imatge" alt="Imatge del lloc" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
            Sense imatge
          </div>
        </div>

        <p class="text-gray-500 text-sm mb-4 leading-relaxed">
          {{ lloc.descripcio }}
        </p>

        <div class="flex justify-between items-center mt-4 px-2">
          
          <div class="flex-none text-left">
            <span class="block font-bold text-gray-900 text-sm">Dificultat</span>
            <span class="text-gray-700 text-sm">{{ lloc.dificultat }}</span>
          </div>

          <div class="flex-1 flex flex-col items-center justify-center px-2">
            <template v-if="lloc.mitjana_estrelles">
              <span class="block font-bold text-gray-900 text-sm mb-1">Valoració</span>
              <svg style="width: 0; height: 0; position: absolute;">
                <defs>
                  <linearGradient id="halfStarGrad" x1="0" x2="100%" y1="0" y2="0">
                    <stop offset="50%" stop-color="#f59e0b" />
                    <stop offset="50%" stop-color="transparent" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="flex items-center gap-0.5">
                <svg v-for="star in 5" :key="star"
                     xmlns="http://www.w3.org/2000/svg" 
                     viewBox="0 0 24 24" 
                     :class="star <= Math.floor(lloc.mitjana_estrelles) 
                        ? 'fill-[#f59e0b] stroke-[#f59e0b] drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]' 
                        : (star === Math.ceil(lloc.mitjana_estrelles) && lloc.mitjana_estrelles % 1 >= 0.3
                           ? 'stroke-[#f59e0b] drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]' 
                           : 'fill-transparent stroke-[#bc85ab]')"
                     :style="star === Math.ceil(lloc.mitjana_estrelles) && lloc.mitjana_estrelles % 1 >= 0.3 ? 'fill: url(#halfStarGrad);' : ''"
                     class="w-4 h-4 transition-all duration-200"
                     stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
            </template>
          </div>

          <div class="flex-none flex justify-end">
            <button @click="anarALloc(lloc.id)"
              class="bg-[rgba(64,39,73,1)] text-white font-bold py-2 px-6 rounded-xl text-sm hover:bg-[rgba(64,39,73,0.8)] transition transform active:scale-95 shadow-md"
              :class="lloc.estat === 'properament' ? 'opacity-20 cursor-not-allowed' : ''"
              :disabled="lloc.estat === 'properament'">
              {{ lloc.estat === 'properament' ? 'Properament' : 'EXPLORAR' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import BotonPerfil from '../components/BotonPerfil.vue';

import { BASE_API_URL } from '../utils/url';
const API_URL = BASE_API_URL;
const router = useRouter();
const { login } = useAuth();

  const textBusqueda = ref('');
const totsElsLlocs = ref([]);
const mostrarFiltros = ref(false);
const filtreDificultat = ref('');
const filtreBarri = ref('');

const animantSorpresa = ref(false);
const fotosAnimacio = ref([]);
const estilScroll = ref({ transform: 'translateY(0px)' });
const placeholderImage = 'https://images.unsplash.com/photo-1467226632440-65f0b4957444?q=80&w=500&auto=format&fit=crop';
onMounted(() => {
  carregarDades();
  
 
});

// GET /api/cercador: Obté llista de llocs disponibles
async function carregarDades() {
  try {
    const resposta = await fetch(`${API_URL}/api/cercador`);    if (!resposta.ok) throw new Error('Error en carregar dades');
    const dades = await resposta.json();

    totsElsLlocs.value = dades.map(item => ({
      id: item._id,
      nom: item.nom,
      imatge: item.imatge_referencia,
      descripcio: item.descripcio,
      dificultat: item.dificultat || 'Desconeguda',
      barri: item.barri || 'Desconegut',
      mitjana_estrelles: item.mitjana_estrelles || null,
      total_ressenyes: item.total_ressenyes || 0,
      estat: item.estat || 'actiu'
    }));

  } catch (error) {
    console.error("Error:", error);
  }
}

// GET /api/cercador/aleatori: Obté destí aleatori
async function seleccionarDestiSorpresa() {
  if (animantSorpresa.value) return;

  try {
    const dadesPromise = fetch(`${API_URL}/api/cercador/aleatori`).then(res => res.json());

    const fotosDisponibles = totsElsLlocs.value
      .filter(l => l.estat === 'actiu' && l.imatge)
      .map(l => l.imatge);
    
    let baseFotos = [];
    if (fotosDisponibles.length > 0) {
      while (baseFotos.length < 15) {
        baseFotos = [...baseFotos, ...fotosDisponibles.sort(() => 0.5 - Math.random())];
      }
      baseFotos = baseFotos.slice(0, 15);
    } else {
      baseFotos = Array(10).fill(placeholderImage);
    }

    fotosAnimacio.value = baseFotos;
    estilScroll.value = { transform: 'translateY(0px)' };
    animantSorpresa.value = true;

    const llocEscollit = await dadesPromise;
    const imatgeFinal = llocEscollit.imatge_referencia || placeholderImage;

    fotosAnimacio.value = [...baseFotos, imatgeFinal];

    setTimeout(() => {
      const alcadaVisor = 256;      const desplacamentTotal = (fotosAnimacio.value.length - 1) * alcadaVisor;
      estilScroll.value = { 
        transform: `translateY(-${desplacamentTotal}px)` 
      };
    }, 100);

    setTimeout(() => {
      anarALloc(llocEscollit._id);
    }, 3500);

  } catch (error) {
    console.error("Error al seleccionar sorpresa:", error);
    animantSorpresa.value = false;
  }
}

function handleImgError(e) {
  e.target.src = placeholderImage;
}

const llistaBarris = computed(() => {
  const barris = totsElsLlocs.value
    .map(lloc => lloc.barri)
    .filter(barri => barri && barri !== 'Desconegut');
  return [...new Set(barris)].sort();});

const llocsFiltrats = computed(() => {
  return totsElsLlocs.value.filter(lloc => {
    const busqueda = textBusqueda.value.toLowerCase();

    const coincideixText = lloc.nom.toLowerCase().includes(busqueda) ||
      lloc.descripcio.toLowerCase().includes(busqueda);

    const coincideixDificultat = !filtreDificultat.value ||
      (lloc.dificultat && lloc.dificultat.toLowerCase() === filtreDificultat.value.toLowerCase());

    const coincideixBarri = !filtreBarri.value ||
      (lloc.barri === filtreBarri.value);

    const noDesactivat = lloc.estat !== 'desactivat';

    return coincideixText && coincideixDificultat && coincideixBarri && noDesactivat;
  });
});

function anarALloc(id) {
  router.push(`/lloc/${id}`);
}

const actualitzarUsuari = (dadesUsuari) => {
  login(dadesUsuari);
};
</script>