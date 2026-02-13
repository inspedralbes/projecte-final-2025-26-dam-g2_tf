<script setup>
// No necesitamos lógica por ahora, solo probar el estilo
</script>

<template>
  <div class="h-screen bg-blue-50 flex flex-col items-center justify-center p-5">
    
    <div class="bg-white p-10 shadow-md border-t-4 border-blue-500">
      <h1 class="text-4xl font-black text-blue-900 mb-2">
        ¡VITE + TAILWIND!
      </h1>
      <p class="text-gray-600 mb-6">
        Si ves esto centrado y con colores, la instalación ha sido un éxito.
      </p>

      <div class="flex gap-4 justify-center">
        <button class="bg-green-500 text-white px-5 py-2 font-bold">
          FUNCIONA
        </button>

        <button class="bg-red-500 text-white px-5 py-2 font-bold">
          BOTÓN 2
        </button>
      </div>
    </div>

    <p class="mt-10 text-sm text-gray-400">
      Probando Tailwind v4 en 2026
    </p>
  </div>
</template>