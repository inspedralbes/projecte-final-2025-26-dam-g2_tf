<template>
  <div class="fixed bottom-0 z-50 w-full bg-[#402749] border-t border-[#804f7f] left-1/2 -translate-x-1/2">

    <div class="grid h-full max-w-lg grid-cols-5 mx-auto">
        
        <button @click="irA('/social')" type="button" class="relative inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
            <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Social</span>
            <span v-if="peticionsPendentsCount > 0" class="absolute top-2 right-4 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full shadow-lg border border-[#402749]">
              {{ peticionsPendentsCount }}
            </span>
        </button>

        <button @click="irA('/cercador')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
            <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
            </svg>
            <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Cerca</span>
        </button>

        <button @click="irA('/')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
            <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
            </svg>
            <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Inici</span>
        </button>

        <button @click="irA('/mapa')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
            <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Mapa</span>
        </button>

        <button @click="irA('/peticions')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
            <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Pujar</span>
        </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { usuari } = useAuth();
const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8088' : 'https://north.dam.inspedralbes.cat');

const peticionsPendentsCount = ref(0);
let intervalId = null;

let lastErrorTime = 0;
const ERROR_COOLDOWN = 30000; // 30 segundos entre reintentos tras error

async function carregarPeticionsPendents() {
  if (!usuari.value) {
    peticionsPendentsCount.value = 0;
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/usuari/${usuari.value._id}`);
    if (res.ok) {
      const dades = await res.json();
      peticionsPendentsCount.value = dades.sollicituds_pendents?.length || 0;
      lastErrorTime = 0; // Resetear si hay éxito
    }
  } catch (err) {
    const now = Date.now();
    if (now - lastErrorTime > ERROR_COOLDOWN) {
      console.error("Error carregar peticions navBar:", err);
      lastErrorTime = now;
    }
  }
}

onMounted(() => {
  carregarPeticionsPendents();
  intervalId = setInterval(carregarPeticionsPendents, 15000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

watch(usuari, (nou) => {
  if (nou) carregarPeticionsPendents();
  else peticionsPendentsCount.value = 0;
});

function irA(ruta) {
  router.push(ruta);
}
</script>