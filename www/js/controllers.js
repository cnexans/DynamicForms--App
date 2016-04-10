var controllers = angular.module('starter.controllers', []);
controllers.controller('AnswerCtrl', 
function($scope, $formsAPI, $localStorage, $auth, $ionicLoading, $stateParams, $q, $ionicPopup, $state)
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

	$scope.sendAnswer = function()
	{
		var validity = true;
		var promises = [];
		angular.forEach($scope.fields, function (field, k) {
			var deferred = $q.defer();
			validity = validity && field.valid();
			deferred.resolve({
				'id'    : k,
				'valid' : field.valid()
			});
			promises.push(deferred);
		});

		$q.all(promises).then(function (fieldValidities) {
			if ( !validity )
			{
				$ionicPopup.alert({
					title: 'Ups',
					template: 'Alguno de los campos esta vacio, no olvide responderlo!'
				});
			}
			else
			{
				$localStorage.registerAnswer({
					'form_id' : $scope.formId,
					'answers' : $scope.fields
				});
				$ionicPopup.alert({
					title: 'Correcto',
					template: 'Se han guardado los datos, puede enviar las respuestas mediante el menu principal.'
				}).then(function() {
					$state.go('app.home');
				});
			}
		})
	}

});
controllers.controller('AnsweredCtrl', function($scope, $localStorage)
{
	$scope.forms = [];
	$scope.stateInfo = '';

	var forms   = $localStorage.getForms();
	var answers = $localStorage.getAllAnswers();

	for (var i = 0; i < answers.length; i++)
	{
		var id     = answers[i].form_id;
		var exists = false;
		var name   = undefined;
		var index  = undefined;

		for (var j = 0; j < $scope.forms.length; j++) {
			if ( $scope.forms[j].id == id )
			{
				exists = true;
				index = j;
			}

		}

		for (var j = 0; j < forms.length; j++)
			if ( forms[j].id == id )
				name = forms[j].name;


		if ( !exists )
			$scope.forms.push({
				'id'     : id,
				'name'   : name,
				'number' : 1
			});
		else
			$scope.forms[index].number++;

	}
});
controllers.controller('AppCtrl',

function($scope, $localStorage, $formsAPI, $q, $ionicLoading, $auth, $ionicPopup, $state) {

	$scope.unorderedFields = [];

	//Ohstia me cago en la puta XD

	$scope.uploadAnswers = function()
	{
		var _answers = $localStorage.getAllAnswers();
		console.log('Se han cargado respuestas guardadas: ');
		console.log(_answers);

		if ( _answers.length > 0 )
		{
			$scope.loadingStatus = 0;
			$ionicLoading.show({
				'template' : '{{ loadingStatus }}%',
				'scope'    : $scope
			});

			$auth.isReady().then(function (status) {
				$scope.prepareFields(_answers).then(function (e) {
					$scope.prepareSync();
				});
			});
		}
	}

	$scope.prepareFields = function(_answers)
	{
		var counter = 0;
		var finish  = $q.defer();
		angular.forEach(_answers, function(answer) {
			counter += answer.answers.length;
			$formsAPI.createFormInstance(answer.form_id).then(function (data) {
				var instanceId = data.instance_id
				console.log(data)
				angular.forEach(answer.answers, function (fieldAnswer) {
					fieldAnswer.form_instance_id = instanceId;
					$scope.unorderedFields.push(fieldAnswer);

					if ( counter == $scope.unorderedFields.length )
						finish.resolve(true);
				});
			});
		});

		return finish.promise;
	}


	$scope.prepareSync = function () {
		console.log($scope.unorderedFields);
		$scope.fieldsCount  = $scope.unorderedFields.length;
		$scope.currentField = 0;
		$scope.executeSync();
	};

	$scope.executeSync = function()
	{
		$formsAPI.uploadAnswer($scope.unorderedFields[$scope.currentField]).then(function (data) {
			$scope.currentField++;
			console.log(data)

			$scope.loadingStatus = Math.round(($scope.currentField / $scope.fieldsCount)*100);
			if ( $scope.currentField < $scope.fieldsCount )
			{
				$scope.executeSync();
			}
			else
			{
				$ionicLoading.hide();
				$localStorage.resetAnswers();
			}
		});
	}


	$scope.logout = function()
	{

		$ionicPopup.confirm({
			title: 'Cerrar sesion',
			template: 'Si cierra sesion, se perderan las respuestas no enviadas. ¿Estas seguro?'
		}).then(function(res) {
			if( !res )
				return;

			$localStorage.resetUserData();
			$state.go('login');
		});
	}

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