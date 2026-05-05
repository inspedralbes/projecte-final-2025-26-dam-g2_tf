<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 
import { useAuth } from '../composables/useAuth';
import { io } from 'socket.io-client';
import { useCustomModal } from '../composables/useCustomModal';
import { netejarUrl } from '../utils/url';

const route = useRoute();
const router = useRouter(); 
const { usuari } = useAuth();
const { mostrarModal: showCustomModal } = useCustomModal();
const idLloc = route.params.id;
const idPuntParam = route.query.idPunt || null;

const API_URL = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';
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
const cardGirada = ref(false); // controla l'animació de gira
const modalDades = ref({ 
  nom_lloc: '', 
  imatge_historica: '', 
  foto_historica: '',
  text_historic: '',
  coincidencia: '', 
  cromo_nou: false,
  completat_tot: false 
});

// Notificació de guanyador (per als jugadors que no han acabat o timeout)
const mostrarNotificacioGuanyador = ref(false);
const nomGuanyador = ref('');
const sessioIdGuanyador = ref('');
const isTimeout = ref(false);
const cardDefeatFlipped = ref(false);
const faseDerrota = ref(0);
const cardDefeatFlippedBig = ref(false);

// Temporitzador
const tempsRestant = ref(null);
let intervalTimer = null;

onMounted(async () => {
  // 0. Carreguem la sessió per saber el temps límit
  const codi_sala = route.params.codi_sala;
  if (codi_sala) {
    try {
        const respSessio = await fetch(`${API_URL}/api/sessionsJoc/${codi_sala}`);
        if (respSessio.ok) {
            const sessio = await respSessio.json();
            
            // Busquem el temporitzador individual
            const meuId = usuari.value?._id?.toString();
            let me = null;
            if (sessio.jugadors && meuId) {
                me = sessio.jugadors.find(j => (j.id_usuari._id || j.id_usuari).toString() === meuId);
            }

            const finalTime = (me && me.temps_limit) ? me.temps_limit : sessio.temps_limit;

            if (finalTime && sessio.estat === 'jugant') {
                iniciarTemporitzador(finalTime);
            }
        }
    } catch (err) {
        console.error('Error carregant la sessió:', err);
    }
  }

  // 1. Carreguem la imatge de referència del punt clicat des del backend
  if (idLloc && idPuntParam) {
    try {
      const respLloc = await fetch(`${API_URL}/api/mapa/punts/${idLloc}`);
      if (respLloc.ok) {
        const lloc = await respLloc.json();
        const punt = (lloc.punts_missio || []).find(p => p._id === idPuntParam || p._id?.toString() === idPuntParam);
          imatgePunt.value = netejarUrl(punt.imatge_referencia);
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
        fotosActuals.value = dades.fotos.map(f => netejarUrl(`/fotos_actuals/${f}`));
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
    await showCustomModal({ isAlert: true, message: "No s'ha pogut accedir a la càmera: " + error.message });
  }

  // Connectem el socket i escoltem l'event 'game-over'
  // Emetem 'join-game-room' perquè el backend ens uneixi a la room correcta
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

      sessioIdGuanyador.value = dades.sessioId || codi_sala;
      nomGuanyador.value = dades.nomGuanyador || 'Un jugador';
      isTimeout.value = dades.timeout || false;
      
      if (isTimeout.value) {
        faseDerrota.value = 1;
      } else {
        faseDerrota.value = 2;
        mostrarNotificacioGuanyador.value = true;
      }
      if (intervalTimer) clearInterval(intervalTimer);
    });
  }
});

function anarAHome() {
  router.push('/valorar-lloc/' + route.params.id);
}

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (socketJoc) {
    socketJoc.disconnect();
  }
  if (intervalTimer) {
      clearInterval(intervalTimer);
  }
});

function girarCartaDefeat() {
  faseDerrota.value = 2;
  mostrarNotificacioGuanyador.value = true;
}

