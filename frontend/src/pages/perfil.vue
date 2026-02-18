<template>
  <div class="min-h-screen bg-black text-white font-sans pb-24">
    
    <header class="p-4 flex items-center justify-between border-b border-white/10 bg-[#1a0a1f]">
      <button @click="router.push('/')" class="text-[#f5cbdd] font-bold text-sm">← TORNAR</button>
      <h1 class="text-lg font-bold tracking-widest">PERFIL</h1>
      <div class="w-8"></div> 
    </header>

    <main class="p-4 max-w-md mx-auto space-y-6">
      
      <section class="bg-[#2d1b33] rounded-3xl p-6 border border-white/5 shadow-xl text-center relative overflow-hidden">
        
        <div class="text-4xl mb-2">{{ emojiRol }}</div>

        <div class="w-24 h-24 rounded-full bg-[#bc85ab] mx-auto mb-4 flex items-center justify-center text-3xl font-black text-[#1a0a1f] overflow-hidden">
          <img v-if="user?.avatar" :src="user.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ user?.nom_usuari?.charAt(0).toUpperCase() || '?' }}</span>
        </div>
        
        <h2 class="text-2xl font-bold mb-1">{{ user?.nom_usuari || 'Explorador' }}</h2>
        
        <p class="text-[#bc85ab] text-[10px] font-black tracking-widest uppercase mb-4">{{ user?.nivell || 'Explorador Novell' }}</p>

        <div class="max-w-[200px] mx-auto mb-6">
          <div class="flex justify-between text-[8px] text-gray-500 font-bold mb-1 uppercase">
            <span>{{ puntsPerAlSeguentNivell }} XP</span>
            <span>100 XP</span>
          </div>
          <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div 
              class="bg-[#bc85ab] h-full transition-all duration-700" 
              :style="{ width: puntsPerAlSeguentNivell + '%' }"
            ></div>
          </div>
          <p class="text-[8px] text-gray-600 mt-1 uppercase">{{ user?.punts || 0 }} punts totals</p>
        </div>

        <div class="mt-4">
          <div v-if="!editantBio">
            <p class="text-sm text-gray-400 italic mb-2">"{{ user?.biografia || 'Sense biografia...' }}"</p>
            <button @click="editantBio = true" class="text-[10px] text-[#bc85ab] border border-[#bc85ab] px-2 py-1 rounded">EDITAR BIO</button>
          </div>
          
          <div v-else class="space-y-2">
            <textarea 
              v-model="tempBio" 
              class="w-full bg-black/40 text-white text-sm p-2 rounded-xl border border-[#bc85ab] outline-none"
              rows="2"
            ></textarea>
            <div class="flex gap-2 justify-center">
              <button @click="guardarBio" class="bg-[#bc85ab] text-black text-xs px-3 py-1 rounded font-bold">GUARDAR</button>
              <button @click="editantBio = false" class="bg-gray-700 text-white text-xs px-3 py-1 rounded">CANCEL·LAR</button>
            </div>
          </div>
        </div>
      </section>

      <nav class="flex bg-[#1a0a1f] rounded-xl p-1 border border-white/5">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
          :class="activeTab === tab.id ? 'bg-[#bc85ab] text-black' : 'text-gray-500'"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="mt-4">
        <div v-if="activeTab === 'posts'" class="space-y-3">
          <div v-for="post in misPosts" :key="post._id" class="bg-[#2d1b33] p-4 rounded-xl border border-white/5 relative group">
            <p class="text-sm">{{ post.text }}</p>
            <button @click="eliminarPost(post._id)" class="absolute top-2 right-2 text-red-400 text-xs opacity-0 group-hover:opacity-100">✕</button>
          </div>
          <p v-if="misPosts.length === 0" class="text-center text-gray-600 text-sm italic">No has publicat res encara.</p>
        </div>

        <div v-if="activeTab === 'cromos'" class="grid grid-cols-3 gap-2">
          <div v-for="cromo in user?.inventari_cromos" :key="cromo.id_lloc" class="aspect-square bg-[#2d1b33] rounded-xl overflow-hidden border border-white/10">
            <img :src="cromo.imatge_usuari" class="w-full h-full object-cover">
          </div>
          <div v-if="!user?.inventari_cromos?.length" class="col-span-3 py-10 text-center text-gray-600 text-xs italic">
            Encara no has col·leccionat cap cromo.
          </div>
        </div>

        <div v-if="activeTab === 'amics'" class="space-y-2">
          <div v-for="amic in user?.amics" :key="amic" class="bg-[#2d1b33] p-3 rounded-xl flex items-center justify-between">
            <span class="text-sm font-bold">{{ amic }}</span>
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
          <p v-if="!user?.amics?.length" class="text-center text-gray-600 text-sm italic">Encara no tens amics afegits.</p>
        </div>
      </div>

      <button @click="tancarSessio" class="w-full mt-10 py-4 border border-red-500/30 text-red-400 rounded-2xl font-bold text-sm hover:bg-red-500/10">
        TANCAR SESSIÓ
      </button>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const user = ref(null);
