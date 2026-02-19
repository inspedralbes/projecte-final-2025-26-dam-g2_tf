<template>
  <div class="min-h-screen bg-white p-6 pb-24">
    <!-- Header / Nav -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Cercador</h1>

      <button @click="router.push('/perfil')"
        class="w-10 h-10 rounded-full bg-[#402749] flex items-center justify-center text-white shadow-md hover:bg-[#5a3766] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </button>
    </div>

    <!-- Buscador + Filtro -->
    <div class="flex items-center gap-2 mb-6">

      <!-- Botón Filtros -->
      <button class="bg-gray-200 p-3 rounded-full text-gray-700 hover:bg-gray-300 transition-colors">
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
function anarALloc(id) {
  router.push(`/lloc/${id}`);
}
</script>