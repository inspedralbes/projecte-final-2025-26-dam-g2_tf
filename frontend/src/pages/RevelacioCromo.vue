<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative"
    style="background: #1a0e2e;"
  >
    <!-- Burst effect behind cromo -->
    <div v-if="cromoFlipped" class="absolute inset-0 flex items-center justify-center pointer-events-none animate-burst">
      <div class="w-[600px] h-[600px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent rounded-full blur-[100px]"></div>
    </div>

    <!-- Entrance Transition -->
    <Transition name="premium-fade">
      <div v-if="readyToShow" class="relative z-10 w-full max-w-sm flex flex-col items-center">
          <div class="mb-2 flex flex-col items-center">
            <span class="text-[10px] font-black text-pink-300 uppercase tracking-[0.4em] mb-2 animate-pulse">Missió Completada</span>
            <h2 class="text-white font-black text-3xl mb-2 text-center drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] italic uppercase">Recompensa Desbloquejada</h2>
          </div>
          
          <p class="text-white/60 text-xs mb-10 text-center px-8 leading-relaxed">Has demostrat ser un gran explorador. Aquí tens el teu premi.</p>

          <div class="cromo-container mb-12 w-full max-w-[300px] aspect-[3/4.2] relative perspective-2000">
              <div class="cromo-card w-full h-full" :class="{ flipped: cromoFlipped }" @click="revelarCromo">
                  <!-- Contra cromo -->
                  <div class="cromo-face cromo-back rounded-[2.5rem] overflow-hidden border-[6px] border-white/10 shadow-2xl flex flex-col items-center justify-center bg-[#1a0820]">
                       <div class="absolute inset-0 opacity-30 pointer-events-none pattern-grid"></div>
                       <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                          <div class="w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
                       </div>
                       <p class="text-white font-black text-xs tracking-[0.3em] uppercase animate-bounce">Toca per revelar</p>
                  </div>
                  <!-- Cromo real -->
                  <div class="cromo-face cromo-front rounded-[2.5rem] overflow-hidden border-[6px] border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.1)]">
                      <img :src="baseApi + imatgeCromo" class="w-full h-full object-cover" alt="Cromo guanyat" />
                      
                      <!-- Holographic shine -->
                      <div class="absolute inset-0 shine-effect pointer-events-none"></div>

                      <div class="absolute inset-0 bg-gradient-to-t from-[#1a0e2e] via-transparent to-transparent flex flex-col justify-end p-8">
                          <p class="text-pink-300 font-black text-[9px] uppercase tracking-[0.4em] mb-1">Cromo d'Explorador</p>
                          <p class="text-white font-black text-2xl leading-tight italic uppercase tracking-tighter">{{ nomLloc }}</p>
                      </div>
                  </div>
              </div>
          </div>

          <Transition name="fade-up">
              <div v-if="cromoFlipped" class="w-full flex flex-col items-center">
                  <p class="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6 bg-white/5 py-2 px-4 rounded-full border border-white/5">
                    ✨ Pots trobar aquest cromo al teu diari d'exploració
                  </p>
                  <button
                      @click="anarAValoracions"
                      class="w-full py-5 rounded-2xl bg-white text-[#1a0e2e] font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl hover:bg-pink-50"
                  >
                      CONTINUAR
                  </button>
              </div>
          </Transition>
      </div>
    </Transition>

    <!-- Pre-reveal state (Mysterious delay) -->
    <div v-if="!readyToShow" class="flex flex-col items-center justify-center gap-6">
      <div class="w-12 h-12 border-2 border-white/10 border-t-pink-500 rounded-full animate-spin"></div>
      <p class="text-white/30 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Sincronitzant dades de la missió...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BASE_API_URL } from '../utils/url';

const route = useRoute();
const router = useRouter();

const baseApi = BASE_API_URL;
const cromoFlipped = ref(false);
const readyToShow = ref(false);

// Obtenim les dades de la query
const idLloc = route.params.id;
let imatgeCromo = route.query.imatge || '';
const nomLloc = route.query.nom || 'Ruta Completada';

// Normalització del path per si de cas
if (imatgeCromo && !imatgeCromo.startsWith('/') && !imatgeCromo.includes('/')) {
    imatgeCromo = '/Cromos/' + imatgeCromo;
}
if (imatgeCromo && !imatgeCromo.startsWith('/')) {
    imatgeCromo = '/' + imatgeCromo;
}

function revelarCromo() {
    cromoFlipped.value = true;
}

function anarAValoracions() {
    router.push('/valorar-lloc/' + idLloc);
}

onMounted(() => {
    if (!imatgeCromo) {
        anarAValoracions();
        return;
    }
    
    // Artificial delay for smoother transition
    setTimeout(() => {
        readyToShow.value = true;
    }, 1500);
});
</script>

<style scoped>
.perspective-2000 {
    perspective: 2000px;
}

.cromo-container {
    width: 100%;
}

.cromo-card {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-style: preserve-3d;
    cursor: pointer;
}

.cromo-card.flipped {
    transform: rotateY(180deg);
}

.cromo-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

.cromo-front {
    transform: rotateY(180deg);
}

.cromo-back {
    background: #1a0820;
}

.shine-effect {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0) 45%,
        rgba(255, 255, 255, 0.4) 50%,
        rgba(255, 255, 255, 0) 55%,
        rgba(255, 255, 255, 0) 100%
    );
    background-size: 250% 250%;
    animation: shine 4s infinite linear;
}

@keyframes shine {
    0% { background-position: -150% -150%; }
    100% { background-position: 150% 150%; }
}

@keyframes burst {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.2); opacity: 0.5; }
}

.animate-burst {
    animation: burst 2s ease-out forwards;
}

/* Entrance Animation */
.premium-fade-enter-active {
    transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.premium-fade-enter-from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    filter: blur(10px);
}

.fade-up-enter-active {
    transition: all 1s ease-out;
    transition-delay: 0.5s;
}
.fade-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.pattern-grid {
    background-image: radial-gradient(circle, #fff 1px, transparent 1px);
    background-size: 30px 30px;
}
</style>
