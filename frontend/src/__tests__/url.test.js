import { netejarUrl } from '../utils/url.js';

describe('netejarUrl - Utilitat de neteja de URLs', () => {

    // TEST 1
    test('Ha de retornar string buit si rep null', () => {
        expect(netejarUrl(null)).toBe('');
    });

    // TEST 2
    test('Ha de retornar string buit si rep undefined', () => {
        expect(netejarUrl(undefined)).toBe('');
    });

    // TEST 3
    test('Ha de retornar string buit si rep string buit', () => {
        expect(netejarUrl('')).toBe('');
    });

    // TEST 4
    test('Ha de retornar la URL vàlida correctament', () => {
        const url = 'https://north.dam.inspedralbes.cat/foto.jpg';
        const resultat = netejarUrl(url);
        expect(resultat).toContain('foto.jpg');
    });

    // TEST 5
    test('Ha de codificar els espais en la URL', () => {
        const urlAmbEspais = 'https://north.dam.inspedralbes.cat/fotos/foto amb espais.jpg';
        const resultat = netejarUrl(urlAmbEspais);

        expect(resultat).not.toContain(' ');
    });

    // TEST 6
    test('Ha de convertir paths relatius en URLs absolutes', () => {
        const pathRelatiu = '/Cromos/SagradaFamilia.jpg';
        const resultat = netejarUrl(pathRelatiu);

        expect(resultat.startsWith('http')).toBe(true);
    });
});
