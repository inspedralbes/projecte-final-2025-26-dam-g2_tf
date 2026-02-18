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

module.exports = router;