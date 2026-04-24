<template>
  <div class="min-h-screen bg-white p-6 pb-24">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Cercador</h1>
        <button @click="seleccionarDestiSorpresa" 
                :disabled="animantSorpresa"
                class="mt-1 flex items-center gap-1.5 text-[#804f7f] font-bold text-xs uppercase tracking-wider hover:text-[#5d3962] transition-colors disabled:opacity-50"
                :class="{ 'animate-pulse scale-105 contrast-125': !animantSorpresa }">
          <span>{{ animantSorpresa ? 'Triant el teu proper destí...' : '✨ Destí Sorpresa' }}</span>
        </button>
      </div>
      <BotonPerfil @login="actualitzarUsuari" />
    </div>

    <!-- Modal d'Impacte Destí Sorpresa -->
    <div v-if="animantSorpresa" 
         class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#402749]/80 backdrop-blur-md transition-opacity duration-500">
      
      <div class="relative w-full max-w-sm flex flex-col items-center">
        <!-- Text de Feedback -->
        <p class="text-center font-black text-white mb-8 text-xl uppercase tracking-[0.2em] drop-shadow-lg">
          Cercant aventura...
        </p>

        <!-- Tarja de l'Animació -->
        <div class="w-full bg-[#f5cbdd] p-4 rounded-[2rem] border-[6px] border-[#bc85ab] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
          <div class="relative h-64 w-full bg-black rounded-2xl overflow-hidden">
            
            <!-- Slot Machine Container -->
            <div :style="estilScroll" 
                 class="absolute top-0 left-0 w-full transition-transform duration-[3000ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)]">
              <div v-for="(img, idx) in fotosAnimacio" :key="idx" class="h-64 w-full flex-shrink-0">
                <img :src="img" class="h-full w-full object-cover brightness-90" @error="handleImgError" />
              </div>
            </div>

            <!-- Línia Brillant Central -->
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div class="w-full h-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1),0_0_30px_rgba(188,133,171,0.8)] z-10 opacity-80"></div>
              
              <!-- Gradients per l'efecte de visor -->
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

      <!-- Botón Filtros -->
      <button @click="mostrarFiltros = !mostrarFiltros"
        class="bg-gray-200 p-3 rounded-full text-gray-700 hover:bg-gray-300 transition-colors"
        :class="{ 'bg-gray-300': mostrarFiltros }">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      </button>

      <!-- Input de búsqueda -->
      <div class="relative flex-1">
        <input type="text" v-model="textBusqueda" placeholder="Buscar llocs..."
          class="w-full bg-gray-200 text-gray-700 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-400" />
        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Panel de Filtros -->
    <div v-if="mostrarFiltros" class="mb-6 p-4 bg-gray-100 rounded-2xl shadow-inner animate-fade-in-down">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Filtre Dificultat -->
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

        <!-- Filtre Barri -->
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

    <!-- Lista de Resultados -->
    <div class="space-y-6">
      <div v-for="lloc in llocsFiltrats" :key="lloc.id" class="bg-gray-200 rounded-3xl p-4 shadow-sm">
        <h2 class="text-xl font-bold text-gray-900 mb-3">{{ lloc.nom }}</h2>

        <!-- Imagen -->
        <div class="w-full h-48 bg-gray-400 rounded-xl mb-3 overflow-hidden">
          <img v-if="lloc.imatge" :src="lloc.imatge" alt="Imatge del lloc" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
            Sense imatge
          </div>
        </div>

        <p class="text-gray-500 text-sm mb-4 leading-relaxed">
          {{ lloc.descripcio }}
        </p>

        <!-- Bottom Row: Dificultat + Botó Explorar -->
        <div class="flex justify-between items-center mt-4 px-2">
          <div class="text-left">
            <span class="block font-bold text-gray-900 text-sm">Dificultat</span>
            <span class="text-gray-700 text-sm">{{ lloc.dificultat }}</span>
          </div>

          <button @click="anarALloc(lloc.id)"
            class="bg-[rgba(64,39,73,1)] text-white font-bold py-2 px-6 rounded-xl text-sm hover:bg-[rgba(64,39,73,0.8)] transition transform active:scale-95 shadow-md">
            EXPLORAR
          </button>
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const router = useRouter();
const { login } = useAuth();

