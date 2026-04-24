<template>
  <div class="pantalla-mapa">
    
    <!-- TEMPORITZADOR (Dalt a l'esquerra) -->
    <div v-if="tempsRestant !== null" class="temporitzador">
       <span class="rellotge-icon">⏱️</span>
       <span class="temps-text" :class="{'temps-critic': tempsRestant < 60}">{{ formatarTemps(tempsRestant) }}</span>
    </div>

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
          v-for="(punt, index) in puntsFiltrats"
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

          <!-- Mostrar pista si ja està revelada O si no estem en una sessió real (permet veure pistes en mode prova/lliure) -->
          <div v-if="puntSeleccionat?.pista && (pistesRevelades.has(puntSeleccionat._id?.toString()) || !sessioId)" class="modal-pista blink-hint">
             💡 {{ puntSeleccionat.pista }}
          </div>

          <!-- Mostrar botó per demanar la pista si estem en una sessió i encara no s'ha revelat -->
          <div v-else-if="puntSeleccionat?.pista && sessioId" class="w-full flex flex-col items-center gap-3">
             <button 
               @click="demanarPista" 
               :disabled="pistes_gastades >= 3 || demanantPista"
               class="boto-demanar-pista"
               :class="{'opacity-50 grayscale': pistes_gastades >= 3}"
             >
               {{ demanantPista ? 'DEMANANT...' : `DEMANAR PISTA (${pistes_gastades}/3)` }}
             </button>
             <p v-if="pistes_gastades >= 3" class="text-[10px] text-red-400 font-bold uppercase">Has esgotat les 3 pistes!</p>
          </div>

          <button class="boto-camera" @click="anarACameraDesPunt">
            FER LA FOTO
          </button>
        </div>
      </div>
    </Transition>

    <!--MODAL GAME OVER (un altre jugador ha guanyat o temps esgotat) -->
    <Transition name="fade">
      <div
        v-if="mostrarGameOver"
        class="modal-fons"
        style="z-index: 200;"
      >
        <div class="modal-contingut" style="text-align:center; gap: 18px;">
          <span v-if="isTimeout" style="font-size: 3.5rem;">⌛</span>
          <span v-else style="font-size: 3.5rem;">🏆</span>
          
          <h2 class="modal-titol">{{ isTimeout ? 'S\'ha acabat el temps!' : 'La partida ha acabat!' }}</h2>
          
          <template v-if="isTimeout">
            <p style="color: #ff9fb6; font-size: 1.1rem; font-weight: bold; margin: 0;">
              TOTHOM HA PERDUT
            </p>
            <p style="color: #d9a6c2; font-size: 0.95rem; margin: 0;">
              No heu obtingut el cromo d'aquesta ruta.
            </p>
          </template>
          <template v-else>
            <p style="color: #d9a6c2; font-size: 0.95rem; margin: 0;">
              <strong style="color: white;">{{ nomGuanyador }}</strong>
              ha completat totes les fotos!
            </p>
          </template>

          <p style="color: rgba(255,255,255,0.45); font-size: 0.75rem; margin: 0;">
            Vés al leaderboard per veure els resultats finals.
          </p>
          <button class="boto-camera" @click="anirAlLeaderboard">
             VEURE RESULTATS FINALS
          </button>
        </div>
      </div>
    </Transition>
    
    <!-- NOTIFICACIÓ DE PUNTS EN TEMPS REAL -->
    <Transition name="slide-fade">
      <div v-if="notificacioPunt" class="notificacio-punt">
          <div class="notificacio-icon">🚀</div>
          <div class="notificacio-text">
            <strong>{{ notificacioPunt.nomUsuari }}</strong> ha aconseguit el punt: 
            <span class="punto-nom">{{ notificacioPunt.nomPunt }}</span>
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
      sessioId: null, // Per saber si estem en una partida real
      
      isCapita: true,
      nomCapita: '',
      
      // Temporitzador
      tempsRestant: null,
      intervalTimer: null,
      isTimeout: false,

      // Pistes
      pistes_gastades: 0,
      pistesRevelades: new Set(),
      demanantPista: false,

      // Notificacions en temps real
      notificacioPunt: null,

      personatgeIdUsuari: null, // Per filtrar els punts del mapa segons el personatge (fallback)
      puntsAssignatsIds: []     // IDs de punts pre-assignats pel backend
    };
  },

  computed: {
    puntsFiltrats() {
      if (!this.puntsMissio || this.puntsMissio.length === 0) return [];
      
      console.log("[Mapa] --- Inici filtratge de punts ---");
      console.log("[Mapa] Total inicial:", this.puntsMissio.length);
      console.log("[Mapa] IDs assignats (Backend/Socket):", this.puntsAssignatsIds);
      console.log("[Mapa] Personatge Usuari (ID):", this.personatgeIdUsuari);

      let resultat = [];

      // A) PRIORITAT: Si tenim IDs assignats explícitament (punts_assignats)
      if (this.puntsAssignatsIds && this.puntsAssignatsIds.length > 0) {
        resultat = this.puntsMissio.filter(punt => {
          const pId = punt._id ? punt._id.toString() : null;
          const matches = this.puntsAssignatsIds.some(id => id && id.toString() === pId);
          console.log(`[Mapa] Punt ${punt.nom_punt || punt._id}: ${matches ? 'MOSTRAT' : 'AMAGAT'} (per llista IDs)`);
          return matches;
        });
      } 
      // B) FALLBACK: Lògica manual si no tenim la llista d'IDs
      else {
        console.warn("[Mapa] No hi ha llista d'IDs assignats. Usant lògica de fallback manual.");
        resultat = this.puntsMissio.filter(punt => {
          // Si no té personatge, és COMÚ -> Mostra sempre
          if (!punt.personatge_id) {
            console.log(`[Mapa] Punt ${punt.nom_punt || punt._id}: MOSTRAT (Punt comú)`);
            return true;
          }
          
          // ID del personatge del punt (populat o no)
          const puntPersonatgeId = typeof punt.personatge_id === 'object' && punt.personatge_id !== null
            ? (punt.personatge_id._id || punt.personatge_id).toString()
            : (punt.personatge_id ? punt.personatge_id.toString() : null);

          // ID del personatge de l'usuari
          const usuariPersonatgeId = (this.personatgeIdUsuari && typeof this.personatgeIdUsuari === 'object')
             ? (this.personatgeIdUsuari._id || this.personatgeIdUsuari).toString()
             : (this.personatgeIdUsuari ? this.personatgeIdUsuari.toString() : null);

          const matches = puntPersonatgeId && usuariPersonatgeId && puntPersonatgeId === usuariPersonatgeId;
          console.log(`[Mapa] Punt ${punt.nom_punt || punt._id}: ${matches ? 'MOSTRAT' : 'AMAGAT'} (Character match: ${puntPersonatgeId} vs ${usuariPersonatgeId})`);
          return matches;
        });
      }

      console.log("[Mapa] Resultado final filtratge:", resultat.length, "punts");
      console.log("[Mapa] --- Fi filtratge ---");
      return resultat;
    }
  },

  async mounted() {
    try {
      // 1. Busquem la SESSIÓ o el LLOC per saber què mostrar
      let sessio = null;
      let idRealMonument = this.idLloc; // Per defecte assumim que l'ID és del monument

      try {
        const respSessio = await fetch(this.baseApi + '/api/sessionsJoc/' + this.idLloc);
        if (respSessio.ok) {
          sessio = await respSessio.json();
          idRealMonument = sessio.id_lloc_desti;
        }
      } catch (e) {
        console.warn("No s'ha pogut verificar la sessió, intentant carregar com a lloc directament.");
      }

      // 2. Carreguem les dades del monument (punts, foto, etc.)
      const resposta = await fetch(this.baseApi + '/api/mapa/punts/' + idRealMonument);
      if (!resposta.ok) throw new Error("No s'ha pogut carregar el lloc (ID: " + idRealMonument + ")");
      const lloc = await resposta.json();

      // 3. Guardem l'ID real del monument per a la càmera
      this.llocRealId = lloc._id;

      // 4. Configurem la imatge i els punts com abans
      const nomImatge = lloc.foto_mapa
        ? lloc.foto_mapa
        : 'mapa_' + lloc.nom.toLowerCase().replace(/\s+/g, '') + '.jpg';

      this.urlFinal = this.baseApi + '/foto_mapa/' + nomImatge;
      this.puntsMissio = lloc.punts_missio || [];

      // 4. Temporitzador
      let limitFinal = null;

      if (sessio) {
          console.log("[Mapa] Sessió trobada:", sessio._id, "Temps límit:", sessio.temps_limit);
          this.sessioId = sessio._id; // Assignem sessioId ja que tenim sessió
          // Si hi ha sessió, busquem el jugador i el seu temps limit
          const userStr = localStorage.getItem('usuari');
          const user = userStr ? JSON.parse(userStr) : {};
          const perfilId = user._id || null;

          if (sessio.jugadors && perfilId) {
              const myPlayer = sessio.jugadors.find(j => {
                  if (!j.id_usuari) return false;
                  const jId = (typeof j.id_usuari === 'object' ? j.id_usuari._id : j.id_usuari).toString();
                  return jId === perfilId.toString();
              });
              
              if (myPlayer) {
                  console.log("[Mapa] Jugador trobat a la sessió:", myPlayer.id_usuari?.nom_usuari || myPlayer.id_usuari);
                  this.sessioId = sessio._id;
                  this.isCapita = myPlayer.capita !== false; 
                  this.pistes_gastades = myPlayer.pistes_gastades || 0;
                  this.personatgeIdUsuari = myPlayer.personatge_id || null;
                  this.puntsAssignatsIds = myPlayer.punts_assignats || [];
                  
                  if (myPlayer.pistes_revelades) {
                      myPlayer.pistes_revelades.forEach(id => this.pistesRevelades.add(id.toString()));
                  }
                  
                  limitFinal = myPlayer.temps_limit || sessio.temps_limit;

                  if (!this.isCapita) {
                      const capitaInfo = sessio.jugadors.find(j => j.grup_id === myPlayer.grup_id && j.capita === true);
                      if (capitaInfo && capitaInfo.id_usuari) {
                          this.nomCapita = capitaInfo.id_usuari.nom_usuari || capitaInfo.id_usuari;
                      }
                  }
              } else {
                  console.warn("[Mapa] El jugador actual no s'ha trobat dins la llista de la sessió API. Intentant localStorage...");
                  // Fallback: dades de la carta en localStorage
                  const dadesGuardades = localStorage.getItem('carta_personatge_actual');
                  if (dadesGuardades) {
                    const parsed = JSON.parse(dadesGuardades);
                    if (parsed.sessioId === this.sessioId || parsed.sessioId === this.idLloc) {
                      this.puntsAssignatsIds = parsed.puntsAssignats || [];
                      console.log("[Mapa] Punts assignats recuperats de localStorage:", this.puntsAssignatsIds.length);
                    }
                  }
              }
          }
          
          if (!limitFinal) limitFinal = sessio.temps_limit;
      } else {
          console.warn("[Mapa] No s'ha pogut carregar la sessió. El temporitzador podria no funcionar.");
      }

      // Si no hi ha límit de la sessió ni del jugador (fallback lloc directe), 
      // o si per algun motiu limitFinal és null, provem un últim fallback de 60min
      if (!limitFinal) {
          console.warn("[Mapa] No s'ha trobat un límit de temps. Aplicant fallback de 60 minuts.");
          limitFinal = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      }
      
      this.iniciarTemporitzador(limitFinal);

      // 4. Temporitzador ja s'ha iniciat individualment a dalt si existeix myPlayer
      // o a nivell de sessio si no hi ha myPlayer encara.
      // S'evita duplicar la crida aquí per no sobreescriure la penalització.

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
        this.isTimeout = dades.timeout || false;
        this.mostrarGameOver = true;
        if (this.intervalTimer) clearInterval(this.intervalTimer);
      });

      this._socket.on('punt-aconseguit', (dades) => {
        console.log('[Mapa] punt-aconseguit rebut:', dades);
        this.notificacioPunt = dades;
        // Amaguem al cap de 5 segons
        setTimeout(() => {
          if (this.notificacioPunt === dades) {
            this.notificacioPunt = null;
          }
        }, 5000);
      });
    }
  },

  beforeUnmount() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
    if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
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
    },

    iniciarTemporitzador(tempsLimit) {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }

        const limit = new Date(tempsLimit).getTime();
        
        const actualizar = () => {
            const ara = new Date().getTime();
            const diferencia = Math.max(0, Math.floor((limit - ara) / 1000));
            this.tempsRestant = diferencia;
            
            if (diferencia <= 0) {
                clearInterval(this.intervalTimer);
            }
        };
        
        actualizar();
        this.intervalTimer = setInterval(actualizar, 1000);
    },

    formatarTemps(segons) {
        const h = Math.floor(segons / 3600);
        const m = Math.floor((segons % 3600) / 60);
        const s = segons % 60;
        
        const mm = m < 10 ? '0' + m : m;
        const ss = s < 10 ? '0' + s : s;
        
        if (h > 0) {
            return `${h}:${mm}:${ss}`;
        }
        return `${mm}:${ss}`;
    },

    async demanarPista() {
      if (!this.sessioId || this.pistes_gastades >= 3 || !this.puntSeleccionat || this.demanantPista) return;
      
      const confirmacio = confirm("Vols gastar una de les teves 3 pistes per aquest punt?");
      if (!confirmacio) return;

      this.demanantPista = true;
      try {
        const userStr = localStorage.getItem('usuari');
        const user = userStr ? JSON.parse(userStr) : {};
        const perfilId = user._id || null;

        const resposta = await fetch(`${this.baseApi}/api/sessionsJoc/${this.sessioId}/usar-pista`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ perfilId, idPunt: this.puntSeleccionat._id })
        });

        const dades = await resposta.json();
        if (resposta.ok) {
          this.pistes_gastades = dades.pistes_gastades;
          this.pistesRevelades.add(this.puntSeleccionat._id.toString());
          // Actualitzem el temporitzador amb el nou límit
          if (dades.nou_temps_limit) {
            this.iniciarTemporitzador(dades.nou_temps_limit);
          }
        } else {
          alert(dades.missatge || "Error al demanar la pista");
        }
      } catch (err) {
        console.error("Error demanant pista:", err);
        alert("Error de connexió amb el servidor");
      } finally {
        this.demanantPista = false;
      }
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
  position: relative; /* Per al temporitzador absolut */
}

