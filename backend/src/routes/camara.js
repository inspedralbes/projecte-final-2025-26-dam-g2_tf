const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc } = require('../models');

// 1. Importem TensorFlow.js per a Node i el model MobileNet
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

// 2. Variable global per guardar el model (així no el carreguem a cada petició i va més ràpid)
let modelMobileNet = null;

async function carregarModel() {
    if (!modelMobileNet) {
        console.log("[IA] Carregant el model MobileNet...");
        // Utilitzem la versió 2 del model, que és ràpida i precisa per a telèfons
        modelMobileNet = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log("[IA] Model MobileNet carregat correctament!");
    }
}
// El carreguem només engegar el servidor
carregarModel();

// 3. Funció matemàtica per comparar els "punts clau" (Similitud del Cosinus)
function calcularSimilitudCosinus(tensor1, tensor2) {
    const dades1 = tensor1.dataSync();
    const dades2 = tensor2.dataSync();

    let productePunt = 0;
    let norma1 = 0;
    let norma2 = 0;

    for (let i = 0; i < dades1.length; i++) {
        productePunt += dades1[i] * dades2[i];
        norma1 += dades1[i] * dades1[i];
        norma2 += dades2[i] * dades2[i];
    }

    if (norma1 === 0 || norma2 === 0) return 0;
    return productePunt / (Math.sqrt(norma1) * Math.sqrt(norma2));
}

router.post('/', async function (req, res) {
    const imatgeBase64 = req.body.imatge;
    const idLloc = req.body.idLloc;

    if (!idLloc) {
        return res.status(400).json({ missatge: "Falta l'ID del lloc." });
    }

    try {
        // Assegurem-nos que l'IA està llesta
        await carregarModel();

        const lloc = await Lloc.findById(idLloc);
        if (!lloc || !lloc.imatge_referencia) {
            return res.status(404).json({ missatge: "No s'ha trobat la imatge de referència." });
        }

        const nomFitxer = 'captura_' + Date.now() + '.jpg';
        const camiUsuari = path.join(__dirname, '../../public/fotos_partides_usuaris', nomFitxer);

        // Preparem la imatge de referència com a Buffer
        let bufferRef;
        if (lloc.imatge_referencia.startsWith('http://') || lloc.imatge_referencia.startsWith('https://')) {
            const response = await fetch(lloc.imatge_referencia);
            if (!response.ok) {
                return res.status(500).json({ missatge: "Error en descarregar la imatge externa." });
            }
            const arrayBuffer = await response.arrayBuffer();
            bufferRef = Buffer.from(arrayBuffer);
        } else {
            const rutaLocal = path.join(__dirname, '../../public/fotos_historiques', lloc.imatge_referencia);
            bufferRef = fs.readFileSync(rutaLocal);
        }

        try {
            // Guardem la imatge que ens envia l'usuari
            const carpetaUsuari = path.dirname(camiUsuari);
            if (!fs.existsSync(carpetaUsuari)) {
                fs.mkdirSync(carpetaUsuari, { recursive: true });
            }
            const dadesNetes = imatgeBase64.replace(/^data:image\/.*;base64,/, "");
            const bufferUsuari = Buffer.from(dadesNetes, 'base64');
            fs.writeFileSync(camiUsuari, bufferUsuari);

            // --- INICI PROCESSAMENT AMB IA ---

            // 1. Convertim les imatges a JPEG (sharp les normalitza, evita errors amb HEIC/WebP de iPhone)
            const bufferUsuariJpeg = await sharp(bufferUsuari).jpeg().toBuffer();
            const bufferRefJpeg = await sharp(bufferRef).jpeg().toBuffer();

            // 2. Convertim les imatges a "Tensors" (matrius de números 3D que entén la IA)
            const tensorUsuari = tf.node.decodeImage(bufferUsuariJpeg, 3); // 3 significa RGB
            const tensorRef = tf.node.decodeImage(bufferRefJpeg, 3);

            // 2. Extraiem els "embeddings" o punts clau. 
            // El 'true' indica que no volem saber quin objecte és, sinó el seu codi estructural
            const caracteristiquesUsuari = modelMobileNet.infer(tensorUsuari, true);
            const caracteristiquesRef = modelMobileNet.infer(tensorRef, true);

            // 3. Calculem la similitud
            const similitudDecimal = calcularSimilitudCosinus(caracteristiquesUsuari, caracteristiquesRef);
            // Si l'angle és completament oposat, podria donar negatiu, ens assegurem que el mínim sigui 0
            const similitud = Math.max(0, similitudDecimal) * 100;

            // 4. IMPORTANT: Buidar la memòria RAM. A diferència de JavaScript normal, 
            // TensorFlow requereix esborrar manualment els Tensors per no col·lapsar el servidor.
            tensorUsuari.dispose();
            tensorRef.dispose();
            caracteristiquesUsuari.dispose();
            caracteristiquesRef.dispose();

            // --- FI PROCESSAMENT AMB IA ---

            console.log(`[Càmera IA] IdLloc: ${idLloc} | Similitud: ${similitud.toFixed(2)}%`);

            if (similitud >= 50) {
                res.json({
                    exit: true,
                    coincidencia: similitud.toFixed(2) + "%",
                    missatge: "Cromo guardat! Has trobat l'angle correcte.",
                    url: "/fotos_partides_usuaris/" + nomFitxer
                });
            } else {
                res.json({
                    exit: false,
                    coincidencia: similitud.toFixed(2) + "%",
                    missatge: "No coincideix prou. Revisa l'angle i torna-ho a provar."
                });
            }

        } catch (error) {
            console.error("Error al processar amb IA:", error);
            res.status(500).json({ missatge: "Error en el processament d'imatges amb TensorFlow." });
        }
    } catch (err) {
        console.error("Error buscant el lloc:", err);
        res.status(500).json({ missatge: "Error de servidor al buscar el lloc." });
    }
});

module.exports = router;