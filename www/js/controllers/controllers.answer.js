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

	$scope.sendAnswer = function()
	{
		console.log($scope.fields);
	}

});