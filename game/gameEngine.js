'use strict';

const { getRandomUnusedLetter, getAvailableLetters, isLetterValid, getLettersForAlphabet } = require('../utils/letterUtils');
const { calculateRoundScores, applyRoundScores, applyVotingResult, getFinalLeaderboard } = require('./scoreSystem');
const { createVotingSession, recordVote, tallyVotes, tallyDuplicateTarget, isVotingExpired, VOTING_DURATION_MS } = require('./votingSystem');
const { scheduleBotAnswers, cancelBotTimers } = require('./botEngine');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');

// ─── Game States ─────────────────────────────────────────────────────────────
const STATES = {
  WAITING: 'WAITING',
  STARTING: 'STARTING',
  SELECTING_LETTER: 'SELECTING_LETTER',
  PLAYING: 'PLAYING',
  STOPPED: 'STOPPED',
  VOTING: 'VOTING',
  SCORING: 'SCORING',
  NEXT_ROUND: 'NEXT_ROUND',
  FINISHED: 'FINISHED',
};

// In-memory room store
const activeRooms = new Map();

// ─── Room Factory ─────────────────────────────────────────────────────────────
const createRoom = ({ ownerId, ownerUsername, totalRounds = 5, timeLimit = 60, letterMode = 'both', alphabet = 'en' }) => {
  const roomId = generateRoomId();
  const room = {
    roomId,
    ownerId,
    players: [],
    gameState: STATES.WAITING,
    currentLetter: null,
    usedLetters: [],
    round: 0,
    totalRounds: Math.min(Math.max(totalRounds, 1), 28),
    timeLimit: Math.min(Math.max(timeLimit, 30), 120),
    letterMode, // 'manual' | 'random' | 'both'
    alphabet,   // 'en' or 'ar'
    currentSelectorId: null,
    stopInitiatorId: null,
    votingSession: null,
    pauseRequested: false,
    roundHistory: [],
    readyForNext: new Set(),
    // Timer handles
    _roundTimer: null,
    _votingTimer: null,
    _botTimers: [],
    _roundStartTime: null,
    _stopAllowed: false,
    _stopAllowedTimer: null,
    _nextRoundTimer: null,
    _botSelectorTimer: null,
    _selectLetterEmittedRound: null,
    _selectedLetterRound: null,
  };
  activeRooms.set(roomId, room);
  return room;
};

const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const getRoom = (roomId) => activeRooms.get(roomId);
const deleteRoom = (roomId) => activeRooms.delete(roomId);

// ─── Player Helpers ───────────────────────────────────────────────────────────
const addPlayerToRoom = (room, player) => {
  if (room.players.length >= 10) return { error: 'Room is full' };
  if (room.players.find((p) => p.id === player.id)) return { error: 'Already in room' };
  room.players.push({
    id: player.id,
    username: player.username,
    isBot: player.isBot || false,
    difficulty: player.difficulty || null,
    score: 0,
    answers: {},
    disconnected: false,
    ready: false,
  });
  return { success: true };
};

const removePlayerFromRoom = (room, playerId) => {
  room.players = room.players.filter((p) => p.id !== playerId);
  room.readyForNext.delete(playerId);
};

const getRealPlayers = (room) => room.players.filter((p) => !p.isBot && !p.disconnected);
const getAllActivePlayers = (room) => room.players.filter((p) => !p.disconnected);

// ─── Timer Helpers ────────────────────────────────────────────────────────────
const clearRoomTimers = (room) => {
  if (room._roundTimer) { clearInterval(room._roundTimer); room._roundTimer = null; }
  if (room._votingTimer) { clearTimeout(room._votingTimer); room._votingTimer = null; }
  if (room._stopAllowedTimer) { clearTimeout(room._stopAllowedTimer); room._stopAllowedTimer = null; }
  if (room._nextRoundTimer) { clearTimeout(room._nextRoundTimer); room._nextRoundTimer = null; }
  if (room._botSelectorTimer) { clearTimeout(room._botSelectorTimer); room._botSelectorTimer = null; }
  cancelBotTimers(room._botTimers);
  room._botTimers = [];
};

