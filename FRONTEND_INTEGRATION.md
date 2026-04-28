# Frontend Integration Documentation

This document is the contract for integrating a frontend with the Name-Animal-Plant-Object-Cities backend.

## 1. Environment and Base URLs

- Backend base URL (local): `http://localhost:3000`
- API root: `http://localhost:3000/api`
- Health check: `GET /health`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs-json`
- Socket.IO URL: `http://localhost:3000`

## 2. Authentication Model

### 2.1 JWT flow

1. Register or login with REST API.
2. Backend returns `{ token, user }`.
3. Send token in REST requests using header:
   - `Authorization: Bearer <token>`
4. Send token in Socket.IO handshake:
   - `auth: { token: '<token>' }`

### 2.2 Protected endpoints

Protected routes require valid JWT:
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/history/:userId`
- `GET /api/history/game/:historyId`

### 2.3 Auth errors

Possible `401` responses:
- `{ "error": "No token provided" }`
- `{ "error": "Invalid token" }`
- `{ "error": "Token expired" }`
- `{ "error": "User not found" }`

Socket auth failures reject connection with message like:
- `AUTH_REQUIRED: No token provided`
- `AUTH_REQUIRED: Invalid or expired token`

## 3. Rate Limits

- Global `/api/*`: 100 requests per minute
  - Error: `{ "error": "Too many requests, please try again later." }`
- Auth endpoints (`/api/auth/register`, `/api/auth/login`): 20 requests per 15 minutes
  - Error: `{ "error": "Too many auth attempts, please try again later." }`

## 4. Data Shapes

## 4.1 Safe user object (returned by auth routes)

```json
{
  "id": "6612...",
  "username": "player01",
  "email": "player@example.com",
  "totalScore": 0,
  "gamesPlayed": 0,
  "gamesWon": 0,
  "createdAt": "2026-04-22T20:00:00.000Z"
}
```

## 4.2 Room player object (socket state)

```json
{
  "id": "6612...",
  "username": "player01",
  "isBot": false,
  "difficulty": null,
  "score": 0,
  "answers": {},
  "disconnected": false,
  "ready": false
}
```

## 5. REST API Contract

## 5.1 System

### GET `/`
Purpose: backend status.

Response 200:
```json
{
  "message": "Name-Animal-Plant-Object-Cities backend is running",
  "health": "/health"
}
```

### GET `/health`
Purpose: health check.

Response 200:
```json
{
  "status": "ok",
  "timestamp": "2026-04-22T20:24:28.051Z"
}
```

### GET `/api`
Purpose: API root status.

Response 200:
```json
{
  "status": "ok",
  "message": "API is reachable",
  "health": "/health"
}
```

## 5.2 Auth

### POST `/api/auth/register`
Body:
```json
{
  "username": "player01",
  "email": "player@example.com",
  "password": "secret123"
}
```

Validation:
- `username`: alphanumeric, 3-20 chars
- `email`: valid email
- `password`: min 6 chars

Response 201:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "...",
    "username": "player01",
    "email": "player@example.com",
    "totalScore": 0,
    "gamesPlayed": 0,
    "gamesWon": 0,
    "createdAt": "..."
  }
}
```

Common errors:
- 400 validation error from Joi
- 409 `{ "error": "email is already taken" }` or `{ "error": "username is already taken" }`
- 500 `{ "error": "Server error" }`

### POST `/api/auth/login`
Body:
```json
{
  "email": "player@example.com",
  "password": "secret123"
}
```

Response 200:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "...",
    "username": "player01",
    "email": "player@example.com",
    "totalScore": 0,
    "gamesPlayed": 0,
    "gamesWon": 0,
    "createdAt": "..."
  }
}
```

Common errors:
- 400 validation error
- 401 `{ "error": "Invalid credentials" }`
- 500 `{ "error": "Server error" }`

### GET `/api/auth/me` (auth required)
Header:
- `Authorization: Bearer <token>`

Response 200:
```json
{
  "user": {
    "id": "...",
    "username": "player01",
    "email": "player@example.com",
    "totalScore": 120,
    "gamesPlayed": 8,
    "gamesWon": 3,
    "createdAt": "..."
  }
}
```

### POST `/api/auth/logout` (auth required)
Response 200:
```json
{
  "message": "Logged out successfully"
}
```

Note: logout is client-side for JWT; frontend should remove token locally.

## 5.3 Rooms

### GET `/api/rooms`
Returns only rooms in `WAITING` state.

Response 200:
```json
{
  "rooms": [
    {
      "roomId": "AB12CD",
      "ownerUsername": "hostUser",
      "playerCount": 3,
      "maxPlayers": 10,
      "totalRounds": 5,
      "timeLimit": 60,
      "letterMode": "both"
    }
  ]
}
```

### GET `/api/rooms/:roomId`
Returns full room snapshot (for refresh, SSR, deep-link join).

Response 200:
```json
{
  "room": {
    "roomId": "AB12CD",
    "ownerId": "6612...",
    "ownerUsername": "hostUser",
    "gameState": "SCORING",
    "round": 2,
    "totalRounds": 5,
    "timeLimit": 60,
    "letterMode": "both",
    "currentLetter": "B",
    "usedLetters": ["A", "B"],
    "stopAllowed": true,
    "players": [
      {
        "id": "6612...",
        "username": "player01",
        "isBot": false,
        "difficulty": null,
        "score": 35,
        "disconnected": false
      }
    ],
    "readiness": {
      "ready": 2,
      "total": 4,
      "readyPlayerIds": ["uid1", "uid2"]
    },
    "voting": {
      "active": true,
      "initiatorId": "uid1",
      "targetPlayerId": "uid3",
      "category": "animal",
      "answer": "Ant",
      "startedAt": 1713810000000,
      "voted": 3,
      "total": 4,
      "voterIds": ["uid1", "uid2", "uid4"]
    }
  }
}
```

Response 404:
```json
{ "error": "Room not found" }
```

## 5.4 Leaderboard

### GET `/api/leaderboard?page=1&limit=20`
Query:
- `page` default 1
- `limit` default 20, max 100

Response 200:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "alpha",
      "totalScore": 540,
      "gamesPlayed": 20,
      "gamesWon": 12,
      "winRate": 60
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "pages": 6
  }
}
```

## 5.5 History

### GET `/api/history/:userId?page=1&limit=10` (auth required)
Query:
- `page` default 1
- `limit` default 10, max 50

Response 200:
```json
{
  "games": [
    {
      "_id": "...",
      "roomId": "AB12CD",
      "totalRounds": 5,
      "timeLimit": 60,
      "letterMode": "both",
      "players": [],
      "rounds": [],
      "winnerId": "...",
      "winnerUsername": "alpha",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "pages": 2
  }
}
```

Note: list route excludes heavy `rounds.answers` details.

### GET `/api/history/game/:historyId` (auth required)
Response 200:
```json
{
  "game": {
    "_id": "...",
    "roomId": "AB12CD",
    "players": [],
    "rounds": [
      {
        "roundNumber": 1,
        "letter": "A",
        "answers": []
      }
    ]
  }
}
```

Errors:
- 404 `{ "error": "Game not found" }`
- 500 `{ "error": "Server error" }`

## 5.6 Word Validation

### POST `/api/validate-word`
Body:
```json
{
  "word": "Apple",
  "letter": "A"
}
```

Response 200:
```json
{
  "valid": true
}
```

Error 400:
```json
{
  "error": "word and letter required"
}
```

## 6. Socket.IO Integration

## 6.1 Client initialization

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: '<jwt>'
  },
  transports: ['websocket']
});
```

## 6.2 Client -> Server events

### `create-room`
Payload:
```json
{
  "totalRounds": 5,
  "timeLimit": 60,
  "letterMode": "both"
}
```
Rules:
- `totalRounds`: 1-28
- `timeLimit`: 30-120
- `letterMode`: `manual | random | both`

### `join-room`
Payload:
```json
{ "roomId": "AB12CD" }
```

### `leave-room`
Payload:
```json
{ "roomId": "AB12CD" }
```

### `start-game`
Payload:
```json
{ "roomId": "AB12CD" }
```
Rules:
- only owner
- room must be WAITING
- at least 2 players

### `select-letter`
Payload:
```json
{ "roomId": "AB12CD", "letter": "A" }
```
Rules:
- only selector
- valid only during `SELECTING_LETTER`
- blocked in `random` mode

### `submit-answer`
Payload:
```json
{
  "roomId": "AB12CD",
  "answers": {
    "name": "Ali",
    "plant": "Aloe",
    "animal": "Ant",
    "object": "Arrow",
    "cities": "Athens"
  }
}
```
Notes:
- empty string is allowed per category
- answers are overwriteable while round is active

### `stop-game`
Payload:
```json
{ "roomId": "AB12CD" }
```
Rules:
- valid only in PLAYING
- stop allowed only after 5 seconds from round start

### `pause-game`
Payload:
```json
{ "roomId": "AB12CD" }
```

### `resume-game`
Payload:
```json
{ "roomId": "AB12CD" }
```

### `kick-player`
Payload:
```json
{ "roomId": "AB12CD", "targetUserId": "6612..." }
```

### `start-vote`
Payload:
```json
{
  "roomId": "AB12CD",
  "answerDetails": {
    "targetPlayerId": "6612...",
    "category": "animal",
    "answer": "Ant"
  }
}
```

### `submit-vote`
Payload:
```json
{
  "roomId": "AB12CD",
  "voteChoice": "correct",
  "duplicateAnswersIds": []
}
```
Rules:
- `voteChoice`: `correct | incorrect | duplicate`

### `next-round`
Payload:
```json
{ "roomId": "AB12CD" }
```
Meaning:
- readiness signal after results/voting phase

### `add-bot`
Payload:
```json
{ "roomId": "AB12CD", "difficulty": "medium" }
```
Rules:
- only owner
- only in WAITING
- max 10 total players

### `add-bots`
Payload:
```json
{ "roomId": "AB12CD", "count": 3, "difficulty": "medium" }
```
Rules:
- only owner
- only in WAITING
- server may add up to available room capacity
- emits one `bots-joined` bulk event and also `bot-joined` per bot for compatibility

### `reconnect-game`
Payload:
```json
{ "roomId": "AB12CD" }
```

## 6.3 Server -> Client events

### `room-created`
```json
{
  "roomId": "AB12CD",
  "config": {
    "totalRounds": 5,
    "timeLimit": 60,
    "letterMode": "both"
  }
}
```

### `room-state`
```json
{
  "roomId": "AB12CD",
  "ownerId": "...",
  "players": [],
  "gameState": "WAITING",
  "totalRounds": 5,
  "timeLimit": 60,
  "letterMode": "both"
}
```

### `player-joined`
```json
{ "player": { "id": "...", "username": "..." } }
```

### `player-left`
```json
{ "userId": "...", "username": "...", "temporary": true }
```
Notes:
- `temporary: true` means disconnected during active game, with 30s grace for reconnect
- `temporary: false` means final leave/removal

### `owner-changed`
```json
{ "newOwnerId": "...", "username": "..." }
```

### `player-kicked`
```json
{ "targetId": "...", "username": "..." }
```

### `bot-joined`
```json
{
  "bot": {
    "id": "bot-...",
    "username": "Bot_medium_01",
    "isBot": true,
    "difficulty": "medium",
    "score": 0
  }
}
```

### `game-start`
```json
{
  "roomConfig": {
    "totalRounds": 5,
    "timeLimit": 60,
    "letterMode": "both",
    "players": [
      { "id": "...", "username": "...", "isBot": false }
    ]
  }
}
```

### `select-letter`
```json
{
  "selectorId": "...",
  "availableLetters": ["A", "C"],
  "timeLimit": 30
}
```
Note: field is named `availableLetters`, but backend currently sends the `usedLetters` array.

### `new-letter`
```json
{ "letter": "B", "round": 2 }
```

### `timer-update`
```json
{ "timeLeft": 47 }
```
or during voting:
```json
{ "timeLeft": 10, "context": "voting" }
```

### `update-inputs`
```json
{
  "userId": "...",
  "answers": {
    "name": "...",
    "plant": "...",
    "animal": "...",
    "object": "...",
    "cities": "..."
  }
}
```

### `round-stopped`
```json
{ "initiatorId": "...", "gracePeriod": 2 }
```

### `update-scores`
```json
{
  "scores": [
    { "playerId": "...", "username": "...", "score": 35 }
  ]
}
```

### `round-results`
```json
{
  "answersTable": [],
  "scores": [],
  "round": 2,
  "letter": "B"
}
```

### `start-voting`
```json
{
  "targetAnswer": {
    "targetPlayerId": "...",
    "category": "animal",
    "answer": "Ant"
  },
  "initiatorId": "...",
  "timer": 15
}
```

### `end-voting`
```json
{
  "outcome": "no_change",
  "votes": {},
  "targetPlayerId": "...",
  "category": "animal"
}
```

### `vote-progress`
Emitted after each vote is recorded. Choices are intentionally hidden to avoid bias.

```json
{
  "voted": 3,
  "total": 5,
  "voterIds": ["uid1", "uid2", "uid3"]
}
```

### `next-round`
```json
{ "roundNumber": 3, "selectorId": "..." }
```

### `ready-progress`
Emitted every time a player clicks ready in scoring/next-round phase.

```json
{
  "ready": 2,
  "total": 4,
  "readyPlayerIds": ["uid1", "uid2"]
}
```

### `bots-joined`
Bulk bot add event.

```json
{
  "roomId": "AB12CD",
  "count": 3,
  "bots": [
    { "id": "bot1", "username": "Bot_medium_1", "isBot": true, "difficulty": "medium", "score": 0 },
    { "id": "bot2", "username": "Bot_medium_2", "isBot": true, "difficulty": "medium", "score": 0 },
    { "id": "bot3", "username": "Bot_medium_3", "isBot": true, "difficulty": "medium", "score": 0 }
  ]
}
```

### `game-paused`
```json
{ "by": "ownerUserId" }
```

### `game-resumed`
```json
{ "by": "ownerUserId" }
```

### `reconnect-sync`
```json
{
  "roomId": "AB12CD",
  "gameState": "PLAYING",
  "players": [
    { "id": "...", "username": "...", "isBot": false, "score": 10 }
  ],
  "round": 2,
  "totalRounds": 5,
  "currentLetter": "B",
  "usedLetters": ["A", "B"],
  "currentSelectorId": "...",
  "ownerId": "...",
  "votingSession": null
}
```

### `player-reconnected`
```json
{ "userId": "...", "username": "..." }
```

### `game-finished`
First emit (before persistence):
```json
{
  "finalScores": [],
  "winner": { "playerId": "...", "username": "...", "score": 120 }
}
```
Second emit (after history save):
```json
{
  "finalScores": [],
  "winner": { "playerId": "...", "username": "...", "score": 120 },
  "historyId": "..."
}
```

### `error`
```json
{ "message": "Room not found", "code": "ROOM_NOT_FOUND" }
```

Common error codes:
- `VALIDATION_ERROR`
- `ROOM_NOT_FOUND`
- `FORBIDDEN`
- `INVALID_STATE`
- `NOT_IN_ROOM`
- `TOO_EARLY`
- `ROOM_FULL`
- `JOIN_ERROR`
- `BOT_ERROR`
- `KICK_ERROR`
- `VOTE_ERROR`
- `GENERIC_ERROR`

## 7. Frontend State Recommendations

Keep these top-level states in frontend store:
- `auth`: token, current user
- `connection`: socket connected, last socket error
- `lobby`: room list, selected room
- `room`: roomId, ownerId, players, gameState
- `round`: current letter, round number, timer, inputs, scores
- `voting`: active, target answer, countdown, own vote
- `results`: answers table, round summary
- `history`: user games, selected game details

## 8. Suggested Frontend API Client

- Use one HTTP client instance with `baseURL = http://localhost:3000`.
- Add auth interceptor for `Authorization` header.
- Normalize API errors to one shape:

```ts
{
  status: number;
  message: string;
  details?: unknown;
}
```

- For Socket.IO, register all listeners once and cleanup on unmount/logout.

## 9. Quick Manual Test Plan for Frontend Team

1. Register user A and user B.
2. Connect both with Socket.IO token auth.
3. User A creates room.
4. User B joins room.
5. Start game from owner.
6. Select letter, submit answers from both users.
7. Stop round and verify `round-results` + `update-scores`.
8. Start a vote and verify vote timer/events.
9. Continue rounds until `game-finished`.
10. Open history endpoint and verify `historyId` game exists.

## 10. Known Integration Notes

- `select-letter` server event currently sends used letters under key `availableLetters`.
- Root URL `/` is a status endpoint, not frontend UI.
- Unknown routes intentionally return `404 { "error": "Not found" }`.
- During active rounds, disconnect has a 30 second grace period for reconnect.
