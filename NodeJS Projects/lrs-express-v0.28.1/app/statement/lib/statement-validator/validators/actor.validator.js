'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var errors = [];

    errors = errors.concat(validator.check(statement, 'actor', [
        {rule: 'exist'},
        {rule: 'isObject'}
    ]));

    errors = errors.concat(validator.check(statement, 'actor.objectType', [
        {rule: 'exist'},
        {rule: 'isString'},
        {rule: 'value', options: { value: 'Agent'}}
    ]));

    if (exist(safeAccess(statement, 'actor.name'))) {
        errors = errors.concat(validator.check(statement, 'actor.name', [
            {rule: 'isString'}
        ]));
    }

    errors = errors.concat(validator.check(statement, 'actor.account', [
        {rule: 'exist'},
        {rule: 'isObject'}
    ]));

    errors = errors.concat(validator.check(statement, 'actor.account.homePage', [
        {rule: 'exist'},
        {rule: 'isURL'}
    ]));

    errors = errors.concat(validator.check(statement, 'actor.account.name', [
        {rule: 'exist'},
        {rule: 'isString'}
    ]));

    return errors;
};
