const router = require('express').Router();
const User = require('../models/User');

// GET /api/leaderboard  – global top players
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      User.find()
        .sort({ totalScore: -1 })
        .skip(skip)
        .limit(limit)
        .select('username totalScore gamesPlayed gamesWon'),
      User.countDocuments(),
    ]);

    res.json({
      leaderboard: users.map((u, i) => ({
        rank: skip + i + 1,
        username: u.username,
        totalScore: u.totalScore,
        gamesPlayed: u.gamesPlayed,
        gamesWon: u.gamesWon,
        winRate: u.gamesPlayed > 0 ? Math.round((u.gamesWon / u.gamesPlayed) * 100) : 0,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
