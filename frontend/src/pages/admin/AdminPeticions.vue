<template>
  <div class="min-h-screen bg-gray-100 flex text-gray-800">
    
    <aside class="w-64 bg-[#402749] text-white p-6">
      <h2 class="text-2xl font-bold mb-8">Admin</h2>
      <nav class="flex flex-col gap-4">
        <router-link to="/admin/dashboard" class="hover:text-pink-300">Inici</router-link>
        <router-link to="/admin/llocs" class="hover:text-pink-300">Llocs</router-link>
        <router-link to="/admin/peticions" class="font-bold text-pink-300">Peticions</router-link>
        <button @click="logout" class="mt-10 text-red-400 text-left">Tancar Sessió</button>
      </nav>
    </aside>

    <main class="flex-1 p-10">
      <h1 class="text-3xl font-bold mb-8 text-[#402749]">Peticions de Nous Llocs</h1>

      <div class="bg-white shadow rounded-xl overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b">
            <tr class="text-xs uppercase text-gray-500">
              <th class="p-4">Usuari</th>
              <th class="p-4">Lloc Proposat</th>
              <th class="p-4">Estat</th>
              <th class="p-4 text-right">Accions</th>
            </tr>
          </thead>
          
          <tbody class="divide-y">
            <tr v-for="p in peticions" :key="p._id" class="hover:bg-gray-50">
              
              <td class="p-4 flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center font-bold text-[#402749]">
                  {{ p.id_usuari ? p.id_usuari.nom_usuari[0] : '?' }}
                </div>
                {{ p.id_usuari ? p.id_usuari.nom_usuari : 'Desconegut' }}
              </td>

              <td class="p-4 font-medium">{{ p.nom_proposat }}</td>

              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="getStatusColor(p.estat_validacio)">
                  {{ p.estat_validacio }}
                </span>
              </td>

              <td class="p-4 text-right">
                <div v-if="p.estat_validacio === 'pendent'" class="flex justify-end gap-4">
                  <button @click="votar(p._id, 'acceptada')" class="text-green-600 font-bold">Acceptar</button>
                  <button @click="votar(p._id, 'rebutjada')" class="text-red-600 font-bold">Rebutjar</button>
                </div>
                <span v-else class="text-gray-400 italic text-xs">Finalitzat</span>
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
import { useRouter } from 'vue-router';

const router = useRouter();
const peticions = ref([]);

// Cargar datos al empezar
onMounted(() => cargarPeticiones());

async function cargarPeticiones() {
  const res = await fetch('http://localhost:8088/api/admin/peticions');
  peticions.value = await res.json();
}

async function votar(id, nuevoEstado) {
  if (!confirm(`Vols canviar l'estat a ${nuevoEstado}?`)) return;

  await fetch(`http://localhost:8088/api/admin/peticions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estat_validacio: nuevoEstado })
  });
  
  cargarPeticiones(); // Recargar la tabla
}

// Función simple para los colores
function getStatusColor(status) {
  if (status === 'pendent')   return 'bg-blue-100 text-blue-700';
  if (status === 'acceptada') return 'bg-green-100 text-green-700';
  if (status === 'rebutjada') return 'bg-red-100 text-red-700';
  return 'bg-gray-100';
}

function logout() {
  localStorage.removeItem('admin_session');
  router.push('/admin/login');
}
</script>