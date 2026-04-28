const router = require('express').Router();
const { activeRooms, STATES, getRoom, getRealPlayers } = require('../game/gameEngine');

// GET /api/rooms  – list waiting rooms
router.get('/', (req, res) => {
  const rooms = [];
  for (const [, room] of activeRooms) {
    if (room.gameState === STATES.WAITING) {
      rooms.push({
        roomId: room.roomId,
        ownerUsername: room.players.find((p) => p.id === room.ownerId)?.username || 'Unknown',
        playerCount: room.players.length,
        maxPlayers: 10,
        totalRounds: room.totalRounds,
        timeLimit: room.timeLimit,
        letterMode: room.letterMode,
      });
    }
  }
  res.json({ rooms });
});

// GET /api/rooms/:roomId  – full room snapshot
router.get('/:roomId', (req, res) => {
  const room = getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const readyPlayerIds = Array.from(room.readyForNext || []);
  const totalRealPlayers = getRealPlayers(room).length;
  const voterIds = room.votingSession ? Object.keys(room.votingSession.votes || {}) : [];

  res.json({
    room: {
      roomId: room.roomId,
      ownerId: room.ownerId,
      ownerUsername: room.players.find((p) => p.id === room.ownerId)?.username || 'Unknown',
      gameState: room.gameState,
      round: room.round,
      totalRounds: room.totalRounds,
      timeLimit: room.timeLimit,
      letterMode: room.letterMode,
      currentLetter: room.currentLetter,
      usedLetters: room.usedLetters,
      stopAllowed: !!room._stopAllowed,
      players: room.players.map((p) => ({
        id: p.id,
        username: p.username,
        isBot: !!p.isBot,
        difficulty: p.difficulty || null,
        score: p.score || 0,
        disconnected: !!p.disconnected,
      })),
      readiness: {
        ready: readyPlayerIds.length,
        total: totalRealPlayers,
        readyPlayerIds,
      },
      voting: room.votingSession
        ? {
            active: true,
            initiatorId: room.votingSession.initiatorId,
            targetPlayerId: room.votingSession.targetPlayerId,
            category: room.votingSession.category,
            answer: room.votingSession.answer,
            startedAt: room.votingSession.startedAt,
            voted: voterIds.length,
            total: totalRealPlayers,
            voterIds,
          }
        : {
            active: false,
            voted: 0,
            total: totalRealPlayers,
            voterIds: [],
          },
    },
  });
});

module.exports = router;
