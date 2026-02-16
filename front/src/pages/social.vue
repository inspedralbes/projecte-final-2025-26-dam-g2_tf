<template>
  <div class="p-4 bg-gray-50 min-h-screen">
    <nav class="flex justify-between mb-6">
      <h1 class="text-2xl font-black text-blue-600 italic">SOCIAL</h1>
      <button @click="router.push('/')" class="bg-white shadow px-4 py-1 rounded-full text-sm">Menú</button>
    </nav>

    <div class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-blue-200 rounded-full"></div>
          <span class="font-bold text-sm text-gray-700">Usuari {{ i }}</span>
        </div>
        <p class="text-gray-600">Això és un exemple de post a la secció social.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>