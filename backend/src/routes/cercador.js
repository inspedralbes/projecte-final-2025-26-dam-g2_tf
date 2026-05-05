const express = require('express');
const router = express.Router();

const { Lloc, Ressenya } = require('../models');

// Obtener todos los lugares
router.get('/', async (req, res) => {
    try {
        const llocs = await Lloc.find({ 'control_horari.actiu': true }).lean();
        
        // Calcular medias de ressenyes
        const ressenyesAgregades = await Ressenya.aggregate([
            {
                $group: {
                    _id: "$id_lloc",
                    mitjana_estrelles: { $avg: "$estrelles" },
                    total_ressenyes: { $sum: 1 }
                }
            }
        ]);

        const llocsAmbMitjana = llocs.map(lloc => {
            const stats = ressenyesAgregades.find(r => r._id && r._id.toString() === lloc._id.toString());
            return {
                ...lloc,
                mitjana_estrelles: stats ? Math.round(stats.mitjana_estrelles * 10) / 10 : null,
                total_ressenyes: stats ? stats.total_ressenyes : 0
            };
        });

        res.json(llocsAmbMitjana);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/aleatori', async (req, res) => {
    try {
        const filter = { 'control_horari.actiu': true };
        const count = await Lloc.countDocuments(filter);
        const random = Math.floor(Math.random() * count);
        const llocAleatori = await Lloc.findOne(filter).skip(random);
        res.json(llocAleatori);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;