const getRoundSelectorId = (room, roundNumber) => {
  const orderedActivePlayers = room.players.filter((p) => !p.disconnected);
  if (!orderedActivePlayers.length) return null;

  const ownerIndex = orderedActivePlayers.findIndex((p) => p.id === room.ownerId);
  const anchorIndex = ownerIndex >= 0 ? ownerIndex : 0;
  const selectorIndex = (anchorIndex + roundNumber - 1) % orderedActivePlayers.length;

  return orderedActivePlayers[selectorIndex]?.id || null;
};

// ─── Core Game Actions ────────────────────────────────────────────────────────

/**
 * Transition to SELECTING_LETTER state
 */
const startLetterSelection = (room, io) => {
  if (room.gameState === STATES.SELECTING_LETTER && room._selectLetterEmittedRound === room.round) {
    console.log(`[startLetterSelection] Duplicate call for round ${room.round}, skipping`);
    return;
  }

  console.log(`[startLetterSelection] Starting letter selection | Room: ${room.roomId} | Round: ${room.round} | TotalRounds: ${room.totalRounds} | Alphabet: ${room.alphabet} | Mode: ${room.letterMode}`);

  if (room._stopAllowedTimer) { clearTimeout(room._stopAllowedTimer); room._stopAllowedTimer = null; }
  if (room._botSelectorTimer) { clearTimeout(room._botSelectorTimer); room._botSelectorTimer = null; }

  room.gameState = STATES.SELECTING_LETTER;
  room.currentLetter = null;
  room._selectedLetterRound = null;

  const lettersSet = getLettersForAlphabet(room.alphabet);

  // If no letters are available, end the game safely.
  const remainingLetters = getAvailableLetters(room.usedLetters, lettersSet);
  if (!remainingLetters.length) {
    console.log(`[startLetterSelection] No remaining letters, finishing game`);
    finishGame(room, io);
    return;
  }

  // Determine selector using stable round-based rotation over all active players.
  room.currentSelectorId = getRoundSelectorId(room, room.round);

  // If no valid selector (all disconnected), fall back to random
  if (!room.currentSelectorId) {
    console.log(`[startLetterSelection] No valid selector, auto-picking random`);
    const letter = getRandomUnusedLetter(room.usedLetters, lettersSet);
    return confirmLetter(room, io, letter);
  }

  // If mode is random-only, auto-pick
  if (room.letterMode === 'random') {
    console.log(`[startLetterSelection] Random mode detected, auto-picking`);
    const letter = getRandomUnusedLetter(room.usedLetters, lettersSet);
    return confirmLetter(room, io, letter);
  }

  room._selectLetterEmittedRound = room.round;
  console.log(`[startLetterSelection] ✓ Emitting select-letter to selector ${room.currentSelectorId} | RemainingLetters: ${remainingLetters.length}`);

  // Manual or both -> ask the selector exactly once for this round.
  io.to(room.roomId).emit('select-letter', {
    selectorId: room.currentSelectorId,
    availableLetters: room.usedLetters,
    remainingLetters,
    timeLimit: 30,
  });

  const selector = room.players.find((p) => p.id === room.currentSelectorId);
  if (selector?.isBot) {
    // Bots must take a real turn instead of being skipped instantly.
    const botDelay = 1000 + Math.floor(Math.random() * 1000);
    console.log(`[startLetterSelection] Selector is bot, scheduling auto-pick after ${botDelay}ms`);
    room._botSelectorTimer = setTimeout(() => {
      if (room.gameState !== STATES.SELECTING_LETTER || room._selectedLetterRound === room.round) {
        console.log(`[startLetterSelection] Bot timer fired but letter already committed or game state changed`);
        return;
      }
      const letter = getRandomUnusedLetter(room.usedLetters, lettersSet);
      console.log(`[startLetterSelection] Bot timer fired, auto-picking "${letter}"`);
      if (letter) confirmLetter(room, io, letter);
    }, botDelay);
  }

  // Auto-pick after 30s if selector doesn't respond
  console.log(`[startLetterSelection] ✓ Setting 30s timeout for manual selection`);
  room._stopAllowedTimer = setTimeout(() => {
    if (room.gameState === STATES.SELECTING_LETTER && room._selectedLetterRound !== room.round) {
      console.log(`[startLetterSelection] ⏱️  30s timeout fired, no manual selection received`);
      const letter = getRandomUnusedLetter(room.usedLetters, lettersSet);
      console.log(`[startLetterSelection] Timeout fallback, auto-picking "${letter}"`);
      confirmLetter(room, io, letter);
    } else {
      console.log(`[startLetterSelection] 30s timeout fired but letter already committed (state: ${room.gameState}, selectedRound: ${room._selectedLetterRound}, currentRound: ${room.round})`);
    }
  }, 30000);
};

