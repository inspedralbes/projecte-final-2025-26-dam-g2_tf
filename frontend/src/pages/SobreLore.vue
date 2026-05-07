<template>
  <transition name="fade-in">
    <div v-if="ready" class="sobre-wrapper" :class="{ 'fase-carta': mostrarCarta }">

    <!-- ─────────── FASE 1: SOBRE ─────────── -->
    <transition name="fade-out">
      <div v-if="!mostrarCarta" class="sobre-escena">

        <!-- Títol ambiental -->
        <transition name="slide-down">
          <div v-if="mostrarTitol" class="capsalera-text">
            <template v-if="sessioId === 'inicial'">
              <h1 class="text-misteri-especial">Benvingut, explorador</h1>
              <p class="text-subtitol-especial">Una carta misteriosa ha aparegut per a tu...</p>
            </template>
            <template v-else>
              <p class="text-misteri">Una carta t'espera...</p>
            </template>
          </div>
        </transition>

        <!-- SOBRE -->
        <div class="sobre-container" :class="{ 'obert': sobreObert }" @click="obrirSobre">
          <!-- Fem servir ambdós per evitar el 'jump' i assegurar pre-càrrega -->
          <img
            :src="netejarUrl(baseUrl + '/assets/Sobre/Sobre Tancat.png')"
            alt="Sobre tancat"
            class="sobre-imatge sobre-tancat"
            :class="{ 'hidden-image': sobreObert }"
          />
          <img
            :src="netejarUrl(baseUrl + '/assets/Sobre/Sobre_Obert.png')"
            alt="Sobre obert"
            class="sobre-imatge sobre-obert"
            :class="{ 'hidden-image': !sobreObert }"
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
            {{ sessioId === 'inicial' ? "Començar l'aventura" : "Continuar" }}
          </button>
        </div>
      </div>
    </transition>

    </div>
  </transition>
</template>

<script>
import { netejarUrl } from '../utils/url';
import { useAuth } from '../composables/useAuth';

export default {
  name: 'SobreLore',
  data() {
    return {
      sessioId: this.$route.params.sessioId,
      baseUrl: import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat',
      cartaLoreUrl: '',
      sobreObert: false,
      cartaVisible: false,
      mostrarCarta: false,
      ready: false,
    };
  },
  async mounted() {
    await this.carregarCartaLore();
    this.ready = true;

    // Animació d'entrada del títol
    setTimeout(() => { this.mostrarTitol = true; }, 400);
  },
  methods: {
    async carregarCartaLore() {
      // 1. Pre-carregar l'imatge del sobre tancat (el primer que es veu)
      const imgTancat = new Image();
      imgTancat.src = netejarUrl(this.baseUrl + '/assets/Sobre/Sobre Tancat.png');
      try {
        if (imgTancat.decode) await imgTancat.decode();
      } catch (e) {}

      // 2. Pre-carregar l'imatge del sobre obert
      const imgSobre = new Image();
      imgSobre.src = netejarUrl(this.baseUrl + '/assets/Sobre/Sobre_Obert.png');
      if (imgSobre.decode) imgSobre.decode().catch(() => {});

      let url = '';
      if (this.sessioId === 'inicial') {
        url = netejarUrl(this.baseUrl + '/assets/Carta_lore/carta_inicial.png');
      } else {
        try {
          const res = await fetch(`${this.baseUrl}/api/sessionsJoc/${this.sessioId}`);
          if (!res.ok) return;
          const sessio = await res.json();
          const cartaLore = sessio.id_lloc_desti?.carta_lore || '';
          if (cartaLore) {
            url = netejarUrl(this.baseUrl + cartaLore);
          }
        } catch (e) {
          console.error('[SobreLore] Error carregant dades de la sessió:', e);
        }
      }

      if (url) {
        // Pre-carregar i pre-decodificar la imatge (molt important per a fitxers pesats com el de 4MB)
        const img = new Image();
        img.src = url;
        try {
          // Això prepara la imatge en memòria abans que la transició comenci
          if (img.decode) await img.decode();
        } catch (e) {
          console.warn('[SobreLore] Error pre-decodificant imatge:', e);
        }
        this.cartaLoreUrl = url;
      }
    },

    obrirSobre() {
      if (this.sobreObert) return;
      this.sobreObert = true;
      // La carta surt del sobre amb un petit retard per deixar veure el sobre obert primer
      setTimeout(() => { this.cartaVisible = true; }, 500);
    },

    async continuarAlPersonatge() {
      this.mostrarCarta = true;

      if (this.sessioId === 'inicial') {
        // Marcar com a vist al backend
        const usuariRaw = localStorage.getItem('usuari');
        if (usuariRaw) {
          const usuari = JSON.parse(usuariRaw);
          try {
            const res = await fetch(`${this.baseUrl}/api/usuari/marcar-lore-vist/${usuari._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
              const data = await res.json();
              // Actualitzar estat global i localStorage
              const nouUsuari = { ...usuari, lore_inicial_vist: true };
              const { login } = useAuth();
              login(nouUsuari);
            }
          } catch (e) {
            console.error('[SobreLore] Error marcant lore inicial com a vist:', e);
          }
        }

        setTimeout(() => {
          this.$router.push('/');
        }, 500);
        return;
      }

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

.text-misteri-especial {
  font-family: 'Georgia', serif;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(188, 133, 171, 0.6);
}

.text-subtitol-especial {
  font-family: 'Georgia', serif;
  color: #d4a8c7;
  font-size: 0.9rem;
  font-style: italic;
  letter-spacing: 0.05em;
  text-align: center;
  opacity: 0.9;
}

.capsalera-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 20px;
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
  will-change: transform;
}

.sobre-container:not(.obert):hover {
  transform: scale(1.04) translateY(-4px);
}

.sobre-imatge {
  width: min(340px, 88vw);
  object-fit: contain;
  border-radius: 4px;
  filter: drop-shadow(0 12px 40px rgba(180, 100, 160, 0.35));
  transition: opacity 0.1s ease; /* Transició ultra-ràpida per suavitzar el canvi */
}

.hidden-image {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* ── Overlay carta ── */
.carta-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 8, 28, 0.96); /* Un pel més opac per compensar la falta de blur */
  will-change: opacity;
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
  will-change: transform, opacity;
  transform: translateZ(0); /* Forçar acceleració GPU */
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
.fade-in-enter-active {
  transition: opacity 1s ease;
}
.fade-in-enter-from {
  opacity: 0;
}

.fade-out-leave-active {
  transition: opacity 0.4s ease;
}
.fade-out-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.fade-up-enter-active {
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.carta-surt-enter-active {
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out;
}
.carta-surt-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.9); /* Surt des de baix de forma més natural */
}
</style>
