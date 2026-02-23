<script setup>
import { onMounted } from 'vue';
import { CameraPreview } from '@capacitor-community/camera-preview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

onMounted(function inicialitzarCamera() {
  CameraPreview.start({
    parent: 'cameraPreview',
    toBack: true 
  });
});
                 // aixo son parametres predefinits de camera-preview,
                 // parent busca el div amb nom camerapreview per que 
                 // surti dins aquell recuarde i to back envia la camara 
                 // al fons per que es pugui veure la imatge al 40%

async function executarTotElProces() {
  const resultat = await CameraPreview.capture({ quality: 50 });
  const laMevaImatge = resultat.value;
  enviarDadesAlBackend(laMevaImatge);
}

async function enviarDadesAlBackend(imatgeEnText) {

  const paquet = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imatge: imatgeEnText })
  };

  try {
    const resposta = await fetch(`${API_URL}/api/validar-foto`, paquet);    const dades = await resposta.json();

    if (dades.exit) {
      alert(dades.missatge + " (Similitud: " + dades.coincidencia );
      // Aquí podríem navegar cap al perfil o mostrar el cromo nou
    } else {
      alert(dades.missatge + " (Similitud: " + dades.coincidencia );
    }
  } catch (error) {
    alert("Error de connexió amb el servidor");
  }
}

</script>

<template>
  <div class="relative w-full h-screen bg-black overflow-hidden">
    <div id="cameraPreview" class="absolute inset-0 z-0"></div>

    <img :src="'/img/fotos_historiques/' + props.idLloc + '.jpg'" 
         class="absolute inset-0 w-full h-full object-cover z-10 opacity-40 pointer-events-none" />

    <div class="absolute bottom-10 w-full flex flex-col items-center gap-4 z-20">
      <p class="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
        Intenta quadrar els contorns de l'edifici
      </p>
      
      <button v-on:click="executarTotElProces"
              class="px-8 py-4 rounded-xl font-bold border-2 transition-transform active:scale-95"
              style="background-color: #402749; color: #d9a6c2; border-color: #d9a6c2;">
        FER FOTO I VALIDAR
      </button>
    </div>
  </div>
</template>