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

    console.log(`[Socket] Emetent game-over a la sala: ${roomCode}`);
    ioInstance.to(roomCode).emit('game-over', {
        sessioId: sessioId.toString(),
        guanyadorId: guanyadorId ? guanyadorId.toString() : null,
        nomGuanyador: nomGuanyador || 'Un jugador',
        jugadors: jugadorsOrdenats
    });
}

function configureSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.ORIGIN_URL || 'http://localhost:5173',
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
                players: [{ id: socket.id, nom: dades.nomUsuari, perfilId: dades.perfilId }]
            };
            socket.join(roomCode);
            socket.emit('room-created', roomCode);
            io.to(roomCode).emit('update-players', sales[roomCode].players);
        });

        socket.on('join-room', function (dades) {
            const room = sales[dades.roomCode];
            if (room) {
                room.players.push({ id: socket.id, nom: dades.nomUsuari, perfilId: dades.perfilId });
                socket.join(dades.roomCode);
                socket.emit('room-joined', dades.roomCode);
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

                // 2. Extraiem els _id dels punts de missió
                const puntsIds = [];
                for (let i = 0; i < lloc.punts_missio.length; i++) {
                    puntsIds.push(lloc.punts_missio[i]._id);
                }

                // 3. Construïm l'array de jugadors
                const jugadorsDB = [];
                for (let i = 0; i < room.players.length; i++) {
                    const p = room.players[i];
                    if (p.perfilId) {
                        let groupId = i + 1; // Default: each is their own group
                        let isCapita = true;

                        if (mode === 'Grup' || mode === 'Grups') {
                            // Find which group this player is in
                            const targetGroup = groupsConfig.find(g => g.members.includes(p.perfilId));
                            if (targetGroup) {
                                groupId = targetGroup.grup_id;
                                isCapita = (targetGroup.capita_id === p.perfilId);
                            } else {
                                // Fallback just in case
                                groupId = 1;
                                isCapita = false;
                            }
                        }

                        jugadorsDB.push({
                            id_usuari: p.perfilId,
                            puntsPartida: 0,
                            completat: false,
                            punts_completats: [],
                            exactitud_media: 0,
                            temps: "0",
                            grup_id: groupId,
                            capita: isCapita
                        });
                    }
                }

                // 4. Creem la sessió a la BD
                const novaSessio = new SessioJoc({
                    codi_sala: roomCode,
                    tipus_partida: mode.toLowerCase(),
                    estat: 'jugant',
                    id_lloc_desti: room.idLloc,
                    id_puntos_de_la_partida: puntsIds,
                    jugadors: jugadorsDB,
                    temps_inici: new Date()
                });
                await novaSessio.save();

                console.log('Sessió de joc creada:', novaSessio._id, '| roomCode:', roomCode, '| Mode:', mode);

                // 6. Enviem el sessioId a tots els jugadors
                io.to(roomCode).emit('game-started', { sessioId: novaSessio._id, mode: mode });

            } catch (err) {
                console.error('Error al crear sessió en start-game:', err);
                // Fallback: enviem l'idLloc perquè puguin jugar en mode individual
                io.to(roomCode).emit('game-started', { sessioId: null, idLloc: room.idLloc });
            }
        });

        // Event especial: la pàgina de càmera s'uneix a la room del joc actiu
        // El frontend envia el sessioId (_id de SessioJoc) i el backend busca el roomCode a la BD
        socket.on('join-game-room', async function (sessioId) {
            if (!sessioId) return;
            try {
                const sessio = await SessioJoc.findById(sessioId).select('codi_sala');
                if (sessio && sessio.codi_sala) {
                    socket.join(sessio.codi_sala);
                    console.log(`[Socket] Socket ${socket.id} s'ha unit a la room ${sessio.codi_sala} via join-game-room`);
                } else {
                    console.warn(`[Socket] join-game-room: sessió ${sessioId} no trobada o sense codi_sala`);
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

module.exports = { configureSocket, notifyGameOver };

