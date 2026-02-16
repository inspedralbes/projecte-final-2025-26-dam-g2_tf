<template>
  <div class="p-4">
    <div class="flex items-center gap-4 mb-8">
      <button @click="router.push('/')" class="text-2xl">←</button>
      <h1 class="text-xl font-bold">LES MEVES PETICIONS</h1>
    </div>

    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <p class="text-yellow-700">No tens cap petició pendent actualment.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>