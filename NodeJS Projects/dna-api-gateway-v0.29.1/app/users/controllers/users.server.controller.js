'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    passport = require('passport');

function stripAuthenticationUserData(user) {
    return {
        user: _.omit(user, 'accessToken', 'refreshToken', 'userId')
    };
}

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            res.status(400).send(err || info);
        } else {
            req.login(user, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.jsonp(stripAuthenticationUserData(user));
                }
            });
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * User data
 */
exports.user = function(req, res) {
    res.jsonp(stripAuthenticationUserData(req.user));
};
