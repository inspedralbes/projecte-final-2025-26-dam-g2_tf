<template>
  <div class="p-4 max-w-lg mx-auto pb-32">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4 text-white">
        <button @click="router.push('/')" class="text-3xl hover:text-gray-300 transition pb-1">
          ←
        </button>
        <h1 class="text-3xl font-black italic uppercase tracking-tighter text-white">PROPOSAR RUTA</h1>
      </div>
      <BotonPerfil @login="actualitzarUsuari" />
    </div>



    <!-- SECCIÓ NOVA RUTA (FORMULARI) -->
    <form @submit.prevent="submitForm" class="space-y-6 bg-white p-6 rounded-3xl shadow-md border border-gray-50">
      <h2 class="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Proposar un lloc nou</h2>
      <div>
        <label for="nom" class="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nom del lloc</label>
        <input id="nom" v-model="form.nom_proposat" type="text" placeholder="Ex: Castell de Montjuïc" class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-gray-200 outline-none font-medium" required />
      </div>
      <div>
        <label for="desc" class="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Descripció</label>
        <textarea id="desc" v-model="form.motiu" rows="3" placeholder="Per què vols que estigui a l'app?" class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-gray-200 outline-none font-medium resize-none" required></textarea>
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Ubicació</label>
        <div class="flex gap-4 mb-4">
          <button type="button" @click="metodeUbicacio = 'mapa'" :class="`pb-1 text-xs font-black uppercase tracking-widest ${metodeUbicacio === 'mapa' ? 'text-black border-b-2 border-black' : 'text-gray-300'}`">MAPA</button>
          <button type="button" @click="metodeUbicacio = 'manual'" :class="`pb-1 text-xs font-black uppercase tracking-widest ${metodeUbicacio === 'manual' ? 'text-black border-b-2 border-black' : 'text-gray-300'}`">MANUAL</button>
        </div>
        <div v-show="metodeUbicacio === 'mapa'" class="space-y-2">
          <div id="mapSelect" class="w-full h-64 rounded-3xl border border-gray-100 z-0 overflow-hidden shadow-inner"></div>
          <button type="button" @click="getLocation" class="text-[10px] font-black text-[#804f7f] uppercase tracking-widest hover:underline px-2">📍 Utilitzar la meva ubicació</button>
        </div>
        <div v-show="metodeUbicacio === 'manual'">
           <input v-model="manualAddress" type="text" placeholder="Adreça completa..." class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-gray-200 outline-none font-medium" />
        </div>
      </div>
      <button 
        type="submit" 
        :disabled="isSubmitting"
        class="w-full bg-[#402749] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#5d3962] transition-colors disabled:opacity-50"
      >
        {{ isSubmitting ? 'ENVIANT...' : 'ENVIAR PROPOSTA' }}
      </button>
    </form>
    <!-- Custom Modal -->
    <div v-if="customModal.show" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transform transition-all text-center">
        <h3 class="text-xl font-black text-[#402749] mb-4 tracking-tighter">{{ customModal.title }}</h3>
        <p class="text-gray-600 mb-8 font-medium">{{ customModal.message }}</p>
        
        <div class="flex gap-4 justify-center">
          <button @click="handleModalConfirm" class="flex-1 py-3 px-4 bg-[#402749] text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#402749]/80 transition-colors shadow-lg shadow-purple-900/20">
            D'acord
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useLoginModal } from '../composables/useLoginModal';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css'; 
import BotonPerfil from '../components/BotonPerfil.vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const router = useRouter();
const { usuari, login } = useAuth();
const { obrirModal } = useLoginModal();

const isSubmitting = ref(false);

// --- Custom Modal Logic ---
const customModal = ref({ show: false, title: '', message: '' });
function showCustomAlert(message, title = 'Avís') {
  customModal.value = { show: true, title, message };
}
function handleModalConfirm() {
  customModal.value.show = false;
}

const metodeUbicacio = ref('mapa'); 
const manualAddress = ref('');

const form = ref({
  nom_proposat: '',
  motiu: '',
  ubicacio: [], 
  fotos_proporcionades: '',
  id_usuari: ''
});

let map = null;
let marker = null;

onMounted(() => {
  if (usuari.value) {
    form.value.id_usuari = usuari.value._id;
  }
  nextTick(() => { initMap(); });
});

watch(usuari, (nou) => {
  if (nou) {
    form.value.id_usuari = nou._id;
  }
});

const actualitzarUsuari = (dades) => { login(dades); };

function initMap() {
  const barcelonaCoords = [41.3879, 2.16992];
  const mapDiv = document.getElementById('mapSelect');
  if (mapDiv && !map) {
    map = L.map('mapSelect').setView(barcelonaCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    map.on('click', (e) => { ponerMarcador(e.latlng.lat, e.latlng.lng); });
  }
}

function ponerMarcador(lat, lng) {
  if (marker) marker.setLatLng([lat, lng]);
  else marker = L.marker([lat, lng]).addTo(map);
  form.value.ubicacio = [lat, lng];
}

function getLocation() {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    ponerMarcador(latitude, longitude);
    if(map) map.setView([latitude, longitude], 16);
  });
}

async function submitForm() {
  if (!form.value.id_usuari) {
    obrirModal('Inicia sessió primer!');
    return;
  }
  isSubmitting.value = true;
  try {
    const datos = { ...form.value };
    if (metodeUbicacio.value === 'manual' && manualAddress.value) {
      datos.motiu = `[Adreça: ${manualAddress.value}] \n${datos.motiu}`;      
      datos.ubicacio = []; 
    }
    const res = await fetch(`${API_URL}/api/peticions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (res.ok) {
      showCustomAlert('La teva petició ha estat enviada amb èxit i està pendent de revisió.', 'Petició enviada!');
      form.value.nom_proposat = '';
      form.value.motiu = '';
      if(marker) { marker.remove(); marker = null; }
    } else {
      showCustomAlert('Hi ha hagut un error en enviar la petició.', 'Error');
    }
  } catch (err) {
    showCustomAlert('Error de connexió.', 'Error');
  } finally { isSubmitting.value = false; }
}
</script>

<style scoped>
#mapSelect { min-height: 250px; }
</style>