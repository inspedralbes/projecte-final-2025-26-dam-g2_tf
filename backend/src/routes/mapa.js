const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Lloc } = require('../models/index');

// GET /mapa/punts: Retorna el llistat complet de localitzacions ordenat per la propietat 'ordre', incloent els personatges associats.
router.get('/punts', async (req, res) => {
    try {

        const llocs = await Lloc.find({}).sort({ ordre: 1 }).populate('punts_missio.personatge_id');
        res.json(llocs);
    } catch (error) {
        console.error("Error al carregar punts:", error);
        res.status(500).json({ error: "Error al carregar les rutes" });
    }
});

// GET /mapa/punts/:id: Retorna el document complet d'una localització específica mitjançant el seu ObjectId.
router.get('/punts/:id', async (req, res) => {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID no vàlid" });
        }
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

// POST /mapa/punts: Crea una nova localització al sistema amb les dades proporcionades al cos de la petició.
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

// PUT /mapa/punts/:id: Actualitza els atributs d'una localització existent aplicant restriccions per protegir els camps immutables.
router.put('/punts/:id', async (req, res) => {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID no vàlid" });
        }
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

// DELETE /mapa/punts/:id: Elimina permanentment una localització del sistema a partir del seu ObjectId.
router.delete('/punts/:id', async (req, res) => {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID no vàlid" });
        }
        await Lloc.findByIdAndDelete(req.params.id);
        res.json({ message: "Lloc eliminat correctament" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No s'ha pogut eliminar" });
    }
});

// GET /mapa/punts/:id/ressenyes: Llista cronològicament les ressenyes associades a una localització, incloent dades del perfil d'usuari.
router.get('/punts/:id/ressenyes', async (req, res) => {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID no vàlid" });
        }
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