<template>
  <transition name="cromo-fade">
    <div v-if="visible" class="cromo-notification-overlay">
      <div class="cromo-content-wrapper">
        <!-- Ambient Glow -->
        <div class="ambient-glow"></div>

        <!-- The Card -->
        <div class="cromo-card-outer" :class="{ 'reveal': reveal }">
          <div class="cromo-card-inner">
            <div class="card-shine"></div>
            <div class="card-border-glow"></div>
            <img 
              :src="cromoUrl" 
              alt="Cromo Inicial" 
              class="cromo-image"
              @load="onImageLoad"
            />
          </div>
        </div>

        <!-- Text Content -->
        <div class="cromo-text-area" :class="{ 'reveal': reveal }">
          <h2 class="cromo-title">El teu primer cromo</h2>
          <p class="cromo-description">
            Has rebut una peça del diari per començar el teu viatge. 
            Trobaràs tota la teva col·lecció al <strong>Diari d'Exploració</strong> dins el teu perfil.
          </p>
          
          <button @click="onAccept" class="btn-action">
            Continuar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { netejarUrl } from '../utils/url';

const props = defineProps({
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['accept']);

const cromoUrl = netejarUrl('/CromoInicial.jpg');
const reveal = ref(false);

const onImageLoad = () => {
  reveal.value = true;
};

onMounted(() => {
  // Fallback reveal
  setTimeout(() => {
    reveal.value = true;
  }, 1000);
});

const onAccept = () => {
  emit('accept');
};
</script>

<style scoped>
.cromo-notification-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000; /* Higher than regular overlays */
  background: rgba(26, 14, 46, 0.95); /* Consistent with SobreLore background */
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cromo-content-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 35px;
  width: 100%;
  max-width: 450px;
  padding: 30px;
}

.ambient-glow {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(188, 133, 171, 0.25) 0%, transparent 70%);
  filter: blur(30px);
  z-index: -1;
  animation: pulse-soft 5s ease-in-out infinite;
}

@keyframes pulse-soft {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.6; }
}

.cromo-card-outer {
  width: 180px; /* Smaller as requested */
  aspect-ratio: 3/4.5;
  border-radius: 12px;
  position: relative;
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.cromo-card-outer.reveal {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.cromo-card-inner {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cromo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-border-glow {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  box-shadow: inset 0 0 15px rgba(245, 203, 221, 0.2);
  pointer-events: none;
  z-index: 3;
}

.card-shine {
  position: absolute;
  top: 0;
  left: -150%;
  width: 50%;
  height: 100%;
  z-index: 2;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 255, 255, 0) 10%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0) 90%,
    transparent 100%
  );
  transform: skewX(-25deg);
  pointer-events: none;
}

.cromo-card-outer.reveal .card-shine {
  animation: elegant-shine 4s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes elegant-shine {
  0% { left: -150%; }
  30% { left: 150%; }
  100% { left: 150%; }
}

.cromo-text-area {
  text-align: center;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.8s ease;
  transition-delay: 0.6s;
}

.cromo-text-area.reveal {
  opacity: 1;
  transform: translateY(0);
}

.cromo-title {
  font-family: 'Georgia', serif; /* Cohesion with SobreLore */
  font-size: 1.75rem;
  font-weight: 400;
  color: #fff;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
  text-shadow: 0 0 15px rgba(188, 133, 171, 0.3);
}

.cromo-description {
  font-family: 'Inter', sans-serif;
  color: rgba(212, 168, 199, 0.9); /* Subtler purple-white */
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 30px;
}

.btn-action {
  background: #bc85ab; /* Brand color */
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px 45px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-action:hover {
  background: #d4a8c7;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(188, 133, 171, 0.3);
}

.btn-action:active {
  transform: translateY(0);
}

/* Base Transitions */
.cromo-fade-enter-active, .cromo-fade-leave-active {
  transition: opacity 0.8s ease;
}
.cromo-fade-enter-from, .cromo-fade-leave-to {
  opacity: 0;
}
</style>
