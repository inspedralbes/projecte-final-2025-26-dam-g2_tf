import { ref } from 'vue';

const modalVisible = ref(false);
const modalProps = ref({
  isAlert: false,
  icon: 'warning',
  title: '',
  message: '',
  confirmText: 'D\'ACORD',
  cancelText: 'CANCEL·LAR'
});

let modalResolve = null;

export function useCustomModal() {
  const mostrarModal = (options) => {
    return new Promise((resolve) => {
      // Restore default values for missing options
      const defaults = {
        isAlert: false,
        icon: 'warning',
        title: 'Atenció',
        message: '',
        confirmText: 'D\'ACORD',
        cancelText: 'CANCEL·LAR'
      };
      modalProps.value = { ...defaults, ...options };
      modalVisible.value = true;
      modalResolve = resolve;
    });
  };

  const handleModalConfirm = () => {
    modalVisible.value = false;
    if (modalResolve) {
      modalResolve(true);
      modalResolve = null;
    }
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
    if (modalResolve) {
      modalResolve(false);
      modalResolve = null;
    }
  };

  return {
    modalVisible,
    modalProps,
    mostrarModal,
    handleModalConfirm,
    handleModalCancel
  };
}
