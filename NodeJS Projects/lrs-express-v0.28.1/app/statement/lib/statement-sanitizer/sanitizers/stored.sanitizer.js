'use strict';

var safeAccess = require('safe-access'),
    _ = require('lodash'),
    moment = require('moment');

module.exports = function(statement) {
    if (!_.isEmpty(safeAccess(statement, 'stored'))) {
        delete statement.stored;
    }
    statement.stored = moment().toISOString();
};
