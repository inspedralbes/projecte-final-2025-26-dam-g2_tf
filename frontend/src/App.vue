<template>
  <div id="app-container" class="flex flex-col h-screen overflow-hidden bg-[#9f6795] relative">
        <main class="flex-grow overflow-y-auto">
      <router-view />
    </main>

    <NavBar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import NavBar from './components/navBar.vue';

// No global session logic needed here, handled by BotonPerfil in pages
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>