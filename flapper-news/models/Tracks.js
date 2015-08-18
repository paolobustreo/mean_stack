var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
  title: String,
  artist: String,
  label: String,
  soundcloud: String,
  upvotes: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

TrackSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

mongoose.model('Track', TrackSchema);
