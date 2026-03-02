const { Server } = require('socket.io');
const { SessioJoc, Lloc } = require('../models');

// Mapa: sessioId (string) → roomCode (string)
// Permet que camara.js pugui emetre 'game-over' a tota la sala quan un jugador acaba
const sessioARoomCode = {};

let ioInstance = null;

/**
 * Emet l'event 'game-over' a tots els jugadors de la sala associada a la sessió.
 * @param {string} sessioId - L'_id de la SessioJoc
 * @param {object} sessio   - El document Mongoose de la SessioJoc (ja guardat)
 */
function notifyGameOver(sessioId, sessio) {
    const roomCode = sessioARoomCode[sessioId.toString()];
    if (!roomCode || !ioInstance) return;

    // Preparem la llista de jugadors ordenada:
    // 1r: més fotos completades; en empat: millor precisió
    const jugadorsOrdenats = [...sessio.jugadors].sort((a, b) => {
        const fotesA = (a.punts_completats || []).length;
        const fotesB = (b.punts_completats || []).length;
        if (fotesB !== fotesA) return fotesB - fotesA;
        return (b.exactitud_media || 0) - (a.exactitud_media || 0);
    });

    ioInstance.to(roomCode).emit('game-over', {
        sessioId: sessioId.toString(),
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

        socket.on('start-game', async function (roomCode) {
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
                    if (room.players[i].perfilId) {
                        jugadorsDB.push({
                            id_usuari: room.players[i].perfilId,
                            puntsPartida: 0,
                            completat: false,
                            punts_completats: [],
                            exactitud_media: 0,
                            temps: "0"
                        });
                    }
                }

                // 4. Creem la sessió a la BD
                const novaSessio = new SessioJoc({
                    codi_sala: roomCode,
                    tipus_partida: jugadorsDB.length > 1 ? 'grup' : 'individual',
                    estat: 'jugant',
                    id_lloc_desti: room.idLloc,
                    id_puntos_de_la_partida: puntsIds,
                    jugadors: jugadorsDB,
                    temps_inici: new Date()
                });
                await novaSessio.save();

                // 5. Registrem la relació sessioId → roomCode per poder fer notifyGameOver
                sessioARoomCode[novaSessio._id.toString()] = roomCode;

                console.log('Sessió de grup creada:', novaSessio._id);

                // 6. Enviem el sessioId a tots els jugadors
                io.to(roomCode).emit('game-started', { sessioId: novaSessio._id });

            } catch (err) {
                console.error('Error al crear sessió en start-game:', err);
                // Fallback: enviem l'idLloc perquè puguin jugar en mode individual
                io.to(roomCode).emit('game-started', { sessioId: null, idLloc: room.idLloc });
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
