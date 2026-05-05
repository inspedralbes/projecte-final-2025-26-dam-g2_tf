import { ref, nextTick } from 'vue';

// Patró del projecte per a la URL de l'API (útil si hostegem models o fem crides)
const API_URL = import.meta.env.VITE_API_URL || 'https://north.dam.inspedralbes.cat';

/**
 * Composable per gestionar la detecció facial amb face-api.js
 * Dissenyat per funcionar tant en local com en producció (servidor)
 */
export function useFaceDetection() {
  // Estat de la verificació
  const pasVerificacio = ref(false);
  const analitzant = ref(false);
  const analitzantFinal = ref(false);
  const edatDetectada = ref(null);
  const faceApiLlesta = ref(false);
  
  // Referències als elements DOM
  const videoRef = ref(null);
  const canvasRef = ref(null);
  
  // Variables internes no reactives
  let mediaStream = null;
  let loopDeteccio = null;
  let historialEdats = [];

  /**
   * Carrega dinàmicament el script de face-api.js si no existeix
   */
  const carregarScriptIA = () => {
    return new Promise((resolve, reject) => {
      if (window.faceapi) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No s'ha pogut carregar face-api.js des del CDN"));
      document.head.appendChild(script);
    });
  };

  /**
   * Inicialitza l'API i carrega els models necessaris
   */
  const handleFaceApiLoaded = async () => {
    if (faceApiLlesta.value) return;
    
    try {
      // 1. Assegurem que el script estigui carregat
      await carregarScriptIA();
      
      // 2. Carreguem els models
      // Utilitzem el CDN de vladmandic que és molt més fiable per als models
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
      ]);
      
      faceApiLlesta.value = true;
      console.log("IA Facial a punt (Models carregats)");
    } catch (err) {
      console.error("Error en la preparació de l'IA facial:", err);
    }
  };

  /**
   * Atura el loop de detecció facial
   */
  const aturarLoopDeteccio = () => {
    if (loopDeteccio) {
      clearTimeout(loopDeteccio);
      loopDeteccio = null;
    }
  };

  /**
   * Atura la càmera i neteja el stream
   */
  const aturarCamera = () => {
    aturarLoopDeteccio();
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  };

  /**
   * Inicia el loop de detecció en bucle
   */
  const iniciarLoopDeteccio = () => {
    if (loopDeteccio) return;
    
    const runDeteccio = async () => {
      if (!videoRef.value || !pasVerificacio.value || analitzantFinal.value) return;
      
      try {
        const detection = await faceapi.detectSingleFace(videoRef.value, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withAgeAndGender();

        if (detection) {
          historialEdats.push(detection.age);
          if (historialEdats.length > 5) historialEdats.shift();
          
          const mitjana = historialEdats.reduce((a, b) => a + b, 0) / historialEdats.length;
          edatDetectada.value = mitjana;
        }
      } catch (err) {
        console.warn("Error en loop de detecció facial:", err);
      }
      
      if (pasVerificacio.value && !analitzantFinal.value) {
        loopDeteccio = setTimeout(runDeteccio, 500);
      }
    };
    
    runDeteccio();
  };

  /**
   * Activa la càmera de l'usuari
   */
  const iniciarCamera = async () => {
    await nextTick();
    try {
      if (mediaStream) aturarCamera();
      
      mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream;
        videoRef.value.onloadedmetadata = () => {
          videoRef.value.play();
          iniciarLoopDeteccio();
        };
      }
    } catch (err) {
      console.error("Error al iniciar la càmera:", err);
      throw new Error("No hem pogut accedir a la càmera. Revisa els permisos.");
    }
  };

  /**
   * Captura el frame actual i confirma els resultats
   */
  const confirmarScanneig = async () => {
    if (!videoRef.value || analitzantFinal.value || !edatDetectada.value) return null;
    
    analitzantFinal.value = true;
    analitzant.value = true;

    try {
      const edatEstimada = edatDetectada.value;
      
      if (canvasRef.value) {
        const canvas = canvasRef.value;
        canvas.width = videoRef.value.videoWidth;
        canvas.height = videoRef.value.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.value, 0, 0);
        const imatgeBase64 = canvas.toDataURL('image/jpeg', 0.8);

        aturarCamera();
        
        return {
          edatEstimada,
          imatgeBase64,
          esMajor: edatEstimada >= 18,
          massaJove: edatEstimada < 15
        };
      }
      
      aturarCamera();
      return { edatEstimada, esMajor: edatEstimada >= 18 };

    } catch (err) {
      console.error("Error durant la captura facial:", err);
      throw new Error("Error durant la confirmació facial.");
    } finally {
      analitzant.value = false;
      analitzantFinal.value = false;
    }
  };

  return {
    // Estat
    pasVerificacio,
    analitzant,
    analitzantFinal,
    edatDetectada,
    faceApiLlesta,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Mètodes
    handleFaceApiLoaded,
    iniciarCamera,
    aturarCamera,
    confirmarScanneig,
    
    // Constants
    API_URL
  };
}
