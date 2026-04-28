const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function filtrarImatges(fitxers) {
    return fitxers.filter(f => extensionsValides.includes(path.extname(f).toLowerCase()));
}

// Llegeix recursivament una carpeta i retorna totes les imatges amb la seva ruta
function llegirRecursiu(baseDir, subPath, resultat) {
    const carpetaActual = path.join(baseDir, subPath);
    const items = fs.readdirSync(carpetaActual);

    for (const item of items) {
        const rutaCompleta = path.join(carpetaActual, item);
        const stat = fs.statSync(rutaCompleta);

        if (stat.isDirectory()) {
            llegirRecursiu(baseDir, path.join(subPath, item), resultat);
        } else if (extensionsValides.includes(path.extname(item).toLowerCase())) {
            const carpetaRelativa = subPath || 'arrel';
            const rutaRelativa = '/fotos_historiques/' + (subPath ? subPath + '/' : '') + item;
            resultat.push({
                nom: item,
                carpeta: carpetaRelativa,
                path: rutaRelativa.replace(/\\/g, '/')
            });
        }
    }
}

// GET /api/fotos-historiques/totes — llista totes les fotos de fotos_historiques/ i subcarpetes
router.get('/totes', function (req, res) {
    const base = path.join(__dirname, '../../public/fotos_historiques');

    if (!fs.existsSync(base)) {
        return res.json({ fotos: [] });
    }

    const resultat = [];
    llegirRecursiu(base, '', resultat);
    res.json({ fotos: resultat });
});

module.exports = router;
