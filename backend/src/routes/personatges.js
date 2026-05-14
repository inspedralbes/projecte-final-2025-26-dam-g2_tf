const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Personatge } = require('../models/index');

const CARPETA_IMATGES = path.join(__dirname, '../../public/personatges');

if (!fs.existsSync(CARPETA_IMATGES)) {
    fs.mkdirSync(CARPETA_IMATGES, { recursive: true });
}

// GET /personatges: Retorna el llistat complet de personatges ordenats descendentment per la data de creació.
router.get('/', async function (req, res) {
    try {
        const personatges = await Personatge.find({}).sort({ data_creacio: -1 });
        res.json(personatges);
    } catch (error) {
        console.error('[Personatges] Error en carregar:', error);
        res.status(500).json({ message: 'Error al carregar els personatges' });
    }
});

// GET /personatges/:id: Retorna el document d'un personatge específic a partir del seu identificador.
router.get('/:id', async function (req, res) {
    try {
        const personatge = await Personatge.findById(req.params.id);
        if (!personatge) return res.status(404).json({ message: 'Personatge no trobat' });
        res.json(personatge);
    } catch (error) {
        res.status(500).json({ message: 'Error al carregar el personatge' });
    }
});

// POST /personatges: Genera una instància de personatge, descodifica la imatge en format base64 i l'emmagatzema al directori públic.
router.post('/', async function (req, res) {
    try {
        const { nom, descripcio, imatge_base64 } = req.body;

        if (!nom) {
            return res.status(400).json({ message: 'El nom del personatge és obligatori' });
        }

        let rutaImatge = '';

        if (imatge_base64) {
            const nomFitxer = 'personatge_' + Date.now() + '.jpg';
            const rutaFitxer = path.join(CARPETA_IMATGES, nomFitxer);

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

// PUT /personatges/:id: Actualitza els atributs d'un personatge, gestionant la substitució d'imatge si es proporciona una nova cadena base64.
router.put('/:id', async function (req, res) {
    try {
        const { nom, descripcio, imatge_base64 } = req.body;
        const update = {};

        if (nom) update.nom = nom;
        if (descripcio !== undefined) update.descripcio = descripcio;

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

// DELETE /personatges/:id: Suprimeix un document de personatge i elimina el seu fitxer d'imatge associat del sistema d'arxius.
router.delete('/:id', async function (req, res) {
    try {
        const personatge = await Personatge.findByIdAndDelete(req.params.id);
        if (!personatge) return res.status(404).json({ message: 'Personatge no trobat' });

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
