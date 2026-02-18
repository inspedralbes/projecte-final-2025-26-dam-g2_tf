<template>
  <div class="flex items-center justify-center min-h-screen bg-indigo-50 p-4">

    <div class="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
      <h1 class="text-2xl font-bold mb-6 text-indigo-900">IDENTIFICA'T</h1>
      <input type="email" placeholder="Email" class="w-full mb-3 p-3 border rounded-lg">
      <input type="password" placeholder="Contrasenya" class="w-full mb-6 p-3 border rounded-lg">
      <button @click="ferLogin" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">ENTRAR</button>

      <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
    
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

async function ferLogin() {
    try {
        const dadesAEnviar = {
            email: email.value,
            password: password.value
        };

        const resposta = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadesAEnviar)
        });

        const resultat = await resposta.json();

        if (resultat.success === true) {
            console.log("Has entrat correctament");
            router.push('/');
        } else {
            error.value = resultat.message;
        }
    } catch (err) {
        error.value = "Error de connexió amb el servidor";
    }
}

</script>