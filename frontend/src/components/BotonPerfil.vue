<template>
  <div>
    <!-- Botón Perfil / Login -->
    <button 
      v-if="!usuari" 
      @click="mostrarModal = true" 
      class="w-10 h-10 rounded-full bg-[#402749] flex items-center justify-center text-white shadow-md hover:bg-[#5a3766] transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </button>

    <button 
      v-else 
      @click="router.push('/perfil')" 
      class="w-12 h-12 rounded-full flex items-center justify-center font-black border-2 border-[#f5cbdd] shadow-lg cursor-pointer uppercase overflow-hidden bg-[#402749]"
    >
      <img v-if="usuari.avatar" :src="usuari.avatar" class="w-full h-full object-cover">
      <span v-else class="text-white">{{ (usuari.nom_usuari || usuari.nom || '?').charAt(0) }}</span>
    </button>

    <elmeulogin
      :isVisible="mostrarModal" 
      @tancar="mostrarModal = false" 
      @exit="onLogin" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import Elmeulogin from './elmeulogin.vue';

const router = useRouter();
const mostrarModal = ref(false);
const { usuari, login } = useAuth();

const emit = defineEmits(['login']);

const onLogin = (dadesUsuari) => {
  login(dadesUsuari); // Actualitza l'estat global reactiu + localStorage
  mostrarModal.value = false;
  emit('login', dadesUsuari);
};
</script>
