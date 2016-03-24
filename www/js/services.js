var services = angular.module('starter.services', []);
services.service("$auth", function($http, $q, $state, $localStorage) {

	this.tokenTime    = null;
	this.lastToken    = null;
	this.token        = null;
	this.clientId     = 'testclient';
	this.clientSecret = 'testpass';

	this.userLevel    = null;
	this.password     = null;


	this.baseURL = null;

	this.boot = function()
	{
		var _this = this;


		var user = $localStorage.getUserData();
		if ( user === null || user === '' || (typeof user === 'undefined') )
			return;

		_this.setUser( user );

		(function(username, password) {
			_this.getAccessToken(username, password).then(function(data) {
				if ( typeof data.error === 'undefined' )
					$localStorage.set('lastLogin', (new Date()).getTime(), false);
			});
		})(user.username, user.password);
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

		if (_this.isLogged())
			return _this.token;

		if ( (_this.username != null && _this.password != null) && !_this.isLogged())
			return (function()
			{
				return _this.getAccessToken(_this.username, _this.password).then(function(response) {
					_this.token     = response.data.access_token;
					_this.tokenTime = response.data.expires_in;
					_this.lastToken = (new Date()).getTime()*1000;

					return _this.token;
				});
			})();

		return;
	}

	this.setBaseURL = function(string)
	{
		this.baseURL = string;
	}

	this.isLogged = function()
	{
		var _this = this;

		if ( (_this.lastToken === null) || (_this.tokenTime === null) )
			return false;

		var rt = (new Date()).getTime() - (_this.lastToken) < (_this.tokenTime);

		return rt;

	}


	this.getAccessToken = function(username, password)
	{
		var _this = this;
		var deferred = $q.defer();

		if ( _this.isLogged() )
			deferred.resolve( _this.token );

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
			_this.token     = response.data.access_token;
			_this.tokenTime = response.data.expires_in;
			_this.lastToken = (new Date()).getTime()*1000;

			_this.userName = username;
			_this.password = password;
			

			$localStorage.setUserData({
				'username' : username,
				'password' : password
			});

			//$formsApi.setToken( _this.token );

			deferred.resolve( _this.token );
		},
		// Error
		function (error)
		{
			deferred.resolve({
				'error'   : true,
				'message' : error.data.error_description
			})
		});

		return deferred.promise;
	}

	this.getToken = function()
	{
		var _this = this;

		return _this.updateTokenIfNeeded();
	}

});
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


	this.getUserData = function()
	{
		return JSON.parse( window.localStorage.getItem('userdata') );
	}

	this.setUserData = function(data)
	{
		this.set('userdata', data);
	}

});