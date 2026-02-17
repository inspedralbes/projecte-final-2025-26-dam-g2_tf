const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET /api/social/posts - Obtenir tots els posts del feed (amb filtres opcionals)
router.get('/posts', async (req, res) => {
    try {
        const db = getDB();
        const { tag } = req.query;
        let query = {};

        if (tag && tag !== 'Tots') {
            query = { tags: tag };
        }

        const posts = await db.collection('posts')
            .find(query)
            .sort({ timestamp: -1 })
            .toArray();
        res.json(posts);
    } catch (error) {
        console.error("Error obtenint posts:", error);
        res.status(500).json({ message: "Error al carregar el feed" });
    }
});

// POST /api/social/posts - Crear un nou post
router.post('/posts', async (req, res) => {
    try {
        const db = getDB();
        const { id_usuari, nom_usuari, avatar_usuari, text, lloc_nom, imatge_post, ubicacio, tags } = req.body;

        if (!id_usuari || (!text && !imatge_post)) {
            return res.status(400).json({ message: "La publicació ha de tenir text o una imatge" });
        }

        const nouPost = {
            id_usuari,
            nom_usuari: nom_usuari || "Explorador",
            avatar_usuari: avatar_usuari || null,
            text,
            lloc_nom: lloc_nom || null,
            imatge_post: imatge_post || null,
            ubicacio: ubicacio || null,
            tags: tags || [],
            timestamp: new Date(),
            likes: [],
            comentaris: []
        };

        const result = await db.collection('posts').insertOne(nouPost);
        res.status(201).json({ ...nouPost, _id: result.insertedId });
    } catch (error) {
        console.error("Error creant post:", error);
        res.status(500).json({ message: "No s'ha pogut publicar" });
    }
});

// POST /api/social/posts/:postId/like - Gestionar Like
router.post('/posts/:postId/like', async (req, res) => {
    try {
        const db = getDB();
        const { postId } = req.params;
        const { id_usuari } = req.body;

        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
        if (!post) return res.status(404).json({ message: "Post no trobat" });

        const likes = post.likes || [];
        const index = likes.indexOf(id_usuari);

        const update = index === -1
            ? { $push: { likes: id_usuari } }
            : { $pull: { likes: id_usuari } };

        await db.collection('posts').updateOne({ _id: new ObjectId(postId) }, update);
        res.json({ success: true, jaTeLike: index === -1 });
    } catch (error) {
        res.status(500).json({ message: "Error al gestionar el m'agrada" });
    }
});

// POST /api/social/posts/:postId/comment - Afegir comentari
router.post('/posts/:postId/comment', async (req, res) => {
    try {
        const db = getDB();
        const { postId } = req.params;
        const { id_usuari, nom_usuari, avatar_usuari, perfil_privat, text } = req.body;

        const nouComentari = {
            id_comentari: new ObjectId(),
            id_usuari,
            nom_usuari,
            avatar_usuari,
            perfil_privat,
            text,
            timestamp: new Date()
        };

        await db.collection('posts').updateOne(
            { _id: new ObjectId(postId) },
            { $push: { comentaris: nouComentari } }
        );

        res.json(nouComentari);
    } catch (error) {
        res.status(500).json({ message: "Error al comentar" });
    }
});

// DELETE /api/social/posts/:postId - Eliminar post
router.delete('/posts/:postId', async (req, res) => {
    try {
        const db = getDB();
        await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.postId) });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
    }
});

module.exports = router;