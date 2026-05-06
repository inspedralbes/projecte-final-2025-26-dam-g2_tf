// ─────────────────────────────────────────────────────────────
// FITXER DE CONFIGURACIÓ DELS TESTS DEL BACKEND
// ─────────────────────────────────────────────────────────────
// Aquest fitxer s'executa AUTOMÀTICAMENT abans de cada test.
// Crea una base de dades MongoDB a la memòria RAM del servidor
// per no tocar mai la base de dades real.
// ─────────────────────────────────────────────────────────────

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Variable per guardar el servidor de MongoDB en memòria
let mongoServer;

// beforeAll: s'executa UNA VEGADA abans de tots els tests
beforeAll(async () => {
    // Creem el servidor de MongoDB en memòria (completament aïllat)
    mongoServer = await MongoMemoryServer.create();

    // Obtenim la URL d'aquest servidor temporal
    const uri = mongoServer.getUri();

    // Connectem mongoose a la BD de memòria (no la real!)
    await mongoose.connect(uri);
});

// afterAll: s'executa UNA VEGADA després de tots els tests
afterAll(async () => {
    // Desconnectem de la BD
    await mongoose.disconnect();

    // Aturem el servidor de MongoDB en memòria
    await mongoServer.stop();
});

// afterEach: s'executa DESPRÉS DE CADA TEST individual
afterEach(async () => {
    // Netegem totes les col·leccions entre tests
    // Així cada test comença amb la BD buida i neta
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});
