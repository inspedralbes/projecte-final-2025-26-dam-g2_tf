const express = require('express');
const router = express.Router();
const { Lloc } = require('../models/index');

// 1. Obtenir tots els llocs (Punts del mapa)
router.get('/punts', async (req, res) => {
    try {

        const llocs = await Lloc.find({}).sort({ ordre: 1 }).populate('punts_missio.personatge_id');
        res.json(llocs);
    } catch (error) {
        console.error("Error al carregar punts:", error);
        res.status(500).json({ error: "Error al carregar les rutes" });
    }
});

// 2. Obtenir un sol lloc per ID
router.get('/punts/:id', async (req, res) => {
    try {
        const lloc = await Lloc.findById(req.params.id).populate('punts_missio.personatge_id');

        if (!lloc) {
            return res.status(404).json({ error: "Lloc no trobat" });
        }

        res.json(lloc);
    } catch (error) {
        console.error("Error al buscar el punt:", error);
        res.status(500).json({ error: "ID no vàlid o error al servidor" });
    }
});

// 3. CREAR un nou lloc
router.post('/punts', async (req, res) => {
    try {
        const nouLloc = new Lloc(req.body);
        await nouLloc.save();
        res.status(201).json(nouLloc);
    } catch (error) {
        console.error("Error al crear:", error);
        res.status(400).json({ error: "No s'ha pogut crear el lloc" });
    }
});

// 4. ACTUALITZAR un lloc existent
router.put('/punts/:id', async (req, res) => {
    try {
        // Netejar camps immutables que podrien bloquejar l'actualització
        const dadesActualitzacio = { ...req.body };
        delete dadesActualitzacio._id;
        delete dadesActualitzacio.__v;

        const llocActualitzat = await Lloc.findByIdAndUpdate(
            req.params.id,
            { $set: dadesActualitzacio },
            { new: true, runValidators: true }
        ).populate('punts_missio.personatge_id');

        if (!llocActualitzat) {
            return res.status(404).json({ error: "Lloc no trobat" });
        }

        console.log(`[Mapa] Lloc ${req.params.id} actualitzat: ${llocActualitzat.punts_missio.length} punts_missio desats.`);
        res.json(llocActualitzat);
    } catch (error) {
        console.error("Error al actualitzar:", error);
        res.status(400).json({
            error: "Error al modificar les dades",
            detalls: error.message
        });
    }
});

// 5. ELIMINAR un lloc
router.delete('/punts/:id', async (req, res) => {
    try {
        await Lloc.findByIdAndDelete(req.params.id);
        res.json({ message: "Lloc eliminat correctament" });
    } catch (error) {
        res.status(500).json({ error: "No s'ha pogut eliminar" });
    }
});

// 6. Obtenir ressenyes d'un lloc
router.get('/punts/:id/ressenyes', async (req, res) => {
    try {
        const { Ressenya } = require('../models/index');
        const ressenyes = await Ressenya.find({ id_lloc: req.params.id })
            .populate('id_usuari', 'nom_usuari avatar')
            .sort({ data: -1 });
        res.json(ressenyes);
    } catch (error) {
        console.error("Error al carregar ressenyes:", error);
        res.status(500).json({ error: "Error al carregar les ressenyes" });
    }
});

module.exports = router;