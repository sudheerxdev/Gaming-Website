const express = require('express');
const Feedback = require('../models/Feedback');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
      user: req.user ? req.user._id : null
    };

    await Feedback.create(payload);

    return res.status(201).json({ message: 'Feedback submitted. Thank you!' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

module.exports = router;
