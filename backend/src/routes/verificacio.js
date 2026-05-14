const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Usuari, Perfil } = require('../models');

// GET /verificacio/pendents: Recupera la llista d'usuaris amb edat pendent de validació, enllaçant les dades de perfil associades.
router.get('/pendents', async (req, res) => {
    try {
        const pendents = await Usuari.find({ verificacio_estat: 'pendent' }).select('-contrasenya');

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

// PUT /verificacio/decidir/:id: Gestiona l'estat d'aprovació d'un usuari. Neteja les imatges pujades per privacitat i, si es rebutja, purga el compte sencer.
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
            if (usuari.verificacio_imatge) {
                const camiImatge = path.join(__dirname, '../../public', usuari.verificacio_imatge);
                if (fs.existsSync(camiImatge)) {
                    fs.unlinkSync(camiImatge);
                }
            }
            await Perfil.deleteOne({ usuari_id: id });
            await Usuari.findByIdAndDelete(id);

            res.json({ success: true, message: `Usuari rebutjat i dades esborrades de la base de dades` });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en la decisió: " + error.message });
    }
});

module.exports = router;
