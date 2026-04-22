require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(cors({
    origin: process.env.ORIGIN_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/foto_mapa', express.static(path.join(__dirname, 'public/foto_mapa')));
app.use('/fotos_actuals', express.static(path.join(__dirname, 'public/fotos_actuals')));
app.use('/personatges', express.static(path.join(__dirname, 'public/personatges')));
// missatge de prova
async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB Connectat correctament");

        // Iniciar tasques programades (Cron jobs)
        const { iniciarCronJobs } = require('./src/utils/cron');
        iniciarCronJobs();

        // Rutes
        app.use('/api/cercador', require('./src/routes/cercador'));
        app.use('/api/usuari', require('./src/routes/usuari'));
        app.use('/api/social', require('./src/routes/social'));
        app.use('/api/mapa', require('./src/routes/mapa'));
        app.use('/api/peticions', require('./src/routes/peticions'));
        app.use('/api/admin', require('./src/routes/admin'));
        app.use('/api/auth', require('./src/routes/auth'));
        app.use('/api/validar-foto', require('./src/routes/camara'));
        app.use('/api/fotos-actuals', require('./src/routes/fotos'));
        app.use('/api/sessionsJoc', require('./src/routes/sessionsJoc'));
        app.use('/api/personatges', require('./src/routes/personatges'));

        // Configurar Socket.io
        const http = require('http');
        const server = http.createServer(app);

        const { configureSocket } = require('./src/routes/gameSocket');
        configureSocket(server);
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