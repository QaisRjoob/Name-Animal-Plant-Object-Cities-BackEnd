const router = require('express').Router();
const GameHistory = require('../models/GameHistory');
const { authMiddleware } = require('../middleware/auth');

// GET /api/history/:userId  – paginated game history for a user
router.get('/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  try {
    const [games, total] = await Promise.all([
      GameHistory.find({ 'players.userId': userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-rounds.answers'), // Omit heavy per-answer data from list view
      GameHistory.countDocuments({ 'players.userId': userId }),
    ]);

    res.json({
      games,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/history/game/:historyId  – full detail for a single game
router.get('/game/:historyId', authMiddleware, async (req, res) => {
  try {
    const game = await GameHistory.findById(req.params.historyId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json({ game });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
