<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 
import { useAuth } from '../composables/useAuth';
import { io } from 'socket.io-client';

const route = useRoute();
const router = useRouter(); 
const { usuari } = useAuth();
const idLloc = route.params.id;
const idPuntParam = route.query.idPunt || null;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const videoRef = ref(null);
const canvasRef = ref(null);
const carregant = ref(false);

// Imatge de referència del punt concret (es carrega al mounted des del backend)
const imatgePunt = ref(null);

// Fotos genèriques (fallback quan no hi ha punt específic)
const fotosActuals = ref([]);
const indexFotoActual = ref(0);
let stream = null;
let socketJoc = null; // Socket per rebre l'event game-over de la resta de jugadors


// Modal cromo
const mostrarModal = ref(false);
const modalDades = ref({ 
  nom_lloc: '', 
  imatge_historica: '', 
  coincidencia: '', 
  cromo_nou: false,
  completat_tot: false 
});

// Notificació de guanyador (per als jugadors que no han acabat)
const mostrarNotificacioGuanyador = ref(false);
const nomGuanyador = ref('');
const sessioIdGuanyador = ref('');

onMounted(async () => {
  // 1. Carreguem la imatge de referència del punt clicat des del backend
  if (idLloc && idPuntParam) {
    try {
      const respLloc = await fetch(`${API_URL}/api/mapa/punts/${idLloc}`);
      if (respLloc.ok) {
        const lloc = await respLloc.json();
        const punt = (lloc.punts_missio || []).find(p => p._id === idPuntParam || p._id?.toString() === idPuntParam);
        if (punt && punt.imatge_referencia) {
          const ruta = punt.imatge_referencia;
          imatgePunt.value = ruta.startsWith('http') ? ruta : API_URL + ruta;
        }
      }
    } catch (err) {
      console.error('Error carregant la imatge del punt:', err);
    }
  }

  // 2. Si no hi ha imatge específica del punt, carreguem les genèriques com a fallback
  if (!imatgePunt.value) {
    try {
      const resposta = await fetch(`${API_URL}/api/fotos-actuals`);
      const dades = await resposta.json();
      if (dades.fotos && dades.fotos.length > 0) {
        fotosActuals.value = dades.fotos.map(f => `${API_URL}/fotos_actuals/${f}`);
      }
    } catch (err) {
      console.error('Error carregant les fotos actuals:', err);
    }
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

  // Connectem el socket i escoltem l'event 'game-over'
  // Emetem 'join-game-room' perquè el backend ens uneixi a la room correcta
  const codi_sala = route.params.codi_sala;
  if (codi_sala) {
    socketJoc = io(API_URL);
    // Quan el socket es connecta, demanem unir-nos a la room de la partida
    socketJoc.on('connect', function () {
      socketJoc.emit('join-game-room', codi_sala);
      console.log('[Càmera] Socket connectat, unit a la room:', codi_sala);
    });
    socketJoc.on('game-over', function (dades) {
      const meuId = usuari.value?._id?.toString();
      // Si soc el guanyador, ignoro l'event: el modal de "Partida Finalitzada!" ja em redirigirà
      if (meuId && dades.guanyadorId && meuId === dades.guanyadorId.toString()) return;
      // Mostrar notificació als altres jugadors en comptes de redirigir automàticament
      sessioIdGuanyador.value = dades.sessioId || codi_sala;
      nomGuanyador.value = dades.nomGuanyador || 'Un jugador';
      mostrarNotificacioGuanyador.value = true;
    });
  }
});

function anirAlLeaderboard() {
  router.push({ name: 'Leaderboard', params: { sala: sessioIdGuanyador.value } });
}

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (socketJoc) {
    socketJoc.disconnect();
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

function tancarModal() {
  mostrarModal.value = false;

  if (modalDades.value.completat_tot) {
    // La partida ha acabat → anem al Leaderboard amb l'ID de la sessió
    const sessioId = modalDades.value.sessioId || route.params.codi_sala;
    router.push({ 
      name: 'Leaderboard', 
      params: { sala: sessioId }
    });
  } else {
    // Si no ha acabat → tornem al mapa amb l'ID de la sessió
    router.push('/mapa/' + route.params.codi_sala);
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
  const idLloc = route.params.id;
  const perfilId = usuari.value?._id;
  const codi_sala = route.params.codi_sala;  
  const idPunt = route.query.idPunt || null; 

  console.log("DADES QUE ESTEM A PUNT D'ENVIAR:", { idLloc, perfilId, codi_sala, idPunt });

  // Validació prèvia al frontend
  if (!imatgeEnText) return alert("Error: No s'ha capturat la imatge.");
  if (!idLloc) return alert("Error: Falta l'ID del Lloc a la URL.");
  if (!perfilId) return alert("Error: No s'ha trobat el perfil de l'usuari (estàs loguejat?).");
  if (!codi_sala) return alert("Error: No s'ha trobat el codi de la sala a la URL.");

  carregant.value = true;
  try {
    const paquet = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imatge: imatgeEnText,
        idLloc: idLloc,
        perfilId: perfilId,
        codi_sala: codi_sala,
        idPunt: idPunt
      })
    };

    // Fem la petició al backend
    const resposta = await fetch(`${API_URL}/api/validar-foto`, paquet);
    const dades = await resposta.json();

    if (resposta.ok) {
      modalDades.value = {
        exit: dades.exit !== false,   // false quan similitud < 50%
        nom_lloc: dades.nom_lloc,
        imatge_historica: dades.imatge_historica,
        coincidencia: dades.coincidencia,
        cromo_nou: dades.cromo_nou,
        completat_tot: dades.completat_tot || false
      };
      mostrarModal.value = true;
    } else {
      alert(' ' + (dades.missatge || 'Error en validar'));
    }
  } catch (error) {
    console.error("ERROR REAL:", error); 
    alert('Error de connexió amb el servidor.');
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

    <!-- Imatge de referència del punt específic (de la BD) o genèrica de fons -->
    <img 
      v-if="imatgePunt"
      :src="imatgePunt" 
      class="absolute inset-0 w-full h-full object-cover z-10 opacity-40 pointer-events-none" 
    />
    <img 
      v-else-if="fotosActuals.length > 0"
      :src="fotosActuals[indexFotoActual]" 
      class="absolute inset-0 w-full h-full object-cover z-10 opacity-40 pointer-events-none" 
    />
    <!-- Controls nav (només per fotos genèriques múltiples) -->

    <div class="absolute inset-0 z-15 pointer-events-none flex flex-col justify-evenly">
      <div class="w-full h-[1px] bg-white/50"></div>
      <div class="w-full h-[1px] bg-white/50"></div>
    </div>
    <div class="absolute inset-0 z-15 pointer-events-none flex justify-evenly">
      <div class="h-full w-[1px] bg-white/50"></div>
      <div class="h-full w-[1px] bg-white/50"></div>
    </div>

    <div v-if="!imatgePunt && fotosActuals.length > 1" class="absolute top-4 right-4 z-30 flex items-center gap-2">
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
        {{ carregant ? ' COMPROVANT...' : 'FER FOTO I VALIDAR' }}
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
            <span class="text-3xl mb-1">{{ !modalDades.exit ? '' : modalDades.completat_tot ? '' : (modalDades.cromo_nou ? '' : '') }}</span>
            <h2 class="text-white font-bold text-lg text-center leading-tight">
              {{ !modalDades.exit ? 'Imatge errònia!' : modalDades.completat_tot ? 'Partida Finalitzada!' : (modalDades.cromo_nou ? 'Cromo adquirit!' : 'Ja tenies aquest cromo') }}
            </h2>
            <p class="text-pink-300 text-sm mt-1 text-center">
              {{ !modalDades.exit ? 'Torna a provar, la foto no s\'assembla prou' : modalDades.nom_lloc }}
            </p>
          </div>

          <div v-if="modalDades.exit" class="w-full px-6 pb-3">
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
            {{ !modalDades.exit ? ' TORNAR A INTENTAR' : modalDades.completat_tot ? 'VEURE RESULTATS FINALS' : (modalDades.cromo_nou ? ' GENIAL!' : ' D\'ACORD') }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Notificació: un altre jugador ha guanyat -->
    <Transition name="fade">
      <div
        v-if="mostrarNotificacioGuanyador"
        class="absolute inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.88); backdrop-filter: blur(8px);"
      >
        <div
          class="relative flex flex-col items-center rounded-2xl overflow-hidden shadow-2xl mx-6 text-center"
          style="background: linear-gradient(160deg, #2a1030 0%, #402749 60%, #1a0820 100%); border: 2px solid #d9a6c2; max-width: 340px; width: 100%; padding: 2rem 1.5rem;"
        >
          <span class="text-5xl mb-3"></span>
          <h2 class="text-white font-black text-xl mb-1">La partida ha acabat!</h2>
          <p class="text-pink-300 text-base font-bold mb-1">
            <span class="text-white">{{ nomGuanyador }}</span> ha completat totes les fotos!
          </p>
          <p class="text-white/50 text-xs mb-6">Vés al leaderboard per veure els resultats finals.</p>

          <button
            @click="anirAlLeaderboard"
            class="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 hover:opacity-90"
            style="background-color: #d9a6c2; color: #2a1030;"
          >
             VEURE RESULTATS FINALS
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