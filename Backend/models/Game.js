const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  id : {type : Number, required : true}
},{collection : 'game_details'});

const Game = mongoose.model("Game", GameSchema);
module.exports = Game