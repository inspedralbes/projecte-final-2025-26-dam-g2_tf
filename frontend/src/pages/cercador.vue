<template>
  <div class="min-h-screen bg-white p-6 pb-24">
    <!-- Header / Nav -->
    <div class="flex items-center mb-6">
      <button @click="tornarEnrere" class="p-2 rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-6 h-6 text-gray-600">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
      <h1 class="text-xl font-bold ml-4">Cercador</h1>
    </div>

    <!-- Buscador -->
    <div class="relative mb-4">
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
            class="bg-[#3b273b] text-white font-bold py-2 px-6 rounded-xl text-sm hover:bg-[#523552] transition transform active:scale-95 shadow-md">
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

const router = useRouter();

// Variables de estado (datos)
const textBusqueda = ref('');
const totsElsLlocs = ref([]);

// Al iniciar la página
onMounted(() => {
  carregarDades();
});

// Función para cargar los lugares desde el servidor
async function carregarDades() {
  try {
    const resposta = await fetch('http://localhost:8088/api/cercador');
    if (!resposta.ok) throw new Error('Error al carregar dades');
    const dades = await resposta.json();

    // Guardamos los datos limpios en nuestra variable
    totsElsLlocs.value = dades.map(item => ({
      id: item._id,
      nom: item.nom,
      imatge: item.imatge_referencia,
      descripcio: item.descripcio,
      dificultat: item.dificultat || 'Desconeguda'
    }));

  } catch (error) {
    console.error("Error:", error);
  }
}

// Función calculada para filtrar (se actualiza sola cuando escribes)
const llocsFiltrats = computed(() => {
  return totsElsLlocs.value.filter(lloc => {
    const busqueda = textBusqueda.value.toLowerCase();

    return lloc.nom.toLowerCase().includes(busqueda) ||
      lloc.descripcio.toLowerCase().includes(busqueda);
  });
});

// Funciones de navegación
function tornarEnrere() {
  router.push('/');
}

function anarALloc(id) {
  router.push(`/lloc/${id}`);
}
</script>