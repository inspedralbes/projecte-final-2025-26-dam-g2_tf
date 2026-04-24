const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Usuari, Perfil } = require('../models');

// 1. OBTENIR TOTS ELS USUARIS PENDENTS DE VERIFICACIÓ
router.get('/pendents', async (req, res) => {
    try {
        const pendents = await Usuari.find({ verificacio_estat: 'pendent' }).select('-contrasenya');

        // Carreguem els perfils per tenir el nom d'usuari
        const resultats = await Promise.all(pendents.map(async (u) => {
            const perfil = await Perfil.findOne({ usuari_id: u._id });
            return {
                _id: u._id,
                correu: u.correu,
                verificacio_imatge: u.verificacio_imatge,
                data_sollicitud: u.data_verificacio_sollicitud,
                nom_usuari: perfil ? perfil.nom_usuari : 'Desconegut'
            };
        }));

        res.json(resultats);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al carregar pendents: " + error.message });
    }
});

// 2. DECIDIR VERIFICACIÓ (APROVAR O REBUTJAR)
router.put('/decidir/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estat } = req.body; // 'aprovat' o 'rebutjat'

        if (!['aprovat', 'rebutjat'].includes(estat)) {
            return res.status(400).json({ success: false, message: "Estat no vàlid" });
        }

        const usuari = await Usuari.findById(id);
        if (!usuari) return res.status(404).json({ success: false, message: "Usuari no trobat" });

        if (estat === 'aprovat') {
            usuari.verificacio_estat = 'aprovat';
            usuari.edat_verificada = true;

            // Si aprovem, esborrem la imatge per privacitat
            if (usuari.verificacio_imatge) {
                const camiImatge = path.join(__dirname, '../../public', usuari.verificacio_imatge);
                if (fs.existsSync(camiImatge)) {
                    fs.unlinkSync(camiImatge);
                }
                usuari.verificacio_imatge = '';
            }
            await usuari.save();
            res.json({ success: true, message: `Usuari aprovat correctament` });
        } else {
            // REBUTJAR: Esborrem l'usuari completament de la BD per privacitat i neteja
            if (usuari.verificacio_imatge) {
                const camiImatge = path.join(__dirname, '../../public', usuari.verificacio_imatge);
                if (fs.existsSync(camiImatge)) {
                    fs.unlinkSync(camiImatge);
                }
            }
            // També esborrem el perfil associat
            await Perfil.deleteOne({ usuari_id: id });
            await Usuari.findByIdAndDelete(id);

            res.json({ success: true, message: `Usuari rebutjat i dades esborrades de la base de dades` });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en la decisió: " + error.message });
    }
});

module.exports = router;
