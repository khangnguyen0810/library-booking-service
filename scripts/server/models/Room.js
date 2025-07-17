const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  id:         Number,
  name:       String,
  capacity:   Number,
  features:   [String],
  available:  Boolean,
});

// Export it with the exact collection name (3rd arg ensures it)
module.exports = mongoose.model('libraryrooms', roomSchema, 'libraryrooms');