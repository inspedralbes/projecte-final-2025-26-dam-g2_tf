<template>
  <div class="p-6">
    <button @click="tornar" class="mb-4 text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center">
      ← TORNAR AL MENÚ
    </button>

    <h1 class="text-2xl font-bold text-indigo-600">El Teu Perfil</h1>
    
    <div class="mt-4 p-4 bg-white rounded-lg shadow border border-gray-100">
      <p>Aquí anirà la teva informació de l'usuari.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

function tornar() {
  router.push('/');
}
</script>