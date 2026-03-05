import { ref } from 'vue';

const obert = ref(false);
const missatgePersonalitzat = ref('');

const rutaIntencio = ref(null);

export function useLoginModal() {
  /**
   * Obre el modal de login
   * @param {string} missatge - Missatge personalitzat que explica per què cal iniciar sessió
   * @param {object|null} ruta - Objecte de ruta Vue Router ({name, params, query}) per redirigir després del login
   */
  function obrirModal(missatge = '', ruta = null) {
    missatgePersonalitzat.value = missatge;
    rutaIntencio.value = ruta;
    obert.value = true;
  }

  
  function tancarModal() {
    obert.value = false;
    missatgePersonalitzat.value = '';
    rutaIntencio.value = null;
  }

  return { obert, missatgePersonalitzat, rutaIntencio, obrirModal, tancarModal };
}
