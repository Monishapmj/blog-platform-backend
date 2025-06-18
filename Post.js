const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 50000]
    }
  },
  excerpt: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? rawValue.split(',') : [];
    },
    set(value) {
      this.setDataValue('tags', Array.isArray(value) ? value.join(',') : value);
    }
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (post) => {
      if (!post.slug) {
        post.slug = post.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      if (!post.excerpt && post.content) {
        post.excerpt = post.content.substring(0, 200) + '...';
      }
    },
    beforeUpdate: (post) => {
      if (post.changed('title') && !post.changed('slug')) {
        post.slug = post.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      if (post.changed('content') && !post.excerpt) {
        post.excerpt = post.content.substring(0, 200) + '...';
      }
    }
  }
});

module.exports = Post;

