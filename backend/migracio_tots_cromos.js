require('dotenv').config();
const mongoose = require('mongoose');
const { Lloc } = require('./src/models/index');
const { connectDB } = require('./src/config/db');

// Sanititza la cadena de text eliminant caràcters especials i diacrítics per assegurar compatibilitat en la construcció de rutes d'arxiu.
function formatNameForCromo(name) {
    if (!name) return "Lloc";
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");
}

// Script de manteniment: Assigna dinàmicament la propietat 'cromo_imatge' a tots els documents Lloc que no en tinguin una, deduint la ruta segons el seu nom.
async function migrarTotsCromos() {
    try {
        console.log("Connectant a la base de dades...");
        await connectDB();
        console.log("Connexió establerta.");

        const llocs = await Lloc.find({});
        console.log(`S'han trobat ${llocs.length} llocs.`);

        for (const lloc of llocs) {
            if (lloc.cromo_imatge && lloc.cromo_imatge !== '') {
                console.log(`⏭️ Saltant "${lloc.nom}" (ja té cromo: ${lloc.cromo_imatge})`);
                continue;
            }

            const formattedName = formatNameForCromo(lloc.nom);
            const cromoPath = `/Cromos/${formattedName}_historica.jpg`;

            lloc.cromo_imatge = cromoPath;
            await lloc.save();

            console.log(`✅ Cromo assignat a "${lloc.nom}": ${cromoPath}`);
        }

        console.log("\n🚀 Migració completada amb èxit!");

    } catch (err) {
        console.error("❌ Error durant la migració:", err);
    } finally {
        console.log("Tancant connexió...");
        await mongoose.connection.close();
        process.exit(0);
    }
}

migrarTotsCromos();
