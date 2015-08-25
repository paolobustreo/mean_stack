var app = angular.module('flapperNews', ['ui.router','ngSanitize']);

// Soundcloud html iframe generator 
SC.initialize({
  client_id: '16720d64caaca630cc641f9dca4910f7'
});


// Tracks factory 

app.factory('tracks', ['$http', 'auth', function($http){
  var o = {tracks: []};
  o.getAll = function() {
    return $http.get('/tracks').success(function(data){
      angular.copy(data, o.tracks);
      });
  };
  o.create = function(track) {
    var track_url = track.soundcloud;
    SC.oEmbed(track_url, { auto_play: false, maxheight: 150 }, function(oEmbed) {
      track.soundcloud = oEmbed.html;
      return $http.post('/tracks', track, {headers: {Authorization: 'Bearer '+auth.getToken()}}).success(function(data){
      o.tracks.push(data);
    });

    });
  };
  o.upvote = function(track) {
    return $http.put('/tracks/' + track._id + '/upvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    })
    .success(function(data){
      track.upvotes += 1;
    });
  };
  o.get = function(id) {
  return $http.get('/tracks/' + id).then(function(res){
    return res.data;
    });
  };
  o.addComment = function(id, comment) {
    return $http.post('/tracks/' + id + '/comments', comment, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };
  o.upvoteComment = function(track, comment) {
  return $http.put('/tracks/' + track._id + '/comments/'+ comment._id + '/upvote', null, {
    headers: {Authorization: 'Bearer '+auth.getToken()}
  }).success(function(data){
    comment.upvotes += 1;
  });
  };
  return o;

}]);

// Authentication factory

app.factory('auth', ['$http', '$window', function($http, $window){
  var auth = {};
  auth.saveToken = function (token){
    $window.localStorage['hot-tracks-token'] = token;
  };
  
  auth.getToken = function (){
    return $window.localStorage['hot-tracks-token'];
  }
  
  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };
  
  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function(){
    $window.localStorage.removeItem('hot-tracks-token');
  };


  return auth;
}]);

// App configuration (Router)

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
    	url: '/home',
      templateUrl: 'views/home.html',
      controller: 'MainCtrl',
      resolve: {
          trackPromise: ['tracks', function(tracks){
            return tracks.getAll();
          }]
      }
  });
  $stateProvider
   	.state('tracks', {
  		url: '/tracks/{id}',
  		templateUrl: 'views/tracks.html',
  		controller: 'tracksCtrl',
      resolve: {
        track: ['$stateParams', 'tracks', function($stateParams, tracks) {
          return tracks.get($stateParams.id);
        }]
      }
  });
  $stateProvider.state('login', {
  url: '/login',
  templateUrl: 'views/login.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
      }
    }]
  });
   $stateProvider.state('register', {
  url: '/register',
  templateUrl: 'views/register.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
      }
    }]
  });

  $urlRouterProvider.otherwise('home');
}]);

// Homepage controller

app.controller('MainCtrl', [
'$scope',
'tracks',
'$sce',
'auth',
function($scope, tracks, $sce, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
	$scope.tracks = tracks.tracks;
  angular.forEach($scope.tracks,function(value,index){value.soundcloud = $sce.trustAsHtml((value.soundcloud));})
  $scope.addtrack = function(){
    if(!$scope.title || $scope.title === '') { return; }
    tracks.create({
      title: $scope.title,
      soundcloud: $scope.soundcloud,
      playing: false,
      artist: $scope.artist,
      label: $scope.label
    });
    $scope.title = '';
    $scope.soundcloud = '';
    $scope.artist = '';
    $scope.label = '';
  };
	
	$scope.incrementUpvotes = function(track) {
    tracks.upvote(track);
  };
}]);

app.controller('tracksCtrl', [
'$scope',
'$stateParams',
'tracks',
'track',
'$sce',
'auth',
function($scope, $stateParams, tracks, track, $sce, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  track.soundcloud = $sce.trustAsHtml(track.soundcloud);
	$scope.track = track;
	$scope.addComment = function(){
    if($scope.body === '') { return; }
      tracks.addComment(track._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.track.comments.push(comment);
    });
    $scope.body = '';
  };
  $scope.incrementUpvotes = function(comment){
    tracks.upvoteComment(track, comment);
  };
}]);


app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
