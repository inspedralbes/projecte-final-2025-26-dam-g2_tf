require('dotenv').config();
const mongoose = require('./node_modules/mongoose');
const { Lloc } = require('./src/models/index');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connectat a MongoDB");
    const result = await Lloc.updateMany(
      { ordre: { $exists: false } }, 
      { $set: { ordre: 0 } }
    );
    console.log('Documents antics actualitzats (ordre: 0):', result.modifiedCount);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    mongoose.disconnect();
  }
}

fix();
