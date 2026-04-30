<template>
  <div v-if="visible" class="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-[#402749]/80 backdrop-blur-sm">
    
    <div class="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[#d9a6c2] animate-in fade-in zoom-in duration-300">
      <div class="p-8 space-y-6">
        
        <div class="flex justify-center">
          <div class="bg-[#f5cbdd] p-4 rounded-full">
            <span class="text-4xl">⚠️</span>
          </div>
        </div>

        <h2 class="text-2xl font-black text-[#402749] text-center uppercase tracking-tight">
          Avís de Seguretat i Privacitat
        </h2>

        <div class="space-y-4 text-gray-600 text-sm leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          <p class="font-bold text-[#804f7f]">Si us plau, llegeix atentament abans de continuar:</p>
          
          <ul class="space-y-3">
            <li class="flex gap-2">
              <span>📍</span>
              <span><strong>Seguretat Física:</strong> Estigues sempre atent al teu entorn. No entris en zones prohibides, perilloses o privades per fer una fotografia.</span>
            </li>
            <li class="flex gap-2">
              <span>👥</span>
              <span><strong>Privacitat:</strong> No capturis imatges de persones desconegudes sense el seu consentiment.</span>
            </li>
            <li class="flex gap-2">
              <span>🔞</span>
              <span><strong>Majors d'edat:</strong> Aquesta app inclou anàlisi facial per verificar que l'usuari és major de 18 anys.</span>
            </li>
            <li class="flex gap-2">
              <span>🛡️</span>
              <span><strong>Dades:</strong> Les coordenades GPS només s'utilitzen per validar la teva posició en el joc i no es compartiran amb tercers.</span>
            </li>
          </ul>
        </div>

        <div class="pt-4">
          <button 
            @click="acceptar" 
            class="w-full bg-[#9f6795] hover:bg-[#804f7f] text-white font-black py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 uppercase tracking-widest"
          >
            Ho entenc i accepto
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['acceptat']);

// Estat per controlar la visibilitat del modal
const visible = ref(true);

/**
 * Desa l'acceptació al localStorage i tanca el modal
 */
const acceptar = () => {
  localStorage.setItem('disclaimer_acceptat', 'true');
  visible.value = false;
  emit('acceptat');
};

/**
 * En muntar el component, comprovem si l'usuari ja ha acceptat prèviament
 */
onMounted(() => {
  const acceptat = localStorage.getItem('disclaimer_acceptat');
  
  // Si no existeix la clau al navegador, mostrem el modal obligatori
  if (acceptat) {
    visible.value = false;
    emit('acceptat');
  } else {
    visible.value = true;
  }
});
</script>

<style scoped>
/* Estils per a la barra de desplaçament personalitzada amb els colors del projecte */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f5cbdd;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d9a6c2;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #bc85ab;
}

/* Animacions d'entrada senzilles per a Tailwind */
.animate-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>