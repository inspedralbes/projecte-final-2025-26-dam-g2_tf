    require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./src/config/db'); 

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {
    try {
        await connectDB();
        console.log("✅ MongoDB Connectat");

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


        const path = require('path');
        app.use('/download', express.static(path.join(__dirname, 'public')));

        const PORT = process.env.PORT || 8088;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor ENGINY a http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error en iniciar:", error); // [REQ] Errors de connexió gestionats al inici
    }
}
startServer();