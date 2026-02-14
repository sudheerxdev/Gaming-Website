const express = require('express');
const Tournament = require('../models/Tournament');
const News = require('../models/News');
const Match = require('../models/Match');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const { getTournamentStatus } = require('../utils/status');

const router = express.Router();

router.get('/home', async (_req, res) => {
  try {
    const [featuredTournaments, featuredNews, matches, topEntries] = await Promise.all([
      Tournament.find({ featured: true }).sort({ startDate: 1 }).limit(6),
      News.find({ featured: true }).sort({ publishedAt: -1 }).limit(3),
      Match.find({ status: { $in: ['Upcoming', 'Live'] } })
        .sort({ scheduledAt: 1 })
        .limit(10)
        .populate('tournament', 'title'),
      LeaderboardEntry.find({ type: 'team' }).sort({ points: -1 }).limit(5)
    ]);

    const gameCounts = await Tournament.aggregate([
      {
        $group: {
          _id: '$game',
          count: { $sum: 1 },
          nextDate: { $min: '$startDate' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const ticker = matches.map((m) => ({
      id: m._id,
      text: `${m.teamA} vs ${m.teamB} | ${m.game} | ${new Date(m.scheduledAt).toLocaleString()}`
    }));

    return res.json({
      featuredTournaments: featuredTournaments.map((item) => ({
        id: item._id,
        title: item.title,
        game: item.game,
        bannerImage: item.bannerImage,
        prizePool: item.prizePool,
        startDate: item.startDate,
        endDate: item.endDate,
        status: getTournamentStatus(item.startDate, item.endDate)
      })),
      featuredNews,
      trendingGames: gameCounts.map((game) => ({
        game: game._id,
        activeTournaments: game.count,
        nextDate: game.nextDate
      })),
      ticker,
      topTeams: topEntries
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load homepage data' });
  }
});

module.exports = router;
