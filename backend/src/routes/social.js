const express = require('express');
const router = express.Router();
const { Post, Perfil, SessioJoc, Ressenya, Usuari } = require('../models');

// GET /social/leaderboard/global: Retorna el rànquing global (top 3) ordenat descendentment pels punts acumulats als perfils.
router.get('/leaderboard/global', async (req, res) => {
    try {
        const topExploradors = await Perfil.find({}) 
            .sort({ punts: -1 })
            .limit(3)
            .select('nom_usuari punts avatar nivell');

        res.json(topExploradors);
    } catch (error) {
        console.error("Error al rànquing:", error);
        res.status(500).json({ message: "Error al carregar el rànquing global" });
    }
});

// POST /social/ressenyes: Crea una nova instància de ressenya valorativa per a un lloc específic al sistema.
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


// GET /social/leaderboard/session/:sessionId: Retorna el llistat de jugadors d'una sessió de joc específica ordenats per puntuació.
router.get('/leaderboard/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessio = await SessioJoc.findById(sessionId).populate('jugadors.id_usuari', 'nom_usuari avatar');


        if (!sessio) return res.status(404).json({ message: "Sessió no trobada" });


        const resultatsPartida = sessio.jugadors.sort((a, b) => b.puntsPartida - a.puntsPartida);


        res.json(resultatsPartida);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar els resultats de la partida" });
    }
});


// GET /social/posts: Retorna un feed cronològic de publicacions globals, permetent el filtratge per categories (tags).
router.get('/posts', async (req, res) => {
    try {
        const { tag } = req.query;
        let query = {};


        if (tag && tag !== 'Tots') {
            query = { tags: tag };
        }


        const posts = await Post.find(query).sort({ timestamp: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar el feed" });
    }
});

// POST /social/posts: Registra i emmagatzema una nova publicació generada per un usuari actiu de la plataforma.
router.post('/posts', async (req, res) => {
    try {
        const { id_usuari, nom_usuari, avatar_usuari, text, imatges_post, tags, ubicacio } = req.body;

        if (!id_usuari) {
            return res.status(400).json({ message: "ID d'usuari requerit" });
        }

        const nouPost = new Post({
            id_usuari,
            nom_usuari,
            avatar_usuari: avatar_usuari || '',
            text: text || '',
            imatges_post: imatges_post || [],
            tags: tags || [],
            ubicacio: ubicacio || '',
            likes: [],
            comentaris: []
        });

        await nouPost.save();
        res.status(201).json({ success: true, post: nouPost });
    } catch (error) {
        console.error("Error creando post:", error);
        res.status(500).json({ message: "Error al guardar la publicació", detall: error.message });
    }
});

// POST /social/amics/eliminar: Processa l'eliminació bidireccional d'una relació d'amistat entre dos perfils.
router.post('/amics/eliminar', async (req, res) => {
  const { el_meu_perfil_id, id_amic_a_borrar } = req.body;

  try {
    await Perfil.findByIdAndUpdate(el_meu_perfil_id, {
      $pull: { amics: id_amic_a_borrar }
    });

    await Perfil.findByIdAndUpdate(id_amic_a_borrar, {
      $pull: { amics: el_meu_perfil_id }
    });

    res.status(200).json({ message: "Amic eliminat correctament" });
  } catch (error) {
    console.error("Error al eliminar amic:", error);
    res.status(500).json({ message: "Error intern del servidor" });
  }
});

// POST /social/posts/:postId/like: Actualitza (activa/desactiva) l'estat d'interacció de 'M'agrada' per a un usuari sobre una publicació.
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
        res.json({ success: true, likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: "Error al gestionar el m'agrada" });
    }
});


// DELETE /social/posts/:postId: Elimina permanentment un document de publicació del sistema.
router.delete('/posts/:postId', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.postId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
    }
});


// POST /social/posts/:postId/comentari: Afegeix un nou comentari a una publicació existent i actualitza l'esquema Mongoose associat.
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
        post.markModified('comentaris');
        await post.save();


        res.status(201).json({ success: true, comentari: nouComentari });
    } catch (error) {
        console.error("Error al comentar:", error);
        res.status(500).json({ message: "Error al publicar el comentari" });
    }
});

// GET /social/admin/ressenyes: Llista totes les ressenyes del sistema amb dades de l'usuari i ubicació per a finalitats de moderació.
router.get('/admin/ressenyes', async (req, res) => {
    try {
        const ressenyes = await Ressenya.find()
            .populate('id_usuari', 'nom_usuari')
            .populate('id_lloc', 'nom tags')
            .sort({ data: -1 });
        res.json(ressenyes);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar ressenyes" });
    }
});

// DELETE /social/admin/ressenyes/:id: Elimina de forma definitiva una ressenya detectada com a inadequada per un administrador.
router.delete('/admin/ressenyes/:id', async (req, res) => {
    try {
        await Ressenya.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Ressenya eliminada correctament" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la ressenya" });
    }
});

// GET /social/admin/posts: Obté el llistat global de publicacions prioritzant aquelles que han estat reportades pels usuaris.
router.get('/admin/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ reportat: -1, timestamp: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error al carregar posts" });
    }
});
// DELETE /social/posts/:postId/comentari/:comentariId: Extreu un comentari específic de la matriu de comentaris d'una publicació.
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

// PUT /social/admin/posts/:postId/revisat: Restableix l'estat d'una publicació reportada, marcant-la com a segura després de la revisió.
router.put('/admin/posts/:postId/revisat', async (req, res) => {
    try {
        const { postId } = req.params;
        await Post.findByIdAndUpdate(postId, {
            $set: { reportat: false },
            $unset: { data_report: "", reportat_per: "" }
        });
        res.json({ success: true, message: "Post marcat com a segur" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualitzar el post" });
    }
});


// POST /social/posts/:postId/comentari/:comentariId/report: Marca un comentari específic com a reportat i n'emmagatzema l'autor i la data.
router.post('/posts/:postId/comentari/:comentariId/report', async (req, res) => {
    try {
        const { postId, comentariId } = req.params;
        const { id_usuari_reporter, motiu } = req.body;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post no trobat" });

        const comentari = post.comentaris.find(c => c.id_comentari === comentariId);
        if (!comentari) return res.status(404).json({ message: "Comentari no trobat" });

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

// POST /social/posts/:postId/report: Registra un avís sobre una publicació global alterant el seu estat a 'reportat' per a la moderació.
router.post('/posts/:postId/report', async (req, res) => {
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

// PUT /social/admin/posts/:postId/comentaris/:comentariId/revisat: Valida i restaura la visibilitat d'un comentari previament reportat.
router.put('/admin/posts/:postId/comentaris/:comentariId/revisat', async (req, res) => {
    try {
        const { postId, comentariId } = req.params;

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

// GET /social/search: Cerca perfils d'usuari actius mitjançant expressió regular sobre el nom (insensible a majúscules).
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

// POST /social/peticions/enviar: Registra una sol·licitud d'amistat pendent a l'esquema del perfil de destinació.
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

// POST /social/peticions/acceptar: Valida i consolida l'amistat bidireccional, esborrant la sol·licitud pendent d'ambdós perfils.
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

// POST /social/peticions/rebutjar: Denega i elimina de la base de dades una petició d'amistat pendent.
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

