// ─────────────────────────────────────────────────────────────
// TESTS DE LES RUTES D'AUTENTICACIÓ (/api/auth)
// ─────────────────────────────────────────────────────────────
// Comprova que el registre i el login funcionen correctament.
// Supertest simula les peticions HTTP sense aixecar el servidor.
// ─────────────────────────────────────────────────────────────

// "request" és la llibreria que simula les peticions HTTP
const request = require('supertest');

// Importem l'app (sense iniciar el servidor, gràcies al canvi a server.js)
// Atenció: des de src/__tests__/ hem de pujar DOS nivells per arribar a server.js
const app = require('../../server');

// ─── GRUP DE TESTS: REGISTRE ────────────────────────────────
describe('Registre - POST /api/auth/registre', () => {

    // TEST 1: Un registre correcte ha de retornar codi 201
    test('Hauria de crear un usuari nou amb èxit', async () => {
        // Fem la petició de registre
        const resposta = await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'test@test.com',
                contrasenya: '1234',
                nom_usuari: 'usuariTest',
                es_major_confirmada: true  // diem que té més de 18 anys
            });

        // Comprovem que el servidor ha respost amb 201 (creat)
        expect(resposta.status).toBe(201);

        // Comprovem que la resposta diu success: true
        expect(resposta.body.success).toBe(true);

        // Comprovem que l'usuari retornat té el nom correcte
        expect(resposta.body.usuari.nom_usuari).toBe('usuariTest');
    });

    // TEST 2: No es pot registrar el mateix correu dues vegades
    test('Hauria de rebutjar un correu ja registrat', async () => {
        // Primer registre (ha d'anar bé)
        await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'duplicat@test.com',
                contrasenya: '1234',
                nom_usuari: 'usuari1',
                es_major_confirmada: true
            });

        // Segon registre amb el MATEIX correu (ha de fallar)
        const resposta = await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'duplicat@test.com',
                contrasenya: 'abcd',
                nom_usuari: 'usuari2',
                es_major_confirmada: true
            });

        // Ha de retornar error 400 (bad request)
        expect(resposta.status).toBe(400);
        expect(resposta.body.success).toBe(false);
    });
});

// ─── GRUP DE TESTS: LOGIN ────────────────────────────────────
describe('Login - POST /api/auth/login', () => {

    // TEST 3: Login correcte ha de retornar success: true
    test('Hauria de fer login amb credencials correctes', async () => {
        // Primer creem l'usuari
        await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'login@test.com',
                contrasenya: 'contrasenyaSegura',
                nom_usuari: 'loginUser',
                es_major_confirmada: true
            });

        // Ara fem login amb les mateixes credencials
        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                correu: 'login@test.com',
                contrasenya: 'contrasenyaSegura'
            });

        // Ha de respondre correctament
        expect(resposta.status).toBe(200);
        expect(resposta.body.success).toBe(true);
        expect(resposta.body.usuari).toBeDefined();
    });

    // TEST 4: Contrasenya incorrecta ha de retornar error 401
    test('Hauria de rebutjar una contrasenya incorrecta', async () => {
        // Creem l'usuari
        await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'wrong@test.com',
                contrasenya: 'contrasenyaCorrecta',
                nom_usuari: 'wrongUser',
                es_major_confirmada: true
            });

        // Intentem login amb contrasenya incorrecta
        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                correu: 'wrong@test.com',
                contrasenya: 'contrasenyaINcorrecta'
            });

        // Ha de retornar 401 (no autoritzat)
        expect(resposta.status).toBe(401);
        expect(resposta.body.success).toBe(false);
    });

    // TEST 5: Correu que no existeix ha de retornar error 401
    test('Hauria de rebutjar un correu que no existeix', async () => {
        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                correu: 'noexisteix@test.com',
                contrasenya: '1234'
            });

        expect(resposta.status).toBe(401);
        expect(resposta.body.success).toBe(false);
    });
});
