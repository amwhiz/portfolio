'use strict';

var config = require('../../../config/config');

exports.checkAuthentication = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else if (config.app.publicResources.indexOf(req.url) !== -1) {
        next();
    } else {
        res.status(401).jsonp({
            url: req.originalUrl,
            message: 'Unauthorized',
            status: 401
        });
    }
};
