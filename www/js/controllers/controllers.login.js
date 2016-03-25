

controllers.controller('LoginCtrl', function($scope, $formsAPI, $ionicLoading, $state, $http)
{
	$scope.user = {
		username   : '',
		password   : ''
	};

	$scope.invalidForm = false;
	$scope.formMessage = '';

	$scope.proccedLogin = function()
	{
		var user = $scope.user;
		if ( (user.username == '') || (user.password == '') )
		{
			$scope.formMessage = 'Debe introducir sus credenciales.';
			$scope.invalidForm = true;
		}
		else
		{
			$ionicLoading.show({
				'template' : '<ion-spinner></ion-spinner>'
			});
			$scope.invalidForm = false;
			$formsAPI.getAccessToken(user.username, user.password).
			then(function (data) {
				$ionicLoading.hide();
				if ( typeof data.error === 'undefined' )
				{
					$state.go('app.home');
				}
				else
				{
					$scope.invalidForm = true;
					if (data.error == -1)
						$scope.formMessage = 'No hay conexion :(';
					else
						$scope.formMessage = 'Las credenciales son invalidas';
						
				}
			});
		}
	}

})