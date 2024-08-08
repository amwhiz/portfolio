'use strict';

var safeAccess = require('safe-access'),
    _ = require('lodash'),
    wrapIntoArray;

wrapIntoArray = function(key, statement) {
    var type = safeAccess(statement, 'context.contextActivities.' + key);

    if (!_.isEmpty(type) && !_.isArray(type)) {
        statement.context.contextActivities[key] = [type];
    }
};

module.exports = function(statement) {
    var keys = ['parent', 'grouping', 'category', 'other'];

    if (!_.isEmpty(safeAccess(statement, 'context.contextActivities'))) {
        _.forEach(keys, function(key) {
            wrapIntoArray(key, statement);
        });
    }
};
