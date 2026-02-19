<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <div class="w-64 bg-[#402749] text-white p-6">
      <h2 class="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav class="space-y-4">
        <router-link to="/admin/dashboard" class="block py-2 px-4 rounded hover:bg-[#5d3962]">Inici</router-link>
        <router-link to="/admin/llocs" class="block py-2 px-4 rounded hover:bg-[#5d3962]">Gestionar Llocs</router-link>
        <router-link to="/admin/peticions" class="block py-2 px-4 rounded bg-[#5d3962]">Peticions Usuaris</router-link>
        <button @click="logout" class="block w-full text-left py-2 px-4 rounded hover:bg-red-700 mt-8 text-red-300">Tancar Sessió</button>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-10 overflow-y-auto">
      <h1 class="text-3xl font-bold text-[#402749] mb-8">Peticions de Nous Llocs</h1>

      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-sm font-bold text-gray-600">Usuari</th>
              <th class="px-6 py-3 text-sm font-bold text-gray-600">Lloc Proposat</th>
              <th class="px-6 py-3 text-sm font-bold text-gray-600">Motiu / Descripció</th>
              <th class="px-6 py-3 text-sm font-bold text-gray-600">Estat</th>
              <th class="px-6 py-3 text-sm font-bold text-gray-600 text-right">Accions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="peticio in peticions" :key="peticio._id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-[#f5cbdd] flex items-center justify-center text-[#402749] font-bold mr-3">
                    {{ peticio.id_usuari ? peticio.id_usuari.nom_usuari.charAt(0) : '?' }}
                  </div>
                  <span class="text-sm font-medium">{{ peticio.id_usuari ? peticio.id_usuari.nom_usuari : 'Usuari desconegut' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 font-medium text-gray-900">{{ peticio.nom_proposat }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ peticio.motiu }}</td>
              <td class="px-6 py-4">
                <span :class="`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(peticio.estat_validacio)}`">
                  {{ peticio.estat_validacio }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <div v-if="peticio.estat_validacio === 'pendent'">
                  <button @click="gestionarPeticio(peticio._id, 'acceptada')" class="text-green-600 hover:text-green-800 font-medium">Acceptar</button>
                  <span class="text-gray-300">|</span>
                  <button @click="gestionarPeticio(peticio._id, 'rebutjada')" class="text-red-600 hover:text-red-800 font-medium">Rebutjar</button>
                </div>
                <div v-else class="text-gray-400 italic text-sm">
                  Ja gestionada
                </div>
              </td>
            </tr>
            <tr v-if="peticions.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-gray-400">No hi ha peticions pendents.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const peticions = ref([]);

onMounted(function() {
  fetchPeticions();
});

async function fetchPeticions() {
  try {
    const response = await fetch('http://localhost:8088/api/admin/peticions');
    const dades = await response.json();
    peticions.value = dades;
  } catch (err) {
    console.error("Error carregant peticions:", err);
  }
}

async function gestionarPeticio(id, nouEstat) {
  const accio = nouEstat === 'acceptada' ? 'acceptar' : 'rebutjar';
  if (confirm(`Estàs segur que vols ${accio} aquesta petició?`)) {
    try {
      const response = await fetch(`http://localhost:8088/api/admin/peticions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estat_validacio: nouEstat })
      });
      
      if (response.ok) {
        fetchPeticions();
      }
    } catch (err) {
      console.error("Error gestionant petició:", err);
    }
  }
}

function getStatusClass(status) {
  if (status === 'pendent') return 'bg-blue-100 text-blue-700';
  if (status === 'acceptada') return 'bg-green-100 text-green-700';
  if (status === 'rebutjada') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}

function logout() {
  localStorage.removeItem('admin_session');
  router.push('/admin/login');
}
</script>
