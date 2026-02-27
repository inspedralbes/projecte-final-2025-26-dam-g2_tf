<template>
  <div class="editor-fons">
    <div class="editor-header">
      <h1>🗺️ Editor de Punts del Mapa</h1>
      <p v-if="nomLloc" class="editor-lloc">{{ nomLloc }}</p>
    </div>

    <div class="instruccions">
      <p>Fes clic a la imatge per afegir un punt. Els marcadors es desaran automàticament.</p>
    </div>

    <!-- Mapa clicable -->
    <div class="contenidor-mapa" ref="contenidorRef">
      <img
        v-if="urlMapa"
        :src="urlMapa"
        alt="Mapa"
        class="imatge-mapa"
        ref="imatgeRef"
        @click="afegirPunt"
      />
      <p v-else class="carregant">Carregant el mapa...</p>

      <!-- Marcadors existents -->
      <div
        v-for="(punt, index) in puntsMissio"
        :key="index"
        class="marcador"
        :style="{ left: punt.posicio_x + '%', top: punt.posicio_y + '%' }"
        :title="punt.nom_punt"
      >
        <span class="marcador-num">{{ index + 1 }}</span>
        <button class="marcador-eliminar" @click.stop="eliminarPunt(index)">✕</button>
      </div>

      <!-- Punt nou pendent de confirmar -->
      <div
        v-if="puntNou"
        class="marcador marcador-nou"
        :style="{ left: puntNou.posicio_x + '%', top: puntNou.posicio_y + '%' }"
      >
        <span class="marcador-num">?</span>
      </div>
    </div>

    <!-- Formulari nou punt -->
    <div v-if="puntNou" class="formulari-nou-punt">
      <h3>📍 Nou punt: ({{ puntNou.posicio_x.toFixed(1) }}%, {{ puntNou.posicio_y.toFixed(1) }}%)</h3>

      <div class="camp">
        <label>Nom del punt</label>
        <input v-model="puntNou.nom_punt" type="text" placeholder="Ex: Façana principal" />
      </div>

      <div class="camp">
        <label>Pista per a l'usuari</label>
        <input v-model="puntNou.pista" type="text" placeholder="Ex: Busca la torre central..." />
      </div>

      <!-- Selector d'imatge de referència -->
      <div class="camp">
        <label>🖼️ Imatge de referència</label>
        <select v-model="puntNou.imatge_referencia">
          <option value="">-- Sense imatge --</option>
          <option
            v-for="foto in fotosDisponibles"
            :key="foto.path"
            :value="foto.path"
          >{{ foto.carpeta }} / {{ foto.nom }}</option>
        </select>
      </div>

      <!-- Previsualització de la imatge seleccionada -->
      <div v-if="puntNou.imatge_referencia" class="preview-imatge">
        <img :src="baseApi + puntNou.imatge_referencia" alt="Previsualització" />
        <p class="preview-nom">{{ nomFoto(puntNou.imatge_referencia) }}</p>
      </div>
      <div v-else-if="fotosDisponibles.length === 0" class="preview-buit">
        <span>No s'han trobat imatges a la carpeta</span>
      </div>

      <div class="botons-formulari">
        <button class="btn-desar" @click="confirmarPunt">✅ Desar punt</button>
        <button class="btn-cancel" @click="cancellarPunt">✕ Cancel·lar</button>
      </div>
    </div>

    <!-- Llista de punts guardats -->
    <div class="llista-punts" v-if="puntsMissio.length > 0">
      <h3>Punts guardats ({{ puntsMissio.length }})</h3>
      <div v-for="(punt, index) in puntsMissio" :key="index" class="punt-item">
        <span class="punt-num">{{ index + 1 }}</span>
        <div class="punt-info">
          <strong>{{ punt.nom_punt || 'Sense nom' }}</strong>
          <span v-if="punt.pista">{{ punt.pista }}</span>
          <small>X: {{ punt.posicio_x.toFixed(1) }}% / Y: {{ punt.posicio_y.toFixed(1) }}%</small>
          <span v-if="punt.imatge_referencia" class="punt-foto-badge">🖼️ {{ nomFoto(punt.imatge_referencia) }}</span>
        </div>
        <!-- Miniatura de la imatge assignada -->
        <img
          v-if="punt.imatge_referencia"
          :src="baseApi + punt.imatge_referencia"
          class="miniatura-punt"
          alt="Imatge del punt"
        />
        <button class="btn-eliminar" @click="eliminarPunt(index)">🗑️</button>
      </div>
    </div>

    <div class="peu">
      <button class="btn-desar-tot" @click="desarTot" :disabled="desant">
        {{ desant ? '⏳ Desant...' : '💾 DESAR TOTS ELS PUNTS' }}
      </button>
      <p v-if="missatgeDesar" class="missatge-desar">{{ missatgeDesar }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      idLloc: this.$route.params.id,
      baseApi: import.meta.env.VITE_API_URL || 'http://localhost:8088',
      urlMapa: '',
      nomLloc: '',
      puntsMissio: [],
      puntNou: null,
      desant: false,
      missatgeDesar: '',
      fotosDisponibles: []
    };
  },

  async mounted() {
    try {
      const resposta = await fetch(this.baseApi + '/api/mapa/punts/' + this.idLloc);
      if (!resposta.ok) throw new Error('Lloc no trobat');
      const lloc = await resposta.json();

      this.nomLloc = lloc.nom;
      const nomImatge = lloc.foto_mapa
        ? lloc.foto_mapa
        : 'mapa_' + lloc.nom.toLowerCase().replace(/\s+/g, '') + '.jpg';
      this.urlMapa = this.baseApi + '/foto_mapa/' + nomImatge;
      this.puntsMissio = (lloc.punts_missio || []).map(p => ({ ...p }));

      // Carreguem totes les fotos de totes les subcarpetes
      await this.carregarFotos();
    } catch (err) {
      console.error('Error carregant el lloc:', err);
    }
  },

  methods: {
    async carregarFotos() {
      try {
        const resposta = await fetch(this.baseApi + '/api/fotos-actuals/totes');
        if (!resposta.ok) return;
        const dades = await resposta.json();
        // Cada element ja té { nom, carpeta, path }
        this.fotosDisponibles = dades.fotos || [];
      } catch (err) {
        console.error('Error carregant fotos:', err);
      }
    },

    nomFoto(path) {
      return path ? path.split('/').pop() : '';
    },

    afegirPunt(event) {
      if (this.puntNou) return;
      const img = this.$refs.imatgeRef;
      const rect = img.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      this.puntNou = {
        posicio_x: parseFloat(x.toFixed(2)),
        posicio_y: parseFloat(y.toFixed(2)),
        nom_punt: '',
        pista: '',
        imatge_referencia: ''
      };
    },

    confirmarPunt() {
      if (!this.puntNou) return;
      this.puntsMissio.push({ ...this.puntNou });
      this.puntNou = null;
    },

    cancellarPunt() {
      this.puntNou = null;
    },

    eliminarPunt(index) {
      this.puntsMissio.splice(index, 1);
    },

    async desarTot() {
      this.desant = true;
      this.missatgeDesar = '';
      try {
        const resposta = await fetch(this.baseApi + '/api/mapa/punts/' + this.idLloc, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ punts_missio: this.puntsMissio })
        });
        if (!resposta.ok) throw new Error('Error al desar');
        this.missatgeDesar = '✅ Punts desats correctament!';
      } catch (err) {
        this.missatgeDesar = '❌ Error al desar: ' + err.message;
      } finally {
        this.desant = false;
        setTimeout(() => { this.missatgeDesar = ''; }, 3000);
      }
    }
  }
};
</script>

