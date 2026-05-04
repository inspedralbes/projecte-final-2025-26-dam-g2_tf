<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0 font-sans">
    <AdminNav />

    <main class="flex-1 p-6 md:p-10">

      <!-- CAPCALERA -->
      <header class="mb-10 animate-fade-in">
        <div class="flex items-center gap-3 mb-2">
    
          <div>
            <h1 class="text-3xl font-black text-[#402749] tracking-tight">Gestio de Personatges</h1>
          </div>
        </div>
      </header>

      <!-- FORMULARI AFEGIR / EDITAR -->
      <section class="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-10 animate-fade-in">
        <h2 class="text-lg font-black text-[#402749] mb-6 uppercase tracking-widest text-xs">
          {{ editantId ? 'Editant Personatge' : 'Nou Personatge' }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Nom -->
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Nom *</label>
            <input
              v-model="formNom"
              type="text"
              placeholder="Nom del personatge..."
              class="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#bc85ab] outline-none transition-all"
            />
          </div>

          <!-- Imatge -->
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Imatge</label>
            <div class="flex items-center gap-3">
              <label class="cursor-pointer bg-[#402749] hover:bg-[#5d3962] text-white text-xs font-black uppercase px-4 py-3 rounded-2xl transition-all shadow-sm">
                Seleccionar foto
                <input type="file" accept="image/*" class="hidden" @change="onFotoSeleccionada" />
              </label>
              <span v-if="formNomFitxer" class="text-xs text-gray-500 truncate max-w-[150px]">{{ formNomFitxer }}</span>
              <span v-else class="text-xs text-gray-400 italic">Cap fitxer seleccionat</span>
            </div>
          </div>

          <!-- Descripcio (full width) -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Descripcio</label>
            <textarea
              v-model="formDescripcio"
              rows="3"
              placeholder="Descriu el personatge..."
              class="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#bc85ab] outline-none transition-all resize-none"
            ></textarea>
          </div>

        </div>

        <!-- Previsualitzacio imatge -->
        <div v-if="previsualitzacioImatge" class="mt-4 flex items-center gap-4">
          <img :src="previsualitzacioImatge" class="w-24 h-24 object-contain rounded-2xl border-2 border-[#bc85ab] shadow-md" alt="Previsualitzacio" />
          <button @click="eliminarFotoSeleccionada" class="text-xs text-red-400 hover:text-red-600 font-bold transition-colors">Treure foto</button>
        </div>

        <!-- Missatge d'error -->
        <p v-if="missatgeError" class="mt-3 text-red-500 text-xs font-bold">{{ missatgeError }}</p>

        <!-- Botons -->
        <div class="flex gap-3 mt-6">
          <button
            @click="guardarPersonatge"
            :disabled="estaGuardant"
            class="bg-[#402749] hover:bg-[#5d3962] text-white font-black uppercase text-xs px-6 py-3 rounded-2xl transition-all shadow-md disabled:opacity-50"
          >
            {{ estaGuardant ? 'Guardant...' : (editantId ? 'Actualitzar' : 'Afegir Personatge') }}
          </button>
          <button
            v-if="editantId"
            @click="cancellarEdicio"
            class="bg-gray-100 hover:bg-gray-200 text-gray-600 font-black uppercase text-xs px-6 py-3 rounded-2xl transition-all"
          >
            Cancellar
          </button>
        </div>
      </section>

      <!-- LLISTAT DE PERSONATGES -->
      <section class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Personatges ({{ personatges.length }})
          </h2>
          <button @click="carregarPersonatges" class="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm group" title="Refrescar">
            <svg :class="{ 'animate-spin': estaCarregant }" class="w-5 h-5 text-gray-600 group-hover:text-[#402749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Estat buit -->
        <div v-if="personatges.length === 0 && !estaCarregant" class="flex flex-col items-center justify-center py-24 text-center">
          <div class="bg-white p-8 rounded-full shadow-xl mb-6 ring-8 ring-purple-50">
            <svg class="w-16 h-16 text-[#bc85ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-black text-[#402749] mb-1">Sense personatges</h3>
          <p class="text-gray-400 text-sm max-w-xs mx-auto">Crea el primer personatge usant el formulari de dalt.</p>
        </div>

        <!-- Grid de personatges -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="p in personatges"
            :key="p._id"
            class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300"
          >
            <!-- Imatge -->
            <div class="relative w-full h-44 bg-gradient-to-br from-[#f5cbdd] to-[#bc85ab] overflow-hidden">
              <img
                v-if="p.imatge"
                :src="API_URL + p.imatge"
                :alt="p.nom"
                class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="p-4 flex-1 flex flex-col">
              <h3 class="font-black text-[#402749] text-sm mb-1 truncate">{{ p.nom }}</h3>
              <p class="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-3">
                {{ p.descripcio || 'Sense descripcio.' }}
              </p>
              <p class="text-[9px] font-mono text-gray-300 mt-3">{{ new Date(p.data_creacio).toLocaleDateString() }}</p>
            </div>

            <!-- Accions -->
            <div class="flex border-t border-gray-50">
              <button
                @click="editarPersonatge(p)"
                class="flex-1 py-3 text-[10px] font-black uppercase text-[#402749] hover:bg-purple-50 transition-all"
              >
                Editar
              </button>
              <div class="w-px bg-gray-100"></div>
              <button
                @click="eliminarPersonatge(p)"
                class="flex-1 py-3 text-[10px] font-black uppercase text-red-400 hover:bg-red-50 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminNav from './components/AdminNav.vue';
import { useCustomModal } from '../../composables/useCustomModal';

// URL del backend: usa la variable d'entorn si existeix, si no usa localhost per desenvolupament
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const { mostrarModal } = useCustomModal();

const personatges = ref([]);
const estaCarregant = ref(false);
const estaGuardant = ref(false);
const editantId = ref(null);
const missatgeError = ref('');
const previsualitzacioImatge = ref('');

// Variables del formulari separades (estil junior, sense objecte anidado)
const formNom = ref('');
const formDescripcio = ref('');
const formImatgeBase64 = ref('');
const formNomFitxer = ref('');

// Carrega tots els personatges del backend
async function carregarPersonatges() {
  estaCarregant.value = true;
  try {
    const res = await fetch(API_URL + '/api/personatges');
    if (res.ok) {
      personatges.value = await res.json();
    } else {
      console.error('[AdminPersonatges] Error en carregar');
    }
  } catch (err) {
    console.error('[AdminPersonatges] Error de xarxa:', err);
  }
  estaCarregant.value = false;
}

// Quan l'usuari selecciona una foto, la convertim a base64 per enviar-la al backend
function onFotoSeleccionada(event) {
  var fitxer = event.target.files[0];
  if (!fitxer) return;

  formNomFitxer.value = fitxer.name;

  var reader = new FileReader();
  reader.onload = function(e) {
    formImatgeBase64.value = e.target.result;
    previsualitzacioImatge.value = e.target.result;
  };
  reader.readAsDataURL(fitxer);
}

function eliminarFotoSeleccionada() {
  formImatgeBase64.value = '';
  formNomFitxer.value = '';
  previsualitzacioImatge.value = '';
}

// Guarda o actualitza un personatge
async function guardarPersonatge() {
  missatgeError.value = '';

  if (!formNom.value.trim()) {
    missatgeError.value = 'El nom del personatge es obligatori.';
    return;
  }

  estaGuardant.value = true;

  var payload = {
    nom: formNom.value.trim(),
    descripcio: formDescripcio.value.trim()
  };

  if (formImatgeBase64.value) {
    payload.imatge_base64 = formImatgeBase64.value;
  }

  try {
    var res;
    if (editantId.value) {
      // Actualitzar personatge existent
      res = await fetch(API_URL + '/api/personatges/' + editantId.value, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Crear nou personatge
      res = await fetch(API_URL + '/api/personatges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      await carregarPersonatges();
      resetForm();
    } else {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        var dades = await res.json();
        missatgeError.value = dades.message || 'Error en guardar el personatge.';
      } else {
        // Si no és JSON, probablement és un error del servidor o del proxy (ex: 413 Payload Too Large)
        if (res.status === 413) {
          missatgeError.value = 'La imatge es massa gran. Intenta-ho amb una foto mes petita.';
        } else {
          missatgeError.value = 'Error del servidor (status: ' + res.status + ').';
        }
      }
    }
  } catch (err) {
    console.error('[AdminPersonatges] Error en guardar:', err);
    missatgeError.value = 'Error de connexio. Comprova que el servidor funciona.';
  }

  estaGuardant.value = false;
}

// Omple el formulari amb les dades del personatge a editar
function editarPersonatge(p) {
  editantId.value = p._id;
  formNom.value = p.nom;
  formDescripcio.value = p.descripcio || '';
  formImatgeBase64.value = '';
  formNomFitxer.value = '';
  missatgeError.value = '';

  if (p.imatge) {
    previsualitzacioImatge.value = API_URL + p.imatge;
  } else {
    previsualitzacioImatge.value = '';
  }

  // Fem scroll cap amunt per veure el formulari
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Elimina un personatge
async function eliminarPersonatge(p) {
  const isConfirmed = await mostrarModal({ isAlert: false, title: 'Confirmació', message: 'Segur que vols eliminar "' + p.nom + '"?' });
  if (!isConfirmed) return;
  try {
    var res = await fetch(API_URL + '/api/personatges/' + p._id, { method: 'DELETE' });
    if (res.ok) {
      await carregarPersonatges();
    } else {
      await mostrarModal({ isAlert: true, message: 'Error en eliminar el personatge.' });
    }
  } catch (err) {
    console.error('[AdminPersonatges] Error en eliminar:', err);
  }
}

function cancellarEdicio() {
  resetForm();
}

function resetForm() {
  editantId.value = null;
  formNom.value = '';
  formDescripcio.value = '';
  formImatgeBase64.value = '';
  formNomFitxer.value = '';
  previsualitzacioImatge.value = '';
  missatgeError.value = '';
}

onMounted(carregarPersonatges);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}
</style>
