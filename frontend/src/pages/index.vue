<template>
  <div class="bg-gradient-to-b from-[#1a0a1f] via-[#5a3766] to-[#1a0a1f] min-h-screen flex flex-col font-sans antialiased text-white overflow-hidden">
    
    <header class="px-4 sm:px-6 py-4 sm:py-6 flex-shrink-0 z-10">
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Descobreix rutes</h1>
    </header>

    <!-- Carousel container -->
    <div class="flex-1 relative flex items-center justify-center py-8">
      <div 
        ref="scrollContainer"
        class="w-full h-full flex items-center overflow-x-auto gap-6 sm:gap-8 md:gap-10 snap-x snap-mandatory scrollbar-hide px-[10vw] sm:px-[15vw] md:px-[20vw] lg:px-[25vw]"
        @scroll="handleScroll"
      >
        <div 
          v-for="(lloc, index) in llistaLlocs" 
          :key="lloc._id"
          :data-index="index"
          @click="handleCardClick(lloc._id, index)"
          class="card-item relative rounded-2xl sm:rounded-3xl overflow-hidden snap-center flex-shrink-0 cursor-pointer transition-all duration-500 ease-out transform-gpu"
          :class="getCardClasses(index)"
          :style="getCardStyle(index)"
        >
          <!-- Imagen de fondo -->
          <div class="absolute inset-0">
            <img 
              :src="lloc.imatge_referencia" 
              class="w-full h-full object-cover"
              :class="activeIndex === index ? 'scale-100' : 'scale-110'"
              style="transition: transform 0.5s ease-out"
              alt=""
            />
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>

          <!-- Badge dificultad -->
          <div class="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-full z-10 border border-white/20">
            <span class="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">{{ lloc.dificultat }}</span>
          </div>

          <!-- Rating badge (top left) -->
          <div class="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
            <div class="bg-white/20 backdrop-blur-xl px-2.5 py-1 rounded-lg border border-white/30">
              <span class="text-lg sm:text-xl font-bold text-white">{{ getRating(index) }}</span>
              <span class="text-yellow-300 text-sm ml-0.5">★</span>
            </div>
          </div>

          <!-- Contenido -->
          <div class="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 z-10">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2 sm:mb-3 drop-shadow-2xl">
              {{ lloc.nom }}
            </h2>
            
            <p class="text-gray-200 text-xs sm:text-sm md:text-base line-clamp-2 leading-relaxed mb-4 sm:mb-5 drop-shadow-lg">
              {{ lloc.descripcio || 'Explora aquest racó de Barcelona.' }}
            </p>

            <!-- Botón explorar - solo visible en card activa -->
            <div 
              class="transition-all duration-300"
              :class="activeIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
            >
              <button 
                class="bg-white text-[#5a3766] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base uppercase hover:bg-purple-50 transition-all shadow-2xl hover:scale-105"
                @click.stop="$router.push(`/lloc/${lloc._id}`)"
              >
                <span class="flex items-center gap-2">
                  Explorar
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicadores de posición -->
    <div class="flex justify-center gap-2 py-6 sm:py-8 flex-shrink-0">
      <button
        v-for="(lloc, index) in llistaLlocs" 
        :key="`dot-${lloc._id}`"
        @click="scrollToCard(index)"
        class="transition-all duration-300 rounded-full focus:outline-none"
        :class="activeIndex === index ? 'w-8 sm:w-10 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'"
        :aria-label="`Ir a ${lloc.nom}`"
      ></button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';

const llistaLlocs = ref([]);
const activeIndex = ref(0); 
const scrollContainer = ref(null);
const windowWidth = ref(window.innerWidth);

