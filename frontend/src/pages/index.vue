<template>
  <div class="bg-gradient-to-b from-[#1a0a1f] to-black min-h-screen flex flex-col text-white overflow-hidden">

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
        <span v-else class="text-white">{{ (usuariLoguejat.nom_usuari || '?').charAt(0) }}</span>
      </button>
    </div>

    <header class="p-6">
      <h1 class="text-2xl md:text-4xl font-bold">Descobreix rutes</h1>
    </header>

    <div 
      ref="scrollContainer"
      @scroll="handleScroll"
      class="flex-1 flex items-center overflow-x-auto gap-4 md:gap-8 snap-x snap-mandatory scrollbar-hide px-[15vw]"
    >
      <div 
        v-for="(lloc, index) in llistaLlocs" 
        :key="lloc._id"
        @click="scrollToCard(index)"
        class="card-item relative flex-shrink-0 snap-center transition-all duration-500 ease-out cursor-pointer
               w-[70vw] h-[50vh] 
               md:w-[400px] md:h-[600px] lg:w-[500px]"
        :class="activeIndex === index ? 'scale-110 z-20 opacity-100' : 'scale-90 z-10 opacity-40'"
      >
        <img 
          :src="lloc.imatge_referencia" 
          class="absolute inset-0 w-full h-full object-cover rounded-3xl transition-transform duration-700"
          :class="activeIndex === index ? 'scale-100' : 'scale-110'"
        />
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end rounded-3xl">
          <h2 class="text-xl md:text-3xl font-bold mb-2">{{ lloc.nom }}</h2>
          <p class="text-sm md:text-base text-gray-200 line-clamp-2">{{ lloc.descripcio }}</p>
          
          <button 
            v-if="activeIndex === index"
            class="mt-4 bg-white text-purple-900 py-2 px-6 rounded-full font-bold self-start transform transition-all active:scale-95"
            @click.stop="$router.push(`/lloc/${lloc._id}`)"
          >
            Explorar
          </button>
        </div>
      </div> 
    <div class="flex-shrink-0 w-[40vw] h-10 pointer-events-none"></div>

    <elmeulogin
      :isVisible="mostrarModal" 
      @tancar="mostrarModal = false" 
      @exit="actualitzarUsuari" 
    />

    </div> <div class="flex justify-center gap-2 py-8">
      <div 
        v-for="(_, index) in llistaLlocs" 
        :key="index"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="activeIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/30'"
      ></div>
    </div>

  </div> </template>

<script setup>
import { ref, onMounted } from 'vue';
import elmeulogin from '../components/elmeulogin.vue';

const mostrarModal = ref(false);
const usuariLoguejat = ref(null);

const llistaLlocs = ref([]);
const activeIndex = ref(0);
const scrollContainer = ref(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

onMounted(async () => {
  // 1. Verificar si ja hi ha un usuari al localStorage
  const userSaved = localStorage.getItem('usuari');
  if (userSaved) {
    usuariLoguejat.value = JSON.parse(userSaved);
  }

  // 2. Carregar les rutes (el teu codi original)
  try {
    const resposta = await fetch(`${API_URL}/api/mapa/punts`);
    llistaLlocs.value = await resposta.json();
  } catch (err) {
    console.error("Error cargando rutas:", err);
  }
});

// Funció per quan el login té èxit
const actualitzarUsuari = (dadesUsuari) => {
  usuariLoguejat.value = dadesUsuari; // Actualitzem la UI (el botó canvia a avatar)
  mostrarModal.value = false;         // Tanquem el modal
};

const handleScroll = () => {
  const container = scrollContainer.value;
  if (!container) return;

  const center = container.scrollLeft + (container.offsetWidth / 2);
  
  const cards = container.querySelectorAll('.card-item');
  cards.forEach((card, index) => {
    const cardMid = card.offsetLeft + (card.offsetWidth / 2);
    if (Math.abs(center - cardMid) < card.offsetWidth / 2) {
      activeIndex.value = index;
    }
  });
};

const scrollToCard = (index) => {
  const container = scrollContainer.value;
  const card = container.querySelectorAll('.card-item')[index];
  container.scrollTo({
    left: card.offsetLeft - (container.offsetWidth / 2) + (card.offsetWidth / 2),
    behavior: 'smooth'
  });
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>