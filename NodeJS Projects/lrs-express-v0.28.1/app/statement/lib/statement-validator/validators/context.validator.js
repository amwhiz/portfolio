'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator');

module.exports = function(statement) {
    var errors = [];

    if (exist(safeAccess(statement, 'context'))) {
        errors = errors.concat(validator.check(statement, 'context', [
            {rule: 'isObject'}
        ]));

        if (exist(safeAccess(statement, 'context.registration'))) {
            errors = errors.concat(validator.check(statement, 'context.registration', [
                {rule: 'isUUID'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.instructor'))) {
            errors = errors.concat(validator.check(statement, 'context.instructor', [
                {rule: 'isObject'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.team'))) {
            errors = errors.concat(validator.check(statement, 'context.team', [
                {rule: 'isObject'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.revision'))) {
            errors = errors.concat(validator.check(statement, 'context.revision', [
                {rule: 'isString'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.platform'))) {
            errors = errors.concat(validator.check(statement, 'context.platform', [
                {rule: 'isString'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.language'))) {
            errors = errors.concat(validator.check(statement, 'context.language', [
                {rule: 'isString'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.statement'))) {
            errors = errors.concat(validator.check(statement, 'context.statement', [
                {rule: 'isUUID'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.extensions'))) {
            errors = errors.concat(validator.check(statement, 'context.extensions', [
                {rule: 'isObject'}
            ]));
        }

        if (exist(safeAccess(statement, 'context.contextActivities'))) {
            errors = errors.concat(validator.check(statement, 'context.contextActivities', [
                {rule: 'isObject'}
            ]));

            if (exist(safeAccess(statement, 'context.contextActivities.parent'))) {
                errors = errors.concat(validator.check(statement, 'context.contextActivities.parent', [
                    {rule: 'isArray'}
                ]));
            }

            if (exist(safeAccess(statement, 'context.contextActivities.grouping'))) {
                errors = errors.concat(validator.check(statement, 'context.contextActivities.grouping', [
                    {rule: 'isArray'}
                ]));
            }

            if (exist(safeAccess(statement, 'context.contextActivities.category'))) {
                errors = errors.concat(validator.check(statement, 'context.contextActivities.category', [
                    {rule: 'isArray'}
                ]));
            }

            if (exist(safeAccess(statement, 'context.contextActivities.other'))) {
                errors = errors.concat(validator.check(statement, 'context.contextActivities.other', [
                    {rule: 'isArray'}
                ]));
            }
        }
    }

    return errors;
};
