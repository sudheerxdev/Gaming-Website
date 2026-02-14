const express = require('express');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { getTournamentStatus } = require('../utils/status');

const router = express.Router();

router.put('/me', auth, async (req, res) => {
  try {
    const { name, gamerTag, bio, favoriteTeams, avatar } = req.body;

    const updates = {
      ...(name !== undefined ? { name } : {}),
      ...(gamerTag !== undefined ? { gamerTag } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(avatar !== undefined ? { avatar } : {})
    };

    if (Array.isArray(favoriteTeams)) {
      updates.favoriteTeams = favoriteTeams.filter(Boolean).slice(0, 10);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true
    }).select('-password');

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.post('/me/favorites', auth, async (req, res) => {
  try {
    const { team } = req.body;
    if (!team || typeof team !== 'string') {
      return res.status(400).json({ message: 'Team is required' });
    }

    const user = await User.findById(req.user._id);
    const index = user.favoriteTeams.findIndex((item) => item.toLowerCase() === team.toLowerCase());

    if (index > -1) {
      user.favoriteTeams.splice(index, 1);
    } else {
      user.favoriteTeams.push(team.trim());
    }

    await user.save();

    return res.json({ favoriteTeams: user.favoriteTeams });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update favorites' });
  }
});

router.get('/me/registrations', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('tournament')
      .sort({ createdAt: -1 });

    const data = registrations
      .filter((row) => row.tournament)
      .map((row) => ({
        id: row._id,
        teamName: row.teamName,
        players: row.players,
        status: row.status,
        tournament: {
          id: row.tournament._id,
          title: row.tournament.title,
          game: row.tournament.game,
          bannerImage: row.tournament.bannerImage,
          startDate: row.tournament.startDate,
          endDate: row.tournament.endDate,
          status: getTournamentStatus(row.tournament.startDate, row.tournament.endDate)
        }
      }));

    return res.json({ registrations: data });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

router.get('/me/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

router.patch('/me/notifications/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    return res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update notifications' });
  }
});

router.get('/games', async (_req, res) => {
  const games = await Tournament.distinct('game');
  return res.json({ games: games.sort() });
});

module.exports = router;
