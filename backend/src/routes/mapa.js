const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Obtenir tots els llocs
router.get('/punts', async (req, res) => {
    try {
        const db = getDB();
        const llocs = await db.collection('locations').find({}).toArray();
        res.json(llocs);
    } catch (error) {
        res.status(500).json({ error: "Error al carregar les rutes" });
    }
});

/* Ruta per afegir 
router.post('/afegir', async (req, res) => {
    try {
        const db = getDB();
        const nouLloc = {
            nom: req.body.nom,
            ubicacio: {
                type: "Point",
                coordinates: [req.body.lng, req.body.lat] 
            },
            imatge_referencia: req.body.imatge_referencia,
            descripcio: req.body.descripcio,
            explicacio_historica: req.body.explicacio_historica,
            dificultat: req.body.dificultat,
            tags: req.body.tags || [],
            pistes: req.body.pistes || [],
            control_horari: req.body.control_horari || { actiu: true },
            millors_temps: []
        };
        await db.collection('locations').insertOne(nouLloc);
        res.status(201).json({ missatge: "Lloc creat!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});*/

// NUEVA RUTA: Obtenir un sol lloc per ID
router.get('/punts/:id', async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;
    
        const lloc = await db.collection('locations').findOne({ _id: new ObjectId(id) });

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