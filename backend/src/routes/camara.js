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

        const nomFitxer = 'captura_' + Date.now() + '.jpg'; // Millor PNG per a la comparació
        const camiUsuari = path.join(__dirname, '../../public/fotos_partides_usuaris', nomFitxer);
        const camiReferencia = path.join(__dirname, '../../public/fotos_historiques', lloc.imatge_referencia);

        try {
            // Creem la carpeta si no existeix
            const carpetaUsuari = path.dirname(camiUsuari);
            if (!fs.existsSync(carpetaUsuari)) {
                fs.mkdirSync(carpetaUsuari, { recursive: true });
            }

            //aqui guardem la imatge que ens envia l usuari
            const dadesNetes = imatgeBase64.replace(/^data:image\/.*;base64,/, "");
            fs.writeFileSync(camiUsuari, dadesNetes, 'base64');

            /*començem el processament d'imatges amb sharp
            - les pasem a 100x100 per ignorar detalls
            - pasem a grisos
            - fem el convolve (filtre de detecció de vorerers per ignorar problemes de llum*/

            const opcionsProcessat = {
                width: 100,
                height: 100,
                kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Filtre per ressaltar línies
            };

            const bufferRef = await sharp(camiReferencia)                           // Agafa la imatge original i la transforma 
                .resize(opcionsProcessat.width, opcionsProcessat.height)            //en numeros que sharp pugui comparar
                .greyscale()
                .convolve({
                    width: 3,
                    height: 3,
                    kernel: opcionsProcessat.kernel
                })
                .raw()
                .toBuffer();

            const bufferUsuari = await sharp(camiUsuari)
                .resize(opcionsProcessat.width, opcionsProcessat.height)
                .greyscale()
                .convolve({
                    width: 3,
                    height: 3,
                    kernel: opcionsProcessat.kernel
                })
                .raw()
                .toBuffer();

            let diferenciaAcumulada = 0;
            for (let i = 0; i < bufferRef.length; i++) {
                diferenciaAcumulada += Math.abs(bufferRef[i] - bufferUsuari[i]);
            }

            // El valor màxim de diferència seria 100x100 píxels * 255 (valor màxim d'un píxel)
            const maxDiferencia = 100 * 100 * 255;
            const similitud = (1 - (diferenciaAcumulada / maxDiferencia)) * 100;

            console.log(`[Càmera] IdLloc: ${idLloc} | Similitud: ${similitud.toFixed(2)}%`);

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
                    missatge: "No coincideix prou. Revisa l'angle."
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