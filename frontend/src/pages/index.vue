<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">MENÚ PRINCIPAL</h1>
    
    <div class="grid grid-cols-1 gap-3">
      <button @click="irA('/social')" class="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl shadow transition">SOCIAL</button>
      <button @click="irA('/cercador')" class="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl shadow transition">CERCADOR</button>
      <button @click="irA('/mapa')" class="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-xl shadow transition">MAPA</button>
      <button @click="irA('/perfil')" class="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-xl shadow transition">PERFIL</button>
      <button @click="irA('/peticions')" class="bg-black hover:bg-gray-800 text-white p-4 rounded-xl shadow transition">PETICIONS</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

function irA(ruta) {
  router.push(ruta);
}
</script>