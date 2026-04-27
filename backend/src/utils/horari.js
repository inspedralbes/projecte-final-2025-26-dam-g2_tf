/**
 * Middleware dinàmic per al control horari per lloc.
 * S'utilitza passant el lloc ja carregat al req.lloc.
 * Si no hi ha lloc o el lloc no té control_horari actiu, passa al next().
 */
const comprovarToqueDeQueda = (req, res, next) => {
    try {
        const lloc = req.lloc; // El lloc s'ha de posar a req.lloc per la ruta que usa aquest middleware

        if (!lloc || !lloc.control_horari || !lloc.control_horari.actiu) {
            return next();
        }

        const { hora_inici, hora_fi } = lloc.control_horari;
        const horaActual = new Date().getHours();

        let bloquejat = false;

        if (hora_inici > hora_fi) {
            // Creua la mitjanit (ex: 22 a 07)
            if (horaActual >= hora_inici || horaActual < hora_fi) {
                bloquejat = true;
            }
        } else {
            // Dins del mateix dia (ex: 14 a 16)
            if (horaActual >= hora_inici && horaActual < hora_fi) {
                bloquejat = true;
            }
        }

        if (bloquejat) {
            return res.status(403).json({ codi: 'TOQUE_DE_QUEDA', message: 'Aquest lloc està tancat per control horari.' });
        }

        next();
    } catch (error) {
        console.error('Error al comprovar el toque de queda del lloc:', error);
        next();
    }
};

module.exports = { comprovarToqueDeQueda };
