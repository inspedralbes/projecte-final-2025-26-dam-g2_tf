const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Usuario, Perfil } = require('../models');

function calcularNivell(cromos) {
    if (cromos > 30) return "Mestre Urbà";
    if (cromos >= 16) return "Guia de Barcelona";
    if (cromos >= 6) return "Rastrejador Urbà";
    return "Explorador Novell";
}

// 3. ACTUALITZAR BIOGRAFIA I ROL 
router.put('/update', async (req, res) => {
    try {
        const { perfilId, nouNom, novaBio } = req.body;
        if (!perfilId || !mongoose.Types.ObjectId.isValid(perfilId)) {
            return res.status(400).send('ID inválido');
        }
        const perfil = await Perfil.findById(perfilId);

        if (nouNom) perfil.nom_usuari = nouNom;
        if (novaBio !== undefined) perfil.biografia = novaBio;

        // Actualitzem punts: 1 cromo = 1 punt
        perfil.punts = perfil.inventari_cromos.length;
        perfil.nivell = calcularNivell(perfil.punts);

        await perfil.save();
        res.json({ success: true, user: perfil });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// 4. AFREGR CROMO (Pujada de nivell automàtica)
router.put('/afegir-cromo', async (req, res) => {
    try {
        const { perfilId, nouCromo } = req.body;
        if (!perfilId || !mongoose.Types.ObjectId.isValid(perfilId)) {
            return res.status(400).send('ID inválido');
        }
        const perfil = await Perfil.findById(perfilId);

        // Afegim el cromo
        perfil.inventari_cromos.push(nouCromo);

        // 1 cromo = 1 punt
        perfil.punts = perfil.inventari_cromos.length;

        // Calculem el nou nivell amb la funció d'abalt
        perfil.nivell = calcularNivell(perfil.punts);

        await perfil.save();
        res.json({ success: true, user: perfil });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// A. ENVIAR SOL·LICITUD D'AMISTAT (Corregit)
router.post('/sollicitud-amistat', async (req, res) => {
    try {
        const { de_perfil_id, de_nom, per_a_perfil_id } = req.body;

        const perfilDesti = await Perfil.findById(per_a_perfil_id);

        if (!perfilDesti) return res.status(404).json({ message: "Perfil no trobat" });

        // INICIALITZACIÓ SEGURA: Si no existeix l'array, el creem buit
        if (!perfilDesti.sollicituds_pendents) {
            perfilDesti.sollicituds_pendents = [];
        }
        if (!perfilDesti.amics) {
            perfilDesti.amics = [];
        }

        // Ara ja podem comprovar sense por a l'error 500
        if (perfilDesti.amics.includes(de_perfil_id)) {
            return res.status(400).json({ message: "Ja sou amics" });
        }

        const jaEnviada = perfilDesti.sollicituds_pendents.some(s =>
            s.id_perfil && s.id_perfil.toString() === de_perfil_id
        );

        if (jaEnviada) {
            return res.status(400).json({ message: "Sol·licitud ja enviada" });
        }

        perfilDesti.sollicituds_pendents.push({
            id_perfil: de_perfil_id,
            nom_usuari: de_nom
        });

        await perfilDesti.save();
        res.json({ success: true, message: "Sol·licitud enviada" });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

router.post('/acceptar-amistat', async (req, res) => {
    try {
        const { el_meu_perfil_id, id_nou_amic_perfil } = req.body;

        const jo = await Perfil.findById(el_meu_perfil_id);
        const ell = await Perfil.findById(id_nou_amic_perfil);

        if (!jo || !ell) {
            return res.status(404).json({ message: "Un dels perfils no existeix" });
        }

        // 1. Inicialització de seguretat (evita l'error 500 si l'array no existeix)
        if (!jo.amics) jo.amics = [];
        if (!ell.amics) ell.amics = [];
        if (!jo.sollicituds_pendents) jo.sollicituds_pendents = [];

        // 2. Afegir-nos mútuament si no som amics ja
        if (!jo.amics.includes(id_nou_amic_perfil)) {
            jo.amics.push(id_nou_amic_perfil);
        }
        if (!ell.amics.includes(el_meu_perfil_id)) {
            ell.amics.push(el_meu_perfil_id);
        }

        // 3. Netejar la sol·licitud pendent
        // Fem servir .toString() perquè els IDs de Mongo són objectes, no strings directes
        jo.sollicituds_pendents = jo.sollicituds_pendents.filter(
            s => s.id_perfil && s.id_perfil.toString() !== id_nou_amic_perfil.toString()
        );

        await jo.save();
        await ell.save();

        res.json({ success: true, user: jo });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// OBTENIR PERFIL PER ID (Amb el nom dels amics carregat)
router.get('/:id', async (req, res) => {
    try {
        // Validació de l'ID amb Mongoose per evitar que el servidor peti
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID d'usuari no vàlid" });
        }
        const perfil = await Perfil.findById(req.params.id)
            .populate('usuari_id', 'correu')
            .populate('amics', 'nom_usuari'); 

        if (!perfil) {
            return res.status(404).json({ message: "Perfil no trobat" });
        }

        res.json(perfil);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;