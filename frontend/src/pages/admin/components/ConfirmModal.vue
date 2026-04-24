<template>
  <Transition name="modal-fade">
    <div
      v-if="obert"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      @click.self="tancar"
    >
      <!-- Background Overlay -->
      <div class="absolute inset-0 bg-[#402749]/60 backdrop-blur-sm"></div>

      <!-- Modal Card -->
      <Transition name="modal-slide">
        <div
          v-if="obert"
          class="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100"
        >
          <!-- Header/Icon Area -->
          <div class="p-8 pb-4 text-center">
            <div class="mx-auto mb-4 w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h2 class="text-2xl font-black text-[#402749] uppercase tracking-tight">
              {{ titol }}
            </h2>
            <p class="text-gray-500 text-sm mt-3 font-medium px-4">
              {{ missatge }}
            </p>
          </div>

          <!-- Actions -->
          <div class="p-8 pt-4 space-y-3">
            <button
              @click="confirmar"
              class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Confirmar eliminació
            </button>
            <button
              @click="tancar"
              class="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Cancel·lar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  obert: Boolean,
  titol: {
    type: String,
    default: "Estàs segur?"
  },
  missatge: {
    type: String,
    default: "Aquesta acció no es pot desfer. Estàs segur que vols eliminar aquest element?"
  }
});

const emit = defineEmits(['confirm', 'close']);

const tancar = () => emit('close');
const confirmar = () => emit('confirm');
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-slide-leave-active {
  transition: all 0.25s ease-in;
}
.modal-slide-enter-from {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
.modal-slide-leave-to {
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}
</style>
