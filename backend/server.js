require('dotenv').config();
// Pedaç de retrocompatibilitat per a util.isNullOrUndefined necessari per a TensorFlow.js en Node >= 22.
const util = require('util');
if (!util.isNullOrUndefined) {
    util.isNullOrUndefined = (val) => val === null || val === undefined;
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/config/db');
const app = express();
const PORT = process.env.PORT || 8088;

// Captura global d'excepcions síncrones per prevenir la caiguda abrupta del procés (process exit).
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
});

// Configuració de CORS per admetre peticions locals i de la xarxa en fase de desenvolupament.
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        if (process.env.ORIGIN_URL && origin === process.env.ORIGIN_URL) {
            return callback(null, true);
        }
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Mapeig de directoris estàtics per exposar els actius multimèdia.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/foto_mapa', express.static(path.join(__dirname, 'public/foto_mapa')));
app.use('/fotos_actuals', express.static(path.join(__dirname, 'public/fotos_actuals')));
app.use('/fotos_historiques', express.static(path.join(__dirname, 'public/fotos_historiques')));
app.use('/personatges', express.static(path.join(__dirname, 'public/personatges')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/Cromos', express.static(path.join(__dirname, 'public/Cromos')));


// Encapsula el muntatge de rutes per facilitar la injecció de middlewares estructurats (ex: control horari).
function configurarRutes(middlewareHorari) {
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