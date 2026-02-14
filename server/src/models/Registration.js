const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    teamName: { type: String, required: true, trim: true },
    players: [{ type: String, required: true }],
    status: { type: String, enum: ['Confirmed', 'Waitlisted'], default: 'Confirmed' }
  },
  { timestamps: true }
);

registrationSchema.index({ user: 1, tournament: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
