<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-24 md:pb-0 font-sans">
    <AdminNav />

    <main class="flex-1 p-6 md:p-10">
      <header class="mb-10 animate-fade-in">
        <div class="flex items-center justify-between gap-3 mb-2">
          <div class="flex items-center gap-3">
            <span class="bg-[#402749] p-2 rounded-lg shadow-lg">
              <svg class="w-6 h-6 text-[#f5cbdd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <div>
              <h1 class="text-3xl font-black text-[#402749] tracking-tight">Panell de Moderació</h1>
              <p class="text-gray-500 font-medium text-sm">Supervisa l'activitat i manté l'entorn segur.</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <button @click="cargarDatos" class="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm group" title="Refrescar dades">
              <svg :class="{'animate-spin': estaCarregant}" class="w-5 h-5 text-gray-600 group-hover:text-[#402749]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <div class="hidden lg:block relative">
              <input 
                v-model="filtreCerca" 
                type="text" 
                placeholder="Cerca per usuari o text..." 
                class="bg-white border border-gray-200 py-2 px-4 pl-10 rounded-2xl text-xs focus:ring-2 focus:ring-[#bc85ab] outline-none transition-all w-64 shadow-sm"
              >
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
        </div>
      </header>

      <!-- Notificació Toast Custom -->
      <Transition name="toast-fade">
        <div v-if="notificacio" class="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-white border-2 border-[#402749] px-6 py-4 rounded-2xl shadow-2xl animate-fade-in shadow-[#402749]/20">
          <div class="w-8 h-8 rounded-full bg-[#f5cbdd] flex items-center justify-center">
            <svg class="w-4 h-4 text-[#402749]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </div>
          <p class="text-sm font-black text-[#402749] uppercase tracking-tight">{{ notificacio }}</p>
        </div>
      </Transition>

      <!-- Modal de Confirmació Custom -->
      <Transition name="modal-fade">
        <div v-if="confirmacioPendents" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border-2 border-[#402749] animate-modal-bounce">
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
               <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 class="text-xl font-black text-[#402749] text-center mb-2 uppercase tracking-tighter">{{ confirmacioTitol }}</h3>
            <p class="text-gray-500 text-center text-sm mb-8 font-medium">{{ confirmacioMissatge }}</p>
            <div class="flex gap-3">
              <button @click="cancelarConfirmacio" class="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel·lar</button>
              <button @click="executarConfirmacio" class="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200">Confirmar</button>
            </div>
          </div>
        </div>
      </Transition>

      <div v-if="seleccionats.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-50 animate-bounce-in">
        <div class="bg-[#402749] text-white p-4 rounded-3xl shadow-2xl border-2 border-[#f5cbdd] flex items-center gap-6">
          <p class="text-xs font-black uppercase tracking-widest px-2">{{ seleccionats.length }} Seleccionats</p>
          <div class="flex gap-2">
            <button @click="accionsMassives('revisat')" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md">Validar Tot</button>
            <button @click="accionsMassives('eliminar')" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md">Eliminar Tot</button>
            <button @click="seleccionats = []" class="text-gray-300 hover:text-white text-[10px] font-bold uppercase px-2">Cancel·lar</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex gap-2 p-1 bg-gray-200/50 w-full md:w-fit max-w-full rounded-2xl border border-gray-200 shadow-inner overflow-x-auto custom-scrollbar">
          <button @click="tabActual = 'ressenyes'" :class="tabActual === 'ressenyes' ? 'bg-[#402749] text-white shadow-md' : 'text-gray-500 hover:bg-white'" class="whitespace-nowrap flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">Ressenyes</button>
          <button @click="tabActual = 'posts'" :class="tabActual === 'posts' ? 'bg-[#402749] text-white shadow-md' : 'text-gray-500 hover:bg-white'" class="whitespace-nowrap flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">Posts Socials</button>
          <button @click="tabActual = 'identitats'" :class="tabActual === 'identitats' ? 'bg-[#402749] text-white shadow-md' : 'text-gray-500 hover:bg-white'" class="whitespace-nowrap flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">Verificació d'Edat</button>
          <button @click="tabActual = 'eliminats'" :class="tabActual === 'eliminats' ? 'bg-red-600 text-white shadow-md' : 'text-red-500 hover:bg-red-50'" class="whitespace-nowrap flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border border-transparent hover:border-red-200">Historial Eliminats</button>
        </div>

        <button 
          v-if="tabActual === 'posts' && postsFiltrats.length > 0"
          @click="alternarSeleccioTots"
          class="text-[10px] font-black uppercase tracking-widest text-[#402749] hover:bg-white border border-transparent hover:border-gray-200 px-4 py-2 rounded-xl transition-all"
        >
          {{ seleccionats.length === postsFiltrats.length ? '✕ Deseleccionar' : '✓ Seleccionar Tots' }}
        </button>
      </div>

      <section v-if="tabActual === 'posts'" class="animate-fade-in">
        <div v-if="postsFiltrats.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
          <div class="bg-white p-8 rounded-full shadow-xl mb-6 ring-8 ring-green-50">
            <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-black text-[#402749] mb-1">Cua de moderació neta</h3>
          <p class="text-gray-400 text-sm max-w-xs mx-auto">No hi ha contingut pendent de revisió.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="post in postsFiltrats" 
            :key="post._id" 
            :class="[
              'bg-white rounded-3xl shadow-lg border overflow-hidden flex flex-col group transition-all duration-300 relative',
              post.reportat ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100',
              seleccionats.includes(post._id) ? 'ring-4 ring-[#bc85ab] border-[#bc85ab]' : ''
            ]"
          >
            <div class="absolute top-4 left-4 z-10">
              <input type="checkbox" :value="post._id" v-model="seleccionats" class="w-5 h-5 rounded-lg border-2 border-gray-300 text-[#402749] cursor-pointer focus:ring-0" />
            </div>

            <div class="p-5 pl-12 border-b border-gray-50 flex justify-between items-center" :class="post.reportat ? 'bg-red-50/50' : 'bg-gray-50/50'">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#5d3962] flex items-center justify-center text-[#f5cbdd] font-bold text-sm shadow-sm transition-transform group-hover:scale-110">
                  {{ post.nom_usuari?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-bold text-[#402749] text-sm">{{ post.nom_usuari }}</p>
                    <span v-if="post.reportat" class="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                      ⚠️ POST REPORTAT
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
                  ✅ Validar Post
                </button>
                <button @click="eliminarPost(post)" class="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  Eliminar Post
                </button>
              </div>
            </div>
            
            <div class="p-5 flex-1">
              <p class="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{{ post.text }}</p>
              
              <div v-if="post.imatges_post?.length" class="grid grid-cols-2 gap-2 mb-4">
                <img v-for="(img, i) in post.imatges_post" :key="i" :src="img" class="w-full h-32 object-cover rounded-xl shadow-inner border border-gray-100" />
              </div>

              <div class="space-y-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                <p class="text-[9px] font-black text-[#bc85ab] uppercase tracking-[0.2em] mb-2">Moderació de Comentaris ({{ post.comentaris?.length }})</p>
                
                <div v-if="!post.comentaris?.length" class="text-[10px] text-gray-400 italic">Sense comentaris</div>
                
                <div v-for="com in post.comentaris" :key="com.id_comentari || com._id" 
                  :class="['flex justify-between items-start gap-2 group/com p-2 rounded-lg transition-all', com.reportat ? 'bg-red-100/50 border border-red-200' : '']">
                  <div class="flex-1">
                    <p class="text-xs text-gray-600">
                      <span class="font-bold text-[#402749]">{{ com.nom_usuari }}:</span> {{ com.text }}
                    </p>
                    <span v-if="com.reportat" class="text-[8px] text-red-600 font-black uppercase tracking-tighter flex items-center gap-1 mt-1">
                      <span class="animate-ping w-1.5 h-1.5 bg-red-600 rounded-full"></span> 🚩 COMENTARI REPORTAT
                    </span>
                  </div>
                  
                  <div class="flex gap-1">
                     <button v-if="com.reportat" @click="validarComentari(post._id, com.id_comentari || com._id)" class="text-green-600 hover:text-green-800 p-1" title="Validar comentari">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                     </button>
                     <button @click="eliminarComentari(post._id, com.id_comentari || com._id)" class="text-gray-300 hover:text-red-500 transition-colors p-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓ VERIFICACIÓ D'IDENTITAT -->
      <section v-if="tabActual === 'identitats'" class="animate-fade-in">
        <div v-if="identitatsPendents.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
            <div class="bg-white p-8 rounded-full shadow-xl mb-6 ring-8 ring-blue-50">
              <svg class="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-black text-[#402749] mb-1">Totes les identitats revisades</h3>
            <p class="text-gray-400 text-sm max-w-xs mx-auto">No hi ha usuaris pendents de verificar la seva edat.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="user in identitatsPendents" :key="user._id" class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group transition-all duration-300">
            <div class="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <img :src="`${API_URL}${user.verificacio_imatge}`" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] text-white font-black uppercase tracking-widest border border-white/20">
                    Sol·licitud: {{ new Date(user.data_sollicitud).toLocaleDateString() }}
                </div>
            </div>
            <div class="p-6 flex-1 flex flex-col bg-white">
                <div class="mb-4">
                  <h4 class="font-black text-[#402749] text-sm uppercase tracking-tight mb-0.5 line-clamp-1">{{ user.nom_usuari }}</h4>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{{ user.correu }}</p>
                </div>
                
                <div class="mt-auto flex gap-2">
                    <button @click="decidirIdentitat(user._id, 'aprovat')" class="flex-1 bg-[#402749] hover:bg-[#5d3962] text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95">
                        Aprovar Usuari
                    </button>
                    <button @click="decidirIdentitat(user._id, 'rebutjar')" class="flex-1 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
                        Rebutjar
                    </button>
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
                <th class="p-4 text-[10px] font-black uppercase text-gray-400">Estrelles</th>
                <th class="p-4 text-[10px] font-black uppercase text-gray-400">Comentari</th>
                <th class="p-4 text-[10px] font-black uppercase text-gray-400 text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in ressenyesFiltrades" :key="res._id" class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="p-4 font-bold text-sm text-[#402749]">{{ res.id_usuari?.nom_usuari || 'Anònim' }}</td>
                <td class="p-4">
                  <div class="flex text-amber-500">
                    <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= res.estrelles ? 'fill-current' : 'text-gray-300 fill-current'" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                </td>
                <td class="p-4 text-xs text-gray-600">{{ res.comentari }}</td>
                <td class="p-4 text-right">
                  <button @click="eliminarRessenya(res)" class="text-red-400 hover:text-red-600 font-bold text-[10px] uppercase">Eliminar</button>
                </td>
              </tr>
              <tr v-if="ressenyesFiltrades.length === 0">
                <td colspan="4" class="p-10 text-center text-gray-400 italic text-sm">No s'han trobat ressenyes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="tabActual === 'eliminats'" class="animate-fade-in">
        <div class="bg-white rounded-3xl shadow-lg border border-red-100 overflow-hidden">
          <div class="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
            <h2 class="text-red-700 font-black text-xs uppercase tracking-widest">Historial d'eliminats (Sessió)</h2>
            <button @click="historialEliminats = []" class="text-[9px] bg-white border border-red-200 text-red-500 px-3 py-1 rounded-lg font-bold uppercase hover:bg-red-500 hover:text-white transition-all">Buidar paperera</button>
          </div>
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
              <tr>
                <th class="p-4">Tipus</th>
                <th class="p-4">Usuari</th>
                <th class="p-4">Contingut</th>
                <th class="p-4 text-right">Data Acció</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in historialEliminats" :key="idx" class="border-t border-gray-50 bg-gray-50/30">
                <td class="p-4"><span class="px-2 py-0.5 rounded text-[8px] font-black uppercase" :class="item.tipus === 'post' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">{{ item.tipus }}</span></td>
                <td class="p-4 font-bold text-xs text-[#402749]">{{ item.usuari }}</td>
                <td class="p-4 text-xs text-gray-500 italic max-w-md truncate">{{ item.text }}</td>
                <td class="p-4 text-right text-[10px] font-mono text-gray-400">{{ item.dataAccio }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AdminNav from './components/AdminNav.vue';
import { useCustomModal } from '../../composables/useCustomModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat'; 
const { mostrarModal } = useCustomModal();
const tabActual = ref('posts');
const notificacio = ref('');
const confirmacioPendents = ref(null);
const confirmacioTitol = ref('');
const confirmacioMissatge = ref('');
const ressenyes = ref([]);
const posts = ref([]);
const seleccionats = ref([]);
const filtreCerca = ref('');
const historialEliminats = ref([]);
const identitatsPendents = ref([]);
const estaCarregant = ref(false);

const postsFiltrats = computed(() => {
  const cerca = filtreCerca.value.toLowerCase();
  return posts.value.filter(p => 
    p.nom_usuari?.toLowerCase().includes(cerca) || 
    p.text?.toLowerCase().includes(cerca)
  );
});

const ressenyesFiltrades = computed(() => {
  const cerca = filtreCerca.value.toLowerCase();
  return ressenyes.value.filter(r => {
    const nom = (r.id_usuari?.nom_usuari || 'Anònim').toLowerCase();
    const text = (r.comentari || '').toLowerCase();
    return nom.includes(cerca) || text.includes(cerca);
  });
});

const cargarDatos = async () => {
  estaCarregant.value = true;
  try {
    const resPosts = await fetch(`${API_URL}/api/social/admin/posts`);
    if (resPosts.ok) {
        const dades = await resPosts.json();
        // FILTRE: Mostrem el post si ell mateix està reportat O si té algun comentari reportat
        posts.value = dades.filter(p => 
           p.reportat === true || 
           (p.comentaris && p.comentaris.some(c => c.reportat === true))
        );
    }
    
    const resRes = await fetch(`${API_URL}/api/social/admin/ressenyes`);
    if (resRes.ok) ressenyes.value = await resRes.json();

    const resIdent = await fetch(`${API_URL}/api/verificacio/pendents`);
    if (resIdent.ok) identitatsPendents.value = await resIdent.json();
  } catch (err) {
    console.error("Error carregar dades:", err);
  } finally {
    setTimeout(() => estaCarregant.value = false, 600);
  }
};

const alternarSeleccioTots = () => {
  if (seleccionats.value.length === postsFiltrats.value.length) {
    seleccionats.value = [];
  } else {
    seleccionats.value = postsFiltrats.value.map(p => p._id);
  }
};

const mostrarNotificacio = (msj) => {
  notificacio.value = msj;
  setTimeout(() => notificacio.value = '', 3000);
};

const demanarConfirmacio = (titol, msj, callback) => {
  confirmacioTitol.value = titol;
  confirmacioMissatge.value = msj;
  confirmacioPendents.value = callback;
};

const cancelarConfirmacio = () => {
  confirmacioPendents.value = null;
};

const executarConfirmacio = () => {
  if (confirmacioPendents.value) {
    confirmacioPendents.value();
    confirmacioPendents.value = null;
  }
};

const marcarRevisat = (postId) => {
  demanarConfirmacio("Validar Post", "Segur que vols marcar aquest post com a segur?", async () => {
    try {
      const response = await fetch(`${API_URL}/api/social/admin/posts/${postId}/revisat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        // Re-filtrem localment: si no queden comentaris reportats, treiem el post
        const post = posts.value.find(p => p._id === postId);
        if (post) post.reportat = false;
        actualitzarLlistaLocal(postId);
        mostrarNotificacio("Post validat amb èxit");
      }
    } catch (err) { console.error(err); }
  });
};

const validarComentari = async (postId, comentariId) => {
  try {
    const response = await fetch(`${API_URL}/api/social/admin/posts/${postId}/comentaris/${comentariId}/revisat`, {
      method: 'PUT'
    });
    if (response.ok) {
      const post = posts.value.find(p => p._id === postId);
      if (post) {
        const com = post.comentaris.find(c => (c.id_comentari || c._id) === comentariId);
        if (com) com.reportat = false;
        actualitzarLlistaLocal(postId);
      }
    }
  } catch (err) { console.error(err); }
};

const actualitzarLlistaLocal = (postId) => {
  const post = posts.value.find(p => p._id === postId);
  // Si el post ja no està reportat I no té comentaris reportats, l'eliminem de la vista de moderació
  if (post && !post.reportat && !post.comentaris.some(c => c.reportat)) {
    posts.value = posts.value.filter(p => p._id !== postId);
  }
};

const eliminarPost = (postObj) => {
  demanarConfirmacio("🚨 Eliminar Post", "Aquesta acció esborrarà el post de forma permanent. Estàs segur?", async () => {
    try {
      const response = await fetch(`${API_URL}/api/social/posts/${postObj._id}`, { method: 'DELETE' });
      if (response.ok) {
        historialEliminats.value.unshift({
          tipus: 'post',
          usuari: postObj.nom_usuari,
          text: postObj.text,
          dataAccio: new Date().toLocaleTimeString()
        });
        posts.value = posts.value.filter(p => p._id !== postObj._id);
        mostrarNotificacio("Post eliminat del sistema");
      }
    } catch (err) { console.error(err); }
  });
};

const eliminarComentari = (postId, comentariId) => {
  demanarConfirmacio("Eliminar Comentari", "Segur que vols esborrar aquest comentari?", async () => {
    try {
      const response = await fetch(`${API_URL}/api/social/posts/${postId}/comentari/${comentariId}`, { 
        method: 'DELETE' 
      });
      
      if (response.ok) {
        const post = posts.value.find(p => p._id === postId);
        if (post) {
          post.comentaris = post.comentaris.filter(c => (c.id_comentari || c._id) !== comentariId);
        }
        mostrarNotificacio("Comentari eliminat");
      }
    } catch (err) { console.error(err); }
  });
};

const decidirIdentitat = (userId, estat) => {
  const titol = estat === 'aprovat' ? "Aprovar Identitat" : "Rebutjar i Esborrar";
  const msj = estat === 'aprovat' ? "S'activarà el compte de l'usuari definitivament." : "Es borrarà l'usuari i totes les seves dades per ser menor o incomplir les regles.";
  
  demanarConfirmacio(titol, msj, async () => {
    try {
      const response = await fetch(`${API_URL}/api/verificacio/decidir/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estat })
      });
      if (response.ok) {
        identitatsPendents.value = identitatsPendents.value.filter(u => u._id !== userId);
        mostrarNotificacio(`Identitat ${estat} amb èxit`);
      }
    } catch (err) { console.error(err); }
  });
};

const eliminarRessenya = async (resObj) => {
  const isConfirmed = await mostrarModal({ isAlert: false, title: 'Confirmació', message: 'Eliminar ressenya?' });
  if (!isConfirmed) return;
  const idToErase = resObj._id || resObj.id;
  if (!idToErase) {
    console.error("No se encontró el ID de la ressenya", resObj);
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/social/admin/ressenyes/${idToErase}`, { method: 'DELETE' });
    if (response.ok) {
      historialEliminats.value.unshift({ tipus: 'ressenya', usuari: resObj.id_usuari?.nom_usuari || 'Anònim', text: resObj.comentari, dataAccio: new Date().toLocaleTimeString() });
      ressenyes.value = ressenyes.value.filter(r => (r._id || r.id) !== idToErase);
    }
  } catch (err) { console.error(err); }
};

onMounted(cargarDatos);
</script>


<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}
@keyframes bounceIn {
  0% { transform: scale(0.3) translateX(-50%); opacity: 0; }
  100% { transform: scale(1) translateX(-50%); opacity: 1; }
}
.animate-modal-bounce {
  animation: modalBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}
@keyframes modalBounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Millora del focus en checkboxes */
input[type="checkbox"]:checked {
  background-color: #402749;
  border-color: #bc85ab;
}
</style>