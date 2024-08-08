'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var errors = [];

    errors = errors.concat(validator.check(statement, 'verb', [
        {rule: 'exist'},
        {rule: 'isObject'}
    ]));

    errors = errors.concat(validator.check(statement, 'verb.id', [
        {rule: 'exist'},
        {rule: 'isURL'}
    ]));

    if (exist(safeAccess(statement, 'verb.display'))) {
        errors = errors.concat(validator.check(statement, 'verb.display', [
            {rule: 'isObject'}
        ]));
    }

    return errors;
};
