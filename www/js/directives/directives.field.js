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

			if ( $scope.data.type != 'LOCATION' )
			{
				$scope.data.valid = function()
				{
					return $scope.data.value != '';
				}

				$scope.data.value = '';
			}

			if ( $scope.data.type == 'OPTION' )
			{
				$scope.data.value = $scope.data.options[0].id;
			}

		}
	}
});