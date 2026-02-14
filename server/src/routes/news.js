const express = require('express');
const mongoose = require('mongoose');
const News = require('../models/News');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, featured, q } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ];
    }

    const articles = await News.find(filter).sort({ publishedAt: -1 });
    const categories = await News.distinct('category');

    return res.json({ articles, categories: categories.sort() });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load news' });
  }
});

router.get('/:idOrSlug', async (req, res) => {
  try {
    const key = req.params.idOrSlug;
    const filter = mongoose.Types.ObjectId.isValid(key)
      ? { _id: key }
      : { slug: key };

    const article = await News.findOne(filter);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    return res.json({ article });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load article' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ refType: 'news', refId: req.params.id })
      .populate('user', 'name avatar gamerTag')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comment = await Comment.create({
      user: req.user._id,
      refType: 'news',
      refId: article._id,
      content: content.trim()
    });

    await comment.populate('user', 'name avatar gamerTag');

    return res.status(201).json({ comment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to post comment' });
  }
});

module.exports = router;