function iniciarTemporitzador(tempsLimit) {
    const limit = new Date(tempsLimit).getTime();
    
    const actualizar = () => {
        const ara = new Date().getTime();
        const diferencia = Math.max(0, Math.floor((limit - ara) / 1000));
        tempsRestant.value = diferencia;
        
        if (diferencia <= 0) {
            clearInterval(intervalTimer);
            // Si el temps s'esgota localment, mostrem la notificació de Timeout
            if (!mostrarNotificacioGuanyador.value && faseDerrota.value === 0) {
                isTimeout.value = true;
                faseDerrota.value = 1;
                console.log("[Càmera] Cronòmetre a zero. Mostrant notificació de Timeout local.");
            }
        }
    };
    
    actualizar();
    intervalTimer = setInterval(actualizar, 1000);
}

function formatarTemps(segons) {
    const h = Math.floor(segons / 3600);
    const m = Math.floor((segons % 3600) / 60);
    const s = segons % 60;
    
    const mm = m < 10 ? '0' + m : m;
    const ss = s < 10 ? '0' + s : s;
    
    if (h > 0) {
        return `${h}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
}

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
    // La partida ha acabat → anem a valorar
    router.push('/valorar-lloc/' + route.params.id);
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
  if (!imatgeEnText) { await showCustomModal({ isAlert: true, message: "Error: No s'ha capturat la imatge." }); return; }
  if (!idLloc) { await showCustomModal({ isAlert: true, message: "Error: Falta l'ID del Lloc a la URL." }); return; }
  if (!perfilId) { await showCustomModal({ isAlert: true, message: "Error: No s'ha trobat el perfil de l'usuari (estàs loguejat?)." }); return; }
  if (!codi_sala) { await showCustomModal({ isAlert: true, message: "Error: No s'ha trobat el codi de la sala a la URL." }); return; }

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
        exit: dades.exit !== false,
        nom_lloc: dades.nom_lloc,
        imatge_punt: dades.imatge_punt || dades.imatge_historica || '',
        imatge_historica: dades.imatge_historica,
        foto_historica: dades.foto_historica || '',
        text_historic: dades.text_historic || '',
        url_foto: dades.url_foto || '',
        coincidencia: dades.coincidencia,
        cromo_nou: dades.cromo_nou,
        completat_tot: dades.completat_tot || false,
        sessioId: dades.sessioId || route.params.codi_sala
      };
      cardGirada.value = false;
      mostrarModal.value = true;
      // Si hi ha foto històrica, girem la carta automàticament després de 600ms
      if (dades.foto_historica) {
        setTimeout(() => { cardGirada.value = true; }, 600);
      }
    } else {
      await showCustomModal({ isAlert: true, message: ' ' + (dades.missatge || 'Error en validar') });
    }
  } catch (error) {
    console.error("ERROR REAL:", error); 
    await showCustomModal({ isAlert: true, message: 'Error de connexió amb el servidor.' });
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

    <!-- TEMPORITZADOR -->
    <div v-if="tempsRestant !== null" class="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
       <span class="text-sm">⏱️</span>
       <span class="text-white font-mono font-bold" :class="{'text-red-400 animate-pulse': tempsRestant < 60}">{{ formatarTemps(tempsRestant) }}</span>
    </div>

    <!-- VISOR 3:4 VERTICAL AMB MÀSCARA -->
    <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden">
      <!-- Aquest div és el visor vertical (3 d'ample per 4 d'alt) ocupant tota l'amplada -->
      <div class="relative w-full border-y-2 border-white/40 shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]" style="aspect-ratio: 3 / 4;">
        
        <!-- Imatge de referència -->
        <img 
          v-if="imatgePunt"
          :src="imatgePunt" 
          class="w-full h-full object-cover opacity-40" 
        />
        <img 
          v-else-if="fotosActuals.length > 0"
          :src="fotosActuals[indexFotoActual]" 
          class="w-full h-full object-cover opacity-40" 
        />

        <!-- Quadrícula de guia (3x3 dins del marc vertical) -->
        <div class="absolute inset-0 flex flex-col justify-evenly">
          <div class="w-full h-[1px] bg-white/30"></div>
          <div class="w-full h-[1px] bg-white/30"></div>
        </div>
        <div class="absolute inset-0 flex justify-evenly">
          <div class="h-full w-[1px] bg-white/30"></div>
          <div class="h-full w-[1px] bg-white/30"></div>
        </div>

      </div>
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
        <!-- CARTA QUE GIRA -->
        <div v-if="modalDades.exit && modalDades.foto_historica" class="card-container mx-6">
          <div class="card" :class="{ girada: cardGirada }">
            <!-- CARA DAVANT: foto del punt actual -->
            <div class="card-cara card-davant rounded-2xl overflow-hidden shadow-2xl"
              style="background: linear-gradient(160deg, #2a1030 0%, #402749 60%, #1a0820 100%); border: 2px solid #d9a6c2;">
              <div class="w-full flex flex-col items-center pt-5 pb-3 px-5">
                <span class="text-2xl mb-1">📸</span>
                <h2 class="text-white font-bold text-base text-center">Punt trobat!</h2>
                <p class="text-pink-300 text-xs mt-1 text-center">{{ modalDades.nom_lloc }}</p>
              </div>
              <div class="w-full px-5 pb-4">
                <div class="w-full rounded-xl overflow-hidden" style="border: 2px solid #d9a6c2; aspect-ratio: 3/4;">
                  <img v-if="modalDades.imatge_punt"
                    :src="netejarUrl(modalDades.imatge_punt)"
                    class="w-full h-full object-cover" alt="Foto del punt" />
                  <div v-else class="w-full h-full flex items-center justify-center bg-black/40">
                    <span class="text-white/50 text-sm">Sense imatge</span>
                  </div>
                </div>
              </div>
              <div class="px-5 pb-2 text-center">
                <span class="text-pink-200 text-xs bg-black/40 px-3 py-1 rounded-full">📸 Similitud: {{ modalDades.coincidencia }}</span>
              </div>
              <p class="text-white/40 text-[10px] text-center pb-4">Girant la carta...</p>
            </div>

            <!-- CARA DARRERE: foto històrica + text -->
            <div class="card-cara card-darrere rounded-2xl overflow-hidden shadow-2xl"
              style="border: 2px solid #f59e0b;">
              <div class="relative w-full h-full">
                <img
                  :src="netejarUrl(modalDades.foto_historica)"
                  class="w-full h-full object-cover"
                  alt="Foto històrica"
                />
                <!-- Overlay amb el text històric -->
                <div class="absolute inset-0 flex flex-col justify-end"
                  style="background: linear-gradient(to top, rgba(0,0,0,0.88) 45%, rgba(0,0,0,0.1) 100%);">
                  <div class="p-4">
                    <p class="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">🏛️ Sabies que...</p>
                    <p class="text-white text-xs leading-relaxed">{{ modalDades.text_historic }}</p>
                    <button
                      @click="tancarModal"
                      class="mt-4 w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 hover:opacity-90"
                      style="background-color: #f59e0b; color: #1a0820;"
                    >{{ modalDades.completat_tot ? '🏁 TORNAR A L\'INICI' : '✨ GENIAL!' }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL SIMPLE (sense foto històrica o foto incorrecta) -->
        <div
          v-else
          class="relative flex flex-col items-center rounded-2xl overflow-hidden shadow-2xl mx-6"
          style="background: linear-gradient(160deg, #2a1030 0%, #402749 60%, #1a0820 100%); border: 2px solid #d9a6c2; max-width: 340px; width: 100%;"
        >
          <div class="w-full flex flex-col items-center pt-6 pb-3 px-6">
            <span class="text-3xl mb-1">{{ !modalDades.exit ? '' : modalDades.completat_tot ? (modalDades.cromo_nou ? '' : '🏁') : '' }}</span>
            <h2 class="text-white font-bold text-lg text-center leading-tight">
              {{ !modalDades.exit ? 'Imatge errònia!' : modalDades.completat_tot ? (modalDades.cromo_nou ? 'Cromo adquirit!' : 'Partida Finalitzada!') : 'Punt trobat!' }}
            </h2>
            <p class="text-pink-300 text-sm mt-1 text-center">
              {{ !modalDades.exit ? 'Torna a provar, la foto no s\'assembla prou' : modalDades.nom_lloc }}
            </p>
          </div>

          <div v-if="modalDades.exit" class="w-full px-6 pb-3">
            <div class="w-full rounded-xl overflow-hidden shadow-lg" style="border: 2px solid #d9a6c2; aspect-ratio: 3/4;">
              <img v-if="modalDades.imatge_punt"
                :src="netejarUrl(modalDades.imatge_punt)"
                class="w-full h-full object-cover" alt="Foto del punt" />
              <div v-else class="w-full h-full flex items-center justify-center bg-black/40">
                <span class="text-white/50 text-sm">Sense imatge</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-2 pb-3">
            <span class="text-pink-200 text-xs bg-black/40 px-3 py-1 rounded-full">📸 Similitud: {{ modalDades.coincidencia }}</span>
            <p v-if="modalDades.completat_tot && modalDades.rango" class="text-yellow-400 font-black text-xs uppercase tracking-widest">Medalla d'{{ modalDades.rango }}</p>
          </div>

          <button
            @click="tancarModal"
            class="w-full py-4 font-bold text-sm transition-opacity hover:opacity-80 active:scale-95"
            style="background-color: #d9a6c2; color: #2a1030;"
          >
            {{ !modalDades.exit ? '↩ TORNAR A INTENTAR' : modalDades.completat_tot ? 'TORNAR A L\'INICI' : '✨ GENIAL!' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- FASE 1: CARTA GRAN DEL POLICIA -->
    <Transition name="fade">
      <div
        v-if="faseDerrota === 1"
        class="min-h-screen bg-[#402749] flex flex-col items-center justify-center p-8 overflow-y-auto overflow-x-hidden"
        style="position: fixed; inset: 0; z-index: 300;"
      >
        <div class="relative z-10 w-full max-w-sm flex flex-col items-center justify-center min-h-full py-12">
          <div 
            class="perspective-1000 w-full max-w-[350px] aspect-[2/3] min-h-[525px] mb-10 shadow-none cursor-pointer"
            @click="girarCartaDefeat"
          >
            <div class="w-full h-full flex items-center justify-center overflow-hidden bg-[#402749] shadow-none">
              <img 
                :src="netejarUrl(API_URL + '/personatges/El policia.jpg')" 
                alt="Carta El Policia" 
                class="w-full h-full object-contain shadow-none scale-105" 
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notificació: un altre jugador ha guanyat -->
    <Transition name="fade">
      <div
        v-if="mostrarNotificacioGuanyador && faseDerrota === 2"
        class="absolute inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.88); backdrop-filter: blur(8px);"
      >
        <div
          class="relative flex flex-col items-center rounded-2xl overflow-hidden shadow-2xl mx-6 text-center"
          style="background: linear-gradient(160deg, #2a1030 0%, #402749 60%, #1a0820 100%); border: 2px solid #d9a6c2; max-width: 340px; width: 100%; padding: 2rem 1.5rem;"
        >
          <span v-if="isTimeout" class="text-5xl mb-3">⌛</span>
          <span v-else class="text-5xl mb-3"></span>
          <h2 class="text-white font-black text-xl mb-1">{{ isTimeout ? "S'ha acabat el temps!" : "La partida ha acabat!" }}</h2>
          
          <template v-if="isTimeout">
            <p class="text-red-400 text-base font-bold mb-1">TOTHOM HA PERDUT</p>
            <p class="text-pink-300 text-sm mb-1">No heu obtingut el cromo d'aquesta ruta.</p>
          </template>
          <template v-else>
            <p class="text-pink-300 text-base font-bold mb-1">
              <span class="text-white">{{ nomGuanyador }}</span> ha completat totes les fotos!
            </p>
          </template>
          
          <p class="text-white/50 text-xs mb-6">Has perdut, tria una altra ruta per tornar-ho a provar.</p>

          <button
            @click="anarAHome"
            class="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 hover:opacity-90"
            style="background-color: #d9a6c2; color: #2a1030;"
          >
             TORNAR A L'INICI
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

/* === ANIMACIÓ GIRA CARTA === */
.card-container {
  width: 100%;
  max-width: 340px;
  perspective: 1000px;
}
.card {
  position: relative;
  width: 100%;
  min-height: 480px;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.card.girada {
  transform: rotateY(180deg);
}
.card-cara {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-darrere {
  transform: rotateY(180deg);
}
</style>