// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   points: {type : Number, default:0}
// },{collection : 'participant_details'});

// const User = mongoose.model("User", UserSchema);
// module.exports = User



const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 }
}, { collection: 'participant_details' });

// Optional: create indexes to enforce uniqueness at DB-level
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
