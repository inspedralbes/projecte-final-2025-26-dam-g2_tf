const express = require('express');
const router = express.Router();
const { Usuario, Perfil } = require('../models');

function calcularNivell(punts) {
    if (punts >= 400) return "Llegenda de la Ciutat";
    if (punts >= 300) return "Expert en Rutes";
    if (punts >= 200) return "Fotògraf de Carrer";
    if (punts >= 100) return "Rastrejador Urbà";
    return "Explorador Novell";
}

// 3. ACTUALITZAR BIOGRAFIA I ROL 
router.put('/update', async (req, res) => {
    try {
        const { perfilId, nouNom, novaBio } = req.body;
        const perfil = await Perfil.findById(perfilId);

        if (nouNom) perfil.nom_usuari = nouNom;
        if (novaBio !== undefined) perfil.biografia = novaBio;

        // Actualitzem punts: 1 cromo = 1 punt
        perfil.punts = perfil.inventari_cromos.length;
        perfil.nivell = calcularNivell(perfil.punts);

        await perfil.save();
        res.json({ success: true, user: perfil });
    } catch (error) {
        res.status(500).json({ message: "Error en actualitzar" });
    }
});

// 4. AFREGR CROMO (Pujada de nivell automàtica)
router.put('/afegir-cromo', async (req, res) => {
    try {
        const { perfilId, nouCromo } = req.body; 
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
        res.status(500).json({ message: "Error al afegir cromo" });
    }
});

module.exports = router;