const editantBio = ref(false);
const tempBio = ref('');

// --- LÒGICA DE NIVELLS (Junior) ---
const puntsPerAlSeguentNivell = computed(() => {
  return (user.value?.punts || 0) % 100;
});

const emojiRol = computed(() => {
  const rol = user.value?.nivell;
  if (rol === 'Llegenda de la Ciutat') return '';
  if (rol === 'Expert en Rutes') return '';
  if (rol === 'Fotògraf de Carrer') return '';
  if (rol === 'Rastrejador Urbà') return '';
  return '';
});


const activeTab = ref('posts');
const tabs = [
  { id: 'posts', label: 'MIS POSTS' },
  { id: 'cromos', label: 'CROMOS' },
  { id: 'amics', label: 'AMICS' }
];

// 1. CARREGAR MIS POSTS
const misPosts = ref([]);
async function carregarMisPosts() {
  try {
    const res = await fetch('http://localhost:8088/api/social/posts');
    const dades = await res.json();
    const allPosts = Array.isArray(dades) ? dades : [];
    const userId = user.value?._id;
    misPosts.value = allPosts.filter(p => p.usuari_id === userId || p.id_usuari === userId);
  } catch (err) {
    console.error("Error posts:", err);
  }
}

// 2. GUARDAR BIOGRAFIA A LA BD
async function guardarBio() {
  try {
    const res = await fetch('http://localhost:8088/api/usuari/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        perfilId: user.value._id,
        novaBio: tempBio.value
      })
    });

    if (res.ok) {
      const data = await res.json();
      user.value = data.user; 
      localStorage.setItem('user', JSON.stringify(user.value));
      editantBio.value = false;
    }
  } catch (err) {
    alert("No s'ha pogut guardar la biografia");
  }
}

// 3. ELIMINAR POST
async function eliminarPost(postId) {
  if (!confirm('Eliminar post?')) return;
  try {
    await fetch(`http://localhost:8088/api/social/posts/${postId}`, { method: 'DELETE' });
    carregarMisPosts();
  } catch (err) {
    console.error("Error eliminant:", err);
  }
}

// 4. TANCAR SESSIÓ
function tancarSessio() {
  localStorage.removeItem('user');
  // Força la recàrrega total de la pàgina a l'índex
  window.location.href = '/'; 
}

// INICI
onMounted(async () => {
  const saved = localStorage.getItem('user');
  if (saved) {
    const localUser = JSON.parse(saved);
    
    try {
        const res = await fetch(`http://localhost:8088/api/usuari/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ perfilId: localUser._id })
        });
        const data = await res.json();
        user.value = data.user;
    } catch {
        user.value = localUser;
    }
    
    tempBio.value = user.value?.biografia || '';
    carregarMisPosts();
  } else {
    router.push('/login');
  }
});
</script>

<style scoped>
.aspect-square { aspect-ratio: 1 / 1; }
</style>