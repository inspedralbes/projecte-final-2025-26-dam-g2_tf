const express = require('express');
const router = express.Router();
const { PeticioRuta } = require('../models');

// Middleware simple: llegeix l'ID d'usuari de la capçalera X-User-Id
function verifyToken(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: "Has d'enviar X-User-Id" });
  req.user = { id: userId };
  next();
}
 
router.get('/meves', verifyToken, async (req, res) => {
  try {
    // Validació bàsica: req.user ha d'existir
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token invàlid o sessió caducada" });
    }
    const peticions = await PeticioRuta.find({ id_usuari: req.user.id });
    const result = peticions.map(p => ({
      _id: p._id,
      nomLloc: p.nom_proposat,
      estat: p.estat_validacio,
      dataCreacio: p.createdAt,
      motiuRebuig: p.motiuRebuig
    }));
    res.json(result);
  } catch (error) {
    console.error("Error carregant les meves peticions:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

router.post('/', async (req, res) => {
    try {
        const { nom_proposat, motiu, ubicacio, fotos_proporcionades, id_usuari } = req.body;

        if (!id_usuari) {
            return res.status(401).json({ message: "Has d'estar loguejat per fer aquesta acció." });
        }

        const nuevaPeticion = new PeticioRuta({
            nom_proposat,
            motiu,
            ubicacio: ubicacio || [],
            fotos_proporcionades: fotos_proporcionades ? [fotos_proporcionades] : [],
            estat_validacio: "pendent",
            id_usuari
        });

        await nuevaPeticion.save();

    res.status(201).json({
            message: "Petició guardada correctament!",
            id: nuevaPeticion._id
        });
    
    } catch (error) {
        console.error("Error guardant la petició:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Dades incorrectes", detalls: error.message });
        }
        res.status(500).json({ message: "Error del servidor." });
    }
});

// Actualitzar estat de petició (Acceptar/Rebutjar/Preparar)
router.put('/:id', async (req, res) => {
    try {
        const { estat_validacio, motiuRebuig } = req.body;
        const updateData = {};
        if (estat_validacio !== undefined) updateData.estat_validacio = estat_validacio;
        if (motiuRebuig !== undefined) updateData.motiuRebuig = motiuRebuig;

        const peticio = await PeticioRuta.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );

        if (!peticio) return res.status(404).json({ message: "Petició no trobada" });

        // Si s'aprova, creem el lloc en estat 'desactivat' per preparar-lo
        if (estat_validacio === 'aprovada') {
            const nouLloc = new Lloc({
                nom: peticio.nom_proposat,
                descripcio: peticio.motiu,
                ubicacio: { type: 'Point', coordinates: peticio.ubicacio },
                fotos_actuals: peticio.fotos_proporcionades || [],
                estat: 'desactivat',
                ordre: 0
            });
            await nouLloc.save();
        }

        res.json({ success: true, message: `Petició marcada com a ${estat_validacio}` });
    } catch (error) {
        console.error("Error actualitzant petició:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

// Canviar petició a 'preparant' i crear el lloc desactivat
router.put('/:id/preparant', async (req, res) => {
    try {
        const peticio = await PeticioRuta.findById(req.params.id);
        if (!peticio) return res.status(404).json({ message: "Petició no trobada" });

        peticio.estat_validacio = 'preparant';
        await peticio.save();

        // Creem el lloc en estat 'desactivat' per preparar-lo
        const Lloc = require('../models').Lloc;
        
        // Validem coordenades: si són invàlides, posem un valor per defecte
        let coordinates = [0, 0];
        if (Array.isArray(peticio.ubicacio) && 
            peticio.ubicacio.length === 2 &&
            typeof peticio.ubicacio[0] === 'number' && 
            typeof peticio.ubicacio[1] === 'number' &&
            !isNaN(peticio.ubicacio[0]) && 
            !isNaN(peticio.ubicacio[1])) {
            coordinates = peticio.ubicacio;
        }

        const nouLloc = new Lloc({
            nom: peticio.nom_proposat || 'Lloc sense nom',
            descripcio: peticio.motiu || '',
            ubicacio: { type: 'Point', coordinates: coordinates },
            fotos_actuals: peticio.fotos_proporcionades || [],
            estat: 'desactivat',
            ordre: 0
        });
        await nouLloc.save();
        
        res.json({ success: true, message: "Petició en preparació i lloc creat (desactivat)" });
    } catch (error) {
        console.error("Error canviant a preparant:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

module.exports = router;