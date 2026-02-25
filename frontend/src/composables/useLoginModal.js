// useLoginModal.js — Composable per gestionar l'estat global del modal de login
// Aquest estat és global (singleton) i es comparteix entre tots els components
import { ref } from 'vue';

// L'estat es defineix FORA de la funció per ser reactiu a tota l'app
const obert = ref(false);
const missatgePersonalitzat = ref('');

// Ruta a la qual l'usuari volia anar abans de ser bloquejat (opcional)
// Si s'omple, el modal redirigirà l'usuari allà després del login
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

  /**
   * Tanca el modal de login i neteja l'estat
   */
  function tancarModal() {
    obert.value = false;
    missatgePersonalitzat.value = '';
    rutaIntencio.value = null;
  }

  return { obert, missatgePersonalitzat, rutaIntencio, obrirModal, tancarModal };
}
