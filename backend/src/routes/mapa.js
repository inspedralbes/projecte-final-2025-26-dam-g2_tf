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

module.exports = router;