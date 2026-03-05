const express = require('express');
const router = express.Router();
const { Usuari, Perfil } = require('../models');

// 1. FUNCIÓ PER AL REGISTRE
async function ferRegistre(peticio, resposta) {
    try {
        const { correu, contrasenya, nom_usuari } = peticio.body;

        const existeix = await Usuari.findOne({ correu });
        if (existeix) {
            return resposta.status(400).json({ success: false, message: "Aquest correu ja està registrat" });
        }

        const nouUsuari = new Usuari({
            correu: correu,
            contrasenya: contrasenya,
            edat_verificada: false,
            rol: 'user'
        });

        const usuariGuardat = await nouUsuari.save();

        const nouPerfil = new Perfil({
            usuari_id: usuariGuardat._id,
            nom_usuari: nom_usuari,
            biografia: "Hola! Sóc nou aquí.",
            punts: 1,
            nivell: "Explorador Novell",
            inventari_cromos: [
                {
                    nom_lloc: "Benvingut a l'aventura!",
                    data_obtencio: new Date(),
                    imatge_usuari: "/CromoInicial.jpg"
                }
            ]
        });

        await nouPerfil.save();

        resposta.status(201).json({
            success: true,
            usuari: {
                ...nouPerfil._doc,
                rol: usuariGuardat.rol
            }
        });

    } catch (error) {
        resposta.status(500).json({ success: false, message: "Error al registrar: " + error.message });
    }
}

// 2. FUNCIÓ PER AL LOGIN 
async function ferLogin(peticio, resposta) {
    try {
        const { correu, contrasenya } = peticio.body;

        const compte = await Usuari.findOne({ correu: correu });

        if (!compte) {
            return resposta.status(401).json({ success: false, message: "Aquest correu no existeix" });
        }

        if (compte.contrasenya !== contrasenya) {
            return resposta.status(401).json({ success: false, message: "La contrasenya és incorrecta" });
        }

        const perfilUsuari = await Perfil.findOne({ usuari_id: compte._id });

        const usuariSessio = {
            ...perfilUsuari._doc,
            rol: compte.rol
        };

        resposta.json({
            success: true,
            usuari: usuariSessio
        });

    } catch (error) {
        console.error(error);
        resposta.status(500).json({ success: false, message: "Hi ha hagut un error al servidor" });
    }
}

router.post('/registre', ferRegistre);
router.post('/login', ferLogin);

module.exports = router;