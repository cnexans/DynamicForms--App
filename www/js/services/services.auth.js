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