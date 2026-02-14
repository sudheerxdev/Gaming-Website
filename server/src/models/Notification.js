const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    kind: {
      type: String,
      enum: ['system', 'registration', 'email', 'match', 'news'],
      default: 'system'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
