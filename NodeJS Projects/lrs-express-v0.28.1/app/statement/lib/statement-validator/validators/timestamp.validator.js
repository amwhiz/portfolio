'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var errors = [];

    if (exist(safeAccess(statement, 'timestamp'))) {
        errors = errors.concat(validator.check(statement, 'timestamp', [
            {rule: 'isISO8601'}
        ]));
    }

    return errors;
};
