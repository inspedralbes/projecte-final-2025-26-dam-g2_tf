const express = require('express');
const router = express.Router();
const { Post, Perfil, SessioJoc, Ressenya } = require('../models');


// --- NOVA RUTA: Obtenir el Top 10 d'exploradors ---
router.get('/leaderboard/global', async (req, res) => {
   try {
       // Busquem els perfils que tenen la privacitat activada per aparèixer al rànquing [cite: 61, 114]
       // Ordenem per punts de major a menor
       const topExploradors = await Perfil.find({ mostrarAlRanking: true })
           .sort({ punts: -1 })
           .limit(10)
           .select('nom_usuari punts avatar nivell'); // Només agafem el que necessitem


       res.json(topExploradors);
   } catch (error) {
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


// 2. Crear un nou post
router.post('/posts', async (req, res) => {
   try {
       const { id_usuari, nom_usuari, text, imatge_post, tags } = req.body;


       const nouPost = new Post({
           id_usuari,
           nom_usuari,
           text,
           imatge_post,
           tags: tags || [],
       });


       await nouPost.save(); // Mongoose guarda el document
       res.status(201).json(nouPost);
   } catch (error) {
       res.status(500).json({ message: "No s'ha pogut publicar" });
   }
});


// 3. Gestionar Like
router.post('/posts/:postId/like', async (req, res) => {
   try {
       const { postId } = req.params;
       const { id_usuari } = req.body;


       const post = await Post.findById(postId);
       if (!post) return res.status(404).json({ message: "Post no trobat" });


       const index = post.likes.indexOf(id_usuari);


       if (index === -1) {
           post.likes.push(id_usuari); // Donar Like
       } else {
           post.likes.splice(index, 1); // Treure Like
       }


       await post.save();
       res.json({ success: true, jaTeLike: index === -1 });
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


module.exports = router;

