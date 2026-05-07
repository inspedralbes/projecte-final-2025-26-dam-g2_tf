<template>
  <div 
    v-if="showSplash" 
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #402749; z-index: 9999;"
    :style="{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.5s' }"
  >
    <div class="compass-container" :class="{ 'zoom-in': startZoom }">
      <CompassRose 
        :size="compassSize" 
        :isSpinning="roseSpinning"
      />
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

// Responsive size
const compassSize = computed(() => {
  if (typeof window !== 'undefined') {
    return Math.min(window.innerWidth * 0.8, 400);
  }
  return 300;
});

const emit = defineEmits(['splash-complete']);

onMounted(() => {
  // 1. Zoom in inicial
  setTimeout(() => {
    startZoom.value = true;
  }, 100);
  
  // 2. Las aspas empiezan a girar buscando el norte
  setTimeout(() => {
    roseSpinning.value = true;
  }, 700);
  
  // 3. Fade out
  setTimeout(() => {
    fadeOut.value = true;
  }, 3500);
  
  // 4. Ocultar splash
  setTimeout(() => {
    showSplash.value = false;
    emit('splash-complete');
  }, 4000);
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
</style>