/**
 * Confirm letter and move to PLAYING
 */
const confirmLetter = (room, io, letter) => {
  if (room.gameState !== STATES.SELECTING_LETTER) {
    console.log(`[confirmLetter] Invalid state for commit: ${room.gameState}`);
    return;
  }
  if (room._selectedLetterRound === room.round) {
    console.log(`[confirmLetter] Letter already committed for round ${room.round}`);
    return;
  }

  const incomingLetter = String(letter || '');
  console.log(`[confirmLetter] Starting validation | Room: ${room.roomId} | IncomingLetter: "${incomingLetter}" (U+${incomingLetter.charCodeAt(0).toString(16).toUpperCase()}) | Round: ${room.round} | Alphabet: ${room.alphabet}`);

  // Cancel timers BEFORE validation to prevent race conditions
  if (room._stopAllowedTimer) { 
    console.log(`[confirmLetter] ✓ Cleared _stopAllowedTimer`);
    clearTimeout(room._stopAllowedTimer); 
    room._stopAllowedTimer = null; 
  }
  if (room._botSelectorTimer) { 
    console.log(`[confirmLetter] ✓ Cleared _botSelectorTimer`);
    clearTimeout(room._botSelectorTimer); 
    room._botSelectorTimer = null; 
  }

  const selected = String(letter || ''); // keep original case for Arabic
  const lettersSet = getLettersForAlphabet(room.alphabet);
  const isValid = isLetterValid(selected, room.usedLetters, lettersSet);
  
  console.log(`[confirmLetter] Letter validation | Input: "${selected}" | Valid: ${isValid} | UsedLetters: [${room.usedLetters.join(',')}] | LettersAvailable: ${lettersSet.length}`);

  let finalLetter = incomingLetter;
  if (!isValid) {
    console.log(`[confirmLetter] ❌ Letter invalid, falling back to random`);
    const fallback = getRandomUnusedLetter(room.usedLetters, lettersSet);
    if (!fallback) {
      console.log(`[confirmLetter] ❌ No fallback letter available, finishing game`);
      finishGame(room, io);
      return;
    }
    finalLetter = fallback;
    console.log(`[confirmLetter] ✓ Selected random fallback: "${finalLetter}" (was: "${incomingLetter}")`);
  } else {
    console.log(`[confirmLetter] ✓ Using manually selected letter: "${finalLetter}"`);
  }

  room._selectedLetterRound = room.round;
  room.currentLetter = String(finalLetter); // preserve original character
  room.usedLetters.push(room.currentLetter);
  
  console.log(`[confirmLetter] ✓ Letter committed | Final: "${room.currentLetter}" | Source: ${isValid ? 'manual' : 'random_fallback'} | UsedLetters after: [${room.usedLetters.join(',')}]`);

  // Reset player answers
  for (const p of room.players) p.answers = {};

  console.log(`[confirmLetter] → Emitting new-letter event with "${room.currentLetter}" for round ${room.round}`);
  io.to(room.roomId).emit('new-letter', { letter: room.currentLetter, round: room.round });

  startPlaying(room, io);
};

