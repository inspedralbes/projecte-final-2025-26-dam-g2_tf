const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Usuari, Perfil } = require('../models');

// 1. FUNCIÓ PER AL REGISTRE
async function ferRegistre(peticio, resposta) {
    try {
        const { correu, contrasenya, nom_usuari, verificacio_imatge, es_major_confirmada } = peticio.body;

        const existeix = await Usuari.findOne({ correu });
        if (existeix) {
            return resposta.status(400).json({ success: false, message: "Aquest correu ja està registrat" });
        }

        let estatVerificacio = 'pendent';
        let camiRelatiu = '';

        if (es_major_confirmada) {
            estatVerificacio = 'aprovat';
        } else if (verificacio_imatge) {
            const nomFitxer = `verificacio_${Date.now()}_${nom_usuari}.jpg`;
            const carpetaDesti = path.join(__dirname, '../../public/verificacions');
            if (!fs.existsSync(carpetaDesti)) {
                fs.mkdirSync(carpetaDesti, { recursive: true });
            }
            const dadesNetes = verificacio_imatge.replace(/^data:image\/.*;base64,/, "");
            const buffer = Buffer.from(dadesNetes, 'base64');
            const camiComplet = path.join(carpetaDesti, nomFitxer);
            fs.writeFileSync(camiComplet, buffer);
            camiRelatiu = `/verificacions/${nomFitxer}`;
        }

        const nouUsuari = new Usuari({
            correu: correu,
            contrasenya: contrasenya,
            edat_verificada: estatVerificacio === 'aprovat',
            verificacio_estat: estatVerificacio,
            verificacio_imatge: camiRelatiu,
            data_verificacio_sollicitud: estatVerificacio === 'pendent' ? new Date() : null,
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
            ],
            lore_inicial_vist: false
        });

        const perfilGuardat = await nouPerfil.save();

        resposta.status(201).json({
            success: true,
            usuari: {
                ...perfilGuardat._doc,
                rol: usuariGuardat.rol,
                verificacio_estat: usuariGuardat.verificacio_estat
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

        if (compte.verificacio_estat === 'rebutjat') {
            return resposta.status(403).json({ success: false, message: "El teu compte ha estat rebutjat per falta de verificació d'edat." });
        }

        if (compte.verificacio_estat === 'pendent') {
            return resposta.status(403).json({ success: false, message: "El teu compte encara està pendent de verificació manual per un administrador." });
        }

        const perfilUsuari = await Perfil.findOne({ usuari_id: compte._id });

        const usuariSessio = {
            ...perfilUsuari._doc,
            rol: compte.rol,
            verificacio_estat: compte.verificacio_estat
        };

        // Ens assegurem que el camp existeixi per a usuaris antics
        if (usuariSessio.lore_inicial_vist === undefined) {
            usuariSessio.lore_inicial_vist = false;
        }

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