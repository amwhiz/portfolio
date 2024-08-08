'use strict';

var userApiClient = require('../../dnaApiClient').dnaUsersApiClient,
    access = require('safe-access');

function handleError(err, req, res) {
    req.logout();
    res.status(401)
        .json(err);
}

module.exports = function(err, req, res, next) {
    if (err.repeater && err.repeater.constructor === Function) {
        userApiClient
            .refreshToken(req.user)
            .then(function(tokenData) {
                //jscs:disable
                req.user.accessToken = access(tokenData, 'access_token');
                req.user.refreshToken = access(tokenData, 'refresh_token');
                //jscs:enable
                req.login(req.user, function(loginErr) {
                    if (loginErr) {
                        return next(loginErr);
                    }

                    err.repeater(req, res)
                        .error(function(apiError) {
                            return next(apiError);
                        })
                        .catch(function(apiError) {
                            return next(apiError);
                        });
                });
            })
            .error(function() {
                handleError(err, req, res);
            })
            .catch(function() {
                handleError(err, req, res);
            });
    } else {
        return next(err);
    }
};
