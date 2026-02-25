<template>
  <div class="min-h-screen bg-[#f5cbdd]/20 pb-24 font-sans text-gray-800">
    <header class="bg-gradient-to-br from-[#402749] to-[#5d3962] text-white p-6 rounded-b-[40px] shadow-xl mb-6 sticky top-0 z-40">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-black italic uppercase tracking-tighter">COMUNITAT</h1>
          <p class="text-[#f5cbdd] text-[10px] font-bold uppercase tracking-widest opacity-80">Explora Barcelona</p>
        </div>
        <div class="flex gap-2 items-center">
            <BotonPerfil @login="actualitzarUsuari" />
        </div>
      </div>

      <div class="flex bg-black/20 rounded-2xl p-1 mb-4 border border-white/10">
        <button 
          @click="pestanyaActiva = 'feed'"
          :class="['flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all', 
                  pestanyaActiva === 'feed' ? 'bg-[#f5cbdd] text-[#402749]' : 'text-white/60']"
        >
          Muro
        </button>
        <button 
          @click="pestanyaActiva = 'ranking'"
          :class="['flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all', 
                  pestanyaActiva === 'ranking' ? 'bg-[#f5cbdd] text-[#402749]' : 'text-white/60']"
        >
          Rànquing
        </button>
      </div>

      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          v-for="cat in categories" 
          :key="cat" 
          @click="filtrarPerTag(cat)"
          :class="['px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border', 
                  filtreActiu === cat ? 'bg-[#f5cbdd] text-[#402749] border-[#f5cbdd]' : 'bg-white/10 text-white/60 border-white/10']"
        >
          {{ cat }}
        </button>
      </div>
    </header>

    <main class="px-4 max-w-xl mx-auto">
      
      <div v-if="pestanyaActiva === 'feed'" class="space-y-6 animate-fade-in">
        
        <div v-if="usuari" class="bg-white p-6 rounded-[40px] shadow-sm border border-white">
          <div class="flex gap-4 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-[#f5cbdd] flex items-center justify-center font-black text-[#5d3962] overflow-hidden shrink-0 shadow-sm border-2 border-white">
                <img v-if="usuari.avatar" :src="usuari.avatar" class="w-full h-full object-cover">
                <span v-else>{{ usuari.nom_usuari?.charAt(0) }}</span>
            </div>
            <div class="flex-1 space-y-3">
              <textarea 
                v-model="nouPostText" 
                placeholder="Explica la teva experiència..." 
                class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-[#bc85ab]/20 outline-none resize-none font-medium text-gray-600 transition-all"
                rows="2"
              ></textarea>
              
              <div v-if="nouPostImatge" class="relative inline-block">
                <img :src="nouPostImatge" class="h-32 w-32 object-cover rounded-2xl border-2 border-[#f5cbdd]">
                <button @click="nouPostImatge = null" class="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px]">✕</button>
              </div>

              <div v-if="mostrantUbicacioInput" class="flex items-center gap-2 bg-[#f5cbdd]/20 p-2 rounded-xl">
                <span class="text-xs">📍</span>
                <input v-model="nouPostUbicacio" type="text" placeholder="On ets?" class="bg-transparent border-none text-xs font-bold text-[#5d3962] focus:outline-none w-full">
              </div>

              <div class="flex flex-wrap gap-2">
                <span v-for="(tag, idx) in nouPostTags" :key="idx" class="bg-[#5d3962] text-white text-[9px] px-3 py-1 rounded-full font-black uppercase">
                  #{{ tag }} <button @click="eliminarTag(idx)">✕</button>
                </span>
                <input 
                  v-if="!nouPostTags.length"
                  v-model="nouPostTagInput" 
                  @blur="afegirTag"
                  @keyup.enter="afegirTag"
                  placeholder="#Temàtica..." 
                  class="text-[10px] bg-gray-100 px-3 py-1 rounded-full outline-none w-24"
                >
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2 border-t border-gray-50">
            <div class="flex gap-2">
               <button @click="triggerFileInput" class="p-2.5 rounded-xl bg-gray-50 hover:bg-[#f5cbdd]/30 transition-colors text-xl">📸</button>
               <button @click="mostrantUbicacioInput = !mostrantUbicacioInput" class="p-2.5 rounded-xl bg-gray-50 hover:bg-[#f5cbdd]/30 transition-colors text-xl">📍</button>
               <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" accept="image/*">
            </div>
            
            <button 
              @click="publicarPost" 
              :disabled="(!nouPostText.trim() && !nouPostImatge) || publicant"
              class="bg-[#5d3962] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              COMPARTEIX
            </button>
          </div>
        </div>

        <div class="space-y-6 pb-12">
          <div v-for="post in posts" :key="post._id" class="bg-white rounded-[35px] shadow-sm border border-white overflow-hidden transition-all hover:shadow-md relative">
            <div v-if="post.imatge_post" class="absolute top-4 right-4 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg rotate-12 uppercase tracking-tighter border-2 border-white">
               COLECCIONABLE DESBLOQUEJAT
            </div>

            <div class="p-5 flex items-center gap-4">
              <div @click="visitarPerfil(post)" class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#bc85ab] to-[#f5cbdd] flex items-center justify-center font-black text-[#402749] shadow-sm overflow-hidden border-2 border-white cursor-pointer hover:scale-105 transition-transform">
                <img v-if="post.avatar_usuari" :src="post.avatar_usuari" class="w-full h-full object-cover">
                <span v-else>{{ post.nom_usuari?.charAt(0) }}</span>
              </div>
              <div class="flex-1">
                <h3 @click="visitarPerfil(post)" class="font-black text-gray-800 text-sm tracking-tight leading-none mb-1 cursor-pointer hover:text-[#bc85ab]">{{ post.nom_usuari }}</h3>
                <div class="flex items-center gap-2">
                  <p class="text-[10px] text-[#9f6795] font-black uppercase tracking-widest">{{ filtrarData(post.timestamp) }}</p>
                  <span v-if="post.ubicacio" class="text-[10px] bg-red-50 text-red-500 font-black px-2 py-0.5 rounded-full border border-red-100 italic">📍 {{ post.ubicacio }}</span>
                </div>
              </div>
              <button @click="reportarLloc(post)" class="bg-red-500/10 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                🚨
              </button>
            </div>

            <div class="px-6 pb-4">
              <p v-if="post.text" class="text-gray-600 text-sm leading-relaxed font-medium mb-4">
                {{ post.text }}
              </p>
              <div v-if="post.imatge_post" class="rounded-[25px] overflow-hidden border border-gray-50 shadow-sm mb-4">
                <img :src="post.imatge_post" class="w-full h-auto max-h-[400px] object-cover">
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in post.tags" :key="tag" class="text-[9px] font-black text-[#bc85ab] uppercase tracking-widest bg-[#f5cbdd]/20 px-3 py-1 rounded-full">
                  #{{ tag }}
                </span>
              </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
              <div class="flex gap-4 items-center">
                <button @click="ferLike(post._id)" class="flex items-center gap-2 group transition-all">
                  <span class="text-xl transform group-active:scale-150 transition-transform">
                    {{ post.likes?.includes(usuari?._id) ? '❤️' : '🤍' }}
                  </span>
                  <span class="text-xs font-black text-gray-400">{{ post.likes?.length || 0 }}</span>
                </button>
                <button @click="toggleComentaris(post._id)" class="flex items-center gap-2">
                  <span class="text-xl transform hover:scale-125 transition-transform">💬</span>
                  <span class="text-xs font-black text-gray-400">{{ post.comentaris?.length || 0 }}</span>
                </button>
                <button @click="reportPost(post)" class="flex items-center gap-2 text-yellow-600 hover:text-yellow-800" title="Reportar publicació">
                  <span class="text-xl">⚠️</span>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <button v-if="esAutor(post)" @click="eliminarPost(post._id)" class="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600">Eliminar</button>
              </div>
            </div>

            <div v-if="mostrantComentaris === post._id" class="bg-gray-50/50 p-6 border-t border-gray-100 animate-slide-up">
              <div v-for="com in post.comentaris" :key="com.id_comentari" class="flex gap-3 mb-4 last:mb-0">
                <div @click="visitarPerfil(com)" class="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-[#5d3962] border border-gray-100 shadow-xs cursor-pointer overflow-hidden">
                  <img v-if="com.avatar_usuari" :src="com.avatar_usuari" class="w-full h-full object-cover">
                   <span v-else>{{ com.nom_usuari?.charAt(0) }}</span>
                </div>
                <div class="bg-white px-4 py-2 rounded-2xl shadow-xs border border-gray-50 flex-1">
                  <p @click="visitarPerfil(com)" class="text-[10px] font-black text-[#5d3962] mb-0.5 cursor-pointer hover:text-[#bc85ab]">{{ com.nom_usuari }}</p>
                  <p class="text-xs text-gray-600 font-medium">{{ com.text }}</p>
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <input v-model="nouComentariText" @keyup.enter="enviarComentari(post._id)" placeholder="Escriu un comentari..." class="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs outline-none">
                <button @click="enviarComentari(post._id)" class="bg-[#402749] text-white px-4 py-2 rounded-xl font-bold text-[10px]">OK</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6 animate-fade-in">
        <div class="bg-[#402749] text-white p-8 rounded-[40px] shadow-2xl border border-[#f5cbdd]/20">
          <div class="flex justify-between items-end">
            <div>
              <h2 class="text-4xl font-black italic uppercase tracking-tighter leading-none">EL MEU RÀNQUING</h2>
              <p class="text-[#f5cbdd] font-bold mt-2 uppercase tracking-widest text-xs opacity-80">Estat de l'explorador</p>
            </div>
            <div class="text-right">
              <span class="block text-5xl font-black text-[#f5cbdd]">{{ usuari?.punts || 0 }}</span>
              <span class="text-[10px] font-black uppercase tracking-[0.2em]">Punts Totals</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[40px] p-6 shadow-sm border border-white">
          <h3 class="text-[#402749] text-xl font-black italic mb-6 uppercase tracking-tight flex items-center gap-2">
            <span>🏆</span> TOP EXPLORADORS
          </h3>
          <div class="space-y-3">
            <div v-for="(user, index) in rankingGlobal" :key="user._id" 
                 class="flex items-center justify-between p-4 rounded-2xl transition-all"
                 :class="index === 0 ? 'bg-yellow-50 border border-yellow-100' : 'bg-gray-50'">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 flex items-center justify-center font-black italic text-lg"
                     :class="{'text-yellow-500': index === 0, 'text-gray-400': index === 1, 'text-orange-400': index === 2, 'text-gray-300': index > 2}">
                  {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '#' + (index + 1) }}
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#bc85ab] flex items-center justify-center text-white font-bold shadow-sm overflow-hidden border-2 border-white">
                  <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover">
                  <span v-else>{{ user.nom_usuari.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-black text-gray-800 text-sm">{{ user.nom_usuari }}</p>
                  <p v-if="index === 0" class="text-[9px] font-black text-yellow-600 uppercase">Líder de l'Expedició</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[#402749] font-black text-sm">{{ user.punts }}</span>
                <span class="text-[9px] font-bold text-gray-400 block uppercase">PTS</span>
              </div>
            </div>
          </div>
          <div v-if="carregantRanking" class="text-center py-8">
            <div class="inline-block animate-spin text-2xl">🌀</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useLoginModal } from '../composables/useLoginModal';
import BotonPerfil from '../components/BotonPerfil.vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

const router = useRouter();
const { usuari, login } = useAuth();
const { obrirModal } = useLoginModal();

const pestanyaActiva = ref('feed');
const categories = ['Tots', 'Industrial', 'Gòtic', 'Parcs', 'Graffiti', 'Misteri'];
const filtreActiu = ref('Tots');

// Post creation refs
const nouPostText = ref('');
const nouPostImatge = ref(null);
const nouPostUbicacio = ref('');
const nouPostTags = ref([]);
const nouPostTagInput = ref('');
const mostrantUbicacioInput = ref(false);
const publicant = ref(false);
const fileInput = ref(null);

// Feed refs
const posts = ref([]);
const mostrantComentaris = ref(null);
const nouComentariText = ref('');

// Afegeix aquestes refs al principi amb les altres
const rankingGlobal = ref([]);
const carregantRanking = ref(false);

const actualitzarUsuari = (dadesUsuari) => {
  login(dadesUsuari);
};

async function carregarPosts() {
  try {
    // Fem la crida al backend usant el filtre de tags si n'hi ha
    const res = await fetch(`${API_URL}/api/social/posts?tag=${filtreActiu.value !== 'Tots' ? filtreActiu.value : ''}`);
    const dades = await res.json();
    posts.value = Array.isArray(dades) ? dades : [];
  } catch (err) {
    console.error("Error carregant posts:", err);
  }
}

// 3. AFEGIT: Watcher per canviar de dades automàticament en clicar la pestanya
watch(pestanyaActiva, (nova) => {
  if (nova === 'ranking') {
    carregarRanking();
  } else {
    carregarPosts();
  }
});

// 4. AFEGIT: Watcher per actualitzar el feed quan canviem el filtre (Industrial, Gòtic...)
watch(filtreActiu, () => {
  if (pestanyaActiva.value === 'feed') {
    carregarPosts();
  }
});

// Actualitza el onMounted per carregar el rànquing si la pestanya és activa
onMounted(() => {
  if (usuari.value) {
    carregarPosts();
    carregarRanking(); // Carreguem el rànquing en iniciar
  }
});

// Watch per si l'usuari fa login DESPRÉS que la pàgina ja estigui muntada
watch(usuari, (nouUsuari) => {
  if (nouUsuari && posts.value.length === 0) {
    carregarPosts();
  }
});

// Watcher per detectar quan l'usuari canvia a la pestanya de rànquing i refrescar dades
watch(pestanyaActiva, (novaPestanya) => {
  if (novaPestanya === 'ranking') {
    carregarRanking();
  }
});

// 5. CORREGIT: El teu carregarRanking ara és una funció "async" declarada correctament
async function carregarRanking() {
  carregantRanking.value = true;
  try {
    const res = await fetch(`${API_URL}/api/social/leaderboard/global`);
    if (res.ok) {
      rankingGlobal.value = await res.json();
    }
  } catch (err) {
    console.error("Error carregant rànquing:", err);
  } finally {
    carregantRanking.value = false;
  }
}

function filtrarPerTag(cat) {
  filtreActiu.value = cat;
}

function filtrarData(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
}

function esAutor(post) {
  return usuari.value && (post.usuari_id === usuari.value._id || post.id_usuari === usuari.value._id);
}

function visitarPerfil(item) {
  if (item.usuari_id || item.id_usuari) {
    const id = item.usuari_id || item.id_usuari;
    if (usuari.value && id === usuari.value._id) {
      router.push('/perfil');
    } else {
      router.push(`/perfil-visita/${id}`);
    }
  }
}

async function ferLike(postId) {
  if (!usuari.value) {
    obrirModal('Inicia sessió per poder donar likes i interactuar amb la comunitat!');
    return;
  }
  try {
    await fetch(`${API_URL}/api/social/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuari: usuari.value._id }) 
    });
    await carregarPosts(); 
  } catch (err) {
    console.error("Error like:", err);
  }
}

function toggleComentaris(postId) {
  mostrantComentaris.value = mostrantComentaris.value === postId ? null : postId;
}

async function enviarComentari(postId) {
  if (!nouComentariText.value.trim()) return;
  if (!usuari.value) {
    obrirModal('Inicia sessió per poder deixar comentaris a la comunitat!');
    return;
  }
  try {
    await fetch(`${API_URL}/api/social/posts/${postId}/comentari`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: usuari.value._id,
        nom_usuari: usuari.value.nom_usuari,
        text: nouComentariText.value
      })
    });
    nouComentariText.value = '';
    carregarPosts();
  } catch (err) {
    console.error("Error comentari:", err);
  }
}

async function publicarPost() {
  if (!usuari.value) return;
  publicant.value = true;
  try {
    await fetch(`${API_URL}/api/social/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuari: usuari.value._id,
        nom_usuari: usuari.value.nom_usuari,
        avatar_usuari: usuari.value.avatar || '',
        text: nouPostText.value,
        imatge_post: nouPostImatge.value || '',
        ubicacio: nouPostUbicacio.value || '',
        tags: nouPostTags.value
      })
    });
    nouPostText.value = '';
    nouPostImatge.value = null;
    nouPostUbicacio.value = '';
    nouPostTags.value = [];
    carregarPosts();
  } catch (err) {
    console.error("Error publicant:", err);
  } finally {
    publicant.value = false;
  }
}

async function eliminarPost(postId) {
  if (!confirm('Eliminar post?')) return;
  try {
    await fetch(`${API_URL}/api/social/posts/${postId}`, { method: 'DELETE' });
    carregarPosts();
  } catch (err) {
    console.error("Error eliminant:", err);
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => { nouPostImatge.value = e.target.result; };
    reader.readAsDataURL(file);
  }
}

function afegirTag() {
  if (nouPostTagInput.value.trim()) {
    nouPostTags.value.push(nouPostTagInput.value.trim().replace('#', ''));
    nouPostTagInput.value = '';
  }
}

function eliminarTag(idx) {
  nouPostTags.value.splice(idx, 1);
}

function reportarLloc(post) {
  alert(`Reportat: ${post.nom_usuari || 'post'}`);
}

function reportPost(post) {
  alert(`Publicació reportada: ${post._id}`);
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>