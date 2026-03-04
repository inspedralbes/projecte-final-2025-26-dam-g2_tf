const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc, Perfil, SessioJoc } = require('../models');
const { notifyGameOver } = require('./gameSocket');

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
    const imatge = req.body.imatge;
    const idLloc = req.body.idLloc;
    const perfilId = req.body.perfilId;
    const codi_sala = req.body.codi_sala; // Aquí és l'_id de la SessioJoc
    const idPunt = req.body.idPunt;       // El _id del punt_missio concret

    if (!idLloc || !codi_sala || !perfilId) {
        return res.status(400).json({ missatge: "Falten dades obligatòries (Lloc, Sala o Perfil)." });
    }

    try {
        // Assegurem-nos que l'IA està llesta
        await carregarModel();

        // Busquem la sessió per _id i el lloc en paral·lel
        const sessio = await SessioJoc.findById(codi_sala);
        const lloc = await Lloc.findById(idLloc);

        if (!sessio) return res.status(404).json({ missatge: "Sessió no trobada." });
        if (!lloc) return res.status(404).json({ missatge: "Lloc no trobat." });

        // Busquem la imatge de referència: primer mirem si el punt concret en té, si no usem la del lloc
        let imatgeReferencia = lloc.imatge_referencia;
        let puntTrobat = false;
        if (idPunt) {
            for (let i = 0; i < lloc.punts_missio.length; i++) {
                const p = lloc.punts_missio[i];
                if (p._id.toString() === idPunt.toString()) {
                    puntTrobat = true;
                    if (p.imatge_referencia) {
                        imatgeReferencia = p.imatge_referencia;
                        console.log(`[Càmera] Punt trobat: "${p.nom_punt}" | imatge: ${imatgeReferencia}`);
                    } else {
                        console.log(`[Càmera] Punt "${p.nom_punt}" NO té imatge_referencia pròpia → usant la del lloc`);
                    }
                    break;
                }
            }
            if (!puntTrobat) {
                console.warn(`[Càmera] ATENCIÓ: idPunt "${idPunt}" NO existeix a lloc.punts_missio!`);
                console.warn(`[Càmera] IDs dels punts al lloc:`, lloc.punts_missio.map(p => p._id.toString()));
            }
        }

        if (!imatgeReferencia) {
            return res.status(404).json({ missatge: "No s'ha trobat la imatge de referència per a aquest punt." });
        }

        const nomFitxer = 'captura_' + Date.now() + '.jpg';
        const camiUsuari = path.join(__dirname, '../../public/fotos_partides_usuaris', nomFitxer);

        // Preparem la imatge de referència com a Buffer
        let bufferRef;
        if (imatgeReferencia.startsWith('http://') || imatgeReferencia.startsWith('https://')) {
            const response = await fetch(imatgeReferencia);
            if (!response.ok) {
                return res.status(500).json({ missatge: "Error en descarregar la imatge externa." });
            }
            const arrayBuffer = await response.arrayBuffer();
            bufferRef = Buffer.from(arrayBuffer);
        } else {
            // Pot ser una ruta relativa a fotos_actuals o fotos_historiques
            let rutaLocal;
            if (imatgeReferencia.startsWith('/fotos_actuals/')) {
                rutaLocal = path.join(__dirname, '../../public', imatgeReferencia);
            } else {
                rutaLocal = path.join(__dirname, '../../public/fotos_historiques', imatgeReferencia);
            }
            console.log(`[Càmera] Carregant imatge local: ${rutaLocal}`);
            if (!fs.existsSync(rutaLocal)) {
                console.error(`[Càmera] ERROR: fitxer no trobat: ${rutaLocal}`);
                return res.status(404).json({ missatge: `Imatge de referència no trobada: ${imatgeReferencia}` });
            }
            bufferRef = fs.readFileSync(rutaLocal);
        }

        // Guardem la imatge que ens envia l'usuari
        const carpetaUsuari = path.dirname(camiUsuari);
        if (!fs.existsSync(carpetaUsuari)) {
            fs.mkdirSync(carpetaUsuari, { recursive: true });
        }
        const dadesNetes = imatge.replace(/^data:image\/.*;base64,/, "");
        const bufferUsuari = Buffer.from(dadesNetes, 'base64');
        fs.writeFileSync(camiUsuari, bufferUsuari);

        // --- INICI PROCESSAMENT AMB IA ---
        let similitud = 0;
        let tensorUsuari, tensorRef, caracteristiquesUsuari, caracteristiquesRef;
        try {
            // 1. Convertim les imatges a JPEG (sharp les normalitza, evita errors amb HEIC/WebP de iPhone)
            const bufferUsuariJpeg = await sharp(bufferUsuari).jpeg().toBuffer();
            const bufferRefJpeg = await sharp(bufferRef).jpeg().toBuffer();

            // 2. Convertim les imatges a "Tensors" (matrius de números 3D que entén l'IA)
            tensorUsuari = tf.node.decodeImage(bufferUsuariJpeg, 3); // 3 significa RGB
            tensorRef = tf.node.decodeImage(bufferRefJpeg, 3);

            // Extraiem els "embeddings" o punts clau.
            // El 'true' indica que no volem saber quin objecte és, sinó el seu codi estructural
            caracteristiquesUsuari = modelMobileNet.infer(tensorUsuari, true);
            caracteristiquesRef = modelMobileNet.infer(tensorRef, true);

            // 3. Calculem la similitud
            const similitudDecimal = calcularSimilitudCosinus(caracteristiquesUsuari, caracteristiquesRef);
            // Si l'angle és completament oposat, podria donar negatiu, ens assegurem que el mínim sigui 0
            similitud = Math.max(0, similitudDecimal) * 100;
        } catch (errorIA) {
            // Aquest catch NOMÉS captura errors reals de TensorFlow/sharp
            console.error("[IA] Error durant el processament d'imatges amb TensorFlow:", errorIA);
            return res.status(500).json({ missatge: "Error en el processament d'imatges amb TensorFlow." });
        } finally {
            // 4. IMPORTANT: Buidar la memòria RAM sempre, tant si hi ha error com si no
            if (tensorUsuari) tensorUsuari.dispose();
            if (tensorRef) tensorRef.dispose();
            if (caracteristiquesUsuari) caracteristiquesUsuari.dispose();
            if (caracteristiquesRef) caracteristiquesRef.dispose();
        }
        // --- FI PROCESSAMENT AMB IA ---

        console.log(`[Càmera IA] IdLloc: ${idLloc} | Similitud: ${similitud.toFixed(2)}%`);

        // --- LÒGICA DE JOC I BASE DE DADES ---
        try {
            if (similitud >= 50) {
                // Trobem el jugador dins la sessió
                let jugador = null;
                for (let i = 0; i < sessio.jugadors.length; i++) {
                    if (sessio.jugadors[i].id_usuari.toString() === perfilId) {
                        jugador = sessio.jugadors[i];
                        break;
                    }
                }
                if (!jugador) return res.status(404).json({ missatge: "Jugador no trobat a la sessió." });

                // Quin punt s'ha completat? Usem idPunt (lliure ordre) si existeix, si no idLloc
                const puntAMarcar = idPunt || idLloc;

                console.log(`[Càmera] idPunt rebut: ${idPunt}`);
                console.log(`[Càmera] id_puntos_de_la_partida de la sessió:`, sessio.id_puntos_de_la_partida.map(p => p.toString()));
                console.log(`[Càmera] puntAMarcar triat: ${puntAMarcar}`);
                console.log(`[Càmera] punts_completats ABANS:`, jugador.punts_completats.map(p => p.toString()));

                // Marquem el punt si no estava ja completat
                let jaComplet = false;
                for (let i = 0; i < jugador.punts_completats.length; i++) {
                    if (jugador.punts_completats[i].toString() === puntAMarcar.toString()) {
                        jaComplet = true;
                        break;
                    }
                }

                if (!jaComplet) {
                    jugador.punts_completats.push(puntAMarcar);

                    // Calculem el temps total en segons des de l'inici
                    const segons = Math.floor((new Date() - sessio.temps_inici) / 1000);
                    jugador.temps = segons.toString();

                    // Calculem la mitjana d'exactitud
                    const totalFetes = jugador.punts_completats.length;
                    jugador.exactitud_media = ((jugador.exactitud_media * (totalFetes - 1)) + similitud) / totalFetes;
                }

                console.log(`[Càmera] punts_completats DESPRÉS:`, jugador.punts_completats.map(p => p.toString()));

                // Comprovem si ha completat tota la llista.
                // Usem sessio.id_puntos_de_la_partida.length com a total autoritzat (definit al crear la partida).
                // Si per algun motiu és 0 (sessió molt antiga), fem fallback a lloc.punts_missio.length.
                const totalPuntsPartida = sessio.id_puntos_de_la_partida.length || lloc.punts_missio.length;
                const haAcabatLaLlista = jugador.punts_completats.length >= totalPuntsPartida;

                console.log(`[Càmera] Total punts partida: ${totalPuntsPartida} | Completats: ${jugador.punts_completats.length} | Acabat: ${haAcabatLaLlista}`);
                let medalla = null;

                if (haAcabatLaLlista) {
                    jugador.completat = true;
                    sessio.estat = 'finalitzada';

                    // Calculem rànquing (quants han acabat ja)
                    let guanyadors = 0;
                    for (let i = 0; i < sessio.jugadors.length; i++) {
                        if (sessio.jugadors[i].completat) guanyadors++;
                    }
                    medalla = guanyadors === 1 ? "Or" : guanyadors === 2 ? "Plata" : "Bronze";

                    // GUARDAR CROMO AL PERFIL DE L'USUARI
                    const perfil = await Perfil.findById(perfilId);
                    if (perfil) {
                        perfil.inventari_cromos.push({
                            id_lloc: sessio.id_lloc_desti,
                            nom_lloc: lloc.nom,
                            rango: medalla,
                            imatge_usuari: "/fotos_partides_usuaris/" + nomFitxer,
                            data_obtencio: new Date()
                        });
                        await perfil.save();
                    }
                }

                await sessio.save();

                // Si algú ha completat tots els punts, notifiquem tota la sala
                // El guanyador rep l'event però l'ignora (el modal ja el redirigeix)
                // La resta de jugadors veuran una notificació amb el nom del guanyador
                if (haAcabatLaLlista) {
                    const nomGuanyador = perfil ? perfil.nom_usuari : 'Un jugador';
                    notifyGameOver(codi_sala, sessio, perfilId, nomGuanyador);
                }

                return res.json({
                    exit: true,
                    completat_tot: haAcabatLaLlista,
                    rango: medalla,
                    coincidencia: similitud.toFixed(2) + "%",
                    nom_lloc: lloc.nom,
                    imatge_historica: imatgeReferencia,
                    sessioId: codi_sala,
                    missatge: haAcabatLaLlista ? "Partida finalitzada!" : "Punt trobat! Torna al mapa pel següent.",
                    url_foto: "/fotos_partides_usuaris/" + nomFitxer
                });

            } else {
                return res.json({
                    exit: false,
                    coincidencia: similitud.toFixed(2) + "%",
                    missatge: "No coincideix prou. Revisa l'angle i torna-ho a provar."
                });
            }
        } catch (errorJoc) {
            // Aquest catch captura errors de Base de Dades, Socket, etc.
            console.error("[Joc] Error en guardar la partida o notificar jugadors:", errorJoc);
            return res.status(500).json({ missatge: "Error en guardar el progrés de la partida." });
        }
    } catch (err) {
        console.error("Error buscant el lloc:", err);
        res.status(500).json({ missatge: "Error de servidor al buscar el lloc." });
    }
});

module.exports = router;