function calcularNivell(nombreCromos) {
    if (nombreCromos > 30) return "Mestre Urbà";
    if (nombreCromos >= 16) return "Guia de Barcelona";
    if (nombreCromos >= 6) return "Rastrejador Urbà";
    return "Explorador Novell";
}

// TESTS CÀLCUL DE NIVELL
describe('calcularNivell - Funció de càlcul de nivells', () => {

    // TEST 1
    test('0 cromos → Explorador Novell', () => {
        expect(calcularNivell(0)).toBe('Explorador Novell');
    });

    // TEST 2
    test('5 cromos → Explorador Novell (encara no ha pujat)', () => {
        expect(calcularNivell(5)).toBe('Explorador Novell');
    });

    // TEST 3
    test('6 cromos → Rastrejador Urbà (límit exacte)', () => {
        expect(calcularNivell(6)).toBe('Rastrejador Urbà');
    });

    // TEST 4
    test('10 cromos → Rastrejador Urbà', () => {
        expect(calcularNivell(10)).toBe('Rastrejador Urbà');
    });

    // TEST 5
    test('16 cromos → Guia de Barcelona (límit exacte)', () => {
        expect(calcularNivell(16)).toBe('Guia de Barcelona');
    });

    // TEST 6
    test('25 cromos → Guia de Barcelona', () => {
        expect(calcularNivell(25)).toBe('Guia de Barcelona');
    });

    // TEST 7
    test('30 cromos → Guia de Barcelona (el 4t nivell és per a MÉS DE 30)', () => {
        expect(calcularNivell(30)).toBe('Guia de Barcelona');
    });

    // TEST 8
    test('31 cromos → Mestre Urbà (límit exacte)', () => {
        expect(calcularNivell(31)).toBe('Mestre Urbà');
    });

    // TEST 9
    test('100 cromos → Mestre Urbà', () => {
        expect(calcularNivell(100)).toBe('Mestre Urbà');
    });
});
