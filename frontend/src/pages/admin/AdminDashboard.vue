<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800 pb-20 md:pb-0">
    
    <AdminNav />

    <main class="flex-1 p-6 md:p-10">
      <header class="mb-10">
        <h1 class="text-3xl font-bold text-[#402749]">Benvingut, Administrador</h1>
        <p class="text-gray-500 mt-2">Control central de l'aplicació.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          @click="$router.push('/admin/llocs')" 
          class="bg-white p-8 rounded-xl shadow border-l-8 border-[#804f7f] hover:shadow-lg transition-all cursor-pointer"
        >
          <h2 class="text-xl font-bold text-[#402749] mb-4"> Gestió de Contingut</h2>
          <p class="text-gray-600 text-sm">Valida llocs oficials i fotos històriques.</p>
        </div>

        <div 
          @click="$router.push('/admin/peticions')" 
          class="bg-white p-8 rounded-xl shadow border-l-8 border-[#bc85ab] hover:shadow-lg transition-all cursor-pointer"
        >
          <h2 class="text-xl font-bold text-[#402749] mb-4">Peticions</h2>
          <p class="text-gray-600 text-sm">Revisa les propostes de la comunitat.</p>
        </div>

        <div 
          @click="$router.push('/admin/moderacio')" 
          class="bg-white p-8 rounded-xl shadow border-l-8 border-red-500 hover:shadow-lg transition-all cursor-pointer"
        >
          <h2 class="text-xl font-bold text-[#402749] mb-4">Moderació de Comunitat</h2>
          <p class="text-gray-600 text-sm">Gestiona i elimina ressenyes o comentaris inapropiats.</p>
        </div>

        <div 
          @click="$router.push('/admin/personatges')" 
          class="bg-white p-8 rounded-xl shadow border-l-8 border-[#5d3962] hover:shadow-lg transition-all cursor-pointer"
        >
          <h2 class="text-xl font-bold text-[#402749] mb-4">Gestió de Personatges</h2>
          <p class="text-gray-600 text-sm">Afegeix i gestiona els personatges del joc.</p>
        </div>
      </section>
    </main>

  </div>
</template>

<script setup>
import AdminNav from './components/AdminNav.vue';
</script>