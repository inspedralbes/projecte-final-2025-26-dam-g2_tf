<template>
  <div class="bg-gradient-to-b from-[#1a0a1f] to-black min-h-screen flex flex-col text-white overflow-hidden">
    
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
      </div> <div class="flex-shrink-0 w-[40vw] h-10 pointer-events-none"></div>

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

const llistaLlocs = ref([]);
const activeIndex = ref(0);
const scrollContainer = ref(null);

onMounted(async () => {
  try {
const res = await fetch('http://localhost:8088/api/mapa/punts');    llistaLlocs.value = await res.json();
  } catch (err) {
    console.error("Error cargando rutas:", err);
  }
});


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