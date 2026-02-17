<template>
  <div class="p-4 bg-gray-50 min-h-screen">
    <nav class="flex justify-between mb-6">
      <h1 class="text-2xl font-black text-[#5d3962] italic uppercase">Social</h1>
      <button @click="router.push('/')" class="bg-white shadow px-4 py-1 rounded-full text-sm font-bold text-gray-600">Menú</button>
    </nav>

    <div v-if="!usuariLoguejat" class="flex flex-col items-center justify-center h-[60vh] text-center px-6">
      <div class="bg-white p-10 rounded-[40px] shadow-xl border-t-8 border-[#9f6795] max-w-sm">
        <div class="text-6xl mb-6">🤝</div>
        <h2 class="text-2xl font-black text-[#402749] mb-3 uppercase italic">Secció Privada</h2>
        <p class="text-gray-500 mb-8 leading-relaxed">
          Uneix-te a la comunitat per veure els amics, comparar col·leccions de cromos i compartir les teves rutes.
        </p>
        <button 
          @click="obrirLogin" 
          class="w-full bg-[#5d3962] text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-200 active:scale-95 transition-all uppercase tracking-widest"
        >
          Identifica't
        </button>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div class="flex items-center gap-4 mb-3">
          <div class="w-12 h-12 bg-[#f5cbdd] rounded-full flex items-center justify-center font-bold text-[#402749] border-2 border-white shadow-sm">
            U{{i}}
          </div>
          <div>
            <h3 class="font-black text-gray-800 text-sm">Explorador {{ i }}</h3>
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fa 2 hores</span>
          </div>
        </div>
        <p class="text-gray-600 text-sm leading-relaxed italic">
          "He aconseguit el cromo de la Sagrada Família després de completar la ruta històrica! Recomanat!"
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const usuariLoguejat = ref(null);

onMounted(() => {
  // Comprovem si l'usuari està al localStorage
  const user = localStorage.getItem('user');
  if (user) {
    usuariLoguejat.value = JSON.parse(user);
  }
});

// Funció per demanar a App.vue que obri el modal
function obrirLogin() {
  window.dispatchEvent(new CustomEvent('obrir-login'));
}
</script>
