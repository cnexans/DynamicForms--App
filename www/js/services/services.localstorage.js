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

	this.resetUserData = function()
	{
		var _this = this;
		_this.set('userData', '{}');
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


	this.failedSync = function()
	{
		var _this = this;
		var answers = _this.get('failedSync');

		if ( answers == null || answers == '' || (typeof answers === 'undefined') )
		{
			answers = _this.resetIndex('failedSync');
		}

		return answers;
	}


	this.setFailedSync = function(failed)
	{
		return _this.set('failedSync', failed);
	}

});