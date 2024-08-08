'use strict';

var safeAccess = require('safe-access'),
    _ = require('lodash'),
    objectTypes = require('../../object-types/object.types.js');

module.exports = function(statement) {
    if (!_.isEmpty(safeAccess(statement, 'object')) &&
        _.isEmpty(safeAccess(statement, 'object.objectType'))) {
        statement.object.objectType = objectTypes.ACTIVITY;
    }
};
