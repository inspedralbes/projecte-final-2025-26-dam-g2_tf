<template>
  <div class="album-stage">
    <!-- Immersive Background - Cleaner ancient texture -->
    <div class="background-environment">
      <div class="ancient-desk"></div>
      <div class="ambient-vignette"></div>
    </div>

    <!-- Main Container - Pushed up -->
    <div class="book-workspace">
      <div 
        class="book-wrapper" 
        :style="bookCenterStyle"
      >
        <div id="book-mount" ref="bookElement">
          <!-- PageFlip injects here -->
        </div>
      </div>
    </div>

    <!-- Hidden source pages -->
    <div v-show="false">
      <div ref="pagesContainer">
        <!-- FRONT COVER -->
        <div class="page cover front" data-density="hard">
          <div class="cover-skin">
            <div class="leather-overlay"></div>
            <div class="gold-frame"></div>
            <div class="cover-data">
              <div class="emblem-gold">🛡️</div>
              <h1 class="book-title">DIARI<br>D'EXPEDICIÓ</h1>
              <div class="book-divider"></div>
              <p class="book-author">Cromos Descoberts</p>
            </div>
            <div class="metal-decoration tl"></div>
            <div class="metal-decoration tr"></div>
            <div class="metal-decoration bl"></div>
            <div class="metal-decoration br"></div>
          </div>
        </div>

        <!-- CROMO PAGES -->
        <div
          v-for="(cromo, idx) in allPages"
          :key="'p' + idx"
          class="page parchment"
          data-density="soft"
        >
          <div class="paper-grain"></div>
          <div class="inner-shadow"></div>
          
          <div class="content-box">
            <template v-if="!cromo._blank">
              <div class="sticker-set" :style="{ transform: `rotate(${idx % 2 === 0 ? 0.8 : -0.8}deg)` }">
                <div class="tape-strip tape-a"></div>
                <div class="tape-strip tape-b"></div>
                
                <div class="polaroid-vibe" :class="{ 'is-empty': !cromo.descobert }">
                  <div class="img-box">
                    <template v-if="cromo.descobert">
                      <img :src="imatgeCromo(cromo.imatge_cromo || cromo.imatge_usuari)" class="actual-img" />
                      <div class="dust-texture"></div>
                    </template>
                    <div v-else class="locked-placeholder">?</div>
                  </div>
                  <div class="img-caption">
                    <p class="loc-name">{{ cromo.descobert ? (cromo.nom_lloc || 'Lloc d\'Interès') : '???' }}</p>
                    <p v-if="cromo.descobert && cromo.data_obtencio" class="loc-date">{{ formatDate(cromo.data_obtencio) }}</p>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="empty-field">
                <div class="journal-lines">
                  <div v-for="n in 12" :key="n" class="j-line"></div>
                </div>
              </div>
            </template>
          </div>

          <div class="page-count">{{ idx + 1 }}</div>
        </div>

        <!-- BACK COVER -->
        <div class="page cover back" data-density="hard">
          <div class="cover-skin">
            <div class="leather-overlay"></div>
            <div class="back-emblem">🏺</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="interaction-notice" v-if="!isFlipping">
      Toca les cantonades per passar pàgina
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { PageFlip } from 'page-flip';

