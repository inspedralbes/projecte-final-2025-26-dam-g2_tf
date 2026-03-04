const { SessioJoc } = require('../models');

// Función que elimina las partidas creadas hace más de 2 días
const eliminarPartidasAntiguas = async () => {
    try {
        const haceDosDias = new Date();
        haceDosDias.setDate(haceDosDias.getDate() - 2);

        // Buscar la primera partida de todas (la más antigua) para protegerla
        const primeraPartida = await SessioJoc.findOne().sort({ temps_inici: 1 });

        const filtroEliminacion = {
            temps_inici: { $lt: haceDosDias }
        };

        // Si existe una partida más antigua, la excluimos del borrado para que nunca se elimine
        if (primeraPartida) {
            filtroEliminacion._id = { $ne: primeraPartida._id };
        }

        // Eliminar las partidas donde el tiempo de inicio es menor a hace 2 días (excepto la primera)
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

// Iniciar todos los cron jobs (o tareas programadas)
const iniciarCronJobs = () => {
    console.log('[Cron] Configurant tasques programades (neteja de partides)...');

    // Ejecutar inmediatamente una vez para limpiar al arrancar el servidor
    eliminarPartidasAntiguas();

    // Luego, ejecutar cada 12 horas (12 * 60 * 60 * 1000 ms = 43200000 ms)
    setInterval(eliminarPartidasAntiguas, 12 * 60 * 60 * 1000);
};

module.exports = {
    iniciarCronJobs
};
