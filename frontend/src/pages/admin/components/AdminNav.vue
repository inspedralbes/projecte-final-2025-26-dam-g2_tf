<template>
  <aside class="hidden md:flex flex-col w-64 bg-[#402749] text-white p-6 shadow-lg h-screen sticky top-0 font-sans antialiased">
    <h2 class="text-2xl font-bold mb-8 text-[#f5cbdd]">Admin Panel</h2>
    <nav class="flex flex-col gap-4 flex-1">
      
      <router-link 
        to="/admin/dashboard" 
        class="p-2 rounded hover:bg-[#5d3962] transition-all font-bold hover:scale-105 transform" 
        active-class="bg-[#5d3962] text-[#f5cbdd] border-l-4 border-[#f5cbdd] pl-2"
      >
        Inici
      </router-link>

      <router-link 
        to="/admin/llocs" 
        class="p-2 rounded hover:bg-[#5d3962] transition-all font-bold hover:scale-105 transform" 
        active-class="bg-[#5d3962] text-[#f5cbdd] border-l-4 border-[#f5cbdd] pl-2"
      >
        Gestió Llocs
      </router-link>

      <router-link 
        to="/admin/peticions" 
        class="p-2 rounded hover:bg-[#5d3962] transition-all font-bold hover:scale-105 transform" 
        active-class="bg-[#5d3962] text-[#f5cbdd] border-l-4 border-[#f5cbdd] pl-2"
      >
        Peticions Usuaris
      </router-link>

      <router-link 
        to="/admin/moderacio" 
        class="p-2 rounded hover:bg-[#5d3962] transition-all font-bold hover:scale-105 transform" 
        active-class="bg-[#5d3962] text-[#f5cbdd] border-l-4 border-[#f5cbdd] pl-2"
      >
        Moderació
      </router-link>

      <router-link 
        to="/admin/personatges" 
        class="p-2 rounded hover:bg-[#5d3962] transition-all font-bold hover:scale-105 transform" 
        active-class="bg-[#5d3962] text-[#f5cbdd] border-l-4 border-[#f5cbdd] pl-2"
      >
        Personatges
      </router-link>

    </nav>
    <button @click="logout" class="mt-10 text-red-300 text-left p-2 border-t border-[#5d3962] pt-4 hover:text-red-400 transition-all font-bold hover:scale-105 transform">
      Sortir
    </button>
  </aside>

  <div class="fixed bottom-0 z-[9999] w-full bg-[#402749] border-t border-[#804f7f] left-1/2 -translate-x-1/2 md:hidden font-sans antialiased">
    <div class="grid h-16 max-w-lg grid-cols-6 mx-auto">
        
        <button @click="irA('/admin/dashboard')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] transition-all group hover:scale-110 transform">
            <svg class="w-6 h-6 mb-1 transition-colors" :class="$route.path === '/admin/dashboard' ? 'text-[#f5cbdd]' : 'text-white/70 group-hover:text-[#f5cbdd]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
            </svg>
            <span class="text-[10px] uppercase font-bold transition-colors" :class="$route.path === '/admin/dashboard' ? 'text-white' : 'text-white/50 group-hover:text-white'">
              Inici
            </span>
        </button>

        <button @click="irA('/admin/llocs')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] transition-all group hover:scale-110 transform">
            <svg class="w-6 h-6 mb-1 transition-colors" :class="$route.path === '/admin/llocs' ? 'text-[#f5cbdd]' : 'text-white/70 group-hover:text-[#f5cbdd]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-[10px] uppercase font-bold transition-colors" :class="$route.path === '/admin/llocs' ? 'text-white' : 'text-white/50 group-hover:text-white'">
              Llocs
            </span>
        </button>

        <button @click="irA('/admin/moderacio')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] transition-all group hover:scale-110 transform">
            <svg class="w-6 h-6 mb-1 transition-colors" :class="$route.path === '/admin/moderacio' ? 'text-[#f5cbdd]' : 'text-white/70 group-hover:text-[#f5cbdd]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-[10px] uppercase font-bold transition-colors" :class="$route.path === '/admin/moderacio' ? 'text-white' : 'text-white/50 group-hover:text-white'">
              Moderar
            </span>
        </button>

        <button @click="irA('/admin/peticions')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] transition-all group hover:scale-110 transform">
            <svg class="w-6 h-6 mb-1 transition-colors" :class="$route.path === '/admin/peticions' ? 'text-[#f5cbdd]' : 'text-white/70 group-hover:text-[#f5cbdd]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="text-[10px] uppercase font-bold transition-colors" :class="$route.path === '/admin/peticions' ? 'text-white' : 'text-white/50 group-hover:text-white'">
              Peticions
            </span>
        </button>

        <button @click="irA('/admin/personatges')" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] transition-all group hover:scale-110 transform">
            <svg class="w-6 h-6 mb-1 transition-colors" :class="$route.path === '/admin/personatges' ? 'text-[#f5cbdd]' : 'text-white/70 group-hover:text-[#f5cbdd]'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-[10px] uppercase font-bold transition-colors" :class="$route.path === '/admin/personatges' ? 'text-white' : 'text-white/50 group-hover:text-white'">
              Person.
            </span>
        </button>

        <button @click="logout" type="button" class="inline-flex flex-col items-center justify-center p-4 hover:bg-[#5d3962] transition-all group hover:scale-110 transform">
            <svg class="w-6 h-6 mb-1 text-red-400/70 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="text-[10px] text-red-400/50 group-hover:text-red-400 uppercase font-bold">Sortir</span>
        </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const irA = (ruta) => router.push(ruta);

const logout = () => {
  localStorage.clear();
  window.location.href = '/'; 
};
</script>