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

    return errors;
};

exports.validateActivityGet = function(queryString) {
    var errors = [];

    errors = errors.concat(commonValidation(queryString));

    return !errors.length
};

exports.validatePost = function(queryString) {
    var errors = [];

    errors = errors.concat(commonValidation(queryString));

    errors = errors.concat(validator.check(queryString, 'profileId', [
        {rule: 'exist'},
        {rule: 'isString'}
    ]));

    return !errors.length
};

exports.validateGet = function(queryString) {
    var errors = [];

    errors = errors.concat(commonValidation(queryString));

    if (exist(safeAccess(queryString, 'since'))) {
        errors = errors.concat(validator.check(queryString, 'since', [
            {rule: 'isISO8601'}
        ]));
    }

    if (exist(safeAccess(queryString, 'profileId'))) {
        errors = errors.concat(validator.check(queryString, 'profileId', [
            {rule: 'isString'}
        ]));
    }

    return !errors.length
};
