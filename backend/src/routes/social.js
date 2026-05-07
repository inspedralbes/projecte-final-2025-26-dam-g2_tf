const express = require('express');
const router = express.Router();
const { Post, Perfil, SessioJoc, Ressenya, Usuari } = require('../models');


router.get('/leaderboard/global', async (req, res) => {
    try {
        // Eliminem el filtre 'mostrarAlRanking' si no existeix al model
        // O el mantenim si penses afegir-lo al PerfilSchema
        const topExploradors = await Perfil.find({}) 
            .sort({ punts: -1 }) // De més a menys punts
            .limit(3)
            .select('nom_usuari punts avatar nivell'); // Seleccionem els camps necessaris

        res.json(topExploradors);
    } catch (error) {
        console.error("Error al rànquing:", error);
        res.status(500).json({ message: "Error al carregar el rànquing global" });
    }
});


router.post('/ressenyes', async (req, res) => {
    try {
        const { id_lloc, id_usuari, estrelles, comentari } = req.body;
        const novaRessenya = new Ressenya({
            id_lloc,
            id_usuari,
            estrelles,
            comentari
        });
        await novaRessenya.save();
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar la ressenya" });
    }
});


// --- NOVA RUTA: Rànquing de la sessió finalitzada ---
router.get('/leaderboard/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Busquem la sessió de joc per obtenir els jugadors i els seus temps/punts
        // Nota: Assumim que tens un model 'SessioJoc' o similar
        const sessio = await SessioJoc.findById(sessionId).populate('jugadors.id_usuari', 'nom_usuari avatar');


        if (!sessio) return res.status(404).json({ message: "Sessió no trobada" });


        // Ordenem els jugadors pels punts obtinguts en aquesta partida específica
        const resultatsPartida = sessio.jugadors.sort((a, b) => b.puntsPartida - a.puntsPartida);


        res.json(resultatsPartida);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar els resultats de la partida" });
    }
});


// 1. Obtenir tots els posts
router.get('/posts', async (req, res) => {
    try {
        const { tag } = req.query;
        let query = {};


        if (tag && tag !== 'Tots') {
            query = { tags: tag };
        }


        // Mongoose: Busquem posts, ordenem per data descendent
        const posts = await Post.find(query).sort({ timestamp: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar el feed" });
    }
});


router.post('/posts', async (req, res) => {
    try {
        // 1. Extraiem 'imatges_post' (en plural) que és el que envia el frontend
        const { id_usuari, nom_usuari, avatar_usuari, text, imatges_post, tags, ubicacio } = req.body;

        if (!id_usuari) {
            return res.status(400).json({ message: "ID d'usuari requerit" });
        }

        const nouPost = new Post({
            id_usuari,
            nom_usuari,
            avatar_usuari: avatar_usuari || '',
            text: text || '',
            // Ara fem servir la variable correcta que hem extret a dalt
            imatges_post: imatges_post || [],
            tags: tags || [],
            ubicacio: ubicacio || '',
            likes: [],
            comentaris: []
        });

        await nouPost.save();
        res.status(201).json({ success: true, post: nouPost });
    } catch (error) {
        // Aquest console.log et mostrarà l'error real a la teva terminal de VS Code
        console.error("Error creando post:", error);
        res.status(500).json({ message: "Error al guardar la publicació", detall: error.message });
    }
});

// Ruta al fitxer backend/src/routes/social.js

router.post('/amics/eliminar', async (req, res) => {
  const { el_meu_perfil_id, id_amic_a_borrar } = req.body;

  try {
    // 1. Treure l'amic del meu perfil
    await Perfil.findByIdAndUpdate(el_meu_perfil_id, {
      $pull: { amics: id_amic_a_borrar }
    });

    // 2. Treure'm a mi de la llista d'amics de l'altre (amistat bidireccional)
    await Perfil.findByIdAndUpdate(id_amic_a_borrar, {
      $pull: { amics: el_meu_perfil_id }
    });

    res.status(200).json({ message: "Amic eliminat correctament" });
  } catch (error) {
    console.error("Error al eliminar amic:", error);
    res.status(500).json({ message: "Error intern del servidor" });
  }
});

router.post('/posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { id_usuari } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post no trobat" });

        const index = post.likes.indexOf(id_usuari);

        if (index === -1) {
            post.likes.push(id_usuari);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        // DEVOLVEMOS EL ARRAY ACTUALIZADO
        res.json({ success: true, likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: "Error al gestionar el m'agrada" });
    }
});


// 4. Eliminar post
router.delete('/posts/:postId', async (req, res) => {
    try {
        // Mongoose gestiona l'ObjectId sol
        await Post.findByIdAndDelete(req.params.postId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
    }
});


router.post('/posts/:postId/comentari', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post no trobat" });


        const nouComentari = {
            id_comentari: Date.now().toString(),
            id_usuari: req.body.userId,
            nom_usuari: req.body.nom_usuari,
            avatar_usuari: req.body.avatar_usuari || '',
            text: req.body.text,
            timestamp: new Date()
        };


        post.comentaris.push(nouComentari);
        post.markModified('comentaris'); // Obligatorio para arrays en Mongoose
        await post.save();


        res.status(201).json({ success: true, comentari: nouComentari });
    } catch (error) {
        console.error("Error al comentar:", error);
        res.status(500).json({ message: "Error al publicar el comentari" });
    }
});

