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

<script>
export default {
  data: function() {
    return {
      // Agafem la ID de la ruta des de la URL (ex: sagradafamilia)
      idLloc: this.$route.params.id,
      urlFinal: ""
    };
  },
  
  mounted: function() {
    // Quan la pàgina es carrega, construïm la ruta de la foto
    // El backend té les fotos a public/foto_mapa/mapa_ID.jpg 
    var baseApi = "http://localhost:8088"; 
    this.urlFinal = baseApi + "/foto_mapa/mapa_" + this.idLloc + ".jpg";
    
    console.log("Carregant mapa per a: " + this.idLloc);
  },

  methods: {
    anarACamera: function() {
      // Redirigim a la següent part del joc (la càmera) [cite: 26]
      this.$router.push("/joc/camera/" + this.idLloc);
    }
  }
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