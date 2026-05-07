<template>
  <div class="min-h-screen bg-[#402749]/5 flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg text-center">
      <h1 class="text-3xl font-bold mb-6 text-[#402749]">
        <span v-if="!showModeSelection">Sala d'Espera</span>
        <span v-else>Configuració de la Partida</span>
        <div v-if="roomCode && !showModeSelection" class="mt-4">
          <span class="text-[#402749] block text-4xl font-mono font-black tracking-widest">{{ roomCode }}</span>
          <button 
            @click="compartirInvitacio" 
            class="mt-4 bg-[#804f7f] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center gap-2 mx-auto"
          >
            <span>🔗</span> COMPARTIR INVITACIÓ
          </button>
        </div>
      </h1>

      <!-- PANTALLA D'ESPERA PER ACOMPANYANTS (MODE GRUP) -->
      <Transition name="fade">
        <div v-if="gameStarted" class="fixed inset-0 z-[100] bg-[#1a0820] flex flex-col items-center justify-center p-8 text-center">
            <h2 class="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Segueixin al Detectiu</h2>
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

        <div v-if="!showModeSelection" class="mb-8">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Jugadors Connectats</h2>
          <ul class="space-y-2">
            <li v-for="player in players" :key="player.id" class="flex items-center bg-gray-50 p-3 rounded-lg">
              <div class="w-10 h-10 bg-[#402749]/10 rounded-full flex items-center justify-center text-[#402749] font-bold mr-3">
                {{ player.nom.charAt(0).toUpperCase() }}
              </div>
              <span class="font-medium text-gray-700">{{ player.nom }}</span>
            </li>
          </ul>
           <div v-if="players.length === 0" class="text-gray-400 italic">
            Esperant jugadors...
          </div>
        </div>

        <div v-if="isCreator && !showModeSelection" class="mt-8">
            <button @click="showModeSelection = true" class="w-full bg-[#402749] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#402749]/80 transition-colors">
                 COMENÇAR PARTIDA
            </button>
        </div>

        <div v-if="isCreator && showModeSelection" class="mt-8 bg-white border-2 border-[#402749]/10 rounded-xl p-4 text-left">
            <div v-if="locationCoords || adrecaInici" class="mb-6">
                <button @click="obrirGoogleMaps" class="w-full bg-[#402749]/5 text-[#402749] font-bold py-3 rounded-xl shadow-sm border border-[#402749]/20 hover:bg-[#402749]/10 transition-colors flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                    Veure ubicació d'inici
                </button>
            </div>
            
            <h3 class="text-xl font-bold text-[#402749] mb-4">Selecciona la Durada</h3>
            <div class="grid grid-cols-3 gap-3 mb-6">
                <button v-for="opt in durationOptions" :key="opt.value" 
                    @click="selectedDuration = opt.value"
                    class="p-3 rounded-xl border-2 transition-all text-sm font-bold"
                    :class="selectedDuration === opt.value ? 'border-[#402749] bg-[#402749]/5 text-[#402749]' : 'border-gray-100 text-gray-500 hover:border-[#402749]/30'">
                    {{ opt.label }}<br>
                    <span class="text-[10px] font-normal">{{ opt.desc }}</span>
                </button>
            </div>

            <h3 class="text-xl font-bold text-[#402749] mb-4">Selecciona el Mode de Joc</h3>
            <div class="space-y-3 mb-6">
                <label class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-[#402749]/5 cursor-pointer" :class="{'border-[#402749] bg-[#402749]/5': selectedMode === 'Individual', 'border-gray-200': selectedMode !== 'Individual'}">
                    <input type="radio" v-model="selectedMode" value="Individual" class="text-[#402749] focus:ring-[#402749] w-5 h-5">
                    <div>
                        <span class="block font-bold text-gray-800">Individual</span>
                        <span class="block text-sm text-gray-500">Cada jugador fa servir el seu propi mòbil.</span>
                    </div>
                </label>
                <label class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-[#402749]/5 cursor-pointer" :class="{'border-[#402749] bg-[#402749]/5': selectedMode === 'Grup', 'border-gray-200': selectedMode !== 'Grup'}">
                    <input type="radio" v-model="selectedMode" value="Grup" class="text-[#402749] focus:ring-[#402749] w-5 h-5">
                    <div class="flex justify-between items-center w-full">
                        <div>
                            <span class="block font-bold text-gray-800">Grup</span>
                            <span class="block text-sm text-gray-500">Tots jugueu junts amb un sol mòbil.</span>
                        </div>
                        <button v-if="selectedMode === 'Grup'" @click.stop.prevent="showGroupsModal = true" class="text-[10px] bg-[#402749] text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm ml-2 active:scale-95 transition-all">VEURE</button>
                    </div>
                </label>
                <label class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-[#402749]/5 cursor-pointer" :class="{'border-[#402749] bg-[#402749]/5': selectedMode === 'Grups', 'border-gray-200': selectedMode !== 'Grups'}">
                    <input type="radio" v-model="selectedMode" value="Grups" class="text-[#402749] focus:ring-[#402749] w-5 h-5">
                    <div class="flex justify-between items-center w-full">
                        <div>
                            <span class="block font-bold text-gray-800">Grups</span>
                            <span class="block text-sm text-gray-500">Es formaran grups de forma aleatòria. Un mòbil per grup.</span>
                        </div>
                        <button v-if="selectedMode === 'Grups'" @click.stop.prevent="showGroupsModal = true" class="text-[10px] bg-[#402749] text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm ml-2 active:scale-95 transition-all">VEURE</button>
                    </div>
                </label>
            </div>
            
            <button @click="confirmarModeIComencar" class="w-full bg-[#402749] text-white font-bold py-3 rounded-xl shadow hover:bg-[#402749]/80 transition-colors">
                CONFIRMAR I INICIAR
            </button>
            <button @click="showModeSelection = false" class="w-full mt-2 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel·lar
            </button>
        </div>

        <p v-else-if="!isCreator" class="text-sm text-gray-500 animate-pulse">
          Esperant que el creador iniciï la partida...
        </p>
      </div>

      <div v-if="error && !gameStarted" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
        <button @click="$router.push('/joc/inici')" class="underline ml-2">Tornar</button>
      </div>
    </div>

    <!-- MODAL DE PREVIEW DE GRUPS -->
    <Transition name="fade">
      <div v-if="showGroupsModal" class="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[80vh] border border-white/20 animate-fade-in">
          <h2 class="text-2xl font-black text-[#402749] mb-6 uppercase tracking-tighter text-center italic text-shadow-sm">Equips Generats</h2>
          
          <div class="space-y-4">
            <div v-for="grup in previewGroups" :key="grup.grup_id" class="bg-[#402749]/5 p-5 rounded-3xl border border-[#402749]/10 shadow-md">
              <h3 class="text-[10px] font-black text-[#402749] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                <span class="bg-[#402749] text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shadow-sm">
                  {{ grup.grup_id }}
                </span>
                Equip {{ grup.grup_id }}
              </h3>
              
              <div class="space-y-3">
                <div v-for="(nom, idx) in grup.members_nom" :key="idx" class="flex items-center gap-3 bg-white/60 p-2 rounded-2xl border border-white shadow-sm">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#bc85ab] to-[#f5cbdd] flex items-center justify-center text-xs font-black text-[#402749] shadow-sm">
                    {{ nom.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 flex items-center justify-between">
                    <span class="text-sm font-bold text-gray-800">
                      {{ nom }}
                    </span>
                    <span v-if="nom === grup.capita_nom" class="text-[8px] bg-[#402749] text-white px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm">CAPITÀ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button @click="obrirPreviewGrups" class="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all text-[10px] uppercase tracking-widest">
              RE-GENERAR
            </button>
            <button @click="showGroupsModal = false" class="flex-2 bg-[#402749] text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:bg-[#402749]/80 transition-all active:scale-95 uppercase tracking-widest text-[10px]">
              D'ACORD
            </button>
          </div>
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

const route = useRoute();
const router = useRouter();
const socket = ref(null);
const { mostrarModal } = useCustomModal();

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8088' : 'https://north.dam.inspedralbes.cat');


const roomCode = ref(route.params.id !== 'crear' ? route.params.id : '');
const players = ref([]);
const loading = ref(true);
const error = ref('');
const isCreator = ref(false);

const locationCoords = ref(null);
const adrecaInici = ref('');

// Recuperar usuari del localStorage o usar un per defecte
const userStr = localStorage.getItem('usuari');
const user = userStr ? JSON.parse(userStr) : { nom_usuari: 'Invitado' };
const nomUsuari = user.nom_usuari || 'Invitado';

const showModeSelection = ref(false);
const selectedMode = ref('Individual');
const selectedDuration = ref(null);
const gameStarted = ref(false);
const tipusPartida = ref('');
const currentIdLloc = ref(null);
const showGroupsModal = ref(false);
const previewGroups = ref([]);
const meuGrupId = ref(null);

const durationOptions = [
    { label: '30 seg', value: 0.5, desc: 'PROVA' },
    { label: '45 min', value: 45, desc: 'Difícil' },
    { label: '1 hora', value: 60, desc: 'Normal' },
    { label: '90 min', value: 90, desc: 'Fàcil' }
];

async function compartirInvitacio() {
    const url = `${window.location.origin}/join/${roomCode.value}`;
    if (navigator.share) {
        navigator.share({
            title: 'Juga amb mi a Barcelona Secreta!',
            text: `Uneix-te a la meva partida amb el codi: ${roomCode.value}`,
            url: url
        }).catch(err => console.log('Error compartint', err));
    } else {
        // Fallback: copiar al porta-retalls
        navigator.clipboard.writeText(url);
        await mostrarModal({ isAlert: true, icon: 'success', title: 'Enllaç copiat', message: 'Enllaç copiat al porta-retalls!' });
    }
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
    
    // Si és mode 'Individual', no cal fer res amb grups
    if (selectedMode.value === 'Individual') return [];

    // Si és mode 'Grup' (un sol mòbil), el creador ha de ser el capità
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

    // Per al mode 'Grups' (minigrups), barregem per fer equips aleatoris
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
    if (!selectedDuration.value) {
        await mostrarModal({ isAlert: true, message: 'Si us plau, selecciona una durada per a la partida.' });
        return;
    }
    // Validació de límit de jugadors per al mode grup (màxim 5)
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
  socket.value = io(API_URL);

  socket.value.on('connect', function() {
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
              const res = await fetch(`${API_URL}/api/mapa/punts/${data.idLloc}`);
              const lloc = await res.json();
              if (lloc) {
                  if (lloc.adreca_inici) {
                      adrecaInici.value = lloc.adreca_inici;
                  }
                  if (lloc.ubicacio && lloc.ubicacio.coordinates) {
                      locationCoords.value = lloc.ubicacio.coordinates;
                  }
                  // Precarrega la carta de lore del lloc
                  if (lloc.carta_lore) {
                      const img = new Image();
                      img.src = `${API_URL}${lloc.carta_lore}`;
                  }
              }
          } catch (e) {
              console.error("Error obtenint ubicació", e);
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

  /*socket.value.on('game-started', () => {
      // Redirigir al joc, per exemple al mapa
      router.push({ name: 'mapa' });
  }); */

  socket.value.on('carta-personatge', function(dades) {
    console.log('Carta de personatge rebuda:', dades);
    // Guardem la info al localStorage per a la següent pàgina
    localStorage.setItem('carta_personatge_actual', JSON.stringify(dades));

    // Precarrega la imatge del personatge
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
        // Els acompanyants es queden a la sala d'espera amb el missatge especial
        gameStarted.value = true;
        loading.value = false;
        showModeSelection.value = false;
        error.value = ""; // Netejem possibles errors previs
    }
  });

  socket.value.on('game-over', function(dades) {
    console.log("[SalaEspera] Joc finalitzat:", dades);

    if (dades.timeout) {
      // Si és timeout, mostrem que han perdut (podríem redirigir a una pantalla de derrota)
      // Per ara anem directe a valorar o podríem fer un modal
      router.push('/valorar-lloc/' + (dades.id_lloc || currentIdLloc.value));
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
      // Redirigim a tots els que s'han quedat a la sala d'espera a valorar el lloc
      if (currentIdLloc.value || dades.id_lloc) {
          router.push('/valorar-lloc/' + (dades.id_lloc || currentIdLloc.value));
      } else {
          router.push('/leaderboard/' + roomCode.value);
      }
    }
  });

  // PRECARREGA D'IMATGES CRÍTIQUES
  // Mentre els jugadors esperen, descarreguem les imatges pesades per a que no hi hagi lag després
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

