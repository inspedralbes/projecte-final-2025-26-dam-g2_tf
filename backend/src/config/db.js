const mongoose = require('mongoose');

async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI; // La teva URL de MongoDB Atlas
        
        await mongoose.connect(uri);
        
        console.log('Connectat a MongoDB Atlas via Mongoose');
    } catch (error) {
        console.error(' Error connectant a MongoDB:', error);
        process.exit(1);
    }
}

module.exports = { connectDB };