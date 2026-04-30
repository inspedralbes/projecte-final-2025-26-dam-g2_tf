<template>
  <!-- Overlay de fons: s'activa quan obert és true -->
  <Transition name="modal-fade">
    <div
      v-if="obert"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      @click.self="tancarModal"
    >
      <!-- Fons difuminat amb degradat -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#402749]/80 to-[#1a0a1f]/90 backdrop-blur-md"></div>

      <!-- Targeta principal del modal -->
      <Transition name="modal-slide">
        <div
          v-if="obert"
          class="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden"
        >
          <!-- Capçalera decorativa amb gradient -->
          <div class="bg-gradient-to-br from-[#402749] via-[#5d3962] to-[#804f7f] p-8 pb-12 text-white text-center relative overflow-hidden">
            <!-- Cercles decoratius de fons -->
            <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <div class="absolute -bottom-4 -left-6 w-24 h-24 bg-[#f5cbdd]/10 rounded-full"></div>
            <div class="absolute top-4 left-8 w-12 h-12 bg-white/5 rounded-full"></div>

            <!-- Icona -->
            <div class="relative mx-auto mb-4 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#f5cbdd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
              </svg>
            </div>

            <!-- Títol i subtítol -->
            <h2 class="text-2xl font-black uppercase tracking-tight relative">
              {{ esRegistre ? '¡Benvingut!' : 'Hola, explorador! ' }}
            </h2>
            <p class="text-[#f5cbdd] text-sm mt-2 font-medium opacity-90 relative">
              {{ missatgePersonalitzat || (esRegistre
                ? 'Crea el teu perfil i comença a descobrir Barcelona'
                : 'Inicia sessió per continuar la teva aventura') }}
            </p>
          </div>

          <!-- Ondulació decorativa entre capçalera i formulari -->
          <div class="bg-gradient-to-br from-[#402749] via-[#5d3962] to-[#804f7f]">
            <svg viewBox="0 0 400 40" preserveAspectRatio="none" class="w-full h-8 block">
              <path d="M0,0 C100,40 300,40 400,0 L400,40 L0,40 Z" fill="white"/>
            </svg>
          </div>

          <!-- Cos del modal: formulari -->
          <div class="bg-white px-8 pb-8 -mt-1">

            <!-- Selector Login / Registre -->
            <div class="flex bg-[#f5cbdd]/30 rounded-2xl p-1 mb-6">
              <button
                @click="esRegistre = false; error = ''"
                :class="['flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300',
                         !esRegistre ? 'bg-[#402749] text-white shadow-md' : 'text-[#402749]/60']"
              >
                Iniciar sessió
              </button>
              <button
                @click="esRegistre = true; error = ''"
                :class="['flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300',
                         esRegistre ? 'bg-[#402749] text-white shadow-md' : 'text-[#402749]/60']"
              >
                Registrar-se
              </button>
            </div>

            <!-- Formulari -->
            <form @submit.prevent="executarAccio" class="space-y-4">

              <!-- Camp nom d'usuari (només en registre) -->
              <Transition name="field-slide">
                <div v-if="esRegistre" class="relative">
                  <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-[#9f6795]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input
                    v-model="nomPublic"
                    type="text"
                    placeholder="Nom d'explorador"
                    class="w-full pl-11 pr-4 py-3.5 bg-[#f5cbdd]/20 border-2 border-transparent rounded-2xl text-sm text-gray-700 font-medium outline-none focus:border-[#804f7f] focus:bg-white transition-all placeholder-gray-400"
                    required
                  />
                </div>
              </Transition>

              <!-- Camp correu -->
              <div class="relative">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-[#9f6795]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  v-model="correu"
                  type="email"
                  placeholder="Correu electrònic"
                  class="w-full pl-11 pr-4 py-3.5 bg-[#f5cbdd]/20 border-2 border-transparent rounded-2xl text-sm text-gray-700 font-medium outline-none focus:border-[#804f7f] focus:bg-white transition-all placeholder-gray-400"
                  required
                />
              </div>

              <!-- Camp contrasenya -->
              <div class="relative">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-[#9f6795]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  v-model="contrasenya"
                  type="password"
                  placeholder="Contrasenya"
                  class="w-full pl-11 pr-4 py-3.5 bg-[#f5cbdd]/20 border-2 border-transparent rounded-2xl text-sm text-gray-700 font-medium outline-none focus:border-[#804f7f] focus:bg-white transition-all placeholder-gray-400"
                  required
                />
              </div>

              <!-- Missatge d'error -->
              <Transition name="error-fade">
                <div v-if="error" class="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold">
                  <span></span>
                  <span>{{ error }}</span>
                </div>
              </Transition>

              <!-- Botó principal -->
              <button
                v-if="!pasVerificacio || !esRegistre"
                type="submit"
                :disabled="carregant"
                class="w-full bg-gradient-to-r from-[#402749] to-[#804f7f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#402749]/30 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="carregant" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>{{ carregant ? 'Un moment...' : (esRegistre ? ' Continuar al Scanner' : 'Explorar ara') }}</span>
              </button>

              <!-- Pas de Verificació Facial -->
              <div v-else class="space-y-4 animate-fade-in">
                <div class="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-[#bc85ab]">
                  <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover mirror"></video>
                  <canvas ref="canvasRef" class="hidden"></canvas>
                  
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="w-48 h-48 border-2 border-dashed border-white/50 rounded-full"></div>
                  </div>

                  <div v-if="analitzant" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center p-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                    <span class="text-xs font-bold uppercase tracking-widest">{{ analitzantFinal ? 'Creant compte...' : 'Escanejant...' }}</span>
                  </div>
                  
                  <div v-if="edatDetectada && analitzantFinal" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#402749]/90 backdrop-blur-md px-6 py-2 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20 animate-fade-in">
                    <div :class="[Math.round(edatDetectada) < 18 ? 'bg-orange-500' : 'bg-green-500', 'w-3 h-3 rounded-full animate-pulse']"></div>
                    <span class="text-xs font-black text-white uppercase tracking-tighter">Edat final: ~{{ Math.round(edatDetectada) }} ANYS</span>
                  </div>
                </div>

                <p class="text-[10px] text-gray-500 text-center italic leading-tight">
                  Alinea la teva cara amb el cercle. L'IA confirmarà la teva majoria d'edat per seguretat.
                </p>

                <div class="flex gap-2">
                  <button 
                    type="button" 
                    @click="pasVerificacio = false" 
                    class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest"
                  >
                    Tornar
                  </button>
                  <button 
                    type="button" 
                    @click="confirmarScanneig" 
                    :disabled="analitzant || !faceApiLlesta || !edatDetectada"
                    class="flex-[2] py-3 bg-[#402749] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {{ analitzantFinal ? 'Processant...' : 'Confirmar i Finalitzar' }}
                  </button>
                </div>
              </div>
            </form>

            <!-- Peu del modal: tancament -->
            <div class="mt-6 text-center">
              <p class="text-xs text-gray-400 font-medium">
                {{ esRegistre ? 'Ja tens compte?' : 'Vols explorar sense compte?' }}
              </p>
              <button
                @click="tancarModal"
                class="mt-1 text-xs text-[#804f7f] font-bold hover:text-[#402749] transition-colors underline underline-offset-2"
              >
                {{ esRegistre ? 'Torna enrere' : 'Potser més tard' }}
              </button>
            </div>
          </div>

        <button
            @click="tancarModal"
            class="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all hover:rotate-90 duration-300 text-sm font-bold"
          >
            ✕
          </button>
        </div> </Transition>

      <DisclaimerModal 
        v-if="mostrarDisclaimer" 
        @acceptat="continuarDiferit" 
      />

    </div> </Transition>
</template>



<script setup>
import { ref, nextTick, onUnmounted, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useLoginModal } from '../composables/useLoginModal';
import { useFaceDetection } from '../composables/useFaceDetection';
import DisclaimerModal from './DisclaimerModal.vue'; 

// Obtenim l'estat global del modal
const { obert, missatgePersonalitzat, rutaIntencio, tancarModal } = useLoginModal();

const router = useRouter();
const { login } = useAuth();

// Estat del formulari
const esRegistre = ref(false);
const nomPublic = ref('');
const correu = ref('');
const contrasenya = ref('');
const error = ref('');
const carregant = ref(false);
const mostrarDisclaimer = ref(false); 

// Lògica de Verificació Facial d'IA
const {
  pasVerificacio,
  analitzant,
  analitzantFinal,
  edatDetectada,
  faceApiLlesta,
  videoRef,
  canvasRef,
  handleFaceApiLoaded,
  iniciarCamera,
  aturarCamera,
  confirmarScanneig: confirmarScanneigIA
} = useFaceDetection();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

async function confirmarScanneig() {
  try {
    const resultat = await confirmarScanneigIA();
    if (!resultat) return;

    if (resultat.massaJove) {
      error.value = "Ho sentim, l'escaner indica que ets massa jove per registrar-te (~"+Math.round(resultat.edatEstimada)+" anys).";
      pasVerificacio.value = false;
      return;
    }

    await registrarFinal(resultat.esMajor, resultat.esMajor ? '' : resultat.imatgeBase64);

  } catch (err) {
    console.error(err);
    error.value = err.message || "Error durant la confirmació facial.";
  }
}

async function registrarFinal(esMajor, imatge) {
  carregant.value = true;
  const dades = {
    nom_usuari: nomPublic.value,
    correu: correu.value,
    contrasenya: contrasenya.value,
    es_major_confirmada: esMajor,
    verificacio_imatge: imatge
  };

  try {
    const resposta = await fetch(`${API_URL}/api/auth/registre`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dades)
    });

    const resultat = await resposta.json();

    if (resultat.success) {
      if (resultat.usuari.verificacio_estat === 'pendent') {
          // NO l'autentiquem, li mostrem missatge i resetegem
          missatgePersonalitzat.value = "Sol·licitud enviada! Un administrador revisarà la teva identitat per confirmar que ets major d'edat. Torna a provar d'entrar en unes hores.";
          pasVerificacio.value = false;
          aturarCamera();
          // Netegem dades sensibles del form
          contrasenya.value = '';
          return;
      }

      // Si està aprovat, procedim normalment
      login(resultat.usuari);
      tancarModal();
      router.push({ name: 'mapa' });
    } else {
      error.value = resultat.message;
      pasVerificacio.value = false;
    }
  } catch (err) {
    error.value = "Error de connexió.";
  } finally {
    carregant.value = false;
  }
}

function continuarDiferit() {
  mostrarDisclaimer.value = false;
  pasVerificacio.value = true;
  iniciarCamera().catch(err => {
    error.value = err.message;
  });
}

/**
 * Executa el login o registre depenent de l'estat del formulari
 */
async function executarAccio() {
  // 1. Control del Disclaimer
  if (esRegistre.value && !pasVerificacio.value && !localStorage.getItem('disclaimer_acceptat')) {
    mostrarDisclaimer.value = true;
    return; 
  }

  // 2. Control de la Càmera (Aquesta part faltava al teu últim missatge)
  // Si és registre i encara no estem al pas de verificació, activem la càmera
  if (esRegistre.value && !pasVerificacio.value) {
    pasVerificacio.value = true;
    iniciarCamera().catch(err => {
      error.value = err.message;
      pasVerificacio.value = false;
    });
    return;
  }
  
  carregant.value = true;
  error.value = '';

  const ruta = esRegistre.value ? '/registre' : '/login';
  const dades = {
    nom_usuari: nomPublic.value,
    correu: correu.value,
    contrasenya: contrasenya.value
  };

  try {
    const resposta = await fetch(`${API_URL}/api/auth${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dades)
    });

    const resultat = await resposta.json();

    if (resultat.success) {
      // Actualitzem l'estat global d'autenticació
      login(resultat.usuari);

      // Guardem la ruta d'intencio ABANS de tancar el modal (tancarModal la neteja)
      const rutaAnar = rutaIntencio.value;

      // Tanquem el modal
      tancarModal();

      // Redirigim segons el rol i la ruta d'intenció
      if (resultat.usuari.rol === 'admin') {
        const dadesSessio = {
          rol: 'admin',
          id: resultat.usuari._id,
          timestamp: new Date().getTime()
        };
        localStorage.setItem('admin_session', JSON.stringify(dadesSessio));
        router.push({ name: 'admin-dashboard' });
      } else if (rutaAnar && rutaAnar.name) {
        // Redirigim l'usuari a la ruta que volia visitar originalment
        router.push(rutaAnar);
      } else if (esRegistre.value) {
          // Si és registre i no hi ha ruta d'intenció, anem al mapa o perfil
          router.push('/mapa');
      }
      // Si no hi havia ruta d'intenció, simplement tanquem el modal i deixem l'usuari on era

    } else {
      error.value = resultat.message || "Comprova les teves dades i torna-ho a intentar";
    }
  } catch (err) {
    error.value = "No hem pogut connectar amb el servidor. Torna-ho a intentar.";
    console.error(err);
  } finally {
    carregant.value = false;
  }
}

onMounted(() => {
  handleFaceApiLoaded();
});

onUnmounted(() => {
  aturarCamera();
});
</script>

<style scoped>
/* Animació d'entrada del fons */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.35s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Animació de lliscament de la targeta (des de baix en mòbil) */
.modal-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-slide-leave-active {
  transition: all 0.25s ease-in;
}
.modal-slide-enter-from {
  transform: translateY(60px) scale(0.95);
  opacity: 0;
}
.modal-slide-leave-to {
  transform: translateY(30px) scale(0.97);
  opacity: 0;
}

/* Animació del camp nom (apareix/desapareix en registre) */
.field-slide-enter-active,
.field-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.field-slide-enter-from,
.field-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.field-slide-enter-to,
.field-slide-leave-from {
  max-height: 80px;
  opacity: 1;
  transform: translateY(0);
}

/* Animació del missatge d'error */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.25s ease;
}
.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.mirror {
  transform: rotateY(180deg);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
