<template>
  <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-20 md:pb-0 font-sans">
    <AdminNav />

    <main class="flex-1 p-4 md:p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-purple-800">
          {{ mostrarForm ? (editandoId ? 'Editar Lloc' : 'Nou Lloc') : 'Llocs Històrics' }}
        </h1>
        <button @click="alternarVista" class="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-purple-700 transition-all">
          {{ mostrarForm ? 'Tornar' : '+ Nou Lloc' }}
        </button>
      </div>

      <AdminFormLloc 
        v-if="mostrarForm" 
        :datosIniciales="form" 
        :editandoId="editandoId"
        @save="guardarLloc"
        @eliminar="eliminarLloc"
      />

      <div v-else class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b text-left">
            <tr class="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black">
              <th class="p-6">Lloc </th>
              <th class="p-6 text-center">Estat</th>
    
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="lloc in llista" :key="lloc._id" @click="prepararEdicion(lloc)" class="hover:bg-purple-50/50 cursor-pointer transition-all group">
              <td class="p-6 flex items-center gap-6">
                <img :src="lloc.imatge_referencia" class="w-24 h-16 object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
                <div>
                  <div class="font-bold text-purple-800 text-lg">{{ lloc.nom }}</div>
                  <div class="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {{ lloc.barri || 'Sense barri' }}
                  </div>
                </div>
              </td>

              <td class="p-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span 
                    :class="lloc.control_horari?.actiu ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'"
                    class="text-[9px] font-black uppercase px-3 py-1 rounded-full"
                  >
                    {{ lloc.control_horari?.actiu ? 'Actiu' : 'Inactiu' }}
                  </span>
                  <span v-if="lloc.control_horari?.actiu" class="text-[10px] text-gray-400 font-mono">
                    {{ lloc.control_horari?.hora_tancament }}
                  </span>
                </div>
              </td>

              <td class="p-6 text-center">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminNav from './components/AdminNav.vue';
import AdminFormLloc from './components/AdminFormLloc.vue';

const API_URL = "http://localhost:8088/api/admin/llocs";
const llista = ref([]);
const mostrarForm = ref(false);
const editandoId = ref(null);

const resetForm = () => ({
  nom: '', 
  barri: '', 
  dificultat: 'Baixa', 
  descripcio: '', 
  explicacio_historica: '',
  imatge_referencia: '', 
  foto_mapa: '', 
  tags: [], 
  punts_missio: [],
  control_horari: { hora_tancament: '20:00', actiu: false },
  lat: 41.3879, 
  lng: 2.1699
});

const form = ref(resetForm());

onMounted(cargarLlocs);

async function cargarLlocs() {
  try {
    const res = await fetch(API_URL);
    llista.value = await res.json();
  } catch (err) {
    console.error("Error carregar:", err);
  }
}

function alternarVista() {
  if (mostrarForm.value) {
    mostrarForm.value = false;
  } else {
    editandoId.value = null;
    form.value = resetForm();
    mostrarForm.value = true;
  }
}

function prepararEdicion(lloc) {
  editandoId.value = lloc._id;
  form.value = { 
    ...lloc, 
    lat: lloc.ubicacio.coordinates[1], 
    lng: lloc.ubicacio.coordinates[0],
    // Aseguramos que el control_horari existe para evitar errores en el form
    control_horari: lloc.control_horari || { hora_tancament: '20:00', actiu: false }
  };
  mostrarForm.value = true;
}

async function guardarLloc(datos) {
  try {
    const payload = { 
      ...datos, 
      ubicacio: { 
        type: 'Point', 
        coordinates: [Number(datos.lng), Number(datos.lat)] 
      } 
    };

    const respuesta = await fetch(editandoId.value ? `${API_URL}/${editandoId.value}` : API_URL, {
      method: editandoId.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!respuesta.ok) throw new Error("Error al guardar");

    mostrarForm.value = false;
    editandoId.value = null;
    await cargarLlocs(); 
  } catch (error) {
    console.error("ERROR:", error);
    alert("No s'ha pogut guardar.");
  }
}

async function eliminarLloc(id) {
  if (confirm("Segur que vols eliminar-ho?")) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    mostrarForm.value = false;
    await cargarLlocs();
  }
}
</script>