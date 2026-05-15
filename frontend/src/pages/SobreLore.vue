<template>
  <transition name="fade-in">
    <div class="sobre-wrapper" :class="{ 'fase-carta': mostrarCarta }">

    <!-- ─────────── PANTALLA DE CÀRREGA ─────────── -->
    <transition name="fade-loading">
      <div v-if="!recursosCarregats" class="loading-overlay">
        <div class="loader-container">
          <div class="loader-ring"></div>
          <div class="loader-icon">✉️</div>
          <p class="loader-text">Muntant la teva aventura...</p>
        </div>
      </div>
    </transition>

    <!-- ─────────── FASE 1: SOBRE ─────────── -->
    <transition name="fade-out">
      <div v-if="recursosCarregats && !mostrarCarta" class="sobre-escena">

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
          
          <div class="carta-imatge-wrapper">
            <img
              v-if="cartaLoreUrl"
              :src="cartaLoreUrl"
              alt="Carta de lore"
              class="carta-lore-imatge"
              :class="{ 'imatge-carregada': cartaImatgeLlista }"
              @load="cartaImatgeLlista = true"
            />
            
            <!-- Skeleton mentre la carta (que pot ser pesada) carrega -->
            <div v-if="!cartaImatgeLlista" class="skeleton-carta">
              <div class="skeleton-shine"></div>
              <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          </div>

          <div v-if="!cartaLoreUrl" class="carta-sense-imatge">
            <p>Sense carta assignada per a aquesta ruta.</p>
          </div>

          <button @click="continuarAlPersonatge" class="boto-continuar" :class="{ 'visible': cartaImatgeLlista || !cartaLoreUrl }">
            {{ sessioId === 'inicial' ? "Començar l'aventura" : "Continuar" }}
          </button>
        </div>
        </div>
    </transition>

    <!-- NOTIFICACIÓ CROMO INICIAL -->
    <CromoInicialNotification 
      :visible="mostrarNotificacioCromo"
      @accept="finalitzarBenvinguda"
    />

    </div>
  </transition>
</template>

<script>
import { netejarUrl, BASE_API_URL } from '../utils/url';
import { useAuth } from '../composables/useAuth';
import CromoInicialNotification from '../components/CromoInicialNotification.vue';

