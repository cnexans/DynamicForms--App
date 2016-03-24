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