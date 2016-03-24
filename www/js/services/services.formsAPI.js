services.service("$formsAPI", function($http, $q, $auth) {

	var _this = this;

	this.baseURL = 'http://192.168.254.3';
	this.token = null;

	

	this.fieldTypeNames = {
		"STRING"       : 'Campo de texto corto, menos de 255 caracteres.',
        "TEXT"         : 'Campo de texto largo.',
        "PHOTO"        : 'Foto',
        "CANVAS_PHOTO" : 'Foto con dibujo o firma',
        "NUMBER"       : 'Campo numerico',
        "RATING"       : 'Rating',
        "OPTION"       : 'Seleccion de opciones',
        "QR_CODE"      : 'Lectura de codigo QR',
        "LOCATION"     : 'Posicion de GPS',
        "DATE"         : 'Campo de fecha'
	}


	this.boot = function()
	{
		var _this = this;

		$auth.setBaseURL(_this.baseURL);
	}


	this.editMyProfile = function(object)
	{
		var _this = this;
		var deferred = $q.defer();

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


	this.formsOfUser = function(id)
	{
		var _this = this;
		var deferred = $q.defer();

		$http({
			method : 'POST',
			url    : _this.baseURL + '/user/forms?access_token=' + $auth.getToken(),
			data   : {
				'requested_user_id' : id
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

		return deferred.promise;
	}


	this.myProfile = function()
	{
		var _this = this;
		var deferred = $q.defer();

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
		return $auth.getAccessToken(username, password);
	}



});