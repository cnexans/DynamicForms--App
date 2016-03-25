directives.directive('field', function() {
	return {
		restrict    : 'E',
		scope       : {
			data : '='
		},
		templateUrl : 'templates/directives/field.html',
		controller  : function($scope, $ionicPopup, $ionicPlatform, $cordovaGeolocation) {
			

			// Initializations
			$scope.loadingGeolocation = false;

			$scope.showHelp = function(text) {
				$ionicPopup.alert({
					title: 'Texto de ayuda',
					template: text
				});
			}

			function getLocation()
			{
				$ionicPlatform.ready(function() {
					$scope.loadingGeolocation = true;
					var options = {
						frequency : 15 * 60 * 1000,
						timeout   : 1 * 60 * 1000,
						maximumAge: 5000,
						enableHighAccuracy: true
					};
					$cordovaGeolocation
					.getCurrentPosition(options)
					.then(function (position) {
						$scope.data.lat  = position.coords.latitude;
						$scope.data.lng  = position.coords.longitude;
						$scope.loadingGeolocation = false;
					}, function(err) {
						console.log(err);
						$scope.loadingGeolocation = false;
						$ionicPopup.alert({
							title: 'Error',
							template: 'El sistema ha bloqueado el uso de GPS. Estatus ' + erro.code
						});
					});
				});
			}



		}
	}
});