const express = require('express');
const router = express.Router();
const { SessioJoc, Lloc } = require('../models');
const { Perfil } = require('../models');

// POST /sessionsJoc/:id/finalitzar: Tanca una sessió de joc activa i consolida els punts obtinguts al perfil de l'usuari.
router.post('/:id/finalitzar', async function (req, res) {
    try {
        const idOrCodi = req.params.id;
        const { perfilId, puntsGuanyats, tempsFinal } = req.body;

        let query = idOrCodi.match(/^[0-9a-fA-F]{24}$/) 
            ? { _id: idOrCodi } 
            : { codi_sala: idOrCodi.toUpperCase() };

        const sessio = await SessioJoc.findOne(query);
        if (!sessio) return res.status(404).json({ missatge: "Sessió no trobada" });

        const jugador = sessio.jugadors.find(j => j.id_usuari.toString() === perfilId.toString());
        if (jugador) {
            jugador.completat = true;
            jugador.puntsPartida = puntsGuanyats;
            jugador.temps = tempsFinal;
        }

        await Perfil.findByIdAndUpdate(perfilId, {
            $inc: { punts: puntsGuanyats }
        });

        const totsAcabat = sessio.jugadors.every(j => j.completat);
        if (totsAcabat) {
            sessio.estat = 'finalitzada';
        }

        await sessio.save();

        res.json({ 
            success: true, 
            missatge: "Punts sumats al perfil i partida guardada",
            puntsTotalsPartida: puntsGuanyats
        });

    } catch (error) {
        console.error("Error al finalitzar sessió:", error);
        res.status(500).json({ missatge: "Error de servidor" });
    }
});

// POST /sessionsJoc/crear: Inicialitza una nova sessió de joc en mode individual, vinculant la ubicació i punts de missió al perfil sol·licitant.
router.post('/crear', async function (req, res) {
    try {
        const idLloc = req.body.idLloc;
        const perfilId = req.body.perfilId;

        if (!idLloc || !perfilId) {
            return res.status(400).json({ missatge: "Falten dades: idLloc o perfilId" });
        }

        const lloc = await Lloc.findById(idLloc);
        if (!lloc) {
            return res.status(404).json({ missatge: "Lloc no trobat" });
        }

        const puntsIds = [];
        for (let i = 0; i < lloc.punts_missio.length; i++) {
            puntsIds.push(lloc.punts_missio[i]._id);
        }

        const tempsLimitGlobal = new Date(Date.now() + (req.body.duracio || 60) * 60000);

        const novaSessio = new SessioJoc({
            codi_sala: Math.random().toString(36).substring(2, 8).toUpperCase(),
            tipus_partida: 'individual',
            estat: 'jugant',
            id_lloc_desti: idLloc,
            id_puntos_de_la_partida: puntsIds,
            jugadors: [{
                id_usuari: perfilId,
                puntsPartida: 0,
                completat: false,
                punts_completats: [],
                exactitud_media: 0,
                temps: "0",
                temps_limit: tempsLimitGlobal
            }],
            temps_inici: new Date(),
            duracio: req.body.duracio || 60,
            temps_limit: tempsLimitGlobal
        });

        await novaSessio.save();
        res.status(201).json(novaSessio);

    } catch (error) {
        console.error("Error al crear la sessió:", error);
        res.status(500).json({ missatge: "Error al crear la sessió: " + error.message });
    }
});

// POST /sessionsJoc/crear-grup: Instància una nova sessió de joc col·laboratiu i hi afegeix múltiples perfils.
router.post('/crear-grup', async function (req, res) {
    try {
        const idLloc = req.body.idLloc;
        const jugadors = req.body.jugadors; // Array de perfilIds

        if (!idLloc || !jugadors || jugadors.length === 0) {
            return res.status(400).json({ missatge: "Falten dades: idLloc o jugadors" });
        }

        const lloc = await Lloc.findById(idLloc);
        if (!lloc) {
            return res.status(404).json({ missatge: "Lloc no trobat" });
        }

        const puntsIds = [];
        for (let i = 0; i < lloc.punts_missio.length; i++) {
            puntsIds.push(lloc.punts_missio[i]._id);
        }

        const tempsLimitGlobal = new Date(Date.now() + (req.body.duracio || 60) * 60000);

        const jugadorsDB = [];
        for (let i = 0; i < jugadors.length; i++) {
            jugadorsDB.push({
                id_usuari: jugadors[i],
                puntsPartida: 0,
                completat: false,
                punts_completats: [],
                exactitud_media: 0,
                temps: "0",
                temps_limit: tempsLimitGlobal
            });
        }

        const novaSessio = new SessioJoc({
            codi_sala: Math.random().toString(36).substring(2, 8).toUpperCase(),
            tipus_partida: 'grup',
            estat: 'jugant',
            id_lloc_desti: idLloc,
            id_puntos_de_la_partida: puntsIds,
            jugadors: jugadorsDB,
            temps_inici: new Date(),
            duracio: req.body.duracio || 60,
            temps_limit: tempsLimitGlobal
        });

        await novaSessio.save();
        res.status(201).json(novaSessio);

    } catch (error) {
        console.error("Error al crear la sessió de grup:", error);
        res.status(500).json({ missatge: "Error al crear la sessió de grup: " + error.message });
    }
});

