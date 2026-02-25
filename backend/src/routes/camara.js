const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc } = require('../models');

router.post('/', async function (req, res) {
    const imatgeBase64 = req.body.imatge;
    const idLloc = req.body.idLloc; // Necessitem rebre quin lloc és per buscar la referència

    if (!idLloc) {
        return res.status(400).json({ missatge: "Falta l'ID del lloc." });
    }

    try {
        const lloc = await Lloc.findById(idLloc);
        if (!lloc || !lloc.imatge_referencia) {
            return res.status(404).json({ missatge: "No s'ha trobat la imatge de referència per a aquest lloc." });
        }

        const nomFitxer = 'captura_' + Date.now() + '.jpg';
        const camiUsuari = path.join(__dirname, '../../public/fotos_partides_usuaris', nomFitxer);

        let inputRef;
        if (lloc.imatge_referencia.startsWith('http://') || lloc.imatge_referencia.startsWith('https://')) {
            const response = await fetch(lloc.imatge_referencia);
            if (!response.ok) {
                return res.status(500).json({ missatge: "No s'ha pogut descarregar la imatge de referència externa." });
            }
            const arrayBuffer = await response.arrayBuffer();
            inputRef = Buffer.from(arrayBuffer);
        } else {
            inputRef = path.join(__dirname, '../../public/fotos_historiques', lloc.imatge_referencia);
        }

        try {
            const carpetaUsuari = path.dirname(camiUsuari);
            if (!fs.existsSync(carpetaUsuari)) {
                fs.mkdirSync(carpetaUsuari, { recursive: true });
            }

            // Aquí guardem la imatge que ens envia l'usuari des del Vue
            const dadesNetes = imatgeBase64.replace(/^data:image\/.*;base64,/, "");
            fs.writeFileSync(camiUsuari, dadesNetes, 'base64');

            /* COMENÇA EL PROCESSAMENT D'IMATGES (Versió Permissiva) */
            const processarImatge = async (imatgePathOrBuffer) => {
                return await sharp(imatgePathOrBuffer)
                    // 1. Baixem la resolució a 50x50 i ignorem les proporcions (aixafen la imatge en un quadrat)
                    .resize({ width: 50, height: 50, fit: 'ignore' })
                    .greyscale() // 2. Traiem el color
                    .normalize() // 3. Igualem el contrast i la llum
                    .convolve({
                        width: 3,
                        height: 3,
                        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // 4. Extraiem les línies (vores)
                    })
                    // 5. BLUR MOLT FORT: fa que les línies s'expandeixin i perdonin el mal pols
                    .blur(3)
                    .raw()
                    .toBuffer();
            };

            const bufferRef = await processarImatge(inputRef);
            const bufferUsuari = await processarImatge(camiUsuari);

            let liniesCoincidents = 0;
            let liniesTotals = 0;
            // Baixem el llindar perquè el blur difumina molt els blancs
            const UMBRAL = 25;

            for (let i = 0; i < bufferRef.length; i++) {
                const esLiniaRef = bufferRef[i] > UMBRAL;
                const esLiniaUsuari = bufferUsuari[i] > UMBRAL;

                if (esLiniaRef || esLiniaUsuari) {
                    liniesTotals++;
                }
                // Només suma si les línies grosses de les dues fotos es toquen
                if (esLiniaRef && esLiniaUsuari) {
                    liniesCoincidents++;
                }
            }

            let similitud = 0;
            if (liniesTotals > 0) {
                similitud = (liniesCoincidents / liniesTotals) * 100;
            }

            // --- AQUESTA LÍNIA ÉS LA MÉS IMPORTANT PER A LES TEVES PROVES ---
            console.log(`[Càmera] IdLloc: ${idLloc} | Similitud real detectada: ${similitud.toFixed(2)}%`);
            // ----------------------------------------------------------------

            // Posem l'exigència súper baixa (10%) per fer proves.
            if (similitud >= 10) {
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
                    missatge: "La forma no encaixa prou. Revisa l'angle."
                });
            }

        } catch (error) {
            console.error("Error al backend:", error);
            res.status(500).json({ missatge: "Error en el processament d'imatges." });
        }
    } catch (err) {
        console.error("Error buscant el lloc:", err);
        res.status(500).json({ missatge: "Error de servidor al buscar el lloc." });
    }
});

module.exports = router;