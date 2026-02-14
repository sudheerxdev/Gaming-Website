const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    game: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    bannerImage: { type: String, required: true },
    prizePool: { type: Number, default: 0 },
    entryFee: { type: Number, default: 0 },
    maxTeams: { type: Number, default: 32 },
    teamsRegistered: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
