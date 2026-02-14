const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['player', 'team'], required: true },
    name: { type: String, required: true },
    game: { type: String, required: true },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
