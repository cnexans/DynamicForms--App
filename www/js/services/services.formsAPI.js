services.service("$formsAPI", function($http, $q, $auth, $connection, $cordovaFileTransfer) {

	var _this = this;

	this.baseURL = 'http://forms-api.cnexans.com';
	this.token = null;

	

	this.fieldTypeNames = {
		"STRING"       : 'Campo de texto corto, menos de 255 caracteres.', // ready
        "TEXT"         : 'Campo de texto largo.', //ready
        "PHOTO"        : 'Foto',
        "CANVAS_PHOTO" : 'Foto con dibujo o firma',
        "NUMBER"       : 'Campo numerico', //ready
        "RATING"       : 'Rating', //ready
        "OPTION"       : 'Seleccion de opciones', // ready
        "QR_CODE"      : 'Lectura de codigo QR',
        "LOCATION"     : 'Posicion de GPS', //ready
        "DATE"         : 'Campo de fecha' // ready
	}


	// las transacciones con el servidor devuelven error:-1 cuando no hay internet


	this.boot = function()
	{
		var _this = this;

		$auth.setBaseURL(_this.baseURL);
	}


	this.editMyProfile = function(object)
	{
		var _this = this;
		var deferred = $q.defer();

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}

		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$http({
				method : 'POST',
				url    : _this.baseURL + '/user/edit/me?access_token=' + $auth.getToken(),
				data   : object
			}).then(
			// Success
			function (response)
			{
				deferred.resolve(response.data);
			},
			// Failure
			function (error)
			{
				deferred.resolve(error.data);

			});
		});

		return deferred.promise;

	}


	this.myForms = function()
	{
		var _this = this;
		var deferred = $q.defer();

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState();
		}

		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$http({
				method : 'POST',
				url    : _this.baseURL + '/user/me/my-forms?access_token=' + $auth.getToken(),
			}).then(
			// Success
			function (response)
			{
				deferred.resolve(response.data);
			},
			// Failure
			function (error)
			{
				deferred.resolve(error.data);

			});
		});

		return deferred.promise;
	}

	this.myFormStructure = function(id)
	{
		var _this = this;
		var deferred = $q.defer();

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}

		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$http({
				method : 'POST',
				url    : _this.baseURL + '/user/me/my-form-structure?access_token=' + $auth.getToken(),
				data   : {
					'form_id' : id
				}
			}).then(
			// Success
			function (response)
			{
				deferred.resolve({
					'form_id'   : id,
					'structure' : response.data
				});
			},
			// Failure
			function (error)
			{
				deferred.resolve(error.data);

			});
		});

		return deferred.promise;
	}


	this.myProfile = function()
	{
		var _this = this;
		var deferred = $q.defer();

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}

		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$http({
				method : 'POST',
				url    : _this.baseURL + '/user/me?access_token=' + $auth.getToken()
			}).then(
			// Success
			function (response)
			{
				deferred.resolve(response.data);
			},
			// Failure
			function (error)
			{
				deferred.resolve(error.data);

			});
		});

		return deferred.promise;
	}


	this.currentUserInfo = function()
	{

		return $auth.userInfo();
	}

	this.isLogged = function()
	{
		return $auth.isLogged();
	}

	this.getAccessToken = function(username, password)
	{
		console.log('Que sucede con la conexion?');
		console.log($connection.hookConnection());

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState();
		}

		return $auth.getAccessToken(username, password);
	}


	this.uploadAnswer = function (answerData)
	{
		var _this    = this;
		var deferred = $q.defer();

		if ( answerData.type == 'LOCATION')
			return _this.uploadAnswerLocation(answerData);

		if ( answerData.type == 'PHOTO')
			return _this.uploadAnswerFile(answerData);

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}


		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$http({
				method : 'POST',
				url    : _this.baseURL + '/form/instance/register-answer?access_token=' + $auth.getToken(),
				data   : {
					'form_instance_id'    : answerData.form_instance_id,
					'field_descriptor_id' : answerData.field_descriptor_id,
					'value'               : answerData.value
				}
			}).then(
			// Success
			function (response)
			{
				deferred.resolve(response.data);
			},
			// Failure
			function (error)
			{
				deferred.resolve(error.data);
			});
		});


		return deferred.promise;
	}

	this.uploadAnswerFile = function(answerData)
	{
		var _this    = this;
		var deferred = $q.defer();

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}

		var options           = new FileUploadOptions();
		options.fileKey       = "value";
		options.fileName      = answerData.value.substr(answerData.value.lastIndexOf('/')+1);
		options.mimeType      = "image/jpeg";
		options.trustAllHosts = true;

		var params                 = new Object();
		params.field_descriptor_id = answerData.field_descriptor_id;
		params.form_instance_id    = answerData.form_instance_id;

		options.params      = params;
		options.chunkedMode = false;

		var server = _this.baseURL + '/form/instance/register-answer?access_token=' + $auth.getToken();

		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$cordovaFileTransfer.upload(server, answerData.value, options)
			.then(function(result) {
				console.log('Se subio correctamente el archivo :D');
				deferred.resolve(result.data);
			}, function(err) {
				console.log('Hubo un error al subir un archivo... :(');
				console.log(answerData);
				console.log(err);
				deferred.resolve(err);
			});
		});

		return deferred.promise;

	}

	this.uploadAnswerLocation = function(answerData)
	{
		var _this    = this;
		var deferred = $q.defer();
		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}

		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$http({
				method : 'POST',
				url    : _this.baseURL + '/form/instance/register-answer?access_token=' + $auth.getToken(),
				data   : {
					'form_instance_id'    : answerData.form_instance_id,
					'field_descriptor_id' : answerData.field_descriptor_id,
					'lat'                 : answerData.lat,
					'lng'                 : answerData.lng
				}
			}).then(
			// Success
			function (response)
			{
				deferred.resolve(response.data);
			},
			// Failure
			function (error)
			{
				deferred.resolve(error.data);
			});
		});

		return deferred.promise;
	}

	this.createFormInstance = function(formId)
	{
		var _this    = this;
		var deferred = $q.defer();

		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}

		$auth.updateTokenIfNeeded().then(function (currentToken) {
			$http({
				method : 'POST',
				url    : _this.baseURL + '/form/instance/create?access_token=' + $auth.getToken(),
				data   : {
					'form_id' : formId
				}
			}).then(
			// Success
			function (response)
			{
				deferred.resolve(response.data);
			},
			// Failure
			function (error)
			{
				deferred.resolve(error.data);
			});
		});

		return deferred.promise;
	}



});