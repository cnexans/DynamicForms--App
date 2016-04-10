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