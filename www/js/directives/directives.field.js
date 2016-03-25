directives.directive('field', function() {
	return {
		restrict    : 'E',
		scope       : {
			data : '='
		},
		templateUrl : 'templates/directives/field.html',
		controller  : function($scope, $ionicPopup) {
			$scope.showHelp = function(text) {
				$ionicPopup.alert({
					title: 'Texto de ayuda',
					template: text
				});
			}
		}
	}
});