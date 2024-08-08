'use strict';

var safeAccess = require('safe-access'),
    _ = require('lodash');

module.exports = function(statement) {
    if (_.isEmpty(safeAccess(statement, 'timestamp'))) {
        statement.timestamp = statement.stored;
    }
};
