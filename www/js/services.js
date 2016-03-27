var services = angular.module('starter.services', []);
services.service("$auth", function($http, $q, $state, $localStorage, $connection) {

	this.tokenTime    = null;
	this.lastToken    = null;
	this.token        = null;
	this.clientId     = 'testclient';
	this.clientSecret = 'testpass';

	this.userLevel = null;
	this.password  = null;
	this.baseURL   = null;
	this.ready     = $q.defer();

	this.isReady = function()
	{
		var _this = this;

		return _this.ready.promise;
	}

	this.boot = function()
	{
		var _this    = this; 
		var deferred = $q.defer();


		var user = $localStorage.getUserData();

		console.log('Cargando datos desde local storage');
		console.log(user);

		if ( (typeof user.username === 'undefined') || (typeof user.password === 'undefined') )
		{
			deferred.resolve({
				error   : -2,
				message : 'No hay usuario en el dispositivo'
			});
		}
		else
		{
			_this.setUser(user);
			$connection.connectionState().then(function (data) {
				if ( data.error != 'undefined' )
					_this.getAccessToken(user.username, user.password).then(function(data) {
						deferred.resolve(user);
					});
			});

		}

		this.ready.resolve(true);
		return deferred.promise;
	}

	this.setUser = function(user)
	{
		var _this = this;


		_this.username = user.username;
		_this.password = user.password;
	}

	this.updateTokenIfNeeded = function()
	{
		var _this = this;
		var deferred = $q.defer();

		if (_this.isLogged())
			deferred.resolve(_this.token);

		else if ( (_this.username != null && _this.password != null) && !_this.isLogged())
			_this.getAccessToken(_this.username, _this.password).then(function(token) {
				deferred.resolve(token)
			});

		else
			deferred.resolve(false);

		return deferred.promise;
	}

	this.setBaseURL = function(string)
	{
		this.baseURL = string;
	}

	this.isLogged = function()
	{
		var _this = this;
		var _conn = false;

		(function () {
			return $connection.connectionState().then(function (data) {
				if ( data.error != 'undefined' )
					return _conn = false;
				else
					return (_conn = true)
			});
		})();

		if ( !_conn && _this.username != null && _this.password != null )
			return true;


		if ( (_this.lastToken === null) || (_this.tokenTime === null) )
			return false;

		var rt = (new Date()).getTime()/1000 - (_this.lastToken) < (_this.tokenTime);

		return rt;

	}


	this.getAccessToken = function(username, password)
	{
		var _this = this;
		var deferred = $q.defer();

		if ( _this.isLogged() )
			deferred.resolve( _this.token );


		console.log('Estatus de la conexion en el boot de auth');
		console.log($connection.hookConnection());
		console.log('Valor de la respuesta posible')
		console.log($connection.connectionState());
		if ( !$connection.hookConnection() )
		{
			return $connection.connectionState()
		}

		$http({
			method : 'POST',
			url    : _this.baseURL + '/oauth/token',
			data   : {
				'grant_type'    : 'password',
				'username'      : username,
				'password'      : password,
				'client_id'     : _this.clientId,
				'client_secret' : _this.clientSecret
			}
		}).then(
		// Success
		function (response)
		{

			console.log (response);

			_this.token     = response.data.access_token;
			_this.tokenTime = response.data.expires_in;
			_this.lastToken = (new Date()).getTime()/1000;

			_this.userName = username;
			_this.password = password;
			

			$localStorage.setUserData({
				'username' : username,
				'password' : password
			});

			_this.setUser({
				'username' : username,
				'password' : password
			});

			deferred.resolve( _this.token );
		},
		// Error
		function (error)
		{
			console.log(error);

			if ( (typeof error.data != 'undefined') && error.data != null )
				deferred.resolve({
					'error'   : true,
					'message' : error.data.error_description
				});
			else
				deferred.resolve(error);
		});

		return deferred.promise;
	}

	this.getToken = function()
	{
		var _this = this;
		return _this.token;
	}

});
services.service("$connection", function($http, $q, $state, $interval) {

	this.hasConnection = -1;

	this.setConnection = function(r)
	{
		var _this = this;
		_this.hasConnection = r;
	}

	this.noInternet = function()
	{
		this.setConnection(false);
		console.log('Se ha detectado desconexion')
	}

	this.hasInternet = function()
	{
		this.setConnection(true);
		console.log('Se ha detectado conexion')
	}

	this.boot = function ()
	{
		var _this = this;

		console.log('Conexion hizo boot');
		$interval(function() {
			_this.setConnection(navigator.connection.type != "none");
		}, 1000);
	}

	this.checkConnection = function()
	{
		var _this = this;
		var deferred = $q.defer();

		if ( _this.hasConnection == -1 )
			$interval(function() {
				deferred.resolve(_this.hasConnection);
			}, 3000);

		else
			deferred.resolve(_this.hasConnection);

		return deferred.promise;


	}

	this.connectionState = function()
	{

		var _this    = this;
		var deferred = $q.defer();
		

		_this.checkConnection().then(function (data) {
			if ( !data || data == -1)
				deferred.resolve({
					error   : -1,
					message : 'No hay conexion disponible'
				});

			else
				deferred.resolve({
					success : true
				});
		});


		return deferred.promise;


	}

	this.hookConnection = function ()
	{
		var _this = this;
		var _value;

		(function () {
			_this.connectionState().then(function (data) {
				_value = data;
			});
		})();

		return _this.hasConnection;
	}


});
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
services.service("$localStorage", function($http, $q, $state) {

	/*===============================================
	=            Local Storage Interface            =
	===============================================*/


	/**
	 *
	 * Localstorage set
	 * @param index
	 * @param value
	 * @param json optional - default true
	 */

	this.set = function(index, value, json)
	{
		if (typeof json === 'undefined') { json = true; }


		if (json)
			window.localStorage.setItem(index, JSON.stringify(value));

		else
			window.localStorage.setItem(index, value);

		return value;
	}


	/**
	 *
	 * Localstorage get
	 * @param index
	 * @param json optional - default true
	 */
	this.get = function (index, json)
	{

		if (typeof json === 'undefined') { json = true; }

		if (json)
			return JSON.parse( window.localStorage.getItem(index) );

		else
			return window.localStorage.getItem(index);
	}

	/*=====  End of Local Storage Interface  ======*/

	this.resetIndex = function(index)
	{
		var _this = this;


		_this.set(index, []);

		return [];
	}


	this.getUserData = function()
	{
		var _this = this;
		var user = _this.get('userData');

		if ( user == null || user == '' || (typeof user === 'undefined') )
			return _this.setUserData({})

		return user;
	}

	this.setUserData = function(data)
	{
		var _this = this;

		_this.set('userData', data);


		return data;
	}


	this.getForms = function()
	{

		var _this = this;
		var forms = _this.get('userForms');

		if ( forms == null || forms == '' || (typeof forms === 'undefined') )
			return _this.resetIndex('userForms');

		return forms;

	}

	this.saveForms = function(formsObj)
	{

		var _this = this;

		return _this.set('userForms', formsObj);

	}


	this.saveFormStructure = function(data)
	{
		var _this = this;

		return _this.set('formStructure', data);
	}

	this.getFormStructures = function()
	{
		var _this = this;
		var forms = _this.get('formStructure');

		if ( forms == null || forms == '' || (typeof forms === 'undefined') )
			return _this.resetIndex('formStructure');

		return forms;
	}

	this.registerAnswer = function (dataAnswer)
	{
		var _this = this;
		var answers = _this.get('formAnswers');

		if ( answers == null || answers == '' || (typeof answers === 'undefined') )
		{
			answers = _this.resetIndex('formAnswers');
		}

		answers.push(dataAnswer);
		_this.set('formAnswers', answers);
	}

	this.getAllAnswers = function()
	{
		var _this = this;
		var answers = _this.get('formAnswers');

		if ( answers == null || answers == '' || (typeof answers === 'undefined') )
		{
			answers = _this.resetIndex('formAnswers');
		}

		return answers;
	}

	this.resetAnswers = function()
	{
		var _this = this;
		return _this.resetIndex('formAnswers');
	}

});