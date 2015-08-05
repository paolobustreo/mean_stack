var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
  name: String,
});

mongoose.model('Team', TeamSchema);