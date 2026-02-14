const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    gamerTag: { type: String, default: '' },
    bio: { type: String, default: '' },
    favoriteTeams: [{ type: String }],
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/9.x/bottts/svg?seed=GameHub'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
