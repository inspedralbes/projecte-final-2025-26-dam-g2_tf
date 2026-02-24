<template>
  <div class="pantalla-mapa">
    <h1 class="titol">Mapa de la Ruta</h1>
    
    <div class="contenidor-imatge">
      <img 
        v-if="urlFinal !== ''" 
        v-bind:src="urlFinal" 
        alt="Mapa del lloc"
        class="imatge-mapa"
      />
      <p v-else>Carregant el mapa...</p>
    </div>

    <button v-on:click="anarACamera" class="boto-continuar">
      HE ARRIBAT!
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const idLloc = route.params.id; 
const urlFinal = ref("");

onMounted(async () => {
  // Cambia localhost por tu dominio real de Pedralbes
  const baseApi = "https://north.dam.inspedralbes.cat"; 
  
  try {
    // 1. Obtenemos los datos del lugar usando el ID de la ruta
    const resposta = await fetch(`${baseApi}/api/mapa/punts/${idLloc}`);
    if (!resposta.ok) throw new Error("No s'ha pogut carregar el lloc");
    const lloc = await resposta.json();

    /* 2. CONSTRUCCIÓN DE LA URL
       Si tu backend sirve las fotos por ID, usa la primera opción.
       Si las sirve por nombre de archivo dentro de la carpeta public, usa la segunda.
    */
    
    // Opción A: Tu servidor requiere el ID del objeto para buscar la foto
    urlFinal.value = `${baseApi}/api/foto_mapa/${lloc._id}`; 


    console.log("Intentando cargar mapa con ID:", lloc._id);
  } catch (error) {
    console.error("Error cargando el mapa:", error);
  }
});

const anarACamera = () => {
  router.push(`/joc/camera/${idLloc}`);
};
</script>

<style scoped>
/* Estils bàsics amb els colors del vostre projecte [cite: 137, 143] */
.pantalla-mapa {
  background-color: #402749; /* Color fosc del projecte [cite: 137] */
  min-height: 100-vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: white;
}

.titol {
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: bold;
}

.contenidor-imatge {
  background-color: white;
  padding: 10px;
  border-radius: 15px;
  border: 4px solid #d9a6c2; /* Color clar del projecte [cite: 142] */
  max-width: 90%;
}

.imatge-mapa {
  width: 100%;
  display: block;
}

.boto-continuar {
  margin-top: 30px;
  background-color: #bc85ab; /* Color lila mitjà [cite: 141] */
  color: white;
  padding: 15px 30px;
  border-radius: 10px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}
</style>