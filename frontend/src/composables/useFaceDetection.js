import { ref, nextTick } from 'vue';
import { BASE_API_URL } from '../utils/url';

// Constants: Integració base d'API.
const API_URL = BASE_API_URL;

// Composable: Integració del model d'IA de client per a l'anàlisi biomètric (face-api.js).
export function useFaceDetection() {
  // Estat reactiu
  const pasVerificacio = ref(false);
  const analitzant = ref(false);
  const analitzantFinal = ref(false);
  const edatDetectada = ref(null);
  const faceApiLlesta = ref(false);

  // Referències DOM
  const videoRef = ref(null);
  const canvasRef = ref(null);

  // Variables internes (memòria)
  let mediaStream = null;
  let loopDeteccio = null;
  let historialEdats = [];

  // Lògica d'inicialització: Injecció asíncrona de dependències del CDN.
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

  // Lògica d'inicialització: Càrrega de xarxes neuronals pre-entrenades.
  const handleFaceApiLoaded = async () => {
    if (faceApiLlesta.value) return;

    try {
      await carregarScriptIA();
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

  // Control de flux: Interrupció de l'anàlisi recursiu.
  const aturarLoopDeteccio = () => {
    if (loopDeteccio) {
      clearTimeout(loopDeteccio);
      loopDeteccio = null;
    }
  };

  // Maquinari: Alliberament dels recursos de captura de vídeo.
  const aturarCamera = () => {
    aturarLoopDeteccio();
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  };

  // Lògica de control: Execució de la inferència sobre l'esquema de vídeo actiu.
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

  // Maquinari: Sol·licitud de permisos d'accés i muntatge del flux de vídeo.
  const iniciarCamera = async () => {
    await nextTick();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("El teu navegador no suporta l'accés a la càmera o estàs en una connexió no segura (HTTP).");
      }
      if (mediaStream) aturarCamera();

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn("Failing back to default camera constraints:", err);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

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

  // Exportació de dades: Extracció del fotograma final i delegació d'inferència de suport.
  const confirmarScanneig = async () => {
    if (!videoRef.value || analitzantFinal.value) return null;

    analitzantFinal.value = true;
    analitzant.value = true;

    try {
      let edatEstimada = edatDetectada.value;

      if (canvasRef.value) {
        const canvas = canvasRef.value;
        canvas.width = videoRef.value.videoWidth;
        canvas.height = videoRef.value.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.value, 0, 0);
        const imatgeBase64 = canvas.toDataURL('image/jpeg', 0.8);

        if (!edatEstimada && faceApiLlesta.value) {
          try {
            const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withAgeAndGender();
            if (detection) {
              edatEstimada = detection.age;
            }
          } catch (e) {
            console.warn("No s'ha pogut forçar la detecció", e);
          }
        }

        if (!edatEstimada) {
          edatEstimada = 17;
        }

        aturarCamera();

        return {
          edatEstimada,
          imatgeBase64,
          esMajor: edatEstimada >= 18,
          massaJove: edatEstimada < 15
        };
      }

      aturarCamera();
      return { edatEstimada: edatEstimada || 17, esMajor: (edatEstimada || 17) >= 18 };

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
