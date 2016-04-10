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