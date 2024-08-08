'use strict';

var _ = require('lodash'),
    safeAccess = require('safe-access'),
    config = require('../../../config/config');

exports.aclMiddleware = function(req, res, next) {
    var userAccessor = safeAccess(req.user),
        hasRole;

    hasRole = function(request, roles) {
        var foundRoles = _.intersection(userAccessor('roles'), roles);

        return !_.isEmpty(foundRoles);
    };

    req.canEdit = function() {
        return hasRole(userAccessor, config.roles.editRoles);
    };

    req.canView = function() {
        return hasRole(userAccessor, config.roles.viewRoles);
    };

    res.sendForbidden = function(res) {
        res.status(403).jsonp({
            message: 'Forbidden',
            status: 403
        });
    };

    next();
};
