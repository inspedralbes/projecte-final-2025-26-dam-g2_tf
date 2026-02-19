require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { connectDB } = require('./src/config/db');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: process.env.ORIGIN_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB Connectat correctament");

        // 3. Rutes (Ara aquestes rutes usaran els Models de Mongoose internament)
        app.use('/api/cercador', require('./src/routes/cercador'));
        app.use('/api/usuari', require('./src/routes/usuari'));
        app.use('/api/social', require('./src/routes/social'));
        app.use('/api/mapa', require('./src/routes/mapa'));
        app.use('/api/peticions', require('./src/routes/peticions'));
        app.use('/api/admin', require('./src/routes/admin'));
        app.use('/api/auth', require('./src/routes/auth'));

        app.use('/download', express.static(path.join(__dirname, 'public')));

        // 4. Configurar Socket.io
        const http = require('http');

        const server = http.createServer(app);

        // 4. Configurar Socket.io
        require('./src/routes/gameSocket')(server);


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