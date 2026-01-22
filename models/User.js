const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  major: {
    type: String,
    required: true,
    enum: ['Architecture', 'Civil', 'Mechanical', 'EC', 'EP', 'CEIT', 'MC', 'Petroleum', 'Chemical']
  },
  matched_major: {
    type: String,
    required: true
  },
  sticker: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
