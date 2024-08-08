'use strict';

/*
* Application Setup
*/

// NPM modules
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	compression = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	consolidate = require('consolidate'),
	path = require('path');

// configuration
var config = require('./config');

module.exports = function(db) {
	// Initialize app
	var app = express();
	var router = express.Router();

	// application local variables
	app.locals.title = config.app.title;
	app.locals.url = config.app.url;
	app.locals.urlPrefix = config.urlPrefix;

	// database connection
	app.db = db;

	// Should be placed before express.static
	app.use(compression({
		// only compress files for the following content types
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		// zlib option for compression level
		level: 3
	}));


	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('view.html', consolidate[config.templateEngine]);
	app.set('view engine', 'view.html');
	app.set('views', './app/views');


	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(config.urlPrefix + '/assets',express.static(path.resolve('./app/assets')));

	// CookieParser should be above session
	app.use(cookieParser());

	// loading routes
	require(path.resolve('./app/module/app.routes'))(router);
	app.use(config.urlPrefix, router);

	// exports application
	return app;
};