// --- MODERACIÓ PER A ADMINISTRADORS ---

// Obtenir totes les ressenyes (per a la vista de moderació)
router.get('/admin/ressenyes', async (req, res) => {
    try {
        // Fem un .populate per veure el nom de l'usuari i el lloc si cal
        const ressenyes = await Ressenya.find()
            .populate('id_usuari', 'nom_usuari')
            .populate('id_lloc', 'nom')
            .sort({ data: -1 });
        res.json(ressenyes);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar ressenyes" });
    }
});

// Eliminar una ressenya
router.delete('/admin/ressenyes/:id', async (req, res) => {
    try {
        await Ressenya.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Ressenya eliminada correctament" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la ressenya" });
    }
});

// Obtenir tots els posts (per moderar posts sencers)
router.get('/admin/posts', async (req, res) => {
    try {
        // MODIFICACIÓ: Ordenem primer per 'reportat' (perquè els avisos surtin a dalt)
        // i després per data (timestamp)
        const posts = await Post.find().sort({ reportat: -1, timestamp: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar posts" });
    }
});
// Esta ruta permite borrar comentarios (tanto para el feed normal como para el panel de admin)
router.delete('/posts/:postId/comentari/:comentariId', async (req, res) => {
    try {
        const { postId, comentariId } = req.params;
        const result = await Post.findByIdAndUpdate(postId, {
            $pull: { comentaris: { id_comentari: comentariId } }
        });

        if (!result) return res.status(404).json({ message: "Post no trobat" });
        res.json({ success: true, message: "Comentari eliminat correctament" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el comentari" });
    }
});

// >>> AFEGEIX AQUESTA RUTA AQUÍ (PER AL BOTÓ VERD "OK/REVISAT") <<<
router.put('/admin/posts/:postId/revisat', async (req, res) => {
    try {
        const { postId } = req.params;
        // Treiem la marca de reportat i les dades del report
        await Post.findByIdAndUpdate(postId, {
            $set: { reportat: false },
            $unset: { data_report: "", reportat_per: "" }
        });
        res.json({ success: true, message: "Post marcat com a segur" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualitzar el post" });
    }
});


// --- NOVA RUTA: Reportar un comentari ---
router.post('/posts/:postId/comentari/:comentariId/report', async (req, res) => {
    try {
        const { postId, comentariId } = req.params;
        const { id_usuari_reporter, motiu } = req.body;

        // Busquem el post i marquem el comentari com a reportat
        // Nota: Això dependrà de si el teu esquema de Post permet guardar l'estat 'reportat' dins de l'array de comentaris.
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post no trobat" });

        const comentari = post.comentaris.find(c => c.id_comentari === comentariId);
        if (!comentari) return res.status(404).json({ message: "Comentari no trobat" });

        // Afegim una propietat 'reportat' al comentari si no existeix
        comentari.reportat = true;
        comentari.reportat_per = id_usuari_reporter;
        comentari.data_report = new Date();

        post.markModified('comentaris');
        await post.save();

        res.json({ success: true, message: "Comentari reportat correctament" });
    } catch (error) {
        console.error("Error al reportar:", error);
        res.status(500).json({ message: "Error al processar el report" });
    }
});

router.post('/posts/:postId/report', async (req, res) => { // Canviat de 'report_post' a 'report'
    try {
        const { postId } = req.params;
        const { id_usuari_reporter } = req.body;

        const post = await Post.findByIdAndUpdate(postId, {
            $set: {
                reportat: true,
                data_report: new Date(),
                reportat_per: id_usuari_reporter
            }
        }, { new: true });

        if (!post) return res.status(404).json({ message: "Post no trobat" });
        res.json({ success: true, message: "Post reportat correctament" });
    } catch (error) {
        res.status(500).json({ message: "Error al processar el report" });
    }
});

// Ruta per marcar un COMENTARI com a revisat/segur (treure el flag de reportat)
router.put('/admin/posts/:postId/comentaris/:comentariId/revisat', async (req, res) => {
    try {
        const { postId, comentariId } = req.params;

        // Busquem el post i dins de l'array de comentaris, posem reportat a false
        const post = await Post.findOneAndUpdate(
            { _id: postId, "comentaris.id_comentari": comentariId },
            { $set: { "comentaris.$.reportat": false } },
            { new: true }
        );

        if (!post) return res.status(404).json({ message: "No s'ha trobat el comentari" });

        res.json({ success: true, message: "Comentari marcat com a segur" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualitzar el comentari" });
    }
});

// --- GESTIÓ D'AMICS ---

// Cercar usuaris per nom d'usuari (regex parcial)
router.get('/search', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ message: "Nom d'usuari requerit" });

        const resultats = await Perfil.find({
            nom_usuari: { $regex: username, $options: 'i' }
        }).select('nom_usuari inventari_cromos _id avatar');

        res.json(resultats);
    } catch (error) {
        res.status(500).json({ message: "Error en la cerca" });
    }
});

// Enviar petició d'amistat
router.post('/peticions/enviar', async (req, res) => {
    try {
        const { de_perfil_id, de_nom, per_a_perfil_id } = req.body;

        const perfilDesti = await Perfil.findById(per_a_perfil_id);
        if (!perfilDesti) return res.status(404).json({ message: "Perfil no trobat" });

        if (!perfilDesti.sollicituds_pendents) perfilDesti.sollicituds_pendents = [];
        if (!perfilDesti.amics) perfilDesti.amics = [];

        if (perfilDesti.amics.includes(de_perfil_id)) {
            return res.status(400).json({ message: "Ja sou amics" });
        }

        const jaEnviada = perfilDesti.sollicituds_pendents.some(s =>
            s.id_perfil && s.id_perfil.toString() === de_perfil_id
        );

        if (jaEnviada) return res.status(400).json({ message: "Sol·licitud ja enviada" });

        perfilDesti.sollicituds_pendents.push({
            id_perfil: de_perfil_id,
            nom_usuari: de_nom
        });

        await perfilDesti.save();
        res.json({ success: true, message: "Sol·licitud enviada" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar la petició" });
    }
});

// Acceptar petició d'amistat
router.post('/peticions/acceptar', async (req, res) => {
    try {
        const { el_meu_perfil_id, id_nou_amic_perfil } = req.body;

        const jo = await Perfil.findById(el_meu_perfil_id);
        const ell = await Perfil.findById(id_nou_amic_perfil);

        if (!jo || !ell) return res.status(404).json({ message: "Perfil no trobat" });

        if (!jo.amics) jo.amics = [];
        if (!ell.amics) ell.amics = [];

        if (!jo.amics.includes(id_nou_amic_perfil)) jo.amics.push(id_nou_amic_perfil);
        if (!ell.amics.includes(el_meu_perfil_id)) ell.amics.push(el_meu_perfil_id);

        jo.sollicituds_pendents = jo.sollicituds_pendents.filter(
            s => s.id_perfil && s.id_perfil.toString() !== id_nou_amic_perfil.toString()
        );

        await jo.save();
        await ell.save();

        res.json({ success: true, user: jo });
    } catch (error) {
        res.status(500).json({ message: "Error en acceptar amistat" });
    }
});

// Rebutjar petició d'amistat
router.post('/peticions/rebutjar', async (req, res) => {
    try {
        const { el_meu_perfil_id, id_amic_perfil } = req.body;

        const jo = await Perfil.findById(el_meu_perfil_id);
        if (!jo) return res.status(404).json({ message: "Perfil no trobat" });

        jo.sollicituds_pendents = jo.sollicituds_pendents.filter(
            s => s.id_perfil && s.id_perfil.toString() !== id_amic_perfil.toString()
        );

        await jo.save();
        res.json({ success: true, message: "Sol·licitud rebutjada" });
    } catch (error) {
        res.status(500).json({ message: "Error en rebutjar la sol·licitud" });
    }
});

module.exports = router;

