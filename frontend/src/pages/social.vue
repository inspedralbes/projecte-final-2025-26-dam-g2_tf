<template>
  <div class="min-h-screen bg-[#f5cbdd]/30 pb-24 font-sans text-gray-800">
    <!-- Encapçalament Premium -->
    <header class="bg-gradient-to-br from-[#402749] via-[#5d3962] to-[#804f7f] text-white p-8 rounded-b-[50px] shadow-2xl mb-8 relative overflow-hidden">
      <!-- Decoració de fons -->
      <div class="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-10%] left-[-5%] w-40 h-40 bg-pink-500/10 rounded-full blur-2xl"></div>

      <div class="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 class="text-4xl font-black italic uppercase tracking-tighter leading-none">Social</h1>
          <p class="text-[#f5cbdd] text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Comunitat d'Exploradors</p>
        </div>
        <button @click="router.push('/')" class="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-90">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      <!-- Card d'usuari integrat -->
      <div v-if="usuariLoguejat" class="bg-white/10 backdrop-blur-md rounded-[30px] p-5 border border-white/10 shadow-inner flex items-center gap-5 relative z-10 transition-all hover:bg-white/15">
        <div class="relative">
          <div class="w-20 h-20 bg-gradient-to-tr from-[#bc85ab] to-[#f5cbdd] rounded-[24px] flex items-center justify-center text-3xl font-black text-[#402749] shadow-lg transform -rotate-3 border-2 border-white/50">
            {{ usuariLoguejat.nom_usuari.charAt(0).toUpperCase() }}
          </div>
          <div class="absolute -bottom-1 -right-1 bg-green-400 w-5 h-5 rounded-full border-4 border-[#5d3962] shadow-sm"></div>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-black tracking-tight">{{ usuariLoguejat.nom_usuari }}</h2>
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <span class="bg-[#f5cbdd] text-[#402749] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{{ usuariLoguejat.nivell }}</span>
            <span class="text-white/80 text-sm font-bold flex items-center gap-1">
              <span class="text-yellow-300">★</span> {{ usuariLoguejat.punts }} pts
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Contingut amb Transició -->
    <main class="px-5 max-w-md mx-auto">
      
      <div v-if="!usuariLoguejat" class="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
        <div class="bg-white p-10 rounded-[40px] shadow-2xl border-b-8 border-[#9f6795] w-full">
          <div class="w-24 h-24 bg-[#f5cbdd]/30 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">�</div>
          <h2 class="text-3xl font-black text-[#402749] mb-4 uppercase italic">Zona Privada</h2>
          <p class="text-gray-500 mb-10 text-sm leading-relaxed font-medium">
            Registra't per afegir amics, participar en rànquings i crear sales multijugador.
          </p>
          <button 
            @click="obrirLogin" 
            class="w-full bg-[#5d3962] text-white py-5 rounded-[24px] font-black shadow-xl shadow-purple-200 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
          >
            Accedir-hi
          </button>
        </div>
      </div>

      <div v-else class="space-y-8 animate-slide-up">
        
        <!-- Selecció de Secció (Custom Tabs) -->
        <nav class="flex p-1.5 bg-white/50 backdrop-blur rounded-[25px] border border-white shadow-sm ring-1 ring-black/5">
          <button 
            v-for="tab in ['amics', 'ranquing', 'invitacions']" 
            :key="tab"
            @click="pestanyaActiva = tab"
            :class="[
              'flex-1 py-3.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden',
              pestanyaActiva === tab ? 'bg-[#5d3962] text-white shadow-lg scale-[1.02]' : 'text-gray-400 hover:text-[#5d3962]'
            ]"
          >
            <span class="relative z-10">{{ tab }}</span>
            <div v-if="tab === 'invitacions' && invitacionsPendents.length > 0" class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </button>
        </nav>

        <!-- PESTANYA: AMICS -->
        <section v-if="pestanyaActiva === 'amics'" class="space-y-6">
          <!-- Cercador / Afegir -->
          <div class="group">
            <div class="bg-white p-1 rounded-[30px] shadow-sm border border-gray-100 flex items-center transition-all focus-within:ring-2 ring-[#9f6795]/20 focus-within:shadow-md">
              <input 
                v-model="nouAmicInput"
                type="text" 
                placeholder="Busca per nom d'usuari..." 
                class="flex-1 bg-transparent border-none px-6 py-4 text-sm font-bold focus:outline-none placeholder:text-gray-300"
              >
              <button 
                @click="afegirAmic"
                class="bg-[#9f6795] text-white w-12 h-12 rounded-[22px] flex items-center justify-center font-black text-xl shadow-lg active:scale-90 transition-all mr-1"
              >
                +
              </button>
            </div>
          </div>

          <!-- Llista d'Amics -->
          <div class="space-y-4">
            <div class="flex justify-between items-end px-2">
              <h3 class="text-[#402749] font-black italic uppercase text-xl">Els teus amics</h3>
              <span class="text-[10px] font-black text-[#9f6795] bg-[#9f6795]/10 px-3 py-1 rounded-full uppercase">{{ amics.length }} total</span>
            </div>

            <div v-if="amics.length === 0" class="bg-white/40 p-12 rounded-[40px] border-4 border-dashed border-gray-200 text-center">
              <div class="text-4xl mb-4 opacity-30">🤝</div>
              <p class="text-gray-400 font-bold text-sm italic">Encara no tens contactes...</p>
            </div>

            <div v-else class="grid gap-3">
              <div v-for="amic in amics" :key="amic._id" class="bg-white p-5 rounded-[30px] shadow-sm border border-gray-50 flex items-center gap-4 transition-all hover:translate-x-1 group">
                <div class="w-14 h-14 bg-gradient-to-br from-[#f5cbdd] to-[#d9a6c2] rounded-[20px] flex items-center justify-center font-black text-[#5d3962] shadow-sm border-2 border-white">
                  {{ amic.nom_usuari.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1">
                  <p class="font-black text-gray-800 tracking-tight">{{ amic.nom_usuari }}</p>
                  <p class="text-[10px] text-[#9f6795] font-black uppercase tracking-widest">{{ amic.nivell }}</p>
                </div>
                <div class="flex gap-2">
                  <button 
                    @click="obrirMenuInvitacio(amic)"
                    class="bg-[#804f7f] text-white p-3 rounded-2xl shadow-md hover:bg-[#5d3962] active:scale-90 transition-all"
                    title="Convidar a sala"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PESTANYA: RÀNQUING -->
        <section v-if="pestanyaActiva === 'ranquing'" class="space-y-6">
          <!-- Privadesa Toggle -->
          <div class="bg-[#402749] text-white p-6 rounded-[35px] shadow-xl relative overflow-hidden">
            <div class="relative z-10 flex justify-between items-center">
              <div>
                <p class="text-[10px] uppercase font-black tracking-widest text-[#f5cbdd] mb-1">Privadesa del Perfil</p>
                <p class="text-sm font-bold opacity-80">{{ usuariLoguejat.privat ? 'Perfil ocult al rànquing' : 'Visible globalment' }}</p>
              </div>
              <button 
                @click="usuariLoguejat.privat = !usuariLoguejat.privat"
                class="w-14 h-8 bg-white/10 rounded-full relative transition-colors p-1"
                :class="{'bg-green-500/50': !usuariLoguejat.privat}"
              >
                <div class="w-6 h-6 bg-white rounded-full transition-transform" :class="{'translate-x-6': !usuariLoguejat.privat}"></div>
              </button>
            </div>
          </div>

          <!-- Top Llista -->
          <div class="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-50 flex justify-between items-center">
               <h3 class="font-black text-[#5d3962] uppercase italic tracking-tighter text-xl">Top Exploradors</h3>
               <div class="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">BARCELONA</div>
            </div>
            
            <div class="divide-y divide-gray-50">
              <div v-for="(jugador, index) in ranquing" :key="index" 
                :class="[
                  'p-5 flex items-center justify-between transition-colors',
                  jugador.nom_usuari === usuariLoguejat.nom_usuari ? 'bg-[#f5cbdd]/20' : '',
                  index === 0 ? 'bg-yellow-50/30' : ''
                ]"
              >
                <div class="flex items-center gap-4">
                  <div class="w-8 flex justify-center">
                    <span v-if="index === 0" class="text-2xl">🥇</span>
                    <span v-else-if="index === 1" class="text-2xl">🥈</span>
                    <span v-else-if="index === 2" class="text-2xl">🥉</span>
                    <span v-else class="font-black text-gray-300 italic text-lg">#{{ index + 1 }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-[12px] flex items-center justify-center font-black text-gray-400 border border-gray-200 text-xs">
                      {{ jugador.nom_usuari.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-black text-gray-800 text-sm tracking-tight">{{ jugador.nom_usuari }}</p>
                      <p class="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">{{ jugador.nivell }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-black text-[#5d3962] text-sm">{{ jugador.punts }}</p>
                  <p class="text-[8px] font-black text-[#9f6795] uppercase">punts</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PESTANYA: INVITACIONS / SALES -->
        <section v-if="pestanyaActiva === 'invitacions'" class="space-y-6">
          <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
             <h3 class="text-2xl font-black text-[#402749] italic uppercase tracking-tighter mb-6">Sales d'Equip</h3>
             
             <!-- Invitacions Pendents -->
             <div v-if="invitacionsPendents.length > 0" class="space-y-3 mb-8">
               <p class="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 mb-2">Novas Invitacions ({{ invitacionsPendents.length }})</p>
               <div v-for="inv in invitacionsPendents" :key="inv.id" class="bg-red-50 p-4 rounded-[25px] border border-red-100 flex items-center justify-between">
                 <div class="flex items-center gap-3">
                   <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">✉️</div>
                   <div>
                     <p class="text-xs font-bold text-gray-800">De: <span class="text-[#5d3962]">{{ inv.de }}</span></p>
                     <p class="text-[10px] text-gray-500">{{ inv.tipus }} • {{ inv.sala }}</p>
                   </div>
                 </div>
                 <div class="flex gap-1">
                   <button @click="acceptarInvitacio(inv)" class="bg-[#5d3962] text-white p-2 rounded-xl text-xs font-bold shadow-sm">✓</button>
                   <button @click="rebutjarInvitacio(inv)" class="bg-white text-gray-400 p-2 rounded-xl text-xs font-bold border border-gray-200 text-xs">✕</button>
                 </div>
               </div>
             </div>

             <!-- Crear Sala -->
             <button class="w-full py-5 bg-gradient-to-r from-[#9f6795] to-[#bc85ab] text-white rounded-[25px] font-black uppercase tracking-[0.1em] text-sm shadow-xl shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all mb-4">
               + Crear Nova Sala
             </button>
             <p class="text-center text-[10px] text-gray-400 font-bold italic">Crea una sala i convida als teus amics per jugar en equip o competitiu.</p>
          </div>
        </section>

      </div>
    </main>

    <!-- Modal d'Invitació (Mockup) -->
    <div v-if="mostrantModalInvitacio" class="fixed inset-0 bg-[#402749]/80 backdrop-blur-sm z-50 flex items-end justify-center">
       <div class="bg-white w-full max-w-md rounded-t-[50px] p-10 animate-slide-up shadow-2xl">
          <div class="w-20 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
          <h3 class="text-3xl font-black text-[#402749] mb-2 uppercase italic">Convidar a {{ amicSeleccionat.nom_usuari }}</h3>
          <p class="text-gray-500 text-sm mb-10 font-medium">Tria el mode de joc per a la vostra partida:</p>
          
          <div class="grid gap-4 mb-10">
            <button @click="convidar('Competitiu')" class="flex items-center gap-6 p-6 rounded-[30px] border-2 border-[#f5cbdd] hover:bg-[#f5cbdd]/20 transition-all text-left group">
              <div class="text-4xl group-hover:scale-125 transition-transform">⚔️</div>
              <div>
                 <p class="font-black text-[#5d3962] uppercase tracking-tighter">Mode Competitiu</p>
                 <p class="text-[10px] text-gray-400 font-bold uppercase">Qui trobi la foto primer guanya!</p>
              </div>
            </button>
            <button @click="convidar('Equip')" class="flex items-center gap-6 p-6 rounded-[30px] border-2 border-[#e0f2fe] hover:bg-[#e0f2fe]/20 transition-all text-left group">
              <div class="text-4xl group-hover:scale-125 transition-transform">🤝</div>
              <div>
                 <p class="font-black text-blue-600 uppercase tracking-tighter">Mode en Equip</p>
                 <p class="text-[10px] text-gray-400 font-bold uppercase">Ajudeu-vos a trobar l'angle perfecte.</p>
              </div>
            </button>
          </div>
          
          <button @click="mostrantModalInvitacio = false" class="w-full text-gray-400 font-black uppercase text-xs tracking-widest py-2 hover:text-red-400 transition">Cancel·lar</button>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const usuariLoguejat = ref(null);
const pestanyaActiva = ref('amics'); 
const nouAmicInput = ref('');
const mostrantModalInvitacio = ref(false);
const amicSeleccionat = ref(null);

// DADES MOCK (D’acord amb el format JSON proporcionat)
const mockAmics = [
  { _id: "ID_usuari_2", nom_usuari: "Marta_Explorer", nivell: "Mestre Urbà", punts: 850 },
  { _id: "ID_usuari_3", nom_usuari: "Jordi_History", nivell: "Explorador Novell", punts: 120 },
  { _id: "ID_usuari_4", nom_usuari: "Barna_Lover", nivell: "Explorador", punts: 340 }
];

const mockRanquingGlobal = [
  { nom_usuari: "SuperAnna", nivell: "Llegenda", punts: 2500 },
  { nom_usuari: "Marta_Explorer", nivell: "Mestre Urbà", punts: 850 },
  { nom_usuari: "Barna_Lover", nivell: "Explorador", punts: 340 },
  { nom_usuari: "PereViatger", nivell: "Explorador", punts: 320 },
  { nom_usuari: "usuari_1", nivell: "Explorador Novell", punts: 100 },
  { nom_usuari: "Jordi_History", nivell: "Explorador Novell", punts: 120 },
].sort((a,b) => b.punts - a.punts);

const invitacionsPendents = ref([
  { id: 1, de: 'Marta_Explorer', tipus: 'Competitiu', sala: 'RABASSADA-4' }
]);

const amics = ref([]);
const ranquing = ref(mockRanquingGlobal);

onMounted(() => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      // Assegurem camps requerits pel PDF
      if (!parsedUser.punts) parsedUser.punts = 100;
      if (!parsedUser.nivell) parsedUser.nivell = 'Explorador Novell';
      if (parsedUser.privat === undefined) parsedUser.privat = false;
      
      usuariLoguejat.value = parsedUser;
      
      // Carregar amics (simulat)
      amics.value = mockAmics;
    } catch (e) {
      console.error("Error dades usuari", e);
    }
  }
});

function obrirLogin() {
  window.dispatchEvent(new CustomEvent('obrir-login'));
}

function afegirAmic() {
  if (!nouAmicInput.value) return;
  alert(`Sol·licitud d'amistat enviada a: ${nouAmicInput.value}`);
  nouAmicInput.value = '';
}

function obrirMenuInvitacio(amic) {
  amicSeleccionat.value = amic;
  mostrantModalInvitacio.value = true;
}

function convidar(mode) {
  alert(`Has convidat a ${amicSeleccionat.value.nom_usuari} a una partida en mode ${mode}!`);
  mostrantModalInvitacio.value = false;
}

function acceptarInvitacio(inv) {
  alert(`Acceptant invitació de ${inv.de}... Entrant a la sala ${inv.sala}`);
  invitacionsPendents.value = invitacionsPendents.value.filter(i => i.id !== inv.id);
}

function rebutjarInvitacio(inv) {
  invitacionsPendents.value = invitacionsPendents.value.filter(i => i.id !== inv.id);
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Efecte shimmer suau als botons */
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
