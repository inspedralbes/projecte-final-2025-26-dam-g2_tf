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
              <th class="p-6 w-8"></th>
              <th class="p-6">Lloc</th>
              <th class="p-6 text-center">Restricció Horària</th>
              <th class="p-6 text-center">Estat</th>
              <th class="p-6 text-center">Ordre</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr 
              v-for="(item, index) in llista" 
              :key="item._id" 
              @click="prepararEdicion(item)" 
              draggable="true"
              @dragstart="handleDragStart(index)"
              @dragover.prevent
              @drop="handleDrop(index)"
              class="hover:bg-[#f5cbdd]/10 cursor-move transition-all group"
            >
              <td class="p-3 text-center" @click.stop>
                <span class="text-gray-400">⠿</span>
              </td>
              <td class="p-6 flex items-center gap-6">
                <img :src="item.imatge_referencia" class="h-16 w-24 object-cover rounded-lg border-2 border-[#d9a6c2] shadow-sm">
                <div>
                  <div class="font-bold text-[#402749] text-lg">{{ item.nom }}</div>
                  <div class="text-[10px] text-[#bc85ab] font-black uppercase tracking-widest">
                    {{ item.barri || 'Sense barri' }}
                  </div>
                </div>
              </td>
              <td class="p-6 text-center" @click.stop>
                <div class="flex flex-col items-center gap-1">
                  <button
                    @click="toggleRestricció(item)"
                    :class="item.control_horari?.actiu
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'"
                    class="flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black uppercase transition-all min-w-[120px]"
                  >
                    <span>{{ item.control_horari?.actiu ? 'Activada' : 'Desactivada' }}</span>
                  </button>
                  <span v-if="item.control_horari?.actiu" class="text-[9px] text-gray-400 font-semibold">
                    {{ String(item.control_horari?.hora_inici ?? 22).padStart(2,'0') }}:00 – {{ String(item.control_horari?.hora_fi ?? 7).padStart(2,'0') }}:00
                  </span>
                </div>
              </td>
              <td class="p-6 text-center" @click.stop>
                <select
                  v-model="item.estat"
                  @change="canviarEstat(item)"
                  class="px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all min-w-[130px]"
                  :class="item.estat === 'desactivat' ? 'border-[#402749] bg-[#402749]/10 text-[#402749]' : item.estat === 'properament' ? 'border-[#d9a6c2] bg-[#d9a6c2]/10 text-[#402749]' : 'border-green-300 bg-green-50 text-green-700'"
                >
                  <option value="actiu">Actiu</option>
                  <option value="desactivat">Desactivat</option>
                  <option value="properament">Properament</option>
                </select>
              </td>
              <td class="p-6 text-center" @click.stop>
                <span class="font-bold text-[#402749]">{{ item.ordre }}</span>
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
import { useCustomModal } from '../../composables/useCustomModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';
const PATH = `${API_URL}/api/mapa/punts`;
const { mostrarModal } = useCustomModal();

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
  control_horari: { actiu: false, hora_inici: 22, hora_fi: 7 },
  lat: 41.3879, lng: 2.1699, adreca_inici: '',
  cromo_imatge: '', fotos_historiques: [], carta_lore: ''
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
    control_horari: item.control_horari || { actiu: false, hora_inici: 22, hora_fi: 7 },
    cromo_imatge: item.cromo_imatge || '',
    carta_lore: item.carta_lore || ''
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
    await mostrarModal({ isAlert: true, message: "Error al guardar" });
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
    await mostrarModal({ isAlert: true, message: "Error al eliminar" });
  }
};

const toggleRestricció = async (item) => {
  const horariActual = item.control_horari || { actiu: false, hora_inici: 22, hora_fi: 7 };
  const nouActiu = !horariActual.actiu;
  try {
    const res = await fetch(`${API_URL}/api/admin/llocs/${item._id}/restriccio`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actiu: nouActiu })
    });
    if (res.ok) {
      item.control_horari = { ...horariActual, actiu: nouActiu };
    } else {
      await mostrarModal({ isAlert: true, message: "Error de connexió amb el servidor" });
    }
  } catch (err) {
    await mostrarModal({ isAlert: true, message: "Error de connexió amb el servidor" });
  }
};

const canviarEstat = async (item) => {
  try {
    const res = await fetch(`${API_URL}/api/admin/llocs/${item._id}/estat`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estat: item.estat, ordre: item.ordre })
    });
    if (!res.ok) {
      await mostrarModal({ isAlert: true, message: "Error de connexió amb el servidor" });
    }
  } catch (err) {
    await mostrarModal({ isAlert: true, message: "Error de connexió amb el servidor" });
  }
};

const dragStartIndex = ref(null);

const handleDragStart = (index) => {
  dragStartIndex.value = index;
};

const handleDrop = (destiIndex) => {
  if (dragStartIndex.value === null || dragStartIndex.value === destiIndex) return;
  
  // Moure element dins de l'array
  const [itemMogut] = llista.value.splice(dragStartIndex.value, 1);
  llista.value.splice(destiIndex, 0, itemMogut);
  dragStartIndex.value = null;

  // Sincronitzar amb el backend
  actualitzarOrdreTotal();
};

const actualitzarOrdreTotal = async () => {
  try {
    // Actualitzar els números d'ordre basant-se en la nova posició
    const llocsPerEnviar = llista.value.map((item, index) => {
      item.ordre = index + 1;
      return { id: item._id, ordre: item.ordre };
    });
    const res = await fetch(`${API_URL}/api/admin/llocs/reordenar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ llocs: llocsPerEnviar })
    });
    if (res.ok) {
      // Forçar re-render de la llista per mostrar els nous números
      llista.value = [...llista.value];
    } else {
      const errorData = await res.json();
      console.error("Error del servidor:", errorData.message);
      await mostrarModal({ isAlert: true, message: "Error al reordenar" });
    }
  } catch (err) {
    console.error("Error de connexió:", err);
    await mostrarModal({ isAlert: true, message: "Error de connexió al reordenar" });
  }
};

onMounted(cargarDatos);
</script>