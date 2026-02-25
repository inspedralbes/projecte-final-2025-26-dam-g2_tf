<template>
  <div id="app-container" class="flex flex-col h-screen overflow-hidden bg-[#9f6795] relative">
    <main class="flex-grow overflow-y-auto">
      <router-view />
    </main>

    <NavBar v-if="mostrarNavBar" />

    <!-- Modal de login global: accessible des de qualsevol pàgina -->
    <LoginModal />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/navBar.vue';
import LoginModal from './components/LoginModal.vue';

const route = useRoute();

// Fem servir una variable computada per evitar errors si la ruta encara no s'ha carregat
const mostrarNavBar = computed(() => {
  return route.path && !route.path.startsWith('/admin');
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>