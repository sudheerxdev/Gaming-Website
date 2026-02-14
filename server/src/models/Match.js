const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    game: { type: String, required: true },
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Live', 'Completed'],
      default: 'Upcoming'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
