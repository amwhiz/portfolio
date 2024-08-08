'use strict';

var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    httpDecorator = require('../app/http-decorator/middlewares/http.middleware'),
    config = require('./config'),
    path = require('path'),
    auth = require('../app/authorization/lib/auth.js');

module.exports = function() {
    // Initialize express app
    var app = express(),
        lrsUtils;

    // Globbing model files
    config.getGlobbedFiles('./app/*/models/**/*.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });

    // utils must be required after model is created
    lrsUtils = require('../app/lrs/utils/lrs.utils');
    app.use(lrsUtils.assignLrsToRequest);

    //add custom response methods
    app.use(httpDecorator);

    // Custom basic auth
    app.use(function(req, res, next) {
        auth.basicAuth(req, res, next);
    });

    // Passing the request url to environment locals
    app.use(function(req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });

    // Should be placed before express.static
    app.use(compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Showing stack errors
    app.set('showStackError', true);

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Enable logger (morgan)
        app.use(morgan('dev'));

    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Enable jsonp
    app.enable('jsonp callback');

    // CookieParser should be above session
    app.use(cookieParser());

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    app._router.caseSensitive = true;

    // Globbing routing files
    config.getGlobbedFiles('./app/*/routes/**/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app, config.apiPrefix);
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
        // If the error object doesn't exists
        if (!err) {
            return next();
        }

        // Log it
        console.error(err.stack);

        res.status(500).json({
            message: 'Server Error',
            error: err.stack,
            status: 500
        });
    });

    // Assume 404 since no middleware responded
    app.use(function(req, res) {
        console.log('404: Not Found - ' + req.originalUrl);
        res.status(404).json({
            url: req.originalUrl,
            message: 'Not Found',
            status: 404
        });
    });

    return app;
};
