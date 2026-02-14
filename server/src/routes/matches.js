const express = require('express');
const Match = require('../models/Match');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { game, status } = req.query;
    const filter = {};

    if (game) {
      filter.game = game;
    }

    if (status) {
      filter.status = status;
    }

    const matches = await Match.find(filter)
      .populate('tournament', 'title')
      .sort({ scheduledAt: 1 })
      .limit(50);

    return res.json({ matches });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load matches' });
  }
});

module.exports = router;
