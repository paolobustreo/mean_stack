var app = angular.module('flapperNews', ['ui.router'])

// Posts factory 

app.factory('posts', ['$http', function($http){
  var o = {posts: []};
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
      });
  };
  o.create = function(post) {
    return $http.post('/posts', post).success(function(data){
      o.posts.push(data);
    });
  };
  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote')
    .success(function(data){
      post.upvotes += 1;
    });
  };
  o.get = function(id) {
  return $http.get('/posts/' + id).then(function(res){
    return res.data;
    });
  };
  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment);
  };
  o.upvoteComment = function(post, comment) {
  return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
    .success(function(data){
      comment.upvotes += 1;
    });
  };
  return o;

}]);


// Matches factory 

app.factory('matches', ['$http', function($http){
  var o = {matches: []};
  o.getAll = function() {
    return $http.get('/matches').success(function(data){
      angular.copy(data, o.matches);
      });
  };
  o.create = function(match) {
    return $http.post('/matches', match).success(function(data){
      o.matches.push(data);
    });
  };
  o.get = function(id) {
  return $http.get('/matches/' + id).then(function(res){
    return res.data;
    });
  };

  return o;

}]);


// App configuration

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
    	url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
          postPromise: ['posts', function(posts){
            return posts.getAll();
          }]
      }
  });
    $stateProvider
    .state('matches', {
      url: '/matches',
      templateUrl: '/matches.html',
      controller: 'MatchesCtrl',
      resolve: {
          postPromise: ['matches', function(matches){
            return matches.getAll();
          }]
      }
  });
  $stateProvider
   	.state('posts', {
  		url: '/posts/{id}',
  		templateUrl: '/posts.html',
  		controller: 'PostsCtrl',
      resolve: {
        post: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id);
        }]
      }
  });

  $urlRouterProvider.otherwise('home');
}]);

// MainCtrl and PostCtrl

app.controller('MatchesCtrl', [
'$scope',
'matches',
function($scope, matches){
  $scope.matches = matches.matches;
}]);

app.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){
	$scope.posts = posts.posts;
  
  $scope.addPost = function(){
    if(!$scope.title || $scope.title === '') { return; }
    posts.create({
      title: $scope.title,
      link: $scope.link,
    });
    $scope.title = '';
    $scope.link = '';
  };
	
	$scope.incrementUpvotes = function(post) {
    posts.upvote(post);
  };
}]);

app.controller('PostsCtrl', [
'$scope',
'$stateParams',
'posts',
'post',
function($scope, $stateParams, posts, post){
	$scope.post = post;
	$scope.addComment = function(){
    if($scope.body === '') { return; }
      posts.addComment(post._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };
  $scope.incrementUpvotes = function(comment){
    posts.upvoteComment(post, comment);
  };
}]);