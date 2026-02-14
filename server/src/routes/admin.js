const express = require('express');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const News = require('../models/News');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(auth, isAdmin);

router.post('/tournaments', async (req, res) => {
  try {
    const payload = req.body;

    const required = ['title', 'game', 'description', 'bannerImage', 'startDate', 'endDate'];
    const missing = required.filter((key) => !payload[key]);

    if (missing.length) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    const tournament = await Tournament.create({
      title: payload.title,
      game: payload.game,
      description: payload.description,
      bannerImage: payload.bannerImage,
      prizePool: Number(payload.prizePool || 0),
      entryFee: Number(payload.entryFee || 0),
      maxTeams: Number(payload.maxTeams || 32),
      featured: Boolean(payload.featured),
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate)
    });

    return res.status(201).json({ tournament });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create tournament' });
  }
});

router.post('/matches', async (req, res) => {
  try {
    const { tournament, game, teamA, teamB, scheduledAt, status } = req.body;

    if (!tournament || !game || !teamA || !teamB || !scheduledAt) {
      return res.status(400).json({ message: 'tournament, game, teamA, teamB and scheduledAt are required' });
    }

    const match = await Match.create({
      tournament,
      game,
      teamA,
      teamB,
      scheduledAt,
      status: status || 'Upcoming'
    });

    return res.status(201).json({ match });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to schedule match' });
  }
});

router.post('/news', async (req, res) => {
  try {
    const { title, slug, excerpt, content, image, category, featured, author } = req.body;

    if (!title || !slug || !excerpt || !content || !image || !category) {
      return res.status(400).json({ message: 'Missing required article fields' });
    }

    const article = await News.create({
      title,
      slug,
      excerpt,
      content,
      image,
      category,
      featured: Boolean(featured),
      author: author || 'GameHub Editorial'
    });

    return res.status(201).json({ article });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create article' });
  }
});

module.exports = router;