const props = defineProps({
  cromos: { type: Array, default: () => [] }
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const bookElement = ref(null);
const pagesContainer = ref(null);
const currentPage = ref(0);
const totalPages = ref(0);
const isFlipping = ref(false);
let pageFlipInstance = null;

const allPages = computed(() => {
  const p = props.cromos.map(c => ({ ...c, descobert: true, _blank: false }));
  for (let i = 0; i < 4; i++) p.push({ _blank: true });
  return p;
});

const bookCenterStyle = computed(() => {
  if (totalPages.value <= 1) return {};
  if (currentPage.value === 0) {
    return { transform: 'translateX(-25%)', transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)' };
  } else if (currentPage.value === totalPages.value - 1) {
    return { transform: 'translateX(25%)', transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)' };
  }
  return { transform: 'translateX(0)', transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)' };
});

function imatgeCromo(src) {
  if (!src) return '';
  return src.startsWith('http') ? src : API_URL + src;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
}

function initPageFlip() {
  if (!bookElement.value || !pagesContainer.value) return;

  if (pageFlipInstance) {
    pageFlipInstance.destroy();
    pageFlipInstance = null;
  }

  bookElement.value.innerHTML = '';

  const vW = window.innerWidth;
  const vH = window.innerHeight;
  
  let pW, pH;

  if (vW < 600) {
    pW = Math.floor(vW * 0.44);
    pH = Math.floor(pW * 1.35);
  } else {
    const targetH = vH * 0.7; // slightly smaller to allow more top space
    pH = Math.floor(Math.min(targetH, 600));
    pW = Math.floor(pH / 1.35);
    if (pW * 2 > vW * 0.85) {
      pW = Math.floor(vW * 0.4);
      pH = Math.floor(pW * 1.35);
    }
  }

  try {
    pageFlipInstance = new PageFlip(bookElement.value, {
      width: pW,
      height: pH,
      size: 'fixed',
      showCover: true,
      usePortrait: false,
      flippingTime: 900,
      drawShadow: true,
      useMouseEvents: true,
      clickEventForward: true,
      startPage: 0
    });

    const pages = Array.from(pagesContainer.value.children);
    if (pages.length > 0) {
      totalPages.value = pages.length;
      pageFlipInstance.loadFromHTML(pages);
      
      pageFlipInstance.on('flip', (e) => {
        currentPage.value = e.data;
      });
      pageFlipInstance.on('changeState', (e) => {
        isFlipping.value = e.data === 'flipping';
      });
    }
  } catch (err) {
    console.warn("PageFlip reset:", err);
  }
}

let resizeTimeout = null;
const handleResize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(initPageFlip, 200);
};

onMounted(() => {
  nextTick(() => {
    setTimeout(initPageFlip, 150);
    window.addEventListener('resize', handleResize);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  clearTimeout(resizeTimeout);
  if (pageFlipInstance) pageFlipInstance.destroy();
});

watch(() => props.cromos, () => {
  nextTick(() => setTimeout(initPageFlip, 50));
}, { deep: true });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Great+Vibes&display=swap');

.album-stage {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Align to top */
  overflow: hidden;
  background-color: #080808;
  padding-top: 5vh; /* Push book towards top */
}

/* BACKGROUND */
.background-environment {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.ancient-desk {
  position: absolute;
  inset: 0;
  /* Smoother texture without harsh vertical lines */
  background-image: url('https://www.transparenttextures.com/patterns/black-paper.png'), 
                    linear-gradient(to bottom, #16120e, #0a0a0a);
  opacity: 0.9;
}

.ambient-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.95) 100%);
}

/* WORKSPACE */
.book-workspace {
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

#book-mount {
  box-shadow: 0 40px 120px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.5);
  margin: auto;
}

.page {
  background-color: #f3e9d2;
  overflow: hidden;
}

/* COVER */
.cover {
  background-color: #3d251d;
}

.cover-skin {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.leather-overlay {
  position: absolute;
  inset: 0;
  background-image: url('https://www.transparenttextures.com/patterns/leather.png');
  opacity: 0.45;
}

.gold-frame {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  pointer-events: none;
}

.cover-data {
  position: relative;
  z-index: 5;
  text-align: center;
}

.emblem-gold {
  font-size: clamp(40px, 10vw, 60px);
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px gold);
}

.book-title {
  font-family: 'Uncial Antiqua', cursive;
  color: #c5a059;
  font-size: clamp(18px, 5vw, 30px);
  margin: 0;
  line-height: 1.1;
  text-shadow: 1px 1px 3px #000;
}

.book-divider {
  width: 60px;
  height: 1px;
  background: linear-gradient(to right, transparent, #c5a059, transparent);
  margin: 15px auto;
}

.book-author {
  font-family: 'EB Garamond', serif;
  color: #8a7060;
  font-style: italic;
  font-size: clamp(12px, 3vw, 16px);
}

.metal-decoration {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #c5a059;
  opacity: 0.4;
}
.tl { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.tr { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.bl { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.br { bottom: 0; right: 0; border-left: 0; border-top: 0; }

/* PARCHMENT */
.parchment {
  background-color: #f1e8d4;
  background-image: url('https://www.transparenttextures.com/patterns/handmade-paper.png');
}

.paper-grain {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.06) 100%);
  pointer-events: none;
}

.inner-shadow {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 45px;
  background: linear-gradient(to right, rgba(0,0,0,0.15), transparent);
  z-index: 5;
}

.content-box {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8%;
}

.sticker-set {
  position: relative;
}

.tape-strip {
  position: absolute;
  width: 50px;
  height: 14px;
  background-color: rgba(210, 180, 140, 0.3);
  backdrop-filter: blur(1px);
  z-index: 20;
}
.tape-a { top: -5px; left: -15px; transform: rotate(-25deg); }
.tape-b { top: -5px; right: -15px; transform: rotate(25deg); }

.polaroid-vibe {
  background: #fff;
  padding: 8px 8px 30px 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  width: clamp(140px, 35vw, 220px);
}

.img-box {
  width: 100%;
  aspect-ratio: 1;
  background: #202020;
  position: relative;
  overflow: hidden;
}

.actual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(0.2) contrast(1.1) brightness(0.95);
}

.dust-texture {
  position: absolute;
  inset: 0;
  background-image: url('https://www.transparenttextures.com/patterns/dust.png');
  opacity: 0.4;
}

.locked-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 45px;
  color: #333;
  font-family: 'Uncial Antiqua', cursive;
}

.img-caption {
  margin-top: 10px;
  text-align: center;
}

.loc-name {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(14px, 3.5vw, 20px);
  margin: 0;
  color: #2a2118;
}

.loc-date {
  font-family: 'EB Garamond', serif;
  font-size: 10px;
  color: #7a6c5e;
  margin-top: 2px;
}

.empty-field {
  width: 85%;
}

.journal-lines {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.j-line {
  height: 1px;
  background: rgba(0,0,0,0.08);
}

.page-count {
  position: absolute;
  bottom: 12px;
  left: 0; right: 0;
  text-align: center;
  font-family: 'EB Garamond', serif;
  font-size: 12px;
  color: rgba(0,0,0,0.3);
}

.back-emblem {
  font-size: 45px;
  opacity: 0.6;
}

.interaction-notice {
  position: absolute;
  bottom: 20px;
  color: rgba(197, 160, 89, 0.4);
  font-family: 'EB Garamond', serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 10px;
  background: rgba(0,0,0,0.3);
  padding: 5px 15px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  z-index: 50;
}

@media (max-width: 600px) {
  .album-stage { padding-top: 2vh; }
  .polaroid-vibe { padding-bottom: 25px; }
  .book-title { font-size: 18px; }
}

/* Reset PageFlip defaults */
:deep(.stf__block) { background: transparent !important; }
:deep(.stf__parent) { overflow: visible !important; }
</style>
