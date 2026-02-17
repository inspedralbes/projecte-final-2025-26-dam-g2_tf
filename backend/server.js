require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB, getDB } = require('./src/config/db');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: 'http://localhost:5173', // El port on corre el teu Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB Connectat correctament");


        const cercadorRoutes = require('./src/routes/cercador');
        const usuariRoutes = require('./src/routes/usuari');
        const socialRoutes = require('./src/routes/social');
        const mapaRoutes = require('./src/routes/mapa');
        const peticionsRoutes = require('./src/routes/peticions');

        app.use('/api/cercador', cercadorRoutes);
        app.use('/api/usuari', usuariRoutes);
        app.use('/api/social', socialRoutes);
        app.use('/api/mapa', mapaRoutes);
        app.use('/api/peticions', peticionsRoutes);

        // 4. Servir fitxers estàtics (com la carpeta public per a descàrregues)
        const path = require('path');
        app.use('/download', express.static(path.join(__dirname, 'public')));

        // 6. Configurar Socket.io
        const http = require('http');
        const { Server } = require('socket.io');

        const server = http.createServer(app);
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

        server.listen(PORT, '0.0.0.0', function () {
            console.log("Servidor funcionant a: http://localhost:" + PORT);
        });

    } catch (error) {
        if (error != null) {
            console.error("Error crític en iniciar el servidor:", error);
        }
    }
}

startServer();