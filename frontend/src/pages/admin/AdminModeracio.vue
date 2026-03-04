<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0 font-sans">
    <AdminNav />

    <main class="flex-1 p-6 md:p-10">
      <header class="mb-10 animate-fade-in">
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-[#402749] p-2 rounded-lg shadow-lg">
            <svg class="w-6 h-6 text-[#f5cbdd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          <h1 class="text-3xl font-black text-[#402749] tracking-tight">Panell de Moderació</h1>
        </div>
        <p class="text-gray-500 font-medium">Supervisa l'activitat i manté l'entorn segur.</p>
      </header>

      <div v-if="seleccionats.length > 0" class="fixed bottom-6 right-6 z-50 animate-bounce-in">
        <div class="bg-[#402749] text-white p-4 rounded-3xl shadow-2xl border-2 border-[#f5cbdd] flex items-center gap-6">
          <p class="text-xs font-black uppercase tracking-widest">{{ seleccionats.length }} Seleccionats</p>
          <div class="flex gap-2">
            <button @click="accionsMassives('revisat')" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Validar Tot</button>
            <button @click="accionsMassives('eliminar')" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Eliminar Tot</button>
            <button @click="seleccionats = []" class="text-gray-300 hover:text-white text-[10px] font-bold uppercase px-2">Cancel·lar</button>
          </div>
        </div>
      </div>

      <div class="flex gap-4 mb-8 p-1 bg-gray-200/50 w-fit rounded-2xl border border-gray-200">
        <button 
          @click="tabActual = 'ressenyes'"
          :class="tabActual === 'ressenyes' ? 'bg-[#402749] text-white shadow-md' : 'text-gray-500 hover:bg-white'"
          class="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
        >
          Ressenyes
        </button>
        <button 
          @click="tabActual = 'posts'"
          :class="tabActual === 'posts' ? 'bg-[#402749] text-white shadow-md' : 'text-gray-500 hover:bg-white'"
          class="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
        >
          Posts Socials
        </button>
      </div>

      <section v-if="tabActual === 'posts'" class="animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="post in posts" 
            :key="post._id" 
            :class="[
              'bg-white rounded-3xl shadow-lg border overflow-hidden flex flex-col group transition-all duration-300 relative',
              post.reportat ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100',
              seleccionats.includes(post._id) ? 'ring-4 ring-[#bc85ab] border-[#bc85ab]' : ''
            ]"
          >
            <div class="absolute top-4 left-4 z-10">
              <input type="checkbox" :value="post._id" v-model="seleccionats" class="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#402749] cursor-pointer" />
            </div>

            <div class="p-5 pl-12 border-b border-gray-50 flex justify-between items-center" :class="post.reportat ? 'bg-red-50/50' : 'bg-gray-50/50'">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#5d3962] flex items-center justify-center text-[#f5cbdd] font-bold text-sm shadow-sm">
                  {{ post.nom_usuari?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-bold text-[#402749] text-sm">{{ post.nom_usuari }}</p>
                    <span v-if="post.reportat" class="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                      ⚠️ REPORTAT
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{{ new Date(post.timestamp).toLocaleDateString() }}</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button 
                  v-if="post.reportat" 
                  @click="marcarRevisat(post._id)" 
                  class="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-sm"
                >
                  ✅ Validar / Segur
                </button>
                <button @click="eliminarPost(post._id)" class="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  Eliminar
                </button>
              </div>
            </div>
            
            <div class="p-5 flex-1">
              <div v-if="post.reportat" class="mb-4 bg-orange-50 border border-orange-100 p-3 rounded-2xl">
                <p class="text-[10px] font-black text-orange-600 uppercase tracking-wider mb-1">Estat de Moderació:</p>
                <p class="text-xs text-orange-800 italic">Aquest post ha rebut una denúncia d'un usuari i està esperant revisió.</p>
              </div>

              <p class="text-sm text-gray-700 leading-relaxed mb-4">{{ post.text }}</p>
              
              <div v-if="post.imatges_post?.length" class="grid grid-cols-2 gap-2 mb-4">
                <img v-for="(img, i) in post.imatges_post" :key="i" :src="img" class="w-full h-32 object-cover rounded-xl shadow-inner border border-gray-100" />
              </div>

              <div class="space-y-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                <p class="text-[9px] font-black text-[#bc85ab] uppercase tracking-[0.2em] mb-2">Comentaris ({{ post.comentaris?.length }})</p>
                <div v-for="com in post.comentaris" :key="com.id_comentari" class="flex justify-between items-start gap-2 group/com">
                  <p class="text-xs text-gray-600">
                    <span class="font-bold text-[#402749]">{{ com.nom_usuari }}:</span> {{ com.text }}
                    <span v-if="com.reportat" class="ml-2 text-[9px] text-red-500 font-bold uppercase tracking-tighter">🚩 Reportat</span>
                  </p>
                  <button @click="eliminarComentari(post._id, com.id_comentari || com._id)" class="text-gray-300 hover:text-red-400">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="tabActual === 'ressenyes'" class="animate-fade-in">
        <div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-4 text-[10px] font-black uppercase text-gray-400">Usuari</th>
                <th class="p-4 text-[10px] font-black uppercase text-gray-400">Comentari</th>
                <th class="p-4 text-[10px] font-black uppercase text-gray-400 text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in ressenyes" :key="res._id" class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="p-4 font-bold text-sm text-[#402749]">{{ res.id_usuari?.nom_usuari || 'Anònim' }}</td>
                <td class="p-4 text-xs text-gray-600">{{ res.comentari }}</td>
                <td class="p-4 text-right">
                  <button @click="eliminarRessenya(res._id)" class="text-red-400 hover:text-red-600 font-bold text-[10px] uppercase">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminNav from './components/AdminNav.vue';

const API_URL = 'http://localhost:8088'; 
const tabActual = ref('posts');
const ressenyes = ref([]);
const posts = ref([]);
const seleccionats = ref([]);

const cargarDatos = async () => {
  try {
    const resPosts = await fetch(`${API_URL}/api/social/admin/posts`);
    if (resPosts.ok) {
        const dades = await resPosts.json();
        // NOMÉS CARREGUEM ELS QUE ESTAN REPORTATS
        posts.value = dades.filter(p => p.reportat === true);
    }
    
    const resRes = await fetch(`${API_URL}/api/social/admin/ressenyes`);
    if (resRes.ok) ressenyes.value = await resRes.json();
  } catch (err) {
    console.error("Error carregar dades:", err);
  }
};

const marcarRevisat = async (postId) => {
  if (!confirm("Vols marcar aquest post com a segur? Desapareixerà de la llista de moderació.")) return;
  try {
    const response = await fetch(`${API_URL}/api/social/admin/posts/${postId}/revisat`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      posts.value = posts.value.filter(p => p._id !== postId);
      seleccionats.value = seleccionats.value.filter(id => id !== postId);
    }
  } catch (err) { console.error(err); }
};

const eliminarPost = async (postId) => {
  if (!confirm("🚨 Eliminar el post sencer?")) return;
  try {
    const response = await fetch(`${API_URL}/api/social/posts/${postId}`, { method: 'DELETE' });
    if (response.ok) {
      posts.value = posts.value.filter(p => p._id !== postId);
      seleccionats.value = seleccionats.value.filter(id => id !== postId);
    }
  } catch (err) { console.error(err); }
};

const accionsMassives = async (tipus) => {
  const confirmacio = tipus === 'revisat' 
    ? `Vols validar ${seleccionats.value.length} posts com a segurs?` 
    : `Vols ELIMINAR ${seleccionats.value.length} posts definitivament?`;
  
  if (!confirm(confirmacio)) return;

  try {
    const promeses = seleccionats.value.map(id => {
      const url = tipus === 'revisat' ? `${API_URL}/api/social/admin/posts/${id}/revisat` : `${API_URL}/api/social/posts/${id}`;
      return fetch(url, { method: tipus === 'revisat' ? 'PUT' : 'DELETE' });
    });
    await Promise.all(promeses);
    posts.value = posts.value.filter(p => !seleccionats.value.includes(p._id));
    seleccionats.value = [];
  } catch (err) { console.error("Error en acció massiva:", err); }
};

const eliminarComentari = async (postId, comentariId) => {
  if (!confirm("Eliminar aquest comentari?")) return;
  try {
    const response = await fetch(`${API_URL}/api/social/posts/${postId}/comentaris/${comentariId}`, { method: 'DELETE' });
    if (response.ok) {
      const post = posts.value.find(p => p._id === postId);
      if (post) post.comentaris = post.comentaris.filter(c => (c.id_comentari || c._id) !== comentariId);
    }
  } catch (err) { console.error(err); }
};

const eliminarRessenya = async (id) => {
  if (!confirm("Eliminar ressenya?")) return;
  try {
    const response = await fetch(`${API_URL}/api/social/ressenyes/${id}`, { method: 'DELETE' });
    if (response.ok) ressenyes.value = ressenyes.value.filter(r => r._id !== id);
  } catch (err) { console.error(err); }
};

onMounted(cargarDatos);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>