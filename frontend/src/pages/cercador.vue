<template>
  <div class="min-h-screen bg-white p-6 pb-24">
    <!-- Header / Nav -->
    <div class="flex items-center mb-6">
      <button @click="router.push('/')" class="p-2 rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-gray-600">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
      <h1 class="text-xl font-bold ml-4">Cercador</h1>
    </div>

    <!-- Buscador -->
    <div class="relative mb-4">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Buscar lugares" 
        class="w-full bg-gray-200 text-gray-700 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <button class="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>
    </div>



    <!-- Lista de Resultados -->
    <div class="space-y-6">
      <div v-for="location in filteredLocations" :key="location.id" class="bg-gray-200 rounded-3xl p-4 shadow-sm">
        <h2 class="text-xl font-bold text-gray-900 mb-3">{{ location.name }}</h2>
        
        <!-- Imagen (Placeholder por ahora) -->
        <div class="w-full h-48 bg-gray-400 rounded-xl mb-3 overflow-hidden">
          <img 
            v-if="location.image" 
            :src="location.image" 
            alt="Imagen del lugar" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
            Sin imagen
          </div>
        </div>

        <p class="text-gray-500 text-sm mb-4 leading-relaxed">
          {{ location.description }}
        </p>

        <!-- Bottom Row: Difficulty + Explore Button -->
        <div class="flex justify-between items-center mt-4 px-2">
          <div class="text-left">
            <span class="block font-bold text-gray-900 text-sm">Dificultad</span>
            <span class="text-gray-700 text-sm">{{ location.difficulty }}</span>
          </div>

          <button 
            @click="router.push(`/lloc/${location.id}`)"
            class="bg-[#3b273b] text-white font-bold py-2 px-6 rounded-xl text-sm hover:bg-[#523552] transition transform active:scale-95 shadow-md"
          >
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

// Estado del buscador
const searchQuery = ref('');

// Datos de lugares (desde la BBDD)
const locations = ref([]);

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8088/api/cercador');
    if (!response.ok) throw new Error('Error al cargar datos');
    
    const data = await response.json();
    
    // Mapear los datos de la BBDD al formato que espera la vista
    locations.value = data.map(item => ({
      id: item._id,
      name: item.nom,
      image: item.imatge_referencia,
      description: item.descripcio,
      distance: "N/A", // La distancia dependería de la ubicación del usuario, por ahora N/A
      difficulty: item.dificultat || 'Desconocida',
      rating: 4 // Valor por defecto ya que no hay campo directo de rating
    }));
  } catch (error) {
    console.error(error);
  }
});

// Lógica de filtrado simple
const filteredLocations = computed(() => {
  return locations.value.filter(loc => {
    // Filtrar por texto
    return loc.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           loc.description.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

</script>