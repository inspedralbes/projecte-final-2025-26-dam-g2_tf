<template>
  <div class="min-h-screen bg-gradient-to-b from-[#1a0a1f] to-black text-white font-sans pb-24">
    
    <!-- Header -->
    <header class="p-4 flex items-center justify-between sticky top-0 bg-[#1a0a1f]/80 backdrop-blur-md z-50 border-b border-white/5">
      <button @click="$router.back()" class="text-[#f5cbdd] hover:text-white flex items-center font-bold text-sm transition-colors group">
        <span class="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> TORNAR
      </button>
      <h1 class="text-lg font-bold tracking-widest text-[#f5cbdd] uppercase">PERFIL D'EXPLORADOR</h1>
      <div class="w-8"></div>
    </header>

    <main v-if="user" class="p-4 max-w-md mx-auto space-y-6 animate-fade-in">
      
      <!-- User Card -->
      <section class="relative bg-[#402749] rounded-3xl p-8 shadow-2xl overflow-hidden border border-[#f5cbdd]/10 text-center">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-[#bc85ab] to-[#5d3962] p-1 mx-auto mb-4 shadow-lg">
          <div class="w-full h-full rounded-full bg-[#1a0a1f] flex items-center justify-center text-3xl font-black text-white overflow-hidden">
            <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover" />
            <span v-else>{{ user.nom_usuari?.charAt(0).toUpperCase() }}</span>
          </div>
        </div>

        <h2 class="text-3xl font-black text-white tracking-tight leading-none mb-2">
          {{ user.nom_usuari }}
        </h2>
        <p class="inline-block bg-[#bc85ab] text-[#1a0a1f] text-[10px] font-black px-4 py-1 rounded-full uppercase mb-4">
          {{ user.nivell || 'Explorador Novell' }}
        </p>

        <div class="text-[#d9a6c2]/80 text-sm italic px-6 mb-6">
          "{{ user.bio || 'Aquest explorador encara no ha escrit la seva biografia.' }}"
        </div>
<div v-if="usuariLoguejat && usuariLoguejat._id !== user._id" class="mb-6">
  <button 
    @click="gestionarAmistat"
    :disabled="estatAmistat === 'pendent' || estatAmistat === 'amics'"
    :class="[
      'w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg',
      estatAmistat === 'cap' ? 'bg-[#f5cbdd] text-[#402749] active:scale-95' : '',
      estatAmistat === 'pendent' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : '',
      estatAmistat === 'amics' ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default' : ''
    ]"
  >
    <span v-if="estatAmistat === 'cap'">+ AFEGIR AMIC</span>
    <span v-if="estatAmistat === 'pendent'">SOL·LICITUD ENVIADA</span>
    <span v-if="estatAmistat === 'amics'">SOU AMICS</span>
  </button>
</div>
        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-black/20 p-4 rounded-2xl border border-white/5">
            <p class="text-2xl font-black">{{ user.punts || 0 }}</p>
            <p class="text-[9px] font-bold text-[#f5cbdd]/50 uppercase tracking-widest">Punts totals</p>
          </div>
          <div class="bg-black/20 p-4 rounded-2xl border border-white/5">
            <p class="text-2xl font-black">{{ user.inventari_cromos?.length || 0 }}</p>
            <p class="text-[9px] font-bold text-[#f5cbdd]/50 uppercase tracking-widest">Cromos</p>
          </div>
        </div>
      </section>

      <!-- Badges Section -->
      <section v-if="user.perfil_privat" class="bg-white/5 p-10 rounded-3xl border border-dashed border-white/10 text-center">
        <p class="text-gray-400 font-bold italic text-sm">Aquest usuari ha decidit mantenir la seva activitat privada.</p>
      </section>

      <section v-else class="space-y-4">
        <h3 class="text-[#f5cbdd] font-black italic uppercase text-lg px-2">Assoliments</h3>
        <div class="bg-[#2d1b33] p-6 rounded-3xl border border-white/5 flex gap-4 overflow-x-auto scrollbar-hide">
           <div v-for="n in 3" :key="n" class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl opacity-30 grayscale">
             🔒
           </div>
        </div>
      </section>

    </main>

    <div v-else class="flex flex-col items-center justify-center h-[70vh] opacity-50">
       <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5cbdd]"></div>
       <p class="mt-4 font-bold uppercase tracking-widest text-xs">Carregant perfil...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth'; // Importem el teu auth

const route = useRoute();
const { usuari: usuariLoguejat } = useAuth();
const user = ref(null);
const estatAmistat = ref('cap'); // 'cap', 'pendent', 'amics'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

onMounted(async () => {
  const userIdVisita = route.params.id;
  await carregarDadesPerfil(userIdVisita);
  comprovarEstatAmistat();
});

async function carregarDadesPerfil(id) {
  try {
    const res = await fetch(`${API_URL}/api/usuari/${id}`);
    if (res.ok) user.value = await res.json();
  } catch (err) { console.error(err); }
}

function comprovarEstatAmistat() {
  if (!usuariLoguejat.value || !user.value) return;
  
  // Si ja està a la llista d'amics
  if (user.value.amics?.includes(usuariLoguejat.value._id)) {
    estatAmistat.value = 'amics';
  } 
  // Si hi ha una sol·licitud enviada (hauries de guardar això a la BD de l'altre)
  else if (user.value.sollicituds_pendents?.some(s => s.id_usuari === usuariLoguejat.value._id)) {
    estatAmistat.value = 'pendent';
  }
}

async function gestionarAmistat() {
  if (estatAmistat.value !== 'cap') return;

  try {
    const res = await fetch(`${API_URL}/api/usuari/sollicitud-amistat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        de_id: usuariLoguejat.value._id,
        de_nom: usuariLoguejat.value.nom_usuari,
        per_a_id: user.value._id
      })
    });

    if (res.ok) {
      estatAmistat.value = 'pendent';
      alert("Sol·licitud enviada!");
    }
  } catch (err) {
    alert("Error enviant la sol·licitud");
  }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
