<template>
  <div class="sobre-wrapper" :class="{ 'fase-carta': mostrarCarta }">

    <!-- ─────────── FASE 1: SOBRE ─────────── -->
    <transition name="fade-out">
      <div v-if="!mostrarCarta" class="sobre-escena">

        <!-- Títol ambiental -->
        <transition name="slide-down">
          <p v-if="mostrarTitol" class="text-misteri">Una carta t'espera...</p>
        </transition>

        <!-- SOBRE -->
        <div class="sobre-container" :class="{ 'obert': sobreObert }" @click="obrirSobre">
          <img
            v-if="!sobreObert"
            :src="netejarUrl(baseUrl + '/assets/Sobre/Sobre Tancat.png')"
            alt="Sobre tancat"
            class="sobre-imatge sobre-tancat"
          />
          <img
            v-else
            :src="netejarUrl(baseUrl + '/assets/Sobre/Sobre_Obert.png')"
            alt="Sobre obert"
            class="sobre-imatge sobre-obert"
          />
        </div>

        <!-- Instrucció -->
        <transition name="fade-up">
          <p v-if="!sobreObert && mostrarTitol" class="text-instruccio">Toca el sobre per obrir-lo</p>
        </transition>

      </div>
    </transition>

    <!-- ─────────── OVERLAY CARTA LORE ─────────── -->
    <transition name="carta-surt">
      <div v-if="cartaVisible && !mostrarCarta" class="carta-overlay">
        <div class="carta-overlay-inner">
          <img
            v-if="cartaLoreUrl"
            :src="cartaLoreUrl"
            alt="Carta de lore"
            class="carta-lore-imatge"
          />
          <div v-else class="carta-sense-imatge">
            <p>Sense carta assignada per a aquesta ruta.</p>
          </div>

          <button @click="continuarAlPersonatge" class="boto-continuar">
            Continuar
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { netejarUrl } from '../utils/url';

export default {
  name: 'SobreLore',
  data() {
    return {
      sessioId: this.$route.params.sessioId,
      baseUrl: import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat',
      cartaLoreUrl: '',
      sobreObert: false,
      cartaVisible: false,
      mostrarTitol: false,
      mostrarCarta: false,
    };
  },
  async mounted() {
    // Animació d'entrada del títol
    setTimeout(() => { this.mostrarTitol = true; }, 400);

    await this.carregarCartaLore();
  },
  methods: {
    async carregarCartaLore() {
      try {
        const res = await fetch(`${this.baseUrl}/api/sessionsJoc/${this.sessioId}`);
        if (!res.ok) return;
        const sessio = await res.json();

        // id_lloc_desti ve populat amb carta_lore (gràcies al populate que hem afegit)
        const cartaLore = sessio.id_lloc_desti?.carta_lore || '';
        if (cartaLore) {
          this.cartaLoreUrl = netejarUrl(this.baseUrl + cartaLore);
        }
      } catch (e) {
        console.error('[SobreLore] Error carregant carta de lore:', e);
      }
    },

    obrirSobre() {
      if (this.sobreObert) return;
      this.sobreObert = true;
      // La carta surt del sobre amb un petit retard per deixar veure el sobre obert primer
      setTimeout(() => { this.cartaVisible = true; }, 500);
    },

    continuarAlPersonatge() {
      this.mostrarCarta = true;
      setTimeout(() => {
        this.$router.push('/carta-personatge/' + this.sessioId);
      }, 500);
    },
    netejarUrl
  }
};
</script>

<style scoped>
/* ── Layout general ── */
.sobre-wrapper {
  min-height: 100vh;
  background: #1a0e2e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.sobre-escena {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  width: 100%;
  padding: 24px;
}

/* ── Textos ambientals ── */
.text-misteri {
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #d4a8c7;
  font-size: 1.1rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.85;
  text-align: center;
}

.text-instruccio {
  font-family: 'Georgia', serif;
  color: #a07090;
  font-size: 0.78rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  animation: pols 2.2s ease-in-out infinite;
}

@keyframes pols {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ── Sobre ── */
.sobre-container {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.sobre-container:not(.obert):hover {
  transform: scale(1.04) translateY(-4px);
}

.sobre-imatge {
  width: min(340px, 88vw);
  object-fit: contain;
  border-radius: 4px;
  filter: drop-shadow(0 12px 40px rgba(180, 100, 160, 0.35));
}

/* ── Overlay carta ── */
.carta-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 8, 28, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  overflow-y: auto;
}

.carta-overlay-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 440px;
}

/* ── Carta de lore ── */
.carta-lore-imatge {
  width: 100%;
  max-width: 420px;
  border-radius: 10px;
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.7);
  object-fit: contain;
}

.carta-sense-imatge {
  background: #f5ede0;
  border-radius: 10px;
  padding: 32px 24px;
  text-align: center;
  color: #7a5c3a;
  font-family: 'Georgia', serif;
  font-size: 0.9rem;
  width: 100%;
}

/* ── Botó continuar ── */
.boto-continuar {
  background: #bc85ab;
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 16px 0;
  width: 100%;
  max-width: 320px;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.boto-continuar:hover {
  background: #9f6795;
  transform: scale(1.02);
}

.boto-continuar:active {
  transform: scale(0.97);
}

/* ── Transicions Vue ── */
.fade-out-leave-active {
  transition: opacity 0.5s ease;
}
.fade-out-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.fade-up-enter-active {
  transition: all 0.5s ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.carta-surt-enter-active {
  transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.carta-surt-enter-from {
  opacity: 0;
  transform: translateY(-40px) scale(0.92);
}
</style>
