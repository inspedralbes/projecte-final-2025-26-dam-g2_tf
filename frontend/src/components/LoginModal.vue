<template>
  <div v-if="isVisible" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative border-t-8 border-[#402749]">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">✕</button>
      
      <h2 class="text-2xl font-black text-[#402749] mb-6 text-center italic">
        {{ esRegistre ? 'CREA PERFIL' : 'HOLA DE NOU!' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input v-if="esRegistre" v-model="form.username" type="text" placeholder="Nom d'usuari" class="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-[#bc85ab]" required>
        <input v-model="form.email" type="email" placeholder="Correu electrònic" class="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-[#bc85ab]" required>
        <input v-model="form.password" type="password" placeholder="Contrasenya" class="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-[#bc85ab]" required>
        
        <button type="submit" class="w-full bg-[#5d3962] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#402749] transition-all uppercase tracking-widest">
          {{ esRegistre ? 'Registrar-me' : 'Entrar' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm font-bold text-gray-500">
        {{ esRegistre ? 'Ja tens compte?' : 'Ets nou explorador?' }}
        <span @click="esRegistre = !esRegistre" class="text-[#9f6795] cursor-pointer underline ml-1">
          {{ esRegistre ? 'Inicia sessió' : 'Crea un perfil' }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
defineProps(['isVisible']);
const emit = defineEmits(['close', 'login-success']);
const esRegistre = ref(false);
const form = reactive({ username: '', email: '', password: '' });

const handleSubmit = async () => {
  // Aquí aniria la crida a la teva API (localhost:3000/usuari/login)
  // De moment, simulem l'èxit:
  const usuariSimulat = { nom: form.username || 'Explorador', email: form.email };
  localStorage.setItem('user', JSON.stringify(usuariSimulat));
  emit('login-success', usuariSimulat);
};
</script>