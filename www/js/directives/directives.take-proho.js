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