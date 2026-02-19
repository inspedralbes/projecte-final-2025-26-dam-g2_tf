<template>
  <div class="min-h-screen bg-gray-100 flex text-gray-800">
    
    <aside class="w-64 bg-[#402749] text-white p-6">
      <h2 class="text-2xl font-bold mb-8">Admin</h2>
      <nav class="flex flex-col gap-4">
        <router-link to="/admin/dashboard" class="hover:text-pink-300">Inici</router-link>
        <router-link to="/admin/llocs" class="font-bold text-pink-300">Llocs</router-link>
        <router-link to="/admin/peticions" class="hover:text-pink-300">Peticions</router-link>
        <button @click="logout" class="mt-10 text-red-400 text-left">Tancar Sessió</button>
      </nav>
    </aside>

    <main class="flex-1 p-10">
      <div class="flex justify-between mb-8">
        <h1 class="text-3xl font-bold text-[#402749]">Gestionar Llocs</h1>
        <button @click="openCreateForm" class="bg-[#804f7f] text-white px-6 py-2 rounded-lg">+ Nou Lloc</button>
      </div>

      <div v-if="showForm" class="bg-white p-6 rounded-xl shadow mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 border">
        <form @submit.prevent="saveLloc" class="space-y-4">
          <input v-model="form.nom" placeholder="Nom del lloc" class="w-full border p-2 rounded" required>
          <input v-model="form.imatge_portada" placeholder="URL Imatge" class="w-full border p-2 rounded" required>
          <textarea v-model="form.descripcio" placeholder="Descripció" class="w-full border p-2 rounded" rows="2"></textarea>
          
          <div class="flex gap-4 bg-gray-50 p-2 rounded text-xs font-mono">
            <span>Lat: {{ form.lat.toFixed(4) }}</span>
            <span>Lng: {{ form.lng.toFixed(4) }}</span>
          </div>

          <select v-model="form.dificultat" class="w-full border p-2 rounded">
            <option value="Baixa">Baixa</option>
            <option value="Mitjana">Mitjana</option>
            <option value="Alta">Alta</option>
          </select>

          <div class="flex gap-4 pt-2">
            <button type="submit" class="bg-[#804f7f] text-white px-6 py-2 rounded font-bold flex-1">Guardar</button>
            <button @click="showForm = false" type="button" class="text-gray-500">Cancel·lar</button>
          </div>
        </form>

        <div class="space-y-2">
          <p class="text-xs font-bold text-gray-500 uppercase">Tria la ubicació:</p>
          <div id="mapSelector" class="h-60 w-full rounded border bg-gray-100"></div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b">
            <tr class="text-xs uppercase text-gray-500">
              <th class="p-4">Lloc</th>
              <th class="p-4 text-right">Accions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="lloc in llocs" :key="lloc._id" class="hover:bg-gray-50">
              <td class="p-4 flex items-center gap-4">
                <img :src="lloc.imatge_referencia" class="h-10 w-14 object-cover rounded shadow-sm">
                <span class="font-bold">{{ lloc.nom }}</span>
              </td>
              <td class="p-4 text-right space-x-4">
                <button @click="editLloc(lloc)" class="text-blue-600 font-bold">Editar</button>
                <button @click="deleteLloc(lloc._id)" class="text-red-600 font-bold">Eliminar</button>
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

const form = ref({ nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699, dificultat: 'Mitjana' });

onMounted(fetchLlocs);

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

function openCreateForm() {
  editingId.value = null; resetForm(); 
  showForm.value = true; initMap();
}

function editLloc(lloc) {
  editingId.value = lloc._id;
  form.value = { 
    nom: lloc.nom, descripcio: lloc.descripcio, 
    imatge_portada: lloc.imatge_referencia, 
    lat: lloc.ubicacio.coordinates[1], lng: lloc.ubicacio.coordinates[0],
    dificultat: lloc.dificultat 
  };
  showForm.value = true; initMap();
}

async function fetchLlocs() {
  const res = await fetch('http://localhost:8088/api/admin/llocs');
  llocs.value = await res.json();
}

async function saveLloc() {
  const dades = { ...form.value, imatge_referencia: form.value.imatge_portada, ubicacio: { type: 'Point', coordinates: [form.value.lng, form.value.lat] } };
  const method = editingId.value ? 'PUT' : 'POST';
  const url = `http://localhost:8088/api/admin/llocs${editingId.value ? '/' + editingId.value : ''}`;

  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dades) });
  showForm.value = false; fetchLlocs();
}

async function deleteLloc(id) {
  if (confirm("Eliminar lloc?")) {
    await fetch(`http://localhost:8088/api/admin/llocs/${id}`, { method: 'DELETE' });
    fetchLlocs();
  }
}

function resetForm() { form.value = { nom: '', descripcio: '', imatge_portada: '', lat: 41.3879, lng: 2.1699, dificultat: 'Mitjana' }; }
function logout() { localStorage.removeItem('admin_session'); router.push('/admin/login'); }
</script>