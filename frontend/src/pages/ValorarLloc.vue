<template>
  <div class="min-h-screen bg-[#1a0820] flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
    
    <div class="w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center" 
         style="background: linear-gradient(160deg, #2a1030 0%, #402749 60%, #1a0820 100%); border: 2px solid #d9a6c2;">
         
      <!-- Decorative elements -->
      <div class="absolute top-4 left-4 text-[#d9a6c2] opacity-50 text-xl">🔍</div>
      <div class="absolute top-4 right-4 text-[#d9a6c2] opacity-50 text-xl">🕵️‍♂️</div>
      
      <h1 class="font-black text-2xl mb-2 text-pink-300 uppercase tracking-widest mt-6">Ruta Finalizada</h1>
      <p class="text-sm text-indigo-200 mb-6 font-medium">
        {{ llocNom ? `¿Qué te ha parecido ${llocNom}?` : 'Valora la experiencia de esta ruta.' }}
      </p>

      <div v-if="imatgeLloc" class="w-full rounded-xl overflow-hidden mb-6 border-2 border-pink-400/50 shadow-lg" style="aspect-ratio: 16/9;">
        <img :src="imatgeLloc" class="w-full h-full object-cover" alt="Lloc a valorar" />
      </div>

      <!-- ESTRELLES -->
      <div class="flex items-center justify-center gap-2 mb-6" @mouseleave="hoverEstrelles(0)">
        <button v-for="star in 5" :key="star" 
                class="star-btn transition-all duration-200"
                @mouseover="hoverEstrelles(star)"
                @click="seleccionarEstrella(star)">
          <svg xmlns="http://www.w3.org/2000/svg" 
               viewBox="0 0 24 24" 
               :class="star <= (hoverValue || rating) ? 'fill-[#f59e0b] stroke-[#f59e0b] scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'fill-transparent stroke-[#d9a6c2]'"
               class="w-10 h-10 transition-all duration-200"
               stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      </div>
      
      <!-- COMENTARI -->
      <div class="w-full relative mb-8">
        <textarea 
          v-model="comentari" 
          rows="3" 
          placeholder="Añade tus pensamientos... (ej. Pistas, atmósfera, dificultad)"
          class="w-full bg-[#1a0820]/80 border border-[#d9a6c2]/50 rounded-xl p-4 text-white text-sm placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 resize-none transition-all"
        ></textarea>
        <!-- Neon border effect bottom -->
        <div class="absolute -bottom-1 left-4 right-4 h-[2px] bg-pink-500/0 blur-[2px] transition-all" 
             :class="{'bg-pink-500/80': comentari.length > 0}"></div>
      </div>

      <!-- BOTONS -->
      <div class="flex flex-col gap-3">
        <button 
          @click="enviarValoracio"
          :disabled="carregant"
          class="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(217,166,194,0.3)] hover:shadow-[0_0_25px_rgba(217,166,194,0.6)] active:scale-95"
          style="background-color: #d9a6c2; color: #2a1030;"
        >
          {{ carregant ? 'ENVIANT...' : 'ENVIAR VALORACIÓN' }}
        </button>
        
        <button 
          @click="ometre"
          class="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20 text-white/70 hover:bg-white/5 active:scale-95"
        >
          OMITIR
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomModal } from '../composables/useCustomModal';
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { mostrarModal } = useCustomModal();
const { usuari } = useAuth();

const idLloc = route.params.id;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

const rating = ref(0);
const hoverValue = ref(0);
const comentari = ref('');
const carregant = ref(false);

const llocNom = ref('');
const imatgeLloc = ref('');

onMounted(async () => {
  if (idLloc) {
    try {
      const resp = await fetch(`${API_URL}/api/mapa/punts/${idLloc}`);
      if (resp.ok) {
        const lloc = await resp.json();
        llocNom.value = lloc.nom;
        if (lloc.imatge_referencia) {
           imatgeLloc.value = lloc.imatge_referencia.startsWith('http') 
             ? lloc.imatge_referencia 
             : `${API_URL}${lloc.imatge_referencia}`;
        }
      }
    } catch (e) {
      console.error('Error carregant dades del lloc', e);
    }
  }
});

function hoverEstrelles(val) {
  hoverValue.value = val;
}

function seleccionarEstrella(val) {
  rating.value = val;
}

async function enviarValoracio() {
  if (rating.value === 0) {
    await mostrarModal({ isAlert: true, message: "Por favor, selecciona al menos una estrella para valorar." });
    return;
  }

  const idUsuari = usuari.value?._id;
  if (!idUsuari) {
    // Si l'usuari no està loguejat (hauria d'estar-ho però per prevenció)
    router.push({ name: 'home' });
    return;
  }

  carregant.value = true;
  try {
    const resposta = await fetch(`${API_URL}/api/social/ressenyes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_lloc: idLloc,
        id_usuari: idUsuari,
        estrelles: rating.value,
        comentari: comentari.value
      })
    });

    if (resposta.ok) {
      await mostrarModal({ isAlert: true, title: "¡Gracias!", message: "Tu valoración se ha enviado correctamente." });
      router.push({ name: 'home' });
    } else {
      await mostrarModal({ isAlert: true, message: "Ha ocurrido un error al enviar la valoración." });
    }
  } catch (e) {
    console.error(e);
    await mostrarModal({ isAlert: true, message: "Error de conexión con el servidor." });
  } finally {
    carregant.value = false;
  }
}

function ometre() {
  router.push({ name: 'home' });
}
</script>

<style scoped>
.star-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
</style>
