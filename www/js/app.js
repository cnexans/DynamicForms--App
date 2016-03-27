// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $auth, $formsAPI, $connection) {
	$ionicPlatform.ready(function() {


		$connection.boot();

		document.addEventListener("offline", function () {
			$connection.noInternet();
		}, false);


		document.addEventListener("online", function () {
			$connection.hasInternet();
		}, false);




	});
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {

	$ionicConfigProvider.scrolling.jsScrolling(false);
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

	$stateProvider

	.state('app', {
	url: '/app',
	abstract: true,
	templateUrl: 'templates/menu.html',
	controller: 'AppCtrl',
		onEnter: function($state, $auth, $formsAPI) {
				$formsAPI.boot();
				$auth.boot().then(function () {
					if( !$auth.isLogged() ) {
						$state.go('login');
					}
				});
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
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl'
			}
		}
	})

	.state('app.answer', {
	url: '/answer/:formId',
		views: {
			'menuContent': {
				templateUrl: 'templates/answer.html',
				controller: 'AnswerCtrl'
			}
		}
	})

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
});
