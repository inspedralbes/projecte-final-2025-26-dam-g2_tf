<template>
  <div 
    v-if="showSplash" 
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #402749; z-index: 9999;"
    :style="{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s' }"
  >
    <!-- Brújula -->
    <div 
      v-if="!compassHidden"
      class="compass-container" 
      :class="{ 'zoom-in': startZoom, 'compass-fade-out': compassFadeOut }"
    >
      <CompassRose 
        :size="compassSize" 
        :isSpinning="roseSpinning"
      />
    </div>

    <!-- Título del juego -->
    <div 
      v-if="showTitle" 
      class="game-title"
      :class="{ 'title-fade-out': titleFadeOut }"
    >
      North
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import CompassRose from './CompassSVG.vue';

const showSplash = ref(true);
const startZoom = ref(false);
const fadeOut = ref(false);
const roseSpinning = ref(false);

const compassFadeOut = ref(false);
const compassHidden = ref(false);
const showTitle = ref(false);
const titleFadeOut = ref(false);

// Responsive size
const compassSize = computed(() => {
  if (typeof window !== 'undefined') {
    return Math.min(window.innerWidth * 0.8, 400);
  }
  return 300;
});

const emit = defineEmits(['splash-complete']);

onMounted(() => {
  // 1. Zoom in inicial de la brújula
  setTimeout(() => {
    startZoom.value = true;
  }, 100);
  
  // 2. Las aspas empiezan a girar buscando el norte
  setTimeout(() => {
    roseSpinning.value = true;
  }, 700);
  
  // 3. La brújula empieza a desaparecer
  setTimeout(() => {
    compassFadeOut.value = true;
  }, 2800);

  // 4. Ocultar brújula y mostrar título
  setTimeout(() => {
    compassHidden.value = true;
    showTitle.value = true;
  }, 3500);
  
  // 5. Título empieza a desaparecer
  setTimeout(() => {
    titleFadeOut.value = true;
  }, 5500);

  // 6. Fade out total del fondo del splash
  setTimeout(() => {
    fadeOut.value = true;
  }, 6200);
  
  // 7. Ocultar splash completamente
  setTimeout(() => {
    showSplash.value = false;
    emit('splash-complete');
  }, 6800);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.compass-container {
  transform: scale(0.5);
  opacity: 0;
}

.compass-container.zoom-in {
  animation: zoomIn 0.8s ease-out forwards;
}

.compass-fade-out {
  animation: compassFadeOutAnim 0.8s ease-in forwards;
}

.game-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(3rem, 15vw, 6rem);
  font-weight: 900;
  color: #f5cbdd;
  text-transform: uppercase;
  letter-spacing: 0.8rem;
  opacity: 0;
  transform: scale(0.9);
  filter: blur(10px);
  animation: titleFadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  text-shadow: 0 0 20px rgba(245, 203, 221, 0.4);
}

.title-fade-out {
  animation: titleFadeOutAnim 0.8s ease-in forwards;
}

@keyframes zoomIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes compassFadeOutAnim {
  to {
    transform: scale(1.1);
    opacity: 0;
    filter: blur(10px);
  }
}

@keyframes titleFadeIn {
  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes titleFadeOutAnim {
  to {
    opacity: 0;
    transform: scale(1.1);
    filter: blur(10px);
  }
}
</style>
