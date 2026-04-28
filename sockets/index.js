'use strict';

const Joi = require('joi');
const {
  STATES,
  activeRooms,
  createRoom,
  getRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  getRealPlayers,
  startLetterSelection,
  confirmLetter,
  stopRound,
  startVoting,
  submitVote,
  proceedToNextRound,
  pauseGame,
  resumeGame,
  kickPlayer,
  getReconnectPayload,
  clearRoomTimers,
  isLetterValid,
} = require('../game/gameEngine');
const { getLettersForAlphabet } = require('../utils/letterUtils');
const { createBot } = require('../game/botEngine');
const { getAvailableLetters } = require('../utils/letterUtils');

// ── Validation schemas ────────────────────────────────────────────────────────
const schemas = {
  createRoom: Joi.object({
    totalRounds: Joi.number().integer().min(1).max(28).default(5),
    timeLimit: Joi.number().integer().min(30).max(120).default(60),
    letterMode: Joi.string().valid('manual', 'random', 'both').default('both'),
    alphabet: Joi.string().valid('en', 'ar').default('en'),
  }),
  joinRoom: Joi.object({ roomId: Joi.string().alphanum().length(6).required() }),
  selectLetter: Joi.object({
    roomId: Joi.string().required(),
    letter: Joi.string().length(1).required(),   // <-- .uppercase() removed
  }),
  submitAnswer: Joi.object({
    roomId: Joi.string().required(),
    answers: Joi.object({
      name: Joi.string().allow('').default(''),
      plant: Joi.string().allow('').default(''),
      animal: Joi.string().allow('').default(''),
      object: Joi.string().allow('').default(''),
      cities: Joi.string().allow('').default(''),
    }).required(),
  }),
  startVote: Joi.object({
    roomId: Joi.string().required(),
    answerDetails: Joi.object({
      targetPlayerId: Joi.string().required(),
      category: Joi.string().valid('name', 'plant', 'animal', 'object', 'cities').required(),
      answer: Joi.string().required(),
    }).required(),
  }),
  submitVote: Joi.object({
    roomId: Joi.string().required(),
    voteChoice: Joi.string().valid('correct', 'incorrect', 'duplicate').required(),
    duplicateAnswersIds: Joi.array().items(Joi.string()).default([]),
  }),
  addBot: Joi.object({
    roomId: Joi.string().required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  }),
  addBots: Joi.object({
    roomId: Joi.string().required(),
    count: Joi.number().integer().min(1).max(10).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  }),
  kickPlayer: Joi.object({
    roomId: Joi.string().required(),
    targetUserId: Joi.string().required(),
  }),
};

const validate = (schema, data) => schema.validate(data, { abortEarly: true, allowUnknown: false });

const emitError = (socket, message, code = 'GENERIC_ERROR') => {
  socket.emit('error', { message, code });
};

const socketRoomMap = new Map();

