<template>
  <div class="relative">
    <!-- Si NO hi ha usuari: botó d'iniciar sessió (obre el LoginModal global) -->
    <button
      v-if="!usuari"
      @click="obrirLoginModal"
      class="group relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#402749] via-[#5d3962] to-[#804f7f] flex items-center justify-center text-white shadow-lg shadow-[#402749]/20 hover:shadow-[#804f7f]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-90 transition-all duration-300 border border-white/10"
      title="Iniciar sessió"
    >
      <!-- Efecte de brillantor al hover -->
      <div class="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-5 h-5 relative z-10 text-[#f5cbdd]">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </button>

    <!-- Si SÍ hi ha usuari: botó d'avatar que va al perfil -->
    <button
      v-else
      @click="router.push('/perfil')"
      class="group relative w-11 h-11 rounded-2xl flex items-center justify-center font-black border-2 border-[#f5cbdd] shadow-xl cursor-pointer overflow-hidden bg-[#402749] hover:border-white transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
    >
      <img v-if="usuari.avatar" :src="usuari.avatar" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#804f7f] to-[#402749] text-white text-base">
        {{ (usuari.nom_usuari || usuari.nom || '?').charAt(0).toUpperCase() }}
      </div>
      
      <!-- Overay subtil al hover -->
      <div class="absolute inset-0 bg-[#402749]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useLoginModal } from '../composables/useLoginModal';

const router = useRouter();
const { usuari } = useAuth();
const { obrirModal } = useLoginModal();

function obrirLoginModal() {
  obrirModal('Hola de nou! 👋 Inicia sessió per continuar la teva aventura per Barcelona.');
}
</script>
