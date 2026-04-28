<template>
  <div class="flex flex-col items-center justify-center w-full px-2 py-4 animate-fade-in">
    <!-- Book Container -->
    <div class="relative w-full max-w-[320px] aspect-[3/4] mx-auto flex justify-center items-center" ref="bookContainer">
      <div id="book" class="w-full h-full mx-auto shadow-2xl" ref="bookElement">
        
        <!-- Cover Page -->
        <div class="page hard flex flex-col items-center justify-center p-6 text-center relative bg-[#2a1b31] border-4 border-[#c68bb2]/30 rounded-r-xl shadow-2xl" data-density="hard">
          <div class="border-2 border-[#c68bb2]/50 p-4 rounded-lg w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
            <!-- Explorer Badge / Accent -->
            <div class="w-16 h-16 rounded-full bg-[#c68bb2]/20 flex items-center justify-center mb-4 border border-[#c68bb2]/40">
              <span class="text-3xl text-[#c68bb2]">🧭</span>
            </div>
            
            <h2 class="text-[#c68bb2] font-bold text-xl tracking-[0.2em] uppercase mb-2 font-serif">DIARI D'EXPLORACIÓ</h2>
            <p class="text-gray-400 text-[10px] tracking-wider uppercase bg-black/30 px-3 py-1 rounded-full border border-white/5">
              Notes de Camp
            </p>
            
            <!-- Decorative elements -->
            <div class="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 text-[#c68bb2]/60 text-xs font-serif italic animate-pulse">
              <span>Obre el diari</span>
              <span>→</span>
            </div>
          </div>
          
          <!-- Leather spine effect -->
          <div class="absolute left-0 top-0 bottom-0 w-4 bg-black/40 border-r border-white/5 shadow-md rounded-r-sm"></div>
        </div>

        <!-- Inner Pages (Cromos) -->
        <div 
          v-for="(cromo, index) in cromosPaginats" 
          :key="index" 
          class="page p-4 flex flex-col justify-between shadow-inner relative bg-[#1e1225] border-l border-black/20"
          data-density="soft"
        >
          <!-- Weathered Paper Texture / Dark Theme -->
          <div class="absolute inset-0 bg-gradient-to-b from-[#2a1b31]/30 to-[#140a18]/90 pointer-events-none"></div>
          <div class="absolute inset-0 bg-[radial-gradient(#c68bb2_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none"></div>

          <div class="flex flex-col items-center justify-center h-full w-full relative z-10">
            <!-- Polaroid Frame -->
            <div 
              class="bg-[#fcfaf2] p-3 pb-8 rounded-none shadow-xl border border-black/10 w-full max-w-[240px] relative transition-transform duration-300"
              :class="index % 2 === 0 ? 'rotate-1' : '-rotate-1'"
            >
              <!-- Tape effects (corners) -->
              <div class="absolute -top-2 -left-2 w-10 h-4 bg-white/30 backdrop-blur-sm border border-black/5 rounded-none rotate-[-30deg] shadow-sm"></div>
              <div class="absolute -top-2 -right-2 w-10 h-4 bg-white/30 backdrop-blur-sm border border-black/5 rounded-none rotate-[25deg] shadow-sm"></div>

              <!-- Image Container -->
              <div class="aspect-[4/5] overflow-hidden bg-[#2a1b31]/10 rounded-none relative border border-black/10 flex items-center justify-center">
                <template v-if="cromo.descobert">
                  <img 
                    :src="imatgeCromo(cromo.imatge_cromo || cromo.imatge_usuari)" 
                    class="w-full h-full object-cover filter sepia-[0.1] contrast-[1.05] brightness-[0.95]"
                  >
                </template>
                <template v-else>
                  <!-- Elegant Silhouette / Empty Space -->
                  <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2a1b31] to-[#140a18] relative group">
                    <div class="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center border border-[#c68bb2]/20 shadow-inner mb-2">
                      <span class="text-2xl opacity-30 text-[#c68bb2]">👤</span>
                    </div>
                    <span class="text-[9px] text-[#c68bb2]/40 font-serif tracking-widest uppercase font-bold">Per Descobrir</span>
                  </div>
                </template>
              </div>
              
              <!-- Polaroid Caption -->
              <div class="mt-3 text-center font-serif">
                <p class="text-[10px] font-bold text-gray-800 leading-tight truncate px-1">
                  {{ cromo.descobert ? (cromo.nom_lloc || 'Lloc d\'Interès') : '???' }}
                </p>
                <p v-if="cromo.descobert && cromo.data_obtencio" class="text-[7px] text-gray-500 mt-1 italic">
                  {{ new Date(cromo.data_obtencio).toLocaleDateString('ca-ES') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Page Number -->
          <div class="text-center font-serif text-[8px] text-[#c68bb2]/40 mt-1 z-10">
            — {{ index + 1 }} —
          </div>
        </div>

        <!-- Back Cover -->
        <div class="page hard flex flex-col items-center justify-center p-6 text-center relative bg-[#2a1b31] border-4 border-[#c68bb2]/30 rounded-l-xl shadow-2xl" data-density="hard">
          <div class="border-2 border-[#c68bb2]/50 p-4 rounded-lg w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
            <span class="text-2xl mb-2 opacity-60 text-[#c68bb2]">📖</span>
            <h3 class="text-[#c68bb2] font-bold text-sm tracking-widest mb-1 font-serif">FI DEL VIATGE</h3>
            <p class="text-gray-400 text-[9px] italic">Continua explorant per omplir el diari.</p>
          </div>
          <div class="absolute right-0 top-0 bottom-0 w-4 bg-black/40 border-l border-white/5 shadow-md rounded-l-sm"></div>
        </div>

      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="flex gap-4 mt-4 z-20">
      <button 
        @click="flipPrev" 
        class="px-4 py-1.5 bg-[#2a1b31] border border-[#c68bb2]/30 text-[#c68bb2] text-xs font-bold rounded-full hover:bg-[#c68bb2] hover:text-black transition-all duration-300 flex items-center gap-1 shadow-lg"
      >
        <span>←</span> Ant.
      </button>
      <button 
        @click="flipNext" 
        class="px-4 py-1.5 bg-[#2a1b31] border border-[#c68bb2]/30 text-[#c68bb2] text-xs font-bold rounded-full hover:bg-[#c68bb2] hover:text-black transition-all duration-300 flex items-center gap-1 shadow-lg"
      >
        Seg. <span>→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { PageFlip } from 'page-flip';

const props = defineProps({
  cromos: {
    type: Array,
    default: () => []
  }
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const bookElement = ref(null);
let pageFlipInstance = null;

const cromosPaginats = computed(() => {
  return props.cromos.map(c => ({ ...c, descobert: true }));
});

function imatgeCromo(src) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return API_URL + src;
}

const initPageFlip = () => {
  if (!bookElement.value) return;

  setTimeout(() => {
    try {
      if (pageFlipInstance) {
        pageFlipInstance.destroy();
      }

      // Dimensions for single page mobile view
      const width = 320;
      const height = 426; // 3/4 aspect ratio

      pageFlipInstance = new PageFlip(bookElement.value, {
        width: width,
        height: height,
        size: 'stretch',
        minWidth: 280,
        maxWidth: 350,
        minHeight: 373,
        maxHeight: 466,
        usePortrait: true, // Mobile view (single page)
        showCover: true,
        flippingTime: 600,
        drawShadow: true,
        mobileScrollSupport: false
      });

      const pages = bookElement.value.querySelectorAll('.page');
      if (pages.length > 0) {
        pageFlipInstance.loadFromHTML(pages);
      }
    } catch (err) {
      console.error("Error inicialitzant PageFlip:", err);
    }
  }, 200);
};

onMounted(() => {
  initPageFlip();
});

watch(() => props.cromos, () => {
  initPageFlip();
}, { deep: true });

const flipPrev = () => {
  if (pageFlipInstance) pageFlipInstance.flipPrev();
};

const flipNext = () => {
  if (pageFlipInstance) pageFlipInstance.flipNext();
};
</script>

<style scoped>
.page {
  box-sizing: border-box;
  overflow: hidden;
}

#book {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
  margin: 0 auto;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
