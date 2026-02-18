const express = require('express');
const router = express.Router();
const { Post } = require('../models');  

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

module.exports = router;