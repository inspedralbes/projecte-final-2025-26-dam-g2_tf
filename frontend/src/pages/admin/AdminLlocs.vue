<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0">
    
    <aside class="hidden md:flex flex-col w-64 bg-[#402749] text-white p-6 shadow-lg">
      <h2 class="text-2xl font-bold mb-8 text-[#f5cbdd]">Admin</h2>
      <nav class="flex flex-col gap-4">
        <router-link to="/admin/dashboard" class="hover:text-pink-300">Inici</router-link>
        <router-link to="/admin/llocs" class="font-bold text-pink-300">Gestió Llocs</router-link>
        <router-link to="/admin/peticions" class="hover:text-pink-300">Peticions</router-link>
        <button @click="logout" class="mt-10 text-red-400 text-left">Sortir</button>
      </nav>
    </aside>

    <main class="flex-1 p-6 md:p-10">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-[#402749]">Llocs Històrics</h1>
        <button @click="prepararNuevoLloc" class="bg-[#804f7f] text-white px-4 py-2 rounded-lg font-bold shadow">
          {{ mostrarForm ? 'Tancar' : '+ Nou' }}
        </button>
      </div>

      <div v-if="mostrarForm" class="bg-white p-6 rounded-xl shadow-md mb-8 border-t-4 border-[#804f7f]">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <form @submit.prevent="guardarLloc" class="space-y-4">
            <h2 class="font-bold text-[#804f7f] uppercase text-sm">
              {{ idEditando ? 'Editant Lloc' : 'Crear Nou Lloc' }}
            </h2>
            <input v-model="form.nom" placeholder="Nom del lloc" class="w-full border p-3 rounded-xl" required>
            <input v-model="form.imatge_portada" placeholder="URL de la imatge" class="w-full border p-3 rounded-xl" required>
            <textarea v-model="form.descripcio" placeholder="Descripció" class="w-full border p-3 rounded-xl" rows="3"></textarea>
            
            <div class="bg-gray-50 p-3 rounded-xl flex justify-around text-xs font-mono border">
              <span>Lat: {{ form.lat.toFixed(5) }}</span>
              <span>Lng: {{ form.lng.toFixed(5) }}</span>
            </div>

            <div class="flex gap-2">
              <button type="submit" class="flex-1 bg-[#804f7f] text-white py-3 rounded-xl font-bold uppercase shadow-lg hover:bg-[#402749]">
                {{ idEditando ? 'Actualitzar' : 'Guardar Lloc' }}
              </button>
              <button @click="cerrarFormulario" type="button" class="px-4 text-gray-400">Cancel·lar</button>
            </div>
          </form>

          <div class="space-y-2">
            <p class="text-xs font-bold text-gray-400 uppercase">Tria la ubicació al mapa:</p>
            <div id="mapSelector" class="h-64 lg:h-full min-h-[300px] rounded-xl border-2 border-gray-100 z-10"></div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b">
            <tr class="text-xs text-gray-400 uppercase">
              <th class="p-4">Lloc</th>
              <th class="p-4 text-right">Accions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="lloc in llocs" :key="lloc._id" class="hover:bg-gray-50 transition">
              <td class="p-4 flex items-center gap-3">
                <img :src="lloc.imatge_referencia" class="h-12 w-16 object-cover rounded-lg shadow-sm">
                <span class="font-bold text-[#402749]">{{ lloc.nom }}</span>
              </td>
              <td class="p-4 text-right space-x-3">
                <button @click="prepararEdicion(lloc)" class="text-blue-500 font-bold">Editar</button>
                <button @click="eliminarLloc(lloc._id)" class="text-red-400 font-bold">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div class="fixed bottom-0 z-50 w-full bg-[#402749] border-t border-[#804f7f] md:hidden h-16 flex items-center">
      <div class="grid h-full grid-cols-4 w-full">
          <button @click="irA('/admin/dashboard')" class="flex flex-col items-center justify-center text-white/70">
            <span class="text-[10px] uppercase font-bold">Inici</span>
          </button>
          <button @click="irA('/admin/llocs')" class="flex flex-col items-center justify-center text-[#f5cbdd] bg-[#5d3962]">
            <span class="text-[10px] uppercase font-bold">Llocs</span>
          </button>
          <button @click="irA('/admin/peticions')" class="flex flex-col items-center justify-center text-white/70">
            <span class="text-[10px] uppercase font-bold">Peticions</span>
          </button>
          <button @click="logout" class="flex flex-col items-center justify-center text-red-400">
            <span class="text-[10px] uppercase font-bold">Sortir</span>
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const llocs = ref([]);
const mostrarForm = ref(false);
const idEditando = ref(null);
let map = null, marker = null;

const form = ref({ nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699 });

onMounted(fetchLlocs);

// --- LÒGICA DEL MAPA (Molt senzilla) ---
async function initMap() {
  await nextTick(); // Espera que el HTML estigui a punt
  if (map) { map.remove(); map = null; } // Neteja si ja existia
  
  // Crea el mapa centrat en la lat/lng del formulari
  map = L.map('mapSelector').setView([form.value.lat, form.value.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  // Afegeix el marcador que es pot arrossegar
  marker = L.marker([form.value.lat, form.value.lng], { draggable: true }).addTo(map);
  
  // Si cliques al mapa, movem el marcador i actualitzem dades
  map.on('click', (e) => {
    actualizarPosicion(e.latlng.lat, e.latlng.lng);
  });

  // Si arrossegues el marcador, actualitzem dades
  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    actualizarPosicion(pos.lat, pos.lng);
  });
}

function actualizarPosicion(lat, lng) {
  marker.setLatLng([lat, lng]);
  form.value.lat = lat;
  form.value.lng = lng;
}

// --- ACCIONS API ---
async function fetchLlocs() {
  const res = await fetch('http://localhost:8088/api/admin/llocs');
  llocs.value = await res.json();
}

function prepararNuevoLloc() {
  idEditando.value = null;
  resetForm();
  mostrarForm.value = !mostrarForm.value;
  if (mostrarForm.value) initMap();
}

function prepararEdicion(lloc) {
  idEditando.value = lloc._id;
  form.value = {
    nom: lloc.nom,
    descripcio: lloc.descripcio,
    imatge_portada: lloc.imatge_referencia,
    lat: lloc.ubicacio.coordinates[1],
    lng: lloc.ubicacio.coordinates[0]
  };
  mostrarForm.value = true;
  window.scrollTo(0, 0);
  initMap();
}

async function guardarLloc() {
  const dades = {
    nom: form.value.nom,
    descripcio: form.value.descripcio,
    imatge_referencia: form.value.imatge_portada,
    ubicacio: { type: 'Point', coordinates: [form.value.lng, form.value.lat] }
  };

  const url = idEditando.value ? `http://localhost:8088/api/admin/llocs/${idEditando.value}` : 'http://localhost:8088/api/admin/llocs';
  const metodo = idEditando.value ? 'PUT' : 'POST';

  await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dades)
  });

  cerrarFormulario();
  fetchLlocs();
}

async function eliminarLloc(id) {
  if (confirm("Eliminar lloc?")) {
    await fetch(`http://localhost:8088/api/admin/llocs/${id}`, { method: 'DELETE' });
    fetchLlocs();
  }
}

// --- UTILITATS ---
function cerrarFormulario() { mostrarForm.value = false; idEditando.value = null; }
function resetForm() { form.value = { nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699 }; }
function irA(ruta) { router.push(ruta); }
function logout() { localStorage.clear(); window.location.href = '/'; }
</script>

<style>
/* Important per Leaflet */
#mapSelector { cursor: crosshair; }
</style>