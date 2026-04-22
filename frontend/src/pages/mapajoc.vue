<template>
  <div class="pantalla-mapa">
    
    <div v-if="!isCapita" class="w-full flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 class="text-4xl font-bold text-white mb-8" style="color: #d9a6c2;">Sigue al Capitán</h1>
      <div class="w-24 h-24 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg" style="background-color: #bc85ab; width: 100px; height: 100px; border-radius: 50%;">
        {{ nomCapita.charAt(0).toUpperCase() }}
      </div>
      <p class="text-xl text-indigo-200 mt-4" style="color: #e8c4d9; font-size: 1.25rem;">
        El capità <strong>{{ nomCapita }}</strong> està controlant la partida al seu dispositiu.
      </p>
      <p class="mt-6 text-sm text-indigo-300" style="color: rgba(255,255,255,0.6);">
        Pots guardar el mòbil i acompanyar-lo mentre busqueu els punts!
      </p>
    </div>

    <div v-else style="width: 100%; display: flex; flex-direction: column; align-items: center;">
      <h1 class="titol">Mapa de la Ruta</h1>

      <!-- Contenidor del mapa amb marcadors superposats -->
      <div class="contenidor-imatge" ref="contenidorRef">
        <img
          v-if="urlFinal !== ''"
          :src="urlFinal"
          alt="Mapa del lloc"
          class="imatge-mapa"
          ref="imatgeRef"
        />
        <p v-else>Carregant el mapa...</p>

        <!-- Marcadors clicables -->
        <button
          v-for="(punt, index) in puntsMissio"
          :key="index"
          class="marcador"
          :style="{ left: punt.posicio_x + '%', top: punt.posicio_y + '%' }"
          @click="obrirModal(punt)"
          :title="punt.nom_punt"
        >
          <span class="marcador-numero">{{ index + 1 }}</span>
        </button>
      </div>
    </div>


    <!-- ===== MODAL PUNT ===== -->
    <Transition name="fade">
      <div
        v-if="modalVisible"
        class="modal-fons"
        @click.self="tancarModal"
      >
        <div class="modal-contingut">
          <button class="modal-tancar" @click="tancarModal">✕</button>

          <h2 class="modal-titol"> {{ puntSeleccionat?.nom_punt }}</h2>

          <!-- Foto que ha d'imitar -->
          <div class="modal-foto-wrapper">
            <img
              v-if="fotoActual"
              :src="fotoActual"
              alt="Foto a imitar"
              class="modal-foto"
            />
            <div v-else class="modal-foto-placeholder">
              <span>Sense imatge de referència</span>
            </div>
          </div>

          <p v-if="puntSeleccionat?.pista" class="modal-pista">
             {{ puntSeleccionat.pista }}
          </p>

          <button class="boto-camera" @click="anarACameraDesPunt">
            FER LA FOTO
          </button>
        </div>
      </div>
    </Transition>

    <!--MODAL GAME OVER (un altre jugador ha guanyat) -->
    <Transition name="fade">
      <div
        v-if="mostrarGameOver"
        class="modal-fons"
        style="z-index: 200;"
      >
        <div class="modal-contingut" style="text-align:center; gap: 18px;">
          <span style="font-size: 3.5rem;"></span>
          <h2 class="modal-titol">La partida ha acabat!</h2>
          <p style="color: #d9a6c2; font-size: 0.95rem; margin: 0;">
            <strong style="color: white;">{{ nomGuanyador }}</strong>
            ha completat totes les fotos!
          </p>
          <p style="color: rgba(255,255,255,0.45); font-size: 0.75rem; margin: 0;">
            Vés al leaderboard per veure els resultats finals.
          </p>
          <button class="boto-camera" @click="anirAlLeaderboard">
             VEURE RESULTATS FINALS
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>


<script>
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      idLloc: this.$route.params.id, 
      llocRealId: null, 
      urlFinal: '',
      puntsMissio: [],
      modalVisible: false,
      puntSeleccionat: null,
      fotoActual: null,
      baseApi: import.meta.env.VITE_API_URL || 'http://localhost:8088',
      // Game-over
      mostrarGameOver: false,
      nomGuanyador: '',
      sessioIdGameOver: '',
      _socket: null,
      
      isCapita: true,
      nomCapita: ''
    };
  },

  async mounted() {
    try {
      // 1. Primer busquem la SESSIÓ per saber quin monument estem jugant
      const respSessio = await fetch(this.baseApi + '/api/sessionsJoc/' + this.idLloc);
      if (!respSessio.ok) throw new Error("No s'ha trobat la sessió de joc");
      const sessio = await respSessio.json();

      // 2. Ara que sabem que el monument és sessio.idLloc, el carreguem
      const idRealMonument = sessio.id_lloc_desti;
      const resposta = await fetch(this.baseApi + '/api/mapa/punts/' + idRealMonument);

      if (!resposta.ok) throw new Error("No s'ha pogut carregar el lloc");
      const lloc = await resposta.json();

      // 3. Guardem l'ID real del monument per a la càmera
      this.llocRealId = lloc._id;

      // 4. Configurem la imatge i els punts com abans
      const nomImatge = lloc.foto_mapa
        ? lloc.foto_mapa
        : 'mapa_' + lloc.nom.toLowerCase().replace(/\s+/g, '') + '.jpg';

      this.urlFinal = this.baseApi + '/foto_mapa/' + nomImatge;
      this.puntsMissio = lloc.punts_missio || [];

      // AFEGIM AIXÒ PER COMPROVAR SI ÉS CAPITÀ
      const userStr = localStorage.getItem('usuari');
      const user = userStr ? JSON.parse(userStr) : {};
      const perfilId = user._id || null;

      if (sessio && sessio.jugadors && perfilId) {
          const myPlayer = sessio.jugadors.find(j => 
              j.id_usuari === perfilId || (j.id_usuari && j.id_usuari._id === perfilId)
          );
          if (myPlayer) {
              this.isCapita = myPlayer.capita !== false; // if undefined, true for backwards compat
              if (!this.isCapita) {
                  const capitaInfo = sessio.jugadors.find(j => j.grup_id === myPlayer.grup_id && j.capita === true);
                  if (capitaInfo && capitaInfo.id_usuari) {
                      this.nomCapita = capitaInfo.id_usuari.nom_usuari || capitaInfo.id_usuari;
                  }
              }
          }
      }

    } catch (error) {
      console.error('Error carregant el mapa:', error);
    }

    // 5. Connectem al socket i ens unim a la room de la partida
    const sessioId = this.idLloc; // route.params.id és el sessioId
    if (sessioId) {
      this._socket = io(this.baseApi);
      this._socket.on('connect', () => {
        this._socket.emit('join-game-room', sessioId);
        console.log('[Mapa] Socket connectat, unit a la room:', sessioId);
      });
      this._socket.on('game-over', (dades) => {
        console.log('[Mapa] game-over rebut:', dades);
        this.sessioIdGameOver = dades.sessioId || sessioId;
        this.nomGuanyador = dades.nomGuanyador || 'Un jugador';
        this.mostrarGameOver = true;
      });
    }
  },

  beforeUnmount() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
  },

  methods: {
    anirAlLeaderboard() {
      this.$router.push({
        name: 'Leaderboard',
        params: { sala: this.sessioIdGameOver }
      });
    },

    async obrirModal(punt) {
      this.puntSeleccionat = punt;
      this.fotoActual = null;
      this.modalVisible = true;

      // Intentem carregar la foto actual associada al punt
      // Si el punt té una imatge_referencia pròpia l'usem, sinó la del lloc
      if (punt.imatge_referencia) {
        this.fotoActual = punt.imatge_referencia.startsWith('http')
          ? punt.imatge_referencia
          : this.baseApi + punt.imatge_referencia;
      } else {
        // Podem mostrar la imatge de referència del lloc com a fallback
        try {
          const resposta = await fetch(this.baseApi + '/api/mapa/punts/' + this.llocRealId);
          const lloc = await resposta.json();
          if (lloc.imatge_referencia) {
            this.fotoActual = lloc.imatge_referencia;
          }
        } catch (e) {
          console.error('Error carregant la foto de referència:', e);
        }
      }
    },

    tancarModal() {
      this.modalVisible = false;
      this.puntSeleccionat = null;
    },

    // Quan premen "FER LA FOTO" dins del modal d'un punt concret
    anarACameraDesPunt() {
      this.modalVisible = false;
      this.$router.push({
        name: 'camara',
        params: {
          codi_sala: this.$route.params.id, 
          id: this.llocRealId           
        },
        query: {
          imatge: this.puntSeleccionat?.imatge_referencia || '',
          idPunt: this.puntSeleccionat?._id || ''
        }
      });
    }
  }
};
</script>


<style scoped>
.pantalla-mapa {
  background-color: #402749;
  min-height: 100vh;
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
  position: relative;
  background-color: white;
  padding: 10px;
  border-radius: 15px;
  border: 4px solid #d9a6c2;
  max-width: 90%;
  width: 90%;
}

.imatge-mapa {
  width: 100%;
  display: block;
  border-radius: 8px;
}


.marcador {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #d9a6c2;
  border: 3px solid #402749;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  transition: transform 0.15s ease, background-color 0.15s ease;
  padding: 0;
  animation: pols 2s infinite;
}

.marcador:hover {
  transform: translate(-50%, -50%) scale(1.2);
  background-color: #bc85ab;
}

.marcador-numero {
  color: #402749;
  font-weight: bold;
  font-size: 14px;
  line-height: 1;
}

@keyframes pols {
  0%, 100% { box-shadow: 0 0 0 0 rgba(217, 166, 194, 0.6); }
  50%       { box-shadow: 0 0 0 10px rgba(217, 166, 194, 0); }
}

.boto-continuar {
  margin-top: 30px;
  background-color: #bc85ab;
  color: white;
  padding: 15px 30px;
  border-radius: 10px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.modal-fons {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-contingut {
  position: relative;
  background: linear-gradient(160deg, #2a1030 0%, #402749 60%, #1a0820 100%);
  border: 2px solid #d9a6c2;
  border-radius: 20px;
  padding: 24px 20px 20px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.modal-tancar {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  color: #d9a6c2;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.modal-titol {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  margin: 0;
}

.modal-foto-wrapper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #d9a6c2;
  aspect-ratio: 4/3;
  background: #1a0820;
}

.modal-foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-foto-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
  font-size: 13px;
}

.modal-pista {
  font-size: 13px;
  color: #e8c4d9;
  text-align: center;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 10px 14px;
  margin: 0;
  width: 100%;
}

.boto-camera {
  width: 100%;
  padding: 14px;
  background-color: #d9a6c2;
  color: #2a1030;
  font-weight: bold;
  font-size: 15px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.boto-camera:hover { opacity: 0.85; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>