const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Lloc } = require('../models');

router.post('/', async function (req, res) {
    const imatgeBase64 = req.body.imatge;
    const idLloc = req.body.idLloc;

    if (!idLloc) {
        return res.status(400).json({ missatge: "Falta l'ID del lloc." });
    }

    try {
        const lloc = await Lloc.findById(idLloc);
        if (!lloc || !lloc.imatge_referencia) {
            return res.status(404).json({ missatge: "No s'ha trobat la imatge de referència." });
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

            // Guardem la imatge de l'usuari
            const dadesNetes = imatgeBase64.replace(/^data:image\/.*;base64,/, "");
            fs.writeFileSync(camiUsuari, dadesNetes, 'base64');

            /* ==============================================================
               NOU MOTOR DE COMPARACIÓ: dHash (Difference Hash Perceptual)
               ============================================================== */

            // Funció per generar la "petjada digital" (hash) de la imatge
            const calcularDHash = async (imatgePathOrBuffer) => {
                // 1. Reduïm la imatge a una quadrícula minúscula de 9x8 píxels.
                // Això elimina tot el soroll, fons complexos i problemes d'enfocament.
                const buffer = await sharp(imatgePathOrBuffer)
                    .resize({ width: 9, height: 8, fit: 'fill' })
                    .greyscale() // Llevem el color
                    .raw()
                    .toBuffer();

                let hash = '';
                // 2. Comparem cada píxel amb el de la seva dreta per veure on hi ha canvis de llum
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        const pixelEsquerra = buffer[y * 9 + x];
                        const pixelDreta = buffer[y * 9 + (x + 1)];
                        // Si l'esquerra és més brillant que la dreta, posem un '1', si no, un '0'
                        hash += pixelEsquerra > pixelDreta ? '1' : '0';
                    }
                }
                return hash; // Retorna un string de 64 uns i zeros (ex: "10110010...")
            };

            // Calculem les petjades d'ambdues imatges
            const hashRef = await calcularDHash(inputRef);
            const hashUsuari = await calcularDHash(camiUsuari);

            // 3. Comparem els dos hash (Distància de Hamming)
            let diferencies = 0;
            for (let i = 0; i < 64; i++) {
                if (hashRef[i] !== hashUsuari[i]) {
                    diferencies++;
                }
            }

            // 4. Calculem el percentatge (0 diferències = 100% iguals)
            const similitud = ((64 - diferencies) / 64) * 100;

            console.log(`[Càmera - Nou Motor dHash] IdLloc: ${idLloc} | Similitud: ${similitud.toFixed(2)}%`);

            // Per dHash, una similitud > 70% ja indica que és clarament la mateixa foto/edifici
            const LIMIT_VICTORIA = 70;

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
                    missatge: "No s'assembla prou. Intenta quadrar millor l'objectiu."
                });
            }

        } catch (error) {
            console.error("Error al processar imatges:", error);
            res.status(500).json({ missatge: "Error intern processant la foto." });
        }
    } catch (err) {
        console.error("Error global:", err);
        res.status(500).json({ missatge: "Error al servidor." });
    }
});

module.exports = router;