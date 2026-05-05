<template>
  <div class="min-h-screen bg-[#402749] text-white p-4 flex flex-col items-center">
    
    <h2 class="text-2xl font-black italic uppercase mb-8 text-[#f5cbdd]">
      Resultats Finals
    </h2>

    <div class="w-full max-w-md space-y-3 mb-8">
      <div v-for="(jugador, index) in resultatsSessio" :key="index" 
           class="bg-[#5d3962] p-4 rounded-2xl flex items-center justify-between border border-white/10"
           :class="{'border-[#f5cbdd] bg-[#6d4372]': index === 0}">
        
        <div class="flex items-center gap-3">
          <span class="text-xl font-bold italic text-[#f5cbdd]">#{{ index + 1 }}</span>
          
          <div class="w-10 h-10 rounded-full bg-[#bc85ab] flex items-center justify-center font-bold border border-white/20">
            {{ jugador.id_usuari?.nom_usuari?.charAt(0) || 'U' }}
          </div>

          <div>
            <p class="font-bold text-sm uppercase">{{ jugador.id_usuari?.nom_usuari || 'Explorador' }}</p>
            <p class="text-[10px] opacity-60 italic">{{ jugador.temps || 0 }} segons</p>
          </div>
        </div>
        
        <div class="text-right">
          <span class="text-lg font-black text-[#f5cbdd]">{{ (jugador.punts_completats || []).length }}</span>
          <p class="text-[8px] uppercase opacity-50">Fotos</p>
          <span class="text-sm font-bold text-pink-200">{{ Math.round(jugador.exactitud_media || 0) }}%</span>
          <p class="text-[8px] uppercase opacity-50">Precisió</p>
        </div>
      </div>
    </div>

    <div class="w-full max-w-md bg-white/5 p-6 rounded-3xl border border-white/10">
      <h3 class="text-[10px] font-bold uppercase text-center mb-4 tracking-widest text-[#f5cbdd]">Valora la partida</h3>
      <div class="flex justify-center gap-4 text-3xl mb-6">
        <button v-for="i in 5" :key="i" @click="puntuacio = i" 
                class="transition-transform active:scale-125"
                :class="puntuacio >= i ? 'opacity-100' : 'opacity-20'">
          ⭐
        </button>
      </div>
      
      <button @click="enviarRessenya" 
              class="w-full bg-[#f5cbdd] text-[#402749] py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
        FINALITZAR I TORNAR AL MAPA
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCustomModal } from '../composables/useCustomModal';

const router = useRouter();
const route = useRoute();
const { mostrarModal } = useCustomModal();
const API_URL = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';

const resultatsSessio = ref([]);
const puntuacio = ref(0);

/**
 * Ordena els jugadors per:
 * 1. Nombre de fotos completades (descendent) — qui ha completat més té millor posició
 * 2. En empat, precisió mitjana (descendent) — qui té millor precisió guanya
 */
function compararJugadors(a, b) {
  const fotesA = (a.punts_completats || []).length;
  const fotesB = (b.punts_completats || []).length;
  if (fotesB !== fotesA) return fotesB - fotesA;
  return (b.exactitud_media || 0) - (a.exactitud_media || 0);
}

async function carregarResultats() {
  const sId = route.params.sala || route.params.id;
  if (!sId) return;

  try {
    const res = await fetch(API_URL + '/api/sessionsJoc/' + sId);
    if (res.ok) {
      const dadesSessio = await res.json();
      resultatsSessio.value = dadesSessio.jugadors.sort(compararJugadors);
    }
  } catch (err) {
    console.error("Error carregant rànquing:", err);
  }
}

async function enviarRessenya() {
  if (puntuacio.value === 0) {
    await mostrarModal({ isAlert: true, message: "Si us plau, posa una estrella abans de marxar!" });
    return;
  }
  router.push('/mapa');
}

onMounted(carregarResultats);
</script>