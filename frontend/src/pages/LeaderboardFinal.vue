<template>
  <div class="min-h-screen bg-[#402749] text-white p-6 flex flex-col items-center">
    <h2 class="text-3xl font-black italic uppercase tracking-tighter mb-8 text-[#f5cbdd] animate-fade-in">
      🏆 Resultats Finals
    </h2>

    <div class="w-full max-w-md space-y-4 mb-10">
      <div v-for="(jugador, index) in resultatsSessio" :key="index" 
           class="bg-[#5d3962] p-4 rounded-3xl flex items-center justify-between border-2 border-white/10 shadow-xl animate-slide-up"
           :style="{ animationDelay: index * 100 + 'ms' }"
           :class="{'scale-105 border-[#f5cbdd] shadow-[#f5cbdd]/20': index === 0}">
        
        <div class="flex items-center gap-4">
          <span class="text-2xl font-black italic w-8 text-[#f5cbdd]">#{{ index + 1 }}</span>
          
          <div class="w-12 h-12 rounded-2xl bg-[#bc85ab] overflow-hidden border-2 border-white/20">
            <img v-if="jugador.id_usuari?.avatar" :src="jugador.id_usuari.avatar" class="w-full h-full object-cover">
            <span v-else class="flex items-center justify-center h-full font-bold uppercase">
              {{ jugador.id_usuari?.nom_usuari?.charAt(0) }}
            </span>
          </div>

          <div>
            <p class="font-black text-sm uppercase tracking-wide leading-none mb-1">
              {{ jugador.id_usuari?.nom_usuari || 'Explorador' }}
            </p>
            <p class="text-[10px] text-[#f5cbdd]/60 font-bold italic">
              {{ jugador.temps || '0:00' }} minuts
            </p>
          </div>
        </div>
        
        <div class="text-right">
          <span class="text-xl font-black text-[#f5cbdd]">+{{ jugador.puntsPartida || 0 }}</span>
          <p class="text-[8px] font-black uppercase tracking-widest opacity-50">PTS</p>
        </div>
      </div>
    </div>

    <div class="w-full max-w-md bg-white/5 p-6 rounded-[40px] border border-white/10 mb-8 shadow-2xl">
      <h3 class="text-xs font-black uppercase tracking-[0.2em] text-center mb-4 text-[#f5cbdd]">Valora l'experiència</h3>
      <div class="flex justify-center gap-3 text-4xl mb-6">
        <button v-for="i in 5" :key="i" @click="puntuacio = i" 
                class="transition-transform active:scale-150 hover:scale-110"
                :class="puntuacio >= i ? 'grayscale-0' : 'grayscale opacity-20'">
          ⭐
        </button>
      </div>
      
      <button @click="enviarRessenya" 
              class="w-full bg-[#f5cbdd] text-[#402749] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
        GUARDAR I FINALITZAR
      </button>
    </div>

    <button @click="anarAlGlobal" class="text-[#f5cbdd] text-[10px] font-black uppercase tracking-widest border-b-2 border-[#f5cbdd]/30 hover:border-[#f5cbdd] transition-all pb-1">
      Veure Rànquing Global
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps(['sessionId']); // Rebem l'id de la sessió des del router
const router = useRouter();
const route = useRoute();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

const resultatsSessio = ref([]);
const puntuacio = ref(0);

onMounted(async () => {
  // Si no ve per props, el mirem de la URL
  const sId = props.sessionId || route.params.id;
  if (!sId) return;

  try {
    const res = await fetch(`${API_URL}/api/social/leaderboard/session/${sId}`);
    if (res.ok) {
      resultatsSessio.value = await res.json();
    }
  } catch (err) {
    console.error("Error carregant rànquing de sessió:", err);
  }
});

const enviarRessenya = async () => {
  if (puntuacio.value === 0) return alert("És obligatori fer una ressenya!");
  
  // Aquí podries cridar a la teva nova ruta de ressenyes si vols guardar la puntuació
  // await fetch(`${API_URL}/api/social/ressenyes`, { ... });
  
  router.push('/mapa');
};

const anarAlGlobal = () => {
  // Redirigim a la pàgina social on tens la pestanya de rànquing global
  router.push('/social'); 
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.6s ease-out; }
.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>