'use strict';

var safeAccess = require('safe-access'),
    _ = require('lodash'),
    versions = require('../../versions/versions.js');

module.exports = function(statement) {
    if (_.isEmpty(safeAccess(statement, 'version'))) {
        statement.version = versions.VERSION;
    }
};
