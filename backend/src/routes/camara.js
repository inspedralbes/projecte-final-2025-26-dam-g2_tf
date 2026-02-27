const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc, Perfil } = require('../models');

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
    const { imatge, idLloc, perfilId, codi_sala } = req.body;

    if (!idLloc || !codi_sala || !perfilId) {
        return res.status(400).json({ missatge: "Falten dades obligatòries (Lloc, Sala o Perfil)." });
    }

    try {
        // Assegurem-nos que l'IA està llesta
        await carregarModel();

        // Busquem la sessió i el lloc en paral·lel per anar més ràpid
        const [sessio, lloc] = await Promise.all([
            SessioJoc.findOne({ codi_sala: codi_sala }),
            Lloc.findById(idLloc)
        ]);

        if (!sessio) return res.status(404).json({ missatge: "Sessió no trobada." });
        if (!lloc || !lloc.imatge_referencia) {
            return res.status(404).json({ missatge: "No s'ha trobat la imatge de referència." });
        }

        // SEGURETAT: Validar que l'usuari no intenta saltar-se l'ordre
        if (sessio.id_objetivo_actual.toString() !== idLloc.toString()) {
            return res.status(400).json({ 
                exit: false, 
                missatge: "Aquest no és el teu objectiu actual. Mira el mapa!" 
            });
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
            const dadesNetes = imatge.replace(/^data:image\/.*;base64,/, "");
            const bufferUsuari = Buffer.from(dadesNetes, 'base64');
            fs.writeFileSync(camiUsuari, bufferUsuari);

            // --- INICI PROCESSAMENT AMB IA ---

            // 1. Convertim les imatges a JPEG (sharp les normalitza, evita errors amb HEIC/WebP de iPhone)
            const bufferUsuariJpeg = await sharp(bufferUsuari).jpeg().toBuffer();
            const bufferRefJpeg = await sharp(bufferRef).jpeg().toBuffer();

            // 2. Convertim les imatges a "Tensors" (matrius de números 3D que entén l'IA)
            const tensorUsuari = tf.node.decodeImage(bufferUsuariJpeg, 3); // 3 significa RGB
            const tensorRef = tf.node.decodeImage(bufferRefJpeg, 3);

            // Extraiem els "embeddings" o punts clau. 
            // El 'true' indica que no volem saber quin objecte és, sinó el seu codi estructural
            const caracteristiquesUsuari = modelMobileNet.infer(tensorUsuari, true);
            const caracteristiquesRef = modelMobileNet.infer(tensorRef, true);

            // 3. Calculem la similitud
            const similitudDecimal = calcularSimilitudCosinus(caracteristiquesUsuari, caracteristiquesRef);
            // Si l'angle és completament oposat, podria donar negatiu, ens assegurem que el mínim sigui 0
            const similitud = Math.max(0, similitudDecimal) * 100;

            // 4. IMPORTANT: Buidar la memòria RAM.
            tensorUsuari.dispose();
            tensorRef.dispose();
            caracteristiquesUsuari.dispose();
            caracteristiquesRef.dispose();

            // --- FI PROCESSAMENT AMB IA ---

            console.log(`[Càmera IA] IdLloc: ${idLloc} | Similitud: ${similitud.toFixed(2)}%`);

            if (similitud >= 50) {
                const jugador = sessio.jugadors.find(j => j.id_usuari.toString() === perfilId);
                if (!jugador) return res.status(404).json({ missatge: "Jugador no trobat a la sessió." });

                // 1. Marquem el punt actual com a fet en la llista del jugador
                if (!jugador.punts_completats.includes(idLloc)) {
                    jugador.punts_completats.push(idLloc);
                    
                    // Calculem el temps total en segons des de l'inici
                    const segons = Math.floor((new Date() - sessio.temps_inici) / 1000);
                    jugador.temps = segons.toString();
                    
                    // Calculem la mitjana d'exactitud
                    const totalFetes = jugador.punts_completats.length;
                    jugador.exactitud_media = ((jugador.exactitud_media * (totalFetes - 1)) + similitud) / totalFetes;
                }

                // 2. Comprovem si ha completat tota la llista de la partida
                const haAcabatLaLlista = jugador.punts_completats.length === sessio.id_puntos_de_la_partida.length;
                let medalla = null;

                if (haAcabatLaLlista) {
                    jugador.completat = true;
                    
                    // Calculem rànquing (quants han acabat ja)
                    const guanyadors = sessio.jugadors.filter(j => j.completat).length;
                    medalla = guanyadors === 1 ? "Or" : guanyadors === 2 ? "Plata" : "Bronze";

                    // GUARDAR CROMO AL PERFIL DE L'USUARI
                    const perfil = await Perfil.findById(perfilId);
                    if (perfil) {
                        perfil.inventari_cromos.push({
                            id_lloc: sessio.id_lloc_desti, // Cromo del mapa/zona general
                            rango: medalla,
                            imatge_usuari: "/fotos_partides_usuaris/" + nomFitxer,
                            data_obtencio: new Date()
                        });
                        await perfil.save();
                    }
                } else {
                    // SI NO HA ACABAT: Passem al següent objectiu de la llista
                    const seguentIndex = jugador.punts_completats.length;
                    sessio.id_objetivo_actual = sessio.id_puntos_de_la_partida[seguentIndex];
                }

                await sessio.save();

                res.json({
                    exit: true,
                    completat_tot: haAcabatLaLlista,
                    rango: medalla,
                    coincidencia: similitud.toFixed(2) + "%",
                    missatge: haAcabatLaLlista ? "🏆 Partida finalitzada!" : "📍 Punt trobat! Torna al mapa pel següent.",
                    url_foto: "/fotos_partides_usuaris/" + nomFitxer
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