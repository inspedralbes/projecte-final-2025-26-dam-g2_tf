const mongoose = require('mongoose');

const UsuariSchema = new mongoose.Schema({
  correu: { type: String, required: true, unique: true },
  contrasenya: { type: String, required: true },
  edat_verificada: { type: Boolean, default: false },
  rol: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

const PerfilSchema = new mongoose.Schema({
  // Canviem la referència a 'Usuari'
  usuari_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuari', required: true },
  nom_usuari: { type: String, required: true },
  biografia: { type: String, default: "" },
  punts: { type: Number, default: 0 },
  nivell: { type: String, default: "Explorador Novell" },
  amics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Perfil' }],
  // AFEGIM AIXÒ: Sol·licituds d'amistat pendents
  sollicituds_pendents: [{
    id_perfil: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfil' },
    nom_usuari: String
  }],
  invitacions: { type: Array, default: [] },
  inventari_cromos: [{
    id_lloc: { type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' },
    nom_lloc: { type: String, default: '' },
    data_obtencio: { type: Date, default: Date.now },
    imatge_usuari: String,
    imatge_cromo: { type: String, default: '' }  // ruta del cromo col·leccionable de la ruta
  }]
});


const LlocSchema = new mongoose.Schema({
  nom: String,
  ubicacio: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  imatge_referencia: String,
  foto_mapa: String,
  descripcio: String,
  explicacio_historica: String,
  dificultat: String,
  punts_missio: [{
    nom_punt: String,
    posicio_x: Number, // Valor de 0 a 100
    posicio_y: Number, // Valor de 0 a 100
    pista: String,
    imatge_referencia: String
  }],
  barri: String,
  tags: [String],
  control_horari: { hora_tancament: String, actiu: Boolean },
  millors_temps: [{ usuari: String, temps_segons: Number }],
  fotos_historiques: [String],
  fotos_actuals: [String],
  cromo_imatge: { type: String, default: '' }  // ex: '/Cromos/SagradaFamilia_historica.jpg'
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
    completat: { type: Boolean, default: false },
    puntsPartida: { type: Number, default: 0 },
    temps: { type: String, default: "0" },

    punts_completats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' }], // IDs dels punts
    exactitud_media: { type: Number, default: 0 } // Para el leaderboard 

  }],
  temps_inici: { type: Date, default: Date.now },
  id_lloc_desti: { type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' },

  id_puntos_de_la_partida: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' }], // Llista objectius 
  id_objetivo_actual: { type: mongoose.Schema.Types.ObjectId, ref: 'Lloc' }        // Punt actual 
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
  // MODIFICACIÓ AQUÍ: Canviem imatge_post per imatges_post com a array
  imatges_post: [String],
  // Opcional: pots mantenir imatge_post (singular) per compatibilitat amb posts antics
  imatge_post: String,
  tags: [String],
  ubicacio: String,
  timestamp: { type: Date, default: Date.now },
  likes: [String],
  comentaris: [{
    id_comentari: { type: String },
    id_usuari: { type: String },
    nom_usuari: { type: String },
    avatar_usuari: { type: String },
    text: { type: String },
    reportat: { type: Boolean, default: false },
    reportat_per: { type: String }, // Recomanat per saber qui ha enviat l'alerta 🚩
    timestamp: { type: Date, default: Date.now },
  // AFEGEIX AIXÒ PER ALS COMENTARIS REPORTATS
    reportat: { type: Boolean, default: false }
  }],
  // AFEGEIX AIXÒ PER ALS POSTS REPORTATS
  reportat: { type: Boolean, default: false },
  data_report: { type: Date },
  reportat_per: { type: String }
});




module.exports = {
  Usuari: mongoose.model('Usuari', UsuariSchema, 'Usuari'),
  Perfil: mongoose.model('Perfil', PerfilSchema, 'Perfil'),
  Lloc: mongoose.model('Lloc', LlocSchema, 'Lloc'),
  SessioJoc: mongoose.model('SessioJoc', SessioJocSchema, 'SessioJoc'),
  PeticioRuta: mongoose.model('PeticioRuta', PeticioRutaSchema, 'PeticioRuta'),
  Ressenya: mongoose.model('Ressenya', RessenyaSchema, 'Ressenya'),
  Post: mongoose.model('Post', PostSchema, 'Post')
};

