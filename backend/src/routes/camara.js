const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc, Perfil, SessioJoc } = require('../models');
const { notifyGameOver, notifyPointAchieved } = require('./gameSocket');

// Dependències de TensorFlow per a la classificació d'imatges
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

// Cau (cache) per al model MobileNet
let modelMobileNet = null;

// Càrrega asíncrona del model MobileNet (v2) per a la memòria del servidor
async function carregarModel() {
    if (!modelMobileNet) {
        console.log("[IA] Carregant el model MobileNet...");
        modelMobileNet = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log("[IA] Model MobileNet carregat correctament!");
    }
}
carregarModel();

// Calcula la similitud del cosinus entre dos tensors de característiques (embeddings)
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
// POST /camara: Endpoint principal per a la validació d'imatges via IA durant una sessió de joc.
// Processa la imatge rebuda, extreu característiques, compara similitud, i actualitza l'estat de la partida.
router.post('/', async function (req, res) {
    const imatge = req.body.imatge;
    const idLloc = req.body.idLloc;
    const perfilId = req.body.perfilId;
    const codi_sala = req.body.codi_sala;
    const idPunt = req.body.idPunt;

    if (!idLloc || !codi_sala || !perfilId) {
        return res.status(400).json({ missatge: "Falten dades obligatòries (Lloc, Sala o Perfil)." });
    }

    try {
        await carregarModel();

        const sessio = await SessioJoc.findById(codi_sala);
        const lloc = await Lloc.findById(idLloc);

        if (!sessio) return res.status(404).json({ missatge: "Sessió no trobada." });
        if (sessio.estat === 'finalitzada') {
            return res.status(400).json({ missatge: "La partida ja ha acabat." });
        }
        if (!lloc) return res.status(404).json({ missatge: "Lloc no trobat." });

        let imatgeReferencia = lloc.imatge_referencia;
        let imatgePuntMissio = null;
        let fotoHistorica = '';
        let textHistoric = '';
        let puntTrobat = false;
        let nomPunt = lloc.nom;
        if (idPunt) {
            for (let i = 0; i < lloc.punts_missio.length; i++) {
                const p = lloc.punts_missio[i];
                if (p._id.toString() === idPunt.toString()) {
                    puntTrobat = true;
                    nomPunt = p.nom_punt;
                    if (p.imatge_referencia) {
                        imatgePuntMissio = p.imatge_referencia;
                        imatgeReferencia = p.imatge_referencia;
                        console.log(`[Càmera] Punt trobat: "${p.nom_punt}" | imatge: ${imatgeReferencia}`);
                    } else {
                        console.log(`[Càmera] Punt "${p.nom_punt}" NO té imatge_referencia pròpia → usant la del lloc`);
                    }
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

        let bufferRef;
        if (imatgeReferencia.startsWith('http://') || imatgeReferencia.startsWith('https://')) {
            const response = await fetch(imatgeReferencia);
            if (!response.ok) {
                return res.status(500).json({ missatge: "Error en descarregar la imatge externa." });
            }
            const arrayBuffer = await response.arrayBuffer();
            bufferRef = Buffer.from(arrayBuffer);
        } else {
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

        const carpetaUsuari = path.dirname(camiUsuari);
        if (!fs.existsSync(carpetaUsuari)) {
            fs.mkdirSync(carpetaUsuari, { recursive: true });
        }
        const dadesNetes = imatge.replace(/^data:image\/.*;base64,/, "");
        const bufferUsuari = Buffer.from(dadesNetes, 'base64');
        fs.writeFileSync(camiUsuari, bufferUsuari);

        let similitud = 0;
        let tensorUsuari, tensorRef, caracteristiquesUsuari, caracteristiquesRef;
        try {
            const bufferUsuariJpeg = await sharp(bufferUsuari).jpeg().toBuffer();
            const bufferRefJpeg = await sharp(bufferRef).jpeg().toBuffer();

            tensorUsuari = tf.node.decodeImage(bufferUsuariJpeg, 3);
            tensorRef = tf.node.decodeImage(bufferRefJpeg, 3);

            caracteristiquesUsuari = modelMobileNet.infer(tensorUsuari, true);
            caracteristiquesRef = modelMobileNet.infer(tensorRef, true);

            const similitudDecimal = calcularSimilitudCosinus(caracteristiquesUsuari, caracteristiquesRef);
            similitud = Math.max(0, similitudDecimal) * 100;
        } catch (errorIA) {
            console.error("[IA] Error durant el processament d'imatges amb TensorFlow:", errorIA);
            return res.status(500).json({ missatge: "Error en el processament d'imatges amb TensorFlow." });
        } finally {
            if (tensorUsuari) tensorUsuari.dispose();
            if (tensorRef) tensorRef.dispose();
            if (caracteristiquesUsuari) caracteristiquesUsuari.dispose();
            if (caracteristiquesRef) caracteristiquesRef.dispose();
        }

        console.log(`[Càmera IA] IdLloc: ${idLloc} | Similitud: ${similitud.toFixed(2)}%`);

        try {
            // Evaluació de superació del llindar de precisió
            if (similitud >= 35) {
                let jugador = null;
                for (let i = 0; i < sessio.jugadors.length; i++) {
                    if (sessio.jugadors[i].id_usuari.toString() === perfilId) {
                        jugador = sessio.jugadors[i];
                        break;
                    }
                }
                if (!jugador) return res.status(404).json({ missatge: "Jugador no trobat a la sessió." });

                // Validació de l'estat temporal de la sessió
                const ara = new Date();
                const limitGlobal = sessio.temps_limit ? new Date(sessio.temps_limit) : null;
                const limitIndividual = jugador.temps_limit ? new Date(jugador.temps_limit) : limitGlobal;

                if ((limitGlobal && ara > limitGlobal) || (limitIndividual && ara > limitIndividual)) {
                    console.log(`[Càmera] TEMPS ESGOTAT per a ${perfilId}. Refusant validació.`);
                    if (sessio.estat === 'jugant') {
                        sessio.estat = 'finalitzada';
                        await sessio.save();
                        await notifyGameOver(sessio._id, sessio, 'timeout', null);
                    }
                    return res.status(400).json({ missatge: "S'ha acabat el temps! No pots fer més fotos." });
                }

                const puntAMarcar = idPunt || idLloc;

                console.log(`[Càmera] idPunt rebut: ${idPunt}`);
                console.log(`[Càmera] id_puntos_de_la_partida de la sessió:`, sessio.id_puntos_de_la_partida.map(p => p.toString()));
                console.log(`[Càmera] puntAMarcar triat: ${puntAMarcar}`);
                console.log(`[Càmera] punts_completats ABANS:`, jugador.punts_completats.map(p => p.toString()));

                let jaComplet = false;
                for (let i = 0; i < jugador.punts_completats.length; i++) {
                    if (jugador.punts_completats[i].toString() === puntAMarcar.toString()) {
                        jaComplet = true;
                        break;
                    }
                }

                if (!jaComplet) {
                    jugador.punts_completats.push(puntAMarcar);

                    // Emissió d'esdeveniment via WebSockets per a actualització en temps real
                    const perfilInfo = await Perfil.findById(perfilId).select('nom_usuari');
                    const nomUsuari = perfilInfo ? perfilInfo.nom_usuari : 'Un jugador';
                    notifyPointAchieved(sessio, nomUsuari, nomPunt, puntAMarcar);

                    const segons = Math.floor((new Date() - sessio.temps_inici) / 1000);
                    jugador.temps = segons.toString();

                    const totalFetes = jugador.punts_completats.length;
                    jugador.exactitud_media = ((jugador.exactitud_media * (totalFetes - 1)) + similitud) / totalFetes;
                }

                console.log(`[Càmera] punts_completats DESPRÉS:`, jugador.punts_completats.map(p => p.toString()));

                const totalPuntsPartida = (jugador.punts_assignats && jugador.punts_assignats.length > 0)
                    ? jugador.punts_assignats.length
                    : (sessio.id_puntos_de_la_partida.length || lloc.punts_missio.length);
                const haAcabatLaLlista = jugador.punts_completats.length >= totalPuntsPartida;

                console.log(`[Càmera] Total punts partida: ${totalPuntsPartida} | Completats: ${jugador.punts_completats.length} | Acabat: ${haAcabatLaLlista}`);
                let medalla = null;
                let perfil = null;

                let cromo_nou = false;

                if (haAcabatLaLlista) {
                    let completatsAbans = 0;
                    for (let i = 0; i < sessio.jugadors.length; i++) {
                        if (sessio.jugadors[i].completat) completatsAbans++;
                    }
                    const esElGuanyador = completatsAbans === 0;
                    medalla = completatsAbans === 0 ? "Or" : completatsAbans === 1 ? "Plata" : "Bronze";

                    jugador.completat = true;
                    sessio.estat = 'finalitzada';

                    let guanyadors = 0;
                    for (let i = 0; i < sessio.jugadors.length; i++) {
                        if (sessio.jugadors[i].completat) guanyadors++;
                    }
                    medalla = guanyadors === 1 ? "Or" : guanyadors === 2 ? "Plata" : "Bronze";

                    // Generació de recompenses i assignació de cromos segons resultats de la partida
                    if (esElGuanyador) {
                        perfil = await Perfil.findById(perfilId);

                        if (sessio.tipus_partida === 'individual') {
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
                            const guanyadorGrupId = jugador.grup_id;

                            for (let i = 0; i < sessio.jugadors.length; i++) {
                                const j = sessio.jugadors[i];

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

                if (haAcabatLaLlista) {
                    const nomGuanyador = perfil ? perfil.nom_usuari : 'Un jugador';
                    console.log(`[Càmera] Ruta completada! Cromo assignat: "${lloc.cromo_imatge}"`);
                    await notifyGameOver(codi_sala, sessio, perfilId, nomGuanyador, jugador.grup_id);
                }

                return res.json({
                    exit: true,
                    completat_tot: haAcabatLaLlista,
                    rango: medalla,
                    cromo_nou: cromo_nou,
                    coincidencia: similitud.toFixed(2) + "%",
                    nom_lloc: lloc.nom,
                    imatge_punt: imatgePuntMissio || imatgeReferencia,
                    imatge_historica: imatgeReferencia,
                    imatge_cromo: lloc.cromo_imatge || '',
                    foto_historica: fotoHistorica,
                    text_historic: textHistoric,
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
            console.error("[Joc] Error en guardar la partida o notificar jugadors:", errorJoc);
            return res.status(500).json({ missatge: "Error en guardar el progrés de la partida." });
        }
    } catch (err) {
        console.error("Error buscant el lloc:", err);
        res.status(500).json({ missatge: "Error de servidor al buscar el lloc." });
    }
});

module.exports = router;