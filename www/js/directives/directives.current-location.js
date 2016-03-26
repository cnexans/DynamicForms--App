directives.directive('currentLocation', function() {
	return {
		restrict    : 'E',
		scope       : {
			data : '='
		},
		templateUrl : 'templates/directives/current-location.html',
		controller  : function($scope, $ionicPopup, $ionicPlatform, $cordovaGeolocation) {

			// Inicializacion
			$scope.loadingGeolocation = false;

			// Funcion para obtener la posicion actual
			$scope.getLocation = function()
			{
				console.log('Hizo click en el boton')
				
				$scope.loadingGeolocation = true;
				var options = {
					frequency : 15 * 60 * 1000,
					timeout   : 1 * 60 * 1000,
					maximumAge: 5000,
					enableHighAccuracy: true
				};
				$cordovaGeolocation.getCurrentPosition(options)
				// Success
				.then(function (position) {
					$scope.data.lat  = position.coords.latitude;
					$scope.data.lng  = position.coords.longitude;
					$scope.loadingGeolocation = false;
				// Error
				}, function(err) {
					console.log(err);
					$scope.loadingGeolocation = false;
					$ionicPopup.alert({
						title: 'Error',
						template: 'El sistema operativo ha bloqueado el uso de GPS. Estatus ' + erro.code
					});
				});
				
			}

			// Al entrar...
			$ionicPlatform.ready(function() {
				$scope.getLocation();
			});

		}
	}
});