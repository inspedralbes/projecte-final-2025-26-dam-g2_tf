<template>
  <div class="p-4 max-w-lg mx-auto pb-32">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button @click="router.push('/')" class="text-2xl hover:text-gray-600 transition">
          ←
        </button>
        <h1 class="text-xl font-bold">NOVA PETICIÓ DE RUTA</h1>
      </div>

       <!-- Botón Perfil / Login -->
       <BotonPerfil @login="actualitzarUsuari" />
    </div>
    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ errorMessage }}
    </div>
    <form @submit.prevent="submitForm" class="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">Nom del lloc</label>
        <input 
          id="nom" 
          v-model="form.nom_proposat" 
          type="text" 
          placeholder="Ex: Castell de Montjuïc" 
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label for="desc" class="block text-sm font-medium text-gray-700 mb-1">Descripció del lloc</label>
        <textarea 
          id="desc" 
          v-model="form.motiu" 
          rows="4" 
          placeholder="Ex: Descripció del Castell de Montjuïc..." 
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Ubicació</label>
        <div class="flex gap-4 mb-4 border-b">
          <button 
            type="button"
            @click="metodeUbicacio = 'mapa'"
            :class="`pb-2 ${metodeUbicacio === 'mapa' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`"
          >
            Seleccionar al mapa
          </button>
          <button 
            type="button"
            @click="metodeUbicacio = 'manual'"
            :class="`pb-2 ${metodeUbicacio === 'manual' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`"
          >
            Escriure adreça
          </button>
        </div>
        <div v-show="metodeUbicacio === 'mapa'" class="space-y-2">
          <div id="mapSelect" class="w-full h-64 rounded-md border border-gray-300 z-0"></div>
          <p class="text-xs text-gray-500">Fes clic al mapa per marcar la ubicació.</p>
          <button 
            type="button" 
            @click="getLocation" 
            class="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            📍 Utilitzar la meva ubicació actual
          </button>
        </div>
        <div v-show="metodeUbicacio === 'manual'">
           <input 
            v-model="manualAddress" 
            type="text" 
            placeholder="Ex: Carrer de Mallorca, 401, Barcelona" 
            class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p class="text-xs text-gray-500 mt-1">S'intentarà guardar com a text si no es troben coordenades.</p>
        </div>
         <p v-if="form.ubicacio.length > 0 && metodeUbicacio === 'mapa'" class="text-xs text-gray-500 mt-2 bg-gray-50 p-1 rounded">
          Seleccionat: {{ form.ubicacio[0].toFixed(5) }}, {{ form.ubicacio[1].toFixed(5) }}
        </p>
      </div>
      <div>
        <label for="img" class="block text-sm font-medium text-gray-700 mb-1">Imatge (URL)</label>
        <input 
          id="img" 
          v-model="imgInput" 
          type="url" 
          @change="addImage"
          placeholder="https://exemple.com/imatge.jpg" 
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p class="text-xs text-gray-500 mt-1">Enganxa una URL i sortirà a sota.</p>
        <div v-if="form.fotos_proporcionades" class="mt-2 relative group w-full h-48 bg-gray-100 rounded overflow-hidden">
          <img :src="form.fotos_proporcionades" alt="Previsualització" class="w-full h-full object-cover" />
          <button 
            type="button" 
            @click="removeImage" 
            class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      </div>
      <button 
        type="submit" 
        :disabled="isSubmitting"
        class="w-full bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Enviant...' : 'Enviar Petició' }}
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
const successMessage = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const locationStatus = ref('Obtenir la meva ubicació actual');
const metodeUbicacio = ref('mapa'); 
const manualAddress = ref('');
const imgInput = ref('');

const { usuari, login } = useAuth();
const { obrirModal } = useLoginModal();
const usuariId = ref(null);

let map = null;
let marker = null;



const form = ref({
  nom_proposat: '',
  motiu: '',
  ubicacio: [], 
  fotos_proporcionades: '',
  id_usuari: ''
});

onMounted(() => {
  if (usuari.value) {
    form.value.id_usuari = usuari.value._id || usuari.value.id; 
    usuariId.value = usuari.value._id || usuari.value.id;
  }

  nextTick(() => {
    initMap();
  });
});

// Actualitzar form.id_usuari si l'usuari fa login després del mount
watch(usuari, (nou) => {
  if (nou) {
    form.value.id_usuari = nou._id || nou.id;
    usuariId.value = nou._id || nou.id;
  }
});

const actualitzarUsuari = (dadesUsuari) => {
  login(dadesUsuari);
  form.value.id_usuari = dadesUsuari._id || dadesUsuari.id;
  usuariId.value = dadesUsuari._id || dadesUsuari.id;
};

function initMap() {
  const barcelonaCoords = [41.3879, 2.16992];
  const mapDiv = document.getElementById('mapSelect');
  if (mapDiv) {
    map = L.map('mapSelect').setView(barcelonaCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
    map.on('click', (e) => {
      ponerMarcador(e.latlng.lat, e.latlng.lng);
    });
    setTimeout(() => { map.invalidateSize(); }, 100);
  }
}

function ponerMarcador(lat, lng) {
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.marker([lat, lng]).addTo(map);
  }
  form.value.ubicacio = [lat, lng];
}

function getLocation() {
  if (!navigator.geolocation) {
    alert("El teu navegador no suporta geolocalització.");
    return;
  }
  
  locationStatus.value = "Obtenint...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;      
      ponerMarcador(latitude, longitude);      
      if(map) map.setView([latitude, longitude], 16);
      locationStatus.value = "Ubicació obtinguda ✓";
    },
    (error) => {
      console.error(error);
      alert("No s'ha pogut obtenir la teva ubicació.");
      locationStatus.value = "Error";
    }
  );
}

function addImage() {
    if(imgInput.value) {
        form.value.fotos_proporcionades = imgInput.value;
    }
}

function removeImage() {
    form.value.fotos_proporcionades = '';
    imgInput.value = '';
}

async function submitForm() {
  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (!form.value.id_usuari) {
      // Mostrem el modal de login en lloc d'un missatge d'error text
      obrirModal('Per enviar una petició de ruta, has d\'iniciar sessió primer. És ràpid!');
      isSubmitting.value = false;
      return;
  }

  const datosAEnviar = { ...form.value };

  if (metodeUbicacio.value === 'manual' && manualAddress.value) {
      datosAEnviar.motiu = `[Adreça: ${manualAddress.value}] \n${datosAEnviar.motiu}`;      
      datosAEnviar.ubicacio = []; 
  }

  try {
    const response = await fetch(`${API_URL}/api/peticions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosAEnviar)
    });

    const data = await response.json();

    if (response.ok) {
      successMessage.value = 'Petició enviada correctament!';
      form.value.nom_proposat = '';
      form.value.motiu = '';
      form.value.ubicacio = [];
      form.value.fotos_proporcionades = '';
      manualAddress.value = '';
      imgInput.value = '';
      
      if(marker) {
        marker.remove();
        marker = null;
      }
      
      setTimeout(() => { successMessage.value = ''; }, 3000);

    } else {
      errorMessage.value = data.message || 'Error al enviar la petició.';
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Error de connexió amb el servidor.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>