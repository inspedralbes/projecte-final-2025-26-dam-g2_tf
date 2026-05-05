<template>
  <Transition name="policia-entra">
    <div v-if="visible" class="derrota-pantalla">

      <!-- Fons amb efecte de reixa -->
      <div class="derrota-reixes">
        <div v-for="i in 6" :key="i" class="reixa-barra"></div>
      </div>

      <!-- Contingut principal -->
      <div class="derrota-inner">

        <!-- Badge superior -->
        <div class="derrota-badge">
          <span class="derrota-badge-text">⏱️ TEMPS ESGOTAT</span>
        </div>

        <!-- Carta del Policia -->
        <div class="derrota-carta-contenidor">
          <img
            :src="netejarUrl(baseApi + '/personatges/El policia.jpg')"
            alt="El Policia"
            class="derrota-carta-img"
          />
          <div class="derrota-carta-ombra"></div>
        </div>

        <!-- Missatge principal -->
        <div class="derrota-missatge">
          <h1 class="derrota-titol">Has Perdut</h1>
          <p class="derrota-subtitol">
            Passaràs la nit al <em>calabós</em>...
          </p>
          <p class="derrota-text">
            Ha passat massa temps. La policia t'ha enxampat i els malifets s'han fet amb la seva. No has conseguit protegir la ciutat.
          </p>
        </div>

        <!-- Botó -->
        <button @click="$emit('tornar-inici')" class="derrota-boto">
          TORNAR A L'INICI
        </button>

      </div>
    </div>
  </Transition>
</template>

<script>
import { netejarUrl } from '../utils/url';

export default {
  name: 'PantallaDerrota',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    baseApi: {
      type: String,
      default: 'https://north.dam.inspedralbes.cat'
    }
  },
  emits: ['tornar-inici'],
  methods: {
    netejarUrl
  }
};
</script>

<style scoped>
/* ── Layout principal ── */
.derrota-pantalla {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: #0d0008;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ── Reixes decoratives al fons ── */
.derrota-reixes {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-around;
  pointer-events: none;
  opacity: 0.06;
}

.reixa-barra {
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, #d9a6c2 20%, #d9a6c2 80%, transparent);
  animation: reixaApagada 3s ease-in-out infinite alternate;
}

.reixa-barra:nth-child(even) {
  animation-delay: 1.5s;
}

@keyframes reixaApagada {
  0%   { opacity: 0.4; }
  100% { opacity: 1; }
}

/* ── Contenidor interior ── */
.derrota-inner {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 32px 24px;
  width: 100%;
  max-width: 360px;
}

/* ── Badge ── */
.derrota-badge {
  background: rgba(255, 60, 60, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.4);
  border-radius: 50px;
  padding: 6px 20px;
  animation: badgePols 1.5s ease-in-out infinite;
}

@keyframes badgePols {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 60, 60, 0.3); }
  50%       { box-shadow: 0 0 0 8px rgba(255, 60, 60, 0); }
}

.derrota-badge-text {
  color: #ff7070;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* ── Carta del policia ── */
.derrota-carta-contenidor {
  position: relative;
  width: min(230px, 60vw);
  animation: cartaApareix 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 0.2s;
}

@keyframes cartaApareix {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.85) rotate(-4deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

.derrota-carta-img {
  width: 100%;
  border-radius: 12px;
  box-shadow:
    0 0 0 3px rgba(255, 80, 80, 0.3),
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 0 40px rgba(200, 40, 40, 0.2);
  display: block;
}

.derrota-carta-ombra {
  position: absolute;
  bottom: -12px;
  left: 10%;
  width: 80%;
  height: 20px;
  background: rgba(200, 30, 30, 0.25);
  border-radius: 50%;
  filter: blur(10px);
}

/* ── Missatge ── */
.derrota-missatge {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: missatgeApareixes 0.7s ease-out both;
  animation-delay: 0.6s;
}

@keyframes missatgeApareixes {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.derrota-titol {
  font-family: 'Georgia', serif;
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
  text-shadow: 0 0 30px rgba(255, 80, 80, 0.5);
}

.derrota-subtitol {
  font-family: 'Georgia', serif;
  font-size: 1.05rem;
  color: #d9a6c2;
  margin: 0;
  font-style: normal;
}

.derrota-subtitol em {
  font-style: italic;
  color: #ff9fb6;
  font-weight: 700;
}

.derrota-text {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 4px 0 0 0;
  letter-spacing: 0.04em;
}

/* ── Botó ── */
.derrota-boto {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #bc85ab, #804f7f);
  color: #fff;
  font-weight: 900;
  font-size: 0.9rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 8px 24px rgba(128, 79, 127, 0.4);
  animation: botoApareixes 0.5s ease-out both;
  animation-delay: 1s;
}

@keyframes botoApareixes {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.derrota-boto:hover {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 12px 32px rgba(128, 79, 127, 0.6);
}

.derrota-boto:active {
  transform: scale(0.97);
}

/* ── Transició d'entrada ── */
.policia-entra-enter-active {
  transition: opacity 0.5s ease;
}
.policia-entra-enter-from {
  opacity: 0;
}
</style>