<style scoped>
.editor-fons {
  background-color: #1a0820;
  min-height: 100vh;
  padding: 20px;
  color: white;
  font-family: sans-serif;
}

.editor-header { text-align: center; margin-bottom: 10px; }
.editor-header h1 { font-size: 22px; color: #d9a6c2; }
.editor-lloc { color: #bc85ab; margin: 0; }

.instruccions {
  background: rgba(217,166,194,0.1);
  border: 1px solid #d9a6c2;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 13px;
  color: #e8c4d9;
}

.contenidor-mapa {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  border: 3px solid #d9a6c2;
  border-radius: 12px;
  overflow: hidden;
  cursor: crosshair;
}

.imatge-mapa {
  width: 100%;
  display: block;
  user-select: none;
}

.carregant { padding: 40px; text-align: center; }

/* Marcadors */
.marcador {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d9a6c2;
  border: 2px solid #402749;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.marcador-nou { background: #ffd700; border-color: #b8860b; }

.marcador-num {
  color: #402749;
  font-weight: bold;
  font-size: 12px;
}

.marcador-eliminar {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e74c3c;
  color: white;
  border: none;
  font-size: 9px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.marcador:hover .marcador-eliminar { display: flex; }

/* Formulari nou punt */
.formulari-nou-punt {
  max-width: 800px;
  margin: 16px auto 0;
  background: rgba(64,39,73,0.8);
  border: 2px solid #d9a6c2;
  border-radius: 12px;
  padding: 16px;
}

.formulari-nou-punt h3 { margin: 0 0 12px; color: #ffd700; font-size: 15px; }

.camp { margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px; }
.camp label { font-size: 12px; color: #d9a6c2; }
.camp input, .camp select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #bc85ab;
  background: rgba(255,255,255,0.08);
  color: white;
  font-size: 14px;
}
.camp input::placeholder { color: rgba(255,255,255,0.3); }
.camp select option { background: #2a1030; color: white; }

/* Previsualització imatge */
.preview-imatge {
  margin: 4px 0 12px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #bc85ab;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.preview-imatge img {
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  display: block;
}
.preview-nom {
  font-size: 11px;
  color: #d9a6c2;
  padding: 4px 8px;
  margin: 0;
  background: rgba(0,0,0,0.4);
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}
.preview-buit {
  margin: 4px 0 12px;
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  text-align: center;
  padding: 8px;
}

.botons-formulari { display: flex; gap: 10px; margin-top: 12px; }

.btn-desar, .btn-cancel {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}
.btn-desar { background: #d9a6c2; color: #2a1030; }
.btn-cancel { background: rgba(255,255,255,0.1); color: white; border: 1px solid #bc85ab; }

/* Llista */
.llista-punts {
  max-width: 800px;
  margin: 16px auto 0;
}
.llista-punts h3 { font-size: 15px; color: #d9a6c2; margin-bottom: 10px; }

.punt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(64,39,73,0.5);
  border: 1px solid rgba(217,166,194,0.3);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
}
.punt-num {
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #d9a6c2;
  color: #402749;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}
.punt-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}
.punt-info strong { color: #fff; }
.punt-info span { color: #d9a6c2; font-size: 12px; }
.punt-info small { color: rgba(255,255,255,0.4); font-size: 11px; }
.punt-foto-badge { color: #ffd700 !important; font-size: 11px !important; }

/* Miniatura a la llista de punts */
.miniatura-punt {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #bc85ab;
  flex-shrink: 0;
}

.btn-eliminar {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.btn-eliminar:hover { opacity: 1; }

/* Peu */
.peu {
  max-width: 800px;
  margin: 20px auto 40px;
  text-align: center;
}

.btn-desar-tot {
  background: #d9a6c2;
  color: #2a1030;
  font-weight: bold;
  font-size: 16px;
  padding: 14px 40px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-desar-tot:disabled { opacity: 0.5; cursor: not-allowed; }
.missatge-desar { margin-top: 10px; color: #d9a6c2; font-size: 14px; }
</style>
