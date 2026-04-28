const router = require('express').Router();
const { listWords, getWordDatasetMeta } = require('../services/wordDatasetService');

// GET /api/words?category=names&letter=A&language=english&limit=200
router.get('/', async (req, res) => {
  try {
    const words = await listWords({
      category: req.query.category,
      letter: req.query.letter,
      language: req.query.language,
      limit: req.query.limit,
    });

    res.json({
      words,
      total: words.length,
      filters: {
        category: req.query.category || null,
        letter: req.query.letter || null,
        language: req.query.language || getWordDatasetMeta().language,
      },
      source: getWordDatasetMeta(),
    });
  } catch (err) {
    console.error('Words route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
