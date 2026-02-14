const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/messages', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 100);

    const messages = await ChatMessage.find()
      .populate('user', 'name gamerTag avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({ messages: messages.reverse() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load chat messages' });
  }
});

router.post('/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const created = await ChatMessage.create({
      user: req.user._id,
      message: message.trim()
    });

    await created.populate('user', 'name gamerTag avatar');

    return res.status(201).json({ message: created });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;
