const express = require('express');
const router = express.Router();
const { SessioJoc, Lloc } = require('../models');

// RUTA A: Crear la sessió quan l'usuari clica "Jugar sol"
router.post('/crear', async (req, res) => {
    try {
        const { idLloc, perfilId } = req.body; // perfilId vindrà del frontend
        
        
        if (!idLloc || !perfilId) {
            return res.status(400).json({ missatge: "Falten dades: idLloc o perfilId" });
        }
        // Extraiem els IDs dels punts de missió del monument
        const puntsIds = lloc.punts_missio.map(p => p._id);

        const novaSessio = new SessioJoc({
            codi_sala: Math.random().toString(36).substring(2, 8).toUpperCase(),
            tipus_partida: 'individual',
            estat: 'jugant',
            id_lloc_desti: idLloc,
            id_puntos_de_la_partida: puntsIds, 
            id_objetivo_actual: puntsIds[0], // Establim el primer punt com a objectiu
            jugadors: [{
                id_usuari: perfilId, // Referència al PerfilSchema
                puntsPartida: 0,
                completat: false
            }],
            temps_inici: new Date()
        });

        await novaSessio.save();
        res.status(201).json(novaSessio);
    } catch (error) {
        res.status(500).json({ missatge: "Error al crear la sessió" });
    }
});

// RUTA B: Obtenir la sessió per ID (Això arregla el 404 del mapa)
router.get('/:id', async (req, res) => {
    try {
        const sessio = await SessioJoc.findById(req.params.id);
        if (!sessio) return res.status(404).json({ missatge: "Sessió no trobada" });
        res.json(sessio);
    } catch (error) {
        res.status(500).json({ missatge: "Error de servidor" });
    }
});

module.exports = router;