// Obtener clases dinámicas para cada card
const getCardClasses = (index) => {
  const isActive = activeIndex.value === index;
  const isPrev = activeIndex.value === index + 1;
  const isNext = activeIndex.value === index - 1;
  
  return {
    'z-30 shadow-2xl': isActive,
    'z-20 shadow-xl': isPrev || isNext,
    'z-10 shadow-lg': !isActive && !isPrev && !isNext,
    'opacity-100': isActive,
    'opacity-50': !isActive
  };
};

// Obtener estilos dinámicos para cada card
const getCardStyle = (index) => {
  const isActive = activeIndex.value === index;
  
  let width, height, scale;
  
  // Mobile
  if (windowWidth.value < 640) {
    width = isActive ? '80vw' : '75vw';
    height = isActive ? '70vh' : '65vh';
    scale = isActive ? 1 : 0.92;
  }
  // Tablet
  else if (windowWidth.value < 1024) {
    width = isActive ? '70vw' : '65vw';
    height = isActive ? '75vh' : '70vh';
    scale = isActive ? 1 : 0.90;
  }
  // Desktop small
  else if (windowWidth.value < 1440) {
    width = isActive ? '50vw' : '45vw';
    height = isActive ? '80vh' : '75vh';
    scale = isActive ? 1 : 0.88;
  }
  // Desktop large
  else {
    width = isActive ? '35vw' : '32vw';
    height = isActive ? '80vh' : '75vh';
    scale = isActive ? 1 : 0.85;
  }
  
  return {
    width,
    height,
    maxWidth: '700px',
    minHeight: '450px',
    maxHeight: '850px',
    transform: `scale(${scale})`,
  };
};

// Generar rating aleatorio (puedes cambiarlo por datos reales)
const getRating = (index) => {
  const ratings = [7.3, 7.8, 8.7, 9.1, 8.2, 7.5, 8.9];
  return ratings[index % ratings.length];
};

// Manejar scroll
const handleScroll = () => {
  if (!scrollContainer.value || llistaLlocs.value.length === 0) return;
  
  const container = scrollContainer.value;
  const scrollLeft = container.scrollLeft;
  const firstCard = container.querySelector('.card-item');
  
  if (!firstCard) return;
  
  const cardWidth = firstCard.offsetWidth;
  const gap = windowWidth.value < 640 ? 24 : windowWidth.value < 768 ? 32 : 40;
  
  const newIndex = Math.round(scrollLeft / (cardWidth + gap));
  activeIndex.value = Math.max(0, Math.min(newIndex, llistaLlocs.value.length - 1));
};

// Scroll suave a una card específica
const scrollToCard = (index) => {
  if (!scrollContainer.value) return;
  
  const container = scrollContainer.value;
  const firstCard = container.querySelector('.card-item');
  
  if (!firstCard) return;
  
  const cardWidth = firstCard.offsetWidth;
  const gap = windowWidth.value < 640 ? 24 : windowWidth.value < 768 ? 32 : 40;
  
  container.scrollTo({
    left: index * (cardWidth + gap),
    behavior: 'smooth'
  });
};

// Manejar click en card
const handleCardClick = (id, index) => {
  if (activeIndex.value === index) {
    // Si es la card activa, navegar
    // router.push(`/lloc/${id}`);
  } else {
    // Si no es la activa, scrollear a ella
    scrollToCard(index);
  }
};

// Actualizar dimensiones
const updateDimensions = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(async () => {
  try {
    const respuesta = await fetch('http://localhost:8088/api/mapa/punts');
    llistaLlocs.value = await respuesta.json();
    
    setTimeout(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollLeft = 0;
      }
    }, 100);
  } catch (err) { 
    console.error(err); 
  }

  window.addEventListener('resize', updateDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { 
  display: none; 
}

.scrollbar-hide { 
  -ms-overflow-style: none; 
  scrollbar-width: none;
  scroll-behavior: smooth;
  scroll-padding: 20vw;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Optimizaciones de rendimiento */
.card-item {
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Efecto parallax suave en scroll */
@media (prefers-reduced-motion: no-preference) {
  .card-item {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>