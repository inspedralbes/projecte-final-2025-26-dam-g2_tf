<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-20 md:pb-0">
    
    <aside class="hidden md:flex flex-col w-64 bg-[#402749] text-white p-6 shadow-lg h-screen sticky top-0">
      <h2 class="text-2xl font-bold mb-8 text-[#f5cbdd]">Admin Panel</h2>
      <nav class="flex flex-col gap-4">
        <router-link to="/admin/dashboard" class="p-2 rounded hover:bg-[#5d3962] text-pink-200">Inici</router-link>
        <router-link to="/admin/llocs" class="p-2 rounded hover:bg-[#5d3962]">Gestió Llocs</router-link>
        <router-link to="/admin/peticions" class="p-2 rounded hover:bg-[#5d3962]">Peticions Usuaris</router-link>
        <button @click="logout" class="mt-10 text-red-300 text-left p-2 border-t border-[#5d3962] pt-4">Sortir</button>
      </nav>
    </aside>

    <main class="flex-1 p-6 md:p-10">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-[#402749]">Benvingut, Administrador</h1>
        <p class="text-gray-500 mt-2">Control central de l'aplicació.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-8 rounded-xl shadow border-l-8 border-[#804f7f]">
          <h2 class="text-xl font-bold text-[#402749] mb-4"> Gestió de Contingut</h2>
          <p class="text-gray-600 text-sm">Valida llocs oficials i fotos històriques.</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow border-l-8 border-[#bc85ab]">
          <h2 class="text-xl font-bold text-[#402749] mb-4">Peticions</h2>
          <p class="text-gray-600 text-sm">Revisa les propostes de la comunitat.</p>
        </div>
      </section>
    </main>

    <div class="fixed bottom-0 z-50 w-full bg-[#402749] border-t border-[#804f7f] md:hidden">
      <div class="grid h-full grid-cols-4 mx-auto">
          
          <button @click="irA('/admin/dashboard')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
              <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
              </svg>
              <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Inici</span>
          </button>

          <button @click="irA('/admin/llocs')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
              <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Llocs</span>
          </button>

          <button @click="irA('/admin/peticions')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
              <svg class="w-6 h-6 mb-1 text-white/70 group-hover:text-[#f5cbdd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-[10px] text-white/50 group-hover:text-white uppercase font-bold">Peticions</span>
          </button>

          <button @click="logout" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] group transition-colors">
              <svg class="w-6 h-6 mb-1 text-red-400/70 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="text-[10px] text-red-400/50 group-hover:text-red-400 uppercase font-bold">Sortir</span>
          </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function irA(ruta) {
  router.push(ruta);
}

function logout() {
  localStorage.clear();
  window.location.href = '/'; 
}
</script>