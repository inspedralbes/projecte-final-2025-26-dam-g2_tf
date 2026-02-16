<template>
  <div v-if="lloc" class="min-h-screen bg-gray-50 flex flex-col">
    <div class="relative h-64 w-full">
      <button @click="$router.back()" class="absolute top-4 left-4 z-10 bg-white/90 p-2 rounded-full shadow">
        ← 
      </button>
      <img :src="lloc.imatge_referencia" class="w-full h-full object-cover">
    </div>

    <div class="flex-1 bg-white -mt-6 rounded-t-3xl p-6 shadow-xl">
      <h1 class="text-2xl font-black text-gray-800">{{ lloc.nom }}</h1>
      <p class="text-purple-600 font-bold text-sm mb-4">{{ lloc.dificultat }}</p>
      
      <div class="space-y-6">
        <section>
          <h3 class="font-bold text-gray-400 uppercase text-xs tracking-widest">Història</h3>
          <p class="text-gray-700 leading-snug">{{ lloc.explicacio_historica }}</p>
        </section>

        <section class="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <h3 class="font-bold text-purple-900 text-sm mb-2 italic">Pistes per a la teva ruta</h3>
          <ul class="list-disc list-inside text-purple-800 text-sm space-y-1">
            <li v-for="pista in lloc.pistes" :key="pista">{{ pista }}</li>
          </ul>
        </section>
      </div>

      <button 
        @click="comencarJoc"
        class="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl mt-8 shadow-lg active:scale-95 transition-all uppercase tracking-wider"
    >
    COMENÇAR RUTA
  </button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' 

const route = useRoute()
const router = useRouter() 
const lloc = ref(null)

// Funció per anar a la pàgina del joc
function comencarJoc() {
  // Passem l'ID del lloc actual perquè el joc sàpiga què carregar
  router.push({ name: 'inici-joc', params: { id: route.params.id } });
}

onMounted(async () => {
  try {
    const response = await fetch(`http://localhost:8088/api/mapa/punts`);
    const dades = await response.json();
    lloc.value = dades.find(item => item._id === route.params.id);
  } catch (err) {
    console.error("Error carregant el detall:", err);
  }
});
</script>