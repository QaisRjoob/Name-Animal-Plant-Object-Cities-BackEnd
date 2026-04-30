# Name Animal Plant Object Cities — Backend 🎮

Real-time multiplayer game server for the Name-Animal-Plant-Object-Cities word game. Handles authentication, game rooms, WebSocket events, scoring, voting, and bot AI.

**Frontend repo:** https://github.com/QaisRjoob/Name-Animal-Plant-Object-Cities-Frontend.git
**Live API:** https://name-animal-plant-object-cities-game.onrender.com

---

## Features

- 🔌 Real-time game engine over Socket.IO
- 🤖 Bot players with easy / medium / hard difficulty
- 🔤 English and Arabic alphabet support
- ⚖️ Voting system for disputed answers
- 📊 Persistent scores and game history (MongoDB)
- 🔐 JWT authentication
- 🚦 Rate limiting on all API endpoints
- 📖 Swagger API docs at `/docs`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express |
| Real-time | Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Joi |
| Docs | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account

### Installation

```bash
git clone https://github.com/your-username/name-animal-plant-backend.git
cd name-animal-plant-backend
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nombre-animal-planta
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Run locally

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server starts at [http://localhost:3000](http://localhost:3000).  
API docs available at [http://localhost:3000/docs](http://localhost:3000/docs).

---

## Project Structure

```
├── config/         # DB connection, CORS, env validation, Swagger
├── game/
│   ├── gameEngine.js   # Room state machine, letter selection, scoring
│   ├── botEngine.js    # Bot answer scheduling and word selection
│   ├── scoreSystem.js  # Round and voting score calculations
│   └── votingSystem.js # Voting sessions and tally logic
├── middleware/     # Rate limiting
├── models/         # Mongoose schemas (User, GameHistory, WordBank)
├── routes/         # REST endpoints (auth, rooms, words, history, leaderboard)
├── services/       # Word dataset loader
├── sockets/        # Socket.IO event handlers
└── utils/          # Letter utilities, dataset helpers
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET` | `/api/rooms` | List open waiting rooms |
| `GET` | `/api/rooms/:id` | Get room details |
| `GET` | `/api/words` | Get word bank |
| `GET` | `/api/leaderboard` | Global leaderboard |
| `GET` | `/api/history` | Current user's game history |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger UI |

---

## Socket Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `create-room` | `{ totalRounds, timeLimit, letterMode, alphabet }` | Create a new room |
| `join-room` | `{ roomId }` | Join an existing room |
| `leave-room` | `{ roomId }` | Leave the current room |
| `start-game` | `{ roomId }` | Start the game (owner only) |
| `select-letter` | `{ roomId, letter }` | Manually choose the round letter |
| `submit-answer` | `{ roomId, answers }` | Submit category answers |
| `stop-game` | `{ roomId }` | Press STOP to end the round |
| `start-vote` | `{ roomId, answerDetails }` | Start a voting session |
| `submit-vote` | `{ roomId, voteChoice }` | Cast a vote |
| `next-round` | `{ roomId }` | Signal ready for next round |
| `add-bot` | `{ roomId, difficulty }` | Add one bot |
| `add-bots` | `{ roomId, count, difficulty }` | Add multiple bots |
| `kick-player` | `{ roomId, targetUserId }` | Kick a player (owner only) |
| `reconnect-game` | `{ roomId }` | Rejoin after disconnect |

### Server → Client

| Event | Description |
|---|---|
| `room-created` | Room successfully created |
| `room-state` | Full room snapshot (on join / reconnect) |
| `player-joined` | A player joined the room |
| `game-start` | Game is starting |
| `select-letter` | Letter selection phase started |
| `new-letter` | Letter confirmed, round begins |
| `timer-update` | Countdown tick |
| `update-inputs` | A player updated their answers |
| `round-stopped` | A player pressed STOP |
| `round-results` | Answers and scores for the round |
| `start-voting` | A voting session has started |
| `vote-progress` | How many players have voted |
| `end-voting` | Voting result |
| `update-scores` | Updated score totals |
| `next-round` | Proceed to the next round |
| `game-finished` | Game over with final scores |

---

## Deployment (Render — Web Service)

| Setting | Value |
|---|---|
| Build command | `npm install` |
| Start command | `node server.js` |
| Health check path | `/health` |

**Environment variables to set in Render:**

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://...` (MongoDB Atlas) |
| `JWT_SECRET` | Long random string (64+ characters) |
| `CLIENT_URL` | `https://your-frontend.onrender.com` |

> `PORT` is set automatically by Render — do not set it manually.

### MongoDB Atlas setup
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Set **Network Access** to allow `0.0.0.0/0` (all IPs)
4. Copy the connection string and add your database name before `?`:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/nombre-animal-planta?appName=...
   ```

---

## License

MIT
