const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { PeticioRuta } = require('../models');

// Middleware simple: llegeix l'ID d'usuari de la capçalera X-User-Id
function verifyToken(req, res, next) {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: "Has d'enviar X-User-Id" });
    req.user = { id: userId };
    next();
}

router.get('/meves', verifyToken, async (req, res) => {
    try {
        // Validació bàsica: req.user ha d'existir
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Token invàlid o sessió caducada" });
        }
        const peticions = await PeticioRuta.find({ id_usuari: req.user.id });
        const result = peticions.map(p => ({
            _id: p._id,
            nomLloc: p.nom_proposat,
            estat: p.estat_validacio,
            dataCreacio: p.createdAt,
            motiuRebuig: p.motiuRebuig
        }));
        res.json(result);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        // Acceptem tant el format antic com el nou del frontend
        const { nomLloc, nom_proposat, latitud, longitud, ubicacio, motiu, fotos_proporcionades, id_usuari } = req.body;

        // Validació crítica: camps requerits
        const nomFinal = nomLloc || nom_proposat;
        if (!nomFinal || !id_usuari) {
            return res.status(400).json({ error: 'Faltan datos (nombre o usuario)' });
        }

        // Gestionem les coordenades (pot venir com a [lat,lng] o lat/lng separats)
        let coords = [0, 0];
        if (Array.isArray(ubicacio) && ubicacio.length === 2) {
            coords = ubicacio;
        } else if (latitud !== undefined && longitud !== undefined) {
            coords = [latitud, longitud];
        }

        const nuevaPeticion = new PeticioRuta({
            nom_proposat: nomFinal,
            motiu,
            ubicacio: coords,
            fotos_proporcionades: fotos_proporcionades ? [fotos_proporcionades] : [],
            estat_validacio: "pendent",
            id_usuari
        });

        await nuevaPeticion.save();

        res.status(201).json({
            message: "Petició guardada correctament!",
            id: nuevaPeticion._id
        });

    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Validation Error', details: error.message });
        }
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Actualitzar estat de petició (Acceptar/Rebutjar)
router.put('/:id', async (req, res) => {
    try {
        // Validació crítica de l'ID amb Mongoose
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const { estat_validacio, motiuRebuig } = req.body;
        const updateData = {};
        if (estat_validacio !== undefined) updateData.estat_validacio = estat_validacio;
        if (motiuRebuig !== undefined) updateData.motiuRebuig = motiuRebuig;

        const peticio = await PeticioRuta.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!peticio) return res.status(404).json({ message: "Petició no trobada" });

        // Si s'aprova, creem el lloc com a desactivat
        if (estat_validacio === 'aprovada') {
            const Lloc = require('../models').Lloc;
            let coordinates = [0, 0];
            if (Array.isArray(peticio.ubicacio) && peticio.ubicacio.length === 2) {
                const [lat, lng] = peticio.ubicacio;
                if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
                    coordinates = [lng, lat];
                }
            }
            // Creem el lloc amb estat: 'desactivat'
            const nouLloc = new Lloc({
                nom: peticio.nom_proposat || 'Lloc sense nom',
                descripcio: peticio.motiu || '',
                ubicacio: { type: 'Point', coordinates: coordinates },
                fotos_actuals: peticio.fotos_proporcionades || [],
                peticio_id: peticio._id,
                estat: 'desactivat',
                ordre: 0
            });
            await nouLloc.save();
        }

        res.json({ success: true, message: `Petició marcada com a ${estat_validacio}` });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;