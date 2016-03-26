var directives = angular.module('starter.directives', []);
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
directives.directive('field', function() {
	return {
		restrict    : 'E',
		scope       : {
			data : '='
		},
		templateUrl : 'templates/directives/field.html',
		controller  : function($scope, $ionicPopup, $ionicPlatform, $cordovaGeolocation) {
			$scope.showHelp = function(text) {
				$ionicPopup.alert({
					title: 'Texto de ayuda',
					template: text
				});
			}

		}
	}
});
directives.directive('qrScanner', function() {
	return {
		restrict    : 'E',
		scope       : {
			data : '='
		},
		templateUrl : 'templates/directives/qr-scanner.html',
		controller  : function($scope, $ionicPopup, $ionicPlatform, $cordovaBarcodeScanner) {
			$scope.codeScanned = false;

			$scope.scanCode = function()
			{
				$cordovaBarcodeScanner.scan()
				.then(function(barcodeData) {
					// Success! Barcode data is here
					$scope.data.value = barcodeData.text;
					$scope.codeScanned = false;
					console.log(barcodeData);
				}, function(error) {
					$ionicPopup.alert({
						title: 'Error',
						template: 'Hubo un error en la lectura del codigo.'
					});
					console.log(error);
				});
			}

		}
	}
});
directives.directive('takePhoto', function() {
	return {
		restrict    : 'E',
		scope       : {
			data : '='
		},
		templateUrl : 'templates/directives/take-photo.html',
		controller  : function($scope, $ionicPopup, $ionicPlatform, $cordovaCamera) {

			console.log('Desde la directiva take-photo');
			$scope.data.value = '';
			$scope.takePhoto = function()
			{
				console.log('Hizo click en el boton')
			    var options = {
			    	quality            : 50,
			    	destinationType    : Camera.DestinationType.FILE_URI,
			    	sourceType         : Camera.PictureSourceType.CAMERA,
			    	allowEdit          : true,
			    	encodingType       : Camera.EncodingType.JPEG,
			    	targetWidth        : 400,
			    	targetHeight       : 400,
			    	saveToPhotoAlbum   : false
			    };

			    $cordovaCamera.getPicture(options).then(function(fileUri) {
			    	console.log(fileUri);
			    	$scope.data.value = fileUri;
			    }, function(err) {
			    	console.log(err);
					$ionicPopup.alert({
						title: 'Error',
						template: 'Hubo un error en la captura de la imagen.'
					});
			    });
			}

		}
	}
});