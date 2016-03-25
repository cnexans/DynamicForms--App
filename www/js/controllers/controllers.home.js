controllers.controller('HomeCtrl', function($scope, $formsAPI, $localStorage, $connection, $auth, $ionicLoading, $q)
{
	$scope.forms = [];
	$scope.stateInfo = '';

	$scope.forms = $localStorage.getForms();

	if ( $scope.forms.length == 0 )
		$scope.stateInfo = 'No se habian guardado formularios con anterioridad.';


	function loadFromServer()
	{
		$auth.isReady().then(function (e) {
			$ionicLoading.show({
				'template' : '<ion-spinner></ion-spinner>'
			});
			$formsAPI.myForms().then(function (data) {
				
				console.log('Se ha hecho la peticion de mis formularios');
				console.log(data)
				if ( typeof data.error === 'undefined' )
				{
					console.log('Se ha cargado la lista de formularios desde el servidor: ');
					console.log(data);
					$scope.forms = data;
					$scope.stateInfo = '';
					$localStorage.saveForms(data);

					var promises = [];
					angular.forEach($scope.forms, function(value, i) {
						promises.push($formsAPI.myFormStructure(value.id));
					});


					$q.all(promises).then(function (values) {
						$localStorage.saveFormStructure(values);
						console.log('Se ha guardado la estructura de formulario');
						console.log(values);
						$ionicLoading.hide();
					});

				}

			});
		});
	}

	$scope.updateDataFromServer = function()
	{
		$connection.connectionState().then(function (data) {
			console.log(data);
			if ( typeof data.error === 'undefined' )
				loadFromServer();
			else
				$scope.stateInfo = 'No hay conexion a internet';
		});
	}


});