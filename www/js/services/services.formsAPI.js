services.service("$formsAPI", function($http, $q, $auth, $connection) {

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
        "LOCATION"     : 'Posicion de GPS',
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

		console.log ( $auth.getToken() );

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

		$http({
			method : 'POST',
			url    : _this.baseURL + '/user/me?access_token=' + $auth.getToken(),
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



});