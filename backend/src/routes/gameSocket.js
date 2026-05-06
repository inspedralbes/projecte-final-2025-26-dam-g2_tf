const { Server } = require('socket.io');
const { SessioJoc, Lloc } = require('../models');

let ioInstance = null;

/**
 * Emet l'event 'game-over' a tots els jugadors de la sala associada a la sessió.
 * @param {string} sessioId      - L'_id de la SessioJoc
 * @param {object} sessio        - El document Mongoose de la SessioJoc (ja guardat)
 * @param {string} guanyadorId   - El perfilId del jugador que ha acabat (string)
 * @param {string} nomGuanyador  - El nom d'usuari del guanyador
 */
function notifyGameOver(sessioId, sessio, guanyadorId, nomGuanyador) {
    if (!ioInstance) return;

    // Usem sessio.codi_sala (guardat a la BD) en lloc d'un mapa en memòria
    // Això fa que funcioni fins i tot si el servidor s'ha reiniciat
    const roomCode = sessio.codi_sala;
    if (!roomCode) {
        console.warn('[Socket] notifyGameOver: sessio.codi_sala és buit, no es pot notificar.');
        return;
    }

    // Preparem la llista de jugadors ordenada:
    // 1r: més fotos completades; en empat: millor precisió
    const jugadorsOrdenats = [...sessio.jugadors].sort((a, b) => {
        const fotesA = (a.punts_completats || []).length;
        const fotesB = (b.punts_completats || []).length;
        if (fotesB !== fotesA) return fotesB - fotesA;
        return (b.exactitud_media || 0) - (a.exactitud_media || 0);
    });

    console.log(`[Socket] Emetent game-over a la sala: ${roomCode}${guanyadorId === 'timeout' ? ' (per TEMPS)' : ''}`);
    ioInstance.to(roomCode).emit('game-over', {
        sessioId: sessioId.toString(),
        guanyadorId: guanyadorId === 'timeout' ? 'timeout' : (guanyadorId ? guanyadorId.toString() : null),
        nomGuanyador: guanyadorId === 'timeout' ? 'EL TEMPS S\'HA ACABAT' : (nomGuanyador || 'Un jugador'),
        jugadors: jugadorsOrdenats,
        timeout: guanyadorId === 'timeout'
    });
}

/**
 * Emet l'event 'punt-aconseguit' quan un jugador fa la foto bé.
 */
function notifyPointAchieved(sessio, nomUsuari, nomPunt, idPunt) {
    if (!ioInstance || !sessio.codi_sala) return;
    console.log(`[Socket] Notificant punt aconseguit a sala ${sessio.codi_sala}: ${nomUsuari} -> ${nomPunt}`);
    ioInstance.to(sessio.codi_sala).emit('punt-aconseguit', {
        nomUsuari,
        nomPunt,
        idPunt: idPunt ? idPunt.toString() : null
    });
}


