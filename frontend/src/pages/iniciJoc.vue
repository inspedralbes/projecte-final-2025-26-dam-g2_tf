<template>
  <div class="min-h-screen bg-white flex flex-col p-6">
    <div class="flex items-center mb-8">
      <button 
        @click="$router.back()" 
        class="bg-gray-100 p-3 rounded-full shadow-md active:scale-95 transition-transform"
      >
        <span class="text-xl text-gray-800">←</span>
      </button>
      <h1 class="ml-4 text-2xl font-black text-gray-800">Sala de Joc</h1>
    </div>

    <div class="flex-1 flex flex-col justify-center space-y-8">
      <!-- Secció per CREAR una sala nova -->
      <div class="bg-purple-50 p-6 rounded-[25px] border border-purple-100 shadow-sm text-center">
        <h2 class="text-xl font-bold text-purple-900 mb-2">Crear nova sala</h2>
        <p class="text-gray-600 mb-6 text-sm">Convida els teus amics compartint un codi.</p>
        <button 
          @click="crearSala"
          class="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all uppercase tracking-wide"
        >
          Crear Sala
        </button>
      </div>

      <div class="relative flex py-2 items-center">
        <div class="flex-grow border-t border-gray-200"></div>
        <span class="flex-shrink-0 mx-4 text-gray-400 text-sm">O</span>
        <div class="flex-grow border-t border-gray-200"></div>
      </div>

      <!-- Secció per UNIR-SE a una sala existent -->
      <div class="bg-white p-6 rounded-[25px] border border-gray-100 shadow-lg text-center">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Unir-se a una sala</h2>
        <input 
          v-model="codigoSala"
          type="text" 
          placeholder="Introdueix el codi aquí"
          class="w-full bg-gray-50 border border-gray-200 text-center text-lg font-mono py-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
        <button 
          @click="unirseSala"
          :disabled="!codigoSala"
          class="w-full bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Unir-se
        </button>
      </div>
    </div>

    <!-- Botó per saltar la sala i jugar sol -->
    <div class="mt-auto pt-8 text-center">
      <button 
        @click="jugarSolo"
        class="text-gray-500 font-medium underline text-sm active:text-purple-600"
      >
        Prefereixo jugar sol de moment
      </button>
    </div>

    <!-- Modal que mostra confirmació a l'usuari -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div class="bg-white p-8 rounded-[30px] w-10/12 max-w-sm text-center shadow-2xl">
        <div class="text-4xl mb-4">🎉</div>
        <h3 class="text-xl font-black text-gray-800 mb-2">{{ mensajeModal }}</h3>
        <p class="text-gray-500 mb-6">{{ submensajeModal }}</p>
        <button 
          @click="confirmarInicio"
          class="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all"
        >
          Som-hi!
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()

// Variables reactives per guardar l'estat
const codigoSala = ref('')
const mostrarModal = ref(false)
const mensajeModal = ref('')
const submensajeModal = ref('')

// Funció per simular la creació d'una sala
// Funció per crear una sala (anar a la sala d'espera amb mode crear)
function crearSala() {
  router.push({ name: 'sala-espera', params: { id: 'crear' }, query: { idLloc: route.params.id } })
}

// Funció per unir-se si l'usuari ha escrit un codi
function unirseSala() {
  if (!codigoSala.value) return; 
  router.push({ name: 'sala-espera', params: { id: codigoSala.value } })
}

// Funció per anar directament al joc sense sala
function jugarSolo() {
  irAlJuego()
}

// Funció que es crida en prémer "Som-hi" al modal (ja no s'usa el modal per unir-se a sala)
function confirmarInicio() {
  mostrarModal.value = false
  irAlJuego()
}

// Aquesta funció és la que realment ens porta a la pantalla del mapa
async function irAlJuego() {
  try {
    // 1. Cridem al backend per CREAR una sessió de joc real
    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idLloc: route.params.id, // L'ID del monument (Sagrada Família)
        // perfilId: usuari.value._id // Opcional: per saber qui ha creat la sala
      })
    });

    const sessioNova = await resposta.json();

    if (resposta.ok && sessioNova._id) {
      // 2. Ara anem al mapa, però amb l'ID de la SESSIÓ que acabem de crear
      router.push({ 
        name: 'mapa-joc', 
        params: { id: sessioNova._id } // Aquest ID sí que existirà a la BD!
      });
    } else {
      alert("No s'ha pogut crear la sessió de joc");
    }
  } catch (error) {
    console.error("Error al crear la partida:", error);
    alert("Error de connexió al crear la sala");
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>

