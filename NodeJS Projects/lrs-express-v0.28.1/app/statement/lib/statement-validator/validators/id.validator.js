'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var errors = [];

    if (exist(safeAccess(statement, 'id'))) {
        errors = errors.concat(validator.check(statement, 'id', [
            {rule: 'isUUID'}
        ]));
    }

    return errors;
};
