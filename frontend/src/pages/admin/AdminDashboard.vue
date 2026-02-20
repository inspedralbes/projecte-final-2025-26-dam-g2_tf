<template>
  <div class="min-h-screen bg-gray-100 flex text-gray-800">
    
    <aside class="w-64 bg-[#402749] text-white p-6">
      <h2 class="text-2xl font-bold mb-8">Admin</h2>
      <nav class="flex flex-col gap-4">
        <router-link to="/admin/dashboard" class="font-bold text-pink-300">Inici</router-link>
        <router-link to="/admin/llocs" class="hover:text-pink-300">Llocs</router-link>
        <router-link to="/admin/peticions" class="hover:text-pink-300">Peticions</router-link>
        <button @click="logout" class="mt-10 text-red-400 text-left">Tancar Sessió</button>
      </nav>
    </aside>

    <main class="flex-1 p-10">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-[#402749]">Benvingut, Administrador</h1>
        <p class="text-gray-500 mt-2">Gestió de l'aplicació de llocs històrics de Barcelona.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div class="bg-white p-8 rounded-xl shadow border-l-8 border-[#804f7f]">
          <h2 class="text-xl font-bold text-[#402749] mb-4">📍 Gestió de Llocs</h2>
          <p class="text-gray-600 leading-relaxed">
            Administra el catàleg oficial de llocs. Des d'aquí pots crear nous punts, 
            pujar fotografies històriques de referència i validar les coordenades GPS.
          </p>
        </div>

        <div class="bg-white p-8 rounded-xl shadow border-l-8 border-[#bc85ab]">
          <h2 class="text-xl font-bold text-[#402749] mb-4">📩 Peticions Usuaris</h2>
          <p class="text-gray-600 leading-relaxed">
            Revisa les propostes enviades per la comunitat. 
            Verifica que la ubicació és correcta, la descripció és adequada i que el lloc és segur per als usuaris.
          </p>
        </div>

      </section>

      <div class="mt-12 bg-[#f5cbdd] p-6 rounded-xl border border-[#d9a6c2] text-[#402749]">
        <div class="flex items-center gap-3">
          <span class="text-xl">⚠️</span>
          <p class="text-sm font-bold uppercase tracking-wider">
            Recordatori: Totes les validacions s'apliquen en temps real a l'App mòbil.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

/**
 * Tanca la sessió esborrant les dades i redirigint al login [cite: 112]
 */
function logout() {
  localStorage.clear();
  window.location.href = '/'; 
}
</script>