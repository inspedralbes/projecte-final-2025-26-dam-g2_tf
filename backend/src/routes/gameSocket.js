const { Server } = require('socket.io');

function configureSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Emmagatzemarem les sales en memòria
    const sales = {};

    io.on('connection', function(socket) {
        console.log('Un usuari s\'ha connectat:', socket.id);

        socket.on('create-room', function(dades) {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            sales[roomCode] = {
                creatorId: socket.id,
                idLloc: dades.idLloc, // <--- Guardem quina ruta s'ha triat aquí
                players: [{ id: socket.id, nom: dades.nomUsuari }]
            };

            socket.join(roomCode);
            socket.emit('room-created', roomCode);
            io.to(roomCode).emit('update-players', sales[roomCode].players);
        });

        socket.on('join-room', function(dades) {
            const room = sales[dades.roomCode];
            if (room) {
                room.players.push({ id: socket.id, nom: dades.nomUsuari });
                socket.join(dades.roomCode);
                socket.emit('room-joined', dades.roomCode);
                io.to(dades.roomCode).emit('update-players', room.players);
            } else {
                socket.emit('error-room', 'La sala no existeix');
            }
        });

        socket.on('start-game', function(roomCode) {
            const room = sales[roomCode];
            // Només el creador pot donar el botó de "Començar"
            if (room && room.creatorId === socket.id) {
                // Quan enviem 'game-started', incloem l'ID del lloc 
                // perquè tots els jugadors sàpiguen quin mapa carregar
                io.to(roomCode).emit('game-started', room.idLloc);
            }
        });

        socket.on('disconnect', function() {
            for (const code in sales) {
                const room = sales[code];
                const index = room.players.findIndex(function(p) { return p.id === socket.id; });
                if (index !== -1) {
                    room.players.splice(index, 1);
                    io.to(code).emit('update-players', room.players);
                    if (room.players.length === 0) { delete sales[code]; }
                    break;
                }
            }
        });
    });
}

module.exports = configureSocket;
