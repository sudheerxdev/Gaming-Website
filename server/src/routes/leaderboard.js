const express = require('express');
const LeaderboardEntry = require('../models/LeaderboardEntry');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, game, sort = 'points' } = req.query;
    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (game) {
      filter.game = game;
    }

    const sortField = ['points', 'wins', 'losses', 'name'].includes(sort) ? sort : 'points';
    const direction = sortField === 'name' ? 1 : -1;

    const rows = await LeaderboardEntry.find(filter).sort({ [sortField]: direction, points: -1, wins: -1 });
    const games = await LeaderboardEntry.distinct('game');

    const data = rows.map((row, index) => ({
      id: row._id,
      rank: index + 1,
      type: row.type,
      name: row.name,
      game: row.game,
      points: row.points,
      wins: row.wins,
      losses: row.losses
    }));

    return res.json({ entries: data, games: games.sort() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

module.exports = router;
