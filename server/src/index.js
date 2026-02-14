require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { seedData } = require('./utils/seed');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tournamentRoutes = require('./routes/tournaments');
const newsRoutes = require('./routes/news');
const leaderboardRoutes = require('./routes/leaderboard');
const dashboardRoutes = require('./routes/dashboard');
const feedbackRoutes = require('./routes/feedback');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const matchRoutes = require('./routes/matches');
const publicRoutes = require('./routes/public');

const app = express();

const origins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : '*'
  })
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/public', publicRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const start = async () => {
  try {
    await connectDB();

    if ((process.env.AUTO_SEED || 'true').toLowerCase() === 'true') {
      await seedData();
    }

    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
};

start();
