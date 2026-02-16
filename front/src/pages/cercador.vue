<template>
  <div class="p-4">
    <button @click="router.push('/')" class="text-blue-500 mb-4">← Inici</button>
    <h1 class="text-2xl font-bold mb-6">CERCADOR</h1>
    
    <div class="relative">
      <input 
        type="text" 
        placeholder="Busca alguna cosa..." 
        class="w-full p-4 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
      />
      <button class="mt-4 w-full bg-green-500 text-white font-bold py-3 rounded-xl">BUSCAR</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>