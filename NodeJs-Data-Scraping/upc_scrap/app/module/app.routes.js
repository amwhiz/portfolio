'use strict';

/*
* Application Routes
*/

// custom modules
var Controller = require('./app.controller');

module.exports = function(app) {
	app.route('/')
		.get(Controller.home);

	app.route('/search')
		.get(Controller.search);

	app.route('/template')
		.get(Controller.template);
};