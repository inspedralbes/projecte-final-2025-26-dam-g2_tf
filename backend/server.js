require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/db');
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [process.env.ORIGIN_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Permetre peticions sense origen (com apps mòbils o curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Servir la carpeta public com a base per a tot
app.use(express.static(path.join(__dirname, 'public')));

// Rutes específiques per a carpetes de fotos (opcional però ajuda a clarificar)
app.use('/foto_mapa', express.static(path.join(__dirname, 'public/foto_mapa')));
app.use('/fotos_actuals', express.static(path.join(__dirname, 'public/fotos_actuals')));
app.use('/fotos_historiques', express.static(path.join(__dirname, 'public/fotos_historiques')));
app.use('/personatges', express.static(path.join(__dirname, 'public/personatges')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/Cromos', express.static(path.join(__dirname, 'public/Cromos')));
// Funció que configura totes les rutes de l'app
// La separem del servidor per poder fer tests sense aixecar el servidor real
function configurarRutes(middlewareHorari) {
    // Rutes que NO necessiten control d'horari
    app.use('/api/usuari', require('./src/routes/usuari'));
    app.use('/api/social', require('./src/routes/social'));
    app.use('/api/peticions', require('./src/routes/peticions'));
    app.use('/api/admin', require('./src/routes/admin'));
    app.use('/api/auth', require('./src/routes/auth'));
    app.use('/api/fotos-actuals', require('./src/routes/fotos'));
    app.use('/api/fotos-historiques', require('./src/routes/fotos_historiques'));
    app.use('/api/personatges', require('./src/routes/personatges'));
    app.use('/api/verificacio', require('./src/routes/verificacio'));
    app.use('/api/carta-lore', require('./src/routes/carta_lore'));

    // Rutes que SÍ necessiten el middleware de control d'horari
    if (middlewareHorari) {
        app.use('/api/cercador', middlewareHorari, require('./src/routes/cercador'));
        app.use('/api/mapa', middlewareHorari, require('./src/routes/mapa'));
        app.use('/api/validar-foto', middlewareHorari, require('./src/routes/camara'));
        app.use('/api/sessionsJoc', middlewareHorari, require('./src/routes/sessionsJoc'));
    }
}

// ─────────────────────────────────────────────────────────────
// Registrem les rutes IMMEDIATAMENT quan es carrega el mòdul
// Així quan els tests fan `require('./server')` ja troben les rutes
// (no cal que es cridi startServer())
// ─────────────────────────────────────────────────────────────
configurarRutes(null); // null = sense middleware d'horari (ok pels tests)

async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB Connectat correctament");

        // Iniciar tasques programades (Cron jobs)
        const { iniciarCronJobs } = require('./src/utils/cron');
        iniciarCronJobs();

        const { comprovarToqueDeQueda } = require('./src/utils/horari');

        // Afegim les rutes AMB middleware d'horari per al servidor real
        // (les rutes sense horari ja s'han afegit a dalt)
        app.use('/api/cercador', comprovarToqueDeQueda, require('./src/routes/cercador'));
        app.use('/api/mapa', comprovarToqueDeQueda, require('./src/routes/mapa'));
        app.use('/api/validar-foto', comprovarToqueDeQueda, require('./src/routes/camara'));
        app.use('/api/sessionsJoc', comprovarToqueDeQueda, require('./src/routes/sessionsJoc'));

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

// Exportem l'app perquè els tests la puguin fer servir sense aixecar el servidor
// require.main === module vol dir: "s'està executant directament? (node server.js)"
if (require.main === module) {
    // Si executen 'node server.js' directament, iniciem el servidor normalment
    startServer();
}

module.exports = app;