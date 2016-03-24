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