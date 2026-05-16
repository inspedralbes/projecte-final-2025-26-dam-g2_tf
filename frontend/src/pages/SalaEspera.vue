<template>
  <div class="min-h-screen bg-[#1a0e2e] flex items-center justify-center p-4 text-white font-outfit">
    <div class="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shadow-2xl w-full max-w-lg text-center relative">

      <!-- PANTALLA D'ESPERA PER ACOMPANYANTS (MODE GRUP) -->
      <Transition name="fade">
        <div v-if="gameStarted" class="fixed inset-0 z-[100] bg-[#1a0820] flex flex-col items-center justify-center p-8 text-center">
            <h2 class="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Segueix al Detectiu</h2>
            <p class="text-pink-200/70 text-lg leading-relaxed max-w-md">
                La partida està en curs al mòbil del capità. <br>
                Ajudeu-lo a trobar tots els racons secrets de la ciutat!
            </p>
            <div class="mt-12 flex justify-center gap-3">
                <div class="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
            </div>
        </div>
      </Transition>

      <div v-if="loading" class="text-gray-500 py-8">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-[#402749]/20 border-t-[#402749] rounded-full mb-4"></div>
        <p>Carregant la sala...</p>
      </div>

      <div v-else-if="!gameStarted">

        <div v-if="roomCode" class="mb-10">
          <h2 class="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6">Codi de la Sala</h2>
          <div class="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-center">
            <span class="text-4xl font-black tracking-[0.2em] text-white font-mono uppercase">
              {{ roomCode }}
            </span>
          </div>
        </div>

        <div v-if="!showModeSelection" class="mb-10">
          <h2 class="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6">Jugadors Connectats</h2>
          <ul class="space-y-3">
            <li v-for="player in players" :key="player.id" class="flex items-center bg-white/5 p-4 rounded-2xl border border-white/5">
              <div class="w-10 h-10 bg-[#bc85ab]/20 rounded-xl flex items-center justify-center text-[#bc85ab] font-black mr-4 shadow-inner">
                {{ player.nom.charAt(0).toUpperCase() }}
              </div>
              <span class="font-bold text-white/80">{{ player.nom }}</span>
            </li>
          </ul>
           <div v-if="players.length === 0" class="text-white/20 italic text-sm mt-4 animate-pulse">
            Esperant exploradors...
          </div>
        </div>

        <div v-if="isCreator && !showModeSelection" class="mt-10">
            <button 
              @click="showModeSelection = true" 
              :disabled="players.length < 2"
              class="w-full bg-white text-[#1a0e2e] font-black py-5 rounded-2xl shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
                 COMENÇAR PARTIDA
            </button>
            <p v-if="players.length < 2" class="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-4 font-bold">
              Es necessiten almenys 2 jugadors per començar
            </p>
        </div>

        <div v-if="isCreator && showModeSelection" class="mt-8 bg-[#402749]/40 border border-white/20 rounded-[2.5rem] p-8 text-left backdrop-blur-xl shadow-2xl">
            <div v-if="locationCoords || adrecaInici" class="mb-8">
                <button @click="obrirGoogleMaps" class="w-full bg-white/5 text-[#bc85ab] font-black py-4 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                    Veure ubicació d'inici
                </button>
            </div>
            
            <h3 class="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4">Selecciona la Durada</h3>
            <div class="grid grid-cols-2 gap-3 mb-10">
                <button v-for="opt in durationOptions" :key="opt.value" 
                    @click="selectedDuration = opt.value"
                    class="p-4 rounded-2xl border-2 transition-all text-sm font-black flex flex-col items-center gap-1 shadow-md"
                    :class="selectedDuration === opt.value ? 'border-white bg-white text-[#1a0e2e]' : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'">
                    <span class="text-xs uppercase tracking-widest">{{ opt.label }}</span>
                    <span class="text-[9px] font-medium" :class="selectedDuration === opt.value ? 'text-[#1a0e2e]/60' : 'opacity-60'">{{ opt.desc }}</span>
                </button>
            </div>

            <h3 class="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4">Mode de Joc</h3>
            <div class="space-y-4 mb-12">
                <label class="flex items-center space-x-4 p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-md" :class="{'border-white bg-white/10': selectedMode === 'Individual', 'border-white/5 bg-white/5': selectedMode !== 'Individual'}">
                    <input type="radio" v-model="selectedMode" value="Individual" class="text-[#bc85ab] focus:ring-white w-6 h-6 bg-black/40 border-white/20">
                    <div>
                        <span class="block font-black text-sm text-white uppercase tracking-wider">Individual</span>
                        <span class="block text-[11px] text-white/50 mt-1">Cada jugador fa servir el seu propi mòbil.</span>
                    </div>
                </label>
                <label class="flex items-center space-x-4 p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-md" :class="{'border-white bg-white/10': selectedMode === 'Grup', 'border-white/5 bg-white/5': selectedMode !== 'Grup'}">
                    <input type="radio" v-model="selectedMode" value="Grup" class="text-[#bc85ab] focus:ring-white w-6 h-6 bg-black/40 border-white/20">
                    <div class="flex justify-between items-center w-full">
                        <div>
                            <span class="block font-black text-sm text-white uppercase tracking-wider">Grup</span>
                            <span class="block text-[11px] text-white/50 mt-1">Tots jugueu junts amb un sol mòbil.</span>
                        </div>
                        <button v-if="selectedMode === 'Grup'" @click.stop.prevent="showGroupsModal = true" class="text-[9px] bg-white text-black px-4 py-2 rounded-xl font-black uppercase tracking-widest shadow-xl ml-2 active:scale-95 transition-all">VEURE</button>
                    </div>
                </label>
                <label class="flex items-center space-x-4 p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-md" :class="{'border-white bg-white/10': selectedMode === 'Grups', 'border-white/5 bg-white/5': selectedMode !== 'Grups'}">
                    <input type="radio" v-model="selectedMode" value="Grups" class="text-[#bc85ab] focus:ring-white w-6 h-6 bg-black/40 border-white/20">
                    <div class="flex justify-between items-center w-full">
                        <div>
                            <span class="block font-black text-sm text-white uppercase tracking-wider">Grups</span>
                            <span class="block text-[11px] text-white/50 mt-1">Equips aleatoris. Un mòbil per grup.</span>
                        </div>
                        <button v-if="selectedMode === 'Grups'" @click.stop.prevent="showGroupsModal = true" class="text-[9px] bg-white text-black px-4 py-2 rounded-xl font-black uppercase tracking-widest shadow-xl ml-2 active:scale-95 transition-all">VEURE</button>
                    </div>
                </label>
            </div>
            
            <button @click="confirmarModeIComencar" class="w-full bg-white text-[#1a0e2e] font-black py-5 rounded-2xl shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">
                INICIAR EXPLORACIÓ
            </button>
            <button @click="showModeSelection = false" class="w-full mt-4 bg-white/5 text-white/40 font-black py-3 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]">
                Cancel·lar
            </button>
        </div>

        <p v-else-if="!isCreator" class="text-sm text-gray-500 animate-pulse">
          Esperant que el creador iniciï la partida...
        </p>
      </div>

      <div v-if="error && !gameStarted" class="mt-8 p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-sm text-center backdrop-blur-md">
        <p class="font-black uppercase tracking-widest mb-1">Error de Connexió</p>
        <p class="opacity-80">{{ error }}</p>
        <button @click="$router.push('/joc/inici')" class="mt-4 bg-white/5 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all">Tornar</button>
      </div>
    </div>

    <!-- MODAL DE PREVIEW DE GRUPS -->
    <Transition name="fade">
      <div v-if="showGroupsModal" class="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-[#1a0820] rounded-[3rem] p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[85vh] border border-white/10 animate-fade-in relative">
          <button @click="showGroupsModal = false" class="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">✕</button>
          <h2 class="text-2xl font-black text-white mb-8 uppercase tracking-tighter text-center italic">Equips Generats</h2>
          
          <div class="space-y-4">
            <div v-for="grup in previewGroups" :key="grup.grup_id" class="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-lg">
              <h3 class="text-[10px] font-black text-[#bc85ab] uppercase tracking-[0.3em] mb-5 flex items-center gap-3">
                <span class="bg-[#bc85ab] text-[#1a0e2e] w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shadow-sm">
                  {{ grup.grup_id }}
                </span>
                Equip {{ grup.grup_id }}
              </h3>
              
              <div class="space-y-3">
                <div v-for="(nom, idx) in grup.members_nom" :key="idx" class="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5 shadow-inner">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#bc85ab] to-[#804f7f] flex items-center justify-center text-xs font-black text-white shadow-sm">
                    {{ nom.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 flex items-center justify-between">
                    <span class="text-sm font-bold text-white/80">
                      {{ nom }}
                    </span>
                    <span v-if="nom === grup.capita_nom" class="text-[8px] bg-[#bc85ab] text-[#1a0e2e] px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm">CAPITÀ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button @click="obrirPreviewGrups" class="flex-1 bg-white/5 text-white/40 font-black py-4 rounded-2xl hover:bg-white/10 transition-all text-[9px] uppercase tracking-[0.2em] border border-white/5">
              RE-GENERAR
            </button>
            <button @click="showGroupsModal = false" class="flex-1 bg-white text-[#1a0e2e] font-black py-4 px-8 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[9px]">
              D'ACORD
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <!-- DERROTA: Pantalla calabozo (Polícia) -->
    <PantallaDerrota
      :visible="showDefeat"
      :base-api="API_URL"
      @tornar-inici="anarAValorar"
    />

    <!-- MODAL GAME OVER (Per quan guanya un altre equip en mode competitiu) -->
    <Transition name="fade">
      <div v-if="showGameOver" class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
        <div class="bg-[#1a0820] border border-white/10 rounded-[3rem] p-10 w-full max-w-sm shadow-2xl text-center">
          <div class="text-6xl mb-6">🏆</div>
          <h2 class="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">La partida ha acabat!</h2>
          <p class="text-white/60 mb-10 leading-relaxed">
            <strong class="text-[#bc85ab]">{{ nomGuanyador }}</strong> ha completat la ruta primer.
          </p>
          <button @click="anarAValorar" class="w-full bg-white text-[#1a0e2e] font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">
            CONTINUAR
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { io } from 'socket.io-client';
import { useCustomModal } from '../composables/useCustomModal';
import PantallaDerrota from './PantallaDerrota.vue';
import { BASE_API_URL, isCapacitor } from '../utils/url';

const router = useRouter();
const route = useRoute();
const socket = ref(null);
const { mostrarModal } = useCustomModal();

const API_URL = BASE_API_URL;


const roomCode = ref(route.params.id !== 'crear' ? route.params.id : '');
const players = ref([]);
const loading = ref(true);
const error = ref('');
const isCreator = ref(false);
const socketStatus = ref('desconnectat');
const socketId = ref('');

const locationCoords = ref(null);
const adrecaInici = ref('');

const userStr = localStorage.getItem('usuari');
const user = userStr ? JSON.parse(userStr) : { nom_usuari: 'Convidat' };
const nomUsuari = user.nom_usuari || 'Convidat';

const showModeSelection = ref(false);
const selectedMode = ref('Individual');
const selectedDuration = ref(null);
const gameStarted = ref(false);
const tipusPartida = ref('');
const currentIdLloc = ref(null);
const showGroupsModal = ref(false);
const previewGroups = ref([]);
const meuGrupId = ref(null);
const showDefeat = ref(false);
const showGameOver = ref(false);
const nomGuanyador = ref('');

const durationOptions = [
    { label: '45 min', value: 45, desc: 'Difícil' },
    { label: '1 hora', value: 60, desc: 'Normal' },
    { label: '90 min', value: 90, desc: 'Fàcil' }
];

async function compartirInvitacio() {
    const url = `${window.location.origin}/join/${roomCode.value}`;
    if (navigator.share) {
        navigator.share({
            title: 'Juga amb mi a North!',
            text: `Uneix-te a la meva partida amb el codi: ${roomCode.value}`,
            url: url
        }).catch(err => console.log('Error compartint', err));
    } else {
        navigator.clipboard.writeText(url);
        await mostrarModal({ isAlert: true, icon: 'success', title: 'Enllaç copiat', message: 'Enllaç copiat al porta-retalls!' });
    }
}

function anarAValorar() {
    router.push('/valorar-lloc/' + (currentIdLloc.value || route.query.idLloc));
}

function obrirGoogleMaps() {
    if (adrecaInici.value) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adrecaInici.value)}&travelmode=walking`;
        window.open(url, '_blank');
    } else if (locationCoords.value) {
        const [lng, lat] = locationCoords.value;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
        window.open(url, '_blank');
    }
}

function generarGrups() {
    let list = [...players.value];
    
    if (selectedMode.value === 'Individual') return [];

    if (selectedMode.value === 'Grup') {
        const creator = list.find(p => p.id === socket.value.id) || list[0];
        return [{
            grup_id: 1,
            capita_id: creator.perfilId,
            capita_nom: creator.nom,
            members: list.map(p => p.perfilId),
            members_nom: list.map(p => p.nom)
        }];
    }

    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }

    let groups = [];
    if (selectedMode.value === 'Grups') {
        const n = list.length;
        if (n <= 3) {
            groups.push({
                grup_id: 1,
                capita_id: list[0].perfilId,
                capita_nom: list[0].nom,
                members: list.map(p => p.perfilId),
                members_nom: list.map(p => p.nom)
            });
        } else {
            let idx = 0;
            let grupId = 1;
            let remaining = n;
            while (remaining > 0) {
                let take = 2;
                if (remaining === 3 || remaining === 5) {
                    take = 3;
                } else if (remaining === 1) {
                    if (groups.length > 0) {
                        groups[groups.length - 1].members.push(list[idx].perfilId);
                        groups[groups.length - 1].members_nom.push(list[idx].nom);
                    }
                    break;
                }
                let team = list.slice(idx, idx + take);
                groups.push({
                    grup_id: grupId++,
                    capita_id: team[0].perfilId,
                    capita_nom: team[0].nom,
                    members: team.map(p => p.perfilId),
                    members_nom: team.map(p => p.nom)
                });
                idx += take;
                remaining -= take;
            }
        }
    }
    return groups;
}

function obrirPreviewGrups() {
    if (players.value.length < 2 && selectedMode.value === 'Grups') {
        mostrarModal({ isAlert: true, message: 'Es necessiten almenys 2 jugadors per formar grups.' });
        return;
    }
    previewGroups.value = generarGrups();
    showGroupsModal.value = true;
}

watch(selectedMode, (newMode) => {
    if (newMode === 'Grups' || newMode === 'Grup') {
        obrirPreviewGrups();
    } else {
        previewGroups.value = [];
    }
});

async function confirmarModeIComencar() {
    if (players.value.length < 2) {
        await mostrarModal({ isAlert: true, message: 'Es necessiten almenys 2 jugadors per començar la partida.' });
        return;
    }
    if (!selectedDuration.value) {
        await mostrarModal({ isAlert: true, message: 'Si us plau, selecciona una durada per a la partida.' });
        return;
    }
    if (selectedMode.value === 'Grup' && players.value.length > 5) {
        await mostrarModal({ isAlert: true, message: 'El mode grup (un sol mòbil) només permet un màxim de 5 jugadors.' });
        return;
    }
    if (socket.value && roomCode.value) {
        const groups = previewGroups.value.length > 0 ? previewGroups.value : generarGrups();
        const dades = {
            roomCode: roomCode.value,
            mode: selectedMode.value,
            groups: groups,
            duracio: selectedDuration.value
        };
        socket.value.emit('start-game', dades);
    }
}

onMounted(() => {
  console.log('[SalaEspera] Iniciant socket a:', API_URL);
  socket.value = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
  });

  const handleConnection = () => {
    socketStatus.value = 'connectat';
    socketId.value = socket.value.id;
    const param = route.params.id; 
    const idLlocRuta = route.query.idLloc;
    const userStr = localStorage.getItem('usuari');
    const userObj = userStr ? JSON.parse(userStr) : {};
    const perfilId = userObj._id || null;

    if (param === 'crear') {
        const dadesPerEnviar = {
            nomUsuari: nomUsuari,
            idLloc: idLlocRuta,
            perfilId: perfilId,
            duracio: selectedDuration.value
        };
        socket.value.emit('create-room', dadesPerEnviar);
        isCreator.value = true;
    } else {
        socket.value.emit('join-room', { roomCode: param, nomUsuari: nomUsuari, perfilId: perfilId });
    }
  };

  if (socket.value.connected) {
      handleConnection();
  }

  socket.value.on('connect', handleConnection);

  socket.value.on('connect_error', (err) => {
      error.value = 'Error de connexió amb el servidor de jocs: ' + err.message;
      loading.value = false;
  });

  socket.value.on('room-created', (code) => {
    roomCode.value = code;
    loading.value = false;
  });

  socket.value.on('room-joined', (code) => {
      roomCode.value = code;
      loading.value = false;
  });

  socket.value.on('room-info', async (data) => {
      if (data && data.idLloc) {
          currentIdLloc.value = data.idLloc;
          try {
              // GET /api/mapa/punts/:id: Obté dades del lloc
              const res = await fetch(`${API_URL}/api/mapa/punts/${data.idLloc}`);
              const lloc = await res.json();
              if (lloc) {
                  if (lloc.adreca_inici) {
                      adrecaInici.value = lloc.adreca_inici;
                  }
                  if (lloc.ubicacio && lloc.ubicacio.coordinates) {
                      locationCoords.value = lloc.ubicacio.coordinates;
                  }
              }
          } catch (e) {
              console.error('Error carregant lloc:', e);
          }
      }
  });

  socket.value.on('update-players', (playerList) => {
    players.value = playerList;
  });

  socket.value.on('error-room', (msg) => {
    error.value = msg;
    loading.value = false;
  });

  socket.value.on('carta-personatge', function(dades) {
    console.log('Carta de personatge rebuda:', dades);
    localStorage.setItem('carta_personatge_actual', JSON.stringify(dades));

    if (dades.personatge && dades.personatge.imatge) {
        const img = new Image();
        img.src = dades.personatge.imatge;
    }
  });

  socket.value.on('game-started', function(dades) {
    console.log("[SalaEspera] Joc començat:", dades);
    if (!dades.sessioId) return;

    const mode = dades.mode || 'individual';
    tipusPartida.value = mode.toLowerCase();
    
    const userStr = localStorage.getItem('usuari');
    const userObj = userStr ? JSON.parse(userStr) : {};
    const perfilId = userObj._id;
    
    const myGroup = dades.groups && dades.groups.find(g => g.members.includes(perfilId));
    if (myGroup) meuGrupId.value = myGroup.grup_id;
    const isUserCapita = myGroup && myGroup.capita_id === perfilId;

    if (mode.toLowerCase() === 'individual' || isUserCapita) {
        router.push('/sobre-lore/' + dades.sessioId);
    } else {
        gameStarted.value = true;
        loading.value = false;
        showModeSelection.value = false;
        error.value = "";
    }
  });

  socket.value.on('game-over', function(dades) {
    console.log("[SalaEspera] Joc finalitzat:", dades);
    nomGuanyador.value = dades.nomGuanyador || 'Un jugador';

    if (dades.timeout) {
      showDefeat.value = true;
      return;
    }

    const tipus = dades.tipus_partida ? dades.tipus_partida.toLowerCase() : 'individual';
    const guanyadorGrupId = dades.guanyadorGrupId;
    
    let joGuanyo = false;
    if (tipus === 'grup') {
      joGuanyo = true;
    } else if (tipus === 'grups') {
      joGuanyo = (meuGrupId.value === guanyadorGrupId);
    }

    if (joGuanyo) {
      router.push({
        name: 'revelacio-cromo',
        params: { id: dades.id_lloc || currentIdLloc.value },
        query: { 
          imatge: dades.imatge_cromo,
          nom: dades.nom_lloc
        }
      });
    } else {
      showGameOver.value = true;
    }
  });

  const imatgesAPrecarregar = [
    `${API_URL}/assets/Sobre/Sobre Tancat.png`,
    `${API_URL}/assets/Sobre/Sobre_Obert.png`,
    `${API_URL}/personatges/ContraCarta.png`
  ];

  imatgesAPrecarregar.forEach(url => {
    const img = new Image();
    img.src = url;
  });

});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
    
});
</script>

