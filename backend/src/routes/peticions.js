const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('peticions_rutes');
        const { nom_proposat, motiu, ubicacio, fotos_proporcionades, id_usuari } = req.body;

        if (!id_usuari) {
            return res.status(401).json({ message: "Has d'estar loguejat per fer aquesta acció." });
        }

        const nuevaPeticion = {
            nom_proposat: nom_proposat,
            motiu: motiu,
            ubicacio: ubicacio || [],
            fotos_proporcionades: fotos_proporcionades ? [fotos_proporcionades] : [],
            estat_validacio: "pendent",
            id_usuari: id_usuari,
            data_creacio: new Date()
        };

        const resultado = await collection.insertOne(nuevaPeticion);

        res.status(201).json({
            message: "Petició guardada correctament!",
            id: resultado.insertedId
        });

    } catch (error) {
        console.error("Error guardant la petició:", error);
        res.status(500).json({ message: "Error del servidor." });
    }
});

module.exports = router;