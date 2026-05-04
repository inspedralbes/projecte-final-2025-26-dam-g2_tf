const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// GET /api/carta-lore/totes — llista totes les cartes de lore disponibles
router.get('/totes', function (req, res) {
    const base = path.join(__dirname, '../../public/assets/Carta_lore');

    if (!fs.existsSync(base)) {
        return res.json({ cartes: [] });
    }

    const fitxers = fs.readdirSync(base);
    const cartes = fitxers
        .filter(f => extensionsValides.includes(path.extname(f).toLowerCase()))
        .map(f => ({
            nom: f,
            path: '/assets/Carta_lore/' + f
        }));

    res.json({ cartes });
});

module.exports = router;
