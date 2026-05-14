# Documentació del Projecte North

## Taula de Continguts

1. [Objectius](#objectius)
2. [Arquitectura bàsica](#arquitectura-bàsica)
3. [Entorn de desenvolupament](#entorn-de-desenvolupament)
4. [Desplegament a producció](#desplegament-a-producció)
5. [Endpoints de l'API](#endpoints-de-lapi)
6. [Aplicació Android](#aplicació-android)
7. [Altres elements importants](#altres-elements-importants)
8. [Diagrames](#diagrames)

---

## Objectius

**North** gamifica l'exploració urbana de Barcelona mitjançant rutes interactives, cromos col·leccionables, validació de missions amb IA (TensorFlow/MobileNet), partides multijugador en temps real (Socket.io) i un sistema social amb posts, amics i ressenyes.

---

## Arquitectura bàsica

### Tecnologies

| Capa | Tecnologies |
| --- | --- |
| **Frontend** | Vue 3, Vite, Tailwind CSS 4, Leaflet |
| **Backend** | Node.js, Express 5, Socket.io 4 |
| **IA** | TensorFlow.js, MobileNet v2 |
| **BD** | MongoDB Atlas, Mongoose 9 |
| **Mòbil** | Capacitor 8 (Android/iOS) |
| **Infra** | Docker, Nginx, Let's Encrypt |
| **Testing** | Jest + Supertest / Vitest + Vue Test Utils |

### Interrelació de components

```
  Client (Web/Android)
         │
    ┌────▼────┐
    │  NGINX  │  ← SSL, proxy invers
    └────┬────┘
         │
    /api/* ──► Backend (Express :8088) ──► MongoDB Atlas
    /socket.io/* ──► Socket.io (temps real)
    /* ──► Frontend (Vue SPA)
```

Per a més detalls: [DOCUMENTACIO_TECNICA.md](./DOCUMENTACIO_TECNICA.md)

---

## Entorn de desenvolupament

### Amb Docker (recomanat)

```bash
git clone https://github.com/inspedralbes/projecte-final-2025-26-dam-g2_tf.git
cd projecte-final-2025-26-dam-g2_tf

# Configurar .env amb PORT i MONGODB_URI

docker compose -f docker-compose.dev.yml up --build
```

| Servei | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8088` |
| Proxy | `http://localhost:8081` |

### Sense Docker

```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

---

## Desplegament a producció

```bash
# Al servidor
git pull origin main
docker compose up --build -d
```

- **URL**: https://north.dam.inspedralbes.cat
- Nginx amb SSL (Let's Encrypt), redirecció HTTP→HTTPS
- Volums persistents per fotos, cromos i personatges

---

## Endpoints de l'API

Base URL: `/api`

### Auth (`/api/auth`)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `POST` | `/auth/registre` | Registrar usuari |
| `POST` | `/auth/login` | Iniciar sessió |

**`POST /auth/registre`** — Petició:
```json
{ "correu": "user@ex.com", "contrasenya": "pass", "nom_usuari": "Nom", "es_major_confirmada": true }
```
Resposta `201`:
```json
{ "success": true, "usuari": { "_id": "...", "nom_usuari": "Nom", "punts": 1, "nivell": "Explorador Novell", "rol": "user" } }
```
Errors: `400` correu duplicat · `401` credencials incorrectes · `403` verificació pendent/rebutjada

---

### Usuari (`/api/usuari`)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/usuari/:id` | Obtenir perfil |
| `PUT` | `/usuari/update` | Actualitzar nom/bio |
| `PUT` | `/usuari/afegir-cromo` | Afegir cromo |
| `PUT` | `/usuari/marcar-lore-vist/:id` | Marcar lore vist |
| `DELETE` | `/usuari/:id` | Eliminar compte |
| `POST` | `/usuari/sollicitud-amistat` | Enviar sol·licitud |
| `POST` | `/usuari/acceptar-amistat` | Acceptar amistat |

**`PUT /usuari/update`** — Petició:
```json
{ "perfilId": "664f...", "nouNom": "NouNom", "novaBio": "Bio!" }
```
Resposta `200`: `{ "success": true, "user": { ... } }`

---

### Mapa (`/api/mapa`) *(control horari)*

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/mapa/punts` | Tots els llocs |
| `GET` | `/mapa/punts/:id` | Un lloc per ID |
| `POST` | `/mapa/punts` | Crear lloc |
| `PUT` | `/mapa/punts/:id` | Actualitzar lloc |
| `DELETE` | `/mapa/punts/:id` | Eliminar lloc |
| `GET` | `/mapa/punts/:id/ressenyes` | Ressenyes d'un lloc |

Resposta `200` de `GET /mapa/punts`:
```json
[{ "_id": "...", "nom": "Sagrada Família", "ubicacio": { "type": "Point", "coordinates": [2.17, 41.40] }, "estat": "actiu", "punts_missio": [{ "nom_punt": "Façana", "pista": "..." }], "cromo_imatge": "/Cromos/SF.jpg" }]
```
Errors: `400` ID no vàlid · `404` lloc no trobat

---

### Cercador (`/api/cercador`) *(control horari)*

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/cercador` | Llocs amb mitjana de valoracions |
| `GET` | `/cercador/aleatori` | Destinació sorpresa (lloc actiu aleatori) |

---

### Sessions de Joc (`/api/sessionsJoc`) *(control horari)*

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `POST` | `/sessionsJoc/crear` | Crear sessió individual |
| `POST` | `/sessionsJoc/crear-grup` | Crear sessió de grup |
| `GET` | `/sessionsJoc/:id` | Obtenir sessió (ID o codi sala) |
| `POST` | `/sessionsJoc/:id/finalitzar` | Finalitzar partida |
| `PATCH` | `/sessionsJoc/:id/usar-pista` | Usar pista (-5 min) |

**`POST /sessionsJoc/crear`** — Petició:
```json
{ "idLloc": "664f...", "perfilId": "664a...", "duracio": 60 }
```
Resposta `201`:
```json
{ "_id": "...", "codi_sala": "A3F2K9", "estat": "jugant", "temps_limit": "2026-05-13T11:00:00Z" }
```

---

### Validació IA (`/api/validar-foto`) *(control horari)*

**`POST /validar-foto`** — Petició:
```json
{ "imatge": "data:image/jpeg;base64,...", "idLloc": "...", "perfilId": "...", "codi_sala": "...", "idPunt": "..." }
```
Èxit `200`: `{ "exit": true, "coincidencia": "72.45%", "completat_tot": false }`  
No coincideix `200`: `{ "exit": false, "coincidencia": "18%", "missatge": "No coincideix prou." }`

---

### Social (`/api/social`)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/social/posts?tag=` | Obtenir posts |
| `POST` | `/social/posts` | Crear post |
| `DELETE` | `/social/posts/:id` | Eliminar post |
| `POST` | `/social/posts/:id/like` | Like/unlike |
| `POST` | `/social/posts/:id/comentari` | Comentar |
| `DELETE` | `/social/posts/:id/comentari/:cid` | Eliminar comentari |
| `POST` | `/social/posts/:id/report` | Reportar post |
| `POST` | `/social/ressenyes` | Crear ressenya |
| `GET` | `/social/leaderboard/global` | Top 3 |
| `GET` | `/social/search?username=` | Cercar usuaris |
| `POST` | `/social/peticions/enviar` | Petició amistat |
| `POST` | `/social/peticions/acceptar` | Acceptar |
| `POST` | `/social/peticions/rebutjar` | Rebutjar |
| `POST` | `/social/amics/eliminar` | Eliminar amic |

---

### Peticions de Ruta (`/api/peticions`)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `POST` | `/peticions` | Crear petició |
| `GET` | `/peticions/meves` | Les meves (header `X-User-Id`) |
| `PUT` | `/peticions/:id` | Acceptar/rebutjar |

---

### Admin (`/api/admin`)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `POST` | `/admin/login` | Login admin |
| `GET/POST/PUT/DELETE` | `/admin/llocs(/:id)` | CRUD llocs |
| `PUT` | `/admin/llocs/reordenar` | Reordenar |
| `PATCH` | `/admin/llocs/:id/estat` | Canviar estat |
| `PATCH` | `/admin/llocs/:id/restriccio` | Restricció horària |
| `GET/PUT` | `/admin/peticions(/:id)` | Gestionar peticions |
| `GET/PUT` | `/admin/configuracio/horari` | Toc de queda |

### Verificació (`/api/verificacio`)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/verificacio/pendents` | Usuaris pendents |
| `PUT` | `/verificacio/decidir/:id` | Aprovar/rebutjar |

### Recursos (`/api/fotos-actuals`, `/api/cromos`, etc.)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/fotos-actuals(/totes/:carpeta)` | Fotos actuals |
| `GET` | `/fotos-historiques/totes` | Fotos històriques |
| `GET` | `/cromos/totes` | Cromos disponibles |
| `GET` | `/carta-lore/totes` | Cartes de lore |
| `GET/POST/PUT/DELETE` | `/personatges(/:id)` | CRUD personatges |

---

## Aplicació Android

Generada amb **Capacitor 8** (`appId: cat.inspedralbes.dam.north`).

```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
# Android Studio → Build APK
```

---

## Altres elements importants

### Variables d'entorn

| Variable | Descripció | Exemple |
| --- | --- | --- |
| `PORT` | Port del backend | `8088` |
| `MONGODB_URI` | URI de connexió a MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/bd` |
| `NODE_ENV` | Entorn d'execució | `development` / `production` |
| `ORIGIN_URL` | URL del frontend (CORS) | `https://north.dam.inspedralbes.cat` |

### Model de dades (MongoDB)

| Col·lecció | Descripció |
| --- | --- |
| `Usuari` | Credencials, rol (`admin`/`user`), estat de verificació d'edat |
| `Perfil` | Nom, bio, punts, nivell, inventari de cromos, amics, sol·licituds |
| `Lloc` | POIs amb geolocalització, punts de missió, pistes, cromos, control horari |
| `SessioJoc` | Partides: codi sala, jugadors, punts completats, temps, estat |
| `Post` | Publicacions: text, imatges, likes, comentaris, reports |
| `Ressenya` | Valoracions (1-5 estrelles) amb comentari per lloc |
| `PeticioRuta` | Propostes d'usuaris per afegir noves rutes |
| `Personatge` | Personatges del joc amb nom, descripció i imatge |
| `Config` | Configuració del toc de queda (horari, actiu/inactiu) |

Esquemes definits a: `backend/src/models/index.js`

### Events de Socket.io (temps real)

**Client → Servidor:**

| Event | Descripció |
| --- | --- |
| `create-room` | Crear una sala de joc |
| `join-room` | Unir-se a una sala existent |
| `start-game` | Iniciar la partida |
| `join-game-room` | Unir-se al canal de joc actiu |

**Servidor → Client:**

| Event | Descripció |
| --- | --- |
| `room-created` | Confirmació de sala creada (retorna codi) |
| `room-joined` | Confirmació d'unió a la sala |
| `room-info` | Info de la sala (lloc de destí) |
| `update-players` | Llista actualitzada de jugadors |
| `game-started` | Partida iniciada (retorna sessioId) |
| `carta-personatge` | Personatge assignat al jugador |
| `punt-aconseguit` | Un jugador ha completat un punt |
| `game-over` | La partida ha finalitzat |
| `error-room` | Error (sala no trobada, etc.) |

### Altres

- **Nivells**: Novell (1-5 cromos) → Rastrejador (6-15) → Guia (16-30) → Mestre (31+).
- **Toc de queda**: Middleware que restringeix `/cercador`, `/mapa`, `/validar-foto` i `/sessionsJoc` en horari nocturn.
- **IA**: MobileNet v2 + Similitud del Cosinus, llindar d'acceptació 35%.
- **Testing**: `cd backend && npm test` (Jest) · `cd frontend && npm test` (Vitest).

---

## Diagrames

### Diagrama de Classes
![Diagrama de Classes](./diagrames/Diagrama_Classes.png)

### Diagrama d'Activitat
![Diagrama d'Activitat](./diagrames/diagrama-activitat.png)

### Diagrama de Base de Dades
![Diagrama de Base de Dades](./diagrames/diagrama_bd.png)

### Flux de Pantalles
📄 [Flux de Pantalles (PDF)](./diagrames/Flux%20de%20Pantalles.pdf)

