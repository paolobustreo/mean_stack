var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var Track = mongoose.model('Track');
var Comment = mongoose.model('Comment');


// GET route to get tracks
router.get('/tracks', function(req, res, next) {
  Track.find(function(err, tracks){
    if(err){ return next(err); }

    res.json(tracks);
  });
});

// POST route to store posts and populate the db
router.post('/tracks', function(req, res, next) {
  var track = new Track(req.body);

  track.save(function(err, track){
    if(err){ return next(err); }

    res.json(track);
  });
});


router.param('track', function(req, res, next, id) {
  var query = Track.findById(id);

  query.exec(function (err, track){
    if (err) { return next(err); }
    if (!track) { return next(new Error('can\'t find track')); }
    req.track = track;
    return next();
  });
});

router.get('/tracks/:track', function(req, res, next) {
  req.track.populate('comments', function(err, track) {
    if (err) { return next(err); }

    res.json(track);
  });
});

router.put('/tracks/:track/upvote', function(req, res, next) {
  req.track.upvote(function(err, track){
    if (err) { return next(err); }

    res.json(track);
  });
});


router.post('/tracks/:track/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.track = req.track;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.track.comments.push(comment);
    req.track.save(function(err, track) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }
    req.comment = comment;
    return next();
  });
});

router.get('/tracks/:track/comments/:comment', function(req, res) {
  res.json(req.comment);
});

router.put('/tracks/:track/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});