/**
 * PLAYING state — start round timer and bot scheduling
 */
const startPlaying = (room, io) => {
  room.gameState = STATES.PLAYING;
  room._roundStartTime = Date.now();
  room._stopAllowed = false;

  // STOP becomes available after 5 seconds
  room._stopAllowedTimer = setTimeout(() => {
    room._stopAllowed = true;
  }, 5000);

  let timeLeft = room.timeLimit;

  room._roundTimer = setInterval(() => {
    if (room.pauseRequested) return; // Freeze timer

    timeLeft--;
    io.to(room.roomId).emit('timer-update', { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(room._roundTimer);
      room._roundTimer = null;
      stopRound(room, io, null); // Auto-stop
    }
  }, 1000);

  // Schedule bot answers (pass alphabet and currentLetter)
  const bots = room.players.filter((p) => p.isBot);
  for (const bot of bots) {
    const timers = scheduleBotAnswers(bot, room.currentLetter, io, room.roomId, room.alphabet, room.round, (botId, answers) => {
      const botPlayer = room.players.find((p) => p.id === botId);
      if (botPlayer && room.gameState === STATES.PLAYING) {
        botPlayer.answers = answers;
      }
    });
    room._botTimers.push(timers);
  }
};

/**
 * STOPPED → grace period → SCORING
 */
const stopRound = (room, io, initiatorId) => {
  if (room.gameState !== STATES.PLAYING) return;

  clearRoomTimers(room);
  room.gameState = STATES.STOPPED;
  room.stopInitiatorId = initiatorId;

  io.to(room.roomId).emit('round-stopped', {
    initiatorId,
    gracePeriod: 2,
  });

  // 2s grace period for late answers
  setTimeout(() => {
    scoreRound(room, io);
  }, 2000);
};

/**
 * SCORING — calculate and broadcast scores
 */
const scoreRound = (room, io) => {
  room.gameState = STATES.SCORING;

  const { results, duplicateMap } = calculateRoundScores(room.players, room.currentLetter);
  applyRoundScores(room.players, results);

  // Store round history
  room.roundHistory.push({
    roundNumber: room.round,
    letter: room.currentLetter,
    selectorId: room.currentSelectorId,
    answers: room.players.map((p) => ({
      playerId: p.id,
      username: p.username,
      ...p.answers,
      pointsEarned: results.find((r) => r.playerId === p.id)?.pointsDelta || 0,
      wasDuplicated: results.some((r) =>
        r.playerId === p.id &&
        Object.values(r.catScores).some((cs) => cs.duplicate)
      ),
    })),
    stopInitiatorId: room.stopInitiatorId,
    votingOccurred: false,
  });

  const scores = room.players.map((p) => ({ playerId: p.id, username: p.username, score: p.score }));
  io.to(room.roomId).emit('update-scores', { scores });
  io.to(room.roomId).emit('round-results', {
    answersTable: results,
    scores,
    round: room.round,
    letter: room.currentLetter,
  });

};

/**
 * Handle voting start
 */
const startVoting = (room, io, answerDetails, initiatorId) => {
  if (room.gameState !== STATES.SCORING) return { error: 'Voting can only start during scoring' };
  if (room.votingSession) return { error: 'A vote is already in progress' };

  room.gameState = STATES.VOTING;
  room.votingSession = createVotingSession(answerDetails, initiatorId);

  io.to(room.roomId).emit('start-voting', {
    targetAnswer: answerDetails,
    initiatorId,
    timer: VOTING_DURATION_MS / 1000,
  });

  // Voting timer
  let votingTimeLeft = VOTING_DURATION_MS / 1000;
  room._votingTimer = setInterval(() => {
    votingTimeLeft--;
    io.to(room.roomId).emit('timer-update', { timeLeft: votingTimeLeft, context: 'voting' });

    if (votingTimeLeft <= 0) {
      clearInterval(room._votingTimer);
      room._votingTimer = null;
      finalizeVoting(room, io);
    }
  }, 1000);

  // Mark round as having voting
  const lastRound = room.roundHistory[room.roundHistory.length - 1];
  if (lastRound) lastRound.votingOccurred = true;

  return { success: true };
};

/**
 * Handle a vote submission
 */
const submitVote = (room, io, voterId, voteChoice, duplicateAnswersIds) => {
  if (room.gameState !== STATES.VOTING || !room.votingSession) return { error: 'No active vote' };

  // Bots cannot vote
  const voter = room.players.find((p) => p.id === voterId);
  if (!voter || voter.isBot) return { error: 'Bots cannot vote' };

  // Answer owner cannot vote on their own answer
  if (voterId === room.votingSession.targetPlayerId) return { error: 'Cannot vote on your own answer' };

  const duplicateTargetId = duplicateAnswersIds?.[0] ?? null;
  room.votingSession = recordVote(room.votingSession, voterId, voteChoice, duplicateTargetId);

  // Eligible voters: real players who are NOT the answer owner
  const eligibleVoterIds = getRealPlayers(room)
    .filter((p) => p.id !== room.votingSession.targetPlayerId)
    .map((p) => p.id);

  const voterIds = Object.keys(room.votingSession.votes);
  io.to(room.roomId).emit('vote-progress', {
    voted: voterIds.length,
    total: eligibleVoterIds.length,
    voterIds,
  });

  const result = tallyVotes(room.votingSession, eligibleVoterIds);
  if (result && result.finished) {
    clearInterval(room._votingTimer);
    room._votingTimer = null;
    finalizeVoting(room, io);
  }
};

/**
 * Finalize voting result
 */
const finalizeVoting = (room, io) => {
  const session = room.votingSession;
  if (!session) return;

  const outcome = session.outcome || 'no_change';

  // For duplicate outcome, determine which player was most-voted as the original
  let duplicateOriginalId = null;
  if (outcome === 'duplicate') {
    duplicateOriginalId = tallyDuplicateTarget(session);
  }

  applyVotingResult(room.players, session, outcome, duplicateOriginalId);

  const scores = room.players.map((p) => ({ playerId: p.id, username: p.username, score: p.score }));

  io.to(room.roomId).emit('end-voting', {
    outcome,
    votes: session.votes,
    targetPlayerId: session.targetPlayerId,
    category: session.category,
    duplicateOriginalId,
  });

  io.to(room.roomId).emit('update-scores', { scores });

  // Store voting result in round history
  const lastRound = room.roundHistory[room.roundHistory.length - 1];
  if (lastRound) lastRound.votingResults = { outcome, votes: session.votes, duplicateOriginalId };

  room.votingSession = null;
  room.gameState = STATES.SCORING;
};

/**
 * Proceed to next round or finish game
 */
const proceedToNextRound = (room, io) => {
  if (room.gameState === STATES.NEXT_ROUND) return;

  if (room._stopAllowedTimer) { clearTimeout(room._stopAllowedTimer); room._stopAllowedTimer = null; }
  if (room._nextRoundTimer) { clearTimeout(room._nextRoundTimer); room._nextRoundTimer = null; }
  room.readyForNext.clear();

  if (room.round >= room.totalRounds) {
    return finishGame(room, io);
  }

  room.gameState = STATES.NEXT_ROUND;
  room.round++;
  const nextSelectorId = getRoundSelectorId(room, room.round);

  io.to(room.roomId).emit('next-round', {
    roundNumber: room.round,
    selectorId: nextSelectorId,
  });

  // Small delay before letter selection
  room._nextRoundTimer = setTimeout(() => {
    room._nextRoundTimer = null;
    startLetterSelection(room, io);
  }, 2000);
};

/**
 * Finish the game and persist history
 */
const finishGame = async (room, io) => {
  clearRoomTimers(room);
  room.gameState = STATES.FINISHED;

  const leaderboard = getFinalLeaderboard(room.players);
  const winner = leaderboard[0];

  io.to(room.roomId).emit('game-finished', {
    finalScores: leaderboard,
    winner: winner ? { playerId: winner.playerId, username: winner.username, score: winner.score } : null,
  });

  // Persist to MongoDB
  try {
    const history = new GameHistory({
      roomId: room.roomId,
      totalRounds: room.totalRounds,
      timeLimit: room.timeLimit,
      letterMode: room.letterMode,
      players: room.players.map((p) => ({
        userId: p.isBot ? null : p.id,
        username: p.username,
        isBot: p.isBot,
        botDifficulty: p.difficulty || null,
        finalScore: p.score,
      })),
      rounds: room.roundHistory,
      winnerId: winner?.playerId || null,
      winnerUsername: winner?.username || null,
    });

    await history.save();

    // Update real player stats
    const realPlayers = room.players.filter((p) => !p.isBot);
    for (const p of realPlayers) {
      const isWinner = p.id === winner?.playerId;
      await User.findByIdAndUpdate(p.id, {
        $inc: { totalScore: p.score, gamesPlayed: 1, gamesWon: isWinner ? 1 : 0 },
      });
    }

    io.to(room.roomId).emit('game-finished', {
      finalScores: leaderboard,
      winner: winner ? { playerId: winner.playerId, username: winner.username, score: winner.score } : null,
      historyId: history._id,
    });
  } catch (err) {
    console.error('Failed to save game history:', err.message);
  }

  // Clean up room after 60s
  setTimeout(() => deleteRoom(room.roomId), 60000);
};

// ─── Pause / Resume / Kick ────────────────────────────────────────────────────
const pauseGame = (room, io, requesterId) => {
  if (room.ownerId !== requesterId) return { error: 'Only owner can pause' };
  if (![STATES.PLAYING, STATES.SELECTING_LETTER].includes(room.gameState)) return { error: 'Cannot pause now' };
  room.pauseRequested = true;
  io.to(room.roomId).emit('game-paused', { by: requesterId });
  return { success: true };
};

const resumeGame = (room, io, requesterId) => {
  if (room.ownerId !== requesterId) return { error: 'Only owner can resume' };
  room.pauseRequested = false;
  io.to(room.roomId).emit('game-resumed', { by: requesterId });
  return { success: true };
};

const kickPlayer = (room, io, requesterId, targetId) => {
  if (room.ownerId !== requesterId) return { error: 'Only owner can kick' };
  const target = room.players.find((p) => p.id === targetId);
  if (!target) return { error: 'Player not found' };
  if (target.isBot) return { error: 'Cannot kick a bot — use remove-bot instead' };

  removePlayerFromRoom(room, targetId);

  // If kicked player was the selector, reassign
  if (room.currentSelectorId === targetId && room.gameState === STATES.SELECTING_LETTER) {
    const lettersSet = getLettersForAlphabet(room.alphabet);
    const letter = getRandomUnusedLetter(room.usedLetters, lettersSet);
    confirmLetter(room, io, letter);
  }

  io.to(room.roomId).emit('player-kicked', { targetId, username: target.username });
  return { success: true };
};

// ─── Reconnect Sync ───────────────────────────────────────────────────────────
const getReconnectPayload = (room) => ({
  roomId: room.roomId,
  gameState: room.gameState,
  players: room.players.map((p) => ({ id: p.id, username: p.username, isBot: p.isBot, score: p.score })),
  round: room.round,
  totalRounds: room.totalRounds,
  currentLetter: room.currentLetter,
  usedLetters: room.usedLetters,
  currentSelectorId: room.currentSelectorId,
  ownerId: room.ownerId,
  votingSession: room.votingSession
    ? { targetPlayerId: room.votingSession.targetPlayerId, category: room.votingSession.category }
    : null,
  alphabet: room.alphabet,
});

module.exports = {
  STATES,
  activeRooms,
  createRoom,
  getRoom,
  deleteRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  getRealPlayers,
  getAllActivePlayers,
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
};