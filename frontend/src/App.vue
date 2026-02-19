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
        class="w-12 h-12 rounded-full flex items-center justify-center font-black border-2 border-[#f5cbdd] shadow-lg cursor-pointer uppercase overflow-hidden bg-[#402749]"
      >
        <img v-if="usuariLoguejat.avatar" :src="usuariLoguejat.avatar" class="w-full h-full object-cover">
        <span v-else class="text-white">{{ (usuariLoguejat.nom_usuari || usuariLoguejat.nom || '?').charAt(0) }}</span>
      </button>
    </div>


    <main class="flex-grow overflow-y-auto">
      <router-view />
    </main>

    <NavBar />

    <elmeulogin
      :isVisible="mostrarModal" 
      @tancar="mostrarModal = false" 
      @exit="actualitzarUsuari" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NavBar from './components/navBar.vue';
import Elmeulogin from './components/elmeulogin.vue'; // Revisa que la ruta sigui correcta

const mostrarModal = ref(false);
const usuariLoguejat = ref(null);
const llistaLlocs = ref([]);

onMounted(async () => {
  try {
    // Vite cargará automáticamente la variable del archivo .env correspondiente
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
    
    const res = await fetch(`${API_URL}/api/mapa/punts`);
    if (!res.ok) throw new Error('Error en la respuesta del servidor');
    
    llistaLlocs.value = await res.json();
  } catch (err) {
    console.error("Error cargando rutas:", err);
  }
});

const actualitzarUsuari = (dadesUsuari) => {
  usuariLoguejat.value = dadesUsuari;
  mostrarModal.value = false;
 
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>