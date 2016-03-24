// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $auth, $location, $formsAPI, $ionicPopup) {
  $ionicPlatform.ready(function() {
	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
	// for form inputs)
	//if (window.cordova && window.cordova.plugins.Keyboard) {
	  //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	  //cordova.plugins.Keyboard.disableScroll(true);

	//}
	//if (window.StatusBar) {
	  // org.apache.cordova.statusbar required
	  //StatusBar.styleDefault();
	//}

	$formsAPI.boot();
	$auth.boot();

  $ionicPopup.alert({
    title: 'Don\'t eat that!',
    template: 'It might taste good'
   });

	console.log('Hizo boot');

  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {


  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $stateProvider

	.state('app', {
	url: '/app',
	abstract: true,
	templateUrl: 'templates/menu.html',
	controller: 'AppCtrl',
    onEnter: function($state, $auth) {
        if(!$auth.isLogged()){
           $state.go('login');
        }
    }
  })


  .state('login', {
      url: "/login",
      templateUrl     : "templates/login.html",
      controller      : 'LoginCtrl'
    })

	.state('app.home', {
	url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html'//,
        //controller: 'LoginCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
