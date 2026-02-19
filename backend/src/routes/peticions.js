const express = require('express');
const router = express.Router();
const { PeticioRuta } = require('../models');

router.post('/', async (req, res) => {
    try {
        const { nom_proposat, motiu, ubicacio, fotos_proporcionades, id_usuari } = req.body;

        if (!id_usuari) {
            return res.status(401).json({ message: "Has d'estar loguejat per fer aquesta acció." });
        }

        const nuevaPeticion = new PeticioRuta({
            nom_proposat,
            motiu,
            ubicacio: ubicacio || [],
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
        console.error("Error guardant la petició:", error);
        res.status(500).json({ message: "Error del servidor." });
    }
});

module.exports = router;