<template>
  <div class="h-screen w-screen bg-gray-900 flex flex-col">
    <div class="relative flex-1 flex items-center justify-center overflow-auto">
      <div v-if="lloc" class="relative">
        
        <img 
          :src="`${API_URL}/fotos_mapa_rutes/${lloc._id}.jpg`" 
          class="max-w-none h-[80vh] w-auto shadow-2xl"
          alt="Mapa de referència"
        />

        <button 
          v-for="(punt, index) in lloc.punts_missio" 
          :key="index"
          @click="obrirCamera(punt)"
          class="absolute w-10 h-10 -ml-5 -mt-5 bg-yellow-400 border-4 border-white rounded-full flex items-center justify-center font-black"
          :style="{ left: punt.posicio_x + '%', top: punt.posicio_y + '%' }"
        >
          {{ index + 1 }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const lloc = ref(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

onMounted(async () => {
  // Carreguem les dades del lloc (que inclouen els punts_missio)
  const response = await fetch(`${API_URL}/api/mapa/punts`);
  const dades = await response.json();
  lloc.value = dades.find(item => item._id === route.params.id);
});

function obrirCamera(punt) {
  // Aquí aniria la lògica per obrir la càmera i enviar la foto al teu endpoint /validar-foto
  console.log("Anant a buscar el punt:", punt.nom_punt);
}
</script>