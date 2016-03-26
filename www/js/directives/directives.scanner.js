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