const express = require('express');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const Match = require('../models/Match');
const { auth } = require('../middleware/auth');
const { getTournamentStatus } = require('../utils/status');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const [registrations, notifications] = await Promise.all([
      Registration.find({ user: req.user._id })
        .populate('tournament')
        .sort({ createdAt: -1 })
        .limit(8),
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10)
    ]);

    const upcomingMatches = await Match.find({
      status: { $in: ['Upcoming', 'Live'] },
      game: { $in: registrations.map((r) => r.tournament?.game).filter(Boolean) }
    })
      .sort({ scheduledAt: 1 })
      .limit(8);

    const registeredTournaments = registrations
      .filter((row) => row.tournament)
      .map((row) => ({
        registrationId: row._id,
        teamName: row.teamName,
        players: row.players,
        status: row.status,
        tournament: {
          id: row.tournament._id,
          title: row.tournament.title,
          game: row.tournament.game,
          startDate: row.tournament.startDate,
          endDate: row.tournament.endDate,
          bannerImage: row.tournament.bannerImage,
          status: getTournamentStatus(row.tournament.startDate, row.tournament.endDate)
        }
      }));

    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        gamerTag: req.user.gamerTag,
        role: req.user.role,
        favoriteTeams: req.user.favoriteTeams
      },
      registeredTournaments,
      upcomingMatches,
      notifications,
      quickActions: [
        { label: 'Browse Tournaments', href: 'tournaments.html' },
        { label: 'Update Profile', href: 'profile.html' },
        { label: 'Check Leaderboard', href: 'leaderboard.html' }
      ]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

module.exports = router;
