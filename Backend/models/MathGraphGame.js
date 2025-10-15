// // models/MathCrosswordGame.js
// const mongoose = require('mongoose');

// const PrefillSchema = new mongoose.Schema(
//   { r: Number, c: Number, value: String },
//   { _id: false }
// );

// const MathCrosswordGameSchema = new mongoose.Schema({
//   gameId: { type: String, required: true, unique: true },
//   size: { type: Number, required: true },
//   puzzle: { type: [[String]], required: true },   // grid displayed (full characters)
//   solution: { type: [[String]], required: true }, // full solution
//   prefilled: { type: [PrefillSchema], default: [] },
//   topChars: { type: [String], default: [] },
//   freq: { type: mongoose.Schema.Types.Mixed, default: {} },
//   createdAt: { type: Date, default: Date.now, index: true },
// });

// // Configure TTL: default 24 hours. Set env GAMES_EXPIRE_AFTER_SECONDS=0 to disable TTL.
// const ttlSeconds = typeof process.env.GAMES_EXPIRE_AFTER_SECONDS !== 'undefined'
//   ? Number(process.env.GAMES_EXPIRE_AFTER_SECONDS)
//   : 60 * 60 * 24;

// if (ttlSeconds > 0) {
//   MathCrosswordGameSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds });
// } else {
//   MathCrosswordGameSchema.index({ createdAt: 1 });
// }

// module.exports = mongoose.model('MathCrosswordGame', MathCrosswordGameSchema);



// models/MathGraphGame.js
const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: Number,
  x: Number,
  y: Number
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  u: Number,
  v: Number
}, { _id: false });

const MathGraphGameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  nodes: { type: [NodeSchema], required: true },
  edges: { type: [EdgeSchema], required: true },
  solution: { type: mongoose.Schema.Types.Mixed, default: {} }, // server-side secret
  createdAt: { type: Date, default: Date.now, index: true }
});

// TTL same as your earlier model
const ttlSeconds = typeof process.env.GAMES_EXPIRE_AFTER_SECONDS !== 'undefined'
  ? Number(process.env.GAMES_EXPIRE_AFTER_SECONDS)
  : 60 * 60 * 24;

if (ttlSeconds > 0) {
  MathGraphGameSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlSeconds });
} else {
  MathGraphGameSchema.index({ createdAt: 1 });
}

module.exports = mongoose.model('MathGraphGame', MathGraphGameSchema);
