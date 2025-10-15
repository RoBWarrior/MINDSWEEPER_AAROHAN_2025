// models/Game.js
const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  initialGrid: {
    type: [[Number]],
    required: true, // 3x3 numbers 0..2
  },
  solutionToggles: {
    type: [[Number]],
    required: true, // 3x3 numbers 0..2 (the toggles used to create puzzle)
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

// TTL index: expire documents 1 hour after createdAt
GameSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 });

module.exports = mongoose.model('Game', GameSchema);
