<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h2 class="text-xl font-bold mb-6">Admin Panel</h2>
      <nav class="flex flex-col gap-2">
        <router-link to="/admin/dashboard" class="nav-link">Inici</router-link>
        <router-link to="/admin/llocs" class="nav-link active">Gestionar Llocs</router-link>
        <router-link to="/admin/peticions" class="nav-link">Peticions</router-link>
        <button @click="logout" class="btn-logout">Tancar Sessió</button>
      </nav>
    </aside>

    <main class="main-content">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Gestionar Llocs</h1>
        <button @click="openCreateForm" class="btn-primary">+ Nou Lloc</button>
      </header>

      <section v-if="showForm" class="form-container">
        <h2 class="text-xl font-bold mb-4">{{ editingId ? 'Editar Lloc' : 'Afegir Nou Lloc' }}</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form @submit.prevent="saveLloc" class="space-y-4">
            <input v-model="form.nom" placeholder="Nom del lloc" class="input-field" required>
            <input v-model="form.imatge_portada" placeholder="URL Imatge" class="input-field" required>
            <textarea v-model="form.descripcio" placeholder="Descripció curta" class="input-field"></textarea>
            <textarea v-model="form.explicacio_historica" placeholder="Història detallada" class="input-field" rows="3"></textarea>
            
            <div class="flex gap-4">
              <input :value="form.lat.toFixed(4)" label="Lat" class="input-field bg-gray-100" readonly>
              <input :value="form.lng.toFixed(4)" label="Lng" class="input-field bg-gray-100" readonly>
            </div>

            <select v-model="form.dificultat" class="input-field">
              <option value="Baixa">Baixa</option>
              <option value="Mitjana">Mitjana</option>
              <option value="Alta">Alta</option>
            </select>

            <div class="flex justify-end gap-2">
              <button type="button" @click="showForm = false" class="btn-secondary">Cancel·lar</button>
              <button type="submit" class="btn-primary">Guardar</button>
            </div>
          </form>

          <div class="space-y-4">
            <div id="mapSelector" class="map-box"></div>
            <img v-if="form.imatge_portada" :src="form.imatge_portada" class="preview-img">
          </div>
        </div>
      </section>

      <section class="table-container">
        <table class="w-full text-left">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-4">Foto</th>
              <th class="p-4">Nom</th>
              <th class="p-4 text-right">Accions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lloc in llocs" :key="lloc._id" class="border-t hover:bg-gray-50">
              <td class="p-4"><img :src="lloc.imatge_referencia" class="h-10 w-16 object-cover rounded"></td>
              <td class="p-4 font-medium">{{ lloc.nom }}</td>
              <td class="p-4 text-right">
                <button @click="editLloc(lloc)" class="text-blue-600 mr-4">Editar</button>
                <button @click="deleteLloc(lloc._id)" class="text-red-600">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

// VARIABLES DE ESTADO
const router = useRouter();
const llocs = ref([]);
const showForm = ref(false);
const editingId = ref(null);
const form = ref({ nom: '', descripcio: '', explicacio_historica: '', imatge_portada: '', lat: 41.38, lng: 2.17, dificultat: 'Mitjana' });

let map = null, marker = null;

// CARGAR DATOS AL INICIAR
onMounted(fetchLlocs);

async function fetchLlocs() {
  const res = await fetch('http://localhost:8088/api/admin/llocs');
  llocs.value = await res.json();
}

// LÓGICA DEL MAPA (Leaflet)
async function initMap() {
  await nextTick(); // Espera a que el HTML del mapa exista
  if (map) map.remove();
  
  map = L.map('mapSelector').setView([form.value.lat, form.value.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  marker = L.marker([form.value.lat, form.value.lng], { draggable: true }).addTo(map);
  
  map.on('click', (e) => updateMarker(e.latlng.lat, e.latlng.lng));
  marker.on('dragend', () => updateMarker(marker.getLatLng().lat, marker.getLatLng().lng));
}

function updateMarker(lat, lng) {
  marker.setLatLng([lat, lng]);
  form.value.lat = lat;
  form.value.lng = lng;
}

// ACCIONES (Crear, Editar, Guardar, Borrar)
function openCreateForm() {
  editingId.value = null;
  resetForm();
  showForm.value = true;
  initMap();
}

function editLloc(lloc) {
  editingId.value = lloc._id;
  form.value = { ...lloc, imatge_portada: lloc.imatge_referencia, lat: lloc.ubicacio.coordinates[1], lng: lloc.ubicacio.coordinates[0] };
  showForm.value = true;
  initMap();
}

async function saveLloc() {
  const body = {
    ...form.value,
    imatge_referencia: form.value.imatge_portada,
    ubicacio: { type: 'Point', coordinates: [form.value.lng, form.value.lat] }
  };

  const url = editingId.value ? `http://localhost:8088/api/admin/llocs/${editingId.value}` : 'http://localhost:8088/api/admin/llocs';
  const method = editingId.value ? 'PUT' : 'POST';

  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  showForm.value = false;
  fetchLlocs();
}

async function deleteLloc(id) {
  if (confirm("Segur?")) {
    await fetch(`http://localhost:8088/api/admin/llocs/${id}`, { method: 'DELETE' });
    fetchLlocs();
  }
}

function resetForm() {
  form.value = { nom: '', descripcio: '', explicacio_historica: '', imatge_portada: '', lat: 41.38, lng: 2.17, dificultat: 'Mitjana' };
}

function logout() {
  localStorage.removeItem('admin_session');
  router.push('/admin/login');
}
</script>

<style scoped>
/* ESTILOS REUTILIZABLES */
.admin-layout { @apply min-h-screen bg-gray-100 flex text-gray-800; }
.sidebar { @apply w-64 bg-indigo-900 text-white p-6; }
.main-content { @apply flex-1 p-10 overflow-y-auto; }

.nav-link { @apply block py-2 px-4 rounded hover:bg-indigo-700 transition; }
.active { @apply bg-indigo-700 font-bold; }
.btn-logout { @apply mt-8 text-red-300 text-left hover:text-red-100; }

.form-container { @apply bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-100; }
.table-container { @apply bg-white rounded-xl shadow-sm overflow-hidden; }

.input-field { @apply w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none; }
.map-box { @apply h-64 w-full rounded-lg border; }
.preview-img { @apply h-40 w-full object-cover rounded-lg border shadow-inner; }

.btn-primary { @apply bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition; }
.btn-secondary { @apply text-gray-500 hover:text-gray-800; }
</style>