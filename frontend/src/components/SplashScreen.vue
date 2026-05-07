<template>
  <div 
    v-if="showSplash" 
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #402749; z-index: 9999;"
    :style="{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.4s ease-out' }"
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
  
  // 2. Las aspas empiezan a girar
  setTimeout(() => {
    roseSpinning.value = true;
  }, 700);
  
  // 3. La brújula empieza a desvanecerse
  setTimeout(() => {
    compassFadeOut.value = true;
  }, 2200);

  // 4. El título aparece justo cuando la brújula se ha ido por completo
  setTimeout(() => {
    compassHidden.value = true; // Ocultar brújula
    showTitle.value = true;     // Mostrar título
  }, 2800); // 2200ms + 600ms de animación de salida

  // 5. El título y el fondo se desvanecen juntos para entrar al juego
  setTimeout(() => {
    titleFadeOut.value = true;
    fadeOut.value = true;
  }, 4100);

  // 6. Finalizar splash y dar paso al juego (emisión más temprana para evitar pausa)
  setTimeout(() => {
    showSplash.value = false;
    emit('splash-complete');
  }, 4400); // Solo 300ms después de empezar el fundido
});
</script>

<style scoped>
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
  animation: compassFadeOutAnim 0.6s ease-in forwards;
}

.game-title {
  font-family: 'Worldstar', sans-serif;
  font-size: clamp(4rem, 20vw, 8rem);
  font-weight: normal;
  color: #f5cbdd;
  text-transform: uppercase;
  letter-spacing: 0.6rem;
  opacity: 0;
  transform: scale(0.9);
  filter: blur(10px);
  animation: titleFadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  text-shadow: 0 0 40px rgba(245, 203, 221, 0.5);
}

.title-fade-out {
  animation: titleFadeOutAnim 0.4s ease-in forwards;
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
    filter: blur(15px);
  }
}

@keyframes titleFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.85);
    filter: blur(12px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes titleFadeOutAnim {
  to {
    opacity: 0;
    transform: scale(1.05);
    filter: blur(10px);
  }
}
</style>
