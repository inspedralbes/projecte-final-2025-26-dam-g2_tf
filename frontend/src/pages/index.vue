<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-center mb-6 ">MENÚ PRINCIPAL</h1>
    

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

function irA(ruta) {
  router.push(ruta);
}
</script>