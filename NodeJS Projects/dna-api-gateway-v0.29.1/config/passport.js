'use strict';

var passport = require('passport'),
    path = require('path'),
    config = require('./config');

module.exports = function() {

    // Serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // Deserialize sessions
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // Initialize strategies
    config.getGlobbedFiles('./app/users/strategies/*.js').forEach(function(strategy) {
        require(path.resolve(strategy))();
    });
};
