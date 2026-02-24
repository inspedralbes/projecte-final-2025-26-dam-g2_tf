<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0">
    
    <AdminNav />

    <main class="flex-1 p-6 md:p-10">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-[#9f6795]">
          {{ mostrarFormulari ? 'Gestió de Lloc' : 'Llocs Històrics' }}
        </h1>
        <button @click="alternarFormulari" class="bg-[#9f6795] text-white px-6 py-2 rounded-lg font-bold">
          {{ mostrarFormulari ? 'Tornar a la llista' : '+ Nou Lloc' }}
        </button>
      </div>

      <div v-if="mostrarFormulari" class="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md border-t-4 border-[#804f7f]">
        
        <form @submit.prevent="guardarLloc" class="space-y-4">
          <input v-model="formulari.nom" placeholder="Nom del lloc" class="w-full border p-3 rounded-xl outline-none" required>
          <input v-model="formulari.imatge_portada" placeholder="URL de la imatge" class="w-full border p-3 rounded-xl outline-none" required>
          <textarea v-model="formulari.descripcio" placeholder="Descripció" class="w-full border p-3 rounded-xl outline-none" rows="4"></textarea>
          
          <div class="bg-gray-100 p-3 rounded-xl text-center text-xs font-mono">
            Ubicació: {{ formulari.lat.toFixed(4) }}, {{ formulari.lng.toFixed(4) }}
          </div>

          <button type="submit" class="w-full bg-[#9f6795] text-white py-4 rounded-xl font-bold uppercase shadow-md">
            {{ idEditant ? 'Actualitzar dades' : 'Crear nou lloc' }}
          </button>
        </form>

        <div class="space-y-2">
          <p class="text-xs font-bold text-gray-400 uppercase text-center">Arrossega el marcador al lloc correcte</p>
          <div id="mapSelector" class="h-80 lg:h-full min-h-[350px] rounded-xl border"></div>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr class="text-xs text-gray-400 uppercase text-left">
              <th class="p-4">Lloc</th>
              <th class="p-4 text-right">Accions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="lloc in llistaLlocs" :key="lloc._id" class="hover:bg-gray-50 transition">
              <td class="p-4 flex items-center gap-4">
                <img :src="lloc.imatge_referencia" class="h-12 w-16 object-cover rounded-lg">
                <span class="font-bold text-[#9f6795]">{{ lloc.nom }}</span>
              </td>
              <td class="p-4 text-right">
                <button @click="carregarEdicio(lloc)" 
                class="text-[#804f7f] hover:text-[#402749] font-bold mr-4 transition-colors"
                >
                  Editar
                </button>

                <button 
                  @click="eliminarLloc(lloc._id)" 
                  class="text-[#632a2a] hover:text-red-700 font-bold transition-colors"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import AdminNav from './components/AdminNav.vue';

// Imports marcador mapa
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Icones mapa corregides
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Variables d'estat
const llistaLlocs = ref([]);
const mostrarFormulari = ref(false);
const idEditant = ref(null);
const formulari = ref({ nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699 });

// Variables Mapa
let mapa = null;
let marcador = null;

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8088').replace(/\/$/, '');

onMounted(obtenirLlocs);

async function obtenirLlocs() {
  try {
    const resposta = await fetch(`${API_URL}/api/admin/llocs`);
    llistaLlocs.value = await resposta.json();
  } catch (error) {
    console.error("Error al obtenir els llocs:", error);
  }
}

async function guardarLloc() {
  const dadesPerEnviar = {
    nom: formulari.value.nom,
    descripcio: formulari.value.descripcio,
    imatge_referencia: formulari.value.imatge_portada,
    ubicacio: { type: 'Point', coordinates: [formulari.value.lng, formulari.value.lat] }
  };

  const url = idEditant.value 
    ? `${API_URL}/api/admin/llocs/${idEditant.value}` 
    : `${API_URL}/api/admin/llocs`;

  try {
    await fetch(url, {
      method: idEditant.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadesPerEnviar)
    });
    tancarIRefrescar();
  } catch (error) {
    console.error("Error al guardar el lloc:", error);
  }
}

async function eliminarLloc(id) {
  if (confirm("Segur que vols eliminar aquest lloc?")) {
    try {
      await fetch(`${API_URL}/api/admin/llocs/${id}`, { method: 'DELETE' });
      obtenirLlocs();
    } catch (error) {
      console.error("Error al eliminar el lloc:", error);
    }
  }
}

function alternarFormulari() {
  if (mostrarFormulari.value) {
    tancarIRefrescar();
  } else {
    obrirFormulariNou();
  }
}

function obrirFormulariNou() {
  idEditant.value = null;
  formulari.value = { nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699 };
  mostrarFormulari.value = true;
  iniciarMapa();
}

function carregarEdicio(lloc) {
  idEditant.value = lloc._id;
  formulari.value = {
    nom: lloc.nom,
    descripcio: lloc.descripcio,
    imatge_portada: lloc.imatge_referencia,
    lat: lloc.ubicacio.coordinates[1],
    lng: lloc.ubicacio.coordinates[0]
  };
  mostrarFormulari.value = true;
  iniciarMapa();
}

function tancarIRefrescar() {
  mostrarFormulari.value = false;
  idEditant.value = null;
  obtenirLlocs();
}

async function iniciarMapa() {
  await nextTick();
  
  if (mapa) mapa.remove(); 

  mapa = L.map('mapSelector').setView([formulari.value.lat, formulari.value.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

  marcador = L.marker([formulari.value.lat, formulari.value.lng], { draggable: true }).addTo(mapa);

  marcador.on('dragend', () => {
    const posicio = marcador.getLatLng();
    formulari.value.lat = posicio.lat;
    formulari.value.lng = posicio.lng;
  });
}
</script>

<style>
#mapSelector { cursor: crosshair; }
</style>