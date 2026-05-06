// ─────────────────────────────────────────────────────────────
// TESTS DE LA UTILITAT netejarUrl (frontend/src/utils/url.js)
// ─────────────────────────────────────────────────────────────
// Comprova que la funció que neteja i normalitza les URLs
// funciona correctament en tots els casos possibles.
// ─────────────────────────────────────────────────────────────

// Importem la funció que volem testar
import { netejarUrl } from '../utils/url.js';

// ─── GRUP DE TESTS ───────────────────────────────────────────
describe('netejarUrl - Utilitat de neteja de URLs', () => {

    // TEST 1: Si no es passa res, ha de retornar string buit
    test('Ha de retornar string buit si rep null', () => {
        expect(netejarUrl(null)).toBe('');
    });

    // TEST 2: Igual amb undefined
    test('Ha de retornar string buit si rep undefined', () => {
        expect(netejarUrl(undefined)).toBe('');
    });

    // TEST 3: Igual amb string buit
    test('Ha de retornar string buit si rep string buit', () => {
        expect(netejarUrl('')).toBe('');
    });

    // TEST 4: Una URL completa i vàlida no s'hauria de trencar
    test('Ha de retornar la URL vàlida correctament', () => {
        const url = 'https://north.dam.inspedralbes.cat/foto.jpg';
        const resultat = netejarUrl(url);
        // Ha de contenir almenys la part del path
        expect(resultat).toContain('foto.jpg');
    });

    // TEST 5: Els espais a la URL s'han d'eliminar o codificar
    test('Ha de codificar els espais en la URL', () => {
        // Creem una URL amb espais
        const urlAmbEspais = 'https://north.dam.inspedralbes.cat/fotos/foto amb espais.jpg';
        const resultat = netejarUrl(urlAmbEspais);

        // El resultat NO ha de tenir espais en blanc
        expect(resultat).not.toContain(' ');
    });

    // TEST 6: Una URL relativa (comença per /) ha de tenir el prefix afegit
    test('Ha de convertir paths relatius en URLs absolutes', () => {
        const pathRelatiu = '/Cromos/SagradaFamilia.jpg';
        const resultat = netejarUrl(pathRelatiu);

        // El resultat ha de ser una URL absoluta (ha de començar per http)
        expect(resultat.startsWith('http')).toBe(true);
    });
});
