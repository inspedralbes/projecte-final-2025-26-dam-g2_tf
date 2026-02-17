const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// Ruta base per confirmar que el JS carrega bé
router.get('/', (req, res) => {
    res.json({ message: "Connectat correctament a la API d'usuaris" });
});

// REGISTRE: Crea un nou usuari a la base de dades
router.post('/register', async (req, res) => {
    try {
        const db = getDB();
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Falten dades obligatòries" });
        }

        // Comprovem si l'usuari ja existeix
        const existingUser = await db.collection('usuaris').findOne({ correu: email });
        if (existingUser) {
            return res.status(400).json({ message: "Aquest correu ja està registrat" });
        }

        const nouUsuari = {
            nom_usuari: username,
            correu: email,
            contrasenya: password, // NOTA: En un projecte real, caldria encriptar-la amb bcrypt
            edat_verificada: true, // Assignem true per defecte per a la demo
            nivell: "Explorador Novell",
            punts: 100,
            amics: [],
            inventari_cromos: []
        };

        const result = await db.collection('usuaris').insertOne(nouUsuari);

        // Retornem l'usuari sense la contrasenya
        const { contrasenya, ...usuariSensePrivacitat } = nouUsuari;
        res.status(201).json({
            success: true,
            message: "Usuari creat correctament",
            user: { ...usuariSensePrivacitat, _id: result.insertedId }
        });

    } catch (error) {
        console.error("Error al registre:", error);
        res.status(500).json({ message: "Error intern del servidor" });
    }
});

// LOGIN: Verifica les credencials
router.post('/login', async (req, res) => {
    try {
        const db = getDB();
        const { email, password } = req.body;

        const usuari = await db.collection('usuaris').findOne({ correu: email });

        if (!usuari || usuari.contrasenya !== password) {
            return res.status(401).json({ message: "Correu o contrasenya incorrectes" });
        }

        // Retornem l'usuari sense la contrasenya
        const { contrasenya, ...usuariSensePassword } = usuari;
        res.json({
            success: true,
            message: "Sessió iniciada",
            user: usuariSensePassword
        });

    } catch (error) {
        console.error("Error al login:", error);
        res.status(500).json({ message: "Error intern del servidor" });
    }
});

// GET /:id - Obtenir info pública d'un usuari
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { ObjectId } = require('mongodb');
        const usuari = await db.collection('usuaris').findOne({ _id: new ObjectId(req.params.id) });

        if (!usuari) return res.status(404).json({ message: "Usuari no trobat" });

        // Només retornem dades públiques
        const { contrasenya, correu, ...dadesPubliques } = usuari;
        res.json(dadesPubliques);
    } catch (error) {
        console.error("Error al carregar perfil públic:", error);
        res.status(500).json({ message: "Error al carregar perfil" });
    }
});

module.exports = router;