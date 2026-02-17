<template>
  <div id="app-container" class="flex flex-col h-screen overflow-hidden bg-[#9f6795] relative">
    
    <div class="absolute top-5 right-5 z-[500]">
      <button 
        v-if="!usuariLoguejat" 
        @click="mostrarModal = true" 
        class="bg-[#402749] text-[#f5cbdd] p-3 rounded-full shadow-2xl active:scale-90 transition-all border-2 border-[#f5cbdd]/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      <button 
        v-else 
        @click="$router.push('/perfil')" 
        class="bg-[#402749] text-white w-12 h-12 rounded-full flex items-center justify-center font-black border-2 border-[#f5cbdd] shadow-lg cursor-pointer uppercase"
      >
        {{ usuariLoguejat.nom.charAt(0) }}
      </button>
    </div>

    <main class="flex-grow overflow-y-auto">
      <router-view />
    </main>

    <NavBar />

    <LoginModal 
      :isVisible="mostrarModal" 
      @close="mostrarModal = false" 
      @login-success="actualitzarUsuari" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NavBar from './components/navBar.vue';
import LoginModal from './components/LoginModal.vue';

const mostrarModal = ref(false);
const usuariLoguejat = ref(null);

onMounted(() => {
  const userSaved = localStorage.getItem('user');
  if (userSaved) {
    usuariLoguejat.value = JSON.parse(userSaved);
  }

  // AFEGEIX AIXÒ: Escolta si algun component (Social o DetallLloc) demana obrir el login
  window.addEventListener('obrir-login', () => {
    mostrarModal.value = true;
  });
});

const actualitzarUsuari = (dadesUsuari) => {
  usuariLoguejat.value = dadesUsuari;
  mostrarModal.value = false;
  // Opcional: recarregar la pàgina o navegar a social un cop loguejat
};
</script>

<style>
/* Estils globals si fossin necessaris */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>