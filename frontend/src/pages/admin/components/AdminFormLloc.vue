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

          <div class="bg-gray-50 p-4 rounded-xl border border-purple-100 mt-4">
  <h3 class="text-[11px] font-black text-[#402749] mb-3 uppercase tracking-widest">
    Control Horari (Opcional)
  </h3>
  
  <div class="flex items-center gap-6">
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" v-model="form.control_horari.actiu" class="w-5 h-5 accent-[#804f7f]">
      <span class="text-sm font-bold text-gray-600">Activa el bloqueig</span>
    </label>

    <div v-if="form.control_horari.actiu" class="flex items-center gap-4 animate-fade-in">
      <div class="flex flex-col">
        <span class="text-[9px] text-[#bc85ab] font-bold uppercase mb-1">Hora tancament</span>
        <input 
          type="time" 
          v-model="form.control_horari.hora_inici" 
          class="border rounded-lg px-2 py-1 text-sm outline-none focus:border-[#804f7f]"
        />
      </div>

      <span class="text-gray-400 self-end mb-2">→</span>

      <div class="flex flex-col">
        <span class="text-[9px] text-[#bc85ab] font-bold uppercase mb-1">Hora obertura</span>
        <input 
          type="time" 
          v-model="form.control_horari.hora_fi" 
          class="border rounded-lg px-2 py-1 text-sm outline-none focus:border-[#804f7f]"
        />
      </div>
    </div>
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
            <input v-model="form.adreca_inici" placeholder="Adreça del punt d'inici (Opcional, ex: Plaça Catalunya)" class="w-full border-2 border-purple-100 p-3 rounded-2xl bg-purple-50/30 text-xs shadow-sm font-bold text-purple-800 placeholder-purple-300 outline-none focus:border-purple-300">
            <input v-model="form.imatge_referencia" placeholder="URL Foto Principal (Realitat)" class="w-full border-2 border-gray-50 p-3 rounded-2xl bg-gray-50 text-xs shadow-sm">
            <input v-model="form.foto_mapa" placeholder="URL Foto Mapa (Dibuix esquemàtic)" class="w-full border-2 border-gray-50 p-3 rounded-2xl bg-gray-50 text-xs shadow-sm">
            <div class="bg-purple-50 border-2 border-purple-100 rounded-2xl p-4 mt-2">
              <h3 class="text-[11px] font-black text-purple-600 uppercase tracking-widest mb-3">🖼️ Cromo de la Ruta</h3>
              <p class="text-[10px] text-purple-500 mb-3">Escull la imatge del cromo que guanyaran els jugadors en completar aquesta ruta.</p>
              <select v-model="form.cromo_imatge" class="w-full border-2 border-purple-100 p-2.5 rounded-xl text-sm outline-none bg-white">
                <option value="">-- Sense cromo --</option>
                <option v-for="cromo in cromosDisponibles" :key="cromo.path" :value="cromo.path">
                  {{ cromo.nom }}
                </option>
              </select>
              <div v-if="form.cromo_imatge" class="mt-3 rounded-xl overflow-hidden border-2 border-purple-200 shadow-sm">
                <img :src="baseApi + form.cromo_imatge" class="w-full max-h-48 object-contain bg-purple-50" alt="Previsualització cromo" />
              </div>
            </div>
          </div>

          <!-- SECCIÓ LORE -->
          <div class="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 mt-2">
            <h3 class="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-3">📜 Carta de Lore</h3>
            <p class="text-[10px] text-amber-500 mb-3">Escull la carta que apareixerà a l'sobre quan els jugadors comencin la partida en aquesta ruta.</p>
            <select v-model="form.carta_lore" class="w-full border-2 border-amber-100 p-2.5 rounded-xl text-sm outline-none bg-white">
              <option value="">-- Sense carta de lore --</option>
              <option v-for="carta in cartesLoreDisponibles" :key="carta.path" :value="carta.path">
                {{ carta.nom }}
              </option>
            </select>
            <div v-if="form.carta_lore" class="mt-3 rounded-xl overflow-hidden border-2 border-amber-200 shadow-sm">
              <img :src="baseApi + form.carta_lore" class="w-full max-h-48 object-contain bg-amber-50" alt="Previsualització carta de lore" />
            </div>
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
          </div>

          <!-- Imatge del mapa per clicar -->
          <div v-if="form.foto_mapa" class="mb-4">
            <p class="text-xs text-gray-400 mb-2 font-bold uppercase">📍 Fes clic a la imatge per afegir un punt</p>
            <div
              class="relative border-4 border-purple-100 rounded-2xl overflow-hidden cursor-crosshair"
              style="max-width: 380px;"
            >
              <img
                :src="baseApi + '/foto_mapa/' + form.foto_mapa"
                ref="imatgeMapaRef"
                class="w-full block select-none"
                @click="clicAlMapa"
                alt="Mapa"
              />
              <!-- Marcadors sobre la imatge -->
              <div
                v-for="(punt, i) in form.punts_missio"
                :key="i"
                class="absolute flex items-center justify-center rounded-full font-bold text-xs shadow-md border-2 border-white"
                :style="{ left: punt.posicio_x + '%', top: punt.posicio_y + '%', width:'28px', height:'28px', background:'#bc85ab', color:'#fff', transform:'translate(-50%,-50%)' }"
                :title="punt.nom_punt"
              >
                {{ i + 1 }}
              </div>
            </div>

            <div v-if="puntPendent" class="mt-3 p-4 border-2 border-purple-100 rounded-2xl bg-purple-50/40">
              <p class="text-xs font-black text-purple-400 uppercase mb-2">Nou punt ({{ puntPendent.posicio_x.toFixed(1) }}%, {{ puntPendent.posicio_y.toFixed(1) }}%)</p>
              <input v-model="puntPendent.nom_punt" placeholder="Nom del punt (ex: Façana principal)" class="w-full border-2 border-gray-100 p-2 rounded-xl text-sm mb-2 outline-none" />
              <textarea v-model="puntPendent.pista" placeholder="💡 Pista per trobar el punt... (Cost: 1 pista)" class="w-full border-2 border-gray-100 p-2 rounded-xl text-sm mb-2 italic outline-none" rows="2"></textarea>

              <!-- Selector d'imatge -->
              <div class="mb-3">
                <label class="text-[10px] font-bold text-purple-400 uppercase mb-1 block">Imatge del punt</label>
                <select v-model="puntPendent.imatge_referencia" class="w-full border-2 border-gray-100 p-2 rounded-xl text-sm outline-none bg-white">
                  <option value="">-- Sense imatge --</option>
                  <option v-for="foto in fotosDisponibles" :key="foto.path" :value="foto.path">{{ foto.carpeta }} / {{ foto.nom }}</option>
                </select>
                <div v-if="puntPendent.imatge_referencia" class="mt-2 rounded-xl overflow-hidden border-2 border-purple-100">
                  <img :src="baseApi + puntPendent.imatge_referencia" class="w-full max-h-32 object-cover" alt="Previsualització" />
                </div>
              </div>

              <!-- Associar a un personatge -->
              <div class="mb-3 p-3 border-2 border-purple-100 rounded-xl bg-white">
                <label class="text-[10px] font-bold text-purple-400 uppercase mb-2 block">Associat a un personatge?</label>
                <div class="flex gap-3 mb-2">
                  <button
                    type="button"
                    @click="puntPendentEsPersonatge = false; puntPendent.personatge_id = null;"
                    :class="puntPendentEsPersonatge ? 'bg-gray-100 text-gray-500' : 'bg-purple-600 text-white'"
                    class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >No</button>
                  <button
                    type="button"
                    @click="puntPendentEsPersonatge = true"
                    :class="puntPendentEsPersonatge ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'"
                    class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >Sí</button>
                </div>

                <div v-if="puntPendentEsPersonatge">
                  <select v-model="puntPendent.personatge_id" class="w-full border-2 border-gray-100 p-2 rounded-xl text-sm outline-none bg-gray-50">
                    <option :value="null">-- Selecciona un personatge --</option>
                    <option
                      v-for="p in personatgesDisponibles"
                      :key="p._id"
                      :value="p._id"
                    >{{ p.nom }}</option>
                  </select>

                  <!-- Previsualitzacio del personatge seleccionat -->
                  <div v-if="puntPendent.personatge_id" class="mt-2 flex items-center gap-3 p-2 bg-purple-50 rounded-xl border border-purple-100">
                    <img
                      v-if="personatgeSeleccionat(puntPendent.personatge_id).imatge"
                      :src="baseApi + personatgeSeleccionat(puntPendent.personatge_id).imatge"
                      class="w-12 h-12 object-cover rounded-lg border border-purple-200 flex-shrink-0"
                    />
                    <div>
                      <p class="text-xs font-black text-purple-700">{{ personatgeSeleccionat(puntPendent.personatge_id).nom }}</p>
                      <p class="text-[10px] text-gray-500 leading-tight">{{ personatgeSeleccionat(puntPendent.personatge_id).descripcio }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="text-[10px] font-bold text-purple-400 uppercase mb-1 block">📸 Foto Històrica (contraportada)</label>
                <select v-model="puntPendent.foto_historica" class="w-full border-2 border-gray-100 p-2 rounded-xl text-sm outline-none bg-white">
                  <option value="">-- Sense foto històrica --</option>
                  <option v-for="foto in fotosHistoriquesDisponibles" :key="foto.path" :value="foto.path">{{ foto.carpeta }} / {{ foto.nom }}</option>
                </select>
                <div v-if="puntPendent.foto_historica" class="mt-2 rounded-xl overflow-hidden border-2 border-amber-100">
                  <img :src="baseApi + puntPendent.foto_historica" class="w-full max-h-32 object-cover" alt="Previsu. històrica" />
                </div>
              </div>

              <div class="mb-3">
                <label class="text-[10px] font-bold text-purple-400 uppercase mb-1 block">📜 Text històric (contraportada)</label>
                <textarea v-model="puntPendent.text_historic" placeholder="Explica la historia i cultura d'aquest punt..." class="w-full border-2 border-gray-100 p-2 rounded-xl text-sm outline-none" rows="3"></textarea>
              </div>

              <div class="flex gap-2">
                <button type="button" @click="confirmarPunt" class="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-purple-700">Afegir punt</button>
                <button type="button" @click="puntPendent = null; puntPendentEsPersonatge = false;" class="flex-1 bg-gray-100 text-gray-500 py-2 rounded-xl text-sm font-bold">Cancel·lar</button>
              </div>
            </div>
          </div>
          <div v-else class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm text-yellow-700">
            ⚠️ Afegeix el nom del fitxer de <strong>Foto Mapa</strong> a dalt per poder col·locar els punts visualment.
          </div>

          <!-- Llista de punts amb opció d'editar nom/pista i eliminar -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(punt, i) in form.punts_missio" :key="i" class="p-4 border-2 border-gray-50 rounded-2xl bg-white relative group">
              <button @click="eliminarPunt(i)" type="button" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 font-bold">×</button>
              <div class="flex items-center gap-2 mb-2">
                <span class="w-6 h-6 rounded-full bg-[#bc85ab] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{{ i + 1 }}</span>
                <input v-model="punt.nom_punt" placeholder="Nom del punt" class="flex-1 font-bold text-sm border-b outline-none" />
              </div>
              <textarea v-model="punt.pista" placeholder="💡 Pista per trobar el punt..." class="w-full text-xs italic text-gray-500 outline-none mb-2 border-b border-gray-100" rows="1"></textarea>
              <!-- Selector d'imatge per punt guardat -->
              <div class="mt-1 mb-2">
                <label class="text-[9px] font-bold text-purple-400 uppercase mb-1 block">🖼️ Imatge del punt</label>
                <select v-model="punt.imatge_referencia" class="w-full border border-gray-200 p-1.5 rounded-lg text-xs outline-none bg-gray-50">
                  <option value="">-- Sense imatge --</option>
                  <option v-for="foto in fotosDisponibles" :key="foto.path" :value="foto.path">{{ foto.carpeta }} / {{ foto.nom }}</option>
                </select>
                <div v-if="punt.imatge_referencia" class="mt-1.5 rounded-lg overflow-hidden border border-purple-100">
                  <img :src="baseApi + punt.imatge_referencia" class="w-full max-h-24 object-cover" alt="Imatge assignada" />
                </div>
              </div>
              <!-- Foto històrica per la contraportada -->
              <div class="mt-1 mb-2">
                <label class="text-[9px] font-bold text-amber-500 uppercase mb-1 block">📸 Foto Històrica</label>
                <select v-model="punt.foto_historica" class="w-full border border-gray-200 p-1.5 rounded-lg text-xs outline-none bg-gray-50">
                  <option value="">-- Sense --</option>
                  <option v-for="foto in fotosHistoriquesDisponibles" :key="foto.path" :value="foto.path">{{ foto.carpeta }} / {{ foto.nom }}</option>
                </select>
                <div v-if="punt.foto_historica" class="mt-1.5 rounded-lg overflow-hidden border border-amber-200">
                  <img :src="baseApi + punt.foto_historica" class="w-full max-h-24 object-cover" alt="Històrica" />
                </div>
              </div>

              <!-- Text històric per la contraportada -->
              <div class="mt-1 mb-2">
                <label class="text-[9px] font-bold text-amber-500 uppercase mb-1 block">📜 Text Històric</label>
                <textarea v-model="punt.text_historic" placeholder="Text històric del punt..." class="w-full border border-gray-200 p-1.5 rounded-lg text-xs outline-none" rows="2"></textarea>
              </div>

              <p class="text-[10px] text-gray-400">X: {{ punt.posicio_x?.toFixed(1) }}% / Y: {{ punt.posicio_y?.toFixed(1) }}%</p>

              <!-- Personatge associat -->
              <div class="mt-2 pt-2 border-t border-gray-50">
                <label class="text-[9px] font-bold text-purple-400 uppercase mb-1 block">Personatge associat</label>
                <select v-model="punt.personatge_id" class="w-full border border-gray-200 p-1.5 rounded-lg text-xs outline-none bg-gray-50">
                  <option :value="null">-- Cap personatge --</option>
                  <option v-for="p in personatgesDisponibles" :key="p._id" :value="p._id">{{ p.nom }}</option>
                </select>
                <div v-if="punt.personatge_id && personatgeSeleccionat(punt.personatge_id).nom" class="mt-1.5 flex items-center gap-2 p-1.5 bg-purple-50 rounded-lg">
                  <img
                    v-if="personatgeSeleccionat(punt.personatge_id).imatge"
                    :src="baseApi + personatgeSeleccionat(punt.personatge_id).imatge"
                    class="w-8 h-8 object-cover rounded-md border border-purple-200 flex-shrink-0"
                  />
                  <span class="text-[10px] font-black text-purple-600">{{ personatgeSeleccionat(punt.personatge_id).nom }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 flex gap-4 pt-6 border-t border-gray-100">
          <button 
            type="submit" 
            :class="[
              'flex-1 py-4 rounded-2xl font-bold uppercase shadow-lg transition-all',
              hayCambios 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-100 text-purple-300 cursor-default'
            ]"
          >
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
          <button @click="mostrarPopupUbi = false" class="flex-1 py-3 text-gray-400 font-bold uppercase text-xs">Cancel·lar</button>
          <button @click="procesarCoordenadas" class="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold uppercase text-xs shadow-lg">Aplicar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed, onUnmounted } from 'vue';
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

const baseApi = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';
const imatgeMapaRef = ref(null);
const puntPendent = ref(null);
const fotosDisponibles = ref([]);
const fotosHistoriquesDisponibles = ref([]);
const personatgesDisponibles = ref([]);
const cartesLoreDisponibles = ref([]);
const cromosDisponibles = ref([]);
const puntPendentEsPersonatge = ref(false);

const props = defineProps({
  datosIniciales: Object,
  editandoId: String
});

const emit = defineEmits(['save', 'eliminar']);

// Clonar los datos iniciales para que el formulario sea independiente
const form = ref(JSON.parse(JSON.stringify(props.datosIniciales)));
const formOriginal = ref(""); // Ho guardarem com a string per comparar fàcilment

const prepararFormulari = (dades) => {
  const clon = JSON.parse(JSON.stringify(dades));
  if (clon.punts_missio) {
    clon.punts_missio = clon.punts_missio.map(p => ({
      ...p,
      personatge_id: (p.personatge_id && typeof p.personatge_id === 'object') ? p.personatge_id._id : p.personatge_id
    }));
  }
  // Assegurem que control_horari té sempre els camps del nou model
  clon.control_horari = {
    actiu: clon.control_horari?.actiu ?? false,
    hora_inici: clon.control_horari?.hora_inici ?? "22:00",
    hora_fi: clon.control_horari?.hora_fi ?? "07:00"
  };
  return clon;
};

// Inicialització
form.value = prepararFormulari(props.datosIniciales);
formOriginal.value = JSON.stringify(form.value);

// Actualitzar el formulario si los props cambian (al cambiar de lloc)
watch(() => props.datosIniciales, (val) => {
  form.value = prepararFormulari(val);
  formOriginal.value = JSON.stringify(form.value);
  
  if (map && marker) {
    marker.setLatLng([form.value.lat, form.value.lng]);
    map.setView([form.value.lat, form.value.lng], 15);
  }
}, { deep: true });

const hayCambios = computed(() => {
  return JSON.stringify(form.value) !== formOriginal.value;
});

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
const eliminarPunt = (index) => form.value.punts_missio.splice(index, 1);

function clicAlMapa(event) {
  if (puntPendent.value) return;
  var img = imatgeMapaRef.value;
  var rect = img.getBoundingClientRect();
  var x = ((event.clientX - rect.left) / rect.width) * 100;
  var y = ((event.clientY - rect.top) / rect.height) * 100;
  puntPendent.value = {
    posicio_x: parseFloat(x.toFixed(2)),
    posicio_y: parseFloat(y.toFixed(2)),
    nom_punt: '',
    pista: '',
    imatge_referencia: '',
    foto_historica: '',
    text_historic: '',
    personatge_id: null
  };
  puntPendentEsPersonatge.value = false;
}

function confirmarPunt() {
  if (!puntPendent.value) return;
  form.value.punts_missio.push({ ...puntPendent.value });
  puntPendent.value = null;
  puntPendentEsPersonatge.value = false;
}

// Retorna el personatge de la llista a partir del seu _id
function personatgeSeleccionat(id) {
  var trobat = personatgesDisponibles.value.find(function(p) {
    const targetId = (id && typeof id === 'object') ? id._id : id;
    return p._id === targetId;
  });
  return trobat || { nom: '', descripcio: '', imatge: '' };
}

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

function enviarFormulario() {
  emit('save', { ...form.value });
}

async function carregarFotos() {
  try {
    var resposta = await fetch(baseApi + '/api/fotos-actuals/totes');
    if (!resposta.ok) return;
    var dades = await resposta.json();
    fotosDisponibles.value = dades.fotos || [];
  } catch (err) {
    console.error('Error carregant fotos:', err);
  }
}

async function carregarFotosHistoriques() {
  try {
    var resposta = await fetch(baseApi + '/api/fotos-historiques/totes');
    if (!resposta.ok) return;
    var dades = await resposta.json();
    fotosHistoriquesDisponibles.value = dades.fotos || [];
  } catch (err) {
    console.error('Error carregant fotos històriques:', err);
  }
}

async function carregarPersonatges() {
  try {
    var resposta = await fetch(baseApi + '/api/personatges');
    if (!resposta.ok) return;
    personatgesDisponibles.value = await resposta.json();
  } catch (err) {
    console.error('Error carregant personatges:', err);
  }
}

async function carregarCartesLore() {
  try {
    var resposta = await fetch(baseApi + '/api/carta-lore/totes');
    if (!resposta.ok) return;
    var dades = await resposta.json();
    cartesLoreDisponibles.value = dades.cartes || [];
  } catch (err) {
    console.error('Error carregant cartes de lore:', err);
  }
}

async function carregarCromos() {
  try {
    var resposta = await fetch(baseApi + '/api/cromos/totes');
    if (!resposta.ok) return;
    var dades = await resposta.json();
    cromosDisponibles.value = dades.cromos || [];
  } catch (err) {
    console.error('Error carregant cromos:', err);
  }
}

onUnmounted(function() {
  if (map) {
    try {
      map.remove();
    } catch (e) {
      console.warn("Error removing admin map:", e);
    }
    map = null;
  }
});

onMounted(function() {
  initMapa();
  carregarFotos();
  carregarFotosHistoriques();
  carregarPersonatges();
  carregarCartesLore();
  carregarCromos();
});
</script>