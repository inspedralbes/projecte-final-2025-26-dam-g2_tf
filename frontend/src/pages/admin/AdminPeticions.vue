<template>
  <div class="min-h-screen bg-gray-100 flex text-gray-800">
    <aside class="w-64 bg-[#402749] text-white p-6">
      <h2 class="text-2xl font-bold mb-8">Admin</h2>
      <nav class="flex flex-col gap-4">
        <router-link v-for="link in menu" :key="link.to" :to="link.to" 
          class="hover:text-pink-300" :class="{'font-bold text-pink-300': $route.path === link.to}">
          {{ link.text }}
        </router-link>
        <button @click="logout" class="mt-10 text-red-400 text-left">Tancar Sessió</button>
      </nav>
    </aside>

    <main class="flex-1 p-10">
      <h1 class="text-3xl font-bold mb-8 text-[#402749]">Peticions de Nous Llocs</h1>

      <div class="bg-white shadow rounded-xl overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th class="p-4">Usuari</th><th class="p-4">Lloc Proposat</th>
              <th class="p-4">Estat</th><th class="p-4">Detalls</th>
              <th class="p-4 text-right">Accions</th>
            </tr>
          </thead>
          
          <tbody class="divide-y">
            <template v-for="p in peticions" :key="p._id">
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="p-4 flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center font-bold text-[#402749]">
                    {{ p.id_usuari?.nom_usuari?.[0].toUpperCase() || '?' }}
                  </div>
                  {{ p.id_usuari?.nom_usuari || 'Desconegut' }}
                </td>
                <td class="p-4 font-medium">{{ p.nom_proposat }}</td>
                <td class="p-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold uppercase" :class="getStatusColor(p.estat_validacio)">
                    {{ p.estat_validacio }}
                  </span>
                </td>
                <td class="p-4">
                  <button @click="p.expandit = !p.expandit" class="text-[#804f7f] text-sm font-semibold hover:underline">
                    {{ p.expandit ? 'Amagar' : 'Veure info' }}
                  </button>
                </td>
                <td class="p-4 text-right">
                  <div v-if="p.estat_validacio === 'pendent'" class="flex justify-end gap-2">
                    <button @click="votar(p._id, 'acceptada')" class="text-green-600 font-bold p-1">Acceptar</button>
                    <button @click="votar(p._id, 'rebutjada')" class="text-red-600 font-bold p-1">Rebutjar</button>
                  </div>
                  <span v-else class="text-gray-400 italic text-xs">Finalitzat</span>
                </td>
              </tr>

              <tr v-if="p.expandit" class="bg-gray-50/50">
                <td colspan="5" class="p-6">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 class="text-[10px] font-black text-gray-400 uppercase mb-2">Descripció</h4>
                      <p class="text-sm italic bg-white p-3 rounded border shadow-sm">{{ p.motiu || 'Sense descripció' }}</p>
                    </div>
                    <div class="h-40">
  <h4 class="text-[10px] font-black text-gray-400 uppercase mb-2">Mapa</h4>
  <iframe 
    v-if="p.ubicacio && p.ubicacio.length === 2" 
    class="w-full h-full rounded border" 
    frameborder="0" 
    :src="`https://www.openstreetmap.org/export/embed.html?bbox=${p.ubicacio[1]-0.01},${p.ubicacio[0]-0.01},${p.ubicacio[1]+0.01},${p.ubicacio[0]+0.01}&layer=mapnik&marker=${p.ubicacio[0]},${p.ubicacio[1]}`">
  </iframe>
</div>
                    <div>
                      <h4 class="text-[10px] font-black text-gray-400 uppercase mb-2">Fotos</h4>
                      <div class="flex gap-2 flex-wrap">
                        <img v-for="img in p.fotos_proporcionades" :key="img" :src="img" class="h-16 w-16 object-cover rounded border">
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
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
const menu = [
  { to: '/admin/dashboard', text: 'Inici' },
  { to: '/admin/llocs', text: 'Llocs' },
  { to: '/admin/peticions', text: 'Peticions' }
];

const cargarPeticiones = async () => {
  const res = await fetch('http://localhost:8088/api/admin/peticions');
  const dades = await res.json();
  peticions.value = dades.map(p => ({ ...p, expandit: false }));
};

const votar = async (id, estat) => {
  if (!confirm(`Vols ${estat} la petició?`)) return;
  await fetch(`http://localhost:8088/api/admin/peticions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estat_validacio: estat })
  });
  cargarPeticiones();
};

const getStatusColor = (s) => ({
  'pendent': 'bg-blue-100 text-blue-700',
  'acceptada': 'bg-green-100 text-green-700',
  'rebutjada': 'bg-red-100 text-red-700'
}[s.toLowerCase()] || 'bg-gray-100');

const logout = () => {
  localStorage.removeItem('admin_session');
  router.push('/admin/login');
};

onMounted(cargarPeticiones);
</script>