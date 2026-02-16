require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB, getDB } = require('./src/config/db'); 


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
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

        // 6. Obrim el servidor amb una funció de callback tradicional
        app.listen(PORT, '0.0.0.0', function() {
        console.log("Servidor funcionant a: http://localhost:" + PORT);
    });

    } catch (error) {
        if (error != null) {
            console.error("Error crític en iniciar el servidor:", error);
        }
    }
}

startServer();