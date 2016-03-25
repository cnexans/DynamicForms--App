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