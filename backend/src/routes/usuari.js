const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Usuari, Perfil, Post, Ressenya, PeticioRuta } = require('../models');

function calcularNivell(cromos) {
    if (cromos > 30) return "Mestre Urbà";
    if (cromos >= 16) return "Guia de Barcelona";
    if (cromos >= 6) return "Rastrejador Urbà";
    return "Explorador Novell";
}

// PUT /usuari/update: Actualitza les dades bàsiques del perfil (nom, biografia) i recalcula el nivell d'explorador basant-se en l'inventari.
router.put('/update', async (req, res) => {
    try {
        const { perfilId, nouNom, novaBio } = req.body;
        if (!perfilId || !mongoose.Types.ObjectId.isValid(perfilId)) {
            return res.status(400).send('ID inválido');
        }
        const perfil = await Perfil.findById(perfilId);

        if (nouNom) perfil.nom_usuari = nouNom;
        if (novaBio !== undefined) perfil.biografia = novaBio;

        perfil.punts = perfil.inventari_cromos.length;
        perfil.nivell = calcularNivell(perfil.punts);

        await perfil.save();
        res.json({ success: true, user: perfil });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// PUT /usuari/afegir-cromo: Insereix un nou cromo a l'inventari del perfil i executa l'algorisme de progressió de nivell.
router.put('/afegir-cromo', async (req, res) => {
    try {
        const { perfilId, nouCromo } = req.body;
        if (!perfilId || !mongoose.Types.ObjectId.isValid(perfilId)) {
            return res.status(400).send('ID inválido');
        }
        const perfil = await Perfil.findById(perfilId);

        perfil.inventari_cromos.push(nouCromo);
        perfil.punts = perfil.inventari_cromos.length;
        perfil.nivell = calcularNivell(perfil.punts);

        await perfil.save();
        res.json({ success: true, user: perfil });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// POST /usuari/sollicitud-amistat: Gestiona l'enviament de peticions d'amistat, inicialitzant els arrays d'estat si estan buits.
router.post('/sollicitud-amistat', async (req, res) => {
    try {
        const { de_perfil_id, de_nom, per_a_perfil_id } = req.body;

        const perfilDesti = await Perfil.findById(per_a_perfil_id);

        if (!perfilDesti) return res.status(404).json({ message: "Perfil no trobat" });

        if (!perfilDesti.sollicituds_pendents) {
            perfilDesti.sollicituds_pendents = [];
        }
        if (!perfilDesti.amics) {
            perfilDesti.amics = [];
        }

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

// POST /usuari/acceptar-amistat: Vincula bidireccionalment dos perfils com a amics i neteja les sol·licituds pendents prèvies.
router.post('/acceptar-amistat', async (req, res) => {
    try {
        const { el_meu_perfil_id, id_nou_amic_perfil } = req.body;

        const jo = await Perfil.findById(el_meu_perfil_id);
        const ell = await Perfil.findById(id_nou_amic_perfil);

        if (!jo || !ell) {
            return res.status(404).json({ message: "Un dels perfils no existeix" });
        }

        if (!jo.amics) jo.amics = [];
        if (!ell.amics) ell.amics = [];
        if (!jo.sollicituds_pendents) jo.sollicituds_pendents = [];

        if (!jo.amics.includes(id_nou_amic_perfil)) {
            jo.amics.push(id_nou_amic_perfil);
        }
        if (!ell.amics.includes(el_meu_perfil_id)) {
            ell.amics.push(el_meu_perfil_id);
        }

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

// GET /usuari/:id: Retorna el document de perfil poblat amb dades bàsiques de contacte de l'usuari arrel i el llistat d'amics.
router.get('/:id', async (req, res) => {
    try {
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

// DELETE /usuari/:id: Executa la purga global d'un usuari (perfil, publicacions, imatges associades en disc, ressenyes i peticions).
router.delete('/:id', async (req, res) => {
    try {
        const perfilId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(perfilId)) {
            return res.status(400).send('ID inválido');
        }

        const perfil = await Perfil.findById(perfilId);
        if (!perfil) return res.status(404).send('Perfil no trobat');

        const usuariId = perfil.usuari_id;

        const posts = await Post.find({ id_usuari: perfilId });
        for (const post of posts) {
            if (post.imatges_post && post.imatges_post.length > 0) {
                for (const imgPath of post.imatges_post) {
                    const fullPath = path.join(__dirname, '../../public', imgPath);
                    if (fs.existsSync(fullPath)) {
                        try { fs.unlinkSync(fullPath); } catch (e) { console.error("Error unlinking post img:", e); }
                    }
                }
            }
            if (post.imatge_post) {
                const fullPath = path.join(__dirname, '../../public', post.imatge_post);
                if (fs.existsSync(fullPath)) {
                    try { fs.unlinkSync(fullPath); } catch (e) { console.error("Error unlinking post img:", e); }
                }
            }
        }

        const usuari = await Usuari.findById(usuariId);
        if (usuari && usuari.verificacio_imatge) {
            const fullPath = path.join(__dirname, '../../public', usuari.verificacio_imatge);
            if (fs.existsSync(fullPath)) {
                try { fs.unlinkSync(fullPath); } catch (e) { console.error("Error unlinking verification img:", e); }
            }
        }

        await Post.deleteMany({ id_usuari: perfilId });
        await Ressenya.deleteMany({ id_usuari: perfilId });
        await PeticioRuta.deleteMany({ id_usuari: perfilId });

        await Perfil.updateMany(
            { amics: perfilId },
            { $pull: { amics: perfilId } }
        );
        
        await Perfil.updateMany(
            { "sollicituds_pendents.id_perfil": perfilId },
            { $pull: { sollicituds_pendents: { id_perfil: perfilId } } }
        );

        await Perfil.findByIdAndDelete(perfilId);
        await Usuari.findByIdAndDelete(usuariId);

        res.json({ success: true, message: "Compte eliminat correctament" });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// PUT /usuari/marcar-lore-vist/:id: Actualitza la bandera (flag) d'estat d'introducció (lore) al perfil indicant que l'usuari ja ha passat el tutorial inicial.
router.put('/marcar-lore-vist/:id', async (req, res) => {
    try {
        const perfilId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(perfilId)) {
            return res.status(400).send('ID inválido');
        }
        const perfil = await Perfil.findById(perfilId);
        if (!perfil) return res.status(404).json({ message: "Perfil no trobat" });

        perfil.lore_inicial_vist = true;
        await perfil.save();

        res.json({ success: true, user: perfil });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;