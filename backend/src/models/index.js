const mongoose = require('mongoose');

// 1. Usuario (usuaris)
const UsuarioSchema = new mongoose.Schema({
  correu: { type: String, required: true, unique: true },
  contrasenya: { type: String, required: true },
  edat_verificada: { type: Boolean, default: false }
});

// 2. Perfil (perfils)
const PerfilSchema = new mongoose.Schema({
  usuari_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
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

// 3. Lloc (locations)
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

// Exportem forçant els teus noms de col·lecció
module.exports = {
  Usuario: mongoose.model('Usuario', UsuarioSchema, 'usuaris'),
  Perfil: mongoose.model('Perfil', PerfilSchema, 'perfils'),
  Lloc: mongoose.model('Lloc', LlocSchema, 'locations'),
  SessioJoc: mongoose.model('SessioJoc', SessioJocSchema, 'sessions'),
  PeticioRuta: mongoose.model('PeticioRuta', PeticioRutaSchema, 'peticions_rutes'),
  Ressenya: mongoose.model('Ressenya', RessenyaSchema, 'ressenyes')
};