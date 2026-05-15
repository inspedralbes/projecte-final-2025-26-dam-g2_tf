<template>
  <div class="min-h-screen bg-[#1a0e2e] flex flex-col p-6 text-white font-outfit">
    <div class="flex items-center mb-12">
      <button 
        @click="$router.back()" 
        class="bg-white/10 p-3 rounded-full shadow-md backdrop-blur-md active:scale-95 transition-transform border border-white/20"
      >
        <span class="text-xl text-white">←</span>
      </button>
      <h1 class="ml-4 text-2xl font-black text-white tracking-tight uppercase italic">Sala de Joc</h1>
    </div>

    <div class="flex-1 flex flex-col justify-center space-y-8">
      <!-- Secció per CREAR una sala nova -->
      <div class="bg-[#402749]/60 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl text-center">
        <h2 class="text-xl font-black text-white mb-2 uppercase tracking-wide">Crear nova sala</h2>
        <p class="text-white/50 mb-8 text-sm">Convida els teus amics compartint un codi únic i jugueu junts.</p>
        <button 
          @click="crearSala"
          class="w-full bg-white text-[#1a0e2e] font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
        >
          Crear Sala
        </button>
      </div>

      <div class="relative flex py-6 items-center">
        <div class="flex-grow border-t border-white/10"></div>
        <span class="flex-shrink-0 mx-6 text-white/30 text-xs font-black tracking-widest">O</span>
        <div class="flex-grow border-t border-white/10"></div>
      </div>

      <!-- Secció per UNIR-SE a una sala existent -->
      <div class="bg-[#402749]/60 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl text-center">
        <h2 class="text-xl font-black text-white mb-6 uppercase tracking-wide">Unir-se a una sala</h2>
        <input 
          v-model="codigoSala"
          type="text" 
          placeholder="CODI DE SALA"
          class="w-full bg-black/30 border border-white/10 text-white text-center text-xl font-mono py-5 rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-[#bc85ab] placeholder:text-white/30 placeholder:tracking-widest uppercase tracking-[0.1em]"
        >
        <button 
          @click="unirseSala"
          :disabled="!codigoSala"
          class="w-full bg-white text-[#1a0e2e] font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-xs"
        >
          Unir-se
        </button>
      </div>
    </div>

    <!-- Botó per saltar la sala i jugar sol (eliminat per petició de l'usuari, el flux s'unifica a la sala) -->

    <!-- Modal que mostra confirmació a l'usuari -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-6">
      <div class="bg-[#1a0820] border border-white/10 p-8 rounded-[40px] w-full max-w-sm text-center shadow-2xl">
        <h3 class="text-2xl font-black text-white mb-2 tracking-tight">{{ mensajeModal }}</h3>
        <p class="text-white/60 mb-8 leading-relaxed">{{ submensajeModal }}</p>
        <button 
          @click="confirmarInicio"
          class="w-full bg-[#4ade80] text-black font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs"
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

import { BASE_API_URL } from '../utils/url'

const router = useRouter()
const route = useRoute()
const { mostrarModal: showCustomModal } = useAlertModal()

const codigoSala = ref('')
const mostrarModal = ref(false)
const mensajeModal = ref('')
const submensajeModal = ref('')

function crearSala() {
  router.push({ name: 'sala-espera', params: { id: 'crear' }, query: { idLloc: route.params.id } })
}

function unirseSala() {
  if (!codigoSala.value) return; 
  router.push({ name: 'sala-espera', params: { id: codigoSala.value } })
}

function confirmarInicio() {
  mostrarModal.value = false
  irAlJuego()
}

// POST /api/sessionsJoc/crear: Crea una nova sessió de joc per l'usuari
async function irAlJuego() {
  try {
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

    const API_URL = BASE_API_URL;
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

