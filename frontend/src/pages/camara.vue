<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const idLloc = route.params.id;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const videoRef = ref(null);
const canvasRef = ref(null);
const imatgeHistoricaSrc = ref('');
const carregant = ref(false);
let stream = null;

onMounted(async () => {
  try {
    if (idLloc) {
      const resposta = await fetch(`${API_URL}/api/mapa/punts/${idLloc}`);
      const dades = await resposta.json();
      if (dades.fotos_historiques && dades.fotos_historiques.length > 0) {
        imatgeHistoricaSrc.value = `${API_URL}/fotos_historiques/${dades.fotos_historiques[0]}`;
      }
    }
  } catch (err) {
    console.error('Error carregant la foto històrica:', err);
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
    body: JSON.stringify({ imatge: imatgeEnText, idLloc: idLloc })
  };

  try {
    const resposta = await fetch(`${API_URL}/api/validar-foto`, paquet);
    const text = await resposta.text();
    let dades;
    try {
      dades = JSON.parse(text);
    } catch {
      alert('Error del servidor. Torna-ho a provar.');
      return;
    }

    if (dades.exit) {
      alert('✅ ' + dades.missatge + ' (Similitud: ' + dades.coincidencia + ')');
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
      v-if="imatgeHistoricaSrc"
      :src="imatgeHistoricaSrc" 
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

  </div>
</template>