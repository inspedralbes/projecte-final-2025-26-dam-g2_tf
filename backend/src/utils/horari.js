// Middleware d'intercepció: Bloqueja l'accés a rutes de localitzacions basant-se en les restriccions horàries definides a 'req.lloc.control_horari'.
const comprovarToqueDeQueda = (req, res, next) => {
    try {
        const lloc = req.lloc;

        if (!lloc || !lloc.control_horari || !lloc.control_horari.actiu) {
            return next();
        }

        const { hora_inici, hora_fi } = lloc.control_horari;
        const horaActual = new Date().getHours();

        let bloquejat = false;

        if (hora_inici > hora_fi) {
            if (horaActual >= hora_inici || horaActual < hora_fi) {
                bloquejat = true;
            }
        } else {
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
