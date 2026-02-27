<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // [CORREGIT] Importació única i neta
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const router = useRouter(); 
const { usuari } = useAuth();
const idLloc = route.params.id;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const videoRef = ref(null);
const canvasRef = ref(null);
const carregant = ref(false);
const fotosActuals = ref([]);
const indexFotoActual = ref(0);
let stream = null;

// Modal cromo
const mostrarModal = ref(false);
const modalDades = ref({ 
  nom_lloc: '', 
  imatge_historica: '', 
  coincidencia: '', 
  cromo_nou: false,
  completat_tot: false 
});

onMounted(async () => {
  try {
    const resposta = await fetch(`${API_URL}/api/fotos-actuals`);
    const dades = await resposta.json();
    if (dades.fotos && dades.fotos.length > 0) {
      fotosActuals.value = dades.fotos.map(f => `${API_URL}/fotos_actuals/${f}`);
    }
  } catch (err) {
    console.error('Error carregant les fotos actuals:', err);
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (error) {
    alert("No s'ha pogut accedir a la càmera: " + error.message);
  }
});

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});

function fotoAnterior() {
  if (fotosActuals.value.length === 0) return;
  indexFotoActual.value = (indexFotoActual.value - 1 + fotosActuals.value.length) % fotosActuals.value.length;
}

function fotoSeguent() {
  if (fotosActuals.value.length === 0) return;
  indexFotoActual.value = (indexFotoActual.value + 1) % fotosActuals.value.length;
}

// [CORREGIT] La funció tancarModal ara inclou la lògica de navegació correctament
function tancarModal() {
  mostrarModal.value = false;

  if (modalDades.value.completat_tot) {
    // Si la llista està completa, anem al Leaderboard
    router.push({ 
      name: 'Leaderboard', 
      params: { sala: route.params.codi_sala } 
    });
  } else {
    // Si no, tornem al mapa
    router.push('/mapa');
  }
}

async function executarTotElProces() {
  if (!videoRef.value || !canvasRef.value || carregant.value) return;

  const canvas = canvasRef.value;
  canvas.width = videoRef.value.videoWidth;
  canvas.height = videoRef.value.videoHeight;
  canvas.getContext('2d').drawImage(videoRef.value, 0, 0);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
  const imatgeEnText = dataUrl.split(',')[1];

  await enviarDadesAlBackend(imatgeEnText);
}

async function enviarDadesAlBackend(imatgeEnText) {
  carregant.value = true;
  const paquet = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imatge: imatgeEnText,
      idLloc: idLloc,
      perfilId: usuari.value?._id || null,
      codi_sala: route.params.codi_sala 
    })
  };

  try {
    const resposta = await fetch(`${API_URL}/api/validar-foto`, paquet);
    const dades = await resposta.json();

    if (dades.exit) {
      modalDades.value = {
        nom_lloc: dades.nom_lloc || '',
        imatge_historica: dades.imatge_historica || '',
        coincidencia: dades.coincidencia || '',
        cromo_nou: dades.cromo_nou || false,
        completat_tot: dades.completat_tot || false 
      };
      mostrarModal.value = true;
    } else {
      alert('❌ ' + dades.missatge + ' (Similitud: ' + dades.coincidencia + ')');
    }
  } catch (error) {
    alert('Error de connexió: ' + error.message);
  } finally {
    carregant.value = false;
  }
}
</script>

