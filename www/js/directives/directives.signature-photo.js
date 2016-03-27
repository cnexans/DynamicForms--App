directives.directive('signaturePhoto', [ '$ionicModal', function() {
		
	return {
		/* Only use as <SignaturePad> tag */
		restrict: 'E',

		scope       : {
			data : '='
		},

		/* Our template */
		templateUrl: 'templates/directives/signature-photo.html',

		controller: function($scope, $ionicModal, $cordovaCamera, $ionicPopup)
		{
			var canvasPad, signaturePad, canvasWrapper;
			$scope.parentsignature = '';

			$ionicModal.fromTemplateUrl('templates/directives/signature-photo-modal.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function (modal)
			{
				$scope.modal = modal;
			});

			$scope.captureAndDraw = function()
			{
				var options = {
					quality            : 80,
					destinationType    : Camera.DestinationType.DATA_URL,
					sourceType         : Camera.PictureSourceType.CAMERA,
					allowEdit          : true,
					encodingType       : Camera.EncodingType.JPEG,
					targetWidth        : 400,
					targetHeight       : 400,
					saveToPhotoAlbum   : false
				};

				$cordovaCamera.getPicture(options).then(function(data) {
					$scope.openSignPad("data:image/jpeg;base64," + data);
				}, function(err) {
					console.log(err);
					$ionicPopup.alert({
						title: 'Error',
						template: 'Hubo un error en la captura de la imagen.'
					});
				});
			}

			$scope.initializeSignature = function(imageObj)
			{
				
				$scope.signaturePad          = new SignaturePad($scope.canvasPad);
				//$scope.signaturePad.fromDataURL(photo);
				$scope.signaturePad.minWidth = 1;
				$scope.signaturePad.maxWidth = 1.5;
				$scope.signaturePad.dotSize  = 3;
				$scope.signaturePad.penColor = "rgb(66, 133, 244)";
				$scope.resizeCanvas(); // To re size the canvas according to the mobile devices
				var width  = $scope.canvasPad.width;
				var height = $scope.canvasPad.height;
				$scope.canvasPad.getContext("2d").drawImage(imageObj, 0, 0, width, height);
			}

			$scope.openSignPad = function(photo) {

				$scope.modal.show();
				$scope.canvasPad     = document.getElementById("signature-pad");
				$scope.canvasWrapper = document.getElementById("signature-pad-wrapper");

				var imageObj        = new Image();
				imageObj.src        = photo;
				imageObj.onload     = function () {
					$scope.initializeSignature(imageObj);
				};
			};
			$scope.closeModal = function() {
				$scope.modal.hide();
			};
			//Cleanup the modal when we're done with it!
			$scope.$on('$destroy', function() {
				$scope.modal.remove();
			});
			// Execute action on hide modal
			$scope.$on('modal.hidden', function() {
				// Execute action
			});
			// Execute action on remove modal
			$scope.$on('modal.removed', function() {
				// Execute action
			});

			$scope.savePSign = function() {
				$scope.data.value = $scope.signaturePad.toDataURL();             
				$scope.closeModal();
			};
			$scope.clearPSign = function() {
				$scope.signaturePad.clear();
			};

			$scope.resizeCanvas= function() {
				ratio = 1.0;
				$scope.canvasPad.width  = $scope.canvasWrapper.clientWidth * ratio;
				$scope.canvasPad.height = $scope.canvasWrapper.clientWidth * ratio;
				$scope.canvasPad.getContext("2d").scale(ratio, ratio);
			};

		}
	}
}]);