'use strict';

var safeAccess = require('safe-access'),
    _ = require('lodash'),
    uuid = require('node-uuid');

module.exports = function(statement) {
    if (_.isEmpty(safeAccess(statement, 'id'))) {
        statement.id = uuid.v4();
    }
};
