var app = angular.module('flapperNews', ['ui.router','ngSanitize']);

// Soundcloud html iframe generator 
SC.initialize({
  client_id: '16720d64caaca630cc641f9dca4910f7'
});


// tracks factory 

app.factory('tracks', ['$http', function($http){
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
      return $http.post('/tracks', track).success(function(data){
      o.tracks.push(data);
    });

    });
  };
  o.upvote = function(track) {
    return $http.put('/tracks/' + track._id + '/upvote')
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
    return $http.post('/tracks/' + id + '/comments', comment);
  };
  o.upvoteComment = function(track, comment) {
  return $http.put('/tracks/' + track._id + '/comments/'+ comment._id + '/upvote')
    .success(function(data){
      comment.upvotes += 1;
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

  $urlRouterProvider.otherwise('home');
}]);

// Homepage controller

app.controller('MainCtrl', [
'$scope',
'tracks',
'$sce',
function($scope, tracks, $sce){
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
function($scope, $stateParams, tracks, track, $sce){
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
