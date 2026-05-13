# Documentació Tècnica - Projecte Final DAM

Aquest document detalla l'arquitectura, el model de dades i el funcionament intern del projecte, basat en l'anàlisi del codi font i la base de dades real.

---

## 1. Arquitectura del Projecte

El projecte és una aplicació multiplataforma (Web i Mòbil) d'exploració urbana basada en la gamificació.

### Tecnologies Principals
- **Frontend**: Vue.js 3, Vite, Leaflet (mapes), Capacitor (mòbil).
- **Backend**: Node.js, Express, Socket.io (temps real), TensorFlow.js (IA per a validació de fotos).
- **Base de Dades**: MongoDB (Atlas) amb Mongoose.

### Estructura de Carpetes
- `/backend`: API REST i sockets.
- `/frontend`: Client Vue.js i configuració de Capacitor per a Android/iOS.
- `/doc`: Documentació tècnica unificada.

---

## 2. Model de Dades (Esquemes de MongoDB)

Basat en l'anàlisi de les col·leccions reals:

### Usuari (`Usuari`)
Gestiona l'accés al sistema.
- **Camps clau**: `correu`, `contrasenya`, `rol` (`admin`/`user`), `edat_verificada`.
- **Verificació**: Inclou camps per a l'estat de validació d'edat mitjançant IA o manual.

### Perfil (`Perfil`)
Informació pública i progrés de l'usuari.
- **Camps clau**: `nom_usuari`, `biografia`, `punts`, `nivell`.
- **Social**: Llistes d'amics, invitacions i sol·licituds pendents.
- **Progrés**: `inventari_cromos` (referències als llocs completats i imatges obtingudes).

### Lloc (`Lloc`)
Punts d'interès al mapa (missions).
- **Geolocalització**: Tipus `Point` amb coordenades [longitud, latitud].
- **Contingut**: `explicacio_historica`, `descripcio`, `tags`.
- **Gamificació**: `punts_missio` (sub-objectius), `cromo_imatge` (la recompensa), `estat` (`actiu`, `properament`).
- **Control**: `control_horari` per restringir l'accés nocturn.

### SessioJoc (`SessioJoc`)
Partides en curs o finalitzades.
- **Estat**: `jugant`, `finalitzada`.
- **Mecànica**: `codi_sala` per a multijugador, `id_puntos_de_la_partida` (objectius de la sessió).
- **Mètriques**: `exactitud_media`, `punts_completats`, `temps` de cada jugador.

### Post (`Post`)
Publicacions de la comunitat.
- **Multimèdia**: `imatges_post` (array).
- **Interacció**: `likes` i `comentaris`.
- **Moderació**: Camps `reportat` i `reportat_per` tant en el post com en els comentaris per a control de contingut.

---

## 3. Endpoints de l'API

L'API és modular i es divideix en rutes principals:

- **`/auth`**: Registre i login (retorna les dades del perfil).
- **`/social`**: Gestió de posts, comentaris, amics i sol·licituds.
- **`/mapa`**: Obtenció de punts d'interès (`Lloc`) i gestió de rutes.
- **`/sessionsJoc`**: Creació i seguiment de partides.
- **`/admin`**: Gestió d'usuaris, validació de rutes proposades i control del sistema.

---

## 4. Funcionament en Temps Real (Sockets)

El fitxer `backend/src/routes/gameSocket.js` gestiona la lògica de les sales:
- **Unir-se/Sortir**: Control dels jugadors en una sala mitjançant `codi_sala`.
- **Sincronització**: Enviament d'esdeveniments quan un jugador completa un punt o finalitza la partida.
- **Xat/Interacció**: Flux de missatges en temps real entre els participants.

---

## 5. Guia de Configuració

1. **Variables d'entorn**: Cal configurar el fitxer `.env` amb la `MONGODB_URI` (Atlas).
2. **Desenvolupament**:
   ```bash
   # Des de l'arrel
   docker compose -f docker-compose.dev.yml up --build
   ```
3. **Accés**:
   - Client: `http://localhost:5173`
   - API: `http://localhost:8088` (segons la configuració actual de Docker)

-
