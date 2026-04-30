<template>
  <div class="album-stage">
    <!-- ELIMINADO: background-environment - causaba el espacio gris -->

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
          <div class="cover-skin" :style="{ backgroundImage: `url(${API_URL}/portada.png)` }">
            <!-- Removed overlays to show the full portada image -->
          </div>
        </div>

        <!-- CROMO PAGES -->
        <div
          v-for="(cromo, idx) in allPages"
          :key="'p' + idx"
          class="page parchment"
          data-density="soft"
        >
          <img 
            :src="`${API_URL}/${idx % 2 === 0 ? 'hoja2.png' : 'hoja.png'}`" 
            class="page-base-image"
          />
          <div class="inner-shadow" :class="idx % 2 === 0 ? 'shadow-left-page' : 'shadow-right-page'"></div>
          
          <div class="content-box">
            <template v-if="!cromo._blank">
              <div class="cromo-container" :style="{ transform: `rotate(${idx % 2 === 0 ? 1.5 : -1.5}deg)` }">
                <div class="photo-only" :class="{ 'is-locked': !cromo.descobert }">
                  <template v-if="cromo.descobert">
                    <img :src="imatgeCromo(cromo.imatge_cromo || cromo.imatge_usuari)" class="actual-img" />
                    <div class="photo-sheen"></div>
                  </template>
                  <div v-else class="locked-placeholder">?</div>
                </div>

                <!-- Ubicació i Data a la part inferior -->
                <div v-if="cromo.descobert" class="location-tag-bottom">
                  <div class="tag-name">{{ cromo.nom_lloc }}</div>
                  <div class="tag-date">{{ formatDate(cromo.data_obtencio) }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <!-- Blank page with just texture -->
            </template>
          </div>
        </div>

        <!-- BACK COVER -->
        <div class="page cover back" data-density="hard">
          <div class="cover-skin"></div>
        </div>
      </div>
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
    // Mobile: mantener el comportamiento actual
    pW = Math.floor(vW * 0.44);
    pH = Math.floor(pW * 1.35);
  } else {
    // Desktop: hacer el libro más compacto
    const maxWidth = vW * 0.6; // Máximo ancho disponible
    const maxHeight = vH * 0.65; // Máximo alto disponible
    
    // Calcular basándose en el ratio
    pH = Math.min(maxHeight, 500); // Altura máxima
    pW = Math.floor(pH / 1.35);
    
    // Si es muy ancho, ajustar
    if (pW * 2 > maxWidth) {
      pW = Math.floor(maxWidth / 2.2); // Dejar margen
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

      // Automatic opening effect
      setTimeout(() => {
        if (pageFlipInstance && currentPage.value === 0) {
          pageFlipInstance.flip(1);
        }
      }, 1200);
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
  min-height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
  padding: 2rem 0;
}

/* WORKSPACE */
.book-workspace {
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  background-color: #03162c;
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
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
  background-color: transparent;
  box-shadow: none;
}

.page-base-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  z-index: 1;
}

.inner-shadow {
  position: absolute;
  top: 0; bottom: 0;
  width: 40px;
  z-index: 5;
  pointer-events: none;
}

.shadow-left-page {
  right: 0;
  background: linear-gradient(to left, rgba(0,0,0,0.2), transparent);
}

.shadow-right-page {
  left: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.2), transparent);
}

.content-box {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12%;
}

.cromo-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.photo-only {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.actual-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: sepia(0.2) contrast(1.1);
  display: block;
}

.photo-sheen {
  display: none; /* Removed to keep photo pure as requested */
}

.dust-texture {
  position: absolute;
  inset: 0;
  background-image: url('https://www.transparenttextures.com/patterns/dust.png');
  opacity: 0.4;
}

.locked-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: rgba(139, 69, 19, 0.15);
  font-family: 'Uncial Antiqua', cursive;
  border: 1px dashed rgba(139, 69, 19, 0.2);
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

.location-tag-bottom {
  font-family: 'EB Garamond', serif;
  color: #2a2118;
  text-align: center;
  width: 100%;
  margin-top: 6px;
  line-height: 1.2;
}

.tag-name {
  font-size: clamp(10px, 3vw, 13px);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.tag-date {
  font-size: clamp(9px, 2.8vw, 11px);
  opacity: 0.6;
  font-style: italic;
  margin-top: 1px;
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
  .album-stage { padding: 1rem 0; }
  .polaroid-vibe { padding-bottom: 25px; }
  .book-title { font-size: 18px; }
}

/* Reset PageFlip defaults */
:deep(.stf__block) { background: transparent !important; }
:deep(.stf__parent) { overflow: visible !important; }
</style>