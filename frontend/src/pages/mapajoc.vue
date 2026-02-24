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
  
  //hb
  mounted: async function() {
    var baseApi = import.meta.env.VITE_API_URL || 'http://localhost:8088';
    try {
      // Obtenim les dades del lloc per saber el nom real de la imatge
      var resposta = await fetch(baseApi + "/api/mapa/punts/" + this.idLloc);
      if (!resposta.ok) throw new Error("No s'ha pogut carregar el lloc");
      var lloc = await resposta.json();

      // Si el lloc té foto_mapa la fem servir, si no construïm amb el nom
      var nomImatge = lloc.foto_mapa
        ? lloc.foto_mapa
        : "mapa_" + lloc.nom.toLowerCase().replace(/\s+/g, "") + ".jpg";

      this.urlFinal = baseApi + "/foto_mapa/" + nomImatge;
      console.log("Carregant mapa:", this.urlFinal);
    } catch (error) {
      console.error("Error carregant el mapa:", error);
    }
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