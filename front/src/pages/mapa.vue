<template>
  <div class="h-screen flex flex-col p-4 bg-gray-50">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold text-yellow-600">MAPA</h1>
      <button @click="router.push('/')" class="text-sm bg-gray-200 px-3 py-1 rounded">Tornar</button>
    </div>
    
    <div class="flex-grow bg-blue-100 border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center">
      <p class="text-blue-500 font-medium italic">Aquí es carregarà el mapa</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>