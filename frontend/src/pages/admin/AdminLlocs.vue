<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0">
    
    <AdminNav />

    <main class="flex-1 p-6 md:p-10">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-[#9f6795]">
          {{ mostrarForm ? 'Gestió de Lloc' : 'Llocs Històrics' }}
        </h1>
        <button @click="toggleFormulario" class="bg-[#9f6795] text-white px-6 py-2 rounded-lg font-bold">
          {{ mostrarForm ? 'Tornar a la llista' : '+ Nou Lloc' }}
        </button>
      </div>

      <div v-if="mostrarForm" class="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md border-t-4 border-[#804f7f]">
        
        <form @submit.prevent="guardarLloc" class="space-y-4">
          <input v-model="form.nom" placeholder="Nom del lloc" class="w-full border p-3 rounded-xl outline-none" required>
          <input v-model="form.imatge_portada" placeholder="URL de la imatge" class="w-full border p-3 rounded-xl outline-none" required>
          <textarea v-model="form.descripcio" placeholder="Descripció" class="w-full border p-3 rounded-xl outline-none" rows="4"></textarea>
          
          <div class="bg-gray-100 p-3 rounded-xl text-center text-xs font-mono">
            Ubicació: {{ form.lat.toFixed(4) }}, {{ form.lng.toFixed(4) }}
          </div>

          <button type="submit" class="w-full bg-[#9f6795] text-white py-4 rounded-xl font-bold uppercase shadow-md">
            {{ idEditando ? 'Actualitzar dades' : 'Crear nou lloc' }}
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
            <tr v-for="lloc in llocs" :key="lloc._id" class="hover:bg-gray-50 transition">
              <td class="p-4 flex items-center gap-4">
                <img :src="lloc.imatge_referencia" class="h-12 w-16 object-cover rounded-lg">
                <span class="font-bold text-[#9f6795]">{{ lloc.nom }}</span>
              </td>
              <td class="p-4 text-right">
                <button @click="cargarEdicion(lloc)" 
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

// Variables d'estat 
const llocs = ref([]);
const mostrarForm = ref(false);
const idEditando = ref(null);
const form = ref({ nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699 });

// Variables Mapa
let map = null;
let marker = null;

onMounted(obtenerLlocs);

async function obtenerLlocs() {
  const respuesta = await fetch('http://localhost:8088/api/admin/llocs');
  llocs.value = await respuesta.json();
}

async function guardarLloc() {
  const dadesParaEnviar = {
    nom: form.value.nom,
    descripcio: form.value.descripcio,
    imatge_referencia: form.value.imatge_portada,
    ubicacio: { type: 'Point', coordinates: [form.value.lng, form.value.lat] }
  };

  const url = idEditando.value 
    ? `http://localhost:8088/api/admin/llocs/${idEditando.value}` 
    : 'http://localhost:8088/api/admin/llocs';

  await fetch(url, {
    method: idEditando.value ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadesParaEnviar)
  });

  cerrarYRefrescar();
}

async function eliminarLloc(id) {
  if (confirm("Segur que vols eliminar aquest lloc?")) {
    await fetch(`http://localhost:8088/api/admin/llocs/${id}`, { method: 'DELETE' });
    obtenerLlocs();
  }
}

function toggleFormulario() {
  if (mostrarForm.value) {
    cerrarYRefrescar();
  } else {
    abrirFormularioNuevo();
  }
}

function abrirFormularioNuevo() {
  idEditando.value = null;
  form.value = { nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699 };
  mostrarForm.value = true;
  iniciarMapa();
}

function cargarEdicion(lloc) {
  idEditando.value = lloc._id;
  form.value = {
    nom: lloc.nom,
    descripcio: lloc.descripcio,
    imatge_portada: lloc.imatge_referencia,
    lat: lloc.ubicacio.coordinates[1],
    lng: lloc.ubicacio.coordinates[0]
  };
  mostrarForm.value = true;
  iniciarMapa();
}

function cerrarYRefrescar() {
  mostrarForm.value = false;
  idEditando.value = null;
  obtenerLlocs();
}

async function iniciarMapa() {
  await nextTick();
  
  if (map) map.remove(); 

  map = L.map('mapSelector').setView([form.value.lat, form.value.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  marker = L.marker([form.value.lat, form.value.lng], { draggable: true }).addTo(map);

  //revisar 
  marker.on('dragend', () => {
    const posicion = marker.getLatLng();
    form.value.lat = posicion.lat;
    form.value.lng = posicion.lng;
  });
}
</script>

<style>
#mapSelector { cursor: crosshair; }
</style>