const express = require('express');
const router = express.Router();
// Importem Usuari i Perfil segons el teu nou fitxer de models
const { Usuari, Perfil } = require('../models');

// 1. FUNCIÓ PER AL REGISTRE
async function ferRegistre(peticio, resposta) {
    try {
        // Recollim les dades en català tal com les envies des del milogin.vue
        const correuUsuari = peticio.body.correu;
        const clauUsuari = peticio.body.contrasenya;
        const nomPublic = peticio.body.nom_usuari;

        // Creem l'usuari amb el model Usuari (abans Usuario)
        const nouUsuari = new Usuari({ 
            correu: correuUsuari, 
            contrasenya: clauUsuari,
            edat_verificada: false 
        });
        const usuariGuardat = await nouUsuari.save();

        // Creem el perfil lligat a l'id de l'usuari
        const nouPerfil = new Perfil({
            usuari_id: usuariGuardat._id,
            nom_usuari: nomPublic,
            biografia: "Hola! Sóc nou aquí.",
            punts: 0,
            nivell: "Explorador Novell"
        });
        const perfilGuardat = await nouPerfil.save();

        // Retornem 'user' perquè el frontend el guardi al localStorage
        resposta.status(201).json({ success: true, user: perfilGuardat });
        
    } catch (error) {
        resposta.status(500).json({ success: false, message: "Error al registrar: " + error.message });
    }
}

// 2. FUNCIÓ PER AL LOGIN
async function ferLogin(peticio, resposta) {
    try {
        const correuEntrat = peticio.body.correu;
        const clauEntrada = peticio.body.contrasenya;

        // Busquem a la col·lecció 'usuaris' fent servir el camp 'correu'
        const compte = await Usuari.findOne({ correu: correuEntrat });

        if (!compte) {
            return resposta.status(401).json({ success: false, message: "Aquest correu no existeix" });
        }

        if (compte.contrasenya !== clauEntrada) {
            return resposta.status(401).json({ success: false, message: "La contrasenya és incorrecta" });
        }

        // Si tot és correcte, busquem el perfil associat a 'perfils'
        const perfilUsuari = await Perfil.findOne({ usuari_id: compte._id });
        
        resposta.json({ success: true, user: perfilUsuari });

    } catch (error) {
        resposta.status(500).json({ success: false, message: "Hi ha hagut un error al servidor" });
    }
}

// Definició de les rutes
router.post('/register', ferRegistre);
router.post('/login', ferLogin);

module.exports = router;