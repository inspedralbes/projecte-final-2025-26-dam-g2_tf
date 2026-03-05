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

        <div v-if="isCreator" class="mt-8">
            <button @click="iniciarPartida" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
                 COMENÇAR PARTIDA
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

function iniciarPartida() {
    if (socket.value && roomCode.value) {
        socket.value.emit('start-game', roomCode.value);
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
            perfilId: perfilId
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
    // Tots els jugadors marxen cap al mapa amb l'ID de la sessió real
    if (dades.sessioId) {
      router.push('/mapa/' + dades.sessioId);
    } else if (dades.idLloc) {
      // Fallback: si no hi ha sessió, anem directament al lloc
      router.push('/mapa/' + dades.idLloc);
    }
});
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
    
});
</script>
