<template>
  <div class="p-4 max-w-lg mx-auto pb-32">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button @click="router.push('/')" class="text-2xl hover:text-gray-600 transition">
          ←
        </button>
        <h1 class="text-xl font-bold uppercase tracking-tight">PETICIONS</h1>
      </div>
      <BotonPerfil @login="actualitzarUsuari" />
    </div>

    <!-- Segments / Tabs -->
    <div class="flex bg-gray-100 rounded-2xl p-1 mb-8">
      <button 
        @click="pestanyaActiva = 'amics'"
        :class="['flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all', 
                pestanyaActiva === 'amics' ? 'bg-white shadow-sm text-[#402749]' : 'text-gray-400']"
      >
        Amics
      </button>
      <button 
        @click="pestanyaActiva = 'rutes'"
        :class="['flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all', 
                pestanyaActiva === 'rutes' ? 'bg-white shadow-sm text-[#402749]' : 'text-gray-400']"
      >
        Rutes
      </button>
    </div>

    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ errorMessage }}
    </div>

    <!-- SECCIÓ SOL·LICITUDS D'AMISTAT -->
    <div v-if="pestanyaActiva === 'amics'" class="space-y-4">
      <div v-if="loadingAmics" class="text-center py-12">
        <div class="animate-spin text-2xl">🌀</div>
      </div>
      <div v-else-if="sollicituds.length > 0" class="space-y-3">
        <div 
          v-for="req in sollicituds" 
          :key="req.id_perfil" 
          class="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#f5cbdd] flex items-center justify-center font-black text-[#402749] border-2 border-white shadow-sm">
              {{ req.nom_usuari?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-black text-gray-800 tracking-tight">{{ req.nom_usuari }}</p>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Et vol afegir</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="gestionarSolicitud(req, 'acceptar')" 
              class="bg-[#402749] text-white p-3 rounded-2xl hover:bg-[#5d3962] transition-colors shadow-sm"
              title="Acceptar"
            >
              ✅
            </button>
            <button 
              @click="gestionarSolicitud(req, 'rebutjar')" 
              class="bg-gray-100 text-gray-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Rebutjar"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
        <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">No tens peticions pendents</p>
      </div>
    </div>

    <!-- SECCIÓ NOVA RUTA (FORMULARI ORIGINAL) -->
    <form v-else @submit.prevent="submitForm" class="space-y-6 bg-white p-6 rounded-3xl shadow-md border border-gray-50">
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

const pestanyaActiva = ref('amics');
const successMessage = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const metodeUbicacio = ref('mapa'); 
const manualAddress = ref('');
const imgInput = ref('');

const sollicituds = ref([]);
const loadingAmics = ref(false);

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
    carregarPeticionsPendents();
  }
  nextTick(() => { if (pestanyaActiva.value === 'rutes') initMap(); });
});

watch(pestanyaActiva, (nova) => {
  if (nova === 'rutes') {
    nextTick(() => { if (!map) initMap(); else setTimeout(() => map.invalidateSize(), 100); });
  } else {
    carregarPeticionsPendents();
  }
});

watch(usuari, (nou) => {
  if (nou) {
    form.value.id_usuari = nou._id;
    carregarPeticionsPendents();
  }
});

const actualitzarUsuari = (dades) => { login(dades); };

async function carregarPeticionsPendents() {
  if (!usuari.value) return;
  loadingAmics.value = true;
  try {
    const res = await fetch(`${API_URL}/api/usuari/${usuari.value._id}`);
    if (res.ok) {
      const dades = await res.json();
      sollicituds.value = dades.sollicituds_pendents || [];
    }
  } catch (err) {
    console.error("Error carregant peticions:", err);
  } finally {
    loadingAmics.value = false;
  }
}

async function gestionarSolicitud(req, accio) {
  try {
    const res = await fetch(`${API_URL}/api/social/peticions/${accio}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        el_meu_perfil_id: usuari.value._id,
        id_nou_amic_perfil: req.id_perfil,
        id_amic_perfil: req.id_perfil 
      })
    });
    if (res.ok) {
      successMessage.value = accio === 'acceptar' ? 'Amistat acceptada!' : 'Sol·licitud rebutjada';
      setTimeout(() => { successMessage.value = ''; }, 2000);
      carregarPeticionsPendents();
    }
  } catch (err) {
    console.error("Error gestió petició:", err);
  }
}

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
      successMessage.value = 'Petició enviada!';
      form.value.nom_proposat = '';
      form.value.motiu = '';
      if(marker) { marker.remove(); marker = null; }
    }
  } finally { isSubmitting.value = false; }
}
</script>

<style scoped>
#mapSelect { min-height: 250px; }
</style>