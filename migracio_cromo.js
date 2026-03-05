require('dotenv').config();
const mongoose = require('mongoose');
const { Lloc } = require('./backend/src/models/index');
const { connectDB } = require('./backend/src/config/db');

async function migrarCromos() {
    try {
        console.log("Connectant a la base de dades...");
        await connectDB();
        console.log("Connexió establerta.");

        // Busquem el lloc de la Sagrada Família. 
        // Si tens un altre _id, canvia'l aquí
        const llocSagrada = await Lloc.findById('699339fa582bb7cbbc64e976');

        if (!llocSagrada) {
            console.log("❌ No s'ha trobat la Sagrada Família amb aquest ID.");
        } else {
            console.log(`📍 Lloc trobat: ${llocSagrada.nom}`);

            // Actualitzem el camp cromo_imatge
            llocSagrada.cromo_imatge = '/Cromos/SagradaFamilia_historica.jpg';
            await llocSagrada.save();

            console.log("✅ Cromo assignat correctament a MongoDB!");
            console.log("Ara el document ja té el camp 'cromo_imatge' guardat.");
        }

    } catch (err) {
        console.error("❌ Error durant la migració:", err);
    } finally {
        console.log("Tancant connexió...");
        await mongoose.connection.close();
        process.exit(0);
    }
}

migrarCromos();
