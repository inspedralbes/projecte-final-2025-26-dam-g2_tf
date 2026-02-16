require('dotenv').config();
const { connectDB, getDB, closeDB } = require('./src/config/db');

const llocsPerAfegir = [
  {
    nom: "Búnquers del Carmel",
    ubicacio: {
      type: "Point",
      coordinates: [2.1616, 41.4193] // [Longitud, Latitud]
    },
    imatge_referencia: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Bunkers_del_Carmel.jpg/300px-Bunkers_del_Carmel.jpg",
    descripcio: "Antiga bateria antiaèria amb vistes a tota la ciutat.",
    explicacio_historica: "Construïts durant la Guerra Civil Espanyola...",
    dificultat: "Mig",
    tags: ["Vistes", "Història", "Guerra Civil"],
    pistes: ["Busca l'angle on es veu la Sagrada Família centrada."],
    control_horari: { hora_tancament: "21:00", actiu: true },
    millors_temps: []
  },
  {
    nom: "Arc de Triomf",
    ubicacio: {
      type: "Point",
      coordinates: [2.1806, 41.3910]
    },
    imatge_referencia: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Arc_de_Triomf_de_Barcelona.jpg/300px-Arc_de_Triomf_de_Barcelona.jpg",
    descripcio: "Monument construït per a l'Exposició Universal de 1888.",
    explicacio_historica: "Dissenyat per Josep Vilaseca...",
    dificultat: "Baixa",
    tags: ["Gòtic", "Història", "Monument"],
    pistes: ["Passa per sota de l'arc central."],
    control_horari: { hora_tancament: "24:00", actiu: true },
    millors_temps: []
  }
];

async function executarSeed() {
  try {
    console.log('⏳ Connectant a MongoDB per afegir dades...');
    await connectDB();
    const db = getDB();

    // 2. Insereix els nous llocs
    const result = await db.collection('locations').insertMany(llocsPerAfegir);
    
    console.log(`✅ Èxit! S'han afegit ${result.insertedCount} llocs.`);
  } catch (error) {
    console.error('❌ Error durant el seed:', error);
  } finally {
    await closeDB();
    process.exit();
  }
}

executarSeed();