// Variables de estado (datos)
const textBusqueda = ref('');
const totsElsLlocs = ref([]);
const mostrarFiltros = ref(false);
const filtreDificultat = ref('');
const filtreBarri = ref('');

// 2. AFEGEIX LES NOVES VARIABLES PER L'ANIMACIÓ AQUÍ [cite: 66, 74]
const animantSorpresa = ref(false);
const fotosAnimacio = ref([]);
const estilScroll = ref({ transform: 'translateY(0px)' });
const placeholderImage = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=500&auto=format&fit=crop';

// Al iniciar la página
onMounted(() => {
  carregarDades();
  
 
});

// Función para cargar los lugares desde el servidor
async function carregarDades() {
  try {
    const resposta = await fetch(`${API_URL}/api/cercador`);    if (!resposta.ok) throw new Error('Error al carregar dades');
    const dades = await resposta.json();

    // Guardamos los datos limpios en nuestra variable
    totsElsLlocs.value = dades.map(item => ({
      id: item._id,
      nom: item.nom,
      imatge: item.imatge_referencia,
      descripcio: item.descripcio,
      dificultat: item.dificultat || 'Desconeguda',
      barri: item.barri || 'Desconegut'
    }));

  } catch (error) {
    console.error("Error:", error);
  }
}

async function seleccionarDestiSorpresa() {
  if (animantSorpresa.value) return;

  try {
    // 1. Iniciem la càrrega del destí real
    const dadesPromise = fetch(`${API_URL}/api/cercador/aleatori`).then(res => res.json());

    // 2. Preparem un mix d'imatges d'impacte (mínim 10 + destí final)
    const fotosDisponibles = totsElsLlocs.value
      .map(l => l.imatge)
      .filter(Boolean);
    
    // Si no n'hi ha prou, utilitzem placeholders
    const baseFotos = fotosDisponibles.length >= 10 
      ? fotosDisponibles.sort(() => 0.5 - Math.random()).slice(0, 15)
      : [...fotosDisponibles, placeholderImage, placeholderImage, placeholderImage, placeholderImage, placeholderImage].slice(0, 10);

    fotosAnimacio.value = baseFotos;
    estilScroll.value = { transform: 'translateY(0px)' };
    animantSorpresa.value = true;

    // 3. Obtenim el lloc real
    const llocEscollit = await dadesPromise;
    const imatgeFinal = llocEscollit.imatge_referencia || placeholderImage;

    // 4. Actualitzem la llista per incloure la foto final al final del recorregut
    fotosAnimacio.value = [...baseFotos, imatgeFinal];

    // 5. Activem l'animació de transició
    setTimeout(() => {
      const alcadaVisor = 256; // h-64 = 256px
      const desplacamentTotal = (fotosAnimacio.value.length - 1) * alcadaVisor;
      estilScroll.value = { 
        transform: `translateY(-${desplacamentTotal}px)` 
      };
    }, 100);

    // 6. Redirecció en acabar l'animació (3000ms + petit buffer)
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

// Función calculada para filtrar (se actualiza sola cuando escribes)
// Llista dinàmica de barris
const llistaBarris = computed(() => {
  const barris = totsElsLlocs.value
    .map(lloc => lloc.barri)
    .filter(barri => barri && barri !== 'Desconegut');
  return [...new Set(barris)].sort(); // Valors únics i ordenats
});

// Función calculada para filtrar (se actualiza sola cuando escribes)
const llocsFiltrats = computed(() => {
  return totsElsLlocs.value.filter(lloc => {
    const busqueda = textBusqueda.value.toLowerCase();

    // Filtre text
    const coincideixText = lloc.nom.toLowerCase().includes(busqueda) ||
      lloc.descripcio.toLowerCase().includes(busqueda);

    // Filtre dificultat
    const coincideixDificultat = !filtreDificultat.value ||
      (lloc.dificultat && lloc.dificultat.toLowerCase() === filtreDificultat.value.toLowerCase());

    // Filtre barri
    const coincideixBarri = !filtreBarri.value ||
      (lloc.barri === filtreBarri.value);

    return coincideixText && coincideixDificultat && coincideixBarri;
  });
});

// Funciones de navegación
function anarALloc(id) {
  router.push(`/lloc/${id}`);
}

const actualitzarUsuari = (dadesUsuari) => {
  login(dadesUsuari);
};
</script>