export default {
  name: 'SobreLore',
  components: {
    CromoInicialNotification
  },
  data() {
    return {
      sessioId: this.$route.params.sessioId,
      baseUrl: BASE_API_URL,
      cartaLoreUrl: '',
      sobreObert: false,
      cartaVisible: false,
      mostrarCarta: false,
      mostrarTitol: false,
      recursosCarregats: false,
      cartaImatgeLlista: false,
      mostrarNotificacioCromo: false
    };
  },
  async mounted() {
    await this.prepararEscena();
    this.recursosCarregats = true;

    setTimeout(() => { this.mostrarTitol = true; }, 300);
    this.carregarCartaEnBackground();
  },
  methods: {
    async prepararEscena() {
      const imgTancat = new Image();
      imgTancat.src = netejarUrl(this.baseUrl + '/assets/Sobre/Sobre Tancat.png');
      
      try {
        if (imgTancat.decode) await imgTancat.decode();
        else await new Promise(r => imgTancat.onload = r);
      } catch (e) {
        console.warn('[SobreLore] Error carregant sobre:', e);
      }

      const imgSobre = new Image();
      imgSobre.src = netejarUrl(this.baseUrl + '/assets/Sobre/Sobre_Obert.png');
      if (imgSobre.decode) imgSobre.decode().catch(() => {});

      if (this.sessioId === 'inicial') {
        const imgCromo = new Image();
        imgCromo.src = netejarUrl('/CromoInicial.jpg');
        if (imgCromo.decode) imgCromo.decode().catch(() => {});
      }
    },

    // GET /api/sessionsJoc/:id: Obté les dades de la sessió
    async carregarCartaEnBackground() {
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
        this.cartaLoreUrl = url;
      }
    },

    obrirSobre() {
      if (this.sobreObert) return;
      this.sobreObert = true;
      setTimeout(() => { this.cartaVisible = true; }, 400);
    },

    async continuarAlPersonatge() {
      if (this.sessioId === 'inicial') {
        const usuariRaw = localStorage.getItem('usuari');
        if (usuariRaw) {
          const usuari = JSON.parse(usuariRaw);
          try {
            // PUT /api/usuari/marcar-lore-vist/:id: Marca el lore com a vist
            await fetch(`${this.baseUrl}/api/usuari/marcar-lore-vist/${usuari._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' }
            });
            const nouUsuari = { ...usuari, lore_inicial_vist: true };
            const { login } = useAuth();
            login(nouUsuari);
          } catch (e) {
            console.error('[SobreLore] Error marcant lore inicial:', e);
          }
        }
        this.mostrarNotificacioCromo = true;
        return;
      }

      this.mostrarCarta = true;
      setTimeout(() => { this.$router.push('/carta-personatge/' + this.sessioId); }, 500);
    },

    finalitzarBenvinguda() {
      this.$router.push('/');
    },

    netejarUrl
  }
};
</script>

<style scoped>
.sobre-wrapper {
  min-height: 100vh;
  background: #1a0e2e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

/* ── Pantalla de càrrega ── */
.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 500;
  background: #1a0e2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loader-ring {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(188, 133, 171, 0.2);
  border-top-color: #bc85ab;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader-icon {
  position: absolute;
  font-size: 24px;
  margin-top: 15px; /* Ajust per centrar dins el ring */
  animation: pulse-icon 2s ease-in-out infinite;
}

.loader-text {
  color: #bc85ab;
  font-family: 'Georgia', serif;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  opacity: 0.8;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse-icon { 
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
}

/* ── Escena del sobre ── */
.sobre-escena {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  width: 100%;
  padding: 24px;
}

.text-misteri {
  font-family: 'Georgia', serif;
  color: #d4a8c7;
  font-size: 1.1rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
}

.text-misteri-especial {
  font-family: 'Georgia', serif;
  color: #fff;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 0 0 20px rgba(188, 133, 171, 0.4);
}

.text-subtitol-especial {
  font-family: 'Georgia', serif;
  color: #d4a8c7;
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
  opacity: 0.8;
}

.text-instruccio {
  font-family: 'Georgia', serif;
  color: #a07090;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  animation: pols 2s ease-in-out infinite;
}

@keyframes pols {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* ── Sobre ── */
.sobre-container {
  cursor: pointer;
  position: relative;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sobre-container:not(.obert):hover {
  transform: scale(1.05) translateY(-5px);
}

.sobre-imatge {
  width: min(340px, 85vw);
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5));
  transition: opacity 0.2s ease;
}

.hidden-image {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

/* ── Overlay carta ── */
.carta-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(10, 5, 20, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.carta-overlay-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 420px;
}

.carta-imatge-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4.5;
  display: flex;
  justify-content: center;
}

.carta-lore-imatge {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.carta-lore-imatge.imatge-carregada {
  opacity: 1;
  transform: translateY(0);
}

/* ── Skeleton ── */
.skeleton-carta {
  position: absolute;
  inset: 0;
  background: #2a1a3a;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30px;
}

.skeleton-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: shine 1.5s infinite;
}

.skeleton-line {
  height: 12px;
  background: rgba(188, 133, 171, 0.1);
  border-radius: 6px;
  margin-bottom: 12px;
}

.skeleton-line.short { width: 60%; }

@keyframes shine { to { left: 100%; } }

/* ── Botó ── */
.boto-continuar {
  background: #bc85ab;
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 18px;
  width: 100%;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s ease;
}

.boto-continuar.visible {
  opacity: 1;
  transform: translateY(0);
}

.boto-continuar:active { transform: scale(0.96); }

/* ── Transicions ── */
.fade-in-enter-active { transition: opacity 0.8s ease; }
.fade-in-enter-from { opacity: 0; }

.fade-loading-leave-active { transition: opacity 0.5s ease; }
.fade-loading-leave-to { opacity: 0; }

.fade-out-leave-active { transition: opacity 0.4s ease; }
.fade-out-leave-to { opacity: 0; }

.slide-down-enter-active {
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease;
}
.slide-down-enter-from { opacity: 0; transform: translateY(-20px); }

.carta-surt-enter-active {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}
.carta-surt-enter-from { opacity: 0; transform: scale(0.95); }
</style>

