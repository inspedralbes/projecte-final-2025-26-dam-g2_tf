<template>
  <div class="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg text-center">
      <h1 class="text-3xl font-bold mb-4 text-indigo-900">Sala d'Espera</h1>
      
      <div v-if="loading" class="text-gray-500">
        Carregant...
      </div>

      <div v-else>
        <div class="mb-8">
          <p class="text-gray-600 mb-2">Codi de la Sala:</p>
          <div class="text-4xl font-mono font-black text-indigo-600 tracking-widest bg-indigo-50 py-3 rounded-xl border border-indigo-100">
            {{ roomCode }}
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Jugadors Connectats</h2>
          <ul class="space-y-2">
            <li v-for="player in players" :key="player.id" class="flex items-center bg-gray-50 p-3 rounded-lg">
              <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-3">
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
            <button @click="showModeSelection = true" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
                 COMENÇAR PARTIDA
            </button>
        </div>

        <div v-if="isCreator && showModeSelection" class="mt-8 bg-white border-2 border-indigo-100 rounded-xl p-4 text-left">
            <h3 class="text-xl font-bold text-indigo-900 mb-4">Selecciona la Durada</h3>
            <div class="grid grid-cols-3 gap-3 mb-6">
                <button v-for="opt in durationOptions" :key="opt.value" 
                    @click="selectedDuration = opt.value"
                    class="p-3 rounded-xl border-2 transition-all text-sm font-bold"
                    :class="selectedDuration === opt.value ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-500 hover:border-indigo-200'">
                    {{ opt.label }}<br>
                    <span class="text-[10px] font-normal">{{ opt.desc }}</span>
                </button>
            </div>

            <h3 class="text-xl font-bold text-indigo-900 mb-4">Selecciona el Mode de Joc</h3>
            <div class="space-y-3 mb-6">
                <label class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-indigo-50 cursor-pointer" :class="{'border-indigo-500 bg-indigo-50': selectedMode === 'Individual', 'border-gray-200': selectedMode !== 'Individual'}">
                    <input type="radio" v-model="selectedMode" value="Individual" class="text-indigo-600 focus:ring-indigo-500 w-5 h-5">
                    <div>
                        <span class="block font-bold text-gray-800">Individual</span>
                        <span class="block text-sm text-gray-500">Cada jugador fa servir el seu propi mòbil.</span>
                    </div>
                </label>
                <label class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-indigo-50 cursor-pointer" :class="{'border-indigo-500 bg-indigo-50': selectedMode === 'Grup', 'border-gray-200': selectedMode !== 'Grup'}">
                    <input type="radio" v-model="selectedMode" value="Grup" class="text-indigo-600 focus:ring-indigo-500 w-5 h-5">
                    <div>
                        <span class="block font-bold text-gray-800">Grup</span>
                        <span class="block text-sm text-gray-500">Tots jugueu junts amb un sol mòbil.</span>
                    </div>
                </label>
                <label class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-indigo-50 cursor-pointer" :class="{'border-indigo-500 bg-indigo-50': selectedMode === 'Grups', 'border-gray-200': selectedMode !== 'Grups'}">
                    <input type="radio" v-model="selectedMode" value="Grups" class="text-indigo-600 focus:ring-indigo-500 w-5 h-5">
                    <div>
                        <span class="block font-bold text-gray-800">Grups</span>
                        <span class="block text-sm text-gray-500">Es formaran grups de forma aleatòria. Un mòbil per grup.</span>
                    </div>
                </label>
            </div>
            
            <button @click="confirmarModeIComencar" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-700 transition-colors">
                CONFIRMAR I INICIAR
            </button>
            <button @click="showModeSelection = false" class="w-full mt-2 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel·lar
            </button>
        </div>
        <p v-else class="text-sm text-gray-500 animate-pulse">
          Esperant que el creador iniciï la partida...
        </p>
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
        <button @click="$router.push('/joc/inici')" class="underline ml-2">Tornar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { io } from 'socket.io-client';

const route = useRoute();
const router = useRouter();
const socket = ref(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

const roomCode = ref('');
const players = ref([]);
const loading = ref(true);
const error = ref('');
const isCreator = ref(false);

// Recuperar usuari del localStorage o usar un per defecte
const userStr = localStorage.getItem('usuari');
const user = userStr ? JSON.parse(userStr) : { nom_usuari: 'Invitado' };
const nomUsuari = user.nom_usuari || 'Invitado';

const showModeSelection = ref(false);
const selectedMode = ref('Individual');
const selectedDuration = ref(null);

const durationOptions = [
    { label: '45 min', value: 45, desc: 'Difícil' },
    { label: '1 hora', value: 60, desc: 'Normal' },
    { label: '90 min', value: 90, desc: 'Fàcil' }
];

function generarGrups() {
    let list = [...players.value];
    // Shuffle the list for random captains and random teams
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }

    let groups = [];
    if (selectedMode.value === 'Individual') {
        return [];
    } else if (selectedMode.value === 'Grup') {
        if (list.length === 0) return [];
        groups.push({
            grup_id: 1,
            capita_id: list[0].perfilId,
            capita_nom: list[0].nom,
            members: list.map(p => p.perfilId),
            members_nom: list.map(p => p.nom)
        });
    } else if (selectedMode.value === 'Grups') {
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

function confirmarModeIComencar() {
    if (!selectedDuration.value) {
        alert("Si us plau, selecciona una durada per a la partida.");
        return;
    }
    if (socket.value && roomCode.value) {
        const groups = generarGrups();
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

  socket.value.on('game-started', function(dades) {
    console.log("[SalaEspera] Joc començat redactat:", dades);
    // Tots els jugadors marxen cap al mapa amb l'ID de la sessió real
    if (dades.sessioId) {
      router.push('/mapa/' + dades.sessioId);
    } else {
      console.error("[SalaEspera] No s'ha rebut sessioId!", dades);
      if (dades.idLloc) {
          router.push('/mapa/' + dades.idLloc);
      }
    }
});
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
    
});
</script>
