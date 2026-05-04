<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="cancel">
      <div class="absolute inset-0 bg-gradient-to-br from-[#402749]/80 to-[#1a0a1f]/90 backdrop-blur-md"></div>
      
      <Transition name="modal-slide">
        <div v-if="show" class="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden border-4 border-[#d9a6c2]">
          
          <div class="p-8 text-center">
            <div class="flex justify-center mb-6">
              <div class="bg-[#f5cbdd] p-4 rounded-full flex items-center justify-center w-16 h-16">
                <svg v-if="icon === 'trash'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#9f6795]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <svg v-else-if="icon === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#9f6795]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else-if="icon === 'warning'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#9f6795]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#9f6795]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h2 class="text-xl font-black text-[#402749] uppercase tracking-tight mb-2">
              {{ title }}
            </h2>
            <p class="text-gray-600 text-sm font-medium mb-8">
              {{ message }}
            </p>
            
            <div class="flex gap-3">
              <button v-if="!isAlert" @click="cancel" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                {{ cancelText }}
              </button>
              <button @click="confirm" class="flex-1 py-3 bg-[#402749] hover:bg-[#5d3962] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                {{ confirmText }}
              </button>
            </div>
          </div>
          
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  isAlert: { type: Boolean, default: false },
  icon: { type: String, default: 'warning' }, // warning, success, trash, info
  title: { type: String, default: 'Atenció' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'D\'acord' },
  cancelText: { type: String, default: 'Cancel·lar' }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => emit('confirm');
const cancel = () => {
  if (!props.isAlert) {
    emit('cancel');
  }
};
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
  transform: translateY(30px) scale(0.95);
  opacity: 0;
}
.modal-slide-leave-to {
  transform: translateY(15px) scale(0.97);
  opacity: 0;
}
</style>
