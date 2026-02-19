<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <div class="w-64 bg-[#402749] text-white p-6">
      <h2 class="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav class="space-y-4">
        <router-link to="/admin/dashboard" class="block py-2 px-4 rounded bg-[#5d3962]">Inici</router-link>
        <router-link to="/admin/llocs" class="block py-2 px-4 rounded hover:bg-[#5d3962]">Gestionar Llocs</router-link>
        <router-link to="/admin/peticions" class="block py-2 px-4 rounded hover:bg-[#5d3962]">Peticions Usuaris</router-link>
        <button @click="logout" class="block w-full text-left py-2 px-4 rounded hover:bg-red-700 mt-8 text-red-300">Tancar Sessió</button>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-10">
      <h1 class="text-3xl font-bold text-[#402749] mb-8">Benvingut, Administrador</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#804f7f]">
          <h3 class="text-gray-500 text-sm font-medium uppercase">Total Llocs</h3>
          <p class="text-3xl font-bold text-[#402749] mt-2">12</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#bc85ab]">
          <h3 class="text-gray-500 text-sm font-medium uppercase">Peticions Pendents</h3>
          <p class="text-3xl font-bold text-[#402749] mt-2">5</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#d9a6c2]">
          <h3 class="text-gray-500 text-sm font-medium uppercase">Usuaris Actius</h3>
          <p class="text-3xl font-bold text-[#402749] mt-2">84</p>
        </div>
      </div>

      <div class="mt-12 bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Mètriques de Popularitat</h2>
        <p class="text-gray-600">Aquí podràs veure quins llocs surten més en el mode aleatori i ajustar la seva freqüència.</p>
        <div class="mt-4 h-48 bg-gray-50 flex items-center justify-center border border-dashed border-gray-300 rounded text-gray-400">
          [Gràfics de popularitat en desenvolupament]
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function logout() {
  localStorage.removeItem('admin_session');
  router.push('/admin/login');
}
</script>
