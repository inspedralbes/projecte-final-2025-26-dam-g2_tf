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
        <button
          @click="pestanyaActiva = 'amics'"
          :class="['flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  pestanyaActiva === 'amics' ? 'bg-[#f5cbdd] text-[#402749]' : 'text-white/60']"
        >
          Amics
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

              <div v-if="mostrantUbicacioInput" class="flex items-center gap-2 bg-[#f5cbdd]/20 p-2 rounded-xl">
                <span class="text-xs">📍</span>
                <input v-model="nouPostUbicacio" type="text" placeholder="On ets?" class="bg-transparent border-none text-xs font-bold text-[#5d3962] focus:outline-none w-full">
              </div>

              <div class="flex flex-wrap gap-2">
                <span v-for="(tag, idx) in nouPostTags" :key="idx" class="bg-[#5d3962] text-white text-[9px] px-3 py-1 rounded-full font-black uppercase flex items-center gap-1">
                  #{{ tag }} 
                  <button @click="eliminarTag(idx)" class="hover:text-red-300">✕</button>
                </span>
                <input
                  v-model="nouPostTagInput"
                  @keydown.enter.prevent="afegirTag"
                  @blur="afegirTag"
                  placeholder="#Afegeix..."
                  class="text-[10px] bg-gray-100 px-3 py-1 rounded-full outline-none w-24 focus:bg-white border border-transparent focus:border-[#bc85ab]/30"
                >
              </div>
            </div>
          </div>

          <div v-if="nouPostImatges.length > 0" class="flex flex-wrap gap-2 mb-4">
            <div v-for="(img, index) in nouPostImatges" :key="index" class="relative inline-block">
              <img :src="img" class="h-24 w-24 object-cover rounded-2xl border-2 border-[#f5cbdd]">
              <button @click="nouPostImatges.splice(index, 1)" class="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] shadow-sm">✕</button>
            </div>
          </div>

          <div class="flex justify-between items-center pt-2 border-t border-gray-50">
            <div class="flex gap-2">
              <button @click="triggerFileInput" class="p-2.5 rounded-xl bg-gray-50 hover:bg-[#f5cbdd]/30 transition-colors text-xl">📸</button>
              <button @click="mostrantUbicacioInput = !mostrantUbicacioInput" class="p-2.5 rounded-xl bg-gray-50 hover:bg-[#f5cbdd]/30 transition-colors text-xl">📍</button>
              <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" accept="image/*" multiple>
            </div>
                    
            <button
              @click="publicarPost"
              :disabled="(!nouPostText.trim() && nouPostImatges.length === 0) || publicant"
              class="bg-[#5d3962] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="publicant" class="animate-spin inline-block">🌀</span>
              {{ publicant ? 'PUBLICANT...' : 'COMPARTEIX' }}
            </button>
          </div>
        </div>

        <div class="space-y-6 pb-12">
          <div v-for="post in posts" :key="post._id" class="bg-white rounded-[35px] shadow-sm border border-white overflow-hidden transition-all hover:shadow-md relative">
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
              <button v-if="esAutor(post)" @click="eliminarPost(post._id)" class="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                🗑️
              </button>
              <button @click="reportarLloc(post)" class="bg-red-500/10 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                🚨
              </button>
              <button 
                @click="reportarPostSencer(post)" 
                class="bg-gray-100 text-gray-600 p-2 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                title="Reportar post sencer"
              >
                🚫
              </button>
            </div>

            <div class="px-6 pb-4">
              <p v-if="post.text" class="text-gray-600 text-sm leading-relaxed font-medium mb-4">
                {{ post.text }}
              </p>

              <div v-if="post.imatges_post && post.imatges_post.length > 0" class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                <div v-for="(img, idx) in post.imatges_post" :key="idx" class="min-w-[80%] rounded-[25px] overflow-hidden border border-gray-50 shadow-sm">
                  <img :src="img" class="w-full h-64 object-cover">
                </div>
              </div>
              <div v-else-if="post.imatge_post" class="rounded-[25px] overflow-hidden border border-gray-50 shadow-sm mb-4">
                <img :src="post.imatge_post" class="w-full h-auto max-h-[400px] object-cover">
              </div>

              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in post.tags" 
                  :key="tag" 
                  @click="filtrarPerTag(tag)"
                  class="text-[9px] font-black text-[#bc85ab] uppercase tracking-widest bg-[#f5cbdd]/20 px-3 py-1 rounded-full cursor-pointer hover:bg-[#bc85ab] hover:text-white transition-all active:scale-95"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
              <div class="flex gap-4">
                <button @click="ferLike(post._id)" class="text-xl flex items-center gap-1">
                  {{ post.likes?.includes(usuari?._id) ? '❤️' : '🤍' }}
                  <span class="text-xs font-black text-gray-500">{{ post.likes?.length || 0 }}</span>
                </button>
                <button @click="toggleComentaris(post._id)" class="flex items-center gap-2">
                  <span class="text-xl">💬</span>
                  <span class="text-xs font-black text-gray-400">{{ post.comentaris?.length || 0 }}</span>
                </button>
              </div>
            </div>

            <div v-if="mostrantComentaris === post._id" class="bg-gray-50/50 p-6 border-t border-gray-100">
              <div v-if="post.comentaris && post.comentaris.length > 0">
                <div v-for="com in post.comentaris" :key="com.id_comentari || com._id" class="flex gap-3 mb-4 last:mb-0">
                  <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center border overflow-hidden shrink-0">
                    <img v-if="com.avatar_usuari" :src="com.avatar_usuari" class="w-full h-full object-cover">
                    <span v-else class="font-black text-[#5d3962] text-[10px]">{{ com.nom_usuari?.charAt(0) }}</span>
                  </div>
                  <div class="bg-white px-4 py-2 rounded-2xl border border-gray-100 flex-1 shadow-sm relative group">
                    <div class="flex justify-between items-center w-full"> 
                      <p class="text-[10px] font-black text-[#5d3962] mb-0.5 truncate">{{ com.nom_usuari }}</p>
                      <button @click="reportarComentari(post._id, com)" class="transition-opacity text-[10px] hover:scale-125 p-1 shrink-0 ml-2"></button>
                    </div>
                    <p class="text-xs text-gray-600 font-medium">{{ com.text }}</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 mt-4">
                <input
                  v-model="comentarisInputs[post._id]"
                  @keyup.enter="enviarComentari(post._id)"
                  placeholder="Escriu un comentari..."
                  class="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs outline-none text-gray-800 focus:border-[#bc85ab]"
                >
                <button
                  @click="enviarComentari(post._id)"
                  class="bg-[#402749] text-white px-4 py-2 rounded-xl font-bold text-[10px] hover:bg-[#5d3962] transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="pestanyaActiva === 'ranking'" class="space-y-6 animate-fade-in">
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
            <span></span> TOP EXPLORADORS
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

      <!-- SECCIÓ D'AMICS -->
      <div v-else-if="pestanyaActiva === 'amics'" class="space-y-6 animate-fade-in">
        
        <!-- Cercador d'usuaris per nom d'usuari -->
        <div class="bg-white p-6 rounded-[40px] shadow-sm border border-white">
          <h3 class="text-[#402749] text-xs font-black uppercase mb-4 tracking-widest">Cerca exploradors</h3>
          <div class="flex gap-2">
            <input 
              v-model="usernameCerca" 
              type="text" 
              placeholder="Busca pel nom d'usuari..."
              class="flex-1 bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-[#804f7f]/20 outline-none font-medium text-gray-600 transition-all"
              @input="cercarUsuari"
            >
            <button 
              @click="cercarUsuari" 
              class="bg-[#804f7f] text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest"
              :disabled="cercant"
            >
              {{ cercant ? '...' : '🔍' }}
            </button>
          </div>

          <!-- Resultats de cerca -->
          <div v-if="resultatsCerca.length > 0" class="mt-6 space-y-3">
            <div 
              v-for="resUser in resultatsCerca" 
              :key="resUser._id" 
              class="p-4 bg-[#f5cbdd] rounded-2xl flex items-center justify-between border border-white"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#bc85ab] flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white shadow-sm">
                  <img v-if="resUser.avatar" :src="resUser.avatar" class="w-full h-full object-cover">
                  <span v-else>{{ resUser.nom_usuari?.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-black text-[#402749] text-sm leading-none">{{ resUser.nom_usuari }}</p>
                  <p class="text-[9px] font-bold text-[#804f7f] uppercase mt-1 px-2 py-0.5 bg-white/50 rounded-full inline-block">
                    {{ calcularNivell(resUser.inventari_cromos) }}
                  </p>
                </div>
              </div>
              <button 
                @click="enviarSolicitud(resUser)" 
                class="bg-[#804f7f] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
              >
                Afegir Amic
              </button>
            </div>
          </div>
          <div v-else-if="usernameCerca && !cercant" class="mt-4 text-center py-4">
            <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">No s'han trobat exploradors</p>
          </div>
        </div>

        <!-- Llista d'amics -->
        <div class="space-y-4">
          <h3 class="text-[#402749] text-xs font-black uppercase pl-4 tracking-widest">Els teus amics</h3>
          <div v-if="amics.length > 0" class="grid grid-cols-1 gap-3">
            <div 
              v-for="amic in amics" 
              :key="amic._id" 
              class="bg-[#f5cbdd] p-4 rounded-[30px] shadow-sm flex items-center justify-between border-2 border-white/50"
            >
              <div class="flex items-center gap-4">
                <div @click="router.push(`/perfil-visita/${amic._id}`)" class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#402749] font-black border-2 border-[#bc85ab] overflow-hidden cursor-pointer">
                  <img v-if="amic.avatar" :src="amic.avatar" class="w-full h-full object-cover">
                  <span v-else>{{ amic.nom_usuari?.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <h4 class="font-black text-[#402749] text-sm leading-none">{{ amic.nom_usuari }}</h4>
                  <p class="text-[10px] font-bold text-[#804f7f] uppercase mt-1 tracking-wider">{{ amic.nivell || 'Explorador' }}</p>
                </div>
              </div>
              <button 
                @click="convidarPartida(amic)" 
                class="bg-[#402749] text-white px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-tighter hover:bg-[#5d3962] transition-all active:scale-95"
              >
                Convidar a partida
              </button>
            </div>
          </div>
          <div v-else class="bg-white/50 p-12 rounded-[40px] text-center border-2 border-dashed border-[#bc85ab]/20">
            <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Encara no tens amics</p>
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
const nouPostImatges = ref([]);
const nouPostUbicacio = ref('');
const nouPostTags = ref([]);
const nouPostTagInput = ref('');
const mostrantUbicacioInput = ref(false);
const publicant = ref(false);
const fileInput = ref(null);

// Feed refs
const posts = ref([]);
const mostrantComentaris = ref(null);
const comentarisInputs = ref({});

// Amics refs
const amics = ref([]);
const usernameCerca = ref('');
const resultatsCerca = ref([]);
const cercant = ref(false);

const rankingGlobal = ref([]);
const carregantRanking = ref(false);

const actualitzarUsuari = (dadesUsuari) => {
  login(dadesUsuari);
};

async function carregarPosts() {
  try {
    const res = await fetch(`${API_URL}/api/social/posts?tag=${filtreActiu.value !== 'Tots' ? filtreActiu.value : ''}`);
    const dades = await res.json();
    posts.value = Array.isArray(dades) ? dades : [];
  } catch (err) {
    console.error("Error carregant posts:", err);
  }
}

async function publicarPost() {
  if (!usuari.value) {
    obrirModal('Inicia sessió per poder publicar a la comunitat!');
    return;
  }
  if (!nouPostText.value.trim() && nouPostImatges.value.length === 0) return;

  publicant.value = true;
  try {
    const payload = {
      id_usuari: usuari.value._id,
      nom_usuari: usuari.value.nom_usuari,
      avatar_usuari: usuari.value.avatar || usuari.value.avatar_usuari || '',
      text: nouPostText.value,
      imatges_post: nouPostImatges.value, 
      tags: nouPostTags.value,
      ubicacio: nouPostUbicacio.value,
      likes: [],
      comentaris: []
    };

    const res = await fetch(`${API_URL}/api/social/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      nouPostText.value = '';
      nouPostImatges.value = []; 
      nouPostTags.value = [];
      nouPostUbicacio.value = '';
      mostrantUbicacioInput.value = false;
      await carregarPosts();
    }
  } catch (err) {
    console.error("Error al publicar:", err);
  } finally {
    publicant.value = false;
  }
}

watch(pestanyaActiva, (nova) => {
  if (nova === 'ranking') carregarRanking();
  else if (nova === 'amics') carregarAmics();
  else carregarPosts();
});

watch(filtreActiu, () => {
  if (pestanyaActiva.value === 'feed') carregarPosts();
});

onMounted(() => {
  if (usuari.value) {
    carregarPosts();
    carregarRanking(); 
  }
});

watch(usuari, (nou) => {
  if (nou && posts.value.length === 0) {
    carregarPosts();
    carregarAmics();
  }
});

async function carregarRanking() {
  carregantRanking.value = true;
  try {
    const res = await fetch(`${API_URL}/api/social/leaderboard/global`);
    if (res.ok) rankingGlobal.value = await res.json();
  } catch (err) {
    console.error("Error carregant rànquing:", err);
  } finally {
    carregantRanking.value = false;
  }
}

function filtrarPerTag(cat) {
  filtreActiu.value = filtreActiu.value === cat ? 'Tots' : cat;
  pestanyaActiva.value = 'feed';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filtrarData(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
}

function esAutor(post) {
  return usuari.value && (post.usuari_id === usuari.value._id || post.id_usuari === usuari.value._id);
}

function visitarPerfil(item) {
  const id = item.usuari_id || item.id_usuari;
  if (id) {
    if (usuari.value && id === usuari.value._id) router.push('/perfil');
    else router.push(`/perfil-visita/${id}`);
  }
}

async function ferLike(postId) {
  if (!usuari.value) {
    obrirModal('Inicia sessió per poder donar likes!');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/social/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuari: usuari.value._id })
    });
    if (res.ok) {
      const data = await res.json();
      const idx = posts.value.findIndex(p => p._id === postId);
      if (idx !== -1) posts.value[idx].likes = data.likes;
    }
  } catch (err) { console.error("Error like:", err); }
}

function toggleComentaris(postId) {
  mostrantComentaris.value = mostrantComentaris.value === postId ? null : postId;
}

async function enviarComentari(postId) {
  const text = comentarisInputs.value[postId];
  if (!text || !text.trim() || !usuari.value) return;
  try {
    const res = await fetch(`${API_URL}/api/social/posts/${postId}/comentari`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: usuari.value._id,
        nom_usuari: usuari.value.nom_usuari,
        avatar_usuari: usuari.value.avatar || '',
        text: text
      })
    });
    if (res.ok) {
      const dada = await res.json();
      const post = posts.value.find(p => p._id === postId);
      if (post) {
        if (!post.comentaris) post.comentaris = [];
        post.comentaris = [...post.comentaris, dada.comentari];
        comentarisInputs.value[postId] = '';
      }
    }
  } catch (err) { console.error("Error enviant comentari:", err); }
}

async function eliminarPost(postId) {
  if (!confirm('Eliminar post?')) return;
  try {
    await fetch(`${API_URL}/api/social/posts/${postId}`, { method: 'DELETE' });
    carregarPosts();
  } catch (err) { console.error("Error eliminant:", err); }
}

function triggerFileInput() { fileInput.value?.click(); }

function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  if (nouPostImatges.value.length + files.length > 3) {
    alert("Només pots pujar un màxim de 3 fotos.");
    return;
  }
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => { nouPostImatges.value.push(e.target.result); };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function afegirTag() {
  if (nouPostTagInput.value.trim()) {
    nouPostTags.value.push(nouPostTagInput.value.trim().replace('#', ''));
    nouPostTagInput.value = '';
  }
}

function eliminarTag(idx) { nouPostTags.value.splice(idx, 1); }

function reportarLloc(post) { alert(`Reportat: ${post.nom_usuari || 'post'}`); }

async function reportarComentari(postId, comentari) {
  if (!usuari.value) { obrirModal('Inicia sessió per poder reportar contingut.'); return; }
  if (confirm(`Vols marcar el comentari de "${comentari.nom_usuari}" com a inapropiat?`)) {
    try {
      const res = await fetch(`${API_URL}/api/social/posts/${postId}/comentari/${comentari.id_comentari}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuari_reporter: usuari.value._id, motiu: "Contingut inapropiat" })
      });
      if (res.ok) alert("Gràcies. El comentari serà revisat.");
    } catch (err) { console.error("Error enviant report:", err); }
  }
}

async function reportarPostSencer(post) {
  if (!usuari.value) { obrirModal('Inicia sessió per poder reportar contingut.'); return; }
  if (confirm(`Vols reportar la publicació de "${post.nom_usuari}" per contingut inapropiat?`)) {
    try {
      const res = await fetch(`${API_URL}/api/social/posts/${post._id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuari_reporter: usuari.value._id, motiu: "Reportat des del feed" })
      });
      if (res.ok) alert("Gràcies. El post ha estat enviat a revisió.");
    } catch (err) { console.error("Error enviant report del post:", err); }
  }
}

async function carregarAmics() {
  if (!usuari.value) return;
  try {
    const res = await fetch(`${API_URL}/api/usuari/${usuari.value._id}`);
    if (res.ok) {
      const dades = await res.json();
      amics.value = dades.amics || [];
    }
  } catch (err) { console.error("Error carregar amics:", err); }
}

function calcularNivell(cromos) {
  const n = cromos?.length || 0;
  if (n > 30) return "Mestre Urbà";
  if (n >= 16) return "Guia de Barcelona";
  if (n >= 6) return "Rastrejador Urbà";
  return "Explorador Novell";
}

async function cercarUsuari() {
  if (!usernameCerca.value) {
    resultatsCerca.value = [];
    return;
  }
  cercant.value = true;
  try {
    const res = await fetch(`${API_URL}/api/social/search?username=${usernameCerca.value}`);
    if (res.ok) {
      resultatsCerca.value = await res.json();
    } else {
      resultatsCerca.value = [];
    }
  } catch (err) {
    console.error("Error cercant user:", err);
  } finally {
    cercant.value = false;
  }
}

async function enviarSolicitud(target) {
  if (!usuari.value) return;
  try {
    const res = await fetch(`${API_URL}/api/social/peticions/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        de_perfil_id: usuari.value._id,
        de_nom: usuari.value.nom_usuari,
        per_a_perfil_id: target._id
      })
    });
    if (res.ok) {
      alert("Sol·licitud enviada!");
      resultatCerca.value = null;
      emailCerca.value = '';
    } else {
      const data = await res.json();
      alert(data.message);
    }
  } catch (err) { console.error("Error en enviar solicitud:", err); }
}

function convidarPartida(amic) {
  alert(`Invitació enviada a ${amic.nom_usuari} (Funcionalitat en desenvolupament amb WebSockets)`);
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
