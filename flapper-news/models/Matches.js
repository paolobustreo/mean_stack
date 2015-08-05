var mongoose = require('mongoose');

var MatchSchema = new mongoose.Schema({
  first_team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  second_team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  date: { type: Date, default: Date.now }, 
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

mongoose.model('Match', MatchSchema);