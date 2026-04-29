<template>
  <div id="app-container" class="flex flex-col h-screen overflow-hidden bg-[#9f6795] relative">
    <main class="flex-grow overflow-y-auto">
      <router-view />
    </main>

    <NavBar v-if="mostrarNavBar" />

    <LoginModal />

    <DisclaimerModal />
    
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/navBar.vue';
import LoginModal from './components/LoginModal.vue';


const route = useRoute();

const mostrarNavBar = computed(() => {
  if (!route.path) return false;
  const rutesOcultes = ['/admin', '/mapa/', '/joc/', '/sala-espera/', '/leaderboard/'];
  return !rutesOcultes.some(r => route.path.startsWith(r));
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>