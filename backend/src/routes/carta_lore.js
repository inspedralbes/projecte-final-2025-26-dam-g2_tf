const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// GET /carta-lore/totes: Obté un llistat dels fitxers d'imatge vàlids disponibles al directori local de cartes de lore.
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
