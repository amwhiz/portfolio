'use strict';

var safeAccess = require('safe-access'),
    exist = require('../../../statement/lib/statement-validator/helpers/exist.helper.js'),
    validator = require('../../../statement/lib/validator/validator'),
    commonValidation;

commonValidation = function(queryString) {
    var errors = [];

    errors = errors.concat(validator.check(queryString, 'activityId', [
        {rule: 'exist'},
        {rule: 'isString'}
    ]));

    errors = errors.concat(validator.check(queryString, 'agent', [
        {rule: 'exist'},
        {rule: 'isJSON'}
    ]));

    if (exist(safeAccess(queryString, 'registration'))) {
        errors = errors.concat(validator.check(queryString, 'registration', [
            {rule: 'isUUID'}
        ]));
    }

    return errors;
};

exports.validateGet = function(queryString) {
    var errors = [];

    errors = errors.concat(commonValidation(queryString));

    if (exist(safeAccess(queryString, 'since'))) {
        errors = errors.concat(validator.check(queryString, 'since', [
            {rule: 'isISO8601'}
        ]));
    }

    if (exist(safeAccess(queryString, 'stateId'))) {
        errors = errors.concat(validator.check(queryString, 'stateId', [
            {rule: 'isString'}
        ]));
    }

    return !errors.length
};

exports.validatePost = function(queryString) {
    var errors = [];

    errors = errors
        .concat(commonValidation(queryString))
        .concat(validator.check(queryString, 'stateId', [
            {rule: 'exist'},
            {rule: 'isString'}
        ]));

    return !errors.length
};
