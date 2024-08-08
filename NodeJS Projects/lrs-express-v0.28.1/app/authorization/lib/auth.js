'use strict';
var _ = require('lodash');

exports.basicAuth = function(req, res, next) {
    if (!_.isEmpty(req.lrs)) {
        next();
    } else {
        res.sendUnauthorize();
    }
};
