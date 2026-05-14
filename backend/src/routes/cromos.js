const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// GET /cromos/totes: Obté un llistat dels fitxers d'imatge vàlids disponibles al directori local de cromos.
router.get('/totes', function (req, res) {
    let base = path.join(__dirname, '../../public/Cromos');

    if (!fs.existsSync(base)) {
        base = path.join(__dirname, '../../public/cromos');
    }

    if (!fs.existsSync(base)) {
        return res.json({ cromos: [] });
    }

    const dirName = path.basename(base);
    const fitxers = fs.readdirSync(base);
    const cromos = fitxers
        .filter(f => extensionsValides.includes(path.extname(f).toLowerCase()))
        .map(f => ({
            nom: f,
            path: `/${dirName}/` + f
        }));

    res.json({ cromos });
});

module.exports = router;
