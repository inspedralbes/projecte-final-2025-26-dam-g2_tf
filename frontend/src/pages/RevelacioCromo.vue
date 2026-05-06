<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-6 overflow-y-auto"
    style="background: radial-gradient(circle at center, #402749 0%, #1a0820 100%);"
  >
    <div class="glow-effect absolute pointer-events-none"></div>
    
    <div class="relative z-10 w-full max-w-sm flex flex-col items-center">
        <h2 class="text-white font-black text-2xl mb-2 text-center drop-shadow-lg">HAS GUANYAT EL CROMO!</h2>
        <p class="text-pink-300 text-sm mb-8 text-center px-4">Enhorabona! Has completat tota la ruta i has desbloquejat aquesta recompensa.</p>

        <div class="cromo-container mb-10 w-full max-w-[280px] aspect-[3/4] relative perspective-1000">
            <div class="cromo-card w-full h-full" :class="{ flipped: cromoFlipped }" @click="revelarCromo">
                <!-- Contra cromo -->
                <div class="cromo-face cromo-back rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-[#402749] to-[#2a1030]">
                     <div class="absolute inset-0 opacity-20 pointer-events-none pattern-grid"></div>
                     <span class="text-6xl mb-4">✨</span>
                     <p class="text-white font-black text-sm tracking-widest uppercase">Toca per revelar</p>
                </div>
                <!-- Cromo real -->
                <div class="cromo-face cromo-front rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                    <img :src="baseApi + imatgeCromo" class="w-full h-full object-cover" alt="Cromo guanyat" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                        <p class="text-yellow-400 font-black text-[10px] uppercase tracking-widest">CROMO DE RUTA</p>
                        <p class="text-white font-bold text-lg leading-tight">{{ nomLloc }}</p>
                    </div>
                </div>
            </div>
        </div>

        <Transition name="fade-up">
            <button
                v-if="cromoFlipped"
                @click="anarAValoracions"
                class="w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                style="background-color: #d9a6c2; color: #2a1030;"
            >
                CONTINUAR A VALORACIONS
            </button>
        </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const baseApi = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';
const cromoFlipped = ref(false);

// Obtenim les dades de la query
const idLloc = route.params.id;
const imatgeCromo = route.query.imatge || '';
const nomLloc = route.query.nom || 'Ruta Completada';

function revelarCromo() {
    cromoFlipped.value = true;
}

function anarAValoracions() {
    router.push('/valorar-lloc/' + idLloc);
}

onMounted(() => {
    if (!imatgeCromo) {
        // Si per algun motiu no hi ha imatge, anem directe a valorar
        anarAValoracions();
    }
});
</script>

<style scoped>
.perspective-1000 {
    perspective: 1000px;
}

.cromo-container {
    width: 100%;
}

.cromo-card {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
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
    background: #2a1030;
}

.glow-effect {
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(217, 166, 194, 0.2) 0%, transparent 70%);
    animation: pulse-glow 4s infinite alternate;
}

@keyframes pulse-glow {
    from { transform: scale(0.8); opacity: 0.3; }
    to { transform: scale(1.2); opacity: 0.7; }
}

.fade-up-enter-active {
    transition: all 0.8s ease-out;
}
.fade-up-enter-from {
    opacity: 0;
    transform: translateY(30px);
}

.pattern-grid {
    background-image: radial-gradient(circle, #fff 1px, transparent 1px);
    background-size: 20px 20px;
}

/* Transicions bàsiques */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
