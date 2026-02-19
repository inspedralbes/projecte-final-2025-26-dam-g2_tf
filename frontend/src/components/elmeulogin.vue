<template>
  
  <div v-if="isVisible" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative border-t-8 border-indigo-600">
      
      <button @click="$emit('tancar')" class="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">✕</button>
      
      <h2 class="text-2xl font-bold text-indigo-900 mb-6 text-center">
        {{ esRegistre ? 'CREA UN COMPTE' : 'IDENTIFICA\'T' }}
      </h2>

      <form @submit.prevent="executarAccio" class="space-y-4">
        <input v-if="esRegistre" v-model="nomPublic" type="text" placeholder="Nom d'usuari" class="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-indigo-500" required>
        
        <input v-model="correu" type="email" placeholder="Correu electrònic" class="w-full border-2 text-black border-gray-100 rounded-xl p-3 outline-none focus:border-indigo-500" required>
        <input v-model="contrasenya" type="password" placeholder="Contrasenya" class="w-full border-2 text-black border-gray-100 rounded-xl p-3 outline-none focus:border-indigo-500" required>
        
        <button type="submit" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all uppercase">
          {{ esRegistre ? 'Registrar-me' : 'Entrar' }}
        </button>
      </form>

      <p @click="esRegistre = !esRegistre; error = ''" class="mt-6 text-center text-sm font-bold text-indigo-600 cursor-pointer underline">
        {{ esRegistre ? 'Ja tens compte? Entra aquí' : 'Ets nou? Crea un perfil' }}
      </p>

      <p v-if="error" class="text-red-500 mt-4 text-center font-bold">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>

// judit 
import { ref } from 'vue';
import { useRouter } from 'vue-router';

defineProps(['isVisible']);
const emit = defineEmits(['tancar', 'exit']);

const router = useRouter();
const esRegistre = ref(false);
const nomPublic = ref('');
const correu = ref('');
const contrasenya = ref('');
const error = ref('');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

async function executarAccio() {
  const ruta = esRegistre.value ? '/registre' : '/login';
  const dades = {
    nom_usuari: nomPublic.value,
    correu: correu.value,
    contrasenya: contrasenya.value
  };

  try {
     const resposta = await fetch(`${API_URL}/api/auth${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dades)
    });

    const resultat = await resposta.json();

    if (resultat.success) {
      localStorage.setItem('usuari', JSON.stringify(resultat.user));
      emit('exit', resultat.user); 
      router.push('/social');
    } else {
      error.value = resultat.message;
    }
  } catch (err) {
    error.value = "Error de connexió amb el servidor";
  }
}
</script>