<template>
  <div class="relative w-full h-screen bg-black overflow-hidden">

    <video 
      ref="videoRef" 
      autoplay 
      playsinline 
      class="absolute inset-0 w-full h-full object-cover z-0"
    ></video>

    <canvas ref="canvasRef" class="hidden"></canvas>

    <img 
      v-if="fotosActuals.length > 0"
      :src="fotosActuals[indexFotoActual]" 
      class="absolute inset-0 w-full h-full object-cover z-10 opacity-40 pointer-events-none" 
    />

    <div class="absolute inset-0 z-15 pointer-events-none flex flex-col justify-evenly">
      <div class="w-full h-[1px] bg-white/50"></div>
      <div class="w-full h-[1px] bg-white/50"></div>
    </div>
    <div class="absolute inset-0 z-15 pointer-events-none flex justify-evenly">
      <div class="h-full w-[1px] bg-white/50"></div>
      <div class="h-full w-[1px] bg-white/50"></div>
    </div>

    <div v-if="fotosActuals.length > 1" class="absolute top-4 right-4 z-30 flex items-center gap-2">
      <button @click="fotoAnterior" class="text-white bg-black/60 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/80 transition">‹</button>
      <span class="text-white text-xs bg-black/60 px-2 py-1 rounded-full">{{ indexFotoActual + 1 }}/{{ fotosActuals.length }}</span>
      <button @click="fotoSeguent" class="text-white bg-black/60 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/80 transition">›</button>
    </div>

    <div class="absolute bottom-10 w-full flex flex-col items-center gap-4 z-20">
      <p class="text-white bg-black/60 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
        Quadra l'edifici fent servir la quadrícula
      </p>
      <button 
        @click="executarTotElProces"
        :disabled="carregant"
        class="px-8 py-4 rounded-xl font-bold border-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        style="background-color: #402749; color: #d9a6c2; border-color: #d9a6c2;"
      >
        {{ carregant ? '⏳ COMPROVANT...' : 'FER FOTO I VALIDAR' }}
      </button>
    </div>

    <Transition name="fade">
      <div
        v-if="mostrarModal"
        class="absolute inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);"
        @click.self="tancarModal"
      >
        <div
          class="relative flex flex-col items-center rounded-2xl overflow-hidden shadow-2xl mx-6"
          style="background: linear-gradient(160deg, #2a1030 0%, #402749 60%, #1a0820 100%); border: 2px solid #d9a6c2; max-width: 340px; width: 100%;"
        >
          <div class="w-full flex flex-col items-center pt-6 pb-3 px-6">
            <span class="text-3xl mb-1">{{ modalDades.completat_tot ? '🏆' : (modalDades.cromo_nou ? '⭐' : '✅') }}</span>
            <h2 class="text-white font-bold text-lg text-center leading-tight">
              {{ modalDades.completat_tot ? 'Partida Finalitzada!' : (modalDades.cromo_nou ? 'Cromo adquirit!' : 'Ja tenies aquest cromo') }}
            </h2>
            <p class="text-pink-300 text-sm mt-1 text-center">{{ modalDades.nom_lloc }}</p>
          </div>

          <div class="w-full px-6 pb-3">
            <div
              class="w-full rounded-xl overflow-hidden shadow-lg"
              style="border: 2px solid #d9a6c2; aspect-ratio: 4/3;"
            >
              <img
                v-if="modalDades.imatge_historica"
                :src="modalDades.imatge_historica.startsWith('http') ? modalDades.imatge_historica : `${API_URL}${modalDades.imatge_historica}`"
                class="w-full h-full object-cover"
                alt="Foto histórica"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-black/40">
                <span class="text-white/50 text-sm">Sense imatge</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-2 pb-3">
            <span class="text-pink-200 text-xs bg-black/40 px-3 py-1 rounded-full">
              📸 Similitud: {{ modalDades.coincidencia }}
            </span>
            <p v-if="modalDades.completat_tot && modalDades.rango" class="text-yellow-400 font-black text-xs uppercase tracking-widest">
              Medalla d'{{ modalDades.rango }}
            </p>
          </div>

          <button
            @click="tancarModal"
            class="w-full py-4 font-bold text-sm transition-opacity hover:opacity-80 active:scale-95"
            style="background-color: #d9a6c2; color: #2a1030;"
          >
            {{ modalDades.completat_tot ? 'VEURE RESULTATS FINALS' : (modalDades.cromo_nou ? '🎉 GENIAL!' : '👍 D\'ACORD') }}
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>


<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>