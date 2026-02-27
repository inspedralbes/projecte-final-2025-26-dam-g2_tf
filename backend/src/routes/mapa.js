const express = require('express');
const router = express.Router();
const { Lloc } = require('../models/index');

// 1. Obtenir tots els llocs (Punts del mapa)
router.get('/punts', async (req, res) => {
    try {

        const llocs = await Lloc.find({});
        res.json(llocs);
    } catch (error) {
        console.error("Error al carregar punts:", error);
        res.status(500).json({ error: "Error al carregar les rutes" });
    }
});

// 2. Obtenir un sol lloc per ID
router.get('/punts/:id', async (req, res) => {
    try {
        const lloc = await Lloc.findById(req.params.id);

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
        // Usem $set per assegurar que Mongoose desa correctament els subdocuments
        // i generi _id per a cada punt_missio nou
        const llocActualitzat = await Lloc.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!llocActualitzat) {
            return res.status(404).json({ error: "Lloc no trobat" });
        }

        console.log(`[Mapa] Lloc ${req.params.id} actualitzat: ${llocActualitzat.punts_missio.length} punts_missio desats.`);
        res.json(llocActualitzat);
    } catch (error) {
        console.error("Error al actualitzar:", error);
        res.status(400).json({ error: "Error al modificar les dades" });
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

module.exports = router;