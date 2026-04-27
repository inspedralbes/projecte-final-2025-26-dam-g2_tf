const express = require('express');
const router = express.Router();
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
        await Lloc.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: "Lloc actualitzat correctament" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualitzar" });
    }
});

router.delete('/llocs/:id', async function (req, res) {
    try {
        await Lloc.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Lloc eliminat correctament" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
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
        const idPetició = req.params.id;
        const estatNou = req.body.estat_validacio;

        const peticio = await PeticioRuta.findByIdAndUpdate(idPetició, { estat_validacio: estatNou }, { new: true });

        if (estatNou === 'acceptada') {
            const nouLlocOficial = new Lloc({
                nom: peticio.nom_proposat,
                descripcio: peticio.motiu,
                imatge_referencia: peticio.fotos_proporcionades[0] || "",
                ubicacio: {
                    type: 'Point',
                    coordinates: peticio.ubicacio
                },
                dificultat: "Mitjana", // Canviat a la nova nomenclatura
                tags: []
            });
            await nouLlocOficial.save();
        }
        res.json({ success: true, message: "La petició ha estat " + estatNou });
    } catch (error) {
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