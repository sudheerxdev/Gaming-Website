const express = require('express');
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { getTournamentStatus } = require('../utils/status');

const router = express.Router();

const mapTournament = (row) => ({
  id: row._id,
  title: row.title,
  game: row.game,
  description: row.description,
  bannerImage: row.bannerImage,
  prizePool: row.prizePool,
  entryFee: row.entryFee,
  maxTeams: row.maxTeams,
  teamsRegistered: row.teamsRegistered,
  featured: row.featured,
  startDate: row.startDate,
  endDate: row.endDate,
  status: getTournamentStatus(row.startDate, row.endDate)
});

router.get('/', async (req, res) => {
  try {
    const { game, q, featured, status } = req.query;
    const filter = {};

    if (game) {
      filter.game = game;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { game: { $regex: q, $options: 'i' } }
      ];
    }

    const tournaments = await Tournament.find(filter).sort({ startDate: 1 });
    let rows = tournaments.map(mapTournament);

    if (status) {
      rows = rows.filter((item) => item.status.toLowerCase() === String(status).toLowerCase());
    }

    return res.json({ tournaments: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tournaments' });
  }
});

router.get('/featured', async (_req, res) => {
  try {
    const tournaments = await Tournament.find({ featured: true }).sort({ startDate: 1 }).limit(8);
    return res.json({ tournaments: tournaments.map(mapTournament) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch featured tournaments' });
  }
});

router.get('/events/ticker', async (_req, res) => {
  try {
    const now = new Date();
    const items = await Tournament.find({ endDate: { $gte: now } })
      .sort({ startDate: 1 })
      .limit(10)
      .select('title game startDate');

    const ticker = items.map((item) => ({
      id: item._id,
      text: `${item.title} (${item.game}) starts ${new Date(item.startDate).toLocaleString()}`
    }));

    return res.json({ ticker });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load ticker events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid tournament id' });
    }

    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const totalRegistrations = await Registration.countDocuments({ tournament: tournament._id });

    return res.json({
      tournament: {
        ...mapTournament(tournament),
        totalRegistrations
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tournament details' });
  }
});

router.post('/:id/register', auth, async (req, res) => {
  try {
    const { teamName, players } = req.body;

    if (!teamName || !Array.isArray(players) || players.length < 1) {
      return res.status(400).json({ message: 'Team name and at least one player are required' });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const alreadyRegistered = await Registration.findOne({
      user: req.user._id,
      tournament: tournament._id
    });

    if (alreadyRegistered) {
      return res.status(409).json({ message: 'You are already registered for this tournament' });
    }

    const isFull = tournament.teamsRegistered >= tournament.maxTeams;

    const registration = await Registration.create({
      user: req.user._id,
      tournament: tournament._id,
      teamName: teamName.trim(),
      players: players.filter(Boolean).map((item) => String(item).trim()),
      status: isFull ? 'Waitlisted' : 'Confirmed'
    });

    if (!isFull) {
      tournament.teamsRegistered += 1;
      await tournament.save();
    }

    await Notification.create([
      {
        user: req.user._id,
        title: 'Tournament Registration Confirmed',
        message: `Your team ${teamName} is ${registration.status} for ${tournament.title}.`,
        kind: 'registration'
      },
      {
        user: req.user._id,
        title: 'Mock Email Sent',
        message: `Email notification queued for ${tournament.title}.`,
        kind: 'email'
      }
    ]);

    return res.status(201).json({
      message: 'Registration submitted successfully',
      registration: {
        id: registration._id,
        teamName: registration.teamName,
        players: registration.players,
        status: registration.status
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Already registered for this tournament' });
    }

    return res.status(500).json({ message: 'Failed to register for tournament' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ refType: 'tournament', refId: req.params.id })
      .populate('user', 'name avatar gamerTag')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const comment = await Comment.create({
      user: req.user._id,
      refType: 'tournament',
      refId: tournament._id,
      content: content.trim()
    });

    await comment.populate('user', 'name avatar gamerTag');

    return res.status(201).json({ comment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to post comment' });
  }
});

module.exports = router;
