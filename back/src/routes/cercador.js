const express = require('express');
const router = express.Router();

// Ruta base para confirmar que el JS carga bien
router.get('/', (req, res) => {
    res.json({ message: "Connectat correctament a la API de mapa" });
});

module.exports = router;