.temporitzador {
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    padding: 8px 16px;
    border-radius: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1.5px solid rgba(217, 166, 194, 0.5);
    z-index: 50;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.rellotge-icon {
    font-size: 1.2rem;
}

.temps-text {
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.3rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1px;
}

.temps-critic {
    color: #ff5e7e;
    animation: blink 1s infinite;
}

@keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
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
  font-size: 14px;
  color: #fff;
  text-align: center;
  background: rgba(217, 166, 194, 0.2);
  border: 1px solid #d9a6c2;
  border-radius: 12px;
  padding: 12px 16px;
  margin: 0;
  width: 100%;
  font-weight: 500;
  box-shadow: 0 0 15px rgba(217, 166, 194, 0.3);
}

.blink-hint {
  animation: blinkHint 1.5s ease;
}

@keyframes blinkHint {
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.boto-demanar-pista {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 2px dashed #d9a6c2;
  color: #d9a6c2;
  font-weight: bold;
  font-size: 13px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.boto-demanar-pista:hover:not(:disabled) {
  background: rgba(217, 166, 194, 0.1);
  border-style: solid;
  transform: translateY(-2px);
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

/* Notificació de punts */
.notificacio-punt {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 8, 32, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid #d9a6c2;
  padding: 12px 24px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 300;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  min-width: 300px;
  max-width: 90%;
}

.notificacio-icon {
  font-size: 1.6rem;
}

.notificacio-text {
  color: white;
  font-size: 0.95rem;
  line-height: 1.3;
}

.punto-nom {
  color: #d9a6c2;
  font-weight: 800;
}

/* Transició slide-fade */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.6s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from {
  transform: translate(-50%, 40px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}
</style>
