const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// GET /api/fotos-actuals — llista fotos a l'arrel de fotos_actuals/
router.get('/', (req, res) => {
    const carpeta = path.join(__dirname, '../../public/fotos_actuals');
    if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true });
        return res.json({ fotos: [] });
    }
    const fitxers = fs.readdirSync(carpeta).filter(f => {
        return extensionsValides.includes(path.extname(f).toLowerCase());
    });
    res.json({ fotos: fitxers });
});

// GET /api/fotos-actuals/totes — retorna TOTES les fotos de totes les subcarpetes
router.get('/totes', (req, res) => {
    const base = path.join(__dirname, '../../public/fotos_actuals');
    if (!fs.existsSync(base)) return res.json({ fotos: [] });

    const resultat = [];
    const carpetes = fs.readdirSync(base).filter(f => {
        return fs.statSync(path.join(base, f)).isDirectory();
    });

    carpetes.forEach(carpeta => {
        const fitxers = fs.readdirSync(path.join(base, carpeta)).filter(f => {
            return extensionsValides.includes(path.extname(f).toLowerCase());
        });
        fitxers.forEach(nom => {
            resultat.push({
                nom,
                carpeta,
                path: '/fotos_actuals/' + carpeta + '/' + nom
            });
        });
    });

    res.json({ fotos: resultat });
});

// GET /api/fotos-actuals/:carpeta — fotos d'una subcarpeta concreta
router.get('/:carpeta', (req, res) => {
    const subcarpeta = path.join(__dirname, '../../public/fotos_actuals', req.params.carpeta);
    if (!fs.existsSync(subcarpeta)) {
        return res.json({ fotos: [] });
    }
    const fitxers = fs.readdirSync(subcarpeta).filter(f => {
        return extensionsValides.includes(path.extname(f).toLowerCase());
    });
    res.json({ fotos: fitxers });
});

module.exports = router;
