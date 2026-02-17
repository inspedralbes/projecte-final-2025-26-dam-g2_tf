<template>
  <div class="min-h-screen bg-gradient-to-b from-[#1a0a1f] to-black text-white font-sans selection:bg-[#bc85ab] selection:text-white pb-24">
    
    <!-- 1. Header de navegació -->
    <header class="p-4 flex items-center justify-between sticky top-0 bg-[#1a0a1f]/80 backdrop-blur-md z-50 border-b border-white/5">
      <button 
        @click="tornar" 
        class="text-[#f5cbdd] hover:text-white flex items-center font-bold text-sm transition-colors group"
      >
        <span class="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> TORNAR
      </button>
      <h1 class="text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d9a6c2] to-[#f5cbdd]">PERFIL</h1>
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#f5cbdd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </header>

    <main class="p-4 max-w-md mx-auto space-y-6">
      
      <!-- 2. Targeta d'Usuari Principal -->
      <section class="relative bg-[#402749] rounded-3xl p-6 shadow-2xl overflow-hidden border border-[#f5cbdd]/10">
        <!-- Efectes de fons -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-[#9f6795] rounded-full blur-[60px] opacity-30"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-[#5d3962] rounded-full blur-[60px] opacity-30"></div>

        <div class="relative z-10 flex flex-col items-center">
          <div class="relative mb-4 group cursor-pointer" @click="triggerFileInput">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-[#bc85ab] to-[#5d3962] p-1 shadow-lg transform transition-transform group-hover:scale-105">
              <div class="w-full h-full rounded-full bg-[#1a0a1f] flex items-center justify-center text-3xl font-black text-white overflow-hidden relative">
                <img 
                  v-if="user?.avatar" 
                  :src="user.avatar" 
                  class="w-full h-full object-cover" 
                />
                <span v-else>{{ user?.nom?.charAt(0).toUpperCase() || '?' }}</span>
                
                <!-- Overlay d'edició -->
                <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="absolute -bottom-2 inset-x-0 flex justify-center">
              <span class="bg-[#bc85ab] text-[#1a0a1f] text-[10px] font-black px-3 py-1 rounded-full border border-[#1a0a1f] shadow-lg">
                NIVELL {{ nivell }}
              </span>
            </div>
            <!-- Input ocult per pujar imatges -->
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileUpload" 
              accept="image/*" 
              class="hidden" 
            />
          </div>
          
          <div class="mt-4 text-center w-full space-y-2">
           <h2 class="text-3xl font-black text-white tracking-tight drop-shadow-md leading-none">
             {{ user?.nom || 'Explorador Anònim' }}
           </h2>
          
           <!-- Selector de Títol -->
           <button
             @click="mostrarSelectorTitols = true"
             class="inline-flex items-center gap-2 bg-black/20 hover:bg-black/40 py-1.5 px-4 rounded-full transition-all group border border-white/5 hover:border-white/20"
           >
             <span class="text-[#f5cbdd] text-xs font-bold tracking-widest uppercase group-hover:text-white transition-colors">
               {{ user?.titol || titolLogic }}
             </span>
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-[#f5cbdd]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
             </svg>
           </button>
          
           <!-- Biografia Editable -->
           <div class="mt-4 relative group">
              <div
                v-if="!editantBio"
                @click="editantBio = true; nextTick(() => $refs.bioInput?.focus())"
                class="text-[#d9a6c2]/80 text-sm italic min-h-[3rem] flex items-center justify-center cursor-text hover:text-white transition-colors px-6 py-2 border border-transparent hover:border-white/10 rounded-xl bg-transparent hover:bg-black/10"
              >
                "{{ user?.bio || 'Afegeix una breu biografia...' }}"
              </div>
             
              <div v-else class="relative">
                <textarea
                 v-model="tempBio"
                 ref="bioInput"
                 @blur="guardarBio" 
                 @keydown.enter.prevent="guardarBio"
                 class="w-full bg-black/40 text-white text-sm p-3 rounded-xl border border-[#bc85ab] outline-none focus:ring-2 ring-[#bc85ab]/50 resize-none text-center shadow-inner"
                 rows="2"
                 placeholder="Escriu alguna cosa sobre tu..."
                ></textarea>
                <span class="text-[10px] text-white/40 absolute bottom-2 right-2 pointers-events-none">Prem Enter</span>
              </div>
           </div>
         </div>

          <!-- Barra de Progrés XP -->
          <div class="w-full mt-6 bg-black/20 p-3 rounded-xl border border-white/5">
            <div class="flex justify-between text-[10px] text-[#f5cbdd]/70 mb-1 font-bold uppercase tracking-wider">
              <span>Progrés Nivell {{ nivell }}</span>
              <span>{{ xpActual }} / {{ xpNextLevel }} XP</span>
            </div>
            <div class="h-2 bg-black/40 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-[#9f6795] to-[#f5cbdd] transition-all duration-1000 ease-out" 
                :style="{ width: percentatgeXP + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Navegació per Pestanyes (Tabs) -->
      <nav class="flex p-1 bg-[#2d1b33] rounded-2xl backdrop-blur-sm border border-white/5 sticky top-20 z-40 shadow-xl overflow-x-auto scrollbar-hide">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 min-w-[20%] py-3 text-xs md:text-sm font-bold rounded-xl transition-all duration-300 uppercase tracking-wide whitespace-nowrap px-2"
          :class="activeTab === tab.id ? 'bg-[#bc85ab] text-[#1a0a1f] shadow-lg scale-[1.02]' : 'text-[#f5cbdd]/60 hover:text-white hover:bg-white/5'"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- 4. Contingut Dinàmic -->
      <transition name="fade" mode="out-in">
        
        <!-- SECCIÓ CROMOS -->
        <div v-if="activeTab === 'cromos'" class="space-y-4">
          <div class="flex justify-between items-end px-1">
            <h3 class="text-xl font-bold text-white">Àlbum de Rutes</h3>
            <span class="text-xs text-[#bc85ab] font-mono">{{ cromos.length }} DESCOBERTS</span>
          </div>
          
          <div class="grid grid-cols-3 gap-3">
             <div 
              v-for="(cromo, i) in cromos" 
              :key="i"
              class="aspect-[3/4] rounded-xl relative group overflow-hidden border border-[#f5cbdd]/20 bg-[#2d1b33] shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-[#bc85ab]/20"
            >
              <img :src="cromo.imatge" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-[#1a0a1f] via-transparent to-transparent opacity-80"></div>
              
              <div class="absolute bottom-2 left-2 right-2">
                <p class="text-[10px] text-[#f5cbdd] font-bold leading-tight">{{ cromo.nom }}</p>
                <div class="flex gap-0.5 mt-1">
                  <span v-for="star in 3" :key="star" class="text-[8px] text-yellow-400">★</span>
                </div>
              </div>
            </div>
            
            <!-- Empty Slots (Placeholders) -->
            <div v-for="n in 3" :key="'empty'+n" class="aspect-[3/4] rounded-xl border-2 border-dashed border-[#5d3962] bg-white/5 flex flex-col items-center justify-center opacity-50 hover:opacity-70 transition-opacity">
              <span class="text-2xl text-[#f5cbdd]/20 mb-1">?</span>
              <span class="text-[8px] text-[#f5cbdd]/40 font-bold uppercase">Secret</span>
            </div>
          </div>
        </div>

        <!-- SECCIÓ ESTADÍSTIQUES (NOVA) -->
        <div v-else-if="activeTab === 'stats'" class="space-y-6">
          
          <!-- Resum Numèric -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-[#2d1b33] p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-[#402749] transition-colors">
              <span class="text-3xl font-black text-white">12</span>
              <span class="text-xs text-[#f5cbdd]/60 uppercase font-bold tracking-wider text-center">Rutes Completades</span>
            </div>
            <div class="bg-[#2d1b33] p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-[#402749] transition-colors">
              <span class="text-3xl font-black text-white">85%</span>
              <span class="text-xs text-[#f5cbdd]/60 uppercase font-bold tracking-wider text-center">Precisió IA Mitjana</span>
            </div>
             <div class="bg-[#2d1b33] p-4 rounded-2xl border border-white/5 flex flex-col items-center col-span-2 hover:bg-[#402749] transition-colors">
              <span class="text-3xl font-black text-white">42.5 km</span>
              <span class="text-xs text-[#f5cbdd]/60 uppercase font-bold tracking-wider text-center">Distància Explorada</span>
            </div>
          </div>

          <!-- Assoliments / Badges -->
          <div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3 px-1">Assoliments</h3>
            <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              <div class="flex flex-col items-center min-w-[80px]">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 p-0.5 shadow-lg shadow-orange-500/20 mb-2 transform hover:scale-110 transition-transform">
                  <div class="w-full h-full rounded-full bg-[#1a0a1f] flex items-center justify-center text-2xl">🏆</div>
                </div>
                <span class="text-[10px] font-bold text-center leading-tight text-[#f5cbdd]">Primeres Passes</span>
              </div>
              <div class="flex flex-col items-center min-w-[80px] opacity-100">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 mb-2 transform hover:scale-110 transition-transform">
                   <div class="w-full h-full rounded-full bg-[#1a0a1f] flex items-center justify-center text-2xl">📸</div>
                </div>
                <span class="text-[10px] font-bold text-center leading-tight text-[#f5cbdd]">Fotògraf Expert</span>
              </div>
              <div class="flex flex-col items-center min-w-[80px] opacity-40 grayscale">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 p-0.5 shadow-lg mb-2">
                   <div class="w-full h-full rounded-full bg-[#1a0a1f] flex items-center justify-center text-2xl">🌙</div>
                </div>
                <span class="text-[10px] font-bold text-center leading-tight text-[#f5cbdd]">Mussol Nocturn</span>
              </div>
            </div>
          </div>

          <!-- Llista de Propostes -->
          <div>
            <div class="flex justify-between items-center mb-3 px-1">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Les Teves Propostes</h3>
              <button class="text-[10px] bg-[#bc85ab] text-[#1a0a1f] px-2 py-1 rounded font-bold hover:bg-white transition-colors">NOVA</button>
            </div>
            
            <div class="space-y-3">
              <div class="bg-[#2d1b33] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-[#bc85ab]/30 transition-colors">
                <div>
                  <p class="font-bold text-sm text-white group-hover:text-[#bc85ab] transition-colors">Refugi 307</p>
                  <p class="text-xs text-[#f5cbdd]/60">Poble Sec</p>
                </div>
                <span class="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-bold border border-yellow-500/30">PENDENT</span>
              </div>
               <div class="bg-[#2d1b33] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-[#bc85ab]/30 transition-colors">
                <div>
                  <p class="font-bold text-sm text-white group-hover:text-[#bc85ab] transition-colors">Casa Vicens</p>
                  <p class="text-xs text-[#f5cbdd]/60">Gràcia</p>
                </div>
                <span class="px-2 py-1 rounded bg-green-500/20 text-green-300 text-[10px] font-bold border border-green-500/30">APROVAT</span>
              </div>
            </div>
          </div>

        </div>

        <!-- SECCIÓ AMICS -->
        <div v-else-if="activeTab === 'amics'" class="space-y-4">
          <button 
            @click="mostrarAfegirAmic = !mostrarAfegirAmic"
            class="w-full py-4 bg-gradient-to-r from-[#5d3962] to-[#804f7f] hover:brightness-110 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 border border-[#d9a6c2]/30 active:scale-95"
          >
            <span class="text-xl" v-if="!mostrarAfegirAmic">+</span>
            <span class="text-xl" v-else>-</span>
            {{ mostrarAfegirAmic ? 'CANCEL·LAR' : 'CONVIDAR AMICS' }}
          </button>
          
          <!-- FORMULARI AFEGIR AMIC -->
          <div v-if="mostrarAfegirAmic" class="animate-fade-in bg-[#2d1b33] p-4 rounded-2xl border border-[#bc85ab]/50 shadow-lg mb-4">
            <p class="text-xs text-[#f5cbdd] mb-2 font-bold">Afegeix un amic pel seu nom:</p>
            <div class="flex gap-2">
              <input 
                v-model="nouAmicInput" 
                @keydown.enter="afegirAmic"
                type="text" 
                placeholder="Nom de l'amic..." 
                class="flex-1 bg-black/40 text-white text-sm px-4 py-2 rounded-xl border border-white/10 focus:border-[#bc85ab] outline-none transition-colors"
              />
              <button 
                @click="afegirAmic"
                class="bg-[#bc85ab] text-[#1a0a1f] px-4 py-2 rounded-xl font-black text-sm hover:bg-white transition-colors"
              >
                AFEGIR
              </button>
            </div>
          </div>
          
          <p class="text-xs text-center text-[#f5cbdd]/60 mb-4">Fes equip per completar rutes multijugador!</p>

          <div class="space-y-3">
            <div v-for="amic in amics" :key="amic.id" class="flex items-center justify-between p-4 bg-[#2d1b33] rounded-2xl border border-white/5 shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#f5cbdd] text-[#402749] flex items-center justify-center text-sm font-black border-2 border-[#402749]">
                  {{ amic.initials }}
                </div>
                <div>
                  <p class="font-bold text-sm text-white">{{ amic.nom }}</p>
                  <div class="flex items-center gap-1.5">
                    <span class="block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span class="text-[10px] text-[#d9a6c2] uppercase font-bold tracking-wide">Connectat</span>
                  </div>
                </div>
              </div>
              <button class="text-[#1a0a1f] text-[10px] font-black px-4 py-2 bg-[#bc85ab] rounded-lg hover:bg-[#d9a6c2] transition-colors shadow-lg">
                JUGAR
              </button>
            </div>
             <div class="flex items-center justify-between p-4 bg-[#2d1b33]/50 rounded-2xl border border-white/5 shadow-sm opacity-60">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-black border-2 border-gray-600">
                  AP
                </div>
                <div>
                  <p class="font-bold text-sm text-gray-300">Àlex Puig</p>
                  <p class="text-[10px] text-gray-400">Desconnectat fa 2h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓ CONFIGURACIÓ -->
        <div v-else-if="activeTab === 'config'" class="space-y-6">
          <div class="bg-[#2d1b33] rounded-2xl p-5 border border-white/5 space-y-6 shadow-inner">
            
            <!-- Toggle Privacy -->
            <div class="flex items-center justify-between group cursor-pointer" @click="settings.public = !settings.public">
              <div class="pr-4">
                <p class="font-bold text-white group-hover:text-[#bc85ab] transition-colors">Perfil Públic</p>
                <p class="text-xs text-[#f5cbdd]/60 mt-1">Si està actiu, apareixeràs al rànquing global de jugadors.</p>
              </div>
              <div class="w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0"
                  :class="settings.public ? 'bg-[#bc85ab]' : 'bg-black/40'">
                <div class="absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm"
                    :class="settings.public ? 'left-6' : 'left-1'"></div>
              </div>
            </div>

            <div class="h-px bg-white/5 w-full"></div>

            <!-- Toggle Notifications -->
            <div class="flex items-center justify-between group cursor-pointer" @click="settings.notificacions = !settings.notificacions">
              <div class="pr-4">
                <p class="font-bold text-white group-hover:text-[#bc85ab] transition-colors">Notificacions</p>
                <p class="text-xs text-[#f5cbdd]/60 mt-1">Rep avisos quan hi hagi nous llocs disponibles a prop.</p>
              </div>
              <div class="w-12 h-7 rounded-full relative transition-colors duration-300 shrink-0"
                  :class="settings.notificacions ? 'bg-[#bc85ab]' : 'bg-black/40'">
                <div class="absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm"
                    :class="settings.notificacions ? 'left-6' : 'left-1'"></div>
              </div>
            </div>
          </div>

          <!-- Botó Logout -->
          <button 
            @click="tancarSessio" 
            class="w-full bg-[#1a0a1f] hover:bg-red-900/20 text-red-300/80 hover:text-red-200 border border-red-500/20 py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 mt-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            TANCAR SESSIÓ
          </button>
          
           <div class="text-center mt-8 opacity-30">
            <p class="text-[10px] uppercase font-bold tracking-widest text-[#f5cbdd]">Projecte Final DAM G2</p>
            <p class="text-[9px] font-mono mt-1">v1.2.0-beta</p>
          </div>
        </div>

      </transition>

    </main>

    <!-- MODAL TITOLS -->
    <div v-if="mostrarSelectorTitols" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" @click.self="mostrarSelectorTitols = false">
      <div class="bg-[#2d1b33] w-full max-w-sm rounded-[2rem] p-6 border border-[#bc85ab]/30 shadow-2xl relative animate-slide-up">
        <button @click="mostrarSelectorTitols = false" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">✕</button>
        
        <div class="text-center mb-6">
          <h3 class="text-2xl font-black text-white mb-1">Tria el teu Títol</h3>
          <p class="text-xs text-[#f5cbdd]/60">Desbloqueja nous títols pujant de nivell!</p>
        </div>

        <div class="space-y-2 max-h-[50vh] overflow-y-auto pr-1 custom-scroll">
          <button 
            v-for="titolOp in llistaTitols" 
            :key="titolOp.id"
            @click="seleccionarTitol(titolOp)"
            :disabled="titolOp.minLevel > nivell"
            class="w-full p-4 rounded-2xl flex items-center justify-between transition-all border group relative overflow-hidden"
            :class="[
              (user?.titol === titolOp.nom) 
                ? 'bg-[#bc85ab] border-[#bc85ab] text-[#1a0a1f] shadow-lg shadow-[#bc85ab]/20' 
                : (titolOp.minLevel > nivell) 
                  ? 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed grayscale' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
            ]"
          >
            <div class="text-left relative z-10">
              <p class="font-bold text-sm">{{ titolOp.nom }}</p>
              <p v-if="titolOp.minLevel > nivell" class="text-[10px] uppercase font-bold mt-1 opacity-70 flex items-center gap-1">
                🔒 Desbloqueja al nivell {{ titolOp.minLevel }}
              </p>
              <p v-else class="text-[10px] opacity-60">Disponible</p>
            </div>
            <div v-if="user?.titol === titolOp.nom" class="w-6 h-6 rounded-full bg-[#1a0a1f] text-[#bc85ab] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
            </div>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();


// ESTATS
const user = ref(null);
const activeTab = ref('stats'); // Tabs: cromos, stats, amics, config

// --- Dades Mock ---
// En una app real, això vindria de la base de dades MongoDB (Col·lecció d'Usuaris)
const nivell = ref(3);
const xpActual = ref(350);
const xpNextLevel = 500;

// BIO EDITABLE
const editantBio = ref(false);
const tempBio = ref('');
const bioInput = ref(null);

watch(editantBio, (val) => {
  if (val) {
    tempBio.value = user.value?.bio || '';
    nextTick(() => bioInput.value?.focus());
  }
});

function guardarBio() {
  if (user.value) {
    user.value.bio = tempBio.value;
    saveUser();
  }
  editantBio.value = false;
}

// TÍTOLS
const mostrarSelectorTitols = ref(false);
const llistaTitols = [
  { id: 1, nom: 'Explorador Novell', minLevel: 1 },
  { id: 2, nom: 'Fotògraf Curios', minLevel: 2 },
  { id: 3, nom: 'Rastrejador', minLevel: 3 },
  { id: 4, nom: 'Mestre Urbà', minLevel: 5 },
  { id: 5, nom: 'Historiador', minLevel: 7 },
  { id: 6, nom: 'Llegenda BCN', minLevel: 10 },
];

const titolLogic = computed(() => {
  if (nivell.value < 2) return 'Explorador Novell';
  if (nivell.value < 5) return 'Rastrejador';
  return 'Mestre Urbà';
});

function seleccionarTitol(titolObj) {
  if (titolObj.minLevel > nivell.value) return;
  if (user.value) {
    user.value.titol = titolObj.nom;
    saveUser();
  }
  mostrarSelectorTitols.value = false;
}

// AVATAR
const fileInput = ref(null);
function triggerFileInput() { fileInput.value?.click(); }
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file && user.value) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      user.value.avatar = ev.target.result;
      saveUser();
    };
    reader.readAsDataURL(file);
  }
}

// HELPERS
const percentatgeXP = computed(() => (xpActual.value / xpNextLevel) * 100);
function saveUser() { localStorage.setItem('user', JSON.stringify(user.value)); }

function tornar() {
  router.push('/');
}

function tancarSessio() {
  localStorage.removeItem('user');
  router.push('/');
  // Refresh page after logout
  setTimeout(() => window.location.reload(), 50);
}

const tabs = [
  { id: 'cromos', label: 'Cromos' },
  { id: 'stats', label: 'Progrés' },
  { id: 'amics', label: 'Amics' },
  { id: 'config', label: 'Ajustos' }
];

// Mock de cromos guanyats (fotos històriques recreades)
const cromos = ref([
  { nom: 'Búnquers del Carmel', imatge: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80' },
  { nom: 'Arc de Triomf', imatge: 'https://images.unsplash.com/photo-1581023793268-52fb40059c4b?w=400&q=80' },
  { nom: 'Catedral del Mar', imatge: 'https://images.unsplash.com/photo-1563294317-0d5b5463f538?w=400&q=80' },
]);

const amics = ref([
  { id: 1, nom: 'Laura Garcia', initials: 'LG' },
  { id: 2, nom: 'Marc Pérez', initials: 'MP' },
]);

const mostrarAfegirAmic = ref(false);
const nouAmicInput = ref('');

function afegirAmic() {
  const nom = nouAmicInput.value.trim();
  if (!nom) return;
  
  // Evitar duplicats (simple)
  if (amics.value.some(a => a.nom.toLowerCase() === nom.toLowerCase())) {
    alert('Aquest amic ja està a la llista!');
    return;
  }

  // Generar inicials
  const initials = nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  amics.value.unshift({
    id: Date.now(),
    nom: nom,
    initials: initials
  });

  nouAmicInput.value = '';
  mostrarAfegirAmic.value = false;
}

const settings = ref({
  public: true,
  notificacions: false
});

onMounted(() => {
  const saved = localStorage.getItem('user');
  if (saved) {
    user.value = JSON.parse(saved);
    if (!user.value.titol) user.value.titol = titolLogic.value;
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>