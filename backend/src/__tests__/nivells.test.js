// ─────────────────────────────────────────────────────────────
// TESTS DE LA LÒGICA DE NEGOCI: CÀLCUL DE NIVELLS
// ─────────────────────────────────────────────────────────────
// Comprova que la funció que calcula el nivell dels jugadors
// funciona correctament per a tots els rangs de cromos.
// ─────────────────────────────────────────────────────────────

// ─── Funció que volem testar ─────────────────────────────────
// La copiem aquí directament (és simple i no depèn de la BD)
// per no haver d'importar tot el fitxer de rutes.
function calcularNivell(nombreCromos) {
    if (nombreCromos > 30) return "Mestre Urbà";
    if (nombreCromos >= 16) return "Guia de Barcelona";
    if (nombreCromos >= 6) return "Rastrejador Urbà";
    return "Explorador Novell";
}

// ─── TESTS DEL CÀLCUL DE NIVELL ──────────────────────────────
describe('calcularNivell - Funció de càlcul de nivells', () => {

    // TEST 1: Amb 0 cromos ha de ser el nivell inicial
    test('0 cromos → Explorador Novell', () => {
        expect(calcularNivell(0)).toBe('Explorador Novell');
    });

    // TEST 2: Amb 5 cromos segueix sent el nivell inicial
    test('5 cromos → Explorador Novell (encara no ha pujat)', () => {
        expect(calcularNivell(5)).toBe('Explorador Novell');
    });

    // TEST 3: Amb 6 cromos exactes puja de nivell
    test('6 cromos → Rastrejador Urbà (límit exacte)', () => {
        expect(calcularNivell(6)).toBe('Rastrejador Urbà');
    });

    // TEST 4: Amb 10 cromos segueix al segon nivell
    test('10 cromos → Rastrejador Urbà', () => {
        expect(calcularNivell(10)).toBe('Rastrejador Urbà');
    });

    // TEST 5: Amb 16 cromos exactes puja al tercer nivell
    test('16 cromos → Guia de Barcelona (límit exacte)', () => {
        expect(calcularNivell(16)).toBe('Guia de Barcelona');
    });

    // TEST 6: Amb 25 cromos segueix al tercer nivell
    test('25 cromos → Guia de Barcelona', () => {
        expect(calcularNivell(25)).toBe('Guia de Barcelona');
    });

    // TEST 7: Amb 30 cromos EXACTES segueix al tercer nivell (el 4t és > 30)
    test('30 cromos → Guia de Barcelona (el 4t nivell és per a MÉS DE 30)', () => {
        expect(calcularNivell(30)).toBe('Guia de Barcelona');
    });

    // TEST 8: Amb 31 cromos puja al màxim nivell
    test('31 cromos → Mestre Urbà (límit exacte)', () => {
        expect(calcularNivell(31)).toBe('Mestre Urbà');
    });

    // TEST 9: Amb molts cromos segueix sent el màxim
    test('100 cromos → Mestre Urbà', () => {
        expect(calcularNivell(100)).toBe('Mestre Urbà');
    });
});
