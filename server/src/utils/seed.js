const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const News = require('../models/News');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const Match = require('../models/Match');
const Notification = require('../models/Notification');

const addDays = (date, days) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const seedData = async () => {
  const now = new Date();

  const adminEmail = 'admin@gamehub.gg';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'GameHub Admin',
      email: adminEmail,
      password: hash,
      role: 'admin',
      gamerTag: 'AdminCore'
    });
  }

  const userCount = await User.countDocuments();
  if (userCount === 1) {
    const hash = await bcrypt.hash('Player@123', 10);
    const user = await User.create({
      name: 'Sudheer Yadav',
      email: 'sudheer@example.com',
      password: hash,
      role: 'user',
      gamerTag: 'SudheerXDev',
      favoriteTeams: ['Phantom Reapers', 'Nova Titans']
    });

    await Notification.create({
      user: user._id,
      title: 'Welcome to GameHub',
      message: 'Complete your profile and register for your first tournament.',
      kind: 'system'
    });
  }

  const tournamentCount = await Tournament.countDocuments();
  if (tournamentCount === 0) {
    await Tournament.insertMany([
      {
        title: 'Battle Extreme Masters',
        game: 'Valorant',
        description:
          'A tactical showdown featuring top-tier rosters battling through elimination brackets.',
        bannerImage: '/assets/images/hero-banner.png',
        prizePool: 50000,
        entryFee: 25,
        maxTeams: 64,
        teamsRegistered: 26,
        featured: true,
        startDate: addDays(now, 5),
        endDate: addDays(now, 8)
      },
      {
        title: 'Arena Clash Invitational',
        game: 'CS2',
        description:
          'Fast paced invitational with global contenders and live casting throughout the weekend.',
        bannerImage: '/assets/images/team-logo-1.png',
        prizePool: 80000,
        entryFee: 30,
        maxTeams: 32,
        teamsRegistered: 32,
        featured: true,
        startDate: addDays(now, -1),
        endDate: addDays(now, 1)
      },
      {
        title: 'Legends Rift Open Cup',
        game: 'League of Legends',
        description: 'Open regional cup with group stage and double elimination playoffs.',
        bannerImage: '/assets/images/team-logo-2.png',
        prizePool: 65000,
        entryFee: 20,
        maxTeams: 48,
        teamsRegistered: 48,
        featured: true,
        startDate: addDays(now, -15),
        endDate: addDays(now, -10)
      },
      {
        title: 'Storm Royale Weekend',
        game: 'Fortnite',
        description: 'Solo and squad battles with rotating maps and bonus objective scoring.',
        bannerImage: '/assets/images/team-logo-3.png',
        prizePool: 42000,
        entryFee: 15,
        maxTeams: 100,
        teamsRegistered: 58,
        featured: true,
        startDate: addDays(now, 12),
        endDate: addDays(now, 13)
      },
      {
        title: 'Dota Prime Championship',
        game: 'Dota 2',
        description: 'International-tier moba bracket with BO3 playoffs and BO5 grand finals.',
        bannerImage: '/assets/images/team-logo-4.png',
        prizePool: 120000,
        entryFee: 40,
        maxTeams: 24,
        teamsRegistered: 16,
        featured: false,
        startDate: addDays(now, 20),
        endDate: addDays(now, 24)
      },
      {
        title: 'Apex Predator Trials',
        game: 'Apex Legends',
        description: 'Aggressive battle royale format with map-based performance multipliers.',
        bannerImage: '/assets/images/team-logo-5.png',
        prizePool: 55000,
        entryFee: 20,
        maxTeams: 60,
        teamsRegistered: 44,
        featured: false,
        startDate: addDays(now, 3),
        endDate: addDays(now, 5)
      }
    ]);
  }

  const newsCount = await News.countDocuments();
  if (newsCount === 0) {
    await News.insertMany([
      {
        title: 'Patch 12.8 Meta Shakeup: Controllers Rise Again',
        slug: 'patch-12-8-meta-shakeup-controllers-rise',
        excerpt: 'The newest update changes utility timings and map control strategies.',
        content:
          'Patch 12.8 introduces major utility cooldown changes and economy balancing. Teams adapting faster to delayed ult windows are dominating scrims. Analysts expect controller-heavy lineups to surge in the next qualifier cycle.',
        image: '/assets/images/news-1.jpg',
        category: 'Patch Notes',
        featured: true,
        author: 'GameHub Analysts'
      },
      {
        title: 'From Scrims to Stage: How Tier-2 Teams Break Through',
        slug: 'from-scrims-to-stage-tier2-breakthrough',
        excerpt: 'A deep dive into discipline, data review, and adaptation speed.',
        content:
          'Tier-2 teams are closing the gap through structured VOD reviews, role flexibility, and stronger anti-strat prep. Coaches are prioritizing transferable playbooks instead of one-off map counters.',
        image: '/assets/images/news-2.jpg',
        category: 'Strategy',
        featured: true,
        author: 'Sudheer Yadav'
      },
      {
        title: 'GameHub Season Roadmap Released',
        slug: 'gamehub-season-roadmap-released',
        excerpt: 'New qualifiers, regional finals, and creator showmatches announced.',
        content:
          'The 2026 roadmap includes monthly qualifiers across FPS, MOBA, and BR titles, capped by a cross-title finals weekend. Creator showmatches and community MVP voting are also now part of each season.',
        image: '/assets/images/news-3.jpg',
        category: 'Platform News',
        featured: true,
        author: 'GameHub Editorial'
      },
      {
        title: 'Why Crosshair Discipline Still Wins Late Rounds',
        slug: 'why-crosshair-discipline-wins-late-rounds',
        excerpt: 'Mechanical basics remain the differentiator under pressure.',
        content:
          'Under clutch pressure, players with stable crosshair placement convert significantly more opening duels. This season, teams running focused micro-drills report improved retake win rates.',
        image: '/assets/images/news-1.jpg',
        category: 'Coaching',
        featured: false,
        author: 'Coach Delta'
      }
    ]);
  }

  const leaderboardCount = await LeaderboardEntry.countDocuments();
  if (leaderboardCount === 0) {
    await LeaderboardEntry.insertMany([
      { type: 'team', name: 'Phantom Reapers', game: 'Valorant', points: 2450, wins: 18, losses: 4 },
      { type: 'team', name: 'Nova Titans', game: 'CS2', points: 2310, wins: 16, losses: 5 },
      { type: 'team', name: 'Arc Wolves', game: 'League of Legends', points: 2288, wins: 15, losses: 6 },
      { type: 'team', name: 'Stormbreak', game: 'Dota 2', points: 2200, wins: 13, losses: 7 },
      { type: 'team', name: 'Pulse Syndicate', game: 'Apex Legends', points: 2142, wins: 14, losses: 8 },
      { type: 'player', name: 'Astra', game: 'Valorant', points: 990, wins: 42, losses: 17 },
      { type: 'player', name: 'Hexa', game: 'CS2', points: 955, wins: 39, losses: 19 },
      { type: 'player', name: 'Rift', game: 'League of Legends', points: 940, wins: 37, losses: 18 },
      { type: 'player', name: 'Kron', game: 'Dota 2', points: 901, wins: 33, losses: 21 },
      { type: 'player', name: 'Nyx', game: 'Apex Legends', points: 876, wins: 31, losses: 20 }
    ]);
  }

  const matchCount = await Match.countDocuments();
  if (matchCount === 0) {
    const tournaments = await Tournament.find().limit(4);

    if (tournaments.length >= 3) {
      await Match.insertMany([
        {
          tournament: tournaments[0]._id,
          game: tournaments[0].game,
          teamA: 'Phantom Reapers',
          teamB: 'Arc Wolves',
          scheduledAt: addDays(now, 1),
          status: 'Upcoming'
        },
        {
          tournament: tournaments[1]._id,
          game: tournaments[1].game,
          teamA: 'Nova Titans',
          teamB: 'Stormbreak',
          scheduledAt: addDays(now, 0),
          status: 'Live'
        },
        {
          tournament: tournaments[2]._id,
          game: tournaments[2].game,
          teamA: 'Pulse Syndicate',
          teamB: 'Night Havoc',
          scheduledAt: addDays(now, 3),
          status: 'Upcoming'
        }
      ]);
    }
  }
};

const run = async () => {
  try {
    await connectDB();
    await seedData();
    console.log('Seed completed.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = { seedData };
