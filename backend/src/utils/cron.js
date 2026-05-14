const { SessioJoc } = require('../models');

// Elimina de la base de dades les sessions de joc amb més de 48 hores d'antiguitat, protegint la partida fundacional (la més antiga).
const eliminarPartidasAntiguas = async () => {
    try {
        const haceDosDias = new Date();
        haceDosDias.setDate(haceDosDias.getDate() - 2);

        const primeraPartida = await SessioJoc.findOne().sort({ temps_inici: 1 });

        const filtroEliminacion = {
            temps_inici: { $lt: haceDosDias }
        };

        if (primeraPartida) {
            filtroEliminacion._id = { $ne: primeraPartida._id };
        }

        const resultado = await SessioJoc.deleteMany(filtroEliminacion);

        if (resultado.deletedCount > 0) {
            console.log(`[Cron] S'han eliminat ${resultado.deletedCount} partides (sessions de joc) creades fa més de 2 dies.`);
        } else {
            console.log(`[Cron] No s'han trobat partides de fa més de 2 dies per eliminar.`);
        }
    } catch (error) {
        console.error('[Cron] Error eliminant les partides antigues:', error);
    }
};

// Purga les peticions de verificació d'edat pendents amb més de 14 dies, eliminant les imatges del sistema de fitxers.
const netejaVerificacionsAntigues = async () => {
    try {
        const { Usuari } = require('../models');
        const fs = require('fs');
        const path = require('path');

        const faDosSetmanes = new Date();
        faDosSetmanes.setDate(faDosSetmanes.getDate() - 14);

        const pendentsAntics = await Usuari.find({
            verificacio_estat: 'pendent',
            data_verificacio_sollicitud: { $lt: faDosSetmanes }
        });

        if (pendentsAntics.length > 0) {
            console.log(`[Cron] Netejant ${pendentsAntics.length} verificacions antigues...`);
            for (const u of pendentsAntics) {
                u.verificacio_estat = 'rebutjat';
                if (u.verificacio_imatge) {
                    const cami = path.join(__dirname, '../../public', u.verificacio_imatge);
                    if (fs.existsSync(cami)) fs.unlinkSync(cami);
                    u.verificacio_imatge = '';
                }
                await u.save();
            }
        }
    } catch (error) {
        console.error('[Cron] Error netejant verificacions:', error);
    }
};

// Configura els temporitzadors de les tasques de manteniment asíncrones (Cron Jobs).
const iniciarCronJobs = () => {
    console.log('[Cron] Configurant tasques programades (neteja de partides i verificacions)...');

    eliminarPartidasAntiguas();
    netejaVerificacionsAntigues();

    setInterval(eliminarPartidasAntiguas, 12 * 60 * 60 * 1000);
    setInterval(netejaVerificacionsAntigues, 24 * 60 * 60 * 1000);
};

module.exports = {
    iniciarCronJobs
};
