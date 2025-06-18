const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Post, User, Comment } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all published posts with pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1 }),
  query('tag').optional().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const tag = req.query.tag;

    let whereClause = { status: 'published' };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    if (tag) {
      whereClause.tags = { [Op.like]: `%${tag}%` };
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      status: 'success',
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { 
        id: req.params.id,
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName', 'bio']
        },
        {
          model: Comment,
          as: 'comments',
          where: { isApproved: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.increment('viewCount');

    res.json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, [
  body('title').isLength({ min: 5, max: 200 }),
  body('content').isLength({ min: 10 }),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, tags, status } = req.body;

    const postData = {
      title,
      content,
      excerpt,
      tags,
      status: status || 'draft',
      authorId: req.user.id
    };

    // Set publishedAt if status is published
    if (status === 'published') {
      postData.publishedAt = new Date();
    }

    const post = await Post.create(postData);

    // Fetch the created post with author details
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: { post: createdPost }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (Author only)
router.put('/:id', auth, [
  body('title').optional().isLength({ min: 5, max: 200 }),
  body('content').optional().isLength({ min: 10 }),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this post'
      });
    }

    const { title, content, excerpt, tags, status } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (tags) updateData.tags = tags;
    if (status) {
      updateData.status = status;
      // Set publishedAt if changing to published
      if (status === 'published' && post.status !== 'published') {
        updateData.publishedAt = new Date();
      }
    }

    await post.update(updateData);

    // Fetch updated post with author details
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this post'
      });
    }

    await post.destroy();

    res.json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { 
        authorId: req.params.userId,
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['publishedAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { posts }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;

