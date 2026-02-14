const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refType: { type: String, enum: ['tournament', 'news'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
