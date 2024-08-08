'use strict';

var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    flash = require('connect-flash'),
    config = require('./config'),
    path = require('path'),
    expressValidator = require('express-validator'),
    security = require('../app/users/lib/security.server.middleware.lib'),
    store = require('./store'),
    refreshToken = require('../app/users/lib/refresh.token.server.middleware.lib'),
    acl = require('../app/users/lib/acl.server.middleware.lib');

module.exports = function(db) {
    // Initialize express app
    var app = express();

    store.setDb(db);
    // Globbing model files
    config.getGlobbedFiles('./app/*/models/**/*.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });

    // Passing the request url to environment locals
    app.use(function(req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });

    // Should be placed before express.static
    app.use(compress({
        filter: function(req, res) {
            return (/json|text/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Showing stack errors
    app.set('showStackError', true);

    // CORS
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use(morgan('dev'));
    app.locals.cache = 'memory';

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(expressValidator());
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Enable jsonp
    app.enable('jsonp callback');

    // CookieParser should be above session
    app.use(cookieParser());

    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        store: store.getStore()
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    // Check if user is logged in before do actions
    app.use(function(req, res, next) {
        security.checkAuthentication(req, res, next, app._router);
    });

    // add roles methods to request
    app.use(acl.aclMiddleware);

    // Globbing routing files
    config.getGlobbedFiles('./app/*/routes/**/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
    });

    app.use(function(err, req, res, next) {
        if (err && err.code === 401) {
            refreshToken(err, req, res, next);
        } else {
            next(err);
        }
    });

    app.use(function(err, req, res, next) {
        if (!err) {
            return next();
        }

        res.status(err.code || 500)
            .json(err);
    });

    app.use(function(req, res) {
        res.status(404)
            .json({
                url: req.originalUrl,
                code: 404,
                message: 'Not Found'
            });
    });

    return app;
};
