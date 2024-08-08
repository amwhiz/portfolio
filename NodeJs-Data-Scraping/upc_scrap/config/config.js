'use strict';

/*
* Application Configuration
*/

// NPM Modules
var _ = require('lodash');

// variabls
var config = _.extend(
		require('./env/all'),
		require('./env/' + process.env.UPC_ENVIRONMENT)
	);

module.exports = config;
