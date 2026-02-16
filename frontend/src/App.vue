<template>
  <div id="app-container" class="flex flex-col h-screen overflow-hidden bg-[#9f6795]">
    <main class="flex-grow overflow-y-auto">
      <router-view />
    </main>

    <NavBar />
  </div>
</template>

<script setup>
import NavBar from './components/navBar.vue';
</script>

