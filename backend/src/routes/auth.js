const express = require('express');
const router = express.Router();
const { Usuari, Perfil } = require('../models');
//JUDIT
// 1. FUNCIÓ PER AL REGISTRE
async function ferRegistre(peticio, resposta) {
    try {
        // Recollim les dades enviades des del milogin.vue
        const correuUsuari = peticio.body.correu;
        const clauUsuari = peticio.body.contrasenya;
        const nomPublic = peticio.body.nom_usuari;

        const nouUsuari = new Usuari({ 
            correu: correuUsuari, 
            contrasenya: clauUsuari,
            edat_verificada: false 
        });

        // Dins de ferRegistre
          const existeix = await Usuari.findOne({ correu: correuUsuari });
          if (existeix) {
              return resposta.status(400).json({ success: false, message: "Aquest correu ja està registrat" });
        }
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

        resposta.status(201).json({ success: true, user: perfilGuardat });
        
    } catch (error) {
        resposta.status(500).json({ success: false, message: "Error al registrar: " + error.message });
    }
}

async function ferLogin(peticio, resposta) {
    try {
        const correuEntrat = peticio.body.correu;
        const clauEntrada = peticio.body.contrasenya;

        const compte = await Usuari.findOne({ correu: correuEntrat });

        if (!compte) {
            return resposta.status(401).json({ success: false, message: "Aquest correu no existeix" });
        }

        if (compte.contrasenya !== clauEntrada) {
            return resposta.status(401).json({ success: false, message: "La contrasenya és incorrecta" });
        }
        const perfilUsuari = await Perfil.findOne({ usuari_id: compte._id });
        
        resposta.json({ success: true, user: perfilUsuari });

    } catch (error) {
        resposta.status(500).json({ success: false, message: "Hi ha hagut un error al servidor" });
    }
}

router.post('/registre', ferRegistre);
router.post('/login', ferLogin);

module.exports = router;