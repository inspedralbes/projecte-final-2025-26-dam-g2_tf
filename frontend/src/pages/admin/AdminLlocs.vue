<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0">
    <AdminNav />

    <main class="flex-1 p-4 md:p-10">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-[#402749]">
          {{ mostrarForm ? (editandoId ? 'Editar Lloc' : 'Nou Lloc') : 'Llocs Històrics' }}
        </h1>
        <button 
          @click="alternarVista" 
          class="bg-[#bc85ab] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#9f6795] transition-colors"
        >
          {{ mostrarForm ? '← Tornar' : '+ Nou Lloc' }}
        </button>
      </div>

      <AdminFormLloc 
        v-if="mostrarForm" 
        :datosIniciales="form" 
        :editandoId="editandoId"
        @save="guardarLloc"
        @eliminar="eliminarLloc"
      />

      <div v-else class="bg-white rounded-xl shadow-md border-t-8 border-[#804f7f] overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b text-left">
            <tr class="text-[11px] text-[#bc85ab] uppercase tracking-[0.2em] font-black">
              <th class="p-6">Lloc </th>
              <th class="p-6 text-center">Estat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in llista" :key="item._id" @click="prepararEdicion(item)" class="hover:bg-[#f5cbdd]/10 cursor-pointer transition-all group">
              <td class="p-6 flex items-center gap-6">
                <img :src="item.imatge_referencia" class="h-16 w-24 object-cover rounded-lg border-2 border-[#d9a6c2] shadow-sm">
                <div>
                  <div class="font-bold text-[#402749] text-lg">{{ item.nom }}</div>
                  <div class="text-[10px] text-[#bc85ab] font-black uppercase tracking-widest">
                    {{ item.barri || 'Sense barri' }}
                  </div>
                </div>
              </td>
              <td class="p-6 text-center">
                <span 
                  :class="item.control_horari?.actiu ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'"
                  class="text-[9px] font-black uppercase px-3 py-1 rounded-full"
                >
                  {{ item.control_horari?.actiu ? 'Actiu' : 'Inactiu' }}
                </span>
              </td>
              <td class="p-6 text-center">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ConfirmModal 
        :obert="mostrarConfirm" 
        :titol="titolConfirm" 
        :missatge="missatgeConfirm" 
        @confirm="confirmarEliminar" 
        @close="mostrarConfirm = false" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AdminNav from './components/AdminNav.vue';
import AdminFormLloc from './components/AdminFormLloc.vue';
import ConfirmModal from './components/ConfirmModal.vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const PATH = `${API_URL}/api/mapa/punts`;

const llista = ref([]);
const mostrarForm = ref(false);
const editandoId = ref(null);
const mostrarConfirm = ref(false);
const idAEliminar = ref(null);
const pasConfirmacio = ref(1);

const titolConfirm = computed(() => {
  return pasConfirmacio.value === 1 ? "Eliminar Lloc?" : "⚠️ ESTÀS REALMENT SEGUR?";
});

const missatgeConfirm = computed(() => {
  return pasConfirmacio.value === 1 
    ? "¿Estàs segur que vols eliminar aquest lloc? Aquesta acció no es pot desfer."
    : "ATENCIÓ: Estàs a punt d'esborrar definitivament aquest punt del mapa. Aquesta acció és irreversible. Vols continuar?";
});

const resetForm = () => ({
  nom: '', barri: '', dificultat: 'Baixa', descripcio: '', explicacio_historica: '',
  imatge_referencia: '', foto_mapa: '', tags: [], punts_missio: [],
  control_horari: { hora_tancament: '20:00', actiu: false },
  lat: 41.3879, lng: 2.1699, adreca_inici: '',
  cromo_imatge: ''
});

const form = ref(resetForm());

const cargarDatos = async () => {
  try {
    const res = await fetch(PATH);
    const data = await res.json();
    llista.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error:", err);
  }
};

const alternarVista = () => {
  mostrarForm.value = !mostrarForm.value;
  if (!mostrarForm.value) {
    editandoId.value = null;
    form.value = resetForm();
  }
};

const prepararEdicion = (item) => {
  editandoId.value = item._id;
  form.value = { 
    ...item, 
    lat: item.ubicacio?.coordinates[1] || 41.3879, 
    lng: item.ubicacio?.coordinates[0] || 2.1699,
    adreca_inici: item.adreca_inici || '',
    control_horari: item.control_horari || { hora_tancament: '20:00', actiu: false },
    cromo_imatge: item.cromo_imatge || ''
  };
  mostrarForm.value = true;
};

const guardarLloc = async (datos) => {
  try {
    const payload = { 
      ...datos, 
      ubicacio: { type: 'Point', coordinates: [Number(datos.lng), Number(datos.lat)] } 
    };
    const url = editandoId.value ? `${PATH}/${editandoId.value}` : PATH;
    const res = await fetch(url, {
      method: editandoId.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      mostrarForm.value = false;
      cargarDatos();
    }
  } catch (error) {
    alert("Error al guardar");
  }
};

const eliminarLloc = (id) => {
  idAEliminar.value = id;
  pasConfirmacio.value = 1;
  mostrarConfirm.value = true;
};

const confirmarEliminar = async () => {
  if (!idAEliminar.value) return;
  
  if (pasConfirmacio.value === 1) {
    pasConfirmacio.value = 2;
    return;
  }
  
  try {
    await fetch(`${PATH}/${idAEliminar.value}`, { method: 'DELETE' });
    mostrarConfirm.value = false;
    mostrarForm.value = false;
    idAEliminar.value = null;
    pasConfirmacio.value = 1;
    cargarDatos();
  } catch (error) {
    alert("Error al eliminar");
  }
};

onMounted(cargarDatos);
</script>