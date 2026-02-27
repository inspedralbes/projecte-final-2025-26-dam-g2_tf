const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// filtra un array de noms de fitxer i retorna només les imatges
function filtrarImagenes(fitxers) {
    const resultat = [];
    for (let i = 0; i < fitxers.length; i++) {
        const extensio = path.extname(fitxers[i]).toLowerCase();
        if (extensionsValides.includes(extensio)) {
            resultat.push(fitxers[i]);
        }
    }
    return resultat;
}

// llista fotos a l'arrel de fotos_actuals
router.get('/', function (req, res) {
    const carpeta = path.join(__dirname, '../../public/fotos_actuals');

    if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true });
        return res.json({ fotos: [] });
    }

    const fitxers = fs.readdirSync(carpeta);
    const imatges = filtrarImagenes(fitxers);
    res.json({ fotos: imatges });
});

//retorna totes les fotos de totes les subcarpetes
router.get('/totes', function (req, res) {
    const base = path.join(__dirname, '../../public/fotos_actuals');

    if (!fs.existsSync(base)) {
        return res.json({ fotos: [] });
    }

    const resultat = [];

    const items = fs.readdirSync(base);

    const carpetes = [];
    for (let i = 0; i < items.length; i++) {
        const rutaCompleta = path.join(base, items[i]);
        if (fs.statSync(rutaCompleta).isDirectory()) {
            carpetes.push(items[i]);
        }
    }

    // 3. Per cada subcarpeta, llegim les imatges que conté
    for (let j = 0; j < carpetes.length; j++) {
        const nomCarpeta = carpetes[j];
        const fitxers = fs.readdirSync(path.join(base, nomCarpeta));
        const imatges = filtrarImagenes(fitxers);

        // 4. Afegim cada imatge al resultat amb el seu nom, carpeta i ruta
        for (let k = 0; k < imatges.length; k++) {
            resultat.push({
                nom: imatges[k],
                carpeta: nomCarpeta,
                path: '/fotos_actuals/' + nomCarpeta + '/' + imatges[k]
            });
        }
    }

    res.json({ fotos: resultat });
});

// GET /api/fotos-actuals/:carpeta — fotos d'una subcarpeta concreta
router.get('/:carpeta', function (req, res) {
    const subcarpeta = path.join(__dirname, '../../public/fotos_actuals', req.params.carpeta);

    if (!fs.existsSync(subcarpeta)) {
        return res.json({ fotos: [] });
    }

    const fitxers = fs.readdirSync(subcarpeta);
    const imatges = filtrarImagenes(fitxers);
    res.json({ fotos: imatges });
});

module.exports = router;
