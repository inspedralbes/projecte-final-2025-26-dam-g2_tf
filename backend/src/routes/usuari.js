const express = require('express');
const router = express.Router();
const { Usuario, Perfil } = require('../models/index');

// 1. REGISTRE 
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const nouUsuari = new Usuario({
            correu: email,
            contrasenya: password
        });
        const usuariGuardat = await nouUsuari.save();

        const nouPerfil = new Perfil({
            usuari_id: usuariGuardat._id,
            nom_usuari: username
        });
        const perfilGuardat = await nouPerfil.save();

        res.status(201).json({ success: true, user: perfilGuardat });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar: " + error.message });
    }
});

// 2. LOGIN 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const compte = await Usuario.findOne({ correu: email });

        if (!compte || compte.contrasenya !== password) {
            return res.status(401).json({ message: "Dades incorrectes" });
        }

        const perfil = await Perfil.findOne({ usuari_id: compte._id });
        res.json({ success: true, user: perfil });
    } catch (error) {
        res.status(500).json({ message: "Error al login" });
    }
});

// 3. ACTUALITZAR PERFIL 
router.put('/update', async (req, res) => {
    try {
        const { perfilId, nouNom, novaBio } = req.body;

        const perfilActualitzat = await Perfil.findByIdAndUpdate(
            perfilId, 
            { nom_usuari: nouNom, biografia: novaBio }, 
            { new: true } 
        );

        res.json({ success: true, user: perfilActualitzat });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar canvis" });
    }
});

module.exports = router;