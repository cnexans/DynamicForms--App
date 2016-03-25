var controllers = angular.module('starter.controllers', []);
controllers.controller('AnswerCtrl', 
function($scope, $formsAPI, $localStorage, $auth, $ionicLoading, $stateParams)
{
	$scope.stateInfo = '';
	$scope.formId = $stateParams.formId;

	var fields    = $localStorage.getFormStructures();
	$scope.fields = [];

	for (var i = 0; i < fields.length; i++)
		if ( fields[i].form_id == $scope.formId )
			break;

	angular.forEach(fields[i].structure, function(value) {
		var fieldObj = {
			//Id del field descriptor, lo necesitaremos para enviar la respuesta..!
			field_descriptor_id : value.id,

			type     : value.type,
			label    : value.label,
			question : value.question
		}
		if ( fieldObj.type == 'OPTION' )
			fieldObj.options = value.options;
		$scope.fields.push(fieldObj);
	});

});
controllers.controller('AppCtrl', function($scope) {
	// Controller general
})
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