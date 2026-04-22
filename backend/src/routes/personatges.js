const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Personatge } = require('../models/index');

// Carpeta on es guardaran les imatges dels personatges
const CARPETA_IMATGES = path.join(__dirname, '../../public/personatges');

// Creem la carpeta si no existeix
if (!fs.existsSync(CARPETA_IMATGES)) {
    fs.mkdirSync(CARPETA_IMATGES, { recursive: true });
}

// GET /api/personatges — llista tots els personatges
router.get('/', async function (req, res) {
    try {
        const personatges = await Personatge.find({}).sort({ data_creacio: -1 });
        res.json(personatges);
    } catch (error) {
        console.error('[Personatges] Error en carregar:', error);
        res.status(500).json({ message: 'Error al carregar els personatges' });
    }
});

// GET /api/personatges/:id — obté un personatge concret
router.get('/:id', async function (req, res) {
    try {
        const personatge = await Personatge.findById(req.params.id);
        if (!personatge) return res.status(404).json({ message: 'Personatge no trobat' });
        res.json(personatge);
    } catch (error) {
        res.status(500).json({ message: 'Error al carregar el personatge' });
    }
});

// POST /api/personatges — crea un nou personatge (amb imatge en base64)
router.post('/', async function (req, res) {
    try {
        const { nom, descripcio, imatge_base64 } = req.body;

        if (!nom) {
            return res.status(400).json({ message: 'El nom del personatge és obligatori' });
        }

        let rutaImatge = '';

        // Si ens envien una imatge en base64, la guardem al disc
        if (imatge_base64) {
            const nomFitxer = 'personatge_' + Date.now() + '.jpg';
            const rutaFitxer = path.join(CARPETA_IMATGES, nomFitxer);

            // Netegem el prefix del base64 (ex: "data:image/jpeg;base64,")
            const dadesNetes = imatge_base64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(dadesNetes, 'base64');
            fs.writeFileSync(rutaFitxer, buffer);

            rutaImatge = '/personatges/' + nomFitxer;
        }

        const nouPersonatge = new Personatge({
            nom,
            descripcio: descripcio || '',
            imatge: rutaImatge
        });

        await nouPersonatge.save();
        res.status(201).json({ success: true, personatge: nouPersonatge });
    } catch (error) {
        console.error('[Personatges] Error en crear:', error);
        res.status(500).json({ message: 'Error al crear el personatge' });
    }
});

// PUT /api/personatges/:id — actualitza un personatge
router.put('/:id', async function (req, res) {
    try {
        const { nom, descripcio, imatge_base64 } = req.body;
        const update = {};

        if (nom) update.nom = nom;
        if (descripcio !== undefined) update.descripcio = descripcio;

        // Si envien nova imatge base64, la guardem i actualitzem la ruta
        if (imatge_base64) {
            const nomFitxer = 'personatge_' + Date.now() + '.jpg';
            const rutaFitxer = path.join(CARPETA_IMATGES, nomFitxer);
            const dadesNetes = imatge_base64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(dadesNetes, 'base64');
            fs.writeFileSync(rutaFitxer, buffer);
            update.imatge = '/personatges/' + nomFitxer;
        }

        const personatgeActualitzat = await Personatge.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );

        if (!personatgeActualitzat) {
            return res.status(404).json({ message: 'Personatge no trobat' });
        }

        res.json({ success: true, personatge: personatgeActualitzat });
    } catch (error) {
        console.error('[Personatges] Error en actualitzar:', error);
        res.status(500).json({ message: 'Error al actualitzar el personatge' });
    }
});

// DELETE /api/personatges/:id — elimina un personatge
router.delete('/:id', async function (req, res) {
    try {
        const personatge = await Personatge.findByIdAndDelete(req.params.id);
        if (!personatge) return res.status(404).json({ message: 'Personatge no trobat' });

        // Eliminem la imatge del disc si existeix
        if (personatge.imatge) {
            const rutaFitxer = path.join(__dirname, '../../public', personatge.imatge);
            if (fs.existsSync(rutaFitxer)) {
                fs.unlinkSync(rutaFitxer);
            }
        }

        res.json({ success: true, message: 'Personatge eliminat correctament' });
    } catch (error) {
        console.error('[Personatges] Error en eliminar:', error);
        res.status(500).json({ message: 'Error al eliminar el personatge' });
    }
});

module.exports = router;
