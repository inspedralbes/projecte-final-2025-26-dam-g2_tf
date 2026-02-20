<template>
  <div class="min-h-screen flex items-center justify-center bg-[#402749]">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-[#402749] mb-8">Admin Panel</h1>
      
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Correu Electrònic</label>
          <input 
            v-model="correu" 
            type="email" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#804f7f] focus:border-[#804f7f]"
            placeholder="admin@admin.com"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Contrasenya</label>
          <input 
            v-model="contrasenya" 
            type="password" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#804f7f] focus:border-[#804f7f]"
            placeholder="••••••••"
          >
        </div>
        
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
        
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#804f7f] hover:bg-[#5d3962] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#804f7f]"
        >
          Entrar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const correu = ref('');
const contrasenya = ref('');
const error = ref('');

async function login() {
  error.value = '';
  
  try {
const response = await fetch('http://127.0.0.1:3000/api/admin/login', {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correu: correu.value,
        contrasenya: contrasenya.value
      })
    });
    
    const dades = await response.json();
    
    if (dades.success) {
      // Guardem que som admin a localStorage
      localStorage.setItem('admin_session', JSON.stringify(dades.user));
      router.push('/admin/dashboard');
    } else {
      error.value = dades.message;
    }
  } catch (err) {
    error.value = "Error de connexió amb el servidor";
  }
}
</script>
