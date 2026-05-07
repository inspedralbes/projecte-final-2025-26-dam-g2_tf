<template>
  <SplashScreen v-if="showingSplash" @splash-complete="onSplashComplete" />

  <div v-else id="app-container" class="flex flex-col h-screen overflow-hidden bg-[#402749] relative animate-fade-in">
    <main class="flex-grow overflow-y-auto">
      <router-view />
    </main>

    <NavBar v-if="mostrarNavBar" />

    <LoginModal />
    
    <ModalPersonalitzat 
      :show="modalVisible"
      :is-alert="modalProps.isAlert"
      :icon="modalProps.icon"
      :title="modalProps.title"
      :message="modalProps.message"
      :confirm-text="modalProps.confirmText"
      :cancel-text="modalProps.cancelText"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/navBar.vue';
import LoginModal from './components/LoginModal.vue';
import ModalPersonalitzat from './components/ModalPersonalitzat.vue';
import SplashScreen from './components/SplashScreen.vue';
import { useCustomModal } from './composables/useCustomModal';

const route = useRoute();
const { modalVisible, modalProps, handleModalConfirm, handleModalCancel } = useCustomModal();

const showingSplash = ref(true);

const onSplashComplete = () => {
  showingSplash.value = false;
};

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

.animate-fade-in {
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>