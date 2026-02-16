<template>
  <div class="flex items-center justify-center min-h-screen bg-indigo-50 p-4">

    <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
      <h1 class="text-2xl font-bold mb-6 text-indigo-900">IDENTIFICA'T</h1>
      <input type="email" placeholder="Email" class="w-full mb-3 p-3 border rounded-lg">
      <input type="password" placeholder="Contrasenya" class="w-full mb-6 p-3 border rounded-lg">
      <button @click="router.push('/')" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">ENTRAR</button>
    </div>
    
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>