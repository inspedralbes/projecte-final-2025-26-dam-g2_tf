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
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
    app.use('/api/cromos', require('./src/routes/cromos'));

   
    if (middlewareHorari) {
        app.use('/api/cercador', middlewareHorari, require('./src/routes/cercador'));
        app.use('/api/mapa', middlewareHorari, require('./src/routes/mapa'));
        app.use('/api/validar-foto', middlewareHorari, require('./src/routes/camara'));
        app.use('/api/sessionsJoc', middlewareHorari, require('./src/routes/sessionsJoc'));
    }
}


configurarRutes(null); 

async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB Connectat correctament");

        // Afegir 'ordre: 0' a documents antics que no el tinguin
        const { Lloc } = require('./src/models/index');
        const result = await Lloc.updateMany(
          { ordre: { $exists: false } }, 
          { $set: { ordre: 0 } }
        );
        if (result.modifiedCount > 0) {
          console.log(`Documents antics actualitzats amb ordre: 0: ${result.modifiedCount}`);
        }
 
        const { iniciarCronJobs } = require('./src/utils/cron');
        iniciarCronJobs();

        const { comprovarToqueDeQueda } = require('./src/utils/horari');

        app.use('/api/cercador', comprovarToqueDeQueda, require('./src/routes/cercador'));
        app.use('/api/mapa', comprovarToqueDeQueda, require('./src/routes/mapa'));
        app.use('/api/validar-foto', comprovarToqueDeQueda, require('./src/routes/camara'));
        app.use('/api/sessionsJoc', comprovarToqueDeQueda, require('./src/routes/sessionsJoc'));

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

if (require.main === module) {
    startServer();
}

module.exports = app;