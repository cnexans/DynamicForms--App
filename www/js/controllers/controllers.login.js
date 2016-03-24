

controllers.controller('LoginCtrl', function($scope, $formsAPI, $ionicLoading, $state)
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
				'template' : 'Cargando...'
			});
			$scope.invalidForm = false;
			$formsAPI.getAccessToken(user.username, user.password).
			then(function (data) {
				$ionicLoading.hide();
				if ( typeof data.error === 'undefined' )
					$state.go('app.home');
				else
					(function () {
						$scope.formMessage = 'Las credenciales introducidas son invalidas.';
						$scope.invalidForm = true;
					})();
			});
		}
	}

})