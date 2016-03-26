var directives = angular.module('starter.directives', []);
directives.directive('field', function() {
	return {
		restrict    : 'E',
		scope       : {
			data : '='
		},
		templateUrl : 'templates/directives/field.html',
		controller  : function($scope, $ionicPopup, $ionicPlatform, $cordovaGeolocation) {
			

			console.log('Desde la directiva field')

			// Initializations
			$scope.loadingGeolocation = false;

			$scope.showHelp = function(text) {
				$ionicPopup.alert({
					title: 'Texto de ayuda',
					template: text
				});
			}

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
				
			}

			$ionicPlatform.ready(function() {
				$scope.getLocation();
			});



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
			    	console.log(err)
			    });
			}

		}
	}
});