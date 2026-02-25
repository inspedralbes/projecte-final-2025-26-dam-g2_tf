const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc } = require('../models');

router.post('/', async function (req, res) {
    const imatgeBase64 = req.body.imatge;
    const idLloc = req.body.idLloc;

    if (!idLloc) return res.status(400).json({ missatge: "Falta l'ID del lloc." });

    try {
        const lloc = await Lloc.findById(idLloc);
        if (!lloc || !lloc.imatge_referencia) {
            return res.status(404).json({ missatge: "No s'ha trobat la imatge." });
        }

        const nomFitxer = 'captura_' + Date.now() + '.jpg';
        const camiUsuari = path.join(__dirname, '../../public/fotos_partides_usuaris', nomFitxer);

        let inputRef;
        if (lloc.imatge_referencia.startsWith('http')) {
            const response = await fetch(lloc.imatge_referencia);
            if (!response.ok) throw new Error("Error descarregant imatge externa");
            inputRef = Buffer.from(await response.arrayBuffer());
        } else {
            inputRef = path.join(__dirname, '../../public/fotos_historiques', lloc.imatge_referencia);
        }

        try {
            const carpetaUsuari = path.dirname(camiUsuari);
            if (!fs.existsSync(carpetaUsuari)) fs.mkdirSync(carpetaUsuari, { recursive: true });

            const dadesNetes = imatgeBase64.replace(/^data:image\/.*;base64,/, "");
            fs.writeFileSync(camiUsuari, dadesNetes, 'base64');

            /* =========================================================
               MOTOR DEFINITIU: Comparació Zonal de Luminància (MAE)
               ========================================================= */
            const processarImatge = async (imatgePathOrBuffer) => {
                return await sharp(imatgePathOrBuffer)
                    // 1. Matriu de 32x32: Equilibri perfecte entre precisió i tolerància
                    .resize({ width: 32, height: 32, fit: 'fill' })
                    // 2. Traiem el color (només comparem formes i ombres)
                    .greyscale()
                    // 3. Normalitzem la llum perquè el dia i la nit no afectin
                    .normalize()
                    // 4. Petit desenfocament per perdonar moviments de càmera
                    .blur(1)
                    .raw()
                    .toBuffer();
            };

            const bufferRef = await processarImatge(inputRef);
            const bufferUsuari = await processarImatge(camiUsuari);

            // Calculem la Diferència Absoluta Mitjana (MAE)
            let diferenciaAcumulada = 0;
            const TOTAL_PIXELS = 32 * 32; // 1024

            for (let i = 0; i < TOTAL_PIXELS; i++) {
                diferenciaAcumulada += Math.abs(bufferRef[i] - bufferUsuari[i]);
            }

            // La màxima diferència possible és si un píxel és blanc pur (255) i l'altre negre pur (0)
            const maxDiferencia = TOTAL_PIXELS * 255;

            // Passem la diferència a percentatge de SIMILITUD
            let similitud = (1 - (diferenciaAcumulada / maxDiferencia)) * 100;

            console.log(`[Càmera - Zonal] Similitud real: ${similitud.toFixed(2)}%`);

            // Si enfoques el mateix objecte/edifici hauria de donar > 75%
            const LIMIT_VICTORIA = 75;

            if (similitud >= LIMIT_VICTORIA) {
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
                    missatge: "La foto no coincideix prou amb la històrica. Revisa l'angle i la quadrícula."
                });
            }

        } catch (error) {
            console.error("Error processant:", error);
            res.status(500).json({ missatge: "Error intern processant la foto." });
        }
    } catch (err) {
        console.error("Error global:", err);
        res.status(500).json({ missatge: "Error al servidor." });
    }
});

module.exports = router;