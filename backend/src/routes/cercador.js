const express = require('express');
const router = express.Router();

const { Lloc } = require('../models');

// Obtener todos los lugares
router.get('/', async (req, res) => {
    try {
        const llocs = await Lloc.find();
        res.json(llocs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/aleatori', async (req, res) => {
    try {
        const count = await Lloc.countDocuments();
        const random = Math.floor(Math.random() * count);
        const llocAleatori = await Lloc.findOne().skip(random);
        res.json(llocAleatori);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;