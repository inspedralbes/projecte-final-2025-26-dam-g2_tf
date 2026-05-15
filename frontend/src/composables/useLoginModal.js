// Composable: Control global de l'estat d'interrupció per al flux d'autenticació.
import { ref } from 'vue';

const obert = ref(false);
const missatgePersonalitzat = ref('');

const rutaIntencio = ref(null);

export function useLoginModal() {
  // Control de transició: Exposa el modal d'autenticació amb persistència de la intenció de ruteig.
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
