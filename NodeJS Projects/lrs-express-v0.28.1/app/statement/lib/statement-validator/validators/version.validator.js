'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var value = '1.0.',
        errors = [];

    if (exist(safeAccess(statement, 'version'))) {
        errors = errors.concat(validator.check(statement, 'version', [
            {rule: 'startsWith', options: {substring: value}}
        ]));
    }

    return errors;
};