const registerHandlers = (io, socket) => {
  const userId = socket.userId;
  const username = socket.username;

  socket.on('create-room', (data) => {
    const { error, value } = validate(schemas.createRoom, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = createRoom({
      ownerId: userId,
      ownerUsername: username,
      totalRounds: value.totalRounds,
      timeLimit: value.timeLimit,
      letterMode: value.letterMode,
      alphabet: value.alphabet,
    });
    addPlayerToRoom(room, { id: userId, username });
    socket.join(room.roomId);
    socketRoomMap.set(socket.id, { roomId: room.roomId, userId });

    socket.emit('room-created', {
      roomId: room.roomId,
      config: {
        totalRounds: room.totalRounds,
        timeLimit: room.timeLimit,
        letterMode: room.letterMode,
        alphabet: room.alphabet,
      },
    });

    console.log(`🏠 Room ${room.roomId} created by ${username} (alphabet: ${room.alphabet})`);
  });

  socket.on('join-room', (data) => {
    const { error, value } = validate(schemas.joinRoom, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = getRoom(value.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (room.gameState !== STATES.WAITING) return emitError(socket, 'Game already in progress', 'GAME_IN_PROGRESS');

    const result = addPlayerToRoom(room, { id: userId, username });
    if (result.error) return emitError(socket, result.error, 'JOIN_ERROR');

    socket.join(value.roomId);
    socketRoomMap.set(socket.id, { roomId: value.roomId, userId });

    const player = room.players.find((p) => p.id === userId);
    io.to(value.roomId).emit('player-joined', { player });

    socket.emit('room-state', {
      roomId: room.roomId,
      ownerId: room.ownerId,
      players: room.players,
      gameState: room.gameState,
      totalRounds: room.totalRounds,
      timeLimit: room.timeLimit,
      letterMode: room.letterMode,
      alphabet: room.alphabet,
    });

    console.log(`👤 ${username} joined room ${value.roomId}`);
  });

  socket.on('leave-room', (data) => {
    handlePlayerLeave(io, socket, userId, data?.roomId);
  });

  socket.on('start-game', (data) => {
    const room = getRoom(data?.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (room.ownerId !== userId) return emitError(socket, 'Only owner can start', 'FORBIDDEN');
    if (room.gameState !== STATES.WAITING) return emitError(socket, 'Game already started', 'INVALID_STATE');
    if (room.players.length < 2) return emitError(socket, 'Need at least 2 players', 'NOT_ENOUGH_PLAYERS');

    room.gameState = STATES.STARTING;
    room.round = 1;

    io.to(room.roomId).emit('game-start', {
      roomConfig: {
        totalRounds: room.totalRounds,
        timeLimit: room.timeLimit,
        letterMode: room.letterMode,
        alphabet: room.alphabet,
        players: room.players.map((p) => ({ id: p.id, username: p.username, isBot: p.isBot })),
      },
    });

    setTimeout(() => startLetterSelection(room, io), 1500);
    console.log(`🚀 Game started in room ${room.roomId}`);
  });

  socket.on('select-letter', (data) => {
    const { error, value } = validate(schemas.selectLetter, data || {});
    if (error) {
      console.log(`[select-letter] Schema validation failed: ${error.details[0].message}`);
      return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');
    }

    const room = getRoom(value.roomId);
    if (!room) {
      console.log(`[select-letter] Room ${value.roomId} not found`);
      return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    }
    
    const incomingLetter = value.letter;
    console.log(`[select-letter] Incoming request | Room: ${room.roomId} | Letter: "${incomingLetter}" (U+${incomingLetter.charCodeAt(0).toString(16).toUpperCase()}) | User: ${username} | Alphabet: ${room.alphabet}`);

    if (room.gameState !== STATES.SELECTING_LETTER) {
      console.log(`[select-letter] Invalid state: ${room.gameState} (expected SELECTING_LETTER)`);
      return emitError(socket, 'Not in letter selection phase', 'INVALID_STATE');
    }
    if (room.letterMode === 'random') {
      console.log(`[select-letter] Letter mode is random, cannot manually select`);
      return emitError(socket, 'Random mode — cannot manually select', 'FORBIDDEN');
    }
    if (room.currentSelectorId !== userId) {
      console.log(`[select-letter] Not selector's turn | Expected: ${room.currentSelectorId} | Got: ${userId}`);
      return emitError(socket, 'Not your turn to select', 'FORBIDDEN');
    }

    // FIX: Correctly pass letter array instead of alphabet string
    const lettersSet = getLettersForAlphabet(room.alphabet);
    const isValid = isLetterValid(incomingLetter, room.usedLetters, lettersSet);
    console.log(`[select-letter] Validation result | Letter: "${incomingLetter}" | Valid: ${isValid} | UsedLetters: [${room.usedLetters.join(',')}] | LettersCount: ${lettersSet.length}`);
    
    if (!isValid) {
      console.log(`[select-letter] Letter invalid or already used`);
      return emitError(socket, 'Letter already used or invalid', 'INVALID_LETTER');
    }

    console.log(`[select-letter] ✓ Validation passed, calling confirmLetter with "${incomingLetter}"`);
    confirmLetter(room, io, incomingLetter);
  });

  socket.on('submit-answer', (data) => {
    const { error, value } = validate(schemas.submitAnswer, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = getRoom(value.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (room.gameState !== STATES.PLAYING) return emitError(socket, 'Round not active', 'INVALID_STATE');

    const player = room.players.find((p) => p.id === userId);
    if (!player) return emitError(socket, 'Player not in room', 'NOT_IN_ROOM');

    player.answers = value.answers;
    io.to(value.roomId).emit('update-inputs', { userId, answers: value.answers });
  });

  socket.on('stop-game', (data) => {
    const room = getRoom(data?.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (room.gameState !== STATES.PLAYING) return emitError(socket, 'Round not active', 'INVALID_STATE');
    if (!room._stopAllowed) return emitError(socket, 'Cannot stop yet (5s minimum)', 'TOO_EARLY');
    if (!room.players.find((p) => p.id === userId)) return emitError(socket, 'Not in room', 'NOT_IN_ROOM');

    stopRound(room, io, userId);
  });

  socket.on('pause-game', (data) => {
    const room = getRoom(data?.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    const result = pauseGame(room, io, userId);
    if (result.error) emitError(socket, result.error, 'FORBIDDEN');
  });

  socket.on('resume-game', (data) => {
    const room = getRoom(data?.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    const result = resumeGame(room, io, userId);
    if (result.error) emitError(socket, result.error, 'FORBIDDEN');
  });

  socket.on('kick-player', (data) => {
    const { error, value } = validate(schemas.kickPlayer, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = getRoom(value.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');

    const result = kickPlayer(room, io, userId, value.targetUserId);
    if (result.error) emitError(socket, result.error, 'KICK_ERROR');
  });

  socket.on('start-vote', (data) => {
    const { error, value } = validate(schemas.startVote, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = getRoom(value.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');

    const result = startVoting(room, io, value.answerDetails, userId);
    if (result?.error) emitError(socket, result.error, 'VOTE_ERROR');
  });

  socket.on('submit-vote', (data) => {
    const { error, value } = validate(schemas.submitVote, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = getRoom(value.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (!room.players.find((p) => p.id === userId)) return emitError(socket, 'Not in room', 'NOT_IN_ROOM');

    submitVote(room, io, userId, value.voteChoice, value.duplicateAnswersIds);
  });

  socket.on('next-round', (data) => {
    const room = getRoom(data?.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (![STATES.SCORING, STATES.NEXT_ROUND].includes(room.gameState)) return;

    room.readyForNext.add(userId);
    const readyPlayerIds = Array.from(room.readyForNext);
    const realCount = getRealPlayers(room).length;

    io.to(room.roomId).emit('ready-progress', {
      ready: readyPlayerIds.length,
      total: realCount,
      readyPlayerIds,
    });

    if (room.readyForNext.size >= realCount) {
      proceedToNextRound(room, io);
    }
  });

  socket.on('add-bot', (data) => {
    const { error, value } = validate(schemas.addBot, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = getRoom(value.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (room.ownerId !== userId) return emitError(socket, 'Only owner can add bots', 'FORBIDDEN');
    if (room.gameState !== STATES.WAITING) return emitError(socket, 'Cannot add bots after game started', 'INVALID_STATE');
    if (room.players.length >= 10) return emitError(socket, 'Room is full', 'ROOM_FULL');
    // Bots are now supported in Arabic rooms (thanks to the extended dataset)
    // No restriction needed – the bot engine will use Arabic words.

    const bot = createBot(value.difficulty);
    const result = addPlayerToRoom(room, bot);
    if (result.error) return emitError(socket, result.error, 'BOT_ERROR');

    io.to(room.roomId).emit('bot-joined', {
      bot: { id: bot.id, username: bot.username, isBot: true, difficulty: bot.difficulty, score: 0 },
    });
  });

  socket.on('add-bots', (data) => {
    const { error, value } = validate(schemas.addBots, data || {});
    if (error) return emitError(socket, error.details[0].message, 'VALIDATION_ERROR');

    const room = getRoom(value.roomId);
    if (!room) return emitError(socket, 'Room not found', 'ROOM_NOT_FOUND');
    if (room.ownerId !== userId) return emitError(socket, 'Only owner can add bots', 'FORBIDDEN');
    if (room.gameState !== STATES.WAITING) return emitError(socket, 'Cannot add bots after game started', 'INVALID_STATE');
    if (room.players.length >= 10) return emitError(socket, 'Room is full', 'ROOM_FULL');

    const availableSlots = Math.max(0, 10 - room.players.length);
    const addCount = Math.min(value.count, availableSlots);
    const addedBots = [];

    for (let i = 0; i < addCount; i++) {
      const bot = createBot(value.difficulty);
      const result = addPlayerToRoom(room, bot);
      if (result.error) break;

      const botPayload = { id: bot.id, username: bot.username, isBot: true, difficulty: bot.difficulty, score: 0 };
      addedBots.push(botPayload);
      io.to(room.roomId).emit('bot-joined', { bot: botPayload });
    }

    if (addedBots.length === 0) return emitError(socket, 'Could not add bots', 'BOT_ERROR');

    io.to(room.roomId).emit('bots-joined', {
      roomId: room.roomId,
      count: addedBots.length,
      bots: addedBots,
    });
  });

  socket.on('reconnect-game', (data) => {
    const room = getRoom(data?.roomId);
    if (!room) return emitError(socket, 'Room not found or expired', 'ROOM_NOT_FOUND');

    const player = room.players.find((p) => p.id === userId);
    if (!player) return emitError(socket, 'You were not in this room', 'NOT_IN_ROOM');

    player.disconnected = false;
    socket.join(room.roomId);
    socketRoomMap.set(socket.id, { roomId: room.roomId, userId });

    socket.emit('reconnect-sync', getReconnectPayload(room));
    io.to(room.roomId).emit('player-reconnected', { userId, username });
  });

  socket.on('disconnect', () => {
    const mapping = socketRoomMap.get(socket.id);
    if (mapping) {
      handlePlayerLeave(io, socket, mapping.userId, mapping.roomId, true);
      socketRoomMap.delete(socket.id);
    }
    console.log(`🔌 ${username} disconnected`);
  });
};

const handlePlayerLeave = (io, socket, userId, roomId, isDisconnect = false) => {
  if (!roomId) return;
  const room = getRoom(roomId);
  if (!room) return;

  const player = room.players.find((p) => p.id === userId);
  if (!player) return;

  if (isDisconnect && room.gameState !== STATES.WAITING && room.gameState !== STATES.FINISHED) {
    player.disconnected = true;
    io.to(roomId).emit('player-left', { userId, username: player.username, temporary: true });

    setTimeout(() => {
      const currentRoom = getRoom(roomId);
      if (!currentRoom) return;
      const p = currentRoom.players.find((pl) => pl.id === userId);
      if (p && p.disconnected) {
        removePlayerFromRoom(currentRoom, userId);
        io.to(roomId).emit('player-left', { userId, username: player.username, temporary: false });

        if (currentRoom.players.filter((pl) => !pl.isBot).length === 0) {
          clearRoomTimers(currentRoom);
          activeRooms.delete(roomId);
        }
      }
    }, 30000);
  } else {
    removePlayerFromRoom(room, userId);
    socket.leave(roomId);
    io.to(roomId).emit('player-left', { userId, username: player.username, temporary: false });

    if (room.ownerId === userId) {
      const nextOwner = room.players.find((p) => !p.isBot && !p.disconnected);
      if (nextOwner) {
        room.ownerId = nextOwner.id;
        io.to(roomId).emit('owner-changed', { newOwnerId: nextOwner.id, username: nextOwner.username });
      } else {
        clearRoomTimers(room);
        activeRooms.delete(roomId);
      }
    }
  }
};

const initSockets = (io) => {
  const { socketAuthMiddleware } = require('../middleware/auth');
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`✅ ${socket.username} connected [${socket.id}]`);
    registerHandlers(io, socket);
  });
};

module.exports = { initSockets };