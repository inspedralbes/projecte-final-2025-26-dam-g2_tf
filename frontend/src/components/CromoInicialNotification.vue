<template>
  <transition name="cromo-pop">
    <div v-if="visible" class="cromo-notification-overlay">
      <div class="cromo-card-container">
        <!-- Ambient Glow -->
        <div class="ambient-glow"></div>

        <!-- The Card -->
        <div class="cromo-card" :class="{ 'card-reveal': reveal }">
          <div class="card-inner">
            <div class="card-shine"></div>
            <img 
              :src="cromoUrl" 
              alt="Cromo Inicial" 
              class="cromo-image"
              @load="onImageLoad"
            />
          </div>
        </div>

        <!-- Text Content -->
        <div class="cromo-text-content" :class="{ 'text-reveal': reveal }">
          <h2 class="cromo-title">El teu primer cromo!</h2>
          <p class="cromo-description">
            Has rebut un cromo especial per unir-te a l'aventura. 
            Pots consultar la teva col·lecció al <strong>Diari d'Exploració</strong> des del teu perfil.
          </p>
          
          <button @click="onAccept" class="btn-accept">
            Explorar Rutes
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { netejarUrl, BASE_API_URL } from '../utils/url';

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
  // Fallback si la imatge ja està en cache i no dispara @load o per si triga massa
  setTimeout(() => {
    reveal.value = true;
  }, 800);
});

const onAccept = () => {
  emit('accept');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');

.cromo-notification-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 5, 20, 0.9);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
}

.cromo-card-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.ambient-glow {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(188, 133, 171, 0.3) 0%, transparent 70%);
  filter: blur(40px);
  z-index: -1;
  animation: pulse-glow 4s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
}

.cromo-card {
  width: 240px;
  aspect-ratio: 3/4.5;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transform: scale(0.8) rotateY(30deg);
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  perspective: 1000px;
}

.cromo-card.card-reveal {
  opacity: 1;
  transform: scale(1) rotateY(0deg);
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
}

.cromo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 45%,
    rgba(255, 255, 255, 0.4) 55%,
    transparent 100%
  );
  background-size: 200% 200%;
  background-position: -100% -100%;
  transition: background-position 1s ease;
}

.cromo-card.card-reveal .card-shine {
  animation: shine-effect 3s ease-in-out infinite;
}

@keyframes shine-effect {
  0% { background-position: -100% -100%; }
  20% { background-position: 100% 100%; }
  100% { background-position: 100% 100%; }
}

.cromo-text-content {
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
  transition-delay: 0.5s;
}

.cromo-text-content.text-reveal {
  opacity: 1;
  transform: translateY(0);
}

.cromo-title {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fff 0%, #bc85ab 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.cromo-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.btn-accept {
  background: #fff;
  color: #1a0e2e;
  border: none;
  border-radius: 30px;
  padding: 14px 40px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn-accept:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 30px rgba(188, 133, 171, 0.4);
  background: #bc85ab;
  color: #fff;
}

.btn-accept:active {
  transform: translateY(0);
}

/* Transitions */
.cromo-pop-enter-active, .cromo-pop-leave-active {
  transition: opacity 0.5s ease;
}
.cromo-pop-enter-from, .cromo-pop-leave-to {
  opacity: 0;
}
</style>