// GET /sessionsJoc/:id: Retorna el detall complet d'una sessió de joc existent, admetent cerca tant per ObjectId com per codi de sala generat aleatòriament.
router.get('/:id', async function (req, res) {
    try {
        const idOrCodi = req.params.id;
        console.log("[SessionsJoc] Buscant sessió amb:", idOrCodi);

        let query = {};
        if (idOrCodi.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: idOrCodi };
        } else {
            query = { codi_sala: idOrCodi.toUpperCase() };
        }

        const sessio = await SessioJoc.findOne(query)
            .populate('jugadors.id_usuari', 'nom_usuari')
            .populate('jugadors.personatge_id')
            .populate('id_lloc_desti', 'carta_lore nom');

        if (!sessio) {
            console.warn("[SessionsJoc] Sessió no trobada per:", idOrCodi);
            return res.status(404).json({ missatge: "Sessió no trobada" });
        }

        res.json(sessio);
    } catch (error) {
        console.error("[SessionsJoc] Error obtenint la sessió:", error);
        res.status(500).json({ missatge: "Error de servidor: " + error.message });
    }
});

// PATCH /sessionsJoc/:id/usar-pista: Registra la utilització d'una pista per part del jugador i aplica la penalització temporal corresponent al temps límit de sessió.
router.patch('/:id/usar-pista', async function (req, res) {
    try {
        const idOrCodi = req.params.id;
        const { perfilId, idPunt } = req.body;
        if (!perfilId || !idPunt) return res.status(400).json({ missatge: "Faltes dades: perfilId o idPunt" });

        let query = {};
        if (idOrCodi.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: idOrCodi };
        } else {
            query = { codi_sala: idOrCodi.toUpperCase() };
        }

        const sessio = await SessioJoc.findOne(query);
        if (!sessio) return res.status(404).json({ missatge: "Sessió no trobada" });

        const jugador = sessio.jugadors.find(j =>
            j.id_usuari.toString() === perfilId.toString()
        );

        if (!jugador) return res.status(404).json({ missatge: "Jugador no trobat a la sessió" });

        if (jugador.pistes_revelades && jugador.pistes_revelades.includes(idPunt)) {
            return res.json({
                missatge: "Pista ja revelada anteriorment",
                pistes_gastades: jugador.pistes_gastades,
                pistes_revelades: jugador.pistes_revelades
            });
        }

        if (jugador.pistes_gastades >= 3) {
            return res.status(400).json({ missatge: "Has esgotat el límit de 3 pistes!", pistes_gastades: jugador.pistes_gastades });
        }

        jugador.pistes_gastades += 1;
        if (!jugador.pistes_revelades) jugador.pistes_revelades = [];
        jugador.pistes_revelades.push(idPunt);

        const PENALITZACIO_MS = 5 * 60 * 1000;

        if (jugador.grup_id !== null && jugador.grup_id !== undefined) {
            sessio.jugadors.forEach(j => {
                if (j.grup_id === jugador.grup_id) {
                    const tempsActual = new Date(j.temps_limit || sessio.temps_limit).getTime();
                    j.temps_limit = new Date(tempsActual - PENALITZACIO_MS);
                }
            });
        } else {
            const tempsActual = new Date(jugador.temps_limit || sessio.temps_limit).getTime();
            jugador.temps_limit = new Date(tempsActual - PENALITZACIO_MS);
        }

        await sessio.save();

        res.json({
            missatge: "Pista utilitzada (-5 minuts)",
            pistes_gastades: jugador.pistes_gastades,
            pistes_revelades: jugador.pistes_revelades,
            nou_temps_limit: jugador.temps_limit
        });

    } catch (error) {
        console.error("Error al gastar pista:", error);
        res.status(500).json({ missatge: "Error de servidor" });
    }
});

module.exports = router;