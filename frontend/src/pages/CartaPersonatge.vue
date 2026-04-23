<template>
  <div class="min-h-screen bg-indigo-950 flex items-center justify-center p-4 overflow-hidden">
    <!-- Fons amb gradient animat o subtil -->
    <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-900 opacity-50"></div>
    
    <div v-if="personatge" class="relative z-10 w-full max-w-sm">
      <!-- Contingut de la carta -->
      <div class="bg-white/10 backdrop-blur-md border-2 border-indigo-500/30 rounded-3xl p-6 shadow-2xl transform transition-all hover:scale-[1.02]">
        
        <div class="text-center mb-6">
          <h2 class="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-1">El teu personatge</h2>
          <h1 class="text-3xl font-black text-white drop-shadow-md">{{ personatge.nom }}</h1>
        </div>

        <!-- Imatge del personatge -->
        <div class="relative aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white/20 mb-6 bg-indigo-900/50">
          <img 
            v-if="personatge.imatge" 
            :src="personatge.imatge" 
            :alt="personatge.nom"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-indigo-300/40">
            <span class="text-6xl">👤</span>
          </div>
        </div>

        <!-- Descripció -->
        <div class="bg-black/20 rounded-xl p-4 mb-8">
          <p class="text-indigo-100 text-sm leading-relaxed italic">
            "{{ personatge.descripcio || 'No hi ha descripció disponible per a aquest personatge.' }}"
          </p>
        </div>

        <!-- Botó Continuar -->
        <button 
          @click="continuarAlMapa"
          class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span>CONTINUAR AL MAPA</span>
          <span class="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>

    <div v-else class="text-white">
      Carregant el teu personatge...
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sessioId: this.$route.params.sessioId,
      personatge: null
    };
  },
  mounted() {
    // Intentem recuperar les dades de la carta del localStorage que va guardar SalaEspera
    const dadesGuardades = localStorage.getItem('carta_personatge_actual');
    if (dadesGuardades) {
      try {
        const parsed = JSON.parse(dadesGuardades);
        // Només l'usem si és de la mateixa sessió
        if (parsed.sessioId === this.sessioId) {
          this.personatge = parsed.personatge;
        } else {
          // Si no coincideix, potser hauríem de redirigir o mostrar error
          this.$router.push('/');
        }
      } catch (e) {
        console.error("Error parsejant dades de la carta:", e);
        this.$router.push('/');
      }
    } else {
      // Si no hi ha dades, redirigim a l'índex per seguretat
      this.$router.push('/');
    }
  },
  methods: {
    continuarAlMapa() {
      // Netegem el localStorage quan marxem (opcional, potser millor deixar-ho per si recarrega)
      // localStorage.removeItem('carta_personatge_actual');
      this.$router.push('/mapa/' + this.sessioId);
    }
  }
};
</script>

<style scoped>
/* Animació de gradient suau */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.7; }
}

.min-h-screen {
  font-family: 'Outfit', 'Inter', sans-serif;
}
</style>
