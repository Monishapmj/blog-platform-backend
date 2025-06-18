const { body } = require('express-validator');

const userValidation = {
  register: [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .isAlphanumeric()
      .withMessage('Username must contain only letters and numbers'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Last name must be less than 50 characters')
  ],
  
  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .exists()
      .withMessage('Password is required')
  ]
};

const postValidation = {
  create: [
    body('title')
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('content')
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters long'),
    body('excerpt')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Excerpt must be less than 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be either draft or published')
  ],
  
  update: [
    body('title')
      .optional()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('content')
      .optional()
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters long'),
    body('excerpt')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Excerpt must be less than 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived')
  ]
};

const commentValidation = {
  create: [
    body('content')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters'),
    body('postId')
      .isInt()
      .withMessage('Post ID must be a valid integer'),
    body('parentId')
      .optional()
      .isInt()
      .withMessage('Parent ID must be a valid integer')
  ],
  
  update: [
    body('content')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters')
  ]
};

module.exports = {
  userValidation,
  postValidation,
  commentValidation
};