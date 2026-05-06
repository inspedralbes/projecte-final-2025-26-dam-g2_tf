const request = require('supertest');

const app = require('../../server');

// TESTS: REGISTRE 
describe('Registre - POST /api/auth/registre', () => {

    // TEST 1
    test('Hauria de crear un usuari nou amb èxit', async () => {
        const resposta = await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'test@test.com',
                contrasenya: '1234',
                nom_usuari: 'usuariTest',
                es_major_confirmada: true  
            });

        expect(resposta.status).toBe(201);
        expect(resposta.body.success).toBe(true);
        expect(resposta.body.usuari.nom_usuari).toBe('usuariTest');
    });

    // TEST 2
    test('Hauria de rebutjar un correu ja registrat', async () => {
        await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'duplicat@test.com',
                contrasenya: '1234',
                nom_usuari: 'usuari1',
                es_major_confirmada: true
            });

        const resposta = await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'duplicat@test.com',
                contrasenya: 'abcd',
                nom_usuari: 'usuari2',
                es_major_confirmada: true
            });

        expect(resposta.status).toBe(400);
        expect(resposta.body.success).toBe(false);
    });
});

// TESTS: LOGIN
describe('Login - POST /api/auth/login', () => {

    // TEST 3
    test('Hauria de fer login amb credencials correctes', async () => {
        await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'login@test.com',
                contrasenya: 'contrasenyaSegura',
                nom_usuari: 'loginUser',
                es_major_confirmada: true
            });

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                correu: 'login@test.com',
                contrasenya: 'contrasenyaSegura'
            });

        expect(resposta.status).toBe(200);
        expect(resposta.body.success).toBe(true);
        expect(resposta.body.usuari).toBeDefined();
    });

    // TEST 4
    test('Hauria de rebutjar una contrasenya incorrecta', async () => {
        await request(app)
            .post('/api/auth/registre')
            .send({
                correu: 'wrong@test.com',
                contrasenya: 'contrasenyaCorrecta',
                nom_usuari: 'wrongUser',
                es_major_confirmada: true
            });

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                correu: 'wrong@test.com',
                contrasenya: 'contrasenyaINcorrecta'
            });

        expect(resposta.status).toBe(401);
        expect(resposta.body.success).toBe(false);
    });

    // TEST 5
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
