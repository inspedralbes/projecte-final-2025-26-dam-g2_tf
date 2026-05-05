<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0">
    
    <AdminNav />

    <main class="flex-1 p-4 md:p-10">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-[#402749]">
          {{ peticionSeleccionada ? 'Detalls de la Petició' : 'Peticions de la Comunitat' }}
        </h1>
        <button 
          v-if="peticionSeleccionada" 
          @click="peticionSeleccionada = null" 
          class="bg-[#bc85ab] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[#9f6795] transition-colors"
        >
          ← Tornar
        </button>
      </div>

      <div v-if="peticionSeleccionada" class="bg-white p-6 rounded-xl shadow-md border-t-8 border-[#804f7f] animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div class="space-y-6">
            <div>
              <label class="text-[10px] font-black text-[#bc85ab] uppercase tracking-widest">Nom Proposat</label>
              <p class="text-2xl font-bold text-[#402749]">{{ peticionSeleccionada.nom_proposat }}</p>
            </div>

            <div>
              <label class="text-[10px] font-black text-[#bc85ab] uppercase tracking-widest">Descripció de l'usuari</label>
              <p class="text-gray-700 bg-[#f5cbdd]/20 p-4 rounded-lg italic border-l-4 border-[#bc85ab]">
                "{{ peticionSeleccionada.motiu || 'Sense descripció' }}"
              </p>
            </div>

            <div v-if="peticionSeleccionada.estat_validacio === 'pendent'" class="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                @click="votar(peticionSeleccionada, 'acceptada')" 
                class="flex-1 bg-[#402749] text-[#f5cbdd] py-4 rounded-xl font-bold uppercase shadow-lg hover:bg-[#5d3962] transition-all"
              >
                Aprovar i Publicar
              </button>

              <button 
                @click="votar(peticionSeleccionada, 'rebutjada')" 
                class="flex-1 bg-white text-[#402749] border-2 border-[#402749] py-4 rounded-xl font-bold uppercase shadow-md hover:bg-gray-50 transition-all"
              >
                Rebutjar
              </button>
            </div>
            
            <div v-else class="p-4 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-200">
              <span class="font-bold text-gray-400 uppercase">Petició {{ peticionSeleccionada.estat_validacio }}</span>
            </div>
          </div>

          <div class="space-y-4">
            <div class="h-64 rounded-xl border-4 border-[#f5cbdd] overflow-hidden shadow-sm">
              <iframe 
                class="w-full h-full" 
                frameborder="0" 
                :src="`https://www.openstreetmap.org/export/embed.html?bbox=${peticionSeleccionada.ubicacio[1]-0.005},${peticionSeleccionada.ubicacio[0]-0.005},${peticionSeleccionada.ubicacio[1]+0.005},${peticionSeleccionada.ubicacio[0]+0.005}&layer=mapnik&marker=${peticionSeleccionada.ubicacio[0]},${peticionSeleccionada.ubicacio[1]}`">
              </iframe>
            </div>
            <div class="flex gap-2 overflow-x-auto pb-2">
              <img v-for="img in peticionSeleccionada.fotos_proporcionades" :key="img" :src="img" class="h-24 w-24 object-cover rounded-lg border-2 border-[#d9a6c2]">
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-4">
        <div 
          v-for="p in peticions" 
          :key="p._id" 
          @click="peticionSeleccionada = p"
          class="bg-white p-5 rounded-xl shadow-sm border-l-8 cursor-pointer hover:shadow-md transition-all flex justify-between items-center group"
          :class="p.estat_validacio === 'pendent' ? 'border-[#804f7f]' : 'border-gray-200'"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-[#f5cbdd] flex items-center justify-center font-bold text-[#402749] shadow-sm">
              {{ p.id_usuari?.nom_usuari?.[0].toUpperCase() || '?' }}
            </div>
            <div>
              <h3 class="font-bold text-[#402749] group-hover:text-[#804f7f] transition-colors">{{ p.nom_proposat }}</h3>
              <p class="text-xs text-gray-400 font-medium">Enviat per {{ p.id_usuari?.nom_usuari || 'Usuari' }}</p>
            </div>
          </div>
          
          <div class="flex flex-col items-end gap-2">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="colorEstado(p.estat_validacio)">
              {{ p.estat_validacio }}
            </span>
            <span class="text-[10px] text-[#bc85ab] font-bold uppercase group-hover:translate-x-1 transition-transform">Revisar →</span>
          </div>
        </div>

        <div v-if="peticions.length === 0" class="text-center py-20">
          <p class="text-gray-400 italic">No hi ha peticions pendents de revisió.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminNav from './components/AdminNav.vue';
import { useCustomModal } from '../../composables/useCustomModal';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';
const { mostrarModal } = useCustomModal();

const peticions = ref([]);
const peticionSeleccionada = ref(null);

const cargarPeticiones = async () => {
  try {
    const res = await fetch(`${API_URL}/api/admin/peticions`);
    const data = await res.json();
    peticions.value = data.map(p => ({
      ...p,
      id: p._id 
    }));
  } catch (err) {
    console.error("Error carregar peticions:", err);
  }
};

const votar = async (peticion, nouEstat) => {

  const id = peticion._id || peticion.id;

  if (!id) {
    console.error("Dades de la petició:", peticion);
    await mostrarModal({ isAlert: true, message: "Error: No s'ha pogut trobar l'ID en l'objecte." });
    return;
  }

  const isConfirmed = await mostrarModal({ isAlert: false, title: 'Confirmació', message: `Vols marcar aquesta petició com a ${nouEstat}?` });
  if (!isConfirmed) return;
  
  try {
    const res = await fetch(`${API_URL}/api/admin/peticions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estat_validacio: nouEstat })
    });
    
    if (res.ok) {
      peticionSeleccionada.value = null; 
      await cargarPeticiones(); 
    } else {
      await mostrarModal({ isAlert: true, message: "Error en el servidor al actualitzar l'estat." });
    }
  } catch (err) {
    console.error("Error al votar:", err);
    await mostrarModal({ isAlert: true, message: "Error de connexió." });
  }
};

const colorEstado = (s) => {
  if (s === 'pendent') return 'bg-[#f5cbdd] text-[#402749]';
  if (s === 'acceptada') return 'bg-[#bc85ab] text-white';
  return 'bg-gray-100 text-gray-400';
};

onMounted(cargarPeticiones);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>