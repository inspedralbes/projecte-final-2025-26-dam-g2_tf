const express = require('express');
const router = express.Router();
const { SessioJoc, Lloc } = require('../models');

// POST /api/sessionsJoc/crear — Crear la sessió quan l'usuari comença a jugar
router.post('/crear', async function (req, res) {
    try {
        const idLloc = req.body.idLloc;
        const perfilId = req.body.perfilId;

        if (!idLloc || !perfilId) {
            return res.status(400).json({ missatge: "Falten dades: idLloc o perfilId" });
        }

        // Carreguem el lloc per obtenir els IDs dels punts de missió
        const lloc = await Lloc.findById(idLloc);
        if (!lloc) {
            return res.status(404).json({ missatge: "Lloc no trobat" });
        }

        // Extraiem els _id dels punts de missió del lloc
        const puntsIds = [];
        for (let i = 0; i < lloc.punts_missio.length; i++) {
            puntsIds.push(lloc.punts_missio[i]._id);
        }

        const novaSessio = new SessioJoc({
            codi_sala: Math.random().toString(36).substring(2, 8).toUpperCase(),
            tipus_partida: 'individual',
            estat: 'jugant',
            id_lloc_desti: idLloc,
            id_puntos_de_la_partida: puntsIds,
            jugadors: [{
                id_usuari: perfilId,
                puntsPartida: 0,
                completat: false,
                punts_completats: [],
                exactitud_media: 0,
                temps: "0"
            }],
            temps_inici: new Date()
        });

        await novaSessio.save();
        res.status(201).json(novaSessio);

    } catch (error) {
        console.error("Error al crear la sessió:", error);
        res.status(500).json({ missatge: "Error al crear la sessió: " + error.message });
    }
});

// POST /api/sessionsJoc/crear-grup — Crear sessió per a un grup (cridat per gameSocket)
router.post('/crear-grup', async function (req, res) {
    try {
        const idLloc = req.body.idLloc;
        const jugadors = req.body.jugadors; // Array de perfilIds

        if (!idLloc || !jugadors || jugadors.length === 0) {
            return res.status(400).json({ missatge: "Falten dades: idLloc o jugadors" });
        }

        // Carreguem el lloc per obtenir els IDs dels punts de missió
        const lloc = await Lloc.findById(idLloc);
        if (!lloc) {
            return res.status(404).json({ missatge: "Lloc no trobat" });
        }

        // Extraiem els _id dels punts de missió
        const puntsIds = [];
        for (let i = 0; i < lloc.punts_missio.length; i++) {
            puntsIds.push(lloc.punts_missio[i]._id);
        }

        // Construïm l'array de jugadors per a la sessió
        const jugadorsDB = [];
        for (let i = 0; i < jugadors.length; i++) {
            jugadorsDB.push({
                id_usuari: jugadors[i],
                puntsPartida: 0,
                completat: false,
                punts_completats: [],
                exactitud_media: 0,
                temps: "0"
            });
        }

        const novaSessio = new SessioJoc({
            codi_sala: Math.random().toString(36).substring(2, 8).toUpperCase(),
            tipus_partida: 'grup',
            estat: 'jugant',
            id_lloc_desti: idLloc,
            id_puntos_de_la_partida: puntsIds,
            jugadors: jugadorsDB,
            temps_inici: new Date()
        });

        await novaSessio.save();
        res.status(201).json(novaSessio);

    } catch (error) {
        console.error("Error al crear la sessió de grup:", error);
        res.status(500).json({ missatge: "Error al crear la sessió de grup: " + error.message });
    }
});

// GET /api/sessionsJoc/:id — Obtenir la sessió per ID (populant nom_usuari dels jugadors)
router.get('/:id', async function (req, res) {
    try {
        const sessio = await SessioJoc.findById(req.params.id)
            .populate('jugadors.id_usuari', 'nom_usuari');

        if (!sessio) {
            return res.status(404).json({ missatge: "Sessió no trobada" });
        }

        res.json(sessio);
    } catch (error) {
        console.error("Error obtenint la sessió:", error);
        res.status(500).json({ missatge: "Error de servidor: " + error.message });
    }
});

module.exports = router;