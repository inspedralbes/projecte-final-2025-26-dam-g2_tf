const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Lloc, PeticioRuta, Config } = require('../models/index');

// 1. LOGIN DE L'ADMINISTRADOR
router.post('/login', async function (req, res) {
    const correu = req.body.correu;
    const contrasenya = req.body.contrasenya;

    if (correu === 'admin@admin.com' && contrasenya === 'admin123') {
        res.json({
            success: true,
            message: "Sessió iniciada com a Administrador",
            user: { nom: "Admin", rol: "admin" }
        });
    } else {
        res.status(401).json({ success: false, message: "Correu o contrasenya incorrectes" });
    }
});

// 2. GESTIONAR LLOCS
// Reordenar llocs (Drag & Drop) - HA D'ESTAR ABANS DE /:id
router.put('/llocs/reordenar', async function (req, res) {
    try {
        const { llocs } = req.body; // [{ id: '...', ordre: 1 }, ...]
        if (!Array.isArray(llocs)) {
            return res.status(400).json({ message: "Format incorrecte, s'esperava un array 'llocs'" });
        }
        const updates = llocs.map(item =>
            Lloc.findByIdAndUpdate(item.id, { ordre: item.ordre })
        );
        await Promise.all(updates);
        res.json({ success: true, message: "Ordre actualitzat correctament" });
    } catch (error) {
        console.error("Error al reordenar:", error);
        res.status(500).json({ message: "Error al reordenar" });
    }
});

router.get('/llocs', async function (req, res) {
    try {
        const llocs = await Lloc.find({});
        res.json(llocs);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar els llocs" });
    }
});

router.post('/llocs', async function (req, res) {
    try {
        const nouLloc = new Lloc(req.body);
        await nouLloc.save();
        res.json({ success: true, message: "Lloc creat correctament" });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el lloc" });
    }
});

router.put('/llocs/:id', async function (req, res) {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }

        const lloc = await Lloc.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!lloc) {
            return res.status(404).json({ message: "Lloc no trobat" });
        }

        // La petició ja és 'aprovada' des que es va acceptar, no cal sincronitzar més

        res.json({ success: true, message: "Lloc actualitzat correctament" });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ message: "Error al actualitzar" });
    }
});

router.delete('/llocs/:id', async function (req, res) {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        await Lloc.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Lloc eliminat correctament" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar" });
    }
});

// Canviar estat d'un lloc (visibilitat i ordre)
router.patch('/llocs/:id/estat', async function (req, res) {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const { estat, ordre } = req.body;
        const updateData = { estat };
        if (ordre !== undefined) updateData.ordre = ordre;
        const lloc = await Lloc.findByIdAndUpdate(req.params.id, updateData, { new: true });

        // La petició ja és 'aprovada' des que es va acceptar, no cal sincronitzar més

        res.json({ success: true, message: "Estat actualitzat correctament" });
    } catch (error) {
        console.error("Error al actualitzar l'estat:", error);
        res.status(500).json({ message: "Error al actualitzar l'estat" });
    }
});

// Canviar restricció horària
router.patch('/llocs/:id/restriccio', async function (req, res) {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const { actiu } = req.body;
        await Lloc.findByIdAndUpdate(req.params.id, { 'control_horari.actiu': actiu });
        res.json({ success: true, message: "Restricció horària actualitzada" });
    } catch (error) {
        console.error("Error al actualitzar la restricció:", error);
        res.status(500).json({ message: "Error al actualitzar la restricció" });
    }
});

// 3. GESTIONAR PETICIONS
router.get('/peticions', async function (req, res) {
    try {
        const peticions = await PeticioRuta.find({}).populate('id_usuari');
        res.json(peticions);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar les peticions" });
    }
});

router.put('/peticions/:id', async function (req, res) {
    try {
        if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('ID inválido');
        }
        const idPeticio = req.params.id;
        const { estat_validacio, motiuRebuig } = req.body;

        const updateData = {};
        if (estat_validacio !== undefined) updateData.estat_validacio = estat_validacio;
        if (motiuRebuig !== undefined) updateData.motiuRebuig = motiuRebuig;

        const peticio = await PeticioRuta.findByIdAndUpdate(idPeticio, updateData, { new: true });

        if (!peticio) {
            return res.status(404).json({ message: "Petició no trobada" });
        }

        res.json({ success: true, message: "La petició ha estat " + estat_validacio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al processar la petició" });
    }
});

// 4. CONFIGURACIÓ HORARI (TOQUE DE QUEDA)
router.get('/configuracio/horari', async function (req, res) {
    try {
        const config = await Config.findOne({ key: 'toque_de_queda' });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: "Error al llegir la configuració" });
    }
});

router.put('/configuracio/horari', async function (req, res) {
    try {
        const { hora_inici, hora_fi, actiu } = req.body;
        const config = await Config.findOneAndUpdate(
            { key: 'toque_de_queda' },
            { hora_inici, hora_fi, actiu },
            { upsert: true, new: true }
        );
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ message: "Error al actualitzar la configuració" });
    }
});

module.exports = router;