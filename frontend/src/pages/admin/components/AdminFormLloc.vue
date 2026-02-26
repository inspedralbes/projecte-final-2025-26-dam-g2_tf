<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-10">
    <form @submit.prevent="enviarFormulario" class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div class="space-y-4">
          <h3 class="text-sm font-black text-purple-400 uppercase tracking-widest">Dades Generals</h3>
          
          <input v-model="form.nom" placeholder="Nom del lloc" class="w-full border-2 border-gray-50 p-3 rounded-2xl outline-none focus:border-purple-200 bg-gray-50" required>
          
          <div class="grid grid-cols-2 gap-3">
            <input v-model="form.barri" placeholder="Barri" class="border-2 border-gray-50 p-3 rounded-2xl bg-gray-50">
            <select v-model="form.dificultat" class="border-2 border-gray-50 p-3 rounded-2xl bg-gray-50 outline-none">
                <option value="Baixa">Dificultat: Baixa</option>
                <option value="Mitjana">Dificultat: Mitjana</option>
                <option value="Alta">Dificultat: Alta</option>
            </select>
          </div>

          <textarea v-model="form.descripcio" placeholder="Descripció breu..." class="w-full border-2 border-gray-50 p-3 rounded-2xl bg-gray-50" rows="2"></textarea>
          <textarea v-model="form.explicacio_historica" placeholder="Explicació històrica detallada..." class="w-full border-2 border-gray-50 p-3 rounded-2xl bg-gray-50" rows="4"></textarea>

          <div class="p-4 border-2 border-purple-50 rounded-2xl bg-purple-50/30">
            <h4 class="text-[10px] font-black text-purple-400 uppercase mb-2">Control Horari (Opcional)</h4>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-purple-800 cursor-pointer font-bold">
                <input type="checkbox" v-model="form.control_horari.actiu" class="w-4 h-4 accent-purple-600"> Actiu
              </label>
              <input v-if="form.control_horari.actiu" v-model="form.control_horari.hora_tancament" type="time" class="border-2 border-white rounded-xl p-2 text-xs bg-white shadow-sm outline-none">
            </div>
          </div>

          <div>
            <label class="text-[10px] font-bold text-gray-400 uppercase ml-2">Etiquetes (polsa Enter)</label>
            <div class="flex flex-wrap gap-2 p-3 border-2 border-gray-50 rounded-2xl bg-gray-50 mt-1">
              <span v-for="(tag, i) in form.tags" :key="i" @click="eliminarTag(i)" class="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer hover:bg-red-100 transition-colors">
                #{{ tag }}
              </span>
              <input @keydown.enter.prevent="afegirTag" placeholder="nou-tag..." class="bg-transparent outline-none text-xs flex-1 min-w-[60px]">
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-sm font-black text-purple-400 uppercase tracking-widest">Ubicació i Media</h3>
          
          <div class="grid grid-cols-1 gap-2">
            <input v-model="form.imatge_referencia" placeholder="URL Foto Principal (Realitat)" class="w-full border-2 border-gray-50 p-3 rounded-2xl bg-gray-50 text-xs shadow-sm">
            <input v-model="form.foto_mapa" placeholder="URL Foto Mapa (Dibuix esquemàtic)" class="w-full border-2 border-gray-50 p-3 rounded-2xl bg-gray-50 text-xs shadow-sm">
          </div>

          <div id="mapaInput" class="h-64 rounded-3xl border-4 border-gray-50 overflow-hidden shadow-inner relative z-10"></div>

          <div class="flex flex-col items-center gap-2">
            <p class="text-[10px] text-center text-gray-400 font-bold uppercase">
              COORDENADES: {{ form.lat.toFixed(5) }}, {{ form.lng.toFixed(5) }}
            </p>
            <button type="button" @click="mostrarPopupUbi = true" class="text-[10px] bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full font-black border border-purple-100 hover:bg-purple-600 hover:text-white transition-all">
              INTRODUIR COORDENADES MANUALMENT
            </button>
          </div>
        </div>

        <div class="lg:col-span-2 pt-6 border-t border-gray-50">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-black text-purple-400 uppercase tracking-widest">Punts de Missió ({{ form.punts_missio.length }})</h3>
            <button type="button" @click="afegirPunt" class="text-xs bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-bold hover:bg-purple-100">+ Afegir Punt</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(punt, i) in form.punts_missio" :key="i" class="p-4 border-2 border-gray-50 rounded-2xl bg-white relative group">
              <button @click="eliminarPunt(i)" type="button" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 font-bold">×</button>
              <input v-model="punt.nom_punt" placeholder="Nom del punt (Ex: La Gàrgola)" class="w-full font-bold text-sm border-b mb-2 outline-none">
              <div class="flex gap-2 mb-2">
                <div class="w-1/2">
                  <label class="text-[9px] text-gray-400 uppercase font-bold">Eix X (%)</label>
                  <input v-model.number="punt.posicio_x" type="number" class="w-full text-xs p-1 border rounded bg-gray-50">
                </div>
                <div class="w-1/2">
                  <label class="text-[9px] text-gray-400 uppercase font-bold">Eix Y (%)</label>
                  <input v-model.number="punt.posicio_y" type="number" class="w-full text-xs p-1 border rounded bg-gray-50">
                </div>
              </div>
              <input v-model="punt.pista" placeholder="Pista per trobar el punt..." class="w-full text-xs italic text-gray-500 outline-none">
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 flex gap-4 pt-6 border-t border-gray-100">
          <button type="submit" class="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold uppercase shadow-lg hover:bg-purple-700 transition-all">
            {{ editandoId ? 'Actualitzar Lloc' : 'Guardar Nou Lloc' }}
          </button>
          <button v-if="editandoId" @click="$emit('eliminar', editandoId)" type="button" class="bg-red-50 text-red-500 px-8 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all">
            Eliminar
          </button>
        </div>
      </div>
    </form>

    <div v-if="mostrarPopupUbi" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
        <h3 class="text-xl font-bold text-purple-800 mb-2">Situar per coordenades</h3>
        <p class="text-xs text-gray-500 mb-4">Pega les coordenades de Google Maps</p>
        <input v-model="inputCoordenadas" placeholder="Latitud, Longitud" class="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none bg-gray-50 mb-6">
        <div class="flex gap-3">
          <button @click="mostrarPopupUbi = false" class="flex-1 py-3 text-gray-400 font-bold uppercase text-xs">Cancelar</button>
          <button @click="procesarCoordenadas" class="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Aplicar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const props = defineProps({
  datosIniciales: Object,
  editandoId: String
});

const emit = defineEmits(['save', 'eliminar']);

// Clonar los datos iniciales para que el formulario sea independiente
const form = ref(JSON.parse(JSON.stringify(props.datosIniciales)));

// Actualizar el formulario si los props cambian (al cambiar de lloc)
watch(() => props.datosIniciales, (val) => {
  form.value = JSON.parse(JSON.stringify(val));
  if (map && marker) {
    marker.setLatLng([form.value.lat, form.value.lng]);
    map.setView([form.value.lat, form.value.lng], 15);
  }
}, { deep: true });

const mostrarPopupUbi = ref(false);
const inputCoordenadas = ref(`${form.value.lat}, ${form.value.lng}`);

let map = null;
let marker = null;

const initMapa = async () => {
  await nextTick();
  if (map) map.remove();
  map = L.map('mapaInput').setView([form.value.lat, form.value.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  marker = L.marker([form.value.lat, form.value.lng], { draggable: true }).addTo(map);
  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    form.value.lat = pos.lat; form.value.lng = pos.lng;
  });
};

const afegirTag = (e) => {
  const valor = e.target.value.trim();
  if (valor && !form.value.tags.includes(valor)) {
    form.value.tags.push(valor);
    e.target.value = '';
  }
};
const eliminarTag = (index) => form.value.tags.splice(index, 1);
const afegirPunt = () => form.value.punts_missio.push({ nom_punt: '', posicio_x: 50, posicio_y: 50, pista: '' });
const eliminarPunt = (index) => form.value.punts_missio.splice(index, 1);

function procesarCoordenadas() {
  const partes = inputCoordenadas.value.split(/[\s,]+/);
  const lat = parseFloat(partes[0]);
  const lng = parseFloat(partes[1]);
  if (!isNaN(lat) && !isNaN(lng)) {
    form.value.lat = lat; form.value.lng = lng;
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 16);
    mostrarPopupUbi.value = false;
  }
}

const enviarFormulario = () => {
    emit('save', { ...form.value });
};

onMounted(initMapa);
</script>