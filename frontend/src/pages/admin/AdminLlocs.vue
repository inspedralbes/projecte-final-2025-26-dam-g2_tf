<template>
  <div class="min-h-screen bg-gray-100 flex text-gray-800">
    
    <aside class="w-64 bg-[#402749] text-white p-6">
      <h2 class="text-2xl font-bold mb-8">Admin</h2>
      <nav class="flex flex-col gap-4">
        <router-link to="/admin/dashboard" class="hover:text-pink-300">Inici</router-link>
        <router-link to="/admin/llocs" class="font-bold text-pink-300">Llocs</router-link>
        <router-link to="/admin/peticions" class="hover:text-pink-300">Peticions</router-link>
        <button @click="logout" class="mt-10 text-red-400 text-left">Sortir</button>
      </nav>
    </aside>

    <main class="flex-1 p-10">
      <div class="flex justify-between mb-8">
        <h1 class="text-3xl font-bold text-[#402749]">Gestionar Llocs</h1>
        <button @click="openCreateForm" class="bg-[#804f7f] text-white px-6 py-2 rounded-lg">+ Nou Lloc</button>
      </div>

      <div v-if="showForm" class="bg-white p-6 rounded-xl shadow mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 border">
        <form @submit.prevent="saveLloc" class="space-y-4">
          <input v-model="form.nom" placeholder="Nom del lloc" class="w-full border p-2 rounded focus:ring-2 focus:ring-[#804f7f] outline-none" required>
          <input v-model="form.imatge_portada" placeholder="URL Imatge Portada" class="w-full border p-2 rounded focus:ring-2 focus:ring-[#804f7f] outline-none" required>
          
          <textarea v-model="form.descripcio" placeholder="Descripció curta (resum)" class="w-full border p-2 rounded" rows="2" required></textarea>
          
          <textarea v-model="form.explicacio_historica" placeholder="Explicació històrica detallada per l'usuari..." class="w-full border p-2 rounded" rows="4"></textarea>
          
          <div class="flex gap-4 bg-gray-50 p-3 rounded text-xs font-mono border">
            <span class="text-gray-500">📍 Lat: {{ form.lat.toFixed(4) }}</span>
            <span class="text-gray-500">Lng: {{ form.lng.toFixed(4) }}</span>
          </div>

          <select v-model="form.dificultat" class="w-full border p-2 rounded bg-white">
            <option value="Baixa">Baixa</option>
            <option value="Mitjana">Mitjana</option>
            <option value="Alta">Alta</option>
          </select>

          <div class="flex gap-4 pt-2">
            <button type="submit" class="bg-[#804f7f] text-white px-6 py-2 rounded font-bold flex-1 hover:bg-[#5d3962]">Guardar</button>
            <button @click="showForm = false" type="button" class="text-gray-500">Cancel·lar</button>
          </div>
        </form>

        <div class="space-y-4">
          <p class="text-xs font-bold text-gray-500 uppercase">Ubicació al mapa:</p>
          <div id="mapSelector" class="h-64 w-full rounded border bg-gray-100 shadow-inner"></div>
          
          <div v-if="form.imatge_portada" class="border rounded-lg overflow-hidden">
            <p class="bg-gray-50 text-[10px] p-1 text-center font-bold text-gray-400 uppercase">Preview Imatge</p>
            <img :src="form.imatge_portada" class="h-32 w-full object-cover">
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden border">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b">
            <tr class="text-xs uppercase text-gray-500">
              <th class="p-4">Lloc</th>
              <th class="p-4">Dificultat</th>
              <th class="p-4 text-right">Accions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="lloc in llocs" :key="lloc._id" class="hover:bg-gray-50 transition">
              <td class="p-4 flex items-center gap-4">
                <img :src="lloc.imatge_referencia" class="h-10 w-14 object-cover rounded bg-gray-100">
                <span class="font-bold text-gray-700">{{ lloc.nom }}</span>
              </td>
              <td class="p-4">
                <span class="text-xs px-2 py-1 bg-gray-100 rounded border">{{ lloc.dificultat }}</span>
              </td>
              <td class="p-4 text-right space-x-4">
                <button @click="editLloc(lloc)" class="text-blue-600 font-bold hover:underline">Editar</button>
                <button @click="deleteLloc(lloc._id)" class="text-red-600 font-bold hover:underline">Eliminar</button>
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
import { useRouter } from 'vue-router';

const router = useRouter();
const llocs = ref([]);
const showForm = ref(false);
const editingId = ref(null);
let map = null, marker = null;

// Formulari amb tots els camps necessaris
const form = ref({ 
  nom: '', 
  descripcio: '', 
  explicacio_historica: '', 
  imatge_portada: '', 
  lat: 41.3879, 
  lng: 2.1699, 
  dificultat: 'Mitjana' 
});

onMounted(fetchLlocs);

// FUNCIONS DEL MAPA
async function initMap() {
  await nextTick();
  if (map) map.remove();
  map = L.map('mapSelector').setView([form.value.lat, form.value.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  marker = L.marker([form.value.lat, form.value.lng], { draggable: true }).addTo(map);
  
  map.on('click', (e) => updateMarker(e.latlng.lat, e.latlng.lng));
  marker.on('dragend', () => updateMarker(marker.getLatLng().lat, marker.getLatLng().lng));
}

function updateMarker(lat, lng) {
  marker.setLatLng([lat, lng]);
  form.value.lat = lat; form.value.lng = lng;
}

// ACCIONS DEL FORMULARI
function openCreateForm() {
  editingId.value = null; resetForm(); 
  showForm.value = true; initMap();
}

function editLloc(lloc) {
  editingId.value = lloc._id;
  form.value = { 
    nom: lloc.nom, 
    descripcio: lloc.descripcio, 
    explicacio_historica: lloc.explicacio_historica || '', 
    imatge_portada: lloc.imatge_referencia, 
    lat: lloc.ubicacio.coordinates[1], 
    lng: lloc.ubicacio.coordinates[0],
    dificultat: lloc.dificultat 
  };
  showForm.value = true; initMap();
}

// CRIDES A LA API
async function fetchLlocs() {
  const res = await fetch('http://localhost:8088/api/admin/llocs');
  llocs.value = await res.json();
}

async function saveLloc() {
  const dades = { 
    ...form.value, 
    imatge_referencia: form.value.imatge_portada, 
    ubicacio: { type: 'Point', coordinates: [form.value.lng, form.value.lat] } 
  };
  
  const method = editingId.value ? 'PUT' : 'POST';
  const url = `http://localhost:8088/api/admin/llocs${editingId.value ? '/' + editingId.value : ''}`;

  await fetch(url, { 
    method, 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(dades) 
  });
  
  showForm.value = false; 
  fetchLlocs();
}

async function deleteLloc(id) {
  if (confirm("Eliminar lloc definitivament?")) {
    await fetch(`http://localhost:8088/api/admin/llocs/${id}`, { method: 'DELETE' });
    fetchLlocs();
  }
}

function resetForm() { 
  form.value = { nom: '', descripcio: '', explicacio_historica: '', imatge_portada: '', lat: 41.3879, lng: 2.1699, dificultat: 'Mitjana' }; 
}

function logout() { 
  localStorage.removeItem('admin_session'); 
  router.push('/admin/login'); 
}
</script>