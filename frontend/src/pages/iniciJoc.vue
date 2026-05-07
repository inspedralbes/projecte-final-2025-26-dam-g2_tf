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
        <h2 class="text-xl font-bold text-[rgba(64,39,73)] mb-2">Crear nova sala</h2>
        <p class="text-gray-600 mb-6 text-sm">Convida els teus amics compartint un codi.</p>
        <button 
          @click="crearSala"
          class="w-full bg-[rgba(64,39,73)] text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-all uppercase tracking-wide"
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

    <!-- Botó per saltar la sala i jugar sol (eliminat per petició de l'usuari, el flux s'unifica a la sala) -->

    <!-- Modal que mostra confirmació a l'usuari -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div class="bg-white p-8 rounded-[30px] w-10/12 max-w-sm text-center shadow-2xl">
        <div class="text-4xl mb-4"></div>
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
import { useCustomModal as useAlertModal } from '../composables/useCustomModal'

const router = useRouter()
const route = useRoute()
const { mostrarModal: showCustomModal } = useAlertModal()

// Variables reactives per guardar l'estat
const codigoSala = ref('')
const mostrarModal = ref(false)
const mensajeModal = ref('')
const submensajeModal = ref('')

// Funció per crear una sala (anar a la sala d'espera amb mode crear)
function crearSala() {
  router.push({ name: 'sala-espera', params: { id: 'crear' }, query: { idLloc: route.params.id } })
}

// Funció per unir-se si l'usuari ha escrit un codi
function unirseSala() {
  if (!codigoSala.value) return; 
  router.push({ name: 'sala-espera', params: { id: codigoSala.value } })
}

// Funció per unir-se si l'usuari ha escrit un codi

// Funció que es crida en prémer "Som-hi" al modal 
function confirmarInicio() {
  mostrarModal.value = false
  irAlJuego()
}

// Aquesta funció és la que realment ens porta a la pantalla del mapa
async function irAlJuego() {
  try {
    // 1. Recuperem l'ID del perfil 
    const dadesUsuari = JSON.parse(localStorage.getItem('usuari') || '{}');
    const perfilId = dadesUsuari._id;

    console.log("Dades enviades al POST:", {
      idLloc: route.params.id,
      perfilId: perfilId
    });

    if (!perfilId) {
        await showCustomModal({ isAlert: true, message: "Sessió caducada. Torna a iniciar sessió." });
        return router.push('/login');
    }

    // 2. Creem la sessió real a la base de dades
    const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8088' : 'https://north.dam.inspedralbes.cat');
    const resposta = await fetch(`${API_URL}/api/sessionsJoc/crear`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idLloc: route.params.id, 
        perfilId: perfilId
      })
    });

    if (!resposta.ok) {
      const errorText = await resposta.text();
      throw new Error("El servidor ha fallat en crear la sessió: " + errorText);
    }

    const sessioNova = await resposta.json();
    console.log("Sessió creada correctament:", sessioNova);



    // 3. Anem al mapa amb l'ID de la SESSIÓ
    router.push({ name: 'mapa-joc', params: { id: sessioNova._id } });

  } catch (error) {
    console.error("Error a la petició:", error);
    await showCustomModal({ isAlert: true, message: "Error de xarxa o de codi: " + error.message });
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