function configureSocket(server) {
    const allowedOrigins = [process.env.ORIGIN_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);

    const io = new Server(server, {
        cors: {
            origin: function (origin, callback) {
                if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ["GET", "POST"]
        }
    });

    ioInstance = io;

    // Sales en memòria: { roomCode: { creatorId, idLloc, players } }
    const sales = {};

    io.on('connection', function (socket) {
        console.log('Usuari connectat:', socket.id);

        socket.on('create-room', function (dades) {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            sales[roomCode] = {
                creatorId: socket.id,
                idLloc: dades.idLloc,
                duracio: dades.duracio || 60, // Per defecte 1 hora
                players: [{ id: socket.id, nom: dades.nomUsuari, perfilId: dades.perfilId }]
            };
            socket.join(roomCode);
            socket.emit('room-created', roomCode);
            socket.emit('room-info', { idLloc: dades.idLloc });
            io.to(roomCode).emit('update-players', sales[roomCode].players);
        });

        socket.on('join-room', function (dades) {
            const room = sales[dades.roomCode];
            if (room) {
                room.players.push({ id: socket.id, nom: dades.nomUsuari, perfilId: dades.perfilId });
                socket.join(dades.roomCode);
                socket.emit('room-joined', dades.roomCode);
                socket.emit('room-info', { idLloc: room.idLloc });
                io.to(dades.roomCode).emit('update-players', room.players);
            } else {
                socket.emit('error-room', 'La sala no existeix');
            }
        });

        socket.on('start-game', async function (dades) {
            const roomCode = typeof dades === 'string' ? dades : dades.roomCode;
            const mode = dades.mode || 'Individual';
            const groupsConfig = dades.groups || [];

            const room = sales[roomCode];
            if (!room || room.creatorId !== socket.id) return;

            try {
                // 1. Carreguem el lloc per obtenir els punts de missió
                const lloc = await Lloc.findById(room.idLloc);
                if (!lloc) {
                    io.to(roomCode).emit('error-room', 'Lloc no trobat a la BD');
                    return;
                }

                // 2. Carreguem tots els personatges disponibles
                const { Personatge } = require('../models');
                let personatgesDisponibles = await Personatge.find({});
                personatgesDisponibles = personatgesDisponibles.filter(p =>
                    !p.nom.toLowerCase().includes('el policia') &&
                    !p.nom.toLowerCase().includes('el policía')
                );

                // 3. Repartim personatges aleatòriament als jugadors
                const assignacioPersonatge = repartirPersonatgesAleatoriament(room.players, personatgesDisponibles);

                // 4. Calculem quins punts veu cada personatge
                const puntsMissio = lloc.punts_missio || [];
                const puntsComuns = [];
                for (let i = 0; i < puntsMissio.length; i++) {
                    if (!puntsMissio[i].personatge_id) {
                        puntsComuns.push(puntsMissio[i]._id);
                    }
                }

                // 4. Construïm l'array de jugadors
                const jugadorsDB = [];
                for (let i = 0; i < room.players.length; i++) {
                    const p = room.players[i];
                    if (p.perfilId) {
                        let groupId = i + 1;
                        let isCapita = true;

                        if (mode === 'Grup' || mode === 'Grups') {
                            const targetGroup = groupsConfig.find(g => g.members.includes(p.perfilId));
                            if (targetGroup) {
                                groupId = targetGroup.grup_id;
                                isCapita = (targetGroup.capita_id === p.perfilId);
                            } else {
                                groupId = 1;
                                isCapita = false;
                            }
                        }

                        // Personatge assignat
                        const personatgeAssignat = assignacioPersonatge[i];
                        const personatgeId = personatgeAssignat ? personatgeAssignat._id : null;

                        // Punts visibles
                        const puntsDelPersonatge = [];
                        if (personatgeId) {
                            for (let k = 0; k < puntsMissio.length; k++) {
                                if (puntsMissio[k].personatge_id && puntsMissio[k].personatge_id.toString() === personatgeId.toString()) {
                                    puntsDelPersonatge.push(puntsMissio[k]._id);
                                }
                            }
                        }
                        const puntsAssignats = puntsComuns.concat(puntsDelPersonatge);

                        jugadorsDB.push({
                            id_usuari: p.perfilId,
                            personatge_id: personatgeId,
                            personatge_assignat: personatgeAssignat ? personatgeAssignat.nom : '',
                            puntsPartida: 0,
                            completat: false,
                            punts_completats: [],
                            exactitud_media: 0,
                            temps: "0",
                            grup_id: groupId,
                            capita: isCapita,
                            punts_assignats: puntsAssignats
                        });
                    }
                }

                // 4. Creem la sessió a la BD
                const duracioSessio = dades.duracio || room.duracio || 60;
                room.duracio = duracioSessio; // Actualitzem la durada en memòria per si de cas

                const ara = new Date();
                const tempsLimit = new Date(ara.getTime() + duracioSessio * 60000);

                const novaSessio = new SessioJoc({
                    codi_sala: roomCode,
                    tipus_partida: mode.toLowerCase(),
                    estat: 'jugant',
                    id_lloc_desti: room.idLloc,
                    id_puntos_de_la_partida: lloc.punts_missio.map(p => p._id),
                    jugadors: jugadorsDB,
                    temps_inici: ara,
                    duracio: duracioSessio,
                    temps_limit: tempsLimit
                });
                await novaSessio.save();

                console.log('Sessió de joc creada:', novaSessio._id, '| roomCode:', roomCode);

                // 7. Emetre la carta de personatge a cada socket INDIVIDUALMENT
                for (let idx = 0; idx < room.players.length; idx++) {
                    const playerInfo = room.players[idx];
                    const assignat = assignacioPersonatge[idx];
                    const jugadorDB = jugadorsDB[idx];

                    if (playerInfo && playerInfo.id && assignat) {
                        // En mode grup/grups, només enviem la carta als capitanys
                        const esCapita = jugadorDB ? jugadorDB.capita : true;
                        if (mode.toLowerCase() !== 'individual' && !esCapita) {
                            continue; // No enviem carta als acompanyants
                        }

                        const imatgeUrl = assignat.imatge || '';

                        io.to(playerInfo.id).emit('carta-personatge', {
                            sessioId: novaSessio._id.toString(),
                            personatge: {
                                nom: assignat.nom,
                                descripcio: assignat.descripcio || '',
                                imatge: imatgeUrl
                            },
                            puntsAssignats: jugadorDB ? jugadorDB.punts_assignats : []
                        });
                    }
                }

                // 8. Planificar el final per timeout
                setTimeout(async () => {
                    try {
                        const s = await SessioJoc.findById(novaSessio._id);
                        if (s && s.estat === 'jugant') {
                            s.estat = 'finalitzada';
                            await s.save();
                            console.log(`[Timeout] La sala ${roomCode} ha arribat al límit de temps.`);
                            notifyGameOver(s._id, s, 'timeout', null);
                        }
                    } catch (e) {
                        console.error('[Timeout] Error al finalitzar sessió:', e);
                    }
                }, duracioSessio * 60000);

                // 9. Enviem el sessioId a tots els jugadors (game-started)
                io.to(roomCode).emit('game-started', {
                    sessioId: novaSessio._id,
                    mode: mode,
                    groups: groupsConfig,
                    tempsLimit: tempsLimit
                });

            } catch (err) {
                console.error('Error al crear sessió en start-game:', err);
                io.to(roomCode).emit('game-started', { sessioId: null, idLloc: room.idLloc });
            }
        });

        // Event especial: la pàgina de càmera s'uneix a la room del joc actiu
        // El frontend envia el sessioId (_id de SessioJoc) i el backend busca el roomCode a la BD
        socket.on('join-game-room', async function (idOrCodi) {
            if (!idOrCodi) return;
            try {
                let query = {};
                if (idOrCodi.match(/^[0-9a-fA-F]{24}$/)) {
                    query = { _id: idOrCodi };
                } else {
                    query = { codi_sala: idOrCodi.toUpperCase() };
                }

                const sessio = await SessioJoc.findOne(query).select('codi_sala');
                if (sessio && sessio.codi_sala) {
                    socket.join(sessio.codi_sala);
                    console.log(`[Socket] Socket ${socket.id} s'ha unit a la room ${sessio.codi_sala} via join-game-room`);
                } else {
                    console.warn(`[Socket] join-game-room: sessió ${idOrCodi} no trobada o sense codi_sala`);
                }
            } catch (err) {
                console.error('[Socket] Error en join-game-room:', err);
            }
        });

        socket.on('disconnect', function () {
            for (const code in sales) {
                const room = sales[code];
                let index = -1;
                for (let i = 0; i < room.players.length; i++) {
                    if (room.players[i].id === socket.id) {
                        index = i;
                        break;
                    }
                }
                if (index !== -1) {
                    room.players.splice(index, 1);
                    io.to(code).emit('update-players', room.players);
                    if (room.players.length === 0) {
                        delete sales[code];
                    }
                    break;
                }
            }
        });
    });
}

module.exports = { configureSocket, notifyGameOver, notifyPointAchieved };

function repartirPersonatgesAleatoriament(players, personatgesDisponibles) {
    const resultat = [];
    if (!personatgesDisponibles || personatgesDisponibles.length === 0) {
        for (let i = 0; i < players.length; i++) resultat.push(null);
        return resultat;
    }

    if (players.length <= personatgesDisponibles.length) {
        const pool = [...personatgesDisponibles];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        for (let i = 0; i < players.length; i++) resultat.push(pool[i]);
    } else {
        for (let i = 0; i < players.length; i++) {
            const idx = Math.floor(Math.random() * personatgesDisponibles.length);
            resultat.push(personatgesDisponibles[idx]);
        }
    }
    return resultat;
}

