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
      
      <div class="mb-6">
        <h1 class="text-3xl font-black text-gray-800 leading-tight">{{ lloc.nom }}</h1>
        <div class="inline-block bg-purple-100 px-3 py-1 rounded-lg mt-2">
          <p class="text-purple-700 font-bold text-xs uppercase tracking-widest">
            {{ lloc.dificultat }}
          </p>
        </div>
      </div>
      
      <div class="space-y-8">
        <section>
          <h3 class="font-bold text-gray-300 uppercase text-[10px] tracking-[0.2em] mb-3">Història</h3>
          <p class="text-gray-700 leading-relaxed text-base">
            {{ lloc.explicacio_historica }}
          </p>
        </section>

        <section class="bg-purple-50 p-6 rounded-[25px] border border-purple-100">
          <h3 class="font-black text-purple-900 text-sm mb-4">Pistes per a la teva ruta</h3>
          <ul class="space-y-3">
            <li v-for="(pista, index) in lloc.pistes" :key="index" class="flex items-start gap-3 text-purple-800 text-sm">
              <span class="text-purple-400 mt-1">•</span>
              {{ pista }}
            </li>
          </ul>
        </section>
      </div>

      <button 
        @click="comencarJoc"
        class="relative z-30 w-full bg-purple-600 text-white font-black py-5 rounded-[20px] mt-10 shadow-xl shadow-purple-200 active:scale-95 transition-all uppercase tracking-widest text-sm"
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

// IMPORTANT: Revisa que aquesta funció estigui EXACTAMENT així
function comencarJoc() {
  console.log("Botó polsat! Anant al joc...");
  router.push({ name: 'inici-joc', params: { id: route.params.id } });
}

onMounted(async () => {
  try {
    const response = await fetch(`http://localhost:8088/api/mapa/punts`);
    const dades = await response.json();
    // Busquem el lloc per ID
    lloc.value = dades.find(item => item._id === route.params.id);
  } catch (err) {
    console.error("Error carregant el detall:", err);
  }
});
</script>