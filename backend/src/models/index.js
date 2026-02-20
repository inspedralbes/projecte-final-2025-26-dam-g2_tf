const mongoose = require('mongoose');

const UsuariSchema = new mongoose.Schema({
  correu: { type: String, required: true, unique: true },
  contrasenya: { type: String, required: true },
  edat_verificada: { type: Boolean, default: false },
  rol: { type: String, default: 'user' }
});

const PerfilSchema = new mongoose.Schema({
  // Canviem la referència a 'Usuari'
  usuari_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuari', required: true },
  nom_usuari: { type: String, required: true },
  biografia: { type: String, default: "" },
  punts: { type: Number, default: 0 },
  nivell: { type: String, default: "Explorador Novell" },
  amics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Perfil' }],
  invitacions: { type: Array, default: [] },
  inventari_cromos: [{
    id_lloc: { type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' },
    data_obtencio: { type: Date, default: Date.now },
    imatge_usuari: String
  }]
});

const LlocSchema = new mongoose.Schema({
  nom: String,
  ubicacio: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  imatge_referencia: String,
  descripcio: String,
  explicacio_historica: String,
  dificultat: String,
  barri: String,
  tags: [String],
  control_horari: { hora_tancament: String, actiu: Boolean },
  millors_temps: [{ usuari: String, temps_segons: Number }]
});

// 4. SessioJoc (sessions)
const SessioJocSchema = new mongoose.Schema({
  codi_sala: String,
  tipus_partida: String,
  estat: String,
  jugadors: [{
    id_usuari: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfil' },
    personatge_assignat: String,
    foto_secreta: String,
    pistes_gastades: { type: Number, default: 0 },
    completat: { type: Boolean, default: false }
  }],
  temps_inici: { type: Date, default: Date.now },
  id_lloc_desti: { type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' }
});


// 5. PeticioRuta (peticions_rutes)
const PeticioRutaSchema = new mongoose.Schema({
  id_usuari: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfil' },
  ubicacio: [Number],
  nom_proposat: String,
  motiu: String,
  fotos_proporcionades: [String],
  estat_validacio: { type: String, default: 'pendent' }
});


// 6. Ressenya (ressenyes)
const RessenyaSchema = new mongoose.Schema({
  id_lloc: { type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' },
  id_usuari: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfil' },
  estrelles: { type: Number, min: 1, max: 5 },
  comentari: String,
  data: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  id_usuari: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfil', required: true },
  nom_usuari: String,
  avatar_usuari: String,
  text: String,
  imatge_post: String,
  tags: [String],
  timestamp: { type: Date, default: Date.now },
  likes: [String],
  comentaris: { type: Array, default: [] }
});


module.exports = {
  Usuari: mongoose.model('Usuari', UsuariSchema, 'usuaris'),
  Perfil: mongoose.model('Perfil', PerfilSchema, 'perfils'),
  Lloc: mongoose.model('Lloc', LlocSchema, 'locations'),
  SessioJoc: mongoose.model('SessioJoc', SessioJocSchema, 'sessions'),
  PeticioRuta: mongoose.model('PeticioRuta', PeticioRutaSchema, 'peticions_rutes'),
  Ressenya: mongoose.model('Ressenya', RessenyaSchema, 'ressenyes'),
  Post: mongoose.model('Post', PostSchema, 'posts')
};

