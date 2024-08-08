'use strict';

var safeAccess = require('safe-access'),
    exist = require('../helpers/exist.helper.js'),
    validator = require('../../validator/validator'),
    objectTypes = require('../../object-types/object.types.js');

module.exports = function(statement) {
    var errors = [];

    errors = errors.concat(validator.check(statement, 'object', [
        {rule: 'exist'},
        {rule: 'isObject'}
    ]));

    if (exist(safeAccess(statement, 'object.objectType'))) {
        errors = errors.concat(validator.check(statement, 'object.objectType', [
            {rule: 'inArray', options: {values: objectTypes.TYPES}}
        ]));
    }

    errors = errors.concat(validator.check(statement, 'object.id', [
        {rule: 'exist'}
    ]));

    switch (safeAccess(statement, 'object.objectType')) {
        case 'StatementRef':
            errors = errors.concat(validator.check(statement, 'object.id', [
                {rule: 'isUUID'}
            ]));
            errors = errors.concat(validator.check(statement, 'object.definition', [
                {rule: 'notExist'}
            ]));
            break;
        case 'Agent':
            errors = errors.concat(validator.check(statement, 'object.name', [
                {rule: 'isString'}
            ]));
            errors = errors.concat(validator.check(statement, 'object.mbox', [
                {rule: 'isString'},
                {rule: 'startsWith', options: {substring: 'mailto:'}}
            ]));
            break;
        case 'SubStatement':
            errors = errors.concat(validator.check(statement, 'object.object.objectType', [
                {rule: 'isNot', options: {value: 'SubStatement'}}
            ]));
            break;
        default:
            errors = errors.concat(validator.check(statement, 'object.id', [
                {rule: 'isURL'}
            ]));
            errors = errors.concat(validator.check(statement, 'object.definition', [
                {rule: 'notExist'}
            ]));
    }

    if (exist(safeAccess(statement, 'object.definition'))) {
        errors = errors.concat(validator.check(statement, 'object.definition', [
            {rule: 'isObject'}
        ]));

        if (exist(safeAccess(statement, 'object.definition.name'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.name', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.description'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.description', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.type'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.type', [
                {rule: 'isURL'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.moreInfo'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.moreInfo', [
                {rule: 'isURL'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.moreInfo'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.moreInfo', [
                {rule: 'isURL'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.extensions'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.extensions', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.interactionType'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.interactionType', [
                {rule: 'isString'},
                {rule: 'inArray', options: {values: objectTypes.INTERACTION_TYPES}}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.correctResponsesPattern'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.correctResponsesPattern', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.choices'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.choices', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.scale'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.scale', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.source'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.source', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.target'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.target', [
                {rule: 'isArray'}
            ]));
        }

        if (exist(safeAccess(statement, 'object.definition.steps'))) {
            errors = errors.concat(validator.check(statement, 'object.definition.steps', [
                {rule: 'isArray'}
            ]));
        }
    }

    return errors;
};
