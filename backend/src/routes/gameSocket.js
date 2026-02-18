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

    io.on('connection', (socket) => {
        console.log('Un usuari s\'ha connectat:', socket.id);

        socket.on('create-room', (nomUsuari) => {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            sales[roomCode] = {
                creatorId: socket.id,
                players: [{ id: socket.id, nom: nomUsuari }]
            };
            socket.join(roomCode);
            console.log(`Sala creada: ${roomCode} per ${nomUsuari}`);
            socket.emit('room-created', roomCode);
            io.to(roomCode).emit('update-players', sales[roomCode].players);
        });

        socket.on('join-room', ({ roomCode, nomUsuari }) => {
            const room = sales[roomCode];
            if (room) {
                room.players.push({ id: socket.id, nom: nomUsuari });
                socket.join(roomCode);
                console.log(`${nomUsuari} s'ha unit a la sala ${roomCode}`);
                socket.emit('room-joined', roomCode);
                io.to(roomCode).emit('update-players', room.players);
            } else {
                socket.emit('error-room', 'La sala no existeix');
            }
        });

        socket.on('start-game', (roomCode) => {
            const room = sales[roomCode];
            if (room && room.creatorId === socket.id) {
                console.log(`Partida iniciada a la sala ${roomCode}`);
                io.to(roomCode).emit('game-started');
            }
        });

        socket.on('disconnect', () => {
            console.log('Usuari desconnectat:', socket.id);
            // Aquí podríem netejar l'usuari de les sales si calgués
            for (const code in sales) {
                const room = sales[code];
                const index = room.players.findIndex(p => p.id === socket.id);
                if (index !== -1) {
                    room.players.splice(index, 1);
                    io.to(code).emit('update-players', room.players);
                    if (room.players.length === 0) {
                        delete sales[code]; // Esborrar sala buida
                    }
                    break;
                }
            }
        });
    });
}

module.exports = configureSocket;
