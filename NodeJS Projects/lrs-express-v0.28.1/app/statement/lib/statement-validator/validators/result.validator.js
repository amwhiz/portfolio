'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var errors = [],
        options;

    if (exist(safeAccess(statement, 'result'))) {
        errors = errors.concat(validator.check(statement, 'result', [
            {rule: 'isObject'}
        ]));

        if (exist(safeAccess(statement, 'result.success'))) {
            errors = errors.concat(validator.check(statement, 'result.success', [
                {rule: 'isBoolean'}
            ]));
        }

        if (exist(safeAccess(statement, 'result.completion'))) {
            errors = errors.concat(validator.check(statement, 'result.completion', [
                {rule: 'isBoolean'}
            ]));
        }

        if (exist(safeAccess(statement, 'result.response'))) {
            errors = errors.concat(validator.check(statement, 'result.response', [
                {rule: 'isString'}
            ]));
        }

        if (exist(safeAccess(statement, 'result.duration'))) {
            errors = errors.concat(validator.check(statement, 'result.duration', [
                {rule: 'isISO8601'}
            ]));
        }

        if (exist(safeAccess(statement, 'result.extensions'))) {
            errors = errors.concat(validator.check(statement, 'result.extensions', [
                {rule: 'isObject'}
            ]));
        }

        if (exist(safeAccess(statement, 'result.score'))) {
            errors = errors.concat(validator.check(statement, 'result.score', [
                {rule: 'isObject'}
            ]));

            if (exist(safeAccess(statement, 'result.score.scaled'))) {
                options = {
                    min: -1,
                    max: 1
                };

                errors = errors.concat(validator.check(statement, 'result.score.scaled', [
                    {rule: 'isNumber'},
                    {rule: 'isBetween', options: options}
                ]));
            }

            if (exist(safeAccess(statement, 'result.score.min'))) {
                errors = errors.concat(validator.check(statement, 'result.score.min', [
                    {rule: 'isNumber'},
                    {rule: 'isSmaller', max: safeAccess(statement, 'result.score.max')}
                ]));
            }

            if (exist(safeAccess(statement, 'result.score.max'))) {
                errors = errors.concat(validator.check(statement, 'result.score.max', [
                    {rule: 'isNumber'},
                    {rule: 'isBigger', min: safeAccess(statement, 'result.score.min')}
                ]));
            }

            if (exist(safeAccess(statement, 'result.score.raw'))) {
                options = {
                    min: safeAccess(statement, 'result.score.min'),
                    max: safeAccess(statement, 'result.score.max')
                };

                errors = errors.concat(validator.check(statement, 'result.score.raw', [
                    {rule: 'isNumber'},
                    {rule: 'isBetween', options: options}
                ]));
            }
        }
    }

    return errors;
};
