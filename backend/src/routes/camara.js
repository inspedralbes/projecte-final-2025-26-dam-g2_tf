const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc, Perfil, SessioJoc } = require('../models');
const { notifyGameOver, notifyPointAchieved, notifyFotoPresa } = require('./gameSocket');

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
        if (sessio.estat === 'finalitzada') {
            return res.status(400).json({ missatge: "La partida ja ha acabat." });
        }
        if (!lloc) return res.status(404).json({ missatge: "Lloc no trobat." });

        // Notifiquem a la resta de jugadors que algú ha fet una foto (temps real)
        // Busquem el nom del jugador i del punt per personalitzar la notificació
        {
            const perfilInfo = await Perfil.findById(perfilId).select('nom_usuari');
            const nomJugador = perfilInfo ? perfilInfo.nom_usuari : 'Un jugador';
            // Obtenim el nom del punt si n'hi ha
            let nomPuntFoto = lloc ? lloc.nom : '';
            if (idPunt && lloc) {
                const puntObj = (lloc.punts_missio || []).find(p => p._id.toString() === idPunt.toString());
                if (puntObj && puntObj.nom_punt) nomPuntFoto = puntObj.nom_punt;
            }
            notifyFotoPresa(sessio, nomJugador, nomPuntFoto);
        }

        // Busquem la imatge de referència per a la IA: primer mirem si el punt concret en té, si no usem la del lloc
        let imatgeReferencia = lloc.imatge_referencia;
        let imatgePuntMissio = null; // Imatge específica del punt per mostrar a l'usuari
        let fotoHistorica = ''; // Foto antiga per la contraportada
        let textHistoric = '';  // Text d'història per la contraportada
        let puntTrobat = false;
        let nomPunt = lloc.nom; // Per defecte el nom del lloc
        if (idPunt) {
            for (let i = 0; i < lloc.punts_missio.length; i++) {
                const p = lloc.punts_missio[i];
                if (p._id.toString() === idPunt.toString()) {
                    puntTrobat = true;
                    nomPunt = p.nom_punt; // Guardem el nom del punt concret
                    if (p.imatge_referencia) {
                        imatgePuntMissio = p.imatge_referencia; // Guardem la del punt concret
                        imatgeReferencia = p.imatge_referencia; // Per a la IA
                        console.log(`[Càmera] Punt trobat: "${p.nom_punt}" | imatge: ${imatgeReferencia}`);
                    } else {
                        console.log(`[Càmera] Punt "${p.nom_punt}" NO té imatge_referencia pròpia → usant la del lloc`);
                    }
                    // Recollim foto i text històric del punt
                    fotoHistorica = p.foto_historica || '';
                    textHistoric = p.text_historic || '';
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

                // VERIFICACIÓ DE TEMPS: Si el temps s'ha esgotat (global o individual), no deixem validar
                const ara = new Date();
                const limitGlobal = sessio.temps_limit ? new Date(sessio.temps_limit) : null;
                const limitIndividual = jugador.temps_limit ? new Date(jugador.temps_limit) : limitGlobal;

                if ((limitGlobal && ara > limitGlobal) || (limitIndividual && ara > limitIndividual)) {
                    console.log(`[Càmera] TEMPS ESGOTAT per a ${perfilId}. Refusant validació.`);
                    if (sessio.estat === 'jugant') {
                        sessio.estat = 'finalitzada';
                        await sessio.save();
                        notifyGameOver(sessio._id, sessio, 'timeout', null);
                    }
                    return res.status(400).json({ missatge: "S'ha acabat el temps! No pots fer més fotos." });
                }

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

                    // Notifiquem a tota la sala (WebSockets)
                    const perfilInfo = await Perfil.findById(perfilId).select('nom_usuari');
                    const nomUsuari = perfilInfo ? perfilInfo.nom_usuari : 'Un jugador';
                    notifyPointAchieved(sessio, nomUsuari, nomPunt, puntAMarcar);

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
                // totalPuntsPartida ha de ser la quantitat de punts ASSIGNATS al jugador si n'hi ha,
                // sinó fem servir el total de la partida o del lloc.
                const totalPuntsPartida = (jugador.punts_assignats && jugador.punts_assignats.length > 0)
                    ? jugador.punts_assignats.length
                    : (sessio.id_puntos_de_la_partida.length || lloc.punts_missio.length);
                const haAcabatLaLlista = jugador.punts_completats.length >= totalPuntsPartida;

                console.log(`[Càmera] Total punts partida: ${totalPuntsPartida} | Completats: ${jugador.punts_completats.length} | Acabat: ${haAcabatLaLlista}`);
                let medalla = null;
                let perfil = null; // Declarat fora perquè sigui accessible a notifyGameOver

                let cromo_nou = false;

                if (haAcabatLaLlista) {
                    // Comptem els que ja havien acabat ABANS de marcar lugador actual
                    // per saber si és el primer (guanyador real)
                    let completatsAbans = 0;
                    for (let i = 0; i < sessio.jugadors.length; i++) {
                        if (sessio.jugadors[i].completat) completatsAbans++;
                    }
                    const esElGuanyador = completatsAbans === 0;
                    medalla = completatsAbans === 0 ? "Or" : completatsAbans === 1 ? "Plata" : "Bronze";

                    jugador.completat = true;
                    sessio.estat = 'finalitzada';

                    // Calculem rànquing (quants han acabat ja)
                    let guanyadors = 0;
                    for (let i = 0; i < sessio.jugadors.length; i++) {
                        if (sessio.jugadors[i].completat) guanyadors++;
                    }
                    medalla = guanyadors === 1 ? "Or" : guanyadors === 2 ? "Plata" : "Bronze";

                    // GUARDAR CROMO AL PERFIL
                    if (esElGuanyador) {
                        // Per defecte recollim el perfil de qui fa la crida (guanyador real) per a la notificació
                        perfil = await Perfil.findById(perfilId);

                        // Lògica segons el tipus de partida
                        if (sessio.tipus_partida === 'individual') {
                            // MODE INDIVIDUAL: Només al guanyador
                            if (perfil) {
                                const jaTeCromo = perfil.inventari_cromos.some(c => c.id_lloc && c.id_lloc.toString() === sessio.id_lloc_desti.toString());
                                if (!jaTeCromo) {
                                    perfil.inventari_cromos.push({
                                        id_lloc: sessio.id_lloc_desti,
                                        nom_lloc: lloc.nom,
                                        rango: medalla,
                                        imatge_usuari: "/fotos_partides_usuaris/" + nomFitxer,
                                        imatge_cromo: lloc.cromo_imatge || '',
                                        data_obtencio: new Date()
                                    });
                                    await perfil.save();
                                    cromo_nou = true;
                                }
                            }
                        } else if (sessio.tipus_partida === 'grup' || sessio.tipus_partida === 'grups') {
                            // MODE GRUP o GRUPS: Repartim a tots els que toqui
                            const guanyadorGrupId = jugador.grup_id;

                            for (let i = 0; i < sessio.jugadors.length; i++) {
                                const j = sessio.jugadors[i];

                                // En mode 'grup' tothom guanya. En mode 'grups', només els del mateix equip.
                                if (sessio.tipus_partida === 'grup' || j.grup_id === guanyadorGrupId) {
                                    const pMembre = await Perfil.findById(j.id_usuari);
                                    if (pMembre) {
                                        const jaTeCromo = pMembre.inventari_cromos.some(c => c.id_lloc && c.id_lloc.toString() === sessio.id_lloc_desti.toString());
                                        if (!jaTeCromo) {
                                            pMembre.inventari_cromos.push({
                                                id_lloc: sessio.id_lloc_desti,
                                                nom_lloc: lloc.nom,
                                                rango: medalla,
                                                imatge_usuari: "/fotos_partides_usuaris/" + nomFitxer,
                                                imatge_cromo: lloc.cromo_imatge || '',
                                                data_obtencio: new Date()
                                            });
                                            await pMembre.save();
                                            if (j.id_usuari.toString() === perfilId.toString()) cromo_nou = true;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        console.log(`[Càmera] Jugador no és el guanyador → no es guarda cap cromo al perfil.`);
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
                    cromo_nou: cromo_nou,
                    coincidencia: similitud.toFixed(2) + "%",
                    nom_lloc: lloc.nom,
                    imatge_punt: imatgePuntMissio || imatgeReferencia,  // imatge del punt per mostrar al modal
                    imatge_historica: imatgeReferencia,
                    imatge_cromo: lloc.cromo_imatge || '',
                    foto_historica: fotoHistorica,   // foto antiga per la contraportada
                    text_historic: textHistoric,     // text d'història per la contraportada
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