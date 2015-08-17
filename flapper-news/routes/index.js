var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
var Team = mongoose.model('Team');
var Match = mongoose.model('Match');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');


// GET route to get matches
router.get('/matches', function(req, res, next) {
  Match.find().populate('first_team').populate('second_team').exec(function(err, matches){
    if(err){ return next(err); }

    res.json(matches);
  });
});

// POST route to store matches and populate the db
router.post('/matches', function(req, res, next) {
  var match = new Match(req.body);

  match.save(function(err, match){
    if(err){ return next(err); }

    res.json(match);
  });
});

router.param('match', function(req, res, next, id) {
  var query = Match.findById(id).populate('first_team').populate('second_team').populate('posts');
  query.exec(function (err, match){
    if (err) { return next(err); }
    if (!match) { return next(new Error('can\'t find match')); }
    req.match = match;
    return next();
  });
});

router.get('/matches/:match', function(req, res, next) {
  res.json(req.match);
  next();
});

router.post('/matches/:match/posts', function(req, res, next) {
  var post = new Post(req.body);
  post.match = req.match;

  post.save(function(err, match){
    if(err){ return next(err); }

    req.match.posts.push(post);
    req.match.save(function(err, match) {
      if(err){ return next(err); }

      res.json(match);
    });
  });
  res.end();
});


// GET route to get teams
router.get('/teams', function(req, res, next) {
  Team.find(function(err, teams){
    if(err){ return next(err); }
    res.json(teams);
  });
});

// POST route to store matches and populate the db
router.post('/teams', function(req, res, next) {
  var team = new Team(req.body);

  team.save(function(err, team){
    if(err){ return next(err); }

    res.json(team);
  });
});

// GET route to get posts
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

// POST route to store posts and populate the db
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});


router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }
    req.post = post;
    return next();
  });
});

router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});


router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
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

router.get('/posts/:post/comments/:comment', function(req, res) {
  res.json(req.comment);
});

router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

