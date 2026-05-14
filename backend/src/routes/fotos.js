const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const extensionsValides = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Filtra una llista de noms de fitxer retornant exclusivament aquells amb extensions d'imatge vàlides.
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

// GET /fotos-actuals: Retorna els noms dels fitxers d'imatge ubicats exclusivament a l'arrel del directori.
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

// GET /fotos-actuals/totes: Recorre les subcarpetes de primer nivell i retorna totes les imatges amb la seva ruta associada.
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

    for (let j = 0; j < carpetes.length; j++) {
        const nomCarpeta = carpetes[j];
        const fitxers = fs.readdirSync(path.join(base, nomCarpeta));
        const imatges = filtrarImagenes(fitxers);

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

// GET /fotos-actuals/:carpeta: Retorna els fitxers d'imatge continguts dins d'una subcarpeta específica.
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
