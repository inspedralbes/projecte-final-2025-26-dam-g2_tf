<template>
  <div class="min-h-screen bg-[#402749] flex flex-col items-center justify-center p-8 overflow-y-auto overflow-x-hidden">
    <!-- Fons sense gradients extres -->
    
    <div v-if="personatge" class="relative z-10 w-full max-w-sm flex flex-col items-center justify-center min-h-full py-12">
      
      <!-- CONTENIDOR DE LA CARTA (Només la carta) -->
      <div class="perspective-1000 w-full max-w-[320px] aspect-[2/3] min-h-[480px] mb-10 shadow-none">
        <div 
          class="card-inner w-full h-full shadow-none" 
          :class="{ 'is-flipped': isFlipped }"
          @click="isFlipped = true"
        >
          <!-- CARA DAVANT (ContraCarta) -->
          <div class="card-front w-full h-full flex items-center justify-center overflow-hidden bg-[#402749] shadow-none">
            <img 
              :src="contraCartaUrl" 
              alt="Contra Carta"
              class="w-full h-full object-cover shadow-none"
            />
            <!-- Overlay per incentivar el clic (revertit a l'interior) -->
            <div v-if="!isFlipped" class="absolute inset-0 flex flex-col items-center justify-center cursor-pointer shadow-none">
               <p class="text-white font-bold opacity-0 hover:opacity-80 transition-opacity tracking-widest text-xs uppercase text-center">Clica la carta</p>
            </div>
          </div>

          <!-- CARA DARRERE (Personatge) -->
          <div class="card-back w-full h-full flex items-center justify-center overflow-hidden bg-[#402749] shadow-none">
            <img 
              v-if="personatge.imatge" 
              :src="personatge.imatge" 
              :alt="personatge.nom"
              class="w-full h-full object-contain shadow-none"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-[#402749] text-indigo-300 shadow-none">
              <span class="text-6xl shadow-none">👤</span>
            </div>
          </div>
        </div>
      </div>

      <!-- INFORMACIÓ I BOTÓ (Fora de la carta, apareix en girar) -->
      <transition name="fade-up">
        <div v-if="isFlipped" class="w-full text-center space-y-10 shadow-none">
          
          <div class="px-2 shadow-none">
            <p class="text-white text-lg leading-relaxed font-medium shadow-none">
              {{ personatge.descripcio || 'No hi ha descripció disponible per a aquest personatge.' }}
            </p>
          </div>

          <button 
            @click="continuarAlMapa"
            class="w-full bg-white text-[#402749] font-black py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm shadow-none"
          >
            COMENÇAR A JUGAR
          </button>
        </div>
      </transition>

    </div>

    <div v-else class="text-white font-bold animate-pulse mt-20">
      Carregant el teu personatge...
    </div>
  </div>
</template>

<script>
import { netejarUrl } from '../utils/url';

export default {
  data() {
    return {
      sessioId: this.$route.params.sessioId,
      personatge: null,
      isFlipped: false,
      baseUrl: import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat',
      brandColor: '#402749'
    };
  },
  computed: {
    contraCartaUrl() {
      return netejarUrl(`${this.baseUrl}/personatges/ContraCarta.png`);
    }
  },
  async mounted() {
    const dadesGuardades = localStorage.getItem('carta_personatge_actual');
    if (dadesGuardades) {
      try {
        const parsed = JSON.parse(dadesGuardades);
        if (parsed.sessioId === this.sessioId) {
          this.personatge = parsed.personatge;
          return;
        }
      } catch (e) {
        console.error("Error parsejant dades de la carta:", e);
      }
    }
    
    // Si no hi ha dades al localStorage o el sessioId no coincideix, intentem carregar de l'API
    await this.carregarPersonatgeDeAPI();
  },
  methods: {
    async carregarPersonatgeDeAPI() {
      try {
        console.log("[CartaPersonatge] Intentant carregar de l'API per a la sessió:", this.sessioId);
        const res = await fetch(`${this.baseUrl}/api/sessionsJoc/${this.sessioId}`);
        if (res.ok) {
          const sessio = await res.json();
          // Busquem quin personatge té assignat l'usuari actual en aquesta sessió
          const userStr = localStorage.getItem('usuari');
          const userObj = userStr ? JSON.parse(userStr) : {};
          const perfilId = userObj._id;

          const jugador = sessio.jugadors.find(j => j.id_usuari._id === perfilId || j.id_usuari === perfilId);
          if (jugador && jugador.personatge_id) {
             const p = jugador.personatge_id;
             this.personatge = {
               nom: p.nom,
               descripcio: p.descripcio || '',
               imatge: netejarUrl(p.imatge)
             };
          } else {
             console.error("[CartaPersonatge] No s'ha trobat jugador o personatge a la sessió");
          }
        }
      } catch (e) {
        console.error("[CartaPersonatge] Error carregant de l'API:", e);
      }
    },
    continuarAlMapa() {
      this.$router.push('/mapa/' + this.sessioId);
    }
  }
};
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  cursor: pointer;
  box-shadow: none !important;
  outline: none !important;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
  cursor: default;
}

.card-front, .card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow: none !important;
  border: none !important;
}

.card-back {
  transform: rotateY(180deg);
}

/* Animacions de transició */
.fade-up-enter-active, .fade-up-leave-active {
  transition: all 0.6s ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.min-h-screen {
  font-family: 'Outfit', 'Inter', sans-serif;
}
</style>
