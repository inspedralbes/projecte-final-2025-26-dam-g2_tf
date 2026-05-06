const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// GET /api/cromos/totes — llista tots els cromos disponibles
router.get('/totes', function (req, res) {
    let base = path.join(__dirname, '../../public/Cromos');

    if (!fs.existsSync(base)) {
        base = path.join(__dirname, '../../public/cromos');
    }

    if (!fs.existsSync(base)) {
        console.error("Directori de cromos no trobat en cap variant (Cromos/cromos):", base);
        return res.json({ cromos: [], error: "Directori no trobat", searchedPath: base });
    }

    const dirName = path.basename(base);
    const fitxers = fs.readdirSync(base);
    const cromos = fitxers
        .filter(f => extensionsValides.includes(path.extname(f).toLowerCase()))
        .map(f => ({
            nom: f,
            path: `/${dirName}/` + f
        }));

    console.log(`[Cromos] S'han trobat ${cromos.length} cromos.`);
    res.json({ cromos });
});

module.exports = router;
