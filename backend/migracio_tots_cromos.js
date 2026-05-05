require('dotenv').config();
const mongoose = require('mongoose');
const { Lloc } = require('./src/models/index');
const { connectDB } = require('./src/config/db');

function formatNameForCromo(name) {
    if (!name) return "Lloc";
    // Remove accents and special characters, then camelcase or just remove spaces
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-zA-Z0-9]/g, ""); // remove non-alphanumeric (fixed 0-